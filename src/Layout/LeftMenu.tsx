import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from 'antd';
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';
import styles from './leftMenu.module.scss'
import { Menu } from 'antd';
import type { GetProp, MenuProps } from 'antd';
import { BaseRoutes } from '../routes/routes';

type MenuTheme = GetProp<MenuProps, 'theme'>;

type MenuItem = GetProp<MenuProps, 'items'>[number];

const LeftMenu: React.FC = () => {
  const [mode] = useState<'vertical' | 'inline'>('inline');
  const [theme] = useState<MenuTheme>('light');
  const [collapsed, setCollapsed] = useState(false);
  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const buildMenuItems = (routes: any[]): any[] => {
    return routes
      .filter(route => !route.meta?.hidden)
      .map(route => {
        const menuItem: any = {
          key: route.path as string,
          icon: route.meta?.icon,
          label: route.meta?.title,
        };
        
        if (route.children && route.children.length > 0) {
          menuItem.children = buildMenuItems(route.children);
        }
        
        return menuItem;
      });
  };

  const items = useMemo<MenuItem[]>(() => {
    return buildMenuItems(BaseRoutes);
  }, []);
  
  const onMeunSelected: MenuProps['onSelect'] = (e) => {
    console.log(e.key);
    navigate(e.key);
  };

  return (
    <div className={styles.leftMenu}>
      <Menu
        className={styles.menu}
        style={{ width: collapsed ? 80 : 210 }}
        selectedKeys={[location.pathname]}
        defaultOpenKeys={['sub1']}
        mode={mode}
        theme={theme}
        items={items}
        onSelect={ onMeunSelected }
        inlineCollapsed={collapsed}
      />
      <Button type="text" onClick={toggleCollapsed}>
        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
      </Button>
    </div>
  );
};

export default LeftMenu;