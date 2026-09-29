import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { UserOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { Avatar, Dropdown, message } from 'antd';
import type { MenuProps } from 'antd';
import { logout as logoutAction } from '../store/features/authSlice';
import { logout as logoutApi } from '../api/login';
import { setToken } from '../utils/request';
import LeftMenu from './LeftMenu';
import TagsNav from './TagsNav';
import type { RootState } from '../store';
import styles from './index.module.scss';

const Index = () => {
  const user = useSelector((state: RootState) => state.auth);
  const collapsed = useSelector((state: RootState) => state.counter.menuCollapsed);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const items: MenuProps['items'] = [
    {
      key: 'logout',
      label: '退出登录',
    },
  ];

  const handleMenuClick: MenuProps['onClick'] = async (e) => {
    if (e.key !== 'logout') return;
    try {
      await logoutApi();
    } catch {
      // 接口失败也继续清理本地登录态
    } finally {
      setToken(null);
      dispatch(logoutAction());
      message.success('已退出登录');
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className={styles.appContainer}>
      <header className={styles.header}>
        <div className={styles.logo}>后台管理系统</div>
        <div className={styles.user}>
          <Dropdown menu={{ items, onClick: handleMenuClick }} trigger={['click']}>
            <div className={styles.userTrigger}>
              <Avatar
                size="small"
                icon={<UserOutlined />}
                style={{ backgroundColor: '#e6f4ff', color: '#1677ff' }}
              />
              <span>{user.userInfo?.username}</span>
            </div>
          </Dropdown>
        </div>
      </header>

      <div className={styles.mainArea}>
        <LeftMenu />
        <main className={styles.content}>
          <TagsNav />
          <div className={styles.pageWrapper} key={location.pathname}>
            <Outlet />
          </div>
        </main>
      </div>

      <footer className={styles.footer}>
        <div className={styles.animation} style={{ width: collapsed ? '80px' : '200px' }} />
        <div className={styles.footerContent}>© 2025 后台管理系统</div>
      </footer>
    </div>
  );
};

export default Index;
