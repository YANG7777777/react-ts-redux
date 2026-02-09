// 在父路由组件中，<Outlet> 会动态渲染当前匹配的子路由对应的组件。
// 允许父路由定义共享布局（如导航栏、侧边栏），子路由内容通过 <Outlet> 插入到布局中的指定位置。
import {Outlet} from 'react-router-dom';
import {UserOutlined} from '@ant-design/icons';

/**
 * 从 Redux store 中获取状态：允许组件订阅 Redux store 的特定部分（state），并在状态变化时自动重新渲染。
 * 支持复杂的选择逻辑：可以传入一个 选择器函数（selector function），用于计算派生数据（derived data）。
 * 获取 dispatch 函数：允许组件直接调用 Redux 的 dispatch 方法，派发 actions 到 store。
 * 触发状态更新：通过派发 actions（通常是普通对象或由 redux-thunk 等中间件处理的函数），修改 Redux 的全局状态。
 */
import {useSelector, useDispatch} from 'react-redux';

import {Avatar, Dropdown} from 'antd';
import type {MenuProps} from 'antd';
import {logout} from '../store/features/authSlice.ts';
import LeftMenu from './LeftMenu.tsx';


import styles from './index.module.scss';

const Index = () => {
    const user = useSelector((state: any) => state.auth);
    const dispatch = useDispatch();

    const items: MenuProps['items'] = [
        {
            key: 'logout',
            label: '退出登录',
        },
    ];

    const handleMenuClick: MenuProps['onClick'] = (e) => {
        if (e.key === 'logout') {
            try {
                logout();
                // 清空用户信息
                dispatch(logout());
                console.log('退出登录成功');
            } catch (error) {
                console.error('退出登录失败:', error);
            }
        }
    };

    const menuProps = {
        items,
        onClick: handleMenuClick,
    };

    return (
        <div className={styles.appContainer}>
            <header className={styles.header}>
                <div className={styles.logo}>后台管理系统</div>
                <div className={styles.user}>
                    <Dropdown
                        menu={menuProps}
                        trigger={['click']}
                    >
                        <div>
                            <Avatar icon={<UserOutlined/>}></Avatar>
                            {user.userInfo?.username}
                        </div>
                    </Dropdown>
                </div>
            </header>

            <div className={styles.mainArea}>
                {/* 左侧菜单 */}
                <LeftMenu/>

                {/* 右侧内容区域 */}
                <main className={styles.content}>
                    {/*Outlet 会渲染当前 URL 匹配的子路由组件。*/}
                    {/*会根据当前 URL 自动渲染匹配的子路由组件，无需手动控制*/}
                    <Outlet/>
                </main>
            </div>

            <footer className={styles.footer}>
                © 2025 后台管理系统
            </footer>
        </div>
    );
}

export default Index;
