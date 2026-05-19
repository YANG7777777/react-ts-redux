import { useRef, useEffect, useState } from 'react';
import { message } from 'antd';
import CommonTitle from '../../components/CommonTitle';
import styles from './home.module.scss';
import * as echarts from 'echarts';
import { getUserList } from '../../api/user';
import { getClockRecordList, getLeaveRequestList } from '../../api/attendance';
import { getDepartmentList } from '../../api/department';

type EChartsOption = echarts.EChartsOption;

const HomePage = () => {
    const [, setLoading] = useState(false);
    const lineChartRef = useRef<HTMLDivElement>(null);
    const pieChartRef = useRef<HTMLDivElement>(null);
    const barChartRef = useRef<HTMLDivElement>(null);
    const lineChartInstanceRef = useRef<echarts.ECharts | null>(null);
    const pieChartInstanceRef = useRef<echarts.ECharts | null>(null);
    const barChartInstanceRef = useRef<echarts.ECharts | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [userRes, clockRes, leaveRes, deptRes] = await Promise.all([
                getUserList({ pageSize: 1000 }),
                getClockRecordList({ pageSize: 1000 }),
                getLeaveRequestList({ pageSize: 1000 }),
                getDepartmentList({ pageSize: 1000 })
            ]);

            renderCharts(userRes, clockRes, leaveRes, deptRes);
        } catch (error) {
            console.error('获取数据失败:', error);
            message.error('获取数据失败');
        } finally {
            setLoading(false);
        }
    };

    const renderCharts = (userRes: any, clockRes: any, leaveRes: any, deptRes: any) => {
        // 用户统计柱状图
        if (barChartRef.current) {
            const barChart = echarts.init(barChartRef.current);
            barChartInstanceRef.current = barChart;

            const deptNames = deptRes.list?.map((d: any) => d.dept_name) || ['暂无数据'];
            const userCounts = deptNames.map(() => Math.floor(Math.random() * 20) + 5); // 模拟数据

            const barOption: EChartsOption = {
                title: { text: '部门用户分布', left: 'center' },
                tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
                grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
                xAxis: { type: 'category', data: deptNames },
                yAxis: { type: 'value' },
                series: [{
                    data: userCounts,
                    type: 'bar',
                    itemStyle: { borderRadius: [4, 4, 0, 0] },
                    barWidth: '60%'
                }]
            };
            barChart.setOption(barOption);
        }

        // 考勤统计折线图
        if (lineChartRef.current) {
            const lineChart = echarts.init(lineChartRef.current);
            lineChartInstanceRef.current = lineChart;

            const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
            const clockInCounts = days.map(() => Math.floor(Math.random() * 30) + 10);
            const clockOutCounts = days.map(() => Math.floor(Math.random() * 30) + 10);

            const lineOption: EChartsOption = {
                title: { text: '周考勤统计', left: 'center' },
                tooltip: { trigger: 'axis' },
                legend: { data: ['签到', '签退'], bottom: 0 },
                grid: { left: '3%', right: '4%', bottom: '15%', containLabel: true },
                xAxis: { type: 'category', data: days },
                yAxis: { type: 'value' },
                series: [
                    { name: '签到', data: clockInCounts, type: 'line', smooth: true },
                    { name: '签退', data: clockOutCounts, type: 'line', smooth: true }
                ]
            };
            lineChart.setOption(lineOption);
        }

        // 请假/加班统计饼图
        if (pieChartRef.current) {
            const pieChart = echarts.init(pieChartRef.current);
            pieChartInstanceRef.current = pieChart;

            const pieOption: EChartsOption = {
                title: { text: '请假与加班', left: 'center' },
                tooltip: { trigger: 'item' },
                legend: { orient: 'horizontal', bottom: 10 },
                series: [{
                    name: '统计',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    avoidLabelOverlap: false,
                    itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
                    label: { show: false, position: 'center' },
                    emphasis: { label: { show: true, fontSize: 18, fontWeight: 'bold' } },
                    labelLine: { show: false },
                    data: [
                        { value: leaveRes.total || 15, name: '请假申请' },
                        { value: clockRes.total || 50, name: '考勤记录' },
                        { value: userRes.total || 20, name: '用户总数' }
                    ]
                }]
            };
            pieChart.setOption(pieOption);
        }
    };

    useEffect(() => {
        fetchData();

        let observer1: ResizeObserver | null = null;
        let observer2: ResizeObserver | null = null;
        let observer3: ResizeObserver | null = null;

        if (lineChartRef.current) {
            observer1 = new ResizeObserver(() => {
                if (lineChartInstanceRef.current) {
                    lineChartInstanceRef.current.resize();
                }
            });
            observer1.observe(lineChartRef.current);
        }

        if (pieChartRef.current) {
            observer2 = new ResizeObserver(() => {
                if (pieChartInstanceRef.current) {
                    pieChartInstanceRef.current.resize();
                }
            });
            observer2.observe(pieChartRef.current);
        }

        if (barChartRef.current) {
            observer3 = new ResizeObserver(() => {
                if (barChartInstanceRef.current) {
                    barChartInstanceRef.current.resize();
                }
            });
            observer3.observe(barChartRef.current);
        }

        return () => {
            if (observer1) observer1.disconnect();
            if (observer2) observer2.disconnect();
            if (observer3) observer3.disconnect();

            if (lineChartInstanceRef.current) lineChartInstanceRef.current.dispose();
            if (pieChartInstanceRef.current) pieChartInstanceRef.current.dispose();
            if (barChartInstanceRef.current) barChartInstanceRef.current.dispose();
        };
    }, []);

    return (
        <div className={styles.home}>
            <CommonTitle title="数据统计" />
            <div className={styles.chartContainer}>
                <div ref={lineChartRef} className={styles.chartItem} />
                <div ref={pieChartRef} className={styles.chartItem} />
                <div ref={barChartRef} className={styles.chartItem} />
            </div>
        </div>
    );
};

export default HomePage;
