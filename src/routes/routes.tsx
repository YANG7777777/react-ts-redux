import Login from '../pages/Login'
import AuthGuard from '../components/AuthGuard'
import {Outlet, Navigate} from "react-router-dom";
import Layout from '../Layout/index'
import { BarChartOutlined, HomeOutlined, TeamOutlined } from '@ant-design/icons';

import Home from '@/pages/Home/index'
import DashboardPage from '@/pages/DashboardPage'
import About from '@/pages/About/index'

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
    {
        path: "/dashboard",
        element: <DashboardPage />,
        name: "dashboard",
        meta: {
            hidden: false,
            title: "看板",
            icon: <BarChartOutlined />,
        },
    },
    {
        path: "/about",
        element: <About />,
        name: "about",
        meta: {
            hidden: false,
            title: "关于",
            icon: <TeamOutlined />,
        },
    },


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
