import { Outlet, Link, useLocation } from 'react-router-dom';

import styles from './Layout.module.scss';
const Layout = () => {
    const location = useLocation();
    
    // 菜单项配置
    const menuItems = [
        { path: '/home', label: '首页' },
        { path: '/about', label: '关于我们' },
        { path: '/dashboard', label: '仪表盘' }
    ];
    
    return (
        <div className={styles.appContainer}>
            <header className={styles.header}>
                <div className={styles.logo}>后台管理系统</div>
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
