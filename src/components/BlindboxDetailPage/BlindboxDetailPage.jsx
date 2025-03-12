import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Row, 
  Col, 
  Breadcrumb, 
  Skeleton, 
  Image, 
  Typography, 
  Tag, 
  Divider, 
  InputNumber, 
  Button, 
  message,
  Tabs,
  Alert
} from 'antd';
import { 
  HomeOutlined, 
  ShoppingCartOutlined, 
  HeartOutlined, 
  HeartFilled,
  ShareAltOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import blindboxService from '../../api/services/blindboxService';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

/**
 * BlindboxDetailPage component for displaying details of a specific blind box
 * 
 * @returns {JSX.Element} The BlindboxDetailPage component
 */
const BlindboxDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [blindbox, setBlindbox] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [favorite, setFavorite] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  
  // Fetch blindbox details on component mount
  useEffect(() => {
    fetchBlindboxDetails();
  }, [id]);

  const fetchBlindboxDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await blindboxService.getBlindBoxSeriesById(id);
      console.log('Blindbox detail response:', response);
      
      if (response && response.status === true && response.metadata) {
        setBlindbox(response.metadata);
      } else {
        setError('Failed to load blind box details');
      }
    } catch (err) {
      console.error('Error in fetchBlindboxDetails:', err);
      setError(err.message || 'An error occurred while fetching the blind box details');
    } finally {
      setLoading(false);
    }
  };
  
  const handleQuantityChange = (value) => {
    setQuantity(value);
  };
  
  const handleAddToCart = () => {
    // Logic for adding to cart would go here
    message.success(`Added ${quantity} item(s) to cart`);
  };
  
  const toggleFavorite = () => {
    setFavorite(!favorite);
    message.success(favorite ? 'Removed from wishlist' : 'Added to wishlist');
  };
  
  const handleShare = () => {
    // Logic for sharing would go here
    navigator.clipboard.writeText(window.location.href);
    message.success('Link copied to clipboard');
  };

  const handleImageSelect = (index) => {
    setSelectedImage(index);
  };

  // If there's an error, show error message with option to go back
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
            <Link to="/blindbox">
              All Blind Boxes
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            Error
          </Breadcrumb.Item>
        </Breadcrumb>

        <Alert
          message="Error Loading Details"
          description={
            <div>
              <p>{error}</p>
              <div className="mt-4">
                <Button 
                  type="primary" 
                  onClick={() => navigate('/blindbox')}
                  className="mr-4"
                >
                  Back to all blind boxes
                </Button>
                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={fetchBlindboxDetails}
                >
                  Try Again
                </Button>
              </div>
            </div>
          }
          type="error"
          showIcon
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
          <Link to="/blindbox">
            All Blind Boxes
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          {loading ? 'Loading...' : blindbox?.seriesName || 'Blind Box Detail'}
        </Breadcrumb.Item>
      </Breadcrumb>
      
      {/* Product Detail */}
      {loading ? (
        <Row gutter={[48, 24]}>
          <Col xs={24} md={12}>
            <Skeleton.Image className="w-full h-96" />
          </Col>
          <Col xs={24} md={12}>
            <Skeleton active paragraph={{ rows: 10 }} />
          </Col>
        </Row>
      ) : blindbox && (
        <>
          <Row gutter={[48, 24]}>
            <Col xs={24} md={12}>
              <div className="bg-gray-50 p-8 rounded-lg">
                <Image 
                  src={
                    blindbox.seriesImageUrls && blindbox.seriesImageUrls.length > 0 
                      ? blindbox.seriesImageUrls[selectedImage] 
                      : "https://placehold.co/600x600?text=No+Image"
                  } 
                  alt={blindbox.seriesName}
                  className="w-full object-contain"
                  fallback="https://placehold.co/600x600?text=No+Image"
                />
              </div>
              
              {/* Image gallery */}
              {blindbox.seriesImageUrls && blindbox.seriesImageUrls.length > 0 && (
                <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                  {blindbox.seriesImageUrls.map((imageUrl, index) => (
                    <div 
                      key={index} 
                      className={`w-24 h-24 flex-shrink-0 bg-gray-50 rounded cursor-pointer hover:opacity-75 transition-opacity ${
                        selectedImage === index ? 'border-2 border-blue-500' : ''
                      }`}
                      onClick={() => handleImageSelect(index)}
                    >
                      <img 
                        src={imageUrl || `https://placehold.co/100x100?text=View+${index+1}`} 
                        alt={`Product view ${index+1}`}
                        className="w-full h-full object-contain" 
                      />
                    </div>
                  ))}
                </div>
              )}
            </Col>
            
            <Col xs={24} md={12}>
              <Title level={2}>{blindbox.seriesName}</Title>
              
              {/* ID info */}
              <div className="mb-4">
                <Text type="secondary">Series ID: {blindbox.id}</Text>
              </div>
              
              {/* Price and stock */}
              <div className="mb-6">
                <Title level={3} className="text-red-600 mb-1">
                  {Number(blindbox.boxPrice).toLocaleString()} ₫
                </Title>
                
                <Tag color="green">In Stock</Tag>
                
                {blindbox.packagePrice && (
                  <div className="mt-2">
                    <Text>Package Price: {Number(blindbox.packagePrice).toLocaleString()} ₫</Text>
                  </div>
                )}
              </div>
              
              <Divider />
              
              {/* Description */}
              <div className="mb-6">
                <Title level={4}>Description</Title>
                <Paragraph>
                  {blindbox.description || 'No description available for this product.'}
                </Paragraph>
              </div>
              
              {/* Status */}
              <div className="mb-6">
                <Title level={5} className="mb-2">Status:</Title>
                <div className="flex flex-wrap gap-2">
                  <Tag color={blindbox.active ? "green" : "red"}>
                    {blindbox.active ? "Active" : "Inactive"}
                  </Tag>
                </div>
              </div>
              
              <Divider />
              
              {/* Add to cart section */}
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <Text>Quantity:</Text>
                  <InputNumber 
                    min={1} 
                    max={10} 
                    value={quantity}
                    onChange={handleQuantityChange}
                  />
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <Button 
                    type="primary"
                    icon={<ShoppingCartOutlined />}
                    size="large"
                    onClick={handleAddToCart}
                    className="bg-black hover:bg-gray-800 flex-1"
                  >
                    Add to Cart
                  </Button>
                  
                  <Button 
                    icon={favorite ? <HeartFilled /> : <HeartOutlined />}
                    size="large"
                    onClick={toggleFavorite}
                    className={favorite ? "text-red-500" : ""}
                  />
                  
                  <Button 
                    icon={<ShareAltOutlined />}
                    size="large"
                    onClick={handleShare}
                  />
                </div>
              </div>
            </Col>
          </Row>
          
          {/* Additional Product Information */}
          <div className="mt-12">
            <Tabs defaultActiveKey="details">
              <TabPane tab="Product Details" key="details">
                <div className="p-6 bg-gray-50 rounded-lg">
                  <Title level={4} className="mb-4">Product Specifications</Title>
                  <Row gutter={[24, 16]}>
                    <Col xs={24} sm={12} md={8}>
                      <Text strong>Series Name:</Text>
                      <div>{blindbox.seriesName}</div>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Text strong>Series ID:</Text>
                      <div>{blindbox.id}</div>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Text strong>Box Price:</Text>
                      <div>{Number(blindbox.boxPrice).toLocaleString()} ₫</div>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Text strong>Package Price:</Text>
                      <div>{Number(blindbox.packagePrice).toLocaleString()} ₫</div>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Text strong>Status:</Text>
                      <div>{blindbox.active ? "Active" : "Inactive"}</div>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                      <Text strong>Number of Images:</Text>
                      <div>{blindbox.seriesImageUrls?.length || 0}</div>
                    </Col>
                  </Row>
                </div>
              </TabPane>
              <TabPane tab="Shipping & Returns" key="shipping">
                <div className="p-6 bg-gray-50 rounded-lg">
                  <Title level={4} className="mb-4">Shipping Information</Title>
                  <Paragraph>
                    All orders are processed within 1-2 business days. Orders placed on weekends or holidays will be processed on the next business day.
                  </Paragraph>
                  
                  <Title level={4} className="mt-6 mb-4">Return Policy</Title>
                  <Paragraph>
                    We offer a 14-day return policy for unopened items in their original packaging. Please contact our customer service team to initiate a return.
                  </Paragraph>
                </div>
              </TabPane>
              <TabPane tab="Reviews" key="reviews">
                <div className="p-6 bg-gray-50 rounded-lg text-center">
                  <p>No reviews yet for this product.</p>
                  <Button type="primary" className="mt-4">Be the first to review</Button>
                </div>
              </TabPane>
            </Tabs>
          </div>
          
          {/* Related Products */}
          <div className="mt-12">
            <Title level={3}>You May Also Like</Title>
            <Row gutter={[24, 24]} className="mt-6">
              {[...Array(4)].map((_, i) => (
                <Col xs={24} sm={12} md={6} key={i}>
                  <Card 
                    hoverable
                    cover={
                      <div className="p-4 bg-gray-50 h-48 flex items-center justify-center">
                        <img 
                          alt={`Related product ${i+1}`} 
                          src={`https://placehold.co/300x300?text=Related+${i+1}`}
                          className="h-full object-contain"
                        />
                      </div>
                    }
                    bodyStyle={{ padding: "12px" }}
                    bordered={false}
                    className="shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="text-sm font-medium mb-2 line-clamp-2 h-10">Related Blind Box Series {i+1}</div>
                    <div className="text-sm font-semibold">{(blindbox.boxPrice * 0.9).toLocaleString()} ₫</div>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </>
      )}
    </div>
  );
};

// Card component for related products
const Card = ({ children, hoverable, cover, bodyStyle, bordered, className, onClick }) => {
  return (
    <div 
      className={`${className} ${hoverable ? 'cursor-pointer' : ''} ${bordered ? 'border border-gray-200' : ''}`}
      onClick={onClick}
    >
      {cover}
      <div style={bodyStyle}>
        {children}
      </div>
    </div>
  );
};

export default BlindboxDetailPage;