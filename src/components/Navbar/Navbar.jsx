import { Input, Button, Badge, Menu, Dropdown, Avatar } from 'antd';
import {
  SearchOutlined,
  UserOutlined,
  BellOutlined,
  ShoppingOutlined,
  LogoutOutlined,
  HistoryOutlined,
  CreditCardOutlined,
  SettingOutlined,
  DownOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import useCart from '../../hooks/useCart';

const Navbar = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const { itemCount } = useCart();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('accessToken');
      setIsLoggedIn(!!token);
    };
    
    // Check initially
    checkAuth();
    
    // Set up event listener for storage changes
    window.addEventListener('storage', checkAuth);
    
    // Custom event for login/logout
    const handleAuthChange = () => {
      checkAuth();
    };
    
    window.addEventListener('authStateChanged', handleAuthChange);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('authStateChanged', handleAuthChange);
    };
  }, []);
  
  const handleSignInClick = () => {
    navigate('/login');
  };
  
  const handleLogoutClick = () => {
    logout();
    setIsLoggedIn(false);
    navigate('/login');
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('authStateChanged'));
  };

  const handleCartClick = () => {
    navigate('/cart');
  };

  // Account menu items for dropdown
  const accountMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'My Profile',
      onClick: () => navigate('/account/profile'),
    },
    {
      key: 'orders',
      icon: <ShoppingOutlined />,
      label: 'My Orders',
      onClick: () => navigate('/account/orders'),
    },
    {
      key: 'preorders',
      icon: <HistoryOutlined />,
      label: 'My Preorders',
      onClick: () => navigate('/account/preorders'),
    },
    {
      key: 'payments',
      icon: <CreditCardOutlined />,
      label: 'Payment Methods',
      onClick: () => navigate('/account/payments'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Account Settings',
      onClick: () => navigate('/account/settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogoutClick,
    },
  ];

  return (
    <nav className="w-full border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <div className="flex items-center">
          <div
            className="bg-red-600 px-3 py-1 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <span className="text-white font-bold text-lg">POP MART</span>
          </div>
        </div>

        {/* Navigation Links */}
        <Menu mode="horizontal" className="hidden md:flex border-0">
          <Menu.Item key="new" className="font-medium">
            New & Featured
          </Menu.Item>
          <Menu.Item key="series" className="font-medium">
            SERIES
          </Menu.Item>
          <Menu.Item key="mega" className="font-medium">
            MEGA
          </Menu.Item>
          <Menu.Item key="types" className="font-medium">
            TYPES
          </Menu.Item>
          <Menu.Item key="accessories" className="font-medium">
            ACCESSORIES
          </Menu.Item>
        </Menu>

        {/* Search Bar */}
        <div className="flex-1 max-w-xs mx-4">
          <Input
            placeholder="Dimoo"
            prefix={<SearchOutlined className="text-gray-400" />}
            className="bg-gray-100 rounded-md"
          />
        </div>

        {/* Right Side Icons */}
        <div className="flex items-center space-x-4">
          {/* Country Selector */}
          <div className="flex items-center bg-red-600 text-white px-2 py-1 rounded">
            <span className="text-xs font-bold">VN</span>
          </div>
          
          {/* Account - Conditionally render Sign in or Account dropdown */}
          {isLoggedIn ? (
            <Dropdown 
              menu={{ items: accountMenuItems }} 
              placement="bottomRight"
              arrow
            >
              <Button
                type="text"
                className="flex items-center"
              >
                <Avatar 
                  size="small" 
                  icon={<UserOutlined />} 
                  className="mr-1 bg-gray-200"
                />
                <span className="ml-1 text-sm hidden sm:inline">My Account</span>
                <DownOutlined className="ml-1 text-xs" />
              </Button>
            </Dropdown>
          ) : (
            <Button
              type="text"
              icon={<UserOutlined />}
              className="flex items-center"
              onClick={handleSignInClick}
            >
              <span className="ml-1 text-sm">Sign in / Register</span>
            </Button>
          )}
          
          {/* Notifications */}
          <Button type="text" icon={<BellOutlined />} />
          
          {/* Cart with item count */}
          <Badge count={itemCount} size="small">
            <Button 
              type="text" 
              icon={<ShoppingOutlined />} 
              onClick={handleCartClick}
            />
          </Badge>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;