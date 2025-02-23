import { Input, Button, Badge, Menu } from 'antd';
import { 
  SearchOutlined, 
  UserOutlined, 
  BellOutlined, 
  ShoppingOutlined 
} from '@ant-design/icons';

const Navbar = () => {
  return (
    <nav className="w-full border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <div className="flex items-center">
          <div className="bg-red-600 px-3 py-1">
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
          
          {/* Account */}
          <Button type="text" icon={<UserOutlined />} className="flex items-center">
            <span className="ml-1 text-sm">Sign in / Register</span>
          </Button>
          
          {/* Notifications */}
          <Button type="text" icon={<BellOutlined />} />
          
          {/* Cart */}
          <Badge count={0} size="small">
            <Button type="text" icon={<ShoppingOutlined />} />
          </Badge>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;