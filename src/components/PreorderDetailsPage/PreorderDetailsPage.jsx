import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Button,
  Typography,
  Descriptions,
  Steps,
  Divider,
  Timeline,
  Spin,
  Breadcrumb,
  Alert,
  Tag,
  Image,
  Table,
  Empty,
  Space,
  Progress,
  Badge,
} from "antd";
import {
  HomeOutlined,
  ShoppingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileDoneOutlined,
  CreditCardOutlined,
  ShoppingCartOutlined,
  LoadingOutlined,
  ClockCircleOutlined,
  UserOutlined,
  HistoryOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  FileSearchOutlined,
  GiftOutlined,
  InfoCircleOutlined,
  RightOutlined,
} from "@ant-design/icons";
import useAuth from "../../hooks/useAuth";
import preorderService from "../../api/services/preorderService";
import dayjs from "dayjs";
import "./PreorderPage.css";

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

/**
 * PreorderDetailsPage component for displaying details of a specific preorder
 *
 * @returns {JSX.Element} The PreorderDetailsPage component
 */
const PreorderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [preorderDetails, setPreorderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch preorder details on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchPreorderDetails();
    } else {
      navigate("/login");
    }
  }, [isAuthenticated, id, navigate]);

  const fetchPreorderDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await preorderService.getPreorderDetails(id);
      if (response && response.status === true && response.metadata) {
        setPreorderDetails(response.metadata);
      } else {
        throw new Error("Failed to load preorder details");
      }
    } catch (err) {
      console.error("Error fetching preorder details:", err);
      setError(
        err.message || "An error occurred while fetching preorder details"
      );
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get current step based on preorder status
  const getCurrentStep = (status) => {
    switch (status) {
      case "PENDING":
        return 0;
      case "PAID":
        return 1;
      case "PROCESSING":
        return 2;
      case "SHIPPING":
        return 3;
      case "COMPLETED":
        return 4;
      case "CANCELLED":
      case "EXPIRED":
        return 5;
      default:
        return 0;
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
          <Tag icon={<CloseCircleOutlined />} color="default">
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

  // Function to format timestamp
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    return dayjs(timestamp).format("MMM D, YYYY h:mm A");
  };

  // Define columns for items table
  const itemColumns = [
    {
      title: "Product",
      dataIndex: "product",
      key: "product",
      render: (_, record) => (
        <div className="flex items-center">
          <Image
            src={record.blindboxSeries.seriesImageUrls?.[0] || "https://placehold.co/80x80?text=No+Image"}
            alt={record.blindboxSeries.seriesName}
            width={60}
            height={60}
            preview={false}
            fallback="https://placehold.co/80x80?text=No+Image"
            className="mr-4"
          />
          <div>
            <Link to={`/blindbox/${record.blindboxSeries.id}`} className="font-medium hover:underline">
              {record.blindboxSeries.seriesName}
            </Link>
            <div className="mt-1">
              <Tag color={record.productType === "PACKAGE" ? "purple" : "blue"}>
                {record.productType === "PACKAGE" ? "Package" : "Single Box"}
              </Tag>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Original Price",
      dataIndex: "originalPrice",
      key: "originalPrice",
      render: (price) => (
        <Text type="secondary">{Number(price).toLocaleString()} ₫</Text>
      ),
    },
    {
      title: "Locked Price",
      dataIndex: "lockedPrice",
      key: "lockedPrice",
      render: (price) => (
        <Text strong>{Number(price).toLocaleString()} ₫</Text>
      ),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (qty) => <Text>{qty}</Text>,
    },
    {
      title: "Subtotal",
      dataIndex: "subtotal",
      key: "subtotal",
      render: (_, record) => (
        <Text className="text-red-600 font-medium">
          {Number(record.lockedPrice * record.quantity).toLocaleString()} ₫
        </Text>
      ),
    },
  ];

  // Define columns for products table (the revealed items)
  const productColumns = [
    {
      title: "Product",
      dataIndex: "product",
      key: "product",
      render: (_, record) => (
        <div className="flex items-center">
          <Image
            src={record.revealedItem?.imageUrls?.[0] || "https://placehold.co/80x80?text=No+Image"}
            alt={record.revealedItem?.itemName || record.alias}
            width={50}
            height={50}
            preview={false}
            fallback="https://placehold.co/80x80?text=No+Image"
            className="mr-3"
          />
          <div>
            <Text strong>{record.revealedItem?.itemName || "Mystery Item"}</Text>
            <div className="mt-1">
              <Text type="secondary">{record.alias || `Product #${record.id}`}</Text>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Rarity",
      dataIndex: "rarity",
      key: "rarity",
      render: (_, record) => (
        record.revealedItem?.itemChance ? (
          <Tag color={
            record.revealedItem.itemChance <= 5 ? "red" : 
            record.revealedItem.itemChance <= 15 ? "orange" : 
            record.revealedItem.itemChance <= 25 ? "blue" : "green"
          }>
            {record.revealedItem.itemChance}% chance
          </Tag>
        ) : (
          <Tag color="default">Unknown</Tag>
        )
      ),
    },
  ];

  // Define columns for payments table
  const paymentColumns = [
    {
      title: "Payment Type",
      dataIndex: "type",
      key: "type",
      render: (_, record) => (
        <Space>
          {record.deposit ? (
            <Tag color="orange">Deposit (50%)</Tag>
          ) : (
            <Tag color="green">Final Payment</Tag>
          )}
        </Space>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount) => (
        <Text strong>{Number(amount).toLocaleString()} ₫</Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        switch (status) {
          case "PENDING":
            return <Tag color="warning">Pending</Tag>;
          case "COMPLETED":
            return <Tag color="success">Completed</Tag>;
          case "FAILED":
            return <Tag color="error">Failed</Tag>;
          default:
            return <Tag color="default">{status}</Tag>;
        }
      },
    },
    {
      title: "Date",
      dataIndex: "issuedAt",
      key: "issuedAt",
      render: (date) => formatDate(date),
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

  // If loading, show loading indicator
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Breadcrumb className="mb-6">
          <Breadcrumb.Item>
            <Link to="/">
              <HomeOutlined /> Home
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/account/preorders">
              <HistoryOutlined /> Preorder History
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <LoadingOutlined /> Loading...
          </Breadcrumb.Item>
        </Breadcrumb>

        <div className="loading-container">
          <Spin size="large" />
          <Text className="mt-4">Loading preorder details...</Text>
        </div>
      </div>
    );
  }

  // If error, show error message
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Breadcrumb className="mb-6">
          <Breadcrumb.Item>
            <Link to="/">
              <HomeOutlined /> Home
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/account/preorders">
              <HistoryOutlined /> Preorder History
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Error</Breadcrumb.Item>
        </Breadcrumb>

        <Alert
          message="Error Loading Preorder Details"
          description={error}
          type="error"
          showIcon
          action={
            <Button type="primary" onClick={fetchPreorderDetails} danger>
              Try Again
            </Button>
          }
        />
      </div>
    );
  }

  // If no preorder details, show message
  if (!preorderDetails) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Breadcrumb className="mb-6">
          <Breadcrumb.Item>
            <Link to="/">
              <HomeOutlined /> Home
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/account/preorders">
              <HistoryOutlined /> Preorder History
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Not Found</Breadcrumb.Item>
        </Breadcrumb>

        <Card>
          <Empty
            description={
              <div>
                <Title level={4}>Preorder Not Found</Title>
                <Text type="secondary">
                  The preorder you are looking for does not exist or you don't have permission to view it.
                </Text>
              </div>
            }
          >
            <Button
              type="primary"
              onClick={() => navigate("/account/preorders")}
              className="mt-4 bg-black hover:bg-gray-800"
            >
              Back to Preorder History
            </Button>
          </Empty>
        </Card>
      </div>
    );
  }

  // Calculate payment progress
  const totalPayable = preorderDetails.totalAmount || preorderDetails.estimatedTotalAmount;
  const totalPaid = preorderDetails.payments
    .filter(payment => payment.status === "COMPLETED")
    .reduce((sum, payment) => sum + payment.amount, 0);
  const paymentProgress = totalPayable > 0 ? Math.min(100, (totalPaid / totalPayable) * 100) : 0;

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
          <Link to="/account/preorders">
            <HistoryOutlined /> Preorder History
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Order {preorderDetails.orderCode}</Breadcrumb.Item>
      </Breadcrumb>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <Title level={2} className="mb-0">
          Preorder #{preorderDetails.orderCode}
        </Title>
        <div className="mt-2 md:mt-0">
          {renderStatusTag(preorderDetails.preorderStatus)}
        </div>
      </div>

      {/* Preorder Status Steps */}
      <Card className="mb-6">
        <Steps
          current={getCurrentStep(preorderDetails.preorderStatus)}
          className="preorder-steps"
          items={[
            {
              title: "Deposit Paid",
              icon: <CreditCardOutlined />,
            },
            {
              title: "Campaign Ended",
              icon: <FileDoneOutlined />,
            },
            {
              title: "Final Payment",
              icon: <DollarOutlined />,
            },
            {
              title: "Processing",
              icon: <ShoppingOutlined />,
            },
            {
              title: "Completed",
              icon: <CheckCircleOutlined />,
              status: preorderDetails.preorderStatus === "CANCELLED" || preorderDetails.preorderStatus === "EXPIRED" ? "error" : undefined,
            },
          ]}
        />
      </Card>

      {/* Main Content */}
      <Row gutter={[32, 24]}>
        <Col xs={24} lg={16}>
          {/* Order Summary */}
          <Card className="mb-6">
            <Title level={4}>Preorder Summary</Title>
            <Descriptions bordered column={1} className="mt-4">
              <Descriptions.Item label="Order Code" span={1}>{preorderDetails.orderCode}</Descriptions.Item>
              <Descriptions.Item label="Customer">{preorderDetails.username}</Descriptions.Item>
              <Descriptions.Item label="Phone Number">
                <PhoneOutlined className="mr-2" />
                {preorderDetails.phoneNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Shipping Address">
                <EnvironmentOutlined className="mr-2" />
                {preorderDetails.userAddress}
              </Descriptions.Item>
              <Descriptions.Item label="Preorder Status">
                {renderStatusTag(preorderDetails.preorderStatus)}
              </Descriptions.Item>
              <Descriptions.Item label="Created On">{formatDate(preorderDetails.createdAt)}</Descriptions.Item>
              {preorderDetails.deliveryCode && (
                <Descriptions.Item label="Delivery Code">{preorderDetails.deliveryCode}</Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {/* Preorder Items */}
          <Card className="mb-6">
            <Title level={4}>Preorder Items</Title>
            <Table
              columns={itemColumns}
              dataSource={preorderDetails.items.map((item, index) => ({...item, key: index}))}
              pagination={false}
              className="mt-4"
            />
          </Card>

          {/* Revealed Products (if any) */}
          {preorderDetails.items.some(item => item.products && item.products.length > 0) && (
            <Card className="mb-6">
              <Title level={4}>Revealed Products</Title>
              {preorderDetails.items.map((item, itemIndex) => (
                item.products && item.products.length > 0 && (
                  <div key={`item-${itemIndex}`} className="mb-6">
                    <div className="bg-gray-50 p-3 mb-3 rounded">
                      <Text strong>{item.blindboxSeries.seriesName}</Text>
                      <Text className="ml-2">({item.quantity} {item.productType.toLowerCase()})</Text>
                    </div>
                    <Table
                      columns={productColumns}
                      dataSource={item.products.map((product, productIndex) => ({...product, key: `${itemIndex}-${productIndex}`}))}
                      pagination={false}
                      size="small"
                    />
                  </div>
                )
              ))}
            </Card>
          )}

          {/* Payment History */}
          <Card>
            <Title level={4}>Payment History</Title>
            <Table
              columns={paymentColumns}
              dataSource={preorderDetails.payments.map((payment, index) => ({...payment, key: index}))}
              pagination={false}
              className="mt-4"
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          {/* Order Summary Card */}
          <Card className="preorder-summary-card mb-6">
            <Title level={4}>Payment Summary</Title>
            <Divider />
            
            {/* Payment progress */}
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <Text>Payment Progress</Text>
                <Text strong>{paymentProgress.toFixed(0)}%</Text>
              </div>
              <Progress 
                percent={paymentProgress} 
                status={
                  preorderDetails.preorderStatus === "CANCELLED" || preorderDetails.preorderStatus === "EXPIRED" 
                    ? "exception" 
                    : paymentProgress >= 100 
                      ? "success" 
                      : "active"
                }
                showInfo={false}
              />
            </div>
            
            <div className="payment-summary-row">
              <Text>Estimated Total:</Text>
              <Text>{Number(preorderDetails.estimatedTotalAmount).toLocaleString()} ₫</Text>
            </div>
            
            <div className="payment-summary-row">
              <Text>Total Amount:</Text>
              <Text strong className="text-red-600">
                {Number(preorderDetails.totalAmount).toLocaleString()} ₫
              </Text>
            </div>
            
            <div className="payment-summary-row">
              <Text>Deposit Amount (50%):</Text>
              <Text>{Number(preorderDetails.depositAmount).toLocaleString()} ₫</Text>
            </div>
            
            <div className="payment-summary-row">
              <Text>Remaining Amount:</Text>
              <Text>{Number(preorderDetails.remainingAmount).toLocaleString()} ₫</Text>
            </div>
            
            <div className="payment-summary-row">
              <Text strong>Amount Paid:</Text>
              <Text strong className="text-green-600">
                {Number(totalPaid).toLocaleString()} ₫
              </Text>
            </div>
            
            <div className="payment-summary-row">
              <Text strong>Balance Due:</Text>
              <Text strong className={totalPayable - totalPaid > 0 ? "text-red-600" : "text-green-600"}>
                {Number(Math.max(0, totalPayable - totalPaid)).toLocaleString()} ₫
              </Text>
            </div>
            
            <Divider />
            
            {/* Payment actions */}
            {preorderDetails.preorderStatus === "PENDING" && totalPayable > totalPaid && (
              <Button 
                type="primary" 
                block 
                size="large"
                className="mt-2 bg-red-600 hover:bg-red-700 h-12"
                icon={<CreditCardOutlined />}
                onClick={() => navigate("/checkout")}
              >
                Make Payment
              </Button>
            )}
            
            <Button 
              block 
              size="large"
              className="mt-4 h-12"
              icon={<ShoppingOutlined />}
              onClick={() => navigate("/blindbox")}
            >
              Continue Shopping
            </Button>
          </Card>

          {/* Preorder Timeline */}
          <Card className="mb-6">
            <Title level={4}>Preorder Timeline</Title>
            <Timeline
              className="mt-4"
              items={[
                {
                  dot: <Badge status="success" />,
                  children: (
                    <>
                      <Text strong>Preorder Created</Text>
                      <div>
                        <Text type="secondary">{formatDate(preorderDetails.createdAt)}</Text>
                      </div>
                    </>
                  ),
                },
                {
                  dot: <Badge status={preorderDetails.payments.some(p => p.deposit && p.status === "COMPLETED") ? "success" : "wait"} />,
                  children: (
                    <>
                      <Text strong>Deposit Payment</Text>
                      <div>
                        <Text type="secondary">
                          {preorderDetails.payments.some(p => p.deposit && p.status === "COMPLETED")
                            ? formatDate(preorderDetails.payments.find(p => p.deposit && p.status === "COMPLETED")?.issuedAt)
                            : "Pending"}
                        </Text>
                      </div>
                    </>
                  ),
                },
                {
                  dot: <Badge status={preorderDetails.preorderStatus === "PAID" || preorderDetails.preorderStatus === "PROCESSING" || preorderDetails.preorderStatus === "SHIPPING" || preorderDetails.preorderStatus === "COMPLETED" ? "success" : "wait"} />,
                  children: (
                    <>
                      <Text strong>Final Payment</Text>
                      <div>
                        <Text type="secondary">
                          {preorderDetails.payments.some(p => !p.deposit && p.status === "COMPLETED")
                            ? formatDate(preorderDetails.payments.find(p => !p.deposit && p.status === "COMPLETED")?.issuedAt)
                            : "Pending"}
                        </Text>
                      </div>
                    </>
                  ),
                },
                {
                  dot: <Badge status={preorderDetails.preorderStatus === "SHIPPING" || preorderDetails.preorderStatus === "COMPLETED" ? "success" : "wait"} />,
                  children: (
                    <>
                      <Text strong>Shipping</Text>
                      <div>
                        <Text type="secondary">
                          {preorderDetails.preorderStatus === "SHIPPING" || preorderDetails.preorderStatus === "COMPLETED"
                            ? "Your order has been shipped"
                            : "Pending"}
                        </Text>
                      </div>
                    </>
                  ),
                },
                {
                  dot: <Badge status={preorderDetails.preorderStatus === "COMPLETED" ? "success" : preorderDetails.preorderStatus === "CANCELLED" || preorderDetails.preorderStatus === "EXPIRED" ? "error" : "wait"} />,
                  children: (
                    <>
                      <Text strong>
                        {preorderDetails.preorderStatus === "CANCELLED" || preorderDetails.preorderStatus === "EXPIRED"
                          ? "Order Cancelled"
                          : "Delivery Completed"}
                      </Text>
                      <div>
                        <Text type="secondary">
                          {preorderDetails.preorderStatus === "COMPLETED"
                            ? "Your order has been delivered"
                            : preorderDetails.preorderStatus === "CANCELLED" || preorderDetails.preorderStatus === "EXPIRED"
                              ? "Your order was cancelled"
                              : "Pending"}
                        </Text>
                      </div>
                    </>
                  ),
                },
              ]}
            />
          </Card>

          {/* Help & Support */}
          <Card>
            <Title level={4}>Need Help?</Title>
            <Paragraph>
              If you have any questions or need assistance with your preorder, please contact our customer support.
            </Paragraph>
            <div className="grid grid-cols-1 gap-4">
              <Button type="default" icon={<InfoCircleOutlined />} block>
                View FAQs
              </Button>
              <Button type="default" icon={<PhoneOutlined />} block>
                Contact Support
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PreorderDetailsPage;