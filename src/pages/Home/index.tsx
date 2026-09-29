import { useRef, useEffect, useState, type MutableRefObject } from 'react';
import { message, Spin, Empty } from 'antd';
import CommonTitle from '../../components/CommonTitle';
import styles from './home.module.scss';
import * as echarts from 'echarts';
import { getClockRecordList, getLeaveRequestList, getOvertimeRequestList } from '../../api/attendance';
import { getDepartmentList } from '../../api/department';
import { getUserInfoList } from '../../api/userInfo';
import type { ClockRecordResponse } from '../../api/attendance';
import type { UserInfoResponse } from '../../api/userInfo';
import type { DepartmentResponse } from '../../api/department';
import type { LeaveRequestResponse } from '../../api/attendance';
import dayjs from 'dayjs';

type EChartsOption = echarts.EChartsOption;

const WEEK_LABELS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

const HomePage = () => {
  const [loading, setLoading] = useState(false);
  const [hasData, setHasData] = useState(false);
  const lineChartRef = useRef<HTMLDivElement>(null);
  const pieChartRef = useRef<HTMLDivElement>(null);
  const barChartRef = useRef<HTMLDivElement>(null);
  const lineChartInstanceRef = useRef<echarts.ECharts | null>(null);
  const pieChartInstanceRef = useRef<echarts.ECharts | null>(null);
  const barChartInstanceRef = useRef<echarts.ECharts | null>(null);

  const renderCharts = (
    employees: UserInfoResponse[],
    clocks: ClockRecordResponse[],
    leaves: LeaveRequestResponse[],
    departments: DepartmentResponse[],
    overtimeTotal: number
  ) => {
    // 部门人数分布（按员工 dept_code / department_name 聚合）
    if (barChartRef.current) {
      const barChart = echarts.init(barChartRef.current);
      barChartInstanceRef.current = barChart;

      const deptCountMap = new Map<string, number>();
      departments.forEach((d) => deptCountMap.set(d.dept_code || d.dept_name, 0));
      employees.forEach((emp) => {
        const key =
          emp.dept_code ||
          emp.department_name ||
          emp.department ||
          '未分配';
        deptCountMap.set(key, (deptCountMap.get(key) || 0) + 1);
      });

      const deptNameByCode = new Map(departments.map((d) => [d.dept_code, d.dept_name]));
      const labels = Array.from(deptCountMap.keys()).map(
        (code) => deptNameByCode.get(code) || code
      );
      const counts = Array.from(deptCountMap.values());

      const barOption: EChartsOption = {
        title: { text: '部门员工分布', left: 'center' },
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: {
          type: 'category',
          data: labels.length ? labels : ['暂无数据'],
          axisLabel: { interval: 0, rotate: labels.length > 5 ? 30 : 0 },
        },
        yAxis: { type: 'value', minInterval: 1 },
        series: [
          {
            data: counts.length ? counts : [0],
            type: 'bar',
            itemStyle: { borderRadius: [4, 4, 0, 0], color: '#1677ff' },
            barWidth: '50%',
          },
        ],
      };
      barChart.setOption(barOption);
    }

    // 近 7 天打卡统计（按 date 聚合）
    if (lineChartRef.current) {
      const lineChart = echarts.init(lineChartRef.current);
      lineChartInstanceRef.current = lineChart;

      const dayKeys: string[] = [];
      const dayLabels: string[] = [];
      for (let i = 6; i >= 0; i -= 1) {
        const d = dayjs().subtract(i, 'day');
        dayKeys.push(d.format('YYYY-MM-DD'));
        dayLabels.push(`${d.format('MM-DD')}(${WEEK_LABELS[d.day()]})`);
      }

      const clockInCounts = dayKeys.map(() => 0);
      const clockOutCounts = dayKeys.map(() => 0);

      clocks.forEach((record) => {
        const dateKey = dayjs(record.date).format('YYYY-MM-DD');
        const idx = dayKeys.indexOf(dateKey);
        if (idx === -1) return;
        if (record.clock_in_time) clockInCounts[idx] += 1;
        if (record.clock_out_time) clockOutCounts[idx] += 1;
      });

      const lineOption: EChartsOption = {
        title: { text: '近7日打卡统计', left: 'center' },
        tooltip: { trigger: 'axis' },
        legend: { data: ['上班打卡', '下班打卡'], bottom: 0 },
        grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
        xAxis: { type: 'category', data: dayLabels },
        yAxis: { type: 'value', minInterval: 1 },
        series: [
          { name: '上班打卡', data: clockInCounts, type: 'line', smooth: true },
          { name: '下班打卡', data: clockOutCounts, type: 'line', smooth: true },
        ],
      };
      lineChart.setOption(lineOption);
    }

    // 请假状态 + 加班总量
    if (pieChartRef.current) {
      const pieChart = echarts.init(pieChartRef.current);
      pieChartInstanceRef.current = pieChart;

      const leaveStatusCount = { pending: 0, approved: 0, rejected: 0 };
      leaves.forEach((item) => {
        if (item.status === 0) leaveStatusCount.pending += 1;
        else if (item.status === 1) leaveStatusCount.approved += 1;
        else if (item.status === 2) leaveStatusCount.rejected += 1;
      });

      const pieOption: EChartsOption = {
        title: { text: '请假与加班概览', left: 'center' },
        tooltip: { trigger: 'item' },
        legend: { orient: 'horizontal', bottom: 10 },
        series: [
          {
            name: '统计',
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
            label: { show: false, position: 'center' },
            emphasis: { label: { show: true, fontSize: 16, fontWeight: 'bold' } },
            labelLine: { show: false },
            data: [
              { value: leaveStatusCount.pending, name: '请假待审批' },
              { value: leaveStatusCount.approved, name: '请假已通过' },
              { value: leaveStatusCount.rejected, name: '请假已拒绝' },
              { value: overtimeTotal, name: '加班申请' },
            ],
          },
        ],
      };
      pieChart.setOption(pieOption);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // 后端 pageSize 上限 100，超限返回 422
      const [empRes, clockRes, leaveRes, deptRes, overtimeRes] = await Promise.all([
        getUserInfoList({ pageSize: 100 }),
        getClockRecordList({ pageSize: 100 }),
        getLeaveRequestList({ pageSize: 100 }),
        getDepartmentList({ pageSize: 100 }),
        getOvertimeRequestList({ pageSize: 1 }),
      ]);

      const employees = empRes.list || [];
      const clocks = clockRes.list || [];
      const leaves = leaveRes.list || [];
      const departments = deptRes.list || [];

      setHasData(employees.length + clocks.length + leaves.length + departments.length > 0);
      renderCharts(employees, clocks, leaves, departments, overtimeRes.total || 0);
    } catch (error) {
      message.error(error instanceof Error ? error.message : '获取数据失败');
      setHasData(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const observers: ResizeObserver[] = [];
    const bindResize = (
      el: HTMLDivElement | null,
      instanceRef: MutableRefObject<echarts.ECharts | null>
    ) => {
      if (!el) return;
      const observer = new ResizeObserver(() => instanceRef.current?.resize());
      observer.observe(el);
      observers.push(observer);
    };

    bindResize(lineChartRef.current, lineChartInstanceRef);
    bindResize(pieChartRef.current, pieChartInstanceRef);
    bindResize(barChartRef.current, barChartInstanceRef);

    return () => {
      observers.forEach((o) => o.disconnect());
      lineChartInstanceRef.current?.dispose();
      pieChartInstanceRef.current?.dispose();
      barChartInstanceRef.current?.dispose();
    };
  }, []);

  return (
    <div className={styles.home}>
      <CommonTitle title="数据统计" />
      <Spin spinning={loading}>
        {!loading && !hasData ? (
          <div className={styles.emptyWrap}>
            <Empty description="暂无统计数据" />
          </div>
        ) : (
          <div className={styles.chartContainer}>
            <div ref={barChartRef} className={styles.chartItem} />
            <div ref={lineChartRef} className={styles.chartItem} />
            <div ref={pieChartRef} className={styles.chartItem} />
          </div>
        )}
      </Spin>
    </div>
  );
};

export default HomePage;
