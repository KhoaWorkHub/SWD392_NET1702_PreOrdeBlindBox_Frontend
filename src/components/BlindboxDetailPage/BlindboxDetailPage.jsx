import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
  Alert,
  Radio,
  Progress,
  Card,
  Tooltip,
  Space,
  Timeline,
  Badge,
  Popover,
} from "antd";
import {
  HomeOutlined,
  ShoppingCartOutlined,
  HeartOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
  DollarOutlined,
  FireOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import blindboxService from "../../api/services/blindboxService";
import useCart from "../../hooks/useCart";
import useAuth from "../../hooks/useAuth";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "./BlindboxDetailPage.css";

dayjs.extend(relativeTime);

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

/**
 * BlindboxDetailPage component for displaying details of a specific blind box
 * and its associated campaign (Milestone or Group)
 *
 * @returns {JSX.Element} The BlindboxDetailPage component
 */
const BlindboxDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const [blindbox, setBlindbox] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [favorite, setFavorite] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedProductType, setSelectedProductType] = useState("BOX");
  const [activeTier, setActiveTier] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [depositAmount, setDepositAmount] = useState(null);
  const [remainingAmount, setRemainingAmount] = useState(null);

  // Calculate discount percentage
  const calculateDiscount = (tier) => {
    if (!tier || !tier.discountPercent) return 0;
    return tier.discountPercent;
  };

  // Calculate final price based on discount
  const calculatePrice = (basePrice, discountPercent) => {
    if (!basePrice || !discountPercent) return basePrice;
    const discountAmount = basePrice * (discountPercent / 100);
    return basePrice - discountAmount;
  };

  // Set active tier and calculate prices
  const setupPricing = () => {
    if (!blindbox || !blindbox.activeCampaign) return;

    // Find the active tier (PROCESSING status)
    const processingTier = blindbox.activeCampaign.campaignTiers.find(
      (tier) => tier.tierStatus === "PROCESSING"
    );

    if (processingTier) {
      setActiveTier(processingTier);

      // Calculate discounted price
      const basePrice =
        selectedProductType === "BOX"
          ? blindbox.boxPrice
          : blindbox.packagePrice;

      const finalPrice = calculatePrice(
        basePrice,
        processingTier.discountPercent
      );
      setCurrentPrice(finalPrice);

      // For GROUP campaigns, calculate deposit and remaining amount
      if (blindbox.activeCampaign.campaignType === "GROUP") {
        // Deposit is 50% as per business rule BR-16
        const deposit = finalPrice * 0.5;
        setDepositAmount(deposit);
        setRemainingAmount(finalPrice - deposit);
      }
    }
  };

  // Fetch blindbox details on component mount
  useEffect(() => {
    fetchBlindboxDetails();
  }, [id]);

  // When blindbox data changes or product type changes, recalculate pricing
  useEffect(() => {
    setupPricing();
  }, [blindbox, selectedProductType]);

  const fetchBlindboxDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await blindboxService.getBlindBoxSeriesById(id);
      console.log("Blindbox detail response:", response);

      if (response && response.status === true && response.metadata) {
        setBlindbox(response.metadata);
      } else {
        setError("Failed to load blind box details");
      }
    } catch (err) {
      console.error("Error in fetchBlindboxDetails:", err);
      setError(
        err.message || "An error occurred while fetching the blind box details"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (value) => {
    setQuantity(value);
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      message.warning("Please login to add items to cart");
      navigate("/login");
      return;
    }

    setAddingToCart(true);

    try {
      // Use selectedProductType to determine if it's a package or individual box
      const isPackage = selectedProductType === "PACKAGE";

      const success = await addToCart(blindbox.id, quantity, isPackage);
      if (success) {
        message.success(
          `Added ${quantity} ${isPackage ? "package(s)" : "box(es)"} to cart`
        );
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
      message.error(err.message || "Failed to add to cart. Please try again.");
    } finally {
      setAddingToCart(false);
    }
  };

  const toggleFavorite = () => {
    setFavorite(!favorite);
    message.success(favorite ? "Removed from wishlist" : "Added to wishlist");
  };

  const handleImageSelect = (index) => {
    setSelectedImage(index);
  };

  // Get tier progress percentage
  const getTierProgress = (tier) => {
    if (!tier || !blindbox.activeCampaign) return 0;

    // For PROCESSING tier, calculate percentage of progress
    if (tier.tierStatus === "PROCESSING") {
      const previousTier = blindbox.activeCampaign.campaignTiers.find(
        (t) => t.tierOrder === tier.tierOrder - 1
      );

      const startCount = previousTier ? previousTier.thresholdQuantity : 0;
      const targetCount = tier.thresholdQuantity;
      const currentCount = blindbox.activeCampaign.currentUnitsCount;

      // Calculate percentage within this tier's range
      return Math.min(
        100,
        Math.max(
          0,
          ((currentCount - startCount) / (targetCount - startCount)) * 100
        )
      );
    }

    // For ACHIEVED tiers, return 100%
    if (tier.tierStatus === "ACHIEVED") return 100;

    // For UPCOMING tiers, return 0%
    return 0;
  };

  // Get tier status color
  const getTierStatusColor = (status) => {
    switch (status) {
      case "ACHIEVED":
        return "green";
      case "PROCESSING":
        return "blue";
      case "UPCOMING":
        return "gray";
      default:
        return "default";
    }
  };

  // Get tier status icon
  const getTierStatusIcon = (status) => {
    switch (status) {
      case "ACHIEVED":
        return <CheckCircleOutlined />;
      case "PROCESSING":
        return <ClockCircleOutlined />;
      case "UPCOMING":
        return <ArrowRightOutlined />;
      default:
        return null;
    }
  };

  // Render campaign tiers
  const renderCampaignTiers = () => {
    if (
      !blindbox ||
      !blindbox.activeCampaign ||
      !blindbox.activeCampaign.campaignTiers
    ) {
      return null;
    }

    return (
      <div className="campaign-tiers mb-6">
        <Title level={5} className="mb-4">
          Campaign Tiers
        </Title>

        <div className="tiers-container">
          {blindbox.activeCampaign.campaignTiers
            .sort((a, b) => a.tierOrder - b.tierOrder)
            .map((tier) => (
              <div key={tier.id} className="tier-item mb-4">
                <div className="flex justify-between items-center mb-2">
                  <Space>
                    <Badge
                      status={
                        tier.tierStatus === "ACHIEVED"
                          ? "success"
                          : tier.tierStatus === "PROCESSING"
                          ? "processing"
                          : "default"
                      }
                    />
                    <Text strong>{tier.alias || `Tier ${tier.tierOrder}`}</Text>
                    <Tag color={getTierStatusColor(tier.tierStatus)}>
                      {tier.tierStatus}
                    </Tag>
                  </Space>
                  <Text>
                    <span className="text-green-600 font-medium">
                      {tier.discountPercent}% OFF
                    </span>
                  </Text>
                </div>

                <div className="tier-progress">
                  <Progress
                    percent={getTierProgress(tier)}
                    status={
                      tier.tierStatus === "ACHIEVED"
                        ? "success"
                        : tier.tierStatus === "PROCESSING"
                        ? "active"
                        : "normal"
                    }
                    showInfo={false}
                  />
                </div>

                <div className="flex justify-between items-center">
                  <Text type="secondary">
                    {tier.tierStatus === "ACHIEVED" ? (
                      <span className="text-green-600">Completed!</span>
                    ) : (
                      <>
                        {blindbox.activeCampaign.currentUnitsCount} /{" "}
                        {tier.thresholdQuantity}{" "}
                        {blindbox.activeCampaign.campaignType === "MILESTONE"
                          ? "units sold"
                          : "preorders"}
                      </>
                    )}
                  </Text>
                  {tier.tierStatus === "PROCESSING" && (
                    <Text type="secondary">
                      Need{" "}
                      {tier.thresholdQuantity -
                        blindbox.activeCampaign.currentUnitsCount}{" "}
                      more
                    </Text>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  };

  // Render campaign info banner
  const renderCampaignBanner = () => {
    if (!blindbox || !blindbox.activeCampaign) return null;

    const { campaignType, startCampaignTime, endCampaignTime } =
      blindbox.activeCampaign;
    const isGroup = campaignType === "GROUP";

    return (
      <div
        className={`campaign-banner ${
          isGroup ? "group-campaign" : "milestone-campaign"
        } mb-6 p-4 rounded-lg`}
      >
        <Row gutter={16} align="middle">
          <Col xs={24} sm={16}>
            <Title level={4} className="mb-1">
              <Badge status={isGroup ? "warning" : "success"} />
              {isGroup ? "GROUP PREORDER CAMPAIGN" : "MILESTONE CAMPAIGN"}
              <Tooltip
                title={
                  isGroup
                    ? "This is a preorder campaign. Products will be delivered after campaign ends. Requires 50% deposit payment."
                    : "This is a regular campaign with tiered discounts. Products are in stock and will be shipped immediately."
                }
              >
                <InfoCircleOutlined className="ml-2" />
              </Tooltip>
            </Title>
            <Text>
              {isGroup
                ? "Preorder now with 50% deposit. Final price depends on tier reached when campaign ends."
                : "Purchase now with instant shipping. Price depends on current campaign tier."}
            </Text>
            <div className="mt-2">
              <Text type="secondary">
                <ClockCircleOutlined className="mr-1" /> Campaign ends:{" "}
                {dayjs(endCampaignTime).format("MMM D, YYYY")}(
                {dayjs(endCampaignTime).fromNow()})
              </Text>
            </div>
          </Col>
          <Col xs={24} sm={8} className="text-right">
            {isGroup ? (
              <div className="text-center">
                <div className="text-lg font-semibold">
                  50% Deposit Required
                </div>
                <Button
                  type="primary"
                  className="mt-2 bg-yellow-600 hover:bg-yellow-700 border-yellow-600"
                >
                  Learn More
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-lg font-semibold">
                  In Stock & Ready to Ship
                </div>
                <Button
                  type="primary"
                  className="mt-2 bg-green-600 hover:bg-green-700 border-green-600"
                >
                  Buy Now
                </Button>
              </div>
            )}
          </Col>
        </Row>
      </div>
    );
  };

  // Render price display
  const renderPriceDisplay = () => {
    if (!blindbox) return null;

    const isGroup = blindbox.activeCampaign?.campaignType === "GROUP";
    const basePrice =
      selectedProductType === "BOX" ? blindbox.boxPrice : blindbox.packagePrice;
    const discountedPrice = currentPrice;

    return (
      <div className="price-display mb-6">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={isGroup ? 12 : 24}>
            <div className="flex items-baseline">
              <Title level={3} className="text-red-600 mb-0 mr-4">
                {Number(discountedPrice).toLocaleString()} ₫
              </Title>
              {discountedPrice < basePrice && (
                <Text delete type="secondary" className="text-lg">
                  {Number(basePrice).toLocaleString()} ₫
                </Text>
              )}
              {activeTier && (
                <Tag color="green" className="ml-2">
                  -{activeTier.discountPercent}%
                </Tag>
              )}
            </div>
          </Col>

          {isGroup && (
            <Col xs={24} md={12}>
              <Card size="small" className="deposit-info bg-gray-50">
                <div className="text-center">
                  <Text strong>Deposit Required: </Text>
                  <Text className="text-orange-600 text-lg font-semibold">
                    {Number(depositAmount).toLocaleString()} ₫
                  </Text>
                  <div className="mt-1">
                    <Text type="secondary">
                      Remaining balance:{" "}
                      {Number(remainingAmount).toLocaleString()} ₫
                      <Tooltip title="Remaining balance will be charged after campaign ends based on final tier achieved">
                        <QuestionCircleOutlined className="ml-1" />
                      </Tooltip>
                    </Text>
                  </div>
                </div>
              </Card>
            </Col>
          )}
        </Row>
      </div>
    );
  };

  // Render campaign timeline
  const renderCampaignTimeline = () => {
    if (!blindbox || !blindbox.activeCampaign) return null;

    const isGroup = blindbox.activeCampaign.campaignType === "GROUP";
    const { startCampaignTime, endCampaignTime } = blindbox.activeCampaign;

    const items = [
      {
        dot: <Badge status="success" />,
        children: (
          <div>
            <p>
              <strong>Campaign Started</strong>
            </p>
            <p>{dayjs(startCampaignTime).format("MMM D, YYYY")}</p>
          </div>
        ),
      },
      {
        dot: <Badge status="processing" />,
        children: (
          <div>
            <p>
              <strong>Current Stage</strong>
            </p>
            <p>Campaign in progress</p>
          </div>
        ),
      },
      {
        dot: <Badge status="default" />,
        children: (
          <div>
            <p>
              <strong>Campaign Ends</strong>
            </p>
            <p>{dayjs(endCampaignTime).format("MMM D, YYYY")}</p>
          </div>
        ),
      },
    ];

    // Add payment deadline for GROUP campaigns
    if (isGroup) {
      items.push({
        dot: <Badge status="warning" />,
        children: (
          <div>
            <p>
              <strong>Payment Deadline</strong>
            </p>
            <p>{dayjs(endCampaignTime).add(14, "day").format("MMM D, YYYY")}</p>
            <p className="text-xs text-orange-600">
              Must pay remaining balance within 14 days after campaign ends
            </p>
          </div>
        ),
      });
    }

    return (
      <div className="campaign-timeline mb-6">
        <Title level={5}>Campaign Timeline</Title>
        <Timeline items={items} />
      </div>
    );
  };

  // Render blindbox items
  const renderBlindboxItems = () => {
    if (!blindbox || !blindbox.items || blindbox.items.length === 0) {
      return <Empty description="No items information available" />;
    }

    return (
      <div className="blindbox-items">
        <Title level={5} className="mb-4">
          Possible Items
        </Title>
        <Row gutter={[16, 16]}>
          {blindbox.items.map((item) => (
            <Col xs={12} sm={8} md={6} key={item.id}>
              <Card
                hoverable
                className="item-card"
                cover={
                  <div className="item-image-container">
                    {item.imageUrls && item.imageUrls.length > 0 ? (
                      <img
                        alt={item.itemName}
                        src={item.imageUrls[0]}
                        className="item-image"
                      />
                    ) : (
                      <div className="placeholder-image">
                        <QuestionCircleOutlined />
                      </div>
                    )}
                  </div>
                }
              >
                <Card.Meta
                  title={item.itemName}
                  description={
                    <Tag
                      color={
                        item.itemChance <= 5
                          ? "red"
                          : item.itemChance <= 15
                          ? "orange"
                          : item.itemChance <= 25
                          ? "blue"
                          : "green"
                      }
                    >
                      {item.itemChance}% chance
                    </Tag>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    );
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
            <Link to="/blindbox">All Blind Boxes</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Error</Breadcrumb.Item>
        </Breadcrumb>

        <Alert
          message="Error Loading Details"
          description={
            <div>
              <p>{error}</p>
              <div className="mt-4">
                <Button
                  type="primary"
                  onClick={() => navigate("/blindbox")}
                  className="mr-4"
                >
                  Back to all blind boxes
                </Button>
                <Button
                  icon={<ClockCircleOutlined />}
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
          <Link to="/blindbox">All Blind Boxes</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          {loading ? "Loading..." : blindbox?.seriesName || "Blind Box Detail"}
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
      ) : (
        blindbox && (
          <>
            {/* Campaign Info Banner */}
            {blindbox.activeCampaign && renderCampaignBanner()}

            <Row gutter={[48, 24]}>
              <Col xs={24} md={12}>
                <div className="bg-gray-50 p-8 rounded-lg">
                  <Image
                    src={
                      blindbox.seriesImageUrls &&
                      blindbox.seriesImageUrls.length > 0
                        ? blindbox.seriesImageUrls[selectedImage]
                        : "https://placehold.co/600x600?text=No+Image"
                    }
                    alt={blindbox.seriesName}
                    className="w-full object-contain"
                    fallback="https://placehold.co/600x600?text=No+Image"
                  />
                </div>

                {/* Image gallery */}
                {blindbox.seriesImageUrls &&
                  blindbox.seriesImageUrls.length > 0 && (
                    <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                      {blindbox.seriesImageUrls.map((imageUrl, index) => (
                        <div
                          key={index}
                          className={`w-24 h-24 flex-shrink-0 bg-gray-50 rounded cursor-pointer hover:opacity-75 transition-opacity ${
                            selectedImage === index
                              ? "border-2 border-blue-500"
                              : ""
                          }`}
                          onClick={() => handleImageSelect(index)}
                        >
                          <img
                            src={
                              imageUrl ||
                              `https://placehold.co/100x100?text=View+${
                                index + 1
                              }`
                            }
                            alt={`Product view ${index + 1}`}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ))}
                    </div>
                  )}
              </Col>

              <Col xs={24} md={12}>
                <Title level={2}>{blindbox.seriesName}</Title>

                {/* ID and stock info */}
                <div className="mb-4">
                  <Text type="secondary">Series ID: {blindbox.id}</Text>
                  <div className="mt-2 flex gap-2">
                    <Tag color="blue">
                      Available Boxes: {blindbox.availableBoxUnits}
                    </Tag>
                    <Tag color="purple">
                      Available Packages: {blindbox.availablePackageUnits}
                    </Tag>
                    {blindbox.active ? (
                      <Tag color="green">Active</Tag>
                    ) : (
                      <Tag color="red">Inactive</Tag>
                    )}
                  </div>
                </div>

                {/* Campaign Tiers Progress */}
                {blindbox.activeCampaign && renderCampaignTiers()}

                {/* Price Display */}
                {renderPriceDisplay()}

                {/* Campaign Timeline */}
                {blindbox.activeCampaign && renderCampaignTimeline()}

                <Divider />

                {/* Description */}
                <div className="mb-6">
                  <Title level={4}>Description</Title>
                  <Paragraph>
                    {blindbox.description ||
                      "No description available for this product."}
                  </Paragraph>
                </div>

                <Divider />

                {/* Add to cart section */}
                <div className="mb-6">
                  <Radio.Group
                    value={selectedProductType}
                    onChange={(e) => setSelectedProductType(e.target.value)}
                    className="mb-4"
                  >
                    <Radio.Button value="BOX">
                      Single Box ({Number(blindbox.boxPrice).toLocaleString()}{" "}
                      ₫)
                    </Radio.Button>
                    {blindbox.packagePrice &&
                      blindbox.availablePackageUnits > 0 && (
                        <Radio.Button value="PACKAGE">
                          Package (
                          {Number(blindbox.packagePrice).toLocaleString()} ₫)
                        </Radio.Button>
                      )}
                  </Radio.Group>

                  <div className="flex items-center gap-4 mb-4">
                    <Text>Quantity:</Text>
                    <InputNumber
                      min={1}
                      max={
                        selectedProductType === "BOX"
                          ? blindbox.availableBoxUnits
                          : blindbox.availablePackageUnits
                      }
                      value={quantity}
                      onChange={handleQuantityChange}
                    />
                    <Text type="secondary">
                      {selectedProductType === "BOX"
                        ? `${blindbox.availableBoxUnits} boxes available`
                        : `${blindbox.availablePackageUnits} packages available`}
                    </Text>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {blindbox.activeCampaign?.campaignType === "GROUP" ? (
                      <Button
                        type="primary"
                        icon={<DollarOutlined />}
                        size="large"
                        onClick={handleAddToCart}
                        className="bg-orange-600 hover:bg-orange-700 flex-1"
                        loading={addingToCart}
                        disabled={!blindbox.active || addingToCart}
                      >
                        {addingToCart ? "Adding..." : "Pre-order with Deposit"}
                      </Button>
                    ) : (
                      <Button
                        type="primary"
                        icon={<ShoppingCartOutlined />}
                        size="large"
                        onClick={handleAddToCart}
                        className="bg-black hover:bg-gray-800 flex-1"
                        loading={addingToCart}
                        disabled={!blindbox.active || addingToCart}
                      >
                        {addingToCart ? "Adding..." : "Add to Cart"}
                      </Button>
                    )}

                    <Button
                      icon={
                        favorite ? (
                          <HeartOutlined className="text-red-500" />
                        ) : (
                          <HeartOutlined />
                        )
                      }
                      size="large"
                      onClick={toggleFavorite}
                      className={favorite ? "border-red-200" : ""}
                    />
                  </div>

                  {blindbox.activeCampaign?.campaignType === "GROUP" && (
                    <Alert
                      className="mt-4"
                      message="Pre-order Information"
                      description={
                        <div>
                          <p>
                            This is a pre-order campaign. You will be charged a
                            50% deposit (
                            {Number(depositAmount).toLocaleString()} ₫) now, and
                            the remaining balance after the campaign ends.
                          </p>
                          <p className="mt-2">
                            Final price will be determined by the tier reached
                            when the campaign ends. You must complete the full
                            payment within 14 days after the campaign ends or
                            your deposit will be forfeited.
                          </p>
                        </div>
                      }
                      type="warning"
                      showIcon
                    />
                  )}

                  {!isAuthenticated && (
                    <div className="mt-3">
                      <Text type="secondary">
                        <Link to="/login">Sign in</Link> to save items in your
                        cart
                      </Text>
                    </div>
                  )}
                </div>
              </Col>
            </Row>

            {/* Blindbox Items */}
            <div className="mt-12">
              <Divider orientation="left">
                <Title level={3}>Possible Items</Title>
              </Divider>
              {renderBlindboxItems()}
            </div>

            {/* Additional Product Information */}
            <div className="mt-12">
              <Tabs defaultActiveKey="details">
                <TabPane tab="Product Details" key="details">
                  <div className="p-6 bg-gray-50 rounded-lg">
                    <Title level={4} className="mb-4">
                      Product Specifications
                    </Title>
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
                        <div>
                          {Number(blindbox.boxPrice).toLocaleString()} ₫
                        </div>
                      </Col>
                      <Col xs={24} sm={12} md={8}>
                        <Text strong>Package Price:</Text>
                        <div>
                          {Number(blindbox.packagePrice).toLocaleString()} ₫
                        </div>
                      </Col>
                      <Col xs={24} sm={12} md={8}>
                        <Text strong>Available Box Units:</Text>
                        <div>{blindbox.availableBoxUnits}</div>
                      </Col>
                      <Col xs={24} sm={12} md={8}>
                        <Text strong>Available Package Units:</Text>
                        <div>{blindbox.availablePackageUnits}</div>
                      </Col>
                      {blindbox.activeCampaign && (
                        <>
                          <Col xs={24} sm={12} md={8}>
                            <Text strong>Campaign Type:</Text>
                            <div>
                              <Tag
                                color={
                                  blindbox.activeCampaign.campaignType ===
                                  "GROUP"
                                    ? "orange"
                                    : "green"
                                }
                              >
                                {blindbox.activeCampaign.campaignType}
                              </Tag>
                            </div>
                          </Col>
                          <Col xs={24} sm={12} md={8}>
                            <Text strong>Campaign Start:</Text>
                            <div>
                              {dayjs(
                                blindbox.activeCampaign.startCampaignTime
                              ).format("MMM D, YYYY")}
                            </div>
                          </Col>
                          <Col xs={24} sm={12} md={8}>
                            <Text strong>Campaign End:</Text>
                            <div>
                              {dayjs(
                                blindbox.activeCampaign.endCampaignTime
                              ).format("MMM D, YYYY")}
                            </div>
                          </Col>
                        </>
                      )}
                      <Col xs={24} sm={12} md={8}>
                        <Text strong>Status:</Text>
                        <div>{blindbox.active ? "Active" : "Inactive"}</div>
                      </Col>
                      <Col xs={24} sm={12} md={8}>
                        <Text strong>Number of Items:</Text>
                        <div>{blindbox.items?.length || 0}</div>
                      </Col>
                    </Row>
                  </div>
                </TabPane>
                <TabPane tab="Campaign Details" key="campaign">
                  {blindbox.activeCampaign ? (
                    <div className="p-6 bg-gray-50 rounded-lg">
                      <Title level={4} className="mb-4">
                        {blindbox.activeCampaign.campaignType === "GROUP"
                          ? "Group Preorder Campaign Details"
                          : "Milestone Campaign Details"}
                      </Title>

                      <Paragraph>
                        {blindbox.activeCampaign.campaignType === "GROUP"
                          ? "This is a GROUP preorder campaign. Products will be manufactured after the campaign ends. You will need to pay a 50% deposit now and the remaining balance after the campaign ends."
                          : "This is a MILESTONE campaign. Products are already in stock and will be shipped immediately after purchase. Price depends on the current active tier."}
                      </Paragraph>

                      <Title level={5} className="mt-4 mb-2">
                        Campaign Rules
                      </Title>
                      <ul className="list-disc pl-6 mb-4">
                        {blindbox.activeCampaign.campaignType === "GROUP" ? (
                          <>
                            <li>50% deposit is required to place a preorder</li>
                            <li>
                              Final price depends on the tier reached when
                              campaign ends
                            </li>
                            <li>
                              You must complete full payment within 14 days
                              after campaign ends
                            </li>
                            <li>
                              If payment is not completed within the grace
                              period, your deposit will be forfeited
                            </li>
                            <li>
                              Product will be shipped after full payment is
                              received
                            </li>
                          </>
                        ) : (
                          <>
                            <li>Products are in stock and ready to ship</li>
                            <li>
                              Price is determined by the current active tier
                            </li>
                            <li>
                              As more units are sold, higher tiers with better
                              discounts may be unlocked
                            </li>
                            <li>
                              You pay the price based on the tier active at the
                              time of your purchase
                            </li>
                          </>
                        )}
                      </ul>

                      <Title level={5} className="mt-4 mb-2">
                        Campaign Progress
                      </Title>
                      <Row gutter={[16, 16]}>
                        <Col span={24}>
                          <Card className="campaign-progress-card">
                            <Title level={5} className="text-center mb-4">
                              {blindbox.activeCampaign.currentUnitsCount}{" "}
                              {blindbox.activeCampaign.campaignType === "GROUP"
                                ? "Preorders"
                                : "Units Sold"}
                            </Title>

                            {blindbox.activeCampaign.campaignTiers
                              .sort((a, b) => a.tierOrder - b.tierOrder)
                              .map((tier, index) => (
                                <div key={tier.id} className="mb-3">
                                  <div className="flex justify-between">
                                    <Text>
                                      {getTierStatusIcon(tier.tierStatus)} Tier{" "}
                                      {tier.tierOrder}: {tier.discountPercent}%
                                      OFF
                                    </Text>
                                    <Text>{tier.thresholdQuantity} units</Text>
                                  </div>
                                  <Progress
                                    percent={getTierProgress(tier)}
                                    size="small"
                                    status={
                                      tier.tierStatus === "ACHIEVED"
                                        ? "success"
                                        : tier.tierStatus === "PROCESSING"
                                        ? "active"
                                        : "normal"
                                    }
                                  />
                                </div>
                              ))}
                          </Card>
                        </Col>
                      </Row>
                    </div>
                  ) : (
                    <Empty description="No active campaign for this product" />
                  )}
                </TabPane>
                <TabPane tab="Shipping & Returns" key="shipping">
                  <div className="p-6 bg-gray-50 rounded-lg">
                    <Title level={4} className="mb-4">
                      Shipping Information
                    </Title>
                    <Paragraph>
                      All orders are processed within 1-2 business days. Orders
                      placed on weekends or holidays will be processed on the
                      next business day.
                    </Paragraph>

                    {blindbox.activeCampaign?.campaignType === "GROUP" && (
                      <Alert
                        className="my-4"
                        message="Preorder Shipping"
                        description="For preorder campaigns, shipping will begin after the campaign ends and all payments are completed. Estimated delivery time will be provided after the campaign ends."
                        type="info"
                        showIcon
                      />
                    )}

                    <Title level={4} className="mt-6 mb-4">
                      Return Policy
                    </Title>
                    <Paragraph>
                      We offer a 14-day return policy for unopened items in
                      their original packaging. Please contact our customer
                      service team to initiate a return.
                    </Paragraph>

                    {blindbox.activeCampaign?.campaignType === "GROUP" && (
                      <Alert
                        className="mt-4"
                        message="Preorder Cancellation Policy"
                        description="Preorders cannot be cancelled after the campaign ends. If you fail to complete the full payment within 14 days after the campaign ends, your deposit will be forfeited."
                        type="warning"
                        showIcon
                      />
                    )}
                  </div>
                </TabPane>
                <TabPane tab="Reviews" key="reviews">
                  <div className="p-6 bg-gray-50 rounded-lg text-center">
                    <p>No reviews yet for this product.</p>
                    <Button type="primary" className="mt-4">
                      Be the first to review
                    </Button>
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
                            alt={`Related product ${i + 1}`}
                            src={`https://placehold.co/300x300?text=Related+${
                              i + 1
                            }`}
                            className="h-full object-contain"
                          />
                        </div>
                      }
                      bodyStyle={{ padding: "12px" }}
                      bordered={false}
                      className="shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="text-sm font-medium mb-2 line-clamp-2 h-10">
                        Related Blind Box Series {i + 1}
                      </div>
                      <div className="text-sm font-semibold">
                        {(blindbox.boxPrice * 0.9).toLocaleString()} ₫
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          </>
        )
      )}
    </div>
  );
};

export default BlindboxDetailPage;
