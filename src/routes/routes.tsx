import { lazy } from 'react';
import AuthGuard from '../components/AuthGuard';
import { Outlet, Navigate } from 'react-router-dom';
import Layout from '../Layout/index';
import {
  HomeOutlined,
  TeamOutlined,
  UserOutlined,
  SettingOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  PlusCircleOutlined,
  RobotOutlined,
} from '@ant-design/icons';

const Login = lazy(() => import('../pages/Login'));
const Home = lazy(() => import('@/pages/Home/index'));
const UsersPage = lazy(() => import('@/pages/Users/index'));
const RolePage = lazy(() => import('@/pages/ROLE/index'));
const DepartmentPage = lazy(() => import('@/pages/Departments/index'));
const UserInfo = lazy(() => import('@/pages/UserInfo/index'));
const ClockRecordPage = lazy(() => import('@/pages/Attendance/ClockRecord/index'));
const LeaveRequestPage = lazy(() => import('@/pages/Attendance/LeaveRequest/index'));
const OvertimeRequestPage = lazy(() => import('@/pages/Attendance/OvertimeRequest/index'));
const AIPage = lazy(() => import('@/pages/AI/index'));

export const BaseRoutes = [
  {
    path: '/home',
    element: <Home />,
    name: 'home',
    meta: {
      hidden: false,
      title: '首页',
      icon: <HomeOutlined />,
    },
  },
  {
    path: '/system',
    name: 'system',
    meta: {
      hidden: false,
      title: '系统管理',
      icon: <SettingOutlined />,
    },
    children: [
      {
        path: '/system/role',
        element: <RolePage />,
        name: 'role',
        meta: {
          hidden: false,
          title: '角色管理',
          icon: <SettingOutlined />,
        },
      },
      {
        path: '/system/departments',
        element: <DepartmentPage />,
        name: 'departments',
        meta: {
          hidden: false,
          title: '部门管理',
          icon: <TeamOutlined />,
        },
      },
    ],
  },
  {
    path: '/usersInfo',
    name: 'usersInfo',
    meta: {
      hidden: false,
      title: '信息管理',
      icon: <TeamOutlined />,
    },
    children: [
      {
        path: '/usersInfo/users',
        element: <UsersPage />,
        name: 'usersInfoUsers',
        meta: {
          hidden: false,
          title: '账号管理',
          icon: <UserOutlined />,
        },
      },
      {
        path: '/usersInfo/employee',
        element: <UserInfo />,
        name: 'employee',
        meta: {
          hidden: false,
          title: '员工信息',
          icon: <TeamOutlined />,
        },
      },
    ],
  },
  {
    path: '/attendance',
    name: 'attendance',
    meta: {
      hidden: false,
      title: '考勤管理',
      icon: <ClockCircleOutlined />,
    },
    children: [
      {
        path: '/attendance/clock-record',
        element: <ClockRecordPage />,
        name: 'clockRecord',
        meta: {
          hidden: false,
          title: '打卡记录',
          icon: <ClockCircleOutlined />,
        },
      },
      {
        path: '/attendance/leave-request',
        element: <LeaveRequestPage />,
        name: 'leaveRequest',
        meta: {
          hidden: false,
          title: '请假申请',
          icon: <FileTextOutlined />,
        },
      },
      {
        path: '/attendance/overtime-request',
        element: <OvertimeRequestPage />,
        name: 'overtimeRequest',
        meta: {
          hidden: false,
          title: '加班申请',
          icon: <PlusCircleOutlined />,
        },
      },
    ],
  },
  {
    path: '/ai',
    element: <AIPage />,
    name: 'ai',
    meta: {
      hidden: false,
      title: 'AI 助手',
      icon: <RobotOutlined />,
    },
  },
];

export const routes = [
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: (
      <AuthGuard>
        <Outlet />
      </AuthGuard>
    ),
    children: [
      {
        path: '/',
        name: 'layout',
        element: <Layout />,
        children: [
          {
            index: true,
            element: <Navigate to="/home" replace />,
          },
          ...BaseRoutes,
        ],
      },
    ],
  },
];
