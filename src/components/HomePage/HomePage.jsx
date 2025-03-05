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

  // Define background gradients for different slides
  const backgrounds = [
    "linear-gradient(to right, #ff9a9e, #fad0c4)", // Pink gradient (original)
    "linear-gradient(to right, #a1c4fd, #c2e9fb)", // Blue gradient
    "linear-gradient(to right, #d4fc79, #96e6a1)", // Green gradient
    "linear-gradient(to right, #ffecd2, #fcb69f)"  // Orange gradient
  ];

  // Define carousel slides data for easy maintenance
  const carouselSlides = [
    {
      id: 1,
      background: backgrounds[0],
      imagePosition: "left", // image on left, text on right
      productImage: "https://placehold.co/400x400",
      productAlt: "Sweet Bean I Want A Hug Series",
      brandLogos: [
        { src: "https://placehold.co/50x20", alt: "Jubilee" },
        { src: "https://placehold.co/60x20", alt: "POP MART" },
        { src: "https://placehold.co/30x20", alt: "Sweet Bean" }
      ],
      title: "SWEET BEAN",
      titleColor: "#d53f8c", // pink
      subtitle: "I WANT A HUG SERIES",
      buttonText: "AVAILABLE NOW",
      buttonBg: "#ec4899" // pink button
    },
    {
      id: 2,
      background: backgrounds[1],
      imagePosition: "right", // image on right, text on left
      productImage: "https://placehold.co/400x400",
      productAlt: "Ocean Friends Series",
      brandLogos: [
        { src: "https://placehold.co/50x20", alt: "Jubilee" },
        { src: "https://placehold.co/60x20", alt: "POP MART" }
      ],
      title: "OCEAN FRIENDS",
      titleColor: "#3182ce", // blue
      subtitle: "UNDERWATER ADVENTURE",
      buttonText: "COMING SOON",
      buttonBg: "#3182ce" // blue button
    },
    {
      id: 3,
      background: backgrounds[2],
      imagePosition: "left", // image on left, text on right
      productImage: "https://placehold.co/400x400",
      productAlt: "Forest Friends Series",
      brandLogos: [
        { src: "https://placehold.co/60x20", alt: "POP MART" },
        { src: "https://placehold.co/30x20", alt: "Forest" }
      ],
      title: "FOREST FRIENDS",
      titleColor: "#2f855a", // green
      subtitle: "NATURE COLLECTION",
      buttonText: "EXPLORE NOW",
      buttonBg: "#38a169" // green button
    },
    {
      id: 4,
      background: backgrounds[3],
      imagePosition: "right", // image on right, text on left
      productImage: "https://placehold.co/400x400",
      productAlt: "Sunset Dreams Collection",
      brandLogos: [
        { src: "https://placehold.co/50x20", alt: "Jubilee" },
        { src: "https://placehold.co/60x20", alt: "POP MART" }
      ],
      title: "SUNSET DREAMS",
      titleColor: "#dd6b20", // orange
      subtitle: "LIMITED COLLECTION",
      buttonText: "PRE-ORDER NOW",
      buttonBg: "#dd6b20" // orange button
    }
  ];

  return (
    <div className="homepage">
      {/* Hero Banner Carousel */}
      <div className="w-full relative cursor-pointer">
        <Carousel 
          ref={carouselRef} 
          autoplay 
          dots={true}
          autoplaySpeed={5000}
          effect="fade"
        >
          {carouselSlides.map((slide) => (
            <div key={slide.id}>
              <div className="relative">
                <div 
                  className="w-full h-96 flex items-center"
                  style={{ 
                    backgroundImage: slide.background,
                    height: "500px"
                  }}
                >
                  <div className="max-w-7xl mx-auto px-4 flex items-center h-full">
                    <div className="flex items-center w-full">
                      {/* Conditional rendering based on image position */}
                      {slide.imagePosition === "left" ? (
                        <>
                          {/* Left side - product image */}
                          <div className="w-1/2 flex justify-center">
                            <img 
                              src={slide.productImage} 
                              alt={slide.productAlt} 
                              className="h-96 object-contain"
                            />
                          </div>
                          
                          {/* Right side - text content */}
                          <div className="w-1/2 text-center">
                            <div className="inline-flex items-center mb-2">
                              {slide.brandLogos.map((logo, index) => (
                                <>
                                  <img 
                                    key={`logo-${index}`}
                                    src={logo.src} 
                                    alt={logo.alt} 
                                    className="h-6 mr-2" 
                                  />
                                  {index < slide.brandLogos.length - 1 && (
                                    <span className="mx-2">|</span>
                                  )}
                                </>
                              ))}
                            </div>
                            <h1 
                              className="text-5xl font-bold mb-4"
                              style={{ color: slide.titleColor }}
                            >
                              {slide.title}
                            </h1>
                            <h2 className="text-2xl font-semibold text-white mb-8">
                              {slide.subtitle}
                            </h2>
                            <Button 
                              size="large"
                              type="primary"
                              className="text-lg px-8 py-6 h-auto flex items-center justify-center border-none"
                              style={{ 
                                backgroundColor: slide.buttonBg,
                                borderColor: slide.buttonBg
                              }}
                            >
                              {slide.buttonText}
                            </Button>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Left side - text content (for reversed layout) */}
                          <div className="w-1/2 text-center">
                            <div className="inline-flex items-center mb-2">
                              {slide.brandLogos.map((logo, index) => (
                                <>
                                  <img 
                                    key={`logo-${index}`}
                                    src={logo.src} 
                                    alt={logo.alt} 
                                    className="h-6 mr-2" 
                                  />
                                  {index < slide.brandLogos.length - 1 && (
                                    <span className="mx-2">|</span>
                                  )}
                                </>
                              ))}
                            </div>
                            <h1 
                              className="text-5xl font-bold mb-4"
                              style={{ color: slide.titleColor }}
                            >
                              {slide.title}
                            </h1>
                            <h2 className="text-2xl font-semibold text-white mb-8">
                              {slide.subtitle}
                            </h2>
                            <Button 
                              size="large"
                              type="primary"
                              className="text-lg px-8 py-6 h-auto flex items-center justify-center border-none"
                              style={{ 
                                backgroundColor: slide.buttonBg,
                                borderColor: slide.buttonBg
                              }}
                            >
                              {slide.buttonText}
                            </Button>
                          </div>
                          
                          {/* Right side - product image (for reversed layout) */}
                          <div className="w-1/2 flex justify-center">
                            <img 
                              src={slide.productImage} 
                              alt={slide.productAlt} 
                              className="h-96 object-contain"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Carousel>
        
        {/* Carousel navigation buttons */}
        <button 
          onClick={prevSlide} 
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-md z-10 cursor-pointer"
        >
          <LeftOutlined />
        </button>
        <button 
          onClick={nextSlide} 
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-md z-10 cursor-pointer"
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