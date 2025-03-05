import { Button, Card, Row, Col, Carousel } from 'antd';
import { RightOutlined, LeftOutlined } from '@ant-design/icons';
import { useRef } from 'react';

export const HomePage = () => {
  const carouselRef = useRef(null);

  // Placeholder data for products shown in New Arrivals section
  const newArrivals = [
    {
      id: 1,
      title: 'Zeiga Borderline Drifter Series Figures',
      image: 'https://placehold.co/300x300',
      price: '280.000 ₫',
      date: 'Mar 07 09:00',
    },
    {
      id: 2,
      title: 'Barbie Style Icon Series Figures',
      image: 'https://placehold.co/300x300',
      price: '280.000 ₫',
      date: 'Mar 07 09:00',
    },
    {
      id: 3,
      title: 'Zeiga Borderline Drifter Series-Phone Charm',
      image: 'https://placehold.co/300x300',
      price: '240.000 ₫',
      date: 'Mar 07 09:00',
    },
    {
      id: 4,
      title: 'Zeiga Borderline Drifter Series-Triangular Bag',
      image: 'https://placehold.co/300x300',
      price: '300.000 ₫',
      date: 'Mar 07 09:00',
    },
  ];

  const nextSlide = () => {
    carouselRef.current.next();
  };

  const prevSlide = () => {
    carouselRef.current.prev();
  };

  return (
    <div className="homepage">
      {/* Hero Banner */}
      <div className="w-full relative">
        <Carousel autoplay>
          <div>
            <div className="relative">
              <div 
                className="w-full h-96 bg-pink-300 flex items-center"
                style={{ 
                  backgroundImage: "linear-gradient(to right, #ff9a9e, #fad0c4)",
                  height: "500px"
                }}
              >
                <div className="max-w-7xl mx-auto px-4 flex items-center h-full">
                  <div className="flex items-center w-full">
                    {/* Left side - product image */}
                    <div className="w-1/2 flex justify-center">
                      <img 
                        src="https://placehold.co/400x400" 
                        alt="Sweet Bean I Want A Hug Series" 
                        className="h-96 object-contain"
                      />
                    </div>
                    
                    {/* Right side - text content */}
                    <div className="w-1/2 text-center">
                      <div className="inline-flex items-center mb-2">
                        <img src="https://placehold.co/50x20" alt="Jubilee" className="h-6 mr-2" />
                        <span className="mx-2">|</span>
                        <img src="https://placehold.co/60x20" alt="POP MART" className="h-6 mr-2" />
                        <img src="https://placehold.co/30x20" alt="Sweet Bean" className="h-6" />
                      </div>
                      <h1 className="text-5xl font-bold text-pink-600 mb-4">SWEET BEAN</h1>
                      <h2 className="text-2xl font-semibold text-white mb-8">I WANT A HUG SERIES</h2>
                      <Button 
                        size="large"
                        type="primary"
                        className="bg-pink-500 border-none hover:bg-pink-600 text-lg px-8 py-6 h-auto flex items-center justify-center"
                      >
                        AVAILABLE NOW
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Carousel>
        
        {/* Carousel navigation buttons */}
        <button 
          onClick={prevSlide} 
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-md"
        >
          <LeftOutlined />
        </button>
        <button 
          onClick={nextSlide} 
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-md"
        >
          <RightOutlined />
        </button>
      </div>

      {/* New Arrivals Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-red-600">New Arrivals</h2>
          <Button type="link" className="flex items-center">
            More <RightOutlined />
          </Button>
        </div>

        <Row gutter={[24, 24]}>
          {newArrivals.map(product => (
            <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
              <Card 
                hoverable
                cover={
                  <div className="p-4 bg-gray-50 h-64 flex items-center justify-center">
                    <img 
                      alt={product.title} 
                      src={product.image}
                      className="h-full object-contain"
                    />
                  </div>
                }
                bodyStyle={{ padding: "12px" }}
                bordered={false}
                className="shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="text-xs text-gray-500 mb-1">{product.date}</div>
                <div className="text-sm font-medium mb-2 line-clamp-2 h-10">{product.title}</div>
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">{product.price}</div>
                  <Button 
                    type="text" 
                    shape="circle"
                    icon={<img src="https://placehold.co/16x16" alt="Wishlist" className="w-4 h-4" />}
                  />
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Categories Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-100 p-8 rounded hover:shadow-md transition-shadow">
            <h2 className="text-xl font-bold mb-2">New Arrivals</h2>
            <p className="text-gray-600 mb-4">Check out our latest collections</p>
            <Button type="link" className="flex items-center p-0">
              Shop Now <RightOutlined className="ml-1" />
            </Button>
          </div>
          <div className="bg-gray-100 p-8 rounded hover:shadow-md transition-shadow">
            <h2 className="text-xl font-bold mb-2">Popular Series</h2>
            <p className="text-gray-600 mb-4">Discover fan favorites</p>
            <Button type="link" className="flex items-center p-0">
              Shop Now <RightOutlined className="ml-1" />
            </Button>
          </div>
          <div className="bg-gray-100 p-8 rounded hover:shadow-md transition-shadow">
            <h2 className="text-xl font-bold mb-2">Limited Editions</h2>
            <p className="text-gray-600 mb-4">Get them while they last</p>
            <Button type="link" className="flex items-center p-0">
              Shop Now <RightOutlined className="ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;