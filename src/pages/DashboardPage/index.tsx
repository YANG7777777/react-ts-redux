import { useRef, useEffect } from 'react';
import CommonTitle from '../../components/CommonTitle'
import styles from './dashboard.module.scss'
import * as echarts from 'echarts';
type EChartsOption = echarts.EChartsOption;

const DashboardPage = () => {
    const lineChartRef = useRef<HTMLDivElement>(null);
    const pieChartRef = useRef<HTMLDivElement>(null);
    const barChartRef = useRef<HTMLDivElement>(null);
    const lineChartInstanceRef = useRef<echarts.ECharts | null>(null);
    const pieChartInstanceRef = useRef<echarts.ECharts | null>(null);
    const barChartInstanceRef = useRef<echarts.ECharts | null>(null);
    
    useEffect(() => {
        let observer1: ResizeObserver | null = null;
        let observer2: ResizeObserver | null = null;
        let observer3: ResizeObserver | null = null;
        
        // 初始化折线图
        if (lineChartRef.current) {
            const lineChart = echarts.init(lineChartRef.current);
            lineChartInstanceRef.current = lineChart;
            
            const lineOption: EChartsOption = {
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                },
                yAxis: {
                    type: 'value',
                },
                series: [{
                    data: [820, 932, 901, 934, 1290, 1330, 1320],
                    type: 'line',
                }],
            };
            lineChart.setOption(lineOption);
            
            // 创建 ResizeObserver 监听容器尺寸变化
            observer1 = new ResizeObserver(() => {
                if (lineChartInstanceRef.current) {
                    lineChartInstanceRef.current.resize();
                }
            });
            observer1.observe(lineChartRef.current);
        }
        
        // 初始化饼状图
        if (pieChartRef.current) {
            const pieChart = echarts.init(pieChartRef.current);
            pieChartInstanceRef.current = pieChart;
            
            const pieOption: EChartsOption = {
                tooltip: {
                    trigger: 'item'
                },
                legend: {
                    orient: 'horizontal',
                    bottom: 10
                },
                series: [
                    {
                        name: '访问来源',
                        type: 'pie',
                        radius: ['40%', '70%'],
                        avoidLabelOverlap: false,
                        itemStyle: {
                            borderRadius: 10,
                            borderColor: '#fff',
                            borderWidth: 2
                        },
                        label: {
                            show: false,
                            position: 'center'
                        },
                        emphasis: {
                            label: {
                                show: true,
                                fontSize: '18',
                                fontWeight: 'bold'
                            }
                        },
                        labelLine: {
                            show: false
                        },
                        data: [
                            { value: 1048, name: '搜索引擎' },
                            { value: 735, name: '直接访问' },
                            { value: 580, name: '邮件营销' },
                            { value: 484, name: '社交网络' },
                            { value: 300, name: '其他' }
                        ]
                    }
                ]
            };
            pieChart.setOption(pieOption);
            
            // 创建 ResizeObserver 监听容器尺寸变化
            observer2 = new ResizeObserver(() => {
                if (pieChartInstanceRef.current) {
                    pieChartInstanceRef.current.resize();
                }
            });
            observer2.observe(pieChartRef.current);
        }
        
        // 初始化柱状图
        if (barChartRef.current) {
            const barChart = echarts.init(barChartRef.current);
            barChartInstanceRef.current = barChart;
            
            const barOption: EChartsOption = {
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    data: ['产品A', '产品B', '产品C', '产品D', '产品E'],
                },
                yAxis: {
                    type: 'value',
                },
                series: [{
                    data: [120, 200, 150, 80, 70],
                    type: 'bar',
                    itemStyle: {
                        borderRadius: [4, 4, 0, 0]
                    }
                }],
            };
            barChart.setOption(barOption);
            
            // 创建 ResizeObserver 监听容器尺寸变化
            observer3 = new ResizeObserver(() => {
                if (barChartInstanceRef.current) {
                    barChartInstanceRef.current.resize();
                }
            });
            observer3.observe(barChartRef.current);
        }
        
        return () => {
            /***
             * 当容器尺寸变化时，调用 echarts 实例的 resize 方法，使图表自适应容器尺寸
             * disconnect() 方法 所属对象 ： ResizeObserver 实例。
             * 停止 ResizeObserver 实例观察所有目标元素的尺寸变化
             * 使用场景 ：在组件卸载时调用，清理 ECharts 相关资源
             * 
             * */ 
            if (observer1) {
                observer1.disconnect();
            }
            if (observer2) {
                observer2.disconnect();
            }
            if (observer3) {
                observer3.disconnect();
            }

            /***
             * 调用 echarts 实例的 dispose 方法，释放图表占用的资源
             * dispose() 方法 所属对象 ： echarts 实例。
             * 释放图表占用的资源，包括 DOM 元素、事件监听、定时器等
             * 使用场景 ：在组件卸载时调用，清理 ECharts 相关资源
             * 
             * */ 

            if (lineChartInstanceRef.current) {
                lineChartInstanceRef.current.dispose();
            }
            if (pieChartInstanceRef.current) {
                pieChartInstanceRef.current.dispose();
            }
            if (barChartInstanceRef.current) {
                barChartInstanceRef.current.dispose();
            }
        };
    }, []);

    return (
        <div className={styles.dashboard}>
            <CommonTitle title="DashboardPage">
            </CommonTitle>
            <div className={styles.chartContainer}>
                <div ref={lineChartRef} className={styles.chartItem} />
                <div ref={pieChartRef} className={styles.chartItem} />
                <div ref={barChartRef} className={styles.chartItem} />
            </div>
        </div>
    );
};

export default DashboardPage;
