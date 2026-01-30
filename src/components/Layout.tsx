import { Outlet, Link, useLocation } from 'react-router-dom';
import { UserOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { Avatar, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { logout } from '../store/features/authSlice';
import { useDispatch } from 'react-redux';



import styles from './Layout.module.scss';
const Layout = () => {
    const location = useLocation();
    const user = useSelector((state: any) => state.auth);
    const dispatch = useDispatch();
    
    // 菜单项配置
    const menuItems = [
        { path: '/home', label: '首页' },
        { path: '/about', label: '关于我们' },
        { path: '/dashboard', label: '仪表盘' }
    ];

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
                        menu={ menuProps } 
                        trigger={['click']}
                    >
                        <div>
                            <Avatar icon={<UserOutlined />}></Avatar>
                            {user.userInfo?.username}
                        </div>
                    </Dropdown>
                </div>
            </header>

            <div className={styles.mainArea}>
                {/* 左侧菜单 */}
                <aside className={styles.sidebar}>
                    <ul className={styles.sidebarMenu}>
                        {menuItems.map((item) => (
                            <li key={item.path} className={styles.sidebarMenuItem}>
                                <Link 
                                    to={item.path} 
                                    className={`${styles.sidebarMenuLink} ${location.pathname === item.path ? styles.active : ''}`}
                                >
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </aside>
                
                {/* 右侧内容区域 */}
                <main className={styles.content}>
                    <Outlet/>
                </main>
            </div>

            <footer className={styles.footer}>
                © 2025 后台管理系统
            </footer>
        </div>
    );
}

export default Layout;
