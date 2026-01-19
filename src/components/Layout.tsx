import { Outlet, Link } from 'react-router-dom';

import styles from './Layout.module.scss';
const Layout = () => {
    return (
        <div className={styles.appContainer}>
            <header className={styles.header}>
                <div className={styles.logo}>My App Logo</div>
                <nav>
                    <Link to="/home">首页</Link>
                    <Link to="/about">关于我们</Link>
                    <Link to="/dashboard">仪表盘</Link>
                </nav>
            </header>

            <div className={styles.mainArea}>
                <main className={styles.content}>
                    <Outlet/>
                </main>
            </div>

            <footer className={styles.footer}>
                © 2025 My Awesome App
            </footer>
        </div>
    );
}

export default Layout;
