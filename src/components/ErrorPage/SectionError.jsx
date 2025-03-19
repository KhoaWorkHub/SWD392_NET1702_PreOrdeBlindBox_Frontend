/* eslint-disable react/prop-types */
import { Button, Empty, Typography, Space } from "antd";
import {
  ReloadOutlined,
  SearchOutlined,
  WarningOutlined,
  InfoCircleOutlined
} from "@ant-design/icons";

const { Text } = Typography;

/**
 * SectionError component - A compact error component for displaying within page sections
 * 
 * @param {Object} props Component props
 * @param {string} props.type - Error type: 'api', 'empty', 'no-data'
 * @param {string} props.title - Custom title
 * @param {string} props.description - Description message
 * @param {Function} props.onRetry - Function to call when retry button is clicked
 * @param {Function} props.onClear - Function to call when clear filters button is clicked
 * @param {string} props.className - Additional classes
 * @returns {JSX.Element} The SectionError component
 */
const SectionError = ({
  type = "api",
  title,
  description,
  onRetry,
  onClear,
  className = ""
}) => {
  // Configuration for different error types
  const errorTypes = {
    "api": {
      icon: <WarningOutlined style={{ fontSize: 22 }} />,
      defaultTitle: "Failed to Load Data",
      defaultDescription: "There was a problem loading this content.",
      iconColor: "#f5222d",
      primaryAction: {
        text: "Try Again",
        icon: <ReloadOutlined />,
        onClick: onRetry
      }
    },
    "empty": {
      icon: <SearchOutlined style={{ fontSize: 22 }} />,
      defaultTitle: "No Results Found",
      defaultDescription: "No items match your current filters.",
      iconColor: "#fa8c16",
      primaryAction: {
        text: "Clear Filters",
        icon: <ReloadOutlined />,
        onClick: onClear
      }
    },
    "no-data": {
      icon: <InfoCircleOutlined style={{ fontSize: 22 }} />,
      defaultTitle: "No Data Available",
      defaultDescription: "There is no data to display at this time.",
      iconColor: "#1890ff",
      primaryAction: {
        text: "Refresh",
        icon: <ReloadOutlined />,
        onClick: onRetry
      }
    }
  };

  // Get configuration for current error type
  const config = errorTypes[type] || errorTypes["api"];
  
  // Use custom title/description if provided, otherwise use defaults
  const displayTitle = title || config.defaultTitle;
  const displayDescription = description || config.defaultDescription;

  return (
    <div className={`bg-gray-50 p-6 rounded-lg text-center ${className}`}>
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <div>
            <div className="mb-2" style={{ color: config.iconColor }}>
              {config.icon}
            </div>
            <div className="font-medium text-base mb-1">{displayTitle}</div>
            <Text type="secondary">{displayDescription}</Text>
          </div>
        }
      >
        <Space size="middle" className="mt-4">
          <Button
            type="primary"
            onClick={config.primaryAction.onClick}
            icon={config.primaryAction.icon}
            className="bg-black hover:bg-gray-800"
          >
            {config.primaryAction.text}
          </Button>
          
          {type === "empty" && onRetry && (
            <Button
              onClick={onRetry}
              icon={<ReloadOutlined />}
            >
              Refresh
            </Button>
          )}
        </Space>
      </Empty>
    </div>
  );
};

// Convenience exports for different error types
export const ApiError = (props) => <SectionError type="api" {...props} />;
export const EmptyResults = (props) => <SectionError type="empty" {...props} />;
export const NoData = (props) => <SectionError type="no-data" {...props} />;

export default SectionError;