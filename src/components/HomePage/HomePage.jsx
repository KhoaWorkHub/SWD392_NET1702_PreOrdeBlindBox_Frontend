// HomePage.jsx
// This implementation focuses on using all fields from your API response
import { useRef, useState } from "react";
import { Button, Row, Col, Carousel, Skeleton, Card, Tag } from "antd";
import {
  RightOutlined,
  LeftOutlined,
  ShoppingCartOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import useBlindbox from "../../hooks/useBlindbox";
import useCart from "../../hooks/useCart";
import useAuth from "../../hooks/useAuth";

export const HomePage = () => {
  const carouselRef = useRef(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [addingToCart, setAddingToCart] = useState({});
  const [favoriteItems, setFavoriteItems] = useState({});

  // Fetch latest blind boxes
  const { blindboxData: featuredData, loading: featuredLoading } = useBlindbox({
    size: 4,
    sort: "id,desc", // Get newest first
  });

  // Helper functions
  const nextSlide = () => {
    carouselRef.current.next();
  };

  const prevSlide = () => {
    carouselRef.current.prev();
  };

  const getGradientForIndex = (index) => {
    const gradients = [
      "linear-gradient(to right, #ff9a9e, #fad0c4)",
      "linear-gradient(to right, #a1c4fd, #c2e9fb)",
      "linear-gradient(to right, #d4fc79, #96e6a1)",
      "linear-gradient(to right, #ffecd2, #fcb69f)",
    ];
    return gradients[index % gradients.length];
  };

  // Handle adding item to cart
  const handleAddToCart = async (blindbox, isPackage = false) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setAddingToCart((prev) => ({ ...prev, [blindbox.id]: true }));

    try {
      // Use packagePrice if isPackage is true, otherwise use boxPrice
      const price = isPackage ? blindbox.packagePrice : blindbox.boxPrice;
      await addToCart(blindbox.id, 1, isPackage);
    } finally {
      setAddingToCart((prev) => ({ ...prev, [blindbox.id]: false }));
    }
  };

  // Toggle favorite status
  const toggleFavorite = (id) => {
    setFavoriteItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Render the blind box card with all API fields
  const renderBlindboxCard = (blindbox, index) => (
    <Card
      hoverable
      className="transition-all duration-300 hover:shadow-lg h-full"
      cover={
        <div className="bg-gray-50 p-4 flex items-center justify-center h-64">
          <img
            src={
              blindbox.seriesImageUrls?.[0] ||
              `https://placehold.co/300x300?text=${blindbox.seriesName}`
            }
            alt={blindbox.seriesName}
            className="h-full object-contain"
          />
        </div>
      }
      actions={[
        // eslint-disable-next-line react/jsx-key
        <Button
          type="text"
          icon={<ShoppingCartOutlined />}
          loading={addingToCart[blindbox.id]}
          onClick={(e) => {
            e.stopPropagation();
            handleAddToCart(blindbox, false); // Add single box
          }}
        >
          Box
        </Button>,
        blindbox.packagePrice && (
          <Button
            type="text"
            icon={<ShoppingCartOutlined />}
            loading={addingToCart[blindbox.id]}
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart(blindbox, true); // Add package
            }}
          >
            Package
          </Button>
        ),
        // eslint-disable-next-line react/jsx-key
        <Button
          type="text"
          icon={
            favoriteItems[blindbox.id] ? (
              <HeartOutlined style={{ color: "red" }} />
            ) : (
              <HeartOutlined />
            )
          }
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(blindbox.id);
          }}
        />,
      ]}
      onClick={() => navigate(`/blindbox/${blindbox.id}`)}
    >
      <div className="flex flex-col h-full">
        <div className="mb-2">
          <Tag color="blue">Series {blindbox.id}</Tag>
          {blindbox.active ? (
            <Tag color="green">In Stock</Tag>
          ) : (
            <Tag color="red">Out of Stock</Tag>
          )}
        </div>
        <h3 className="font-medium text-base line-clamp-2 mb-2">
          {blindbox.seriesName}
        </h3>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">
          {blindbox.description}
        </p>
        <div className="mt-auto">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-red-600 font-semibold">
                Box: {Number(blindbox.boxPrice).toLocaleString()} ₫
              </div>
              {blindbox.packagePrice && (
                <div className="text-orange-600">
                  Package: {Number(blindbox.packagePrice).toLocaleString()} ₫
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

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
        >
          {featuredLoading ? (
            <div className="h-[500px] bg-gray-100 flex items-center justify-center">
              <Skeleton active paragraph={{ rows: 4 }} />
            </div>
          ) : (
            featuredData.map((blindbox, index) => (
              <div key={blindbox.id}>
                <div
                  className="w-full h-[500px] flex items-center"
                  style={{ background: getGradientForIndex(index) }}
                >
                  <div className="max-w-7xl mx-auto px-6 flex items-center h-full">
                    <div className="flex flex-col md:flex-row items-center w-full">
                      {/* Product image */}
                      <div className="w-full md:w-1/2 flex justify-center mb-8 md:mb-0">
                        <div className="relative">
                          <img
                            src={
                              blindbox.seriesImageUrls?.[0] ||
                              `https://placehold.co/400x400?text=${blindbox.seriesName}`
                            }
                            alt={blindbox.seriesName}
                            className="h-80 md:h-96 object-contain z-10 relative"
                          />
                          <div className="absolute inset-0 bg-white opacity-20 rounded-full blur-3xl -z-0"></div>
                        </div>
                      </div>

                      {/* Text content */}
                      <div className="w-full md:w-1/2 text-center md:text-left">
                        <div className="mb-4">
                          <Tag color="blue" className="mr-2">
                            Series {blindbox.id}
                          </Tag>
                          {blindbox.active ? (
                            <Tag color="green">In Stock</Tag>
                          ) : (
                            <Tag color="red">Out of Stock</Tag>
                          )}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-wide text-white">
                          {blindbox.seriesName}
                        </h1>
                        <p className="text-lg text-white mb-8 line-clamp-2">
                          {blindbox.description}
                        </p>

                        {/* Pricing information - using both boxPrice and packagePrice */}
                        <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg mb-6 inline-block">
                          <div className="text-white text-xl mb-2">
                            <span className="font-bold">Single Box:</span>{" "}
                            {Number(blindbox.boxPrice).toLocaleString()} ₫
                          </div>
                          {blindbox.packagePrice && (
                            <div className="text-white text-xl">
                              <span className="font-bold">Package:</span>{" "}
                              {Number(blindbox.packagePrice).toLocaleString()} ₫
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                          <Button
                            size="large"
                            type="primary"
                            onClick={() => navigate(`/blindbox/${blindbox.id}`)}
                            className="bg-black hover:bg-gray-800 border-0"
                          >
                            View Details
                          </Button>
                          <Button
                            size="large"
                            onClick={() => handleAddToCart(blindbox)}
                            loading={addingToCart[blindbox.id]}
                            icon={<ShoppingCartOutlined />}
                          >
                            Add to Cart
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </Carousel>

        {/* Carousel navigation buttons */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm w-12 h-12 rounded-full flex items-center justify-center shadow-md z-10 cursor-pointer hover:bg-white transition-colors"
        >
          <LeftOutlined />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 backdrop-blur-sm w-12 h-12 rounded-full flex items-center justify-center shadow-md z-10 cursor-pointer hover:bg-white transition-colors"
        >
          <RightOutlined />
        </button>
      </div>

      {/* Featured Collections Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold">Featured Collections</h2>
              <p className="text-gray-500 mt-2">
                Explore our latest blind box series
              </p>
            </div>
            <Button
              type="link"
              onClick={() => navigate("/blindbox")}
              className="flex items-center text-black"
            >
              View All <RightOutlined className="ml-1" />
            </Button>
          </div>

          <Row gutter={[24, 24]}>
            {featuredLoading
              ? Array(4)
                  .fill()
                  .map((_, i) => (
                    <Col xs={24} sm={12} md={6} key={`skeleton-${i}`}>
                      <Card>
                        <Skeleton active paragraph={{ rows: 3 }} />
                      </Card>
                    </Col>
                  ))
              : featuredData.map((blindbox, index) => (
                  <Col xs={24} sm={12} md={6} key={`featured-${blindbox.id}`}>
                    {renderBlindboxCard(blindbox, index)}
                  </Col>
                ))}
          </Row>
        </div>
      </section>

      {/* About Blind Boxes Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <Row gutter={24} align="middle">
            <Col xs={24} md={12} className="mb-8 md:mb-0">
              <h2 className="text-4xl font-bold mb-4">About Our Blind Boxes</h2>
              <p className="text-xl mb-6">
                Discover the thrill of mystery collectibles
              </p>
              <p className="text-gray-600 mb-4">
                Each blind box contains a surprise figurine from your favorite
                series. Collect them all and find the rare special editions!
              </p>
              <p className="text-gray-600 mb-8">
                Our blind boxes feature high-quality materials and detailed
                craftsmanship, making them perfect for collectors and
                enthusiasts alike.
              </p>
              <Button
                type="primary"
                size="large"
                onClick={() => navigate("/blindbox")}
                className="bg-black hover:bg-gray-800 border-0"
              >
                Browse Collections
              </Button>
            </Col>
            <Col xs={24} md={12}>
              <div className="grid grid-cols-2 gap-4">
                {featuredData.slice(0, 4).map((blindbox) => (
                  <div
                    key={`about-${blindbox.id}`}
                    className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/blindbox/${blindbox.id}`)}
                  >
                    <div className="h-40 flex items-center justify-center mb-3">
                      <img
                        src={
                          blindbox.seriesImageUrls?.[0] ||
                          `https://placehold.co/200x200?text=${blindbox.seriesName}`
                        }
                        alt={blindbox.seriesName}
                        className="h-full object-contain"
                      />
                    </div>
                    <h3 className="text-sm font-medium line-clamp-1">
                      {blindbox.seriesName}
                    </h3>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-red-600 font-medium">
                        {Number(blindbox.boxPrice).toLocaleString()} ₫
                      </span>
                      <Tag
                        color={blindbox.active ? "green" : "red"}
                        className="m-0"
                      >
                        {blindbox.active ? "In Stock" : "Out of Stock"}
                      </Tag>
                    </div>
                  </div>
                ))}
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* Collecting Guide Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Blind Box Collection Guide
          </h2>

          <Row gutter={[32, 32]}>
            <Col xs={24} sm={8}>
              <div className="text-center p-6 bg-gray-50 rounded-lg h-full">
                <div className="text-4xl mb-4 flex justify-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-2xl">1</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  Choose Your Series
                </h3>
                <p className="text-gray-600">
                  Browse our extensive collection of blind box series and find
                  the ones that match your style.
                </p>
              </div>
            </Col>

            <Col xs={24} sm={8}>
              <div className="text-center p-6 bg-gray-50 rounded-lg h-full">
                <div className="text-4xl mb-4 flex justify-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold text-2xl">2</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  Unbox Your Surprise
                </h3>
                <p className="text-gray-600">
                  Experience the excitement of opening your blind box and
                  discovering which figurine you got!
                </p>
              </div>
            </Col>

            <Col xs={24} sm={8}>
              <div className="text-center p-6 bg-gray-50 rounded-lg h-full">
                <div className="text-4xl mb-4 flex justify-center">
                  <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-bold text-2xl">
                      3
                    </span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3">
                  Complete Your Collection
                </h3>
                <p className="text-gray-600">
                  Keep collecting to find all the figurines in each series,
                  including rare special editions!
                </p>
              </div>
            </Col>
          </Row>

          <div className="mt-12 text-center">
            <Button
              type="primary"
              size="large"
              onClick={() => navigate("/blindbox")}
              className="bg-black hover:bg-gray-800 border-0"
            >
              Start Collecting
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
          <p className="text-gray-600 mb-8">
            Subscribe to our newsletter for the latest releases, exclusive
            offers, and collection tips
          </p>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 h-12 px-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
            <Button
              type="primary"
              size="large"
              className="h-12 px-8 bg-black hover:bg-gray-800 border-0"
            >
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
