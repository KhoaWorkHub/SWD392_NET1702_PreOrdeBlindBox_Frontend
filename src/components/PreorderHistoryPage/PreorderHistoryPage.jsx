import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Button,
  Typography,
  Table,
  Tag,
  Breadcrumb,
  Empty,
  Spin,
  Alert,
  Tooltip,
} from "antd";
import {
  HomeOutlined,
  ShoppingOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  RightOutlined,
  UserOutlined,
  CreditCardOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import useAuth from "../../hooks/useAuth";
import preorderService from "../../api/services/preorderService";
import "../PreorderDetailsPage/PreorderPage.css";

const { Title, Text } = Typography;

/**
 * PreorderHistoryPage component for displaying a user's preorder history
 * Sorted by ID in descending order (newest first)
 *
 * @returns {JSX.Element} The PreorderHistoryPage component
 */
const PreorderHistoryPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [preorderHistory, setPreorderHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch preorder history on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchPreorderHistory();
    } else {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  const fetchPreorderHistory = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await preorderService.getPreorderHistory();
      if (response && response.status === true && response.metadata) {
        // Sắp xếp preorder theo ID giảm dần (ID lớn nhất lên đầu)
        const sortedPreorders = [...response.metadata].sort((a, b) => b.id - a.id);
        setPreorderHistory(sortedPreorders);
      } else {
        throw new Error("Failed to load preorder history");
      }
    } catch (err) {
      console.error("Error fetching preorder history:", err);
      setError(
        err.message || "An error occurred while fetching your preorder history"
      );
    } finally {
      setLoading(false);
    }
  };

  // Helper function to render preorder status tag
  const renderStatusTag = (status) => {
    switch (status) {
      case "PENDING":
        return (
          <Tag icon={<ClockCircleOutlined />} color="warning">
            Pending
          </Tag>
        );
      case "PAID":
        return (
          <Tag icon={<CheckCircleOutlined />} color="success">
            Paid
          </Tag>
        );
      case "COMPLETED":
        return (
          <Tag icon={<CheckCircleOutlined />} color="green">
            Completed
          </Tag>
        );
      case "PROCESSING":
        return (
          <Tag icon={<ClockCircleOutlined />} color="processing">
            Processing
          </Tag>
        );
      case "SHIPPING":
        return (
          <Tag icon={<ShoppingOutlined />} color="blue">
            Shipping
          </Tag>
        );
      case "CANCELLED":
        return (
          <Tag icon={<CloseCircleOutlined />} color="error">
            Cancelled
          </Tag>
        );
      case "EXPIRED":
        return (
          <Tag icon={<ExclamationCircleOutlined />} color="default">
            Expired
          </Tag>
        );
      default:
        return (
          <Tag color="default">
            {status || "Unknown"}
          </Tag>
        );
    }
  };

  // Define columns for the preorder history table
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (id) => <Text strong>#{id}</Text>,
    },
    {
      title: "Order Code",
      dataIndex: "orderCode",
      key: "orderCode",
      render: (text) => <Text>{text}</Text>,
    },
    {
      title: "Status",
      dataIndex: "preorderStatus",
      key: "preorderStatus",
      render: (status) => renderStatusTag(status),
    },
    {
      title: "Estimated Total",
      dataIndex: "estimatedTotalAmount",
      key: "estimatedTotalAmount",
      render: (amount) => (
        <Text>{Number(amount).toLocaleString()} ₫</Text>
      ),
    },
    {
      title: "Total Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (amount) => (
        <Text strong className="text-red-600">
          {amount ? Number(amount).toLocaleString() : "Not Finalized"} {amount ? "₫" : ""}
        </Text>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          onClick={() => navigate(`/account/preorders/${record.id}`)}
          className="bg-black hover:bg-gray-800"
        >
          View Details
        </Button>
      ),
    },
  ];

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
        <Breadcrumb.Item>
          <HistoryOutlined /> Preorder History
        </Breadcrumb.Item>
      </Breadcrumb>

      <Title level={2} className="mb-6">
        My Preorders
      </Title>

      {/* Account Navigation */}
      <div className="account-nav mb-8">
        <Row gutter={16}>
          <Col xs={8} md={4}>
            <Link to="/account/profile">
              <Card
                className="account-nav-card text-center p-2 hover:shadow-md transition-shadow"
                bordered={false}
              >
                <UserOutlined className="text-xl mb-1" />
                <div className="text-sm">Profile</div>
              </Card>
            </Link>
          </Col>
          <Col xs={8} md={4}>
            <Link to="/account/orders">
              <Card
                className="account-nav-card text-center p-2 hover:shadow-md transition-shadow"
                bordered={false}
              >
                <ShoppingOutlined className="text-xl mb-1" />
                <div className="text-sm">Orders</div>
              </Card>
            </Link>
          </Col>
          <Col xs={8} md={4}>
            <Link to="/account/preorders">
              <Card
                className="account-nav-card text-center p-2 hover:shadow-md transition-shadow active"
                bordered={false}
              >
                <HistoryOutlined className="text-xl mb-1" />
                <div className="text-sm">Preorders</div>
              </Card>
            </Link>
          </Col>
          <Col xs={8} md={4}>
            <Link to="/account/payments">
              <Card
                className="account-nav-card text-center p-2 hover:shadow-md transition-shadow"
                bordered={false}
              >
                <CreditCardOutlined className="text-xl mb-1" />
                <div className="text-sm">Payments</div>
              </Card>
            </Link>
          </Col>
        </Row>
      </div>

      {/* Preorder History Content */}
      {loading ? (
        <div className="loading-container">
          <Spin size="large" />
          <Text className="mt-4">Loading your preorder history...</Text>
        </div>
      ) : error ? (
        <div className="error-container">
          <Alert
            message="Error Loading Preorder History"
            description={error}
            type="error"
            showIcon
            action={
              <Button type="primary" onClick={fetchPreorderHistory} danger>
                Try Again
              </Button>
            }
          />
        </div>
      ) : preorderHistory.length === 0 ? (
        <Card className="empty-card">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div>
                <Title level={4}>No Preorders Found</Title>
                <Text type="secondary">
                  You haven't placed any preorders yet.
                </Text>
              </div>
            }
          >
            <Button
              type="primary"
              size="large"
              onClick={() => navigate("/blindbox")}
              icon={<ShoppingOutlined />}
              className="bg-black hover:bg-gray-800 mt-4"
            >
              Explore Blind Boxes
            </Button>
          </Empty>
        </Card>
      ) : (
        <>
          <Card className="preorder-history-card">
            <div className="flex justify-between items-center mb-4">
              <Title level={4} className="mb-0">
                Recent Preorders
              </Title>
              <Tooltip title="A preorder requires a deposit of 50% upfront and the remaining balance when the campaign ends.">
                <Button type="link" className="flex items-center">
                  What is a preorder? <RightOutlined className="ml-1" />
                </Button>
              </Tooltip>
            </div>

            <Table
              columns={columns}
              dataSource={preorderHistory.map(item => ({...item, key: item.id}))}
              pagination={
                preorderHistory.length > 10
                  ? { pageSize: 10, showSizeChanger: false }
                  : false
              }
              className="preorder-history-table"
            />
          </Card>

          {/* Help Section */}
          <Card className="mt-6 bg-gray-50">
            <Title level={5}>About Preorders</Title>
            <Text className="block mb-4">
              Preorders are part of our GROUP campaigns, where you pay a 50% deposit upfront and the remaining balance after the campaign ends.
            </Text>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}>
                <div className="text-center p-4">
                  <div className="mb-2 flex justify-center">
                    <CreditCardOutlined className="text-2xl text-blue-500" />
                  </div>
                  <Title level={5}>Deposit</Title>
                  <Text type="secondary">
                    Pay 50% of the product price as a deposit to secure your preorder.
                  </Text>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="text-center p-4">
                  <div className="mb-2 flex justify-center">
                    <ClockCircleOutlined className="text-2xl text-orange-500" />
                  </div>
                  <Title level={5}>Campaign End</Title>
                  <Text type="secondary">
                    Wait until the campaign ends to see the final price based on tier reached.
                  </Text>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="text-center p-4">
                  <div className="mb-2 flex justify-center">
                    <CheckCircleOutlined className="text-2xl text-green-500" />
                  </div>
                  <Title level={5}>Final Payment</Title>
                  <Text type="secondary">
                    Pay the remaining balance within 14 days after the campaign ends.
                  </Text>
                </div>
              </Col>
            </Row>
          </Card>
        </>
      )}
    </div>
  );
};

export default PreorderHistoryPage;