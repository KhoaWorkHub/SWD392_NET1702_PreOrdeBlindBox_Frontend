import { useState, useEffect } from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Button,
  Typography,
  Result,
  Descriptions,
  Steps,
  Divider,
  Timeline,
  Spin,
  Breadcrumb,
  Alert,
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
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

/**
 * OrderConfirmationPage component for displaying order status after payment
 *
 * @returns {JSX.Element} The OrderConfirmationPage component
 */
const OrderConfirmationPage = () => {
  const { preorderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);

  // Parse URL query parameters to determine payment status
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const status = queryParams.get("status");
    
    // Set payment status from URL params
    if (status === "success") {
      setPaymentStatus("success");
    } else if (status === "pending") {
      setPaymentStatus("pending");
    } else if (status === "failed") {
      setPaymentStatus("failed");
    } else {
      // Default to pending if no status provided
      setPaymentStatus("pending");
    }
    
    // Simulate API call to fetch order details
    // In a real implementation, you would call your API to get the order status
    setTimeout(() => {
      // Mock data for demonstration
      setOrderDetails({
        id: preorderId,
        date: new Date().toISOString(),
        status: status === "success" ? "PAID" : status === "failed" ? "FAILED" : "PENDING",
        amount: 1250000,
        paymentMethod: "VNPAY",
        customerName: "John Doe",
        phoneNumber: "0123456789",
        shippingAddress: "123 Sample Street, District 1, Ho Chi Minh City",
        estimatedDelivery: "3-5 business days",
      });
      setLoading(false);
    }, 1500);
    
  }, [location.search, preorderId]);

  // Get status display configurations
  const getStatusConfig = () => {
    switch (paymentStatus) {
      case "success":
        return {
          icon: <CheckCircleOutlined className="text-green-500" />,
          title: "Payment Successful",
          subTitle: "Your order has been confirmed and will be shipped soon",
          status: "success",
          color: "green",
        };
      case "pending":
        return {
          icon: <ClockCircleOutlined className="text-orange-500" />,
          title: "Payment Pending",
          subTitle: "Your payment is being processed. We'll update you when it's confirmed",
          status: "info",
          color: "orange",
        };
      case "failed":
        return {
          icon: <CloseCircleOutlined className="text-red-500" />,
          title: "Payment Failed",
          subTitle: "There was an issue with your payment. Please try again",
          status: "error",
          color: "red",
        };
      default:
        return {
          icon: <LoadingOutlined className="text-blue-500" />,
          title: "Checking Payment Status",
          subTitle: "Please wait while we check your payment status",
          status: "info",
          color: "blue",
        };
    }
  };

  // Get current step based on payment status
  const getCurrentStep = () => {
    switch (paymentStatus) {
      case "success":
        return 2;
      case "pending":
        return 1;
      case "failed":
        return 1;
      default:
        return 0;
    }
  };

  const statusConfig = getStatusConfig();

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Spin 
          size="large" 
          indicator={<LoadingOutlined spin />} 
          tip="Loading order details..."
        />
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
          <Link to="/checkout">Checkout</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Order Confirmation</Breadcrumb.Item>
      </Breadcrumb>

      {/* Order Status Steps */}
      <Steps
        current={getCurrentStep()}
        className="mb-8"
        items={[
          {
            title: "Order Placed",
            icon: <ShoppingCartOutlined />,
          },
          {
            title: "Payment Processing",
            icon: <CreditCardOutlined />,
          },
          {
            title: "Order Confirmed",
            icon: <FileDoneOutlined />,
          },
        ]}
      />

      {/* Main Content */}
      <Row gutter={[32, 24]}>
        <Col xs={24} lg={16}>
          {/* Order Status Result */}
          <Card className="mb-6">
            <Result
              icon={statusConfig.icon}
              title={statusConfig.title}
              subTitle={statusConfig.subTitle}
              extra={
                paymentStatus === "failed" ? [
                  <Button 
                    type="primary" 
                    key="retry"
                    onClick={() => navigate("/checkout")}
                    className="bg-black hover:bg-gray-800"
                  >
                    Try Again
                  </Button>,
                  <Button key="cart" onClick={() => navigate("/cart")}>
                    Return to Cart
                  </Button>,
                ] : [
                  <Button 
                    type="primary" 
                    key="orders"
                    onClick={() => navigate("/account/orders")}
                    className="bg-black hover:bg-gray-800"
                  >
                    View My Orders
                  </Button>,
                  <Button key="continue" onClick={() => navigate("/blindbox")}>
                    Continue Shopping
                  </Button>,
                ]
              }
            />
          </Card>

          {/* Order Timeline */}
          <Card className="mb-6">
            <Title level={4}>Order Timeline</Title>
            <Timeline
              items={[
                {
                  color: "green",
                  children: (
                    <>
                      <Text strong>Order Placed</Text>
                      <div>
                        <Text type="secondary">
                          {new Date().toLocaleString()}
                        </Text>
                      </div>
                    </>
                  ),
                },
                {
                  color: paymentStatus === "pending" ? "blue" : 
                         paymentStatus === "success" ? "green" : "red",
                  children: (
                    <>
                      <Text strong>Payment {
                        paymentStatus === "pending" ? "Processing" : 
                        paymentStatus === "success" ? "Completed" : "Failed"
                      }</Text>
                      <div>
                        <Text type="secondary">
                          {new Date().toLocaleString()}
                        </Text>
                      </div>
                    </>
                  ),
                },
                {
                  color: "gray",
                  children: (
                    <>
                      <Text strong>Order Processing</Text>
                      <div>
                        <Text type="secondary">Pending</Text>
                      </div>
                    </>
                  ),
                },
                {
                  color: "gray",
                  children: (
                    <>
                      <Text strong>Order Shipped</Text>
                      <div>
                        <Text type="secondary">Pending</Text>
                      </div>
                    </>
                  ),
                },
                {
                  color: "gray",
                  children: (
                    <>
                      <Text strong>Order Delivered</Text>
                      <div>
                        <Text type="secondary">Pending</Text>
                      </div>
                    </>
                  ),
                },
              ]}
            />
          </Card>

          {/* Shipping Information */}
          <Card>
            <Title level={4}>Shipping Information</Title>
            <Descriptions column={1} bordered className="mt-4">
              <Descriptions.Item label="Customer Name">{orderDetails.customerName}</Descriptions.Item>
              <Descriptions.Item label="Phone Number">{orderDetails.phoneNumber}</Descriptions.Item>
              <Descriptions.Item label="Shipping Address">{orderDetails.shippingAddress}</Descriptions.Item>
              <Descriptions.Item label="Estimated Delivery">{orderDetails.estimatedDelivery}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          {/* Order Summary */}
          <Card className="checkout-summary-card">
            <Title level={4}>Order Summary</Title>
            <Divider />
            
            <div className="checkout-summary-row">
              <Text strong>Order ID:</Text>
              <Text copyable>{orderDetails.id}</Text>
            </div>
            
            <div className="checkout-summary-row">
              <Text strong>Date:</Text>
              <Text>{new Date(orderDetails.date).toLocaleDateString()}</Text>
            </div>
            
            <div className="checkout-summary-row">
              <Text strong>Payment Method:</Text>
              <Text>{orderDetails.paymentMethod}</Text>
            </div>
            
            <div className="checkout-summary-row">
              <Text strong>Status:</Text>
              <Text>
                <span 
                  className={`inline-block px-2 py-1 rounded-full text-xs text-white ${
                    orderDetails.status === 'PAID' ? 'bg-green-500' : 
                    orderDetails.status === 'PENDING' ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                >
                  {orderDetails.status}
                </span>
              </Text>
            </div>
            
            <Divider />
            
            <div className="checkout-summary-row checkout-summary-total">
              <Text strong>Total Amount:</Text>
              <Text strong className="checkout-total-price">
                {Number(orderDetails.amount).toLocaleString()} ₫
              </Text>
            </div>
          </Card>

          {/* Next Steps */}
          <Card className="mt-6">
            <Title level={4}>What's Next?</Title>
            {paymentStatus === "success" && (
              <div>
                <Paragraph>
                  Your order has been confirmed! We're now preparing it for shipment.
                </Paragraph>
                <ol className="pl-5 list-decimal">
                  <li className="mb-2">You'll receive an email confirmation with order details.</li>
                  <li className="mb-2">Once your order is shipped, we'll send you tracking information.</li>
                  <li className="mb-2">You can track your order status in the "My Orders" section.</li>
                </ol>
              </div>
            )}
            
            {paymentStatus === "pending" && (
              <div>
                <Alert
                  message="Your payment is being processed"
                  description="This may take a few minutes. Once confirmed, you'll receive an email with your order details."
                  type="warning"
                  showIcon
                  className="mb-4"
                />
                <Paragraph>
                  Please do not refresh the page. You'll be automatically redirected once the payment is confirmed.
                </Paragraph>
              </div>
            )}
            
            {paymentStatus === "failed" && (
              <div>
                <Alert
                  message="Your payment could not be processed"
                  description="There was an issue with your payment. Please try again or use another payment method."
                  type="error"
                  showIcon
                  className="mb-4"
                />
                <Paragraph>
                  The items in your cart have been saved. You can return to checkout to try again.
                </Paragraph>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default OrderConfirmationPage;