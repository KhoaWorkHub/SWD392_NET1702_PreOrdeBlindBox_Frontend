import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Dropdown, Avatar, Badge, Typography, Breadcrumb } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  UserOutlined,
  ShoppingOutlined,
  TeamOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
  AppstoreOutlined,
  FileTextOutlined,
  GiftOutlined
} from '@ant-design/icons';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import './Dashboard.css';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

/**
 * DashboardLayout - Main layout for the dashboard area
 * Provides navigation, header, and content area for all dashboard pages
 */
const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [breadcrumbItems, setBreadcrumbItems] = useState([]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Generate breadcrumb items based on current path
  useEffect(() => {
    const pathSnippets = location.pathname.split('/').filter(i => i);
    const breadcrumbItems = pathSnippets.map((snippet, index) => {
      const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
      return {
        key: url,
        title: snippet.charAt(0).toUpperCase() + snippet.slice(1).replace('-', ' '),
        path: url
      };
    });
    
    setBreadcrumbItems([
      { key: '/dashboard', title: 'Dashboard', path: '/dashboard' },
      ...breadcrumbItems.filter(item => item.key !== '/dashboard')
    ]);
  }, [location.pathname]);

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Admin menu items
  const adminMenuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/dashboard">Dashboard</Link>,
    },
    {
      key: '/dashboard/user-management',
      icon: <TeamOutlined />,
      label: <Link to="/dashboard/user-management">User Management</Link>,
    },
    {
      key: '/dashboard/blindboxes',
      icon: <GiftOutlined />,
      label: 'Blindbox Management',
      children: [
        {
          key: '/dashboard/blindboxes/list',
          label: <Link to="/dashboard/blindboxes/list">All Blindboxes</Link>,
        },
        {
          key: '/dashboard/blindboxes/create',
          label: <Link to="/dashboard/blindboxes/create">Create New</Link>,
        },
      ],
    },
    {
      key: '/dashboard/orders',
      icon: <ShoppingOutlined />,
      label: <Link to="/dashboard/orders">Orders</Link>,
    },
    {
      key: '/dashboard/preorders',
      icon: <AppstoreOutlined />,
      label: <Link to="/dashboard/preorders">Preorders</Link>,
    },
    {
      key: '/dashboard/reports',
      icon: <FileTextOutlined />,
      label: <Link to="/dashboard/reports">Reports</Link>,
    },
    {
      key: '/dashboard/settings',
      icon: <SettingOutlined />,
      label: <Link to="/dashboard/settings">Settings</Link>,
    },
  ];

  // Staff menu items (subset of admin items)
  const staffMenuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/dashboard">Dashboard</Link>,
    },
    {
      key: '/dashboard/blindboxes',
      icon: <GiftOutlined />,
      label: 'Blindbox Management',
      children: [
        {
          key: '/dashboard/blindboxes/list',
          label: <Link to="/dashboard/blindboxes/list">All Blindboxes</Link>,
        },
      ],
    },
    {
      key: '/dashboard/orders',
      icon: <ShoppingOutlined />,
      label: <Link to="/dashboard/orders">Orders</Link>,
    },
    {
      key: '/dashboard/preorders',
      icon: <AppstoreOutlined />,
      label: <Link to="/dashboard/preorders">Preorders</Link>,
    },
  ];

  // User dropdown menu items
  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'My Profile',
      onClick: () => navigate('/dashboard/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => navigate('/dashboard/settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  // Determine which menu to show based on role
  const menuItems = user && user.includes('ADMIN') ? adminMenuItems : staffMenuItems;
  
  // Find the current selected key based on path
  const selectedKeys = [location.pathname];
  // Find open keys for submenus
  const findOpenKeys = (path) => {
    const result = [];
    menuItems.forEach(item => {
      if (item.children && item.children.some(child => path.includes(child.key))) {
        result.push(item.key);
      }
    });
    return result;
  };

  return (
    <Layout className="dashboard-layout">
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        className="dashboard-sider"
      >
        <div className="logo">
          {collapsed ? 'PM' : 'POP MART'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          defaultOpenKeys={findOpenKeys(location.pathname)}
          items={menuItems}
        />
      </Sider>
      <Layout className="site-layout">
        <Header className="dashboard-header">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="trigger-btn"
          />
          <div className="header-right">
            <Badge count={5} className="notification-badge">
              <Button 
                type="text" 
                icon={<BellOutlined />} 
                className="notification-btn"
              />
            </Badge>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className="user-dropdown">
                <Avatar icon={<UserOutlined />} />
                {!collapsed && (
                  <span className="user-name">
                    {user ? (user.includes('ADMIN') ? 'Admin' : 'Staff') : 'User'}
                  </span>
                )}
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content className="dashboard-content">
          <div className="breadcrumb-container">
            <Breadcrumb>
              {breadcrumbItems.map(item => (
                <Breadcrumb.Item key={item.key}>
                  <Link to={item.path}>{item.title}</Link>
                </Breadcrumb.Item>
              ))}
            </Breadcrumb>
          </div>
          <div className="content-container">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;