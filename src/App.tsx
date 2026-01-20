// import React from 'react';
import {Routes, Route, Navigate} from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/Home'; // 你创建的首页组件
import AboutPage from './pages/About'; // 假设你创建了关于页面
import DashboardPage from './pages/DashboardPage'; // 假设你创建了仪表盘页面
import LoginPage from './pages/Login'; // 登录页面组件
import TokenManager from './components/TokenManager'; // Token管理器组件

function App() {
    return (
        <>
            <TokenManager />
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<Layout />}>
                    <Route path="/" element={<Navigate to="/home" replace />} />
                    <Route path="/home" element={<HomePage />} />

                    <Route path="about" element={<AboutPage />} />
                    <Route path="dashboard" element={<DashboardPage />} />
                </Route>
            </Routes>
        </>
    );
}

export default App;
