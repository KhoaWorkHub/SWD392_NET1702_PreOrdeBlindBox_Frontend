import { Button, Row, Col, Carousel } from 'antd';
import { RightOutlined, LeftOutlined } from '@ant-design/icons';
import { useRef } from 'react';
import BlindboxSection from '../BlindboxSection/BlindboxSection';
import { useNavigate } from 'react-router-dom';

export const HomePage = () => {
  const carouselRef = useRef(null);
  const navigate = useNavigate();

  const nextSlide = () => {
    carouselRef.current.next();
  };

  const prevSlide = () => {
    carouselRef.current.prev();
  };

  // Define background gradients for different slides
  const backgrounds = [
    "linear-gradient(to right, #ff9a9e, #fad0c4)", // Pink gradient
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
      buttonBg: "#ec4899", // pink button
      link: "/blindbox/1"
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
      buttonBg: "#3182ce", // blue button
      link: "/blindbox/2"
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
      buttonBg: "#38a169", // green button
      link: "/blindbox/3"
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
      buttonBg: "#dd6b20", // orange button
      link: "/blindbox/4"
    }
  ];

  // Category section items
  const categoryItems = [
    {
      title: "New Arrivals",
      description: "Check out our latest collections",
      link: "/blindbox?sort=id,desc",
      image: "https://placehold.co/500x300/eee/ccc"
    },
    {
      title: "Popular Series",
      description: "Discover fan favorites",
      link: "/blindbox?sort=id,asc",
      image: "https://placehold.co/500x300/edf2f7/a0aec0"
    },
    {
      title: "Limited Editions",
      description: "Get them while they last",
      link: "/blindbox?filter=limited",
      image: "https://placehold.co/500x300/fffbeb/fbbf24"
    }
  ];

  const handleNavigate = (link) => {
    navigate(link);
  };

  return (
    <div className="homepage">
      {/* Hero Banner Carousel */}
      <div className="w-full relative">
        <Carousel 
          ref={carouselRef} 
          autoplay 
          dots={true}
          autoplaySpeed={5000}
          effect="fade"
          className="custom-carousel"
        >
          {carouselSlides.map((slide) => (
            <div key={slide.id}>
              <div className="relative">
                <div 
                  className="w-full h-[500px] flex items-center"
                  style={{ 
                    background: slide.background,
                  }}
                >
                  <div className="max-w-7xl mx-auto px-6 flex items-center h-full">
                    <div className="flex flex-col md:flex-row items-center w-full">
                      {/* Conditional rendering based on image position */}
                      {slide.imagePosition === "left" ? (
                        <>
                          {/* Left side - product image */}
                          <div className="w-full md:w-1/2 flex justify-center mb-8 md:mb-0">
                            <div className="relative">
                              <img 
                                src={slide.productImage} 
                                alt={slide.productAlt} 
                                className="h-80 md:h-96 object-contain z-10 relative"
                              />
                              <div className="absolute inset-0 bg-white opacity-20 rounded-full blur-3xl -z-0"></div>
                            </div>
                          </div>
                          
                          {/* Right side - text content */}
                          <div className="w-full md:w-1/2 text-center md:text-left">
                            <div className="inline-flex flex-wrap items-center mb-4">
                              {slide.brandLogos.map((logo, index) => (
                                <div key={`logo-${index}`} className="flex items-center mr-4 mb-2">
                                  <img 
                                    src={logo.src} 
                                    alt={logo.alt} 
                                    className="h-6" 
                                  />
                                  {index < slide.brandLogos.length - 1 && (
                                    <span className="mx-2 text-white opacity-50">|</span>
                                  )}
                                </div>
                              ))}
                            </div>
                            <h1 
                              className="text-4xl md:text-5xl font-bold mb-4 tracking-wide"
                              style={{ color: slide.titleColor }}
                            >
                              {slide.title}
                            </h1>
                            <h2 className="text-xl md:text-2xl font-semibold text-white mb-8">
                              {slide.subtitle}
                            </h2>
                            <Button 
                              size="large"
                              type="primary"
                              onClick={() => handleNavigate(slide.link)}
                              className="text-lg px-8 py-6 h-auto flex items-center justify-center border-none shadow-lg hover:shadow-xl transition-shadow rounded-full"
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
                          <div className="w-full md:w-1/2 text-center md:text-left order-2 md:order-1">
                            <div className="inline-flex flex-wrap items-center mb-4">
                              {slide.brandLogos.map((logo, index) => (
                                <div key={`logo-${index}`} className="flex items-center mr-4 mb-2">
                                  <img 
                                    src={logo.src} 
                                    alt={logo.alt} 
                                    className="h-6" 
                                  />
                                  {index < slide.brandLogos.length - 1 && (
                                    <span className="mx-2 text-white opacity-50">|</span>
                                  )}
                                </div>
                              ))}
                            </div>
                            <h1 
                              className="text-4xl md:text-5xl font-bold mb-4 tracking-wide"
                              style={{ color: slide.titleColor }}
                            >
                              {slide.title}
                            </h1>
                            <h2 className="text-xl md:text-2xl font-semibold text-white mb-8">
                              {slide.subtitle}
                            </h2>
                            <Button 
                              size="large"
                              type="primary"
                              onClick={() => handleNavigate(slide.link)}
                              className="text-lg px-8 py-6 h-auto flex items-center justify-center border-none shadow-lg hover:shadow-xl transition-shadow rounded-full"
                              style={{ 
                                backgroundColor: slide.buttonBg,
                                borderColor: slide.buttonBg
                              }}
                            >
                              {slide.buttonText}
                            </Button>
                          </div>
                          
                          {/* Right side - product image (for reversed layout) */}
                          <div className="w-full md:w-1/2 flex justify-center mb-8 md:mb-0 order-1 md:order-2">
                            <div className="relative">
                              <img 
                                src={slide.productImage} 
                                alt={slide.productAlt} 
                                className="h-80 md:h-96 object-contain z-10 relative"
                              />
                              <div className="absolute inset-0 bg-white opacity-20 rounded-full blur-3xl -z-0"></div>
                            </div>
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
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm w-12 h-12 rounded-full flex items-center justify-center shadow-md z-10 cursor-pointer hover:bg-white transition-colors"
          aria-label="Previous slide"
        >
          <LeftOutlined />
        </button>
        <button 
          onClick={nextSlide} 
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm w-12 h-12 rounded-full flex items-center justify-center shadow-md z-10 cursor-pointer hover:bg-white transition-colors"
          aria-label="Next slide"
        >
          <RightOutlined />
        </button>
      </div>

      {/* BlindBox Section - New Component */}
      <BlindboxSection />

      {/* Categories Section with enhanced design */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Browse Categories</h2>
          
          <Row gutter={[24, 24]} className="mt-8">
            {categoryItems.map((item, index) => (
              <Col xs={24} md={8} key={index}>
                <div 
                  className="relative overflow-hidden rounded-xl shadow-md group cursor-pointer h-64"
                  onClick={() => handleNavigate(item.link)}
                >
                  {/* Background image with overlay */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                    style={{ backgroundImage: `url(${item.image})` }}
                  />
                  <div className="absolute inset-0 bg-black opacity-40 group-hover:opacity-50 transition-opacity" />
                  
                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                    <h3 className="text-xl font-bold mb-2 group-hover:translate-x-2 transition-transform">{item.title}</h3>
                    <p className="text-white/80 mb-4 group-hover:translate-x-2 transition-transform delay-75">{item.description}</p>
                    <div className="flex items-center font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity transform -translate-x-4 group-hover:translate-x-0">
                      <span>Shop Now</span>
                      <RightOutlined className="ml-2" />
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </section>
    </div>
  );
};

export default HomePage;