import { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Button, 
  Typography, 
  Select, 
  DatePicker, 
  Space, 
  Divider, 
  message, 
  Alert,
  Table,
  InputNumber,
  Row,
  Col,
  Input
} from 'antd';
import { 
  ArrowLeftOutlined, 
  PlusOutlined, 
  SaveOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import useCampaignManagement from '../../../hooks/useCampaignManagement';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

/**
 * CampaignCreate component - Create a new campaign
 * @returns {JSX.Element} Campaign Create component
 */
const CampaignCreate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const { createCampaign, loading } = useCampaignManagement();
  
  const [seriesId, setSeriesId] = useState(null);
  const [tiers, setTiers] = useState([{ id: 1, tierOrder: 1, thresholdQuantity: 10, discountPercent: 5, alias: null }]);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Extract series ID from query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('seriesId');
    if (id && !isNaN(parseInt(id, 10))) {
      // Make sure id is a number
      const numericId = parseInt(id, 10);
      setSeriesId(numericId);
      form.setFieldsValue({ blindboxSeriesId: numericId });
    }
  }, [location.search, form]);

  // Handle form submission
  const handleSubmit = async (values) => {
    setSubmitting(true);
    setError(null);
    
    try {
      // Format date range
      const [startTime, endTime] = values.campaignTimeRange;
      
      // Make sure blindboxSeriesId is a number
      const blindboxSeriesId = parseInt(seriesId || values.blindboxSeriesId, 10);
      if (isNaN(blindboxSeriesId)) {
        throw new Error('Invalid Blindbox Series ID');
      }
      
      // Prepare campaign data
      const campaignData = {
        blindboxSeriesId,
        campaignType: values.campaignType,
        startCampaignTime: startTime.format('YYYY-MM-DDTHH:mm:ss'),
        endCampaignTime: endTime.format('YYYY-MM-DDTHH:mm:ss'),
        campaignTiers: tiers.map(({ id, ...rest }) => rest) // Remove temporary ID
      };
      
      console.log('Submitting campaign data:', campaignData);
      
      const success = await createCampaign(campaignData);
      
      if (success) {
        message.success('Campaign created successfully');
        navigate(`/dashboard/campaigns/series/${blindboxSeriesId}`);
      }
    } catch (err) {
      console.error('Error creating campaign:', err);
      setError(err.message || 'Failed to create campaign');
    } finally {
      setSubmitting(false);
    }
  };

  // Add a new tier
  const addTier = () => {
    const nextOrder = tiers.length + 1;
    const lastTier = tiers[tiers.length - 1];
    const nextThreshold = lastTier ? lastTier.thresholdQuantity + 10 : 10;
    const nextDiscount = lastTier ? Math.min(lastTier.discountPercent + 5, 50) : 5;
    
    setTiers([
      ...tiers, 
      { 
        id: Date.now(), // Temporary ID for UI
        tierOrder: nextOrder,
        thresholdQuantity: nextThreshold,
        discountPercent: nextDiscount,
        alias: null
      }
    ]);
  };

  // Remove a tier
  const removeTier = (id) => {
    if (tiers.length <= 1) {
      message.warning('At least one tier is required');
      return;
    }
    
    const newTiers = tiers.filter(tier => tier.id !== id);
    
    // Update tier orders
    const updatedTiers = newTiers.map((tier, index) => ({
      ...tier,
      tierOrder: index + 1
    }));
    
    setTiers(updatedTiers);
  };

  // Handle tier changes
  const handleTierChange = (id, field, value) => {
    setTiers(prevTiers => 
      prevTiers.map(tier => 
        tier.id === id ? { ...tier, [field]: value } : tier
      )
    );
  };

  // Table columns for tiers
  const tierColumns = [
    {
      title: 'Tier',
      dataIndex: 'tierOrder',
      key: 'tierOrder',
      render: order => <Text strong>Tier {order}</Text>
    },
    {
      title: 'Alias (Optional)',
      dataIndex: 'alias',
      key: 'alias',
      render: (_, record) => (
        <Input
          value={record.alias}
          onChange={e => handleTierChange(record.id, 'alias', e.target.value)}
          placeholder="Tier name (e.g. Bronze, Silver, Gold)"
        />
      )
    },
    {
      title: 'Threshold Quantity',
      dataIndex: 'thresholdQuantity',
      key: 'thresholdQuantity',
      render: (_, record) => (
        <InputNumber
          min={1}
          value={record.thresholdQuantity}
          onChange={value => handleTierChange(record.id, 'thresholdQuantity', value)}
        />
      )
    },
    {
      title: 'Discount Percent',
      dataIndex: 'discountPercent',
      key: 'discountPercent',
      render: (_, record) => (
        <InputNumber
          min={0}
          max={100}
          value={record.discountPercent}
          onChange={value => handleTierChange(record.id, 'discountPercent', value)}
          formatter={value => `${value}%`}
          parser={value => value.replace('%', '')}
        />
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeTier(record.id)}
        />
      )
    }
  ];

  // Go back to campaign list
  const goBack = () => {
    navigate(seriesId ? `/dashboard/campaigns/series/${seriesId}` : '/dashboard/blindboxes/list');
  };

  return (
    <div className="campaign-create-container">
      <Card>
        <div className="flex items-center mb-6">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={goBack}
            className="mr-4"
          >
            Back
          </Button>
          <Title level={2} className="mb-0">Create New Campaign</Title>
        </div>
        
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            className="mb-6"
          />
        )}
        
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            blindboxSeriesId: seriesId,
            campaignType: 'MILESTONE'
          }}
        >
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                name="blindboxSeriesId"
                label="Blindbox Series ID"
                rules={[
                  { required: true, message: 'Please enter the blindbox series ID' },
                  { 
                    validator: (_, value) => {
                      if (isNaN(parseInt(value, 10))) {
                        return Promise.reject('Blindbox Series ID must be a number');
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={1}
                  disabled={!!seriesId}
                  placeholder="Enter blindbox series ID"
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} md={12}>
              <Form.Item
                name="campaignType"
                label="Campaign Type"
                rules={[{ required: true, message: 'Please select campaign type' }]}
              >
                <Select placeholder="Select campaign type">
                  <Option value="MILESTONE">Milestone Campaign</Option>
                  <Option value="GROUP">Group Preorder Campaign</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="campaignTimeRange"
            label="Campaign Time Range"
            rules={[
              { 
                required: true, 
                message: 'Please select the campaign time range' 
              },
              { 
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  
                  const [start, end] = value;
                  
                  if (start && end && start.isAfter(dayjs())) {
                    return Promise.resolve();
                  }
                  
                  return Promise.reject(new Error('Start time must be in the future'));
                }
              }
            ]}
          >
            <RangePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              style={{ width: '100%' }}
            />
          </Form.Item>
          
          <Divider orientation="left">
            <Space>
              <span>Campaign Tiers</span>
              <Button 
                type="primary" 
                size="small" 
                icon={<PlusOutlined />} 
                onClick={addTier}
                className="bg-black hover:bg-gray-800"
              >
                Add Tier
              </Button>
            </Space>
          </Divider>
          
          <Alert
            message="Campaign Tiers Information"
            description="Define tiers with threshold quantities and discount percentages. Customers will receive higher discounts as more units are sold/preordered. You can optionally add an alias for each tier (e.g., Bronze, Silver, Gold)."
            type="info"
            showIcon
            className="mb-4"
          />
          
          <Table
            columns={tierColumns}
            dataSource={tiers}
            rowKey="id"
            pagination={false}
            className="mb-6"
          />
          
          <Form.Item>
            <Space>
              <Button 
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={submitting || loading}
                className="bg-black hover:bg-gray-800"
              >
                Create Campaign
              </Button>
              
              <Button onClick={goBack}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CampaignCreate;