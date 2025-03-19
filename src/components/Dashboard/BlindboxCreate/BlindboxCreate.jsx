import React, { useState } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Typography, 
  InputNumber, 
  Switch, 
  Upload, 
  message,
  Spin,
  Divider,
  Space,
  Alert,
  Row,
  Col
} from 'antd';
import { 
  PlusOutlined, 
  UploadOutlined, 
  SaveOutlined,
  ArrowLeftOutlined,
  InboxOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useBlindboxManagement from '../../../hooks/useBlindboxManagement';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

/**
 * BlindboxCreate Component for the Dashboard
 * Creates a new blindbox series
 */
const BlindboxCreate = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { createBlindboxSeries, loading } = useBlindboxManagement();
  
  const [fileList, setFileList] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Handle form submission
  const handleSubmit = async (values) => {
    setSubmitting(true);
    setError(null);
    
    try {
      // Prepare data for submission
      const blindboxData = {
        seriesName: values.seriesName,
        description: values.description,
        boxPrice: values.boxPrice,
        packagePrice: values.packagePrice,
        availableBoxUnits: values.availableBoxUnits,
        availablePackageUnits: values.availablePackageUnits,
        active: values.active
      };
      
      console.log('Submitting blindbox data:', blindboxData);
      
      // Call API to create blindbox series
      const success = await createBlindboxSeries(blindboxData);
      
      if (success) {
        message.success('Blindbox series created successfully');
        navigate('/dashboard/blindboxes/list');
      } else {
        throw new Error('Failed to create blindbox series');
      }
    } catch (err) {
      console.error('Error creating blindbox series:', err);
      setError(err.message || 'Failed to create blindbox series');
      message.error(err.message || 'Failed to create blindbox series');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle image upload
  const handleImageChange = ({ fileList }) => {
    setFileList(fileList);
  };

  // Image upload props
  const uploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file) => {
      // Validate file type
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('You can only upload image files!');
        return Upload.LIST_IGNORE;
      }
      
      // Validate file size (5MB limit)
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('Image must be smaller than 5MB!');
        return Upload.LIST_IGNORE;
      }
      
      // Add to file list
      setFileList([...fileList, file]);
      return false; // Prevent automatic upload
    },
    fileList,
  };

  // Go back to blindbox list
  const goBack = () => {
    navigate('/dashboard/blindboxes/list');
  };

  return (
    <div className="blindbox-create-container">
      <Card>
        <div className="flex items-center mb-6">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={goBack}
            className="mr-4"
          >
            Back
          </Button>
          <Title level={2} className="mb-0">Create New Blindbox Series</Title>
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
            active: true,
            availableBoxUnits: 0,
            availablePackageUnits: 0
          }}
        >
          <Row gutter={24}>
            <Col xs={24} md={16}>
              <Form.Item
                name="seriesName"
                label="Series Name"
                rules={[
                  { required: true, message: 'Please enter the series name' },
                  { max: 100, message: 'Series name cannot exceed 100 characters' }
                ]}
              >
                <Input placeholder="Enter series name" maxLength={100} />
              </Form.Item>
              
              <Form.Item
                name="description"
                label="Description"
              >
                <TextArea 
                  placeholder="Enter description" 
                  rows={4}
                  showCount
                  maxLength={500}
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} md={8}>
              <Form.Item
                name="active"
                label="Status"
                valuePropName="checked"
              >
                <Switch 
                  checkedChildren="Active" 
                  unCheckedChildren="Inactive"
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                name="boxPrice"
                label="Box Price (₫)"
                rules={[
                  { required: true, message: 'Please enter the box price' },
                  { type: 'number', min: 0, message: 'Price must be a positive number' }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Enter box price"
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  min={0}
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} md={12}>
              <Form.Item
                name="packagePrice"
                label="Package Price (₫)"
                rules={[
                  { required: true, message: 'Please enter the package price' },
                  { type: 'number', min: 0, message: 'Price must be a positive number' }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Enter package price"
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  min={0}
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                name="availableBoxUnits"
                label="Available Box Units"
                rules={[
                  { required: true, message: 'Please enter the available box units' },
                  { type: 'number', min: 0, message: 'Units must be a positive number' }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Enter available box units"
                  min={0}
                />
              </Form.Item>
            </Col>
            
            <Col xs={24} md={12}>
              <Form.Item
                name="availablePackageUnits"
                label="Available Package Units"
                rules={[
                  { required: true, message: 'Please enter the available package units' },
                  { type: 'number', min: 0, message: 'Units must be a positive number' }
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Enter available package units"
                  min={0}
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Divider orientation="left">Series Images</Divider>
          
          <Form.Item
            name="images"
            label="Upload Series Images"
            extra="Upload images for this blindbox series. You can add more images after creation."
          >
            <Dragger {...uploadProps} multiple listType="picture-card">
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">Click or drag files to this area to upload</p>
              <p className="ant-upload-hint">
                Supports JPG, PNG, WEBP. Max size: 5MB per image.
              </p>
            </Dragger>
          </Form.Item>
          
          <Divider />
          
          <Form.Item>
            <Space size="middle">
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={submitting || loading}
                icon={<SaveOutlined />}
                className="bg-black hover:bg-gray-800"
              >
                Save Blindbox Series
              </Button>
              
              <Button 
                onClick={goBack}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default BlindboxCreate;