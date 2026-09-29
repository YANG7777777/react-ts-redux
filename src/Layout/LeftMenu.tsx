import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Menu } from 'antd';
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';
import type { GetProp, MenuProps } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { BaseRoutes } from '../routes/routes';
import { toggleMenuCollapsed } from '../store/features/counterSlice';
import type { RootState } from '../store';
import styles from './leftMenu.module.scss';

type MenuTheme = GetProp<MenuProps, 'theme'>;
type MenuItem = GetProp<MenuProps, 'items'>[number];

const LeftMenu: React.FC = () => {
  const mode: 'vertical' | 'inline' = 'inline';
  const theme: MenuTheme = 'light';
  const collapsed = useSelector((state: RootState) => state.counter.menuCollapsed);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleCollapsed = () => {
    dispatch(toggleMenuCollapsed(!collapsed));
  };

  const items = useMemo<MenuItem[]>(() => {
    const buildMenuItems = (routes: typeof BaseRoutes): MenuItem[] => {
      return routes
        .filter((route) => !route.meta?.hidden)
        .map((route) => {
          const menuItem: MenuItem = {
            key: route.path as string,
            icon: route.meta?.icon,
            label: route.meta?.title,
          };

          if (route.children && route.children.length > 0) {
            (menuItem as { children?: MenuItem[] }).children = buildMenuItems(
              route.children as typeof BaseRoutes
            );
          }

          return menuItem;
        });
    };
    return buildMenuItems(BaseRoutes);
  }, []);

  const openKeys = useMemo(() => {
    const path = location.pathname;
    const parent = BaseRoutes.find(
      (route) =>
        route.children?.some((child) => child.path === path) ||
        (route.path !== '/home' && path.startsWith(`${route.path}/`))
    );
    return parent?.path ? [parent.path] : [];
  }, [location.pathname]);

  const onMenuSelected: MenuProps['onSelect'] = (e) => {
    navigate(e.key);
  };

  return (
    <div className={styles.leftMenu}>
      <Menu
        className={styles.menu}
        style={{ width: collapsed ? 80 : 210 }}
        selectedKeys={[location.pathname]}
        defaultOpenKeys={openKeys}
        key={openKeys.join('-') || 'root'}
        mode={mode}
        theme={theme}
        items={items}
        onSelect={onMenuSelected}
        inlineCollapsed={collapsed}
      />
      <Button type="text" onClick={toggleCollapsed}>
        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      </Button>
    </div>
  );
};

export default LeftMenu;
