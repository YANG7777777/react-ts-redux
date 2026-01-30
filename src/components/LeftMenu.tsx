import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import {
  AppstoreOutlined,
  CalendarOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { Menu } from 'antd';
import type { GetProp, MenuProps } from 'antd';

type MenuTheme = GetProp<MenuProps, 'theme'>;

type MenuItem = GetProp<MenuProps, 'items'>[number];

const items: MenuItem[] = [
  {
    key: '/home',
    icon: <HomeOutlined />,
    label: '首页',
  },
  {
    key: '/about',
    icon: <CalendarOutlined />,
    label: '关于我们',
  },
  {
    key: '/dashboard',
    label: '仪表盘',
    icon: <AppstoreOutlined />,
    // children: [
    //   { key: '3', label: 'Option 3' },
    //   { key: '4', label: 'Option 4' },
    //   {
    //     key: 'sub1-2',
    //     label: 'Submenu',
    //     children: [
    //       { key: '5', label: 'Option 5' },
    //       { key: '6', label: 'Option 6' },
    //     ],
    //   },
    // ],
  },
//   {
//     key: 'sub2',
//     label: 'Navigation Three',
//     icon: <SettingOutlined />,
//     children: [
//       { key: '7', label: 'Option 7' },
//       { key: '8', label: 'Option 8' },
//       { key: '9', label: 'Option 9' },
//       { key: '10', label: 'Option 10' },
//     ],
//   },
];

const LeftMenu: React.FC = () => {
  const [mode] = useState<'vertical' | 'inline'>('inline');
  const [theme] = useState<MenuTheme>('light');
  const navigate = useNavigate();
  const location = useLocation();
  
  const onMeunSelected: MenuProps['onSelect'] = (e) => {
    console.log(e.key);
    navigate(e.key);
  };

  return (
    <>
      <Menu
        style={{ width: 256 }}
        selectedKeys={[location.pathname]}
        defaultOpenKeys={['sub1']}
        mode={mode}
        theme={theme}
        items={items}
        onSelect={ onMeunSelected }
      />
    </>
  );
};

export default LeftMenu;