import Login from '../pages/Login'
import AuthGuard from '../components/AuthGuard'
import {Outlet, Navigate} from "react-router-dom";
import Layout from '../Layout/index'
import { HomeOutlined, TeamOutlined, UserOutlined, SettingOutlined, ClockCircleOutlined, FileTextOutlined, PlusCircleOutlined } from '@ant-design/icons';

import Home from '@/pages/Home/index'
import DashboardPage from '@/pages/DashboardPage'
import UsersPage from '@/pages/Users/index'
import RolePage from '@/pages/ROLE/index'
import DepartmentPage from '@/pages/Departments/index'
import UserInfo from '@/pages/UserInfo/index'
import ClockRecordPage from '@/pages/Attendance/ClockRecord/index'
import LeaveRequestPage from '@/pages/Attendance/LeaveRequest/index'
import OvertimeRequestPage from '@/pages/Attendance/OvertimeRequest/index'

//本地的路由配置,如果需要从后端获取路由配置,可以跟这个路由表比对过滤后，再传props给APP中的Router
export const BaseRoutes = [
    {
        path: "/home",
        element: <Home />,
        name: "home",
        meta: {
            hidden: false,
            title: "首页",
            icon: <HomeOutlined />,
        },
    },
    // 系统管理（仅作为分组，无 element）
    {
        path: "/system",
        name: "system",
        meta: {
            hidden: false,
            title: "系统管理",
            icon: <SettingOutlined />,
        },
        children: [
            {
                path: "/system/role",
                element: <RolePage />,
                name: "role",
                meta: {
                    hidden: false,
                    title: "角色管理",
                    icon: <SettingOutlined />,
                },
            },
            {
                path: "/system/departments",
                element: <DepartmentPage />,
                name: "departments",
                meta: {
                    hidden: false,
                    title: "部门管理",
                    icon: <TeamOutlined />,
                },
            },
        ],
    },
    {
        path: "/usersInfo",
        name: "usersInfo",
        meta: {
            hidden: false,
            title: "信息管理",
            icon: <TeamOutlined />,
        },
        children: [
            {
                path: "/usersInfo/users",
                element: <UsersPage />,
                name: "usersInfoUsers",
                meta: {
                    hidden: false,
                    title: "账号管理",
                    icon: <UserOutlined />,
                },
            },
            {
                path: "/usersInfo/employee",
                element: <UserInfo />,
                name: "employee",
                meta: {
                    hidden: false,
                    title: "员工信息",
                    icon: <TeamOutlined />,
                },
            },
        ],
    },
    {
        path: "/attendance",
        name: "attendance",
        meta: {
            hidden: false,
            title: "考勤管理",
            icon: <ClockCircleOutlined />,
        },
        children: [
            {
                path: "/attendance/clock-record",
                element: <ClockRecordPage />,
                name: "clockRecord",
                meta: {
                    hidden: false,
                    title: "打卡记录",
                    icon: <ClockCircleOutlined />,
                },
            },
            {
                path: "/attendance/leave-request",
                element: <LeaveRequestPage />,
                name: "leaveRequest",
                meta: {
                    hidden: false,
                    title: "请假申请",
                    icon: <FileTextOutlined />,
                },
            },
            {
                path: "/attendance/overtime-request",
                element: <OvertimeRequestPage />,
                name: "overtimeRequest",
                meta: {
                    hidden: false,
                    title: "加班申请",
                    icon: <PlusCircleOutlined />,
                },
            },
        ],
    },
    // {
    //     path: "/dashboard",
    //     element: <DashboardPage />,
    //     name: "dashboard",
    //     meta: {
    //         hidden: false,
    //         title: "看板",
    //         icon: <BarChartOutlined />,
    //     },
    // },
]

export const routes = [
    {
        path: '/login',
        element: <Login />
    },
    {
        path: '/',
        element: <AuthGuard><Outlet /></AuthGuard>,
        children: [
            {
                path: '/',
                name: 'layout',
                element: <Layout />,
                children: [
                    {
                        index: true,
                        element: <Navigate to="/home" replace />
                    },
                    ...BaseRoutes
                ]
            }
        ],
    }
]