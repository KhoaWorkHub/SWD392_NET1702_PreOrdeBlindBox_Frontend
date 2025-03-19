import React, { useState, useEffect } from 'react';
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
  Col,
  Tabs,
  Table,
  Image,
  Modal,
  Empty,
  Tag
} from 'antd';
import { 
  PlusOutlined, 
  UploadOutlined, 
  SaveOutlined,
  ArrowLeftOutlined,
  InboxOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import useBlindboxManagement from '../../../hooks/useBlindboxManagement';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;
const { TabPane } = Tabs;

/**
 * BlindboxEdit Component for the Dashboard
 * Edits an existing blindbox series
 */
const BlindboxEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  
  const { 
    getBlindboxSeriesById,
    updateBlindboxSeries,
    uploadBlindboxItemImages,
    loading,
    selectedSeries,
    setSelectedSeries
  } = useBlindboxManagement();
  
  const [activeTab, setActiveTab] = useState('1');
  const [fileList, setFileList] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemImageModalVisible, setItemImageModalVisible] = useState(false);
  const [itemImageFileList, setItemImageFileList] = useState([]);
  const [uploadingItemImages, setUploadingItemImages] = useState(false);

  // Fetch blindbox series on component mount
  useEffect(() => {
    const fetchBlindboxSeries = async () => {
      try {
        const data = await getBlindboxSeriesById(id);
        if (data) {
          // Set form values
          form.setFieldsValue({
            seriesName: data.seriesName,
            description: data.description,
            boxPrice: data.boxPrice,
            packagePrice: data.packagePrice,
            availableBoxUnits: data.availableBoxUnits,
            availablePackageUnits: data.availablePackageUnits,
            active: data.active
          });
        }
      } catch (err) {
        console.error('Error fetching blindbox series:', err);
        setError('Failed to load blindbox series. Please try again.');
      } finally {
        setInitialLoading(false);
      }
    };
    
    fetchBlindboxSeries();
  }, [id, getBlindboxSeriesById, form]);

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
      
      console.log('Updating blindbox data:', blindboxData);
      
      // Call API to update blindbox series
      const success = await updateBlindboxSeries(id, blindboxData);
      
      if (success) {
        message.success('Blindbox series updated successfully');
        
        // Also upload images if any
        if (fileList.length > 0) {
          // TODO: Implement image upload for series
          message.info('Image upload for series not yet implemented');
        }
      } else {
        throw new Error('Failed to update blindbox series');
      }
    } catch (err) {
      console.error('Error updating blindbox series:', err);
      setError(err.message || 'Failed to update blindbox series');
      message.error(err.message || 'Failed to update blindbox series');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle images upload for blindbox items
  const handleItemImageUpload = async () => {
    if (!selectedItem) {
      message.error('No item selected for image upload');
      return;
    }
    
    if (itemImageFileList.length === 0) {
      message.error('Please select images to upload');
      return;
    }
    
    setUploadingItemImages(true);
    
    try {
      // Get files from fileList
      const files = itemImageFileList.map(file => file.originFileObj);
      
      // Call API to upload images
      const success = await uploadBlindboxItemImages(selectedItem.id, files);
      
      if (success) {
        message.success('Images uploaded successfully');
        setItemImageModalVisible(false);
        setItemImageFileList([]);
        
        // Refresh blindbox series data
        await getBlindboxSeriesById(id);
      } else {
        throw new Error('Failed to upload images');
      }
    } catch (err) {
      console.error('Error uploading item images:', err);
      message.error(err.message || 'Failed to upload images');
    } finally {
      setUploadingItemImages(false);
    }
  };

  // Handle series image upload
  const handleSeriesImageChange = ({ fileList }) => {
    setFileList(fileList);
  };

  // Handle item image upload
  const handleItemImageChange = ({ fileList }) => {
    setItemImageFileList(fileList);
  };

  // Go back to blindbox list
  const goBack = () => {
    navigate('/dashboard/blindboxes/list');
  };

  // Open item image upload modal
  const openItemImageUploadModal = (item) => {
    setSelectedItem(item);
    setItemImageFileList([]);
    setItemImageModalVisible(true);
  };

  // Series image upload props
  const seriesUploadProps = {
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

  // Item image upload props
  const itemUploadProps = {
    onRemove: (file) => {
      const index = itemImageFileList.indexOf(file);
      const newFileList = itemImageFileList.slice();
      newFileList.splice(index, 1);
      setItemImageFileList(newFileList);
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
      setItemImageFileList([...itemImageFileList, file]);
      return false; // Prevent automatic upload
    },
    fileList: itemImageFileList,
    listType: 'picture-card',
  };

  // Table columns for items
  const itemColumns = [
    {
      title: '',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      render: (_, record) => (
        <div className="w-12 h-12 flex items-center justify-center">
          <Image
            src={record.imageUrls?.[0] || 'https://placehold.co/60x60?text=No+Image'}
            alt={record.itemName || `Item #${record.id}`}
            width={40}
            height={40}
            className="rounded"
            fallback="https://placehold.co/60x60?text=No+Image"
          />
        </div>
      ),
      width: 60
    },
    {
      title: 'Item ID',
      dataIndex: 'id',
      key: 'id',
      render: id => <Text strong>#{id}</Text>,
    },
    {
      title: 'Item Name',
      dataIndex: 'itemName',
      key: 'itemName',
      render: (name, record) => name || `Item #${record.id}`,
    },
    {
      title: 'Chance',
      dataIndex: 'itemChance',
      key: 'itemChance',
      render: (chance) => (
        <Tag color={
          chance <= 5 ? 'red' : 
          chance <= 15 ? 'orange' : 
          chance <= 25 ? 'blue' : 'green'
        }>
          {chance}% chance
        </Tag>
      ),
    },
    {
      title: 'Images',
      dataIndex: 'imageUrls',
      key: 'imageUrls',
      render: (imageUrls) => (
        <Text>{imageUrls?.length || 0} images</Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<UploadOutlined />}
            onClick={() => openItemImageUploadModal(record)}
          >
            Upload Images
          </Button>
        </Space>
      ),
    },
  ];

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="blindbox-edit-container">
      <Card>
        <div className="flex items-center mb-6">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={goBack}
            className="mr-4"
          >
            Back
          </Button>
          <Title level={2} className="mb-0">Edit Blindbox Series</Title>
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
        
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane tab="Basic Information" key="1">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
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
              
              {selectedSeries && selectedSeries.seriesImageUrls && selectedSeries.seriesImageUrls.length > 0 ? (
                <div className="mb-6">
                  <Text strong className="block mb-2">Current Images:</Text>
                  <div className="flex flex-wrap gap-2">
                    {selectedSeries.seriesImageUrls.map((url, index) => (
                      <div key={index} className="relative">
                        <Image
                          src={url}
                          alt={`Series Image ${index + 1}`}
                          width={80}
                          height={80}
                          className="rounded object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  <Empty description="No series images available" />
                </div>
              )}
              
              <Form.Item
                name="images"
                label="Upload New Series Images"
                extra="Upload new images for this blindbox series."
              >
                <Dragger {...seriesUploadProps} multiple listType="picture-card">
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
                    Save Changes
                  </Button>
                  
                  <Button 
                    onClick={goBack}
                  >
                    Cancel
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </TabPane>
          
          <TabPane tab="Items Management" key="2">
            <div className="mb-4 flex justify-between items-center">
              <Title level={4} className="mb-0">Blindbox Items</Title>
              
              <Button
                type="primary"
                icon={<PlusOutlined />}
                disabled
              >
                Add New Item
              </Button>
            </div>
            
            <Table
              dataSource={selectedSeries?.items || []}
              columns={itemColumns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
        </Tabs>
      </Card>
      
      {/* Item Image Upload Modal */}
      <Modal
        title={`Upload Images for Item #${selectedItem?.id || ''}`}
        open={itemImageModalVisible}
        onCancel={() => setItemImageModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setItemImageModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="upload"
            type="primary"
            loading={uploadingItemImages}
            onClick={handleItemImageUpload}
            disabled={itemImageFileList.length === 0}
          >
            Upload
          </Button>
        ]}
      >
        {selectedItem && (
          <>
            <div className="mb-4">
              <Text strong className="block mb-2">Current Item Images:</Text>
              <div className="flex flex-wrap gap-2">
                {selectedItem.imageUrls && selectedItem.imageUrls.length > 0 ? (
                  selectedItem.imageUrls.map((url, index) => (
                    <Image
                      key={index}
                      src={url}
                      alt={`Item Image ${index + 1}`}
                      width={80}
                      height={80}
                      className="rounded object-cover"
                    />
                  ))
                ) : (
                  <Empty description="No images available" imageStyle={{ height: 40 }} />
                )}
              </div>
            </div>
            
            <Divider />
            
            <Upload
              {...itemUploadProps}
              multiple
            >
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Upload</div>
              </div>
            </Upload>
            
            <div className="mt-2 text-gray-500 text-xs">
              Supports JPG, PNG, WEBP. Max size: 5MB per image.
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default BlindboxEdit;