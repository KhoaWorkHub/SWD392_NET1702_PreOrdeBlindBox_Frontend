import { useState } from "react";
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
} from "@ant-design/icons";
import useCart from "../../hooks/useCart";
import useAuth from "../../hooks/useAuth";
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
    loading,
    error,
    updateCartItemQuantity,
    removeCartItem,
    clearCart,
  } = useCart();

  const [quantityLoading, setQuantityLoading] = useState({});

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
    } finally {
      setQuantityLoading((prev) => ({ ...prev, [cartItemId]: false }));
    }
  };

  // Handle removing a cart item
  const handleRemoveItem = async (cartItemId) => {
    await removeCartItem(cartItemId);
  };

  // Handle clearing the entire cart
  const handleClearCart = async () => {
    await clearCart();
  };

  // Navigate to checkout page
  const handleCheckout = () => {
    message.info("Checkout functionality will be implemented soon!");
    // navigate('/checkout');
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

      {loading ? (
        <div className="cart-loading-container">
          <Spin size="large" />
          <Text className="mt-4">Loading your cart...</Text>
        </div>
      ) : error ? (
        <div className="cart-error-container">
          <Title level={4}>Error Loading Cart</Title>
          <Text type="danger">{error}</Text>
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
            <Card className="cart-summary-card">
              <Title level={3}>Order Summary</Title>
              <Divider />

              <div className="cart-summary-row">
                <Text>Items ({itemCount}):</Text>
                <Text>{Number(totalPrice).toLocaleString()} ₫</Text>
              </div>

              <div className="cart-summary-row">
                <Text>Shipping:</Text>
                <Text>Calculated at checkout</Text>
              </div>

              <Divider />

              <div className="cart-summary-row cart-summary-total">
                <Text strong>Total:</Text>
                <Text strong className="cart-total-price">
                  {Number(totalPrice).toLocaleString()} ₫
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
