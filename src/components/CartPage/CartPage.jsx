import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Button,
  Typography,
  Table,
  Image,
  InputNumber,
  Divider,
  Breadcrumb,
  Empty,
  Spin,
  Space,
  Popconfirm,
  message,
  Tag,
} from "antd";
import {
  HomeOutlined,
  ShoppingOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
  ArrowRightOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import useCart from "../../hooks/useCart";
import useAuth from "../../hooks/useAuth";
import checkoutService from "../../api/services/checkoutService";
import "./CartPage.css";
import vnpayLogo from "../../assets/vnpay-logo.jpg";

const { Title, Text } = Typography;

/**
 * CartPage component for displaying and managing the user's shopping cart
 *
 * @returns {JSX.Element} The CartPage component
 */
const CartPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const {
    cart,
    cartItems,
    itemCount,
    totalPrice,
    loading: cartLoading,
    error: cartError,
    updateCartItemQuantity,
    removeCartItem,
    clearCart,
  } = useCart();

  // State for checkout information
  const [checkoutInfo, setCheckoutInfo] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [quantityLoading, setQuantityLoading] = useState({});

  // Fetch checkout information when cart changes
  useEffect(() => {
    if (isAuthenticated && !cartLoading && cartItems.length > 0) {
      fetchCheckoutInfo();
    }
  }, [isAuthenticated, cartLoading, cartItems]);

  // Function to fetch checkout information
  const fetchCheckoutInfo = async () => {
    if (!isAuthenticated || cartItems.length === 0) return;
    
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

  // Helper function to render product type tag
  const renderProductType = (productType) => {
    if (productType === "PACKAGE") {
      return <Tag color="purple">Package</Tag>;
    } else if (productType === "BOX") {
      return <Tag color="blue">Single Box</Tag>;
    }
    return null;
  };

  // Handle quantity change for a cart item
  const handleQuantityChange = async (cartItemId, quantity) => {
    if (quantity < 1) return;

    setQuantityLoading((prev) => ({ ...prev, [cartItemId]: true }));

    try {
      await updateCartItemQuantity(cartItemId, quantity);
      // Refetch checkout info after cart update
      fetchCheckoutInfo();
    } finally {
      setQuantityLoading((prev) => ({ ...prev, [cartItemId]: false }));
    }
  };

  // Handle removing a cart item
  const handleRemoveItem = async (cartItemId) => {
    try {
      await removeCartItem(cartItemId);
      // Refetch checkout info after cart update
      if (cartItems.length > 1) { // Only if there will still be items left
        fetchCheckoutInfo();
      } else {
        setCheckoutInfo(null);
      }
    } catch (error) {
      message.error("Failed to remove item from cart");
    }
  };

  // Handle clearing the entire cart
  const handleClearCart = async () => {
    try {
      await clearCart();
      setCheckoutInfo(null);
    } catch (error) {
      message.error("Failed to clear cart");
    }
  };

  // Continue shopping - go back to blindbox listing
  const handleContinueShopping = () => {
    navigate("/blindbox");
  };

  // Define columns for the cart items table
  const columns = [
    {
      title: "Product",
      dataIndex: "product",
      key: "product",
      render: (_, record) => (
        <div className="cart-product-cell">
          <div className="cart-product-image">
            <Image
              src={
                record.imageUrl || "https://placehold.co/100x100?text=No+Image"
              }
              alt={record.name}
              width={80}
              height={80}
              preview={false}
              fallback="https://placehold.co/100x100?text=No+Image"
            />
          </div>
          <div className="cart-product-info">
            <Link
              to={`/blindbox/${record.productId}`}
              className="cart-product-name"
            >
              {record.name}
            </Link>
            <div>
              <Text type="secondary" className="cart-product-id">
                ID: {record.productId}
              </Text>
              {renderProductType(record.productType)}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (price, record) => (
        <div>
          <Text className="cart-product-price">
            {Number(price).toLocaleString()} ₫
          </Text>
          {record.originalItem && record.originalItem.discountPercent > 0 && (
            <div>
              <Text type="secondary" delete>
                {Number(record.originalItem.price).toLocaleString()} ₫
              </Text>
              <Tag color="green" className="ml-2">
                -{record.originalItem.discountPercent}%
              </Tag>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity, record) => (
        <div className="cart-quantity-control">
          <Spin spinning={quantityLoading[record.id] || false} size="small">
            <InputNumber
              min={1}
              max={99}
              value={quantity}
              onChange={(value) => handleQuantityChange(record.id, value)}
              className="cart-quantity-input"
            />
          </Spin>
        </div>
      ),
    },
    {
      title: "Subtotal",
      dataIndex: "subtotal",
      key: "subtotal",
      render: (_, record) => (
        <Text strong className="cart-product-subtotal">
          {Number(record.price * record.quantity).toLocaleString()} ₫
        </Text>
      ),
    },
    {
      title: "",
      key: "action",
      render: (_, record) => (
        <Popconfirm
          title="Remove item"
          description="Are you sure you want to remove this item from your cart?"
          onConfirm={() => handleRemoveItem(record.id)}
          okText="Yes"
          cancelText="No"
        >
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            className="cart-remove-button"
          />
        </Popconfirm>
      ),
    },
  ];

  // Render Order Summary Card
  const renderOrderSummary = () => {
    // Format currency with Vietnamese đồng symbol
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

    // Get the total number of items from checkout info or cart
    const getItemCount = () => {
      if (checkoutInfo && checkoutInfo.items) {
        return checkoutInfo.items.reduce((total, item) => total + (item.quantity || 0), 0);
      }
      return itemCount;
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

    return (
      <Card className="cart-summary-card">
        <Title level={3}>Order Summary</Title>
        <Divider />

        {checkoutLoading ? (
          <div className="text-center py-4">
            <Spin size="small" />
            <Text className="block mt-2">Loading order details...</Text>
          </div>
        ) : checkoutError ? (
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <Text type="danger" className="mr-2">Failed to load order details</Text>
              <Button 
                size="small" 
                icon={<ReloadOutlined />} 
                onClick={fetchCheckoutInfo}
              />
            </div>
            
            <div className="cart-summary-row">
              <Text>Items ({itemCount}):</Text>
              <Text>{formatCurrency(totalPrice)}</Text>
            </div>
          </div>
        ) : (
          <>
            <div className="cart-summary-row">
              <Text>Items ({getItemCount()}):</Text>
              <Text>{formatCurrency(calculateItemsTotal())}</Text>
            </div>
            
            {checkoutInfo && checkoutInfo.depositAmount > 0 && (
              <>
                <div className="cart-summary-row">
                  <Text strong className="text-blue-600">Required Deposit:</Text>
                  <Text strong className="text-blue-600">{formatCurrency(checkoutInfo.depositAmount)}</Text>
                </div>
                <div className="cart-summary-row">
                  <Text>Remaining Amount:</Text>
                  <Text>{formatCurrency(calculateRemainingAmount())}</Text>
                </div>
                <Divider className="my-2" />
                <div className="cart-summary-info bg-gray-50 p-2 rounded text-xs">
                  <Text type="secondary">
                    You'll pay {formatCurrency(checkoutInfo.depositAmount)} now as a deposit, 
                    and {formatCurrency(calculateRemainingAmount())} when your order is ready.
                  </Text>
                </div>
              </>
            )}
          </>
        )}

        <div className="cart-summary-row">
          <Text>Shipping:</Text>
          <Text>Calculated at checkout</Text>
        </div>

        <Divider />

        <div className="cart-summary-row cart-summary-total">
          <Text strong>Total:</Text>
          <Text strong className="cart-total-price">
            {formatCurrency(calculateTotal())}
          </Text>
        </div>

        <Button
          type="primary"
          size="large"
          block
          onClick={() => navigate("/checkout")}
          className="mt-6 h-12 bg-black hover:bg-gray-800"
          disabled={cartItems.length === 0}
        >
          Proceed to Checkout
        </Button>

        <div className="cart-summary-note mt-4">
          <Text type="secondary">
            * Shipping costs and tax will be calculated at checkout
          </Text>
        </div>
      </Card>
    );
  };

  // If not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Breadcrumb className="mb-6">
          <Breadcrumb.Item>
            <Link to="/">
              <HomeOutlined /> Home
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <ShoppingCartOutlined /> Shopping Cart
          </Breadcrumb.Item>
        </Breadcrumb>

        <Card className="cart-login-card">
          <div className="text-center py-8">
            <ShoppingCartOutlined style={{ fontSize: 48, color: "#ccc" }} />
            <Title level={3} className="mt-4">
              Your Shopping Cart is Waiting
            </Title>
            <Text className="block mb-6">
              Please login to view your cart and complete your purchase
            </Text>
            <Button
              type="primary"
              size="large"
              onClick={() => navigate("/login")}
              className="bg-black hover:bg-gray-800"
            >
              Sign In
            </Button>
            <div className="mt-4">
              <Text type="secondary">Don't have an account? </Text>
              <Link to="/register">Register now</Link>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Breadcrumb className="mb-6">
        <Breadcrumb.Item>
          <Link to="/">
            <HomeOutlined /> Home
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <ShoppingCartOutlined /> Shopping Cart
        </Breadcrumb.Item>
      </Breadcrumb>

      <Title level={2} className="mb-6">
        Your Shopping Cart
      </Title>

      {cartLoading ? (
        <div className="cart-loading-container">
          <Spin size="large" />
          <Text className="mt-4">Loading your cart...</Text>
        </div>
      ) : cartError ? (
        <div className="cart-error-container">
          <Title level={4}>Error Loading Cart</Title>
          <Text type="danger">{cartError}</Text>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Try Again
          </Button>
        </div>
      ) : cartItems.length === 0 ? (
        <Card className="cart-empty-card">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div>
                <Title level={4}>Your cart is empty</Title>
                <Text type="secondary">
                  Add items to your cart to continue shopping
                </Text>
              </div>
            }
          >
            <Button
              type="primary"
              size="large"
              onClick={handleContinueShopping}
              icon={<ShoppingOutlined />}
              className="bg-black hover:bg-gray-800 mt-4"
            >
              Continue Shopping
            </Button>
          </Empty>
        </Card>
      ) : (
        <Row gutter={[32, 24]}>
          <Col xs={24} lg={16}>
            <Card className="cart-items-card">
              <Table
                columns={columns}
                dataSource={cartItems}
                pagination={false}
                rowKey="id"
                summary={() => {
                  return (
                    <Table.Summary>
                      <Table.Summary.Row>
                        <Table.Summary.Cell colSpan={5}>
                          <div className="cart-actions flex justify-between">
                            <Button
                              onClick={handleContinueShopping}
                              icon={<ArrowRightOutlined />}
                              className="flex items-center"
                            >
                              Continue Shopping
                            </Button>

                            <Popconfirm
                              title="Clear cart"
                              description="Are you sure you want to remove all items from your cart?"
                              onConfirm={handleClearCart}
                              okText="Yes"
                              cancelText="No"
                            >
                              <Button
                                danger
                                icon={<DeleteOutlined />}
                                className="flex items-center"
                              >
                                Clear Cart
                              </Button>
                            </Popconfirm>
                          </div>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    </Table.Summary>
                  );
                }}
              />
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            {renderOrderSummary()}

            {/* Payment Methods Accepted */}
            <Card className="cart-payment-card mt-4">
              <Title level={5}>We Accept</Title>
              <div className="cart-payment-methods">
                <Space size={[16, 16]} wrap>
                  <div className="payment-method-icon">
                    <img src={vnpayLogo} alt="VnPay" className="h-6" />
                  </div>
                  <div className="payment-method-icon">COD</div>
                </Space>
              </div>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default CartPage;