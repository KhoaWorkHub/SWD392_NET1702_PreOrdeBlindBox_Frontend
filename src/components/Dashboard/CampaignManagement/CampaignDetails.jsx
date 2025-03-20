import { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Typography, 
  Descriptions, 
  Tag, 
  Spin, 
  Alert, 
  Table, 
  Space, 
  Popconfirm,
  Progress,
  Divider,
  Row,
  Col,
  Statistic
} from 'antd';
import { 
  ArrowLeftOutlined, 
  StopOutlined, 
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import useCampaignManagement from '../../../hooks/useCampaignManagement';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

/**
 * CampaignDetails component - Shows details of a specific campaign
 * @returns {JSX.Element} Campaign Details component
 */
const CampaignDetails = () => {
  const navigate = useNavigate();
  const { campaignId } = useParams();
  const { 
    loading, 
    error, 
    selectedCampaign, 
    getCampaignDetails, 
    endCampaign 
  } = useCampaignManagement();

  // Get campaign details on mount
  useEffect(() => {
    if (campaignId && !isNaN(parseInt(campaignId, 10))) {
      // Make sure campaignId is a number
      getCampaignDetails(parseInt(campaignId, 10));
    } else {
      console.error('Invalid campaign ID:', campaignId);
    }
  }, [campaignId, getCampaignDetails]);

  // Handle ending a campaign
  const handleEndCampaign = async () => {
    try {
      if (!campaignId || isNaN(parseInt(campaignId, 10))) {
        throw new Error('Invalid campaign ID');
      }
      
      const success = await endCampaign(parseInt(campaignId, 10));
      if (success) {
        // Refresh data
        getCampaignDetails(parseInt(campaignId, 10));
      }
    } catch (error) {
      console.error('Failed to end campaign:', error);
    }
  };

  // Go back to campaign list
  const goBack = () => {
    if (selectedCampaign?.blindboxSeriesId) {
      navigate(`/dashboard/campaigns/series/${selectedCampaign.blindboxSeriesId}`);
    } else {
      navigate('/dashboard/blindboxes/list');
    }
  };

  // Calculate campaign status
  const getCampaignStatus = () => {
    if (!selectedCampaign) return null;
    
    const { active, endCampaignTime } = selectedCampaign;
    const isEnded = dayjs(endCampaignTime).isBefore(dayjs());
    
    if (!active) {
      return <Tag icon={<StopOutlined />} color="error">Ended</Tag>;
    }
    
    if (isEnded) {
      return <Tag icon={<CheckCircleOutlined />} color="success">Completed</Tag>;
    }
    
    return <Tag icon={<ClockCircleOutlined />} color="processing">Active</Tag>;
  };

  // Calculate time remaining
  const getTimeRemaining = () => {
    if (!selectedCampaign) return '';
    
    const endTime = dayjs(selectedCampaign.endCampaignTime);
    const now = dayjs();
    
    if (endTime.isBefore(now)) {
      return 'Campaign ended';
    }
    
    const days = endTime.diff(now, 'day');
    const hours = endTime.diff(now, 'hour') % 24;
    const minutes = endTime.diff(now, 'minute') % 60;
    
    return `${days}d ${hours}h ${minutes}m`;
  };

  // Render campaign tiers table
  const renderTiersTable = () => {
    if (!selectedCampaign || !selectedCampaign.campaignTiers) {
      return <Alert message="No tiers found for this campaign" type="info" />;
    }
    
    const columns = [
      {
        title: 'Tier',
        dataIndex: 'tierOrder',
        key: 'tierOrder',
        render: (tier) => <Text strong>Tier {tier}</Text>,
      },
      {
        title: 'Threshold',
        dataIndex: 'thresholdQuantity',
        key: 'thresholdQuantity',
      },
      {
        title: 'Current Count',
        dataIndex: 'currentCount',
        key: 'currentCount',
      },
      {
        title: 'Discount',
        dataIndex: 'discountPercent',
        key: 'discountPercent',
        render: (discount) => <Tag color="green">{discount}% OFF</Tag>,
      },
      {
        title: 'Status',
        dataIndex: 'tierStatus',
        key: 'tierStatus',
        render: (status) => {
          switch (status) {
            case 'ACHIEVED':
              return <Tag color="success">Achieved</Tag>;
            case 'PROCESSING':
              return <Tag color="processing">Processing</Tag>;
            case 'UPCOMING':
              return <Tag color="default">Upcoming</Tag>;
            default:
              return <Tag>{status}</Tag>;
          }
        },
      },
      {
        title: 'Progress',
        key: 'progress',
        render: (_, record) => {
          const percent = (record.currentCount / record.thresholdQuantity) * 100;
          const status = 
            record.tierStatus === 'ACHIEVED' ? 'success' : 
            record.tierStatus === 'PROCESSING' ? 'active' : 'normal';
          
          return (
            <Progress 
              percent={Math.min(100, percent)} 
              size="small" 
              status={status}
            />
          );
        },
      },
    ];
    
    return (
      <Table
        columns={columns}
        dataSource={selectedCampaign.campaignTiers.map(tier => ({...tier, key: tier.id}))}
        pagination={false}
      />
    );
  };

  // If loading, show spinner
  if (loading && !selectedCampaign) {
    return (
      <div className="h-64 flex items-center justify-center">
        <Spin size="large" tip="Loading campaign details..." />
      </div>
    );
  }

  // If error, show error message
  if (error && !selectedCampaign) {
    return (
      <Card>
        <Alert
          message="Error Loading Campaign"
          description={error}
          type="error"
          showIcon
          action={
            <Button onClick={() => navigate('/dashboard/blindboxes/list')} type="primary">
              Back to Blindboxes
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <div className="campaign-details-container">
      <Card>
        <div className="flex items-center mb-6">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={goBack}
            className="mr-4"
          >
            Back
          </Button>
          <div className="flex-grow">
            <Title level={2} className="mb-0">
              Campaign Details #{campaignId}
            </Title>
            <Text type="secondary">
              {selectedCampaign?.campaignType} Campaign for Blindbox Series #{selectedCampaign?.blindboxSeriesId}
            </Text>
          </div>
          
          {selectedCampaign?.active && (
            <Popconfirm
              title="End this campaign?"
              description="Are you sure you want to end this campaign? This will finalize all preorders."
              icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
              onConfirm={handleEndCampaign}
              okText="Yes"
              cancelText="No"
            >
              <Button 
                type="primary"
                danger
                icon={<StopOutlined />}
              >
                End Campaign
              </Button>
            </Popconfirm>
          )}
        </div>
        
        {selectedCampaign && (
          <>
            <Row gutter={[24, 24]}>
              <Col xs={24} md={6}>
                <Card className="text-center">
                  <Statistic 
                    title="Campaign Status" 
                    value={selectedCampaign.active ? "Active" : "Ended"} 
                    valueStyle={{ color: selectedCampaign.active ? '#52c41a' : '#ff4d4f' }}
                  />
                </Card>
              </Col>
              <Col xs={24} md={6}>
                <Card className="text-center">
                  <Statistic 
                    title="Current Units" 
                    value={selectedCampaign.currentUnitsCount} 
                  />
                </Card>
              </Col>
              <Col xs={24} md={6}>
                <Card className="text-center">
                  <Statistic 
                    title="Discounted Units" 
                    value={selectedCampaign.totalDiscountedUnits} 
                  />
                </Card>
              </Col>
              <Col xs={24} md={6}>
                <Card className="text-center">
                  <Statistic 
                    title="Time Remaining" 
                    value={getTimeRemaining()} 
                  />
                </Card>
              </Col>
            </Row>
            
            <Divider />
            
            <Descriptions 
              title="Campaign Information" 
              bordered 
              column={{ xs: 1, sm: 2, md: 3 }}
            >
              <Descriptions.Item label="Campaign ID">{selectedCampaign.id}</Descriptions.Item>
              <Descriptions.Item label="Campaign Type">
                {selectedCampaign.campaignType === 'GROUP' ? (
                  <Tag color="orange">GROUP</Tag>
                ) : (
                  <Tag color="green">MILESTONE</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Status">{getCampaignStatus()}</Descriptions.Item>
              <Descriptions.Item label="Start Date">
                {dayjs(selectedCampaign.startCampaignTime).format('YYYY-MM-DD HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="End Date">
                {dayjs(selectedCampaign.endCampaignTime).format('YYYY-MM-DD HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Duration">
                {dayjs(selectedCampaign.endCampaignTime).diff(dayjs(selectedCampaign.startCampaignTime), 'day')} days
              </Descriptions.Item>
              <Descriptions.Item label="Blindbox Series ID">
                {selectedCampaign.blindboxSeriesId}
              </Descriptions.Item>
              <Descriptions.Item label="Current Units">
                {selectedCampaign.currentUnitsCount}
              </Descriptions.Item>
              <Descriptions.Item label="Discounted Units">
                {selectedCampaign.totalDiscountedUnits}
              </Descriptions.Item>
            </Descriptions>
            
            <Divider />
            
            <Title level={4}>Campaign Tiers</Title>
            {renderTiersTable()}
          </>
        )}
      </Card>
    </div>
  );
};

export default CampaignDetails;