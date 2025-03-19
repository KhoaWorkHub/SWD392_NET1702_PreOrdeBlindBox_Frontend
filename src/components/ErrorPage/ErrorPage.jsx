/* eslint-disable react/prop-types */
import { Link, useNavigate } from "react-router-dom";
import { 
  Result, 
  Button, 
  Typography, 
  Row, 
  Col, 
  Card, 
  Breadcrumb, 
  Space 
} from "antd";
import {
  HomeOutlined,
  ArrowLeftOutlined,
  ReloadOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

/**
 * ErrorPage component - A versatile error and empty state component
 * Used to display various error states including 404, API errors, empty searches, etc.
 * 
 * @param {Object} props Component props
 * @param {string} props.type - Error type: 'not-found', 'api-error', 'empty-search', 'access-denied', 'server-error'
 * @param {string} props.title - Custom title for the error message
 * @param {string} props.subTitle - Custom subtitle/description
 * @param {string} props.message - Technical error message (optional, for debugging)
 * @param {Function} props.onRetry - Function to call when retry button is clicked
 * @param {boolean} props.showBreadcrumb - Whether to show the breadcrumb navigation
 * @param {boolean} props.showRelatedItems - Whether to show related items section
 * @param {Array} props.breadcrumbItems - Custom breadcrumb items
 * @returns {JSX.Element} The ErrorPage component
 */
const ErrorPage = ({ 
  type = "not-found",
  title,
  subTitle,
  message,
  onRetry,
  showBreadcrumb = true,
  showRelatedItems = true,
  breadcrumbItems
}) => {
  const navigate = useNavigate();

  // Configuration for different error types
  const errorTypes = {
    "not-found": {
      status: "404",
      defaultTitle: "Page Not Found",
      defaultSubTitle: "Sorry, the page you visited does not exist.",
      primaryAction: {
        text: "Back to Home",
        icon: <HomeOutlined />,
        onClick: () => navigate("/")
      },
      secondaryAction: {
        text: "Go Back",
        icon: <ArrowLeftOutlined />,
        onClick: () => navigate(-1)
      }
    },
    "api-error": {
      status: "error",
      defaultTitle: "Failed to Load Data",
      defaultSubTitle: "We encountered an issue while fetching the data. Please try again.",
      primaryAction: {
        text: "Try Again",
        icon: <ReloadOutlined />,
        onClick: onRetry || (() => window.location.reload())
      },
      secondaryAction: {
        text: "Go Back",
        icon: <ArrowLeftOutlined />,
        onClick: () => navigate(-1)
      }
    },
    "empty-search": {
      status: "info",
      defaultTitle: "No Results Found",
      defaultSubTitle: "We couldn't find any items matching your search criteria.",
      primaryAction: {
        text: "Clear Filters",
        icon: <ReloadOutlined />,
        onClick: onRetry || (() => navigate(-1))
      },
      secondaryAction: {
        text: "Browse All",
        icon: <ShoppingOutlined />,
        onClick: () => navigate("/blindbox")
      }
    },
    "access-denied": {
      status: "403",
      defaultTitle: "Access Denied",
      defaultSubTitle: "Sorry, you are not authorized to access this page.",
      primaryAction: {
        text: "Go to Home",
        icon: <HomeOutlined />,
        onClick: () => navigate("/")
      },
      secondaryAction: {
        text: "Go Back",
        icon: <ArrowLeftOutlined />,
        onClick: () => navigate(-1)
      }
    },
    "server-error": {
      status: "500",
      defaultTitle: "Server Error",
      defaultSubTitle: "Sorry, something went wrong on our server.",
      primaryAction: {
        text: "Try Again",
        icon: <ReloadOutlined />,
        onClick: onRetry || (() => window.location.reload())
      },
      secondaryAction: {
        text: "Go to Home",
        icon: <HomeOutlined />,
        onClick: () => navigate("/")
      }
    }
  };

  // Get configuration for current error type
  const config = errorTypes[type] || errorTypes["not-found"];
  
  // Use custom title/subtitle if provided, otherwise use defaults
  const displayTitle = title || config.defaultTitle;
  const displaySubTitle = subTitle || config.defaultSubTitle;

  // Generate default breadcrumb items based on error type
  const getDefaultBreadcrumbItems = () => {
    const items = [
      {
        title: <Link to="/"><HomeOutlined /> Home</Link>,
      }
    ];

    if (type === "not-found") {
      items.push({ title: "Page Not Found" });
    } else if (type === "api-error") {
      items.push({ title: "Error" });
    } else if (type === "empty-search") {
      items.push({ 
        title: <Link to="/blindbox">Blind Boxes</Link> 
      });
      items.push({ title: "No Results" });
    } else if (type === "access-denied") {
      items.push({ title: "Access Denied" });
    } else if (type === "server-error") {
      items.push({ title: "Server Error" });
    }

    return items;
  };

  // Use custom breadcrumb items if provided, otherwise use defaults
  const breadcrumbsToShow = breadcrumbItems || getDefaultBreadcrumbItems();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb Navigation */}
      {showBreadcrumb && (
        <Breadcrumb items={breadcrumbsToShow} className="mb-6" />
      )}

      {/* Main Error Content */}
      <Card className="mb-8">
        <Row gutter={[32, 32]} align="middle">
          <Col xs={24} md={12} className="text-center md:text-left">
            <Result
              status={config.status}
              title={displayTitle}
              subTitle={displaySubTitle}
              extra={
                <Space size="middle">
                  <Button 
                    type="primary" 
                    onClick={config.primaryAction.onClick}
                    icon={config.primaryAction.icon}
                    className="bg-black hover:bg-gray-800"
                  >
                    {config.primaryAction.text}
                  </Button>
                  <Button 
                    onClick={config.secondaryAction.onClick}
                    icon={config.secondaryAction.icon}
                  >
                    {config.secondaryAction.text}
                  </Button>
                </Space>
              }
            />

            {/* Technical error message (if provided) */}
            {message && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <Text type="secondary">{message}</Text>
              </div>
            )}
          </Col>
          
          <Col xs={24} md={12} className="flex justify-center">
            <img 
              src={`https://placehold.co/400x300/f5f5f5/a1a1aa?text=${config.status}`}
              alt={`${displayTitle} illustration`}
              className="max-w-full h-auto"
              style={{ objectFit: 'contain' }}
            />
          </Col>
        </Row>
      </Card>

      {/* Related Products Section (optional) */}
      {showRelatedItems && (type === "not-found" || type === "empty-search") && (
        <div className="mt-8">
          <Title level={3} className="mb-6 text-center">You May Also Like</Title>
          <Row gutter={[24, 24]}>
            {[...Array(4)].map((_, i) => (
              <Col xs={24} sm={12} md={6} key={i}>
                <Card
                  hoverable
                  cover={
                    <div className="p-4 bg-gray-50 h-48 flex items-center justify-center">
                      <img
                        alt={`Product ${i + 1}`}
                        src={`https://placehold.co/200x200/f5f5f5/a0aec0?text=Product+${i + 1}`}
                        className="h-full object-contain"
                      />
                    </div>
                  }
                  bodyStyle={{ padding: "12px" }}
                  className="shadow-sm hover:shadow-md transition-shadow"
                  onClick={() => navigate('/blindbox/1')}
                >
                  <div className="text-sm font-medium mb-2 line-clamp-2">
                    Mystery Box Series {i + 1}
                  </div>
                  <div className="text-sm font-semibold">
                    {(250000 + i * 50000).toLocaleString()} ₫
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}
    </div>
  );
};

// Convenience exports for different error types
export const NotFoundPage = (props) => <ErrorPage type="not-found" {...props} />;
export const ApiErrorPage = (props) => <ErrorPage type="api-error" {...props} />;
export const EmptySearchPage = (props) => <ErrorPage type="empty-search" {...props} />;
export const AccessDeniedPage = (props) => <ErrorPage type="access-denied" {...props} />;
export const ServerErrorPage = (props) => <ErrorPage type="server-error" {...props} />;

export default ErrorPage;