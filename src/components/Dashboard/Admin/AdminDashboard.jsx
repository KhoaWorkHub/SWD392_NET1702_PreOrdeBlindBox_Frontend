import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Typography, Button, DatePicker } from 'antd';
import {
  UserOutlined,
  ShoppingOutlined,
  DollarOutlined,
  AppstoreOutlined,
  FileSearchOutlined,
  TeamOutlined,
  RightOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

/**
 * AdminDashboard component - Main dashboard for admin users
 * Displays key metrics and recent activity
 */
const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalPreorders: 0,
    totalRevenue: 0,
    activeUsers: 0,
    staffUsers: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  
  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // In a real implementation, you would fetch actual data
        // This is a mock implementation to simulate API calls
        
        // Mock data for demonstration
        setTimeout(() => {
          setStats({
            totalUsers: 256,
            totalOrders: 1458,
            totalPreorders: 243,
            totalRevenue: 321500000,
            activeUsers: 236,
            staffUsers: 12
          });
          
          // Mock recent users
          setRecentUsers([
            {
              id: 1,
              name: 'John Doe',
              email: 'john.doe@example.com',
              role: 'CUSTOMER',
              isActive: true,
              createdAt: '2025-03-15T12:30:00'
            },
            {
              id: 2,
              name: 'Jane Smith',
              email: 'jane.smith@example.com',
              role: 'STAFF',
              isActive: true,
              createdAt: '2025-03-14T10:15:00'
            },
            {
              id: 3,
              name: 'Mike Johnson',
              email: 'mike.johnson@example.com',
              role: 'CUSTOMER',
              isActive: false,
              createdAt: '2025-03-13T14:45:00'
            },
            {
              id: 4,
              name: 'Sarah Williams',
              email: 'sarah.williams@example.com',
              role: 'CUSTOMER',
              isActive: true,
              createdAt: '2025-03-12T09:20:00'
            },
            {
              id: 5,
              name: 'David Brown',
              email: 'david.brown@example.com',
              role: 'ADMIN',
              isActive: true,
              createdAt: '2025-03-10T16:55:00'
            }
          ]);
          
          setLoading(false);
        }, 1000);
        
        // In actual implementation, you would fetch real data like this:
        // const userCriteria = { page: 0, size: 5, sort: 'createdAt,desc' };
        // const response = await axiosInstance.get(endpoints.user.getAll, { data: userCriteria });
        // if (response && response.data && response.data.metadata) {
        //   const { content, totalElements } = response.data.metadata;
        //   setRecentUsers(content);
        //   setStats(prevStats => ({
        //     ...prevStats,
        //     totalUsers: totalElements
        //   }));
        // }
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // User table columns
  const userColumns = [
    {
      title: 'User',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          <div>
            <Text type="secondary">{record.email}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        let color = 'default';
        if (role === 'ADMIN') color = 'purple';
        else if (role === 'STAFF') color = 'blue';
        else if (role === 'CUSTOMER') color = 'green';
        return <Tag color={color}>{role}</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'success' : 'error'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Joined',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleString(),
    },
  ];

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header-section">
        <Row gutter={[16, 16]} justify="space-between" align="middle">
          <Col>
            <Title level={2}>Dashboard</Title>
            <Text type="secondary">Welcome to POP MART admin dashboard</Text>
          </Col>
          <Col>
            <RangePicker />
          </Col>
        </Row>
      </div>
      
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mt-6">
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card hoverable className="dashboard-stat-card">
            <div className="dashboard-stat-icon" style={{ color: '#722ed1' }}>
              <UserOutlined />
            </div>
            <Statistic title="Total Users" value={stats.totalUsers} loading={loading} />
            <div className="mt-3">
              <Text type="secondary">
                <span className="text-green-500">+12</span> this week
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card hoverable className="dashboard-stat-card">
            <div className="dashboard-stat-icon" style={{ color: '#52c41a' }}>
              <ShoppingOutlined />
            </div>
            <Statistic title="Total Orders" value={stats.totalOrders} loading={loading} />
            <div className="mt-3">
              <Text type="secondary">
                <span className="text-green-500">+24</span> this week
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card hoverable className="dashboard-stat-card">
            <div className="dashboard-stat-icon" style={{ color: '#faad14' }}>
              <AppstoreOutlined />
            </div>
            <Statistic title="Preorders" value={stats.totalPreorders} loading={loading} />
            <div className="mt-3">
              <Text type="secondary">
                <span className="text-green-500">+8</span> this week
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card hoverable className="dashboard-stat-card">
            <div className="dashboard-stat-icon" style={{ color: '#f5222d' }}>
              <DollarOutlined />
            </div>
            <Statistic 
              title="Revenue" 
              value={stats.totalRevenue} 
              loading={loading}
              formatter={value => `${value.toLocaleString()} ₫`} 
            />
            <div className="mt-3">
              <Text type="secondary">
                <span className="text-green-500">+6.5%</span> this month
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card hoverable className="dashboard-stat-card">
            <div className="dashboard-stat-icon" style={{ color: '#1890ff' }}>
              <FileSearchOutlined />
            </div>
            <Statistic 
              title="Active Users" 
              value={stats.activeUsers} 
              loading={loading} 
              suffix={`/ ${stats.totalUsers}`}
            />
            <div className="mt-3">
              <Text type="secondary">
                <span className="text-green-500">{Math.round((stats.activeUsers / stats.totalUsers) * 100)}%</span> active rate
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card hoverable className="dashboard-stat-card">
            <div className="dashboard-stat-icon" style={{ color: '#722ed1' }}>
              <TeamOutlined />
            </div>
            <Statistic title="Staff Users" value={stats.staffUsers} loading={loading} />
            <div className="mt-3">
              <Text type="secondary">
                <span className="text-green-500">+1</span> this month
              </Text>
            </div>
          </Card>
        </Col>
      </Row>
      
      {/* Recent Users */}
      <Card 
        title="Recent Users" 
        className="mt-6"
        extra={
          <Link to="/dashboard/user-management">
            <Button type="link" icon={<RightOutlined />}>
              View All Users
            </Button>
          </Link>
        }
      >
        <Table 
          columns={userColumns} 
          dataSource={recentUsers}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Card>
      
      {/* Quick Actions */}
      <Row gutter={[16, 16]} className="mt-6">
        <Col span={24}>
          <Card title="Quick Actions">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Button 
                  type="primary" 
                  icon={<UserOutlined />}
                  block
                  onClick={() => window.location.href = '/dashboard/user-management/create'}
                >
                  Add New User
                </Button>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Button 
                  type="default" 
                  icon={<AppstoreOutlined />}
                  block
                  onClick={() => window.location.href = '/dashboard/blindboxes/create'}
                >
                  Create Blindbox
                </Button>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Button 
                  type="default" 
                  icon={<FileSearchOutlined />}
                  block
                  onClick={() => window.location.href = '/dashboard/reports'}
                >
                  View Reports
                </Button>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Button 
                  type="default" 
                  icon={<ShoppingOutlined />}
                  block
                  onClick={() => window.location.href = '/dashboard/orders'}
                >
                  Manage Orders
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;