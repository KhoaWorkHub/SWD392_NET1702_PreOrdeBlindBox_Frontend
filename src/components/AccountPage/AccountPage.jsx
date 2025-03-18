import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Button,
  Typography,
  Breadcrumb,
  Spin,
  Avatar,
  Statistic,
} from "antd";
import {
  HomeOutlined,
  UserOutlined,
  ShoppingOutlined,
  HistoryOutlined,
  CreditCardOutlined,
  SettingOutlined,
  HeartOutlined,
  FileTextOutlined,
  LockOutlined,
  HddOutlined,
  RightOutlined,
  WalletOutlined,
  ClockCircleOutlined,
  BellOutlined,
} from "@ant-design/icons";
import useAuth from "../../hooks/useAuth";
import "./AccountPage.css";

const { Title, Text, Paragraph } = Typography;

/**
 * AccountPage component for user account overview and navigation
 *
 * @returns {JSX.Element} The AccountPage component
 */
const AccountPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  // If not authenticated, show loading
  if (!isAuthenticated) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb Navigation */}
      <Breadcrumb className="mb-6">
        <Breadcrumb.Item>
          <Link to="/">
            <HomeOutlined /> Home
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <UserOutlined /> My Account
        </Breadcrumb.Item>
      </Breadcrumb>

      {/* Account Header */}
      <div className="account-header bg-gray-50 p-6 rounded-lg mb-8">
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={16}>
            <div className="flex items-center">
              <Avatar 
                size={64} 
                icon={<UserOutlined />} 
                className="bg-gray-300 mr-4"
              />
              <div>
                <Title level={3} className="mb-1">
                  Welcome back, {user?.name || "Customer"}
                </Title>
                <Text type="secondary">
                  Manage your orders, preorders, personal details, and preferences here
                </Text>
              </div>
            </div>
          </Col>
          <Col xs={24} md={8} className="text-center md:text-right">
            <Button
              type="primary"
              icon={<SettingOutlined />}
              size="large"
              className="bg-black hover:bg-gray-800"
              onClick={() => navigate("/account/settings")}
            >
              Account Settings
            </Button>
          </Col>
        </Row>
      </div>

      {/* Account Overview Cards */}
      <Row gutter={[24, 24]} className="mb-8">
        <Col xs={12} md={6}>
          <Card className="text-center account-stat-card">
            <Statistic
              title="Orders"
              value={2}
              prefix={<ShoppingOutlined className="text-blue-500" />}
            />
            <Button 
              type="link" 
              className="mt-2 flex items-center mx-auto"
              onClick={() => navigate("/account/orders")}
            >
              View Orders <RightOutlined className="ml-1" />
            </Button>
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card className="text-center account-stat-card">
            <Statistic
              title="Preorders"
              value={3}
              prefix={<HistoryOutlined className="text-orange-500" />}
            />
            <Button 
              type="link" 
              className="mt-2 flex items-center mx-auto"
              onClick={() => navigate("/account/preorders")}
            >
              View Preorders <RightOutlined className="ml-1" />
            </Button>
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card className="text-center account-stat-card">
            <Statistic
              title="Wishlist"
              value={5}
              prefix={<HeartOutlined className="text-red-500" />}
            />
            <Button 
              type="link" 
              className="mt-2 flex items-center mx-auto"
              onClick={() => navigate("/account/wishlist")}
            >
              View Wishlist <RightOutlined className="ml-1" />
            </Button>
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card className="text-center account-stat-card">
            <Statistic
              title="Reviews"
              value={1}
              prefix={<FileTextOutlined className="text-green-500" />}
            />
            <Button 
              type="link" 
              className="mt-2 flex items-center mx-auto"
              onClick={() => navigate("/account/reviews")}
            >
              View Reviews <RightOutlined className="ml-1" />
            </Button>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity */}
      <Title level={4} className="mb-4">
        Recent Activity
      </Title>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Card
            title={
              <div className="flex items-center">
                <ShoppingOutlined className="mr-2 text-blue-500" />
                <span>Recent Orders</span>
              </div>
            }
            extra={<Link to="/account/orders">View All</Link>}
            className="h-full account-section-card"
          >
            <div className="mb-4 p-4 border border-gray-100 rounded">
              <div className="flex justify-between mb-2">
                <Text strong>Order #12345</Text>
                <Text type="secondary">Mar 15, 2025</Text>
              </div>
              <Text type="success" className="block mb-2">Delivered</Text>
              <Text className="block">2 items - 450,000 ₫</Text>
              <Button 
                type="link" 
                className="mt-2 p-0"
                onClick={() => navigate("/account/orders/12345")}
              >
                View Order Details
              </Button>
            </div>
            
            <div className="p-4 border border-gray-100 rounded">
              <div className="flex justify-between mb-2">
                <Text strong>Order #12344</Text>
                <Text type="secondary">Mar 10, 2025</Text>
              </div>
              <Text type="success" className="block mb-2">Delivered</Text>
              <Text className="block">1 item - 250,000 ₫</Text>
              <Button 
                type="link" 
                className="mt-2 p-0"
                onClick={() => navigate("/account/orders/12344")}
              >
                View Order Details
              </Button>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card
            title={
              <div className="flex items-center">
                <HistoryOutlined className="mr-2 text-orange-500" />
                <span>Active Preorders</span>
              </div>
            }
            extra={<Link to="/account/preorders">View All</Link>}
            className="h-full account-section-card"
          >
            <div className="mb-4 p-4 border border-gray-100 rounded">
              <div className="flex justify-between mb-2">
                <Text strong>Preorder #PRE-001</Text>
                <Text type="secondary">Mar 18, 2025</Text>
              </div>
              <Text type="warning" className="block mb-2">Awaiting Final Payment</Text>
              <Text className="block">1 item - 1,200,000 ₫</Text>
              <div className="mt-2 flex justify-between items-center">
                <Button 
                  type="link" 
                  className="p-0"
                  onClick={() => navigate("/account/preorders/1")}
                >
                  View Details
                </Button>
                <Button 
                  type="primary" 
                  size="small"
                  className="bg-orange-500 hover:bg-orange-600"
                  onClick={() => navigate("/checkout")}
                >
                  Pay Now
                </Button>
              </div>
            </div>
            
            <div className="p-4 border border-gray-100 rounded">
              <div className="flex justify-between mb-2">
                <Text strong>Preorder #PRE-002</Text>
                <Text type="secondary">Mar 5, 2025</Text>
              </div>
              <Text type="processing" className="block mb-2">Deposit Paid</Text>
              <Text className="block">2 items - 2,500,000 ₫</Text>
              <Button 
                type="link" 
                className="mt-2 p-0"
                onClick={() => navigate("/account/preorders/2")}
              >
                View Details
              </Button>
            </div>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card
            title={
              <div className="flex items-center">
                <BellOutlined className="mr-2 text-purple-500" />
                <span>Notifications</span>
              </div>
            }
            extra={<Link to="/account/notifications">View All</Link>}
            className="h-full account-section-card"
          >
            <div className="mb-4 p-4 border border-gray-100 rounded">
              <div className="flex justify-between mb-2">
                <Text strong>Payment Reminder</Text>
                <Text type="secondary">Today</Text>
              </div>
              <Text className="block">
                Final payment for your preorder #PRE-001 is due in 3 days
              </Text>
            </div>
            
            <div className="mb-4 p-4 border border-gray-100 rounded">
              <div className="flex justify-between mb-2">
                <Text strong>New Collection Released</Text>
                <Text type="secondary">Yesterday</Text>
              </div>
              <Text className="block">
                Check out the new Mystery Series now available!
              </Text>
            </div>
            
            <div className="p-4 border border-gray-100 rounded">
              <div className="flex justify-between mb-2">
                <Text strong>Order Delivered</Text>
                <Text type="secondary">Mar 15, 2025</Text>
              </div>
              <Text className="block">
                Your order #12345 has been delivered
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Account Navigation Menu */}
      <Title level={4} className="mb-4 mt-8">
        Account Management
      </Title>

      <Row gutter={[24, 24]}>
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card
            hoverable
            className="text-center account-nav-card"
            onClick={() => navigate("/account/profile")}
          >
            <UserOutlined className="text-2xl mb-2 text-blue-500" />
            <Text strong className="block">Profile</Text>
          </Card>
        </Col>
        
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card
            hoverable
            className="text-center account-nav-card"
            onClick={() => navigate("/account/orders")}
          >
            <ShoppingOutlined className="text-2xl mb-2 text-green-500" />
            <Text strong className="block">Orders</Text>
          </Card>
        </Col>
        
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card
            hoverable
            className="text-center account-nav-card"
            onClick={() => navigate("/account/preorders")}
          >
            <HistoryOutlined className="text-2xl mb-2 text-orange-500" />
            <Text strong className="block">Preorders</Text>
          </Card>
        </Col>
        
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card
            hoverable
            className="text-center account-nav-card"
            onClick={() => navigate("/account/payments")}
          >
            <CreditCardOutlined className="text-2xl mb-2 text-red-500" />
            <Text strong className="block">Payments</Text>
          </Card>
        </Col>
        
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card
            hoverable
            className="text-center account-nav-card"
            onClick={() => navigate("/account/wishlist")}
          >
            <HeartOutlined className="text-2xl mb-2 text-pink-500" />
            <Text strong className="block">Wishlist</Text>
          </Card>
        </Col>
        
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card
            hoverable
            className="text-center account-nav-card"
            onClick={() => navigate("/account/address")}
          >
            <EnvironmentOutlined className="text-2xl mb-2 text-purple-500" />
            <Text strong className="block">Addresses</Text>
          </Card>
        </Col>
        
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card
            hoverable
            className="text-center account-nav-card"
            onClick={() => navigate("/account/security")}
          >
            <LockOutlined className="text-2xl mb-2 text-gray-500" />
            <Text strong className="block">Security</Text>
          </Card>
        </Col>
        
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card
            hoverable
            className="text-center account-nav-card"
            onClick={() => navigate("/account/notifications")}
          >
            <BellOutlined className="text-2xl mb-2 text-yellow-500" />
            <Text strong className="block">Notifications</Text>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AccountPage;