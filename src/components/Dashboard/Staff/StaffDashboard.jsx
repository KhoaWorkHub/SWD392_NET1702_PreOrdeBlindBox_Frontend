import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Typography, Button, DatePicker, Timeline } from 'antd';
import {
  ShoppingOutlined,
  AppstoreOutlined,
  GiftOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  RightOutlined,
  FileSearchOutlined,
  CalendarOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';


const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

/**
 * StaffDashboard component - Main dashboard for staff users
 * Displays key metrics and recent orders to process
 */
const StaffDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pendingOrders: 0,
    shippedOrders: 0,
    totalPreorders: 0,
    pendingPreorders: 0,
    activeCampaigns: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [activities, setActivities] = useState([]);
  const [recentCampaigns, setRecentCampaigns] = useState([]);
  
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
            pendingOrders: 24,
            shippedOrders: 156,
            totalPreorders: 243,
            pendingPreorders: 47,
            activeCampaigns: 5
          });
          
          // Mock recent orders
          setRecentOrders([
            {
              id: 1001,
              orderCode: 'ORD-20250315-001',
              customer: 'John Doe',
              amount: 450000,
              status: 'PENDING',
              createdAt: '2025-03-15T12:30:00'
            },
            {
              id: 1002,
              orderCode: 'ORD-20250315-002',
              customer: 'Jane Smith',
              amount: 650000,
              status: 'PROCESSING',
              createdAt: '2025-03-15T10:15:00'
            },
            {
              id: 1003,
              orderCode: 'ORD-20250314-001',
              customer: 'Mike Johnson',
              amount: 250000,
              status: 'SHIPPED',
              createdAt: '2025-03-14T14:45:00'
            },
            {
              id: 1004,
              orderCode: 'ORD-20250314-002',
              customer: 'Sarah Williams',
              amount: 550000,
              status: 'DELIVERED',
              createdAt: '2025-03-14T09:20:00'
            },
            {
              id: 1005,
              orderCode: 'ORD-20250313-001',
              customer: 'David Brown',
              amount: 1250000,
              status: 'PENDING',
              createdAt: '2025-03-13T16:55:00'
            }
          ]);
          
          // Mock activities
          setActivities([
            {
              id: 1,
              action: 'Processed Order #ORD-20250315-001',
              user: 'Staff',
              time: '2025-03-18T09:30:00',
              type: 'success'
            },
            {
              id: 2,
              action: 'Shipped Order #ORD-20250314-003',
              user: 'Staff',
              time: '2025-03-18T08:45:00',
              type: 'processing'
            },
            {
              id: 3,
              action: 'Updated BlindBox Series "Mystery Doll 2025"',
              user: 'Staff',
              time: '2025-03-17T16:20:00',
              type: 'warning'
            },
            {
              id: 4,
              action: 'Added 50 new boxes to inventory',
              user: 'Staff',
              time: '2025-03-17T14:10:00',
              type: 'success'
            },
            {
              id: 5,
              action: 'Created new preorder campaign',
              user: 'Staff',
              time: '2025-03-16T11:30:00',
              type: 'success'
            }
          ]);
          
          // Mock recent campaigns
          setRecentCampaigns([
            {
              id: 101,
              seriesName: 'Mystery Dolls 2025',
              campaignType: 'GROUP',
              startDate: '2025-03-01T00:00:00',
              endDate: '2025-04-15T23:59:59',
              status: 'ACTIVE',
              currentUnits: 156
            },
            {
              id: 102,
              seriesName: 'Summer Collection',
              campaignType: 'MILESTONE',
              startDate: '2025-03-10T00:00:00',
              endDate: '2025-05-10T23:59:59',
              status: 'ACTIVE',
              currentUnits: 89
            },
            {
              id: 103,
              seriesName: 'Spring Edition',
              campaignType: 'GROUP',
              startDate: '2025-02-15T00:00:00',
              endDate: '2025-03-31T23:59:59',
              status: 'ENDING_SOON',
              currentUnits: 213
            }
          ]);
          
          setLoading(false);
        }, 1000);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Orders table columns
  const orderColumns = [
    {
      title: 'Order ID',
      dataIndex: 'orderCode',
      key: 'orderCode',
      render: (text) => <Link to={`/dashboard/orders/${text}`}>{text}</Link>,
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `${amount.toLocaleString()} ₫`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'default';
        if (status === 'PENDING') color = 'orange';
        else if (status === 'PROCESSING') color = 'blue';
        else if (status === 'SHIPPED') color = 'cyan';
        else if (status === 'DELIVERED') color = 'green';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button size="small" type="primary">
          Process
        </Button>
      ),
    },
  ];

  // Campaign table columns
  const campaignColumns = [
    {
      title: 'Series',
      dataIndex: 'seriesName',
      key: 'seriesName',
      render: (text, record) => <Link to={`/dashboard/campaigns/${record.id}`}>{text}</Link>,
    },
    {
      title: 'Type',
      dataIndex: 'campaignType',
      key: 'campaignType',
      render: (type) => (
        <Tag color={type === 'GROUP' ? 'orange' : 'green'}>{type}</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'default';
        if (status === 'ACTIVE') color = 'green';
        else if (status === 'ENDING_SOON') color = 'orange';
        else if (status === 'ENDED') color = 'red';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Units',
      dataIndex: 'currentUnits',
      key: 'currentUnits',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button size="small" type="primary">
          Manage
        </Button>
      ),
    },
  ];

  return (
    <div className="staff-dashboard">
      <div className="dashboard-header-section">
        <Row gutter={[16, 16]} justify="space-between" align="middle">
          <Col>
            <Title level={2}>Staff Dashboard</Title>
            <Text type="secondary">Welcome to POP MART staff portal</Text>
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
            <div className="dashboard-stat-icon" style={{ color: '#faad14' }}>
              <ClockCircleOutlined />
            </div>
            <Statistic title="Pending Orders" value={stats.pendingOrders} loading={loading} />
            <div className="mt-3">
              <Text type="secondary">
                Requires attention
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card hoverable className="dashboard-stat-card">
            <div className="dashboard-stat-icon" style={{ color: '#52c41a' }}>
              <ShoppingOutlined />
            </div>
            <Statistic title="Shipped Orders" value={stats.shippedOrders} loading={loading} />
            <div className="mt-3">
              <Text type="secondary">
                <span className="text-green-500">+14</span> this week
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card hoverable className="dashboard-stat-card">
            <div className="dashboard-stat-icon" style={{ color: '#1890ff' }}>
              <AppstoreOutlined />
            </div>
            <Statistic title="Total Preorders" value={stats.totalPreorders} loading={loading} />
            <div className="mt-3">
              <Text type="secondary">
                <span className="text-green-500">+5</span> this week
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card hoverable className="dashboard-stat-card">
            <div className="dashboard-stat-icon" style={{ color: '#f5222d' }}>
              <GiftOutlined />
            </div>
            <Statistic title="Pending Preorders" value={stats.pendingPreorders} loading={loading} />
            <div className="mt-3">
              <Text type="secondary">
                Awaiting processing
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card hoverable className="dashboard-stat-card">
            <div className="dashboard-stat-icon" style={{ color: '#722ed1' }}>
              <CalendarOutlined />
            </div>
            <Statistic title="Active Campaigns" value={stats.activeCampaigns} loading={loading} />
            <div className="mt-3">
              <Text type="secondary">
                Currently running
              </Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card hoverable className="dashboard-stat-card">
            <div className="dashboard-stat-icon" style={{ color: '#13c2c2' }}>
              <FileSearchOutlined />
            </div>
            <Statistic title="Reports" value="View" loading={loading} />
            <div className="mt-3">
              <Link to="/dashboard/reports">
                <Text type="secondary" className="hover:text-blue-500">
                  Access reports
                </Text>
              </Link>
            </div>
          </Card>
        </Col>
      </Row>
      
      {/* Active Campaigns */}
      <Card 
        title="Active Campaigns" 
        className="mt-6"
        extra={
          <Link to="/dashboard/blindboxes/list">
            <Button type="link" icon={<RightOutlined />}>
              View All Campaigns
            </Button>
          </Link>
        }
      >
        <Table 
          columns={campaignColumns} 
          dataSource={recentCampaigns}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Card>
      
      {/* Recent Orders */}
      <Row gutter={[16, 16]} className="mt-6">
        <Col xs={24} lg={16}>
          <Card 
            title="Recent Orders" 
            extra={
              <Link to="/dashboard/orders">
                <Button type="link" icon={<RightOutlined />}>
                  View All Orders
                </Button>
              </Link>
            }
          >
            <Table 
              columns={orderColumns} 
              dataSource={recentOrders}
              rowKey="id"
              loading={loading}
              pagination={false}
            />
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card title="Recent Activities">
            <Timeline
              loading={loading}
              items={activities.map(activity => ({
                color: activity.type === 'success' ? 'green' : 
                       activity.type === 'processing' ? 'blue' : 'orange',
                children: (
                  <>
                    <div>{activity.action}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(activity.time).toLocaleString()}
                    </div>
                  </>
                )
              }))}
            />
          </Card>
        </Col>
      </Row>
      
      {/* Quick Actions */}
      <Row gutter={[16, 16]} className="mt-6">
        <Col span={24}>
          <Card title="Quick Actions">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6} lg={4}>
                <Button 
                  type="primary" 
                  icon={<ShoppingOutlined />}
                  block
                  onClick={() => window.location.href = '/dashboard/orders?status=PENDING'}
                >
                  Process Orders
                </Button>
              </Col>
              <Col xs={24} sm={12} md={6} lg={4}>
                <Button 
                  type="default" 
                  icon={<AppstoreOutlined />}
                  block
                  onClick={() => window.location.href = '/dashboard/preorders'}
                >
                  Manage Preorders
                </Button>
              </Col>
              <Col xs={24} sm={12} md={6} lg={4}>
                <Button 
                  type="default" 
                  icon={<GiftOutlined />}
                  block
                  onClick={() => window.location.href = '/dashboard/blindboxes/list'}
                >
                  Manage Blindboxes
                </Button>
              </Col>
              <Col xs={24} sm={12} md={6} lg={4}>
                <Button 
                  type="default" 
                  icon={<CalendarOutlined />}
                  block
                  onClick={() => window.location.href = '/dashboard/campaigns/create'}
                >
                  Create Campaign
                </Button>
              </Col>
              <Col xs={24} sm={12} md={6} lg={4}>
                <Button 
                  type="default" 
                  icon={<PlusOutlined />}
                  block
                  onClick={() => window.location.href = '/dashboard/blindboxes/create'}
                >
                  Create Blindbox
                </Button>
              </Col>
              <Col xs={24} sm={12} md={6} lg={4}>
                <Button 
                  type="default" 
                  icon={<FileSearchOutlined />}
                  block
                  onClick={() => window.location.href = '/dashboard/reports'}
                >
                  View Reports
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StaffDashboard;