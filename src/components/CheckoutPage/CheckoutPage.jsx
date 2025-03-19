import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Button,
  Typography,
  Form,
  Input,
  Steps,
  Divider,
  Table,
  Image,
  Tag,
  Alert,
  Breadcrumb,
  Spin,
  Space,
  message,
  Radio,
} from "antd";
import {
  HomeOutlined,
  ShoppingCartOutlined,
  CreditCardOutlined,
  SafetyOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  RightOutlined,
  UserOutlined,
  ShoppingOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import useCart from "../../hooks/useCart";
import useAuth from "../../hooks/useAuth";
import checkoutService from "../../api/services/checkoutService";
import "./CheckoutPage.css";

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

/**
 * CheckoutPage component for processing orders and payments
 *
 * @returns {JSX.Element} The CheckoutPage component
 */
const CheckoutPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { cartItems, totalPrice, itemCount, loading: cartLoading } = useCart();
  
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [contactInfo, setContactInfo] = useState(null);
  
  // State for checkout information
  const [checkoutInfo, setCheckoutInfo] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  
  // Protect this route for authenticated users only
  useEffect(() => {
    if (!isAuthenticated) {
      message.warning("Please login to checkout");
      navigate("/login");
    }
    
    if (cartItems.length === 0 && !cartLoading) {
      message.warning("Your cart is empty");
      navigate("/cart");
    }
  }, [isAuthenticated, cartItems, cartLoading, navigate]);

  // Fetch checkout information when component loads
  useEffect(() => {
    if (isAuthenticated && cartItems.length > 0 && !cartLoading) {
      fetchCheckoutInfo();
    }
  }, [isAuthenticated, cartItems, cartLoading]);

  // Function to fetch checkout information
  const fetchCheckoutInfo = async () => {
    try {
      setCheckoutLoading(true);
      const response = await checkoutService.getCheckoutInfo();
      
      if (response && response.metadata) {
        setCheckoutInfo(response.metadata);
        setCheckoutError(null);
      } else {
        console.error('Unexpected response format:', response);
        setCheckoutError('Invalid checkout data format');
      }
    } catch (err) {
      console.error('Error fetching checkout information:', err);
      setCheckoutError(err.message || 'Failed to load checkout information');
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Helper functions for checkout calculations
  const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString() + " ₫";
  };

  // Calculate the total items discounted price from checkout items
  const calculateItemsTotal = () => {
    if (checkoutInfo && checkoutInfo.items && checkoutInfo.items.length > 0) {
      return checkoutInfo.items.reduce((total, item) => total + (item.discountedTotalPrice || 0), 0);
    }
    return totalPrice;
  };

  // Calculate total amount (if null)
  const calculateTotal = () => {
    if (checkoutInfo) {
      // Use estimatedTotalAmount if available
      if (checkoutInfo.estimatedTotalAmount) {
        return checkoutInfo.estimatedTotalAmount;
      }
      // Fall back to totalAmount if available
      if (checkoutInfo.totalAmount) {
        return checkoutInfo.totalAmount;
      }
      // As last resort, use the sum of item prices
      return calculateItemsTotal();
    }
    return totalPrice;
  };

  // Calculate remaining amount (if null)
  const calculateRemainingAmount = () => {
    if (checkoutInfo) {
      // If remainingAmount is provided, use it
      if (checkoutInfo.remainingAmount !== null && checkoutInfo.remainingAmount !== undefined) {
        return checkoutInfo.remainingAmount;
      }
      // Otherwise calculate it from total and deposit
      if (checkoutInfo.depositAmount > 0) {
        return calculateTotal() - checkoutInfo.depositAmount;
      }
    }
    return 0;
  };

  // Get deposit amount or zero if not available
  const getDepositAmount = () => {
    return checkoutInfo && checkoutInfo.depositAmount ? checkoutInfo.depositAmount : 0;
  };

  // Check if this is a preorder with deposit
  const isPreorder = () => {
    return checkoutInfo && checkoutInfo.depositAmount > 0;
  };

  // Step configuration
  const steps = [
    {
      title: "Cart Review",
      icon: <ShoppingCartOutlined />,
    },
    {
      title: "Shipping Info",
      icon: <EnvironmentOutlined />,
    },
    {
      title: "Payment",
      icon: <CreditCardOutlined />,
    },
  ];

  // Column configuration for cart table
  const cartColumns = [
    {
      title: "Product",
      dataIndex: "product",
      key: "product",
      render: (_, record) => (
        <div className="checkout-product-cell">
          <div className="checkout-product-image">
            <Image
              src={
                record.imageUrl || "https://placehold.co/80x80?text=No+Image"
              }
              alt={record.name}
              width={60}
              height={60}
              preview={false}
              fallback="https://placehold.co/80x80?text=No+Image"
            />
          </div>
          <div className="checkout-product-info">
            <Text strong className="checkout-product-name">
              {record.name}
            </Text>
            <div className="checkout-product-meta">
              <Text type="secondary" className="checkout-product-id">
                ID: {record.productId}
              </Text>
              <Tag color={record.productType === "PACKAGE" ? "purple" : "blue"}>
                {record.productType === "PACKAGE" ? "Package" : "Single Box"}
              </Tag>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      className: "text-right",
      render: (price) => (
        <Text>{Number(price).toLocaleString()} ₫</Text>
      ),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      className: "text-center",
    },
    {
      title: "Subtotal",
      dataIndex: "subtotal",
      key: "subtotal",
      className: "text-right",
      render: (_, record) => (
        <Text strong>
          {Number(record.price * record.quantity).toLocaleString()} ₫
        </Text>
      ),
    },
  ];

  // Handle form submit for shipping information step
  const handleShippingInfoSubmit = (values) => {
    setContactInfo(values);
    setCurrentStep(2);
  };

  // Handle form validation failure
  const handleShippingInfoFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
    message.error("Please fill in all required fields");
  };

  // Process the final checkout after reviewing shipping info
  const handleCheckout = async () => {
    if (!contactInfo) {
      message.error("Please provide shipping information");
      setCurrentStep(1);
      return;
    }
  
    setLoading(true);
  
    try {
      const checkoutData = {
        phoneNumber: contactInfo.phoneNumber,
        userAddress: contactInfo.userAddress,
      };
  
      const response = await checkoutService.processCheckout(checkoutData);
      
      if (response && response.status === true) {
        if (typeof response.metadata === 'string' && (
            response.metadata.startsWith('http') || 
            response.metadata.startsWith('/')
        )) {
          const baseApiUrl = "http://localhost:8080";
          const paymentUrl = response.metadata.startsWith('http')
            ? response.metadata
            : `${baseApiUrl}${response.metadata}`;
            
          fetch(paymentUrl)
            .then(res => res.json())
            .then(data => {
              if (data && data.metadata && data.metadata.paymentUrl) {
                window.location.href = data.metadata.paymentUrl;
              } else {
                throw new Error("Invalid payment response");
              }
            })
            .catch(err => {
              console.error("Error fetching payment URL:", err);
              message.error("Unable to process payment. Please try again.");
            });
        } 
        // If response contains paymentUrl directly
        else if (response.metadata && response.metadata.paymentUrl) {
          window.location.href = response.metadata.paymentUrl;
        } 
        else {
          throw new Error("Invalid payment response format");
        }
      } else {
        throw new Error("Failed to process checkout");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      message.error(error.message || "Failed to process your order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Render the cart review step
  const renderCartReview = () => (
    <Card className="checkout-cart-review-card">
      <Table
        columns={cartColumns}
        dataSource={cartItems}
        pagination={false}
        rowKey="id"
        className="checkout-cart-table"
        summary={() => (
          <Table.Summary>
            <Table.Summary.Row>
              <Table.Summary.Cell colSpan={2}></Table.Summary.Cell>
              <Table.Summary.Cell className="text-right">
                <Text strong>Total ({itemCount} items):</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell className="text-right">
                <Text strong className="checkout-cart-total-price">
                  {formatCurrency(calculateItemsTotal())}
                </Text>
              </Table.Summary.Cell>
            </Table.Summary.Row>
            {isPreorder() && (
              <>
                <Table.Summary.Row>
                  <Table.Summary.Cell colSpan={2}></Table.Summary.Cell>
                  <Table.Summary.Cell className="text-right">
                    <Text strong className="text-blue-600">Required Deposit:</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell className="text-right">
                    <Text strong className="checkout-cart-deposit text-blue-600">
                      {formatCurrency(getDepositAmount())}
                    </Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
                <Table.Summary.Row>
                  <Table.Summary.Cell colSpan={2}></Table.Summary.Cell>
                  <Table.Summary.Cell className="text-right">
                    <Text>Remaining Amount:</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell className="text-right">
                    <Text>
                      {formatCurrency(calculateRemainingAmount())}
                    </Text>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </>
            )}
          </Table.Summary>
        )}
      />
      
      {isPreorder() && (
        <Alert
          className="mt-4 mb-4"
          message="Preorder Payment Information"
          description={
            <div>
              <p>This is a preorder purchase requiring an initial deposit payment.</p>
              <ul className="pl-5 list-disc">
                <li>You'll pay <strong>{formatCurrency(getDepositAmount())}</strong> now as a deposit.</li>
                <li>The remaining <strong>{formatCurrency(calculateRemainingAmount())}</strong> will be charged when your order is ready.</li>
                <li>We'll notify you when it's time to complete your payment.</li>
              </ul>
            </div>
          }
          type="info"
          showIcon
        />
      )}
      
      <div className="checkout-step-actions">
        <Button onClick={() => navigate("/cart")} className="mr-2">
          Return to Cart
        </Button>
        <Button 
          type="primary" 
          onClick={() => setCurrentStep(1)}
          className="bg-black hover:bg-gray-800"
        >
          Continue to Shipping
        </Button>
      </div>
    </Card>
  );

  // Render the shipping information form step
  const renderShippingInfo = () => (
    <Card className="checkout-shipping-info-card">
      <Form
        form={form}
        name="shipping-info"
        layout="vertical"
        initialValues={contactInfo || {}}
        onFinish={handleShippingInfoSubmit}
        onFinishFailed={handleShippingInfoFailed}
        requiredMark={false}
      >
        <Title level={4} className="mb-4">Contact Information</Title>
        
        <div className="mb-6">
          <Form.Item
            name="fullName"
            label="Full Name"
            rules={[
              { required: true, message: "Please enter your full name" },
            ]}
          >
            <Input 
              prefix={<UserOutlined className="site-form-item-icon" />} 
              placeholder="Enter your full name"
              className="h-10" 
            />
          </Form.Item>

          <Form.Item
            name="phoneNumber"
            label="Phone Number"
            rules={[
              { required: true, message: "Please enter your phone number" },
              { 
                pattern: /^[0-9]{10}$/, 
                message: "Phone number must be 10 digits" 
              },
            ]}
          >
            <Input 
              prefix={<PhoneOutlined className="site-form-item-icon" />} 
              placeholder="Enter your phone number (10 digits)"
              className="h-10" 
            />
          </Form.Item>
        </div>

        <Title level={4} className="mb-4">Shipping Address</Title>
        
        <Form.Item
          name="userAddress"
          label="Shipping Address"
          rules={[
            { required: true, message: "Please enter your shipping address" },
          ]}
        >
          <Input.TextArea 
            placeholder="Enter your complete shipping address"
            rows={4}
          />
        </Form.Item>

        <Form.Item
          name="notes"
          label="Order Notes (Optional)"
        >
          <Input.TextArea 
            placeholder="Add any special instructions for your order"
            rows={3}
          />
        </Form.Item>

        <div className="checkout-step-actions">
          <Button onClick={() => setCurrentStep(0)} className="mr-2">
            Return to Cart Review
          </Button>
          <Button 
            type="primary" 
            htmlType="submit"
            className="bg-black hover:bg-gray-800"
          >
            Continue to Payment
          </Button>
        </div>
      </Form>
    </Card>
  );

  // Render the payment review step
  const renderPaymentReview = () => (
    <Card className="checkout-payment-review-card">
      <Title level={4}>Order Summary</Title>
      
      <div className="checkout-summary-row">
        <Text>Items ({itemCount}):</Text>
        <Text>{formatCurrency(calculateItemsTotal())}</Text>
      </div>
      
      {isPreorder() && (
        <>
          <div className="checkout-summary-row">
            <Text strong className="text-blue-600">Required Deposit:</Text>
            <Text strong className="text-blue-600">{formatCurrency(getDepositAmount())}</Text>
          </div>
          <div className="checkout-summary-row">
            <Text>Remaining Amount:</Text>
            <Text>{formatCurrency(calculateRemainingAmount())}</Text>
          </div>
          <Alert
            className="my-3"
            message={
              <div className="text-sm">
                You'll pay <strong>{formatCurrency(getDepositAmount())}</strong> now. 
                Remaining balance due when your order is ready.
              </div>
            }
            type="info"
            showIcon
            icon={<InfoCircleOutlined />}
          />
        </>
      )}
      
      <div className="checkout-summary-row">
        <Text>Shipping:</Text>
        <Text>Free</Text>
      </div>
      
      <Divider />
      
      <div className="checkout-summary-row checkout-summary-total">
        <Text strong>Total Order Value:</Text>
        <Text strong className="checkout-total-price">
          {formatCurrency(calculateTotal())}
        </Text>
      </div>
      
      {isPreorder() && (
        <div className="checkout-summary-row checkout-summary-to-pay mt-2">
          <Text strong className="text-lg text-blue-700">Amount to Pay Now:</Text>
          <Text strong className="checkout-to-pay-price text-lg text-blue-700">
            {formatCurrency(getDepositAmount())}
          </Text>
        </div>
      )}
      
      <Divider />
      
      <Title level={4}>Shipping Information</Title>
      {contactInfo && (
        <div className="checkout-contact-info">
          <div className="checkout-info-item">
            <Text strong>Name:</Text>
            <Text>{contactInfo.fullName}</Text>
          </div>
          <div className="checkout-info-item">
            <Text strong>Phone:</Text>
            <Text>{contactInfo.phoneNumber}</Text>
          </div>
          <div className="checkout-info-item">
            <Text strong>Address:</Text>
            <Text>{contactInfo.userAddress}</Text>
          </div>
          {contactInfo.notes && (
            <div className="checkout-info-item">
              <Text strong>Notes:</Text>
              <Text>{contactInfo.notes}</Text>
            </div>
          )}
        </div>
      )}
      
      <Divider />
      
      <Title level={4}>Payment Method</Title>
      <Card className="checkout-payment-method-card">
        <Radio.Group value="vnpay" disabled>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Radio value="vnpay" className="checkout-payment-radio">
              <div className="flex items-center">
                <img 
                  src="/src/assets/vnpay-logo.jpg" 
                  alt="VNPay" 
                  className="h-8 mr-3"
                />
                <div>
                  <Text strong>VN Pay</Text>
                  <div>
                    <Text type="secondary">
                      {isPreorder() 
                        ? `You'll be redirected to VNPay to pay the deposit (${formatCurrency(getDepositAmount())})`
                        : "You'll be redirected to VNPay to complete payment"
                      }
                    </Text>
                  </div>
                </div>
              </div>
            </Radio>
          </Space>
        </Radio.Group>
      </Card>
      
      <Alert
        className="mt-4"
        message="Important"
        description={
          isPreorder()
            ? "By proceeding with payment, you agree to pay the deposit now and the remaining amount when your order is ready. You also agree to our Terms of Service and Privacy Policy."
            : "By proceeding with payment, you agree to our Terms of Service and Privacy Policy."
        }
        type="info"
        showIcon
      />
      
      <div className="checkout-step-actions mt-6">
        <Button onClick={() => setCurrentStep(1)} className="mr-2">
          Return to Shipping
        </Button>
        <Button 
          type="primary" 
          onClick={handleCheckout}
          loading={loading}
          className="bg-black hover:bg-gray-800 h-12 px-8"
          size="large"
          icon={<SafetyOutlined />}
        >
          {isPreorder() ? "Pay Deposit Now" : "Complete Order"}
        </Button>
      </div>
    </Card>
  );

  // Render correct step content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderCartReview();
      case 1:
        return renderShippingInfo();
      case 2:
        return renderPaymentReview();
      default:
        return null;
    }
  };

  // Render Order Summary sidebar
  const renderOrderSummary = () => (
    <Card className="checkout-summary-card">
      <div className="flex justify-between items-center mb-2">
        <Title level={4} style={{ margin: 0 }}>Order Summary</Title>
        {checkoutLoading && <Spin size="small" />}
      </div>
      
      {checkoutError && (
        <div className="flex items-center mb-2">
          <Text type="danger" className="mr-2">Failed to load details</Text>
          <Button 
            size="small" 
            icon={<ReloadOutlined />} 
            onClick={fetchCheckoutInfo}
          />
        </div>
      )}
      
      <Divider />
      
      <div className="checkout-summary-row">
        <Text>Items ({itemCount}):</Text>
        <Text>{formatCurrency(calculateItemsTotal())}</Text>
      </div>
      
      {isPreorder() && (
        <>
          <div className="checkout-summary-row">
            <Text strong className="text-blue-600">Required Deposit:</Text>
            <Text strong className="text-blue-600">
              {formatCurrency(getDepositAmount())}
            </Text>
          </div>
          <div className="checkout-summary-row">
            <Text>Remaining Amount:</Text>
            <Text>{formatCurrency(calculateRemainingAmount())}</Text>
          </div>
          <div className="bg-gray-50 p-2 rounded text-xs mb-3">
            <Text type="secondary">
              Preorder: You'll pay a deposit now and the remaining amount later.
            </Text>
          </div>
        </>
      )}
      
      <div className="checkout-summary-row">
        <Text>Shipping:</Text>
        <Text>Free</Text>
      </div>
      
      <Divider />
      
      <div className="checkout-summary-row checkout-summary-total">
        <Text strong>Total Order Value:</Text>
        <Text strong className="checkout-total-price">
          {formatCurrency(calculateTotal())}
        </Text>
      </div>
      
      {isPreorder() && (
        <div className="checkout-summary-row checkout-to-pay mt-2">
          <Text strong>To Pay Now:</Text>
          <Text strong className="text-blue-700">
            {formatCurrency(getDepositAmount())}
          </Text>
        </div>
      )}

      {/* Cart Items Mini Preview */}
      <Divider />
      <Title level={5}>Your Items</Title>
      
      <div className="checkout-items-mini-preview">
        {cartItems.map((item) => (
          <div key={item.id} className="checkout-mini-item">
            <div className="checkout-mini-image">
              <Image
                src={item.imageUrl || "https://placehold.co/60x60?text=No+Image"}
                alt={item.name}
                width={40}
                height={40}
                preview={false}
                fallback="https://placehold.co/60x60?text=No+Image"
              />
            </div>
            <div className="checkout-mini-details">
              <Text className="checkout-mini-name">{item.name}</Text>
              <div>
                <Text type="secondary" className="checkout-mini-meta">
                  {item.quantity} x {Number(item.price).toLocaleString()} ₫
                </Text>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Continue Shopping Button */}
      <div className="mt-6">
        <Button 
          icon={<ShoppingOutlined />}
          onClick={() => navigate("/blindbox")}
          block
        >
          Continue Shopping
        </Button>
      </div>
    </Card>
  );

  // If the user is not authenticated or cart is empty, show loading
  if (!isAuthenticated || (cartItems.length === 0 && cartLoading)) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  // Show loading when fetching checkout info for the first time
  if (checkoutLoading && !checkoutInfo && !checkoutError) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Breadcrumb className="mb-6">
          <Breadcrumb.Item>
            <Link to="/">
              <HomeOutlined /> Home
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/cart">
              <ShoppingCartOutlined /> Cart
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Checkout</Breadcrumb.Item>
        </Breadcrumb>

        <Title level={2} className="mb-6">Checkout</Title>
        
        <div className="h-48 flex flex-col items-center justify-center">
          <Spin size="large" />
          <Text className="mt-4">Loading checkout information...</Text>
        </div>
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
          <Link to="/cart">
            <ShoppingCartOutlined /> Cart
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Checkout</Breadcrumb.Item>
      </Breadcrumb>

      <Title level={2} className="mb-6">Checkout</Title>

      {/* Steps Progress */}
      <Steps
        current={currentStep}
        items={steps.map((step) => ({
          title: step.title,
          icon: step.icon,
        }))}
        className="mb-8"
      />

      <Row gutter={[32, 24]}>
        <Col xs={24} lg={16}>
          {/* Step Content */}
          {renderStepContent()}
        </Col>

        <Col xs={24} lg={8}>
          {/* Order Summary Card */}
          {renderOrderSummary()}

          {/* Security Notice */}
          <Card className="checkout-security-card mt-4">
            <div className="flex items-center mb-2">
              <SafetyOutlined className="text-green-600 text-xl mr-2" />
              <Text strong>Secure Checkout</Text>
            </div>
            <Text type="secondary">
              Your payment information is processed securely. We do not store credit card details.
            </Text>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CheckoutPage;