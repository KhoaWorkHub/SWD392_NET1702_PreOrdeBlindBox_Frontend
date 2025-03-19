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
  Tag,
  Tooltip
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
  
  // Debug log to check ID
  console.log("BlindboxEdit mounted with ID:", id);
  
  const { 
    getBlindboxSeriesById,
    updateBlindboxSeries,
    uploadBlindboxSeriesImages,
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
  const [itemImageFile, setItemImageFile] = useState(null);
  const [uploadingItemImages, setUploadingItemImages] = useState(false);
  const [seriesImagesModalVisible, setSeriesImagesModalVisible] = useState(false);

  // Fetch blindbox series on component mount
  useEffect(() => {
    const fetchBlindboxSeries = async () => {
      console.log("Fetching blindbox data for ID:", id);
      setInitialLoading(true);
      try {
        const data = await getBlindboxSeriesById(id);
        console.log("API Response:", data);
        
        if (data) {
          console.log("Setting form values with data:", data);
          // Set form values
          form.setFieldsValue({
            seriesName: data.seriesName,
            description: data.description,
            boxPrice: data.boxPrice,
            packagePrice: data.packagePrice,
            availableBoxUnits: data.availableBoxUnits,
            availablePackageUnits: data.availablePackageUnits,
            numberOfBlindboxesPerPackage: data.numberOfBlindboxesPerPackage || 6,
            active: data.active
          });
        } else {
          setError("No data returned from API");
        }
      } catch (err) {
        console.error('Error fetching blindbox series:', err);
        setError('Failed to load blindbox series. Please try again.');
      } finally {
        setInitialLoading(false);
      }
    };
    
    if (id) {
      fetchBlindboxSeries();
    } else {
      setError("No blindbox ID provided");
      setInitialLoading(false);
    }
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
        numberOfBlindboxesPerPackage: values.numberOfBlindboxesPerPackage || 6,
        active: values.active
      };
      
      console.log('Updating blindbox data:', blindboxData);
      
      // Call API to update blindbox series
      const success = await updateBlindboxSeries(id, blindboxData);
      
      if (success) {
        message.success('Blindbox series updated successfully');
        
        // Also upload series images if any
        if (fileList.length > 0) {
          const imageFiles = fileList.map(file => file.originFileObj).filter(Boolean);
          if (imageFiles.length > 0) {
            await uploadSeriesImages(imageFiles);
          }
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

  // Handle upload of blindbox series images
  const uploadSeriesImages = async (files) => {
    try {
      const success = await uploadBlindboxSeriesImages(id, files);
      if (success) {
        message.success('Series images uploaded successfully');
        setFileList([]);
        // Refresh blindbox series data
        await getBlindboxSeriesById(id);
      } else {
        throw new Error('Failed to upload series images');
      }
    } catch (err) {
      console.error('Error uploading series images:', err);
      message.error(err.message || 'Failed to upload series images');
    }
  };

  // Handle images upload for blindbox items
  const handleItemImageUpload = async () => {
    if (!selectedItem) {
      message.error('No item selected for image upload');
      return;
    }
    
    if (!itemImageFile) {
      message.error('Please select an image to upload');
      return;
    }
    
    setUploadingItemImages(true);
    
    try {
      // Call API to upload image
      const success = await uploadBlindboxItemImages(selectedItem.id, itemImageFile);
      
      if (success) {
        message.success('Image uploaded successfully');
        setItemImageModalVisible(false);
        setItemImageFile(null);
        
        // Refresh blindbox series data
        await getBlindboxSeriesById(id);
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (err) {
      console.error('Error uploading item image:', err);
      message.error(err.message || 'Failed to upload image');
    } finally {
      setUploadingItemImages(false);
    }
  };

  // Handle series image change
  const handleSeriesImageChange = (info) => {
    let newFileList = [...info.fileList];
    
    // Limit to maximum 5 images
    newFileList = newFileList.slice(-5);
    
    setFileList(newFileList);
  };

  // Handle series image upload properties
  const beforeSeriesImageUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
      return Upload.LIST_IGNORE;
    }
    
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Image must be smaller than 5MB!');
      return Upload.LIST_IGNORE;
    }
    
    return false; // Prevent automatic upload
  };

  // Handle item image change
  const handleItemImageChange = (info) => {
    if (info.file.status === 'removed') {
      setItemImageFile(null);
      return;
    }
    
    // Only use the latest file
    if (info.file.originFileObj) {
      setItemImageFile(info.file.originFileObj);
    }
  };

  // Go back to blindbox list
  const goBack = () => {
    navigate('/dashboard/blindboxes/list');
  };

  // Open item image upload modal
  const openItemImageUploadModal = (item) => {
    setSelectedItem(item);
    setItemImageFile(null);
    setItemImageModalVisible(true);
  };

  // Open series images modal
  const openSeriesImagesModal = () => {
    setSeriesImagesModalVisible(true);
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
          <Tooltip title="View Images">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => {
                setSelectedItem(record);
                // TODO: Implement view images modal
              }}
              disabled={!record.imageUrls || record.imageUrls.length === 0}
            />
          </Tooltip>
          <Tooltip title="Upload Image">
            <Button
              type="primary"
              size="small"
              icon={<UploadOutlined />}
              onClick={() => openItemImageUploadModal(record)}
            >
              Upload Image
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Show loading state
  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" tip="Loading blindbox data..." />
      </div>
    );
  }

  // Show error state
  if (error && !selectedSeries) {
    return (
      <div className="p-6">
        <Alert
          message="Error Loading Blindbox"
          description={
            <div>
              <p>{error}</p>
              <Button 
                type="primary"
                onClick={goBack}
                className="mt-4"
              >
                Back to List
              </Button>
            </div>
          }
          type="error"
          showIcon
        />
      </div>
    );
  }

  // Temporary debug card to show what's happening
  const debugInfo = {
    id: id,
    selectedSeriesExists: !!selectedSeries,
    formInitialized: form.getFieldsValue(true),
    loading,
    initialLoading,
    error
  };

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
                <Col xs={24} md={8}>
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
                
                <Col xs={24} md={8}>
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
                
                <Col xs={24} md={8}>
                  <Form.Item
                    name="numberOfBlindboxesPerPackage"
                    label="Boxes Per Package"
                    rules={[
                      { required: true, message: 'Please enter boxes per package' },
                      { type: 'number', min: 1, message: 'Must be at least 1' }
                    ]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      placeholder="Enter boxes per package"
                      min={1}
                    />
                  </Form.Item>
                </Col>
              </Row>
              
              <Divider orientation="left">Series Images</Divider>
              
              {selectedSeries && selectedSeries.seriesImageUrls && selectedSeries.seriesImageUrls.length > 0 ? (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <Text strong className="block">Current Images:</Text>
                    <Button 
                      type="link" 
                      onClick={openSeriesImagesModal}
                    >
                      View All Images
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedSeries.seriesImageUrls.slice(0, 5).map((url, index) => (
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
                    {selectedSeries.seriesImageUrls.length > 5 && (
                      <div className="flex items-center justify-center w-20 h-20 bg-gray-100 rounded">
                        <Text type="secondary">+{selectedSeries.seriesImageUrls.length - 5} more</Text>
                      </div>
                    )}
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
                <Upload
                  listType="picture-card"
                  fileList={fileList}
                  onChange={handleSeriesImageChange}
                  beforeUpload={beforeSeriesImageUpload}
                  multiple
                >
                  {fileList.length >= 5 ? null : (
                    <div>
                      <PlusOutlined />
                      <div style={{ marginTop: 8 }}>Upload</div>
                    </div>
                  )}
                </Upload>
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
              
              <Tooltip title="Items can only be added during creation">
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  disabled
                >
                  Add New Item
                </Button>
              </Tooltip>
            </div>
            
            {selectedSeries && selectedSeries.items && selectedSeries.items.length > 0 ? (
              <Table
                dataSource={selectedSeries.items}
                columns={itemColumns}
                rowKey="id"
                pagination={{ pageSize: 10 }}
              />
            ) : (
              <Empty description="No items found for this blindbox series" />
            )}
          </TabPane>
        </Tabs>
      </Card>
      
      {/* Item Image Upload Modal */}
      <Modal
        title={`Upload Image for Item #${selectedItem?.id || ''}`}
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
            disabled={!itemImageFile}
            className="bg-black hover:bg-gray-800"
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
              listType="picture-card"
              beforeUpload={() => false}
              onChange={handleItemImageChange}
              maxCount={1}
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
      
      {/* Series Images Modal */}
      <Modal
        title="Series Images"
        open={seriesImagesModalVisible}
        onCancel={() => setSeriesImagesModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setSeriesImagesModalVisible(false)}>
            Close
          </Button>
        ]}
        width={800}
      >
        {selectedSeries && selectedSeries.seriesImageUrls && (
          <div className="series-images-gallery">
            <Row gutter={[16, 16]}>
              {selectedSeries.seriesImageUrls.map((url, index) => (
                <Col xs={24} sm={12} md={8} lg={6} key={index}>
                  <div className="p-2 border border-gray-200 rounded">
                    <Image
                      src={url}
                      alt={`Series Image ${index + 1}`}
                      className="w-full h-32 object-contain"
                    />
                    <div className="text-center mt-2">
                      <Text type="secondary">Image #{index + 1}</Text>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BlindboxEdit;