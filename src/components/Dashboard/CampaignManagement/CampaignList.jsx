import { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Tag, 
  Typography, 
  Space, 
  Tooltip, 
  message, 
  Popconfirm,
  Empty
} from 'antd';
import { 
  PlusOutlined, 
  EyeOutlined, 
  StopOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import useCampaignManagement from '../../../hooks/useCampaignManagement';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

/**
 * CampaignList component - Shows campaigns for a blindbox series
 * @returns {JSX.Element} Campaign List component
 */
const CampaignList = () => {
  const navigate = useNavigate();
  const { seriesId } = useParams();
  const { 
    loading, 
    campaigns, 
    getSeriesCampaigns, 
    endCampaign 
  } = useCampaignManagement();
  const [seriesName, setSeriesName] = useState('');

  // Get series campaigns on mount
  useEffect(() => {
    if (seriesId && !isNaN(parseInt(seriesId, 10))) {
      // Make sure seriesId is a number
      getSeriesCampaigns(parseInt(seriesId, 10));
      
      // This would normally be fetched from an API or context
      // For now, we'll just use a placeholder
      setSeriesName(`Blindbox Series #${seriesId}`);
    } else {
      console.error('Invalid series ID:', seriesId);
    }
  }, [seriesId, getSeriesCampaigns]);

  // Handle ending a campaign
  const handleEndCampaign = async (campaignId) => {
    try {
      if (isNaN(parseInt(campaignId, 10))) {
        throw new Error('Invalid campaign ID');
      }
      
      const success = await endCampaign(parseInt(campaignId, 10));
      if (success) {
        message.success('Campaign ended successfully');
        // Refresh the list
        if (seriesId && !isNaN(parseInt(seriesId, 10))) {
          getSeriesCampaigns(parseInt(seriesId, 10));
        }
      }
    } catch (error) {
      console.error('Failed to end campaign:', error);
    }
  };

  // Navigate to campaign details
  const goToCampaignDetails = (campaignId) => {
    navigate(`/dashboard/campaigns/${campaignId}`);
  };

  // Navigate to create campaign
  const goToCreateCampaign = () => {
    navigate(`/dashboard/campaigns/create?seriesId=${seriesId}`);
  };

  // Go back to blindbox list
  const goBack = () => {
    navigate('/dashboard/blindboxes/list');
  };

  // Render campaign type tag
  const renderCampaignTypeTag = (type) => {
    switch (type) {
      case 'GROUP':
        return <Tag color="orange">GROUP</Tag>;
      case 'MILESTONE':
        return <Tag color="green">MILESTONE</Tag>;
      default:
        return <Tag>{type}</Tag>;
    }
  };

  // Render campaign status tag
  const renderStatusTag = (isActive, endTime) => {
    const isEnded = dayjs(endTime).isBefore(dayjs());
    
    if (!isActive) {
      return <Tag icon={<StopOutlined />} color="error">Ended</Tag>;
    }
    
    if (isEnded) {
      return <Tag icon={<CheckCircleOutlined />} color="success">Completed</Tag>;
    }
    
    return <Tag icon={<ClockCircleOutlined />} color="processing">Active</Tag>;
  };

  // Table columns
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      render: id => <Text strong>#{id}</Text>,
    },
    {
      title: 'Type',
      dataIndex: 'campaignType',
      key: 'campaignType',
      render: renderCampaignTypeTag,
    },
    {
      title: 'Start Date',
      dataIndex: 'startCampaignTime',
      key: 'startCampaignTime',
      render: time => dayjs(time).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: 'End Date',
      dataIndex: 'endCampaignTime',
      key: 'endCampaignTime',
      render: time => dayjs(time).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => renderStatusTag(record.active, record.endCampaignTime),
    },
    {
      title: 'Current Units',
      dataIndex: 'currentUnitsCount',
      key: 'currentUnitsCount',
    },
    {
      title: 'Discounted Units',
      dataIndex: 'totalDiscountedUnits',
      key: 'totalDiscountedUnits',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => goToCampaignDetails(record.id)}
            />
          </Tooltip>
          
          {record.active && (
            <Tooltip title="End Campaign">
              <Popconfirm
                title="End this campaign?"
                description="Are you sure you want to end this campaign? This will finalize all preorders."
                icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
                onConfirm={() => handleEndCampaign(record.id)}
                okText="Yes"
                cancelText="No"
              >
                <Button 
                  type="text" 
                  danger
                  icon={<StopOutlined />}
                />
              </Popconfirm>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="campaign-list-container">
      <Card>
        <div className="flex items-center mb-6">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={goBack}
            className="mr-4"
          >
            Back
          </Button>
          <div>
            <Title level={2} className="mb-0">Campaigns</Title>
            <Text type="secondary">Manage campaigns for {seriesName}</Text>
          </div>
        </div>
        
        <div className="flex justify-end mb-4">
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={goToCreateCampaign}
            className="bg-black hover:bg-gray-800"
          >
            Create Campaign
          </Button>
        </div>
        
        {campaigns.length === 0 && !loading ? (
          <Empty 
            description="No campaigns found for this blindbox series" 
            className="py-12"
          />
        ) : (
          <Table
            columns={columns}
            dataSource={campaigns.map(item => ({...item, key: item.id}))}
            loading={loading}
            pagination={false}
            rowKey="id"
          />
        )}
      </Card>
    </div>
  );
};

export default CampaignList;