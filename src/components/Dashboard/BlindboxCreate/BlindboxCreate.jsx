import { useState } from 'react';
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
  Collapse
} from 'antd';
import { 
  PlusOutlined, 
  UploadOutlined, 
  SaveOutlined,
  ArrowLeftOutlined,
  InboxOutlined,
  DeleteOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useBlindboxManagement from '../../../hooks/useBlindboxManagement';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;
const { Panel } = Collapse;

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
  const [itemCount, setItemCount] = useState(1);

  // Handle form submission
  const handleSubmit = async (values) => {
    setSubmitting(true);
    setError(null);
    
    try {
      // Prepare main data for submission
      const blindboxData = {
        seriesName: values.seriesName,
        description: values.description,
        boxPrice: values.boxPrice,
        packagePrice: values.packagePrice,
        numberOfBlindboxesPerPackage: values.numberOfBlindboxesPerPackage || 6,
        numberOfSeparatedSalePackage: values.availablePackageUnits,
        numberOfWholeSalePackage: values.availableBoxUnits,
        active: values.active,
        // Include item data
        items: Array.from({ length: itemCount }, (_, index) => ({
          itemName: values[`itemName_${index}`] || `Item ${index + 1}`,
          itemChance: values[`itemChance_${index}`] || 10,
        }))
      };
      
      console.log('Sending blindbox data:', blindboxData);
      
      // Create FormData object to send both JSON and files
      const formData = new FormData();
      
      // Append request data as JSON blob with proper Content-Type
      const jsonBlob = new Blob([JSON.stringify(blindboxData)], {
        type: 'application/json'
      });
      formData.append('request', jsonBlob);
      
      // Append series images
      if (fileList.length > 0) {
        fileList.forEach((file) => {
          // Make sure we're getting the actual File object
          const fileObj = file.originFileObj || file;
          formData.append('seriesImages', fileObj);
        });
      }
      
      // Log the FormData contents for debugging
      console.log('FormData entries:');
      for (const entry of formData.entries()) {
        console.log(entry[0], entry[1] instanceof Blob ? 'Blob/File' : entry[1]);
      }
      
      // Call API to create blindbox series
      const success = await createBlindboxSeries(formData);
      
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

  // Add item to the form
  const addItem = () => {
    setItemCount(prevCount => prevCount + 1);
  };

  // Remove item from the form
  const removeItem = (index) => {
    if (itemCount <= 1) {
      message.warning('At least one item is required');
      return;
    }
    
    // Remove the corresponding form fields
    form.setFieldsValue({
      [`itemName_${index}`]: undefined,
      [`itemChance_${index}`]: undefined
    });
    
    // Update the item count
    setItemCount(prevCount => prevCount - 1);
    
    // Shift remaining items
    for (let i = index; i < itemCount - 1; i++) {
      const nextItem = {
        name: form.getFieldValue(`itemName_${i + 1}`),
        chance: form.getFieldValue(`itemChance_${i + 1}`)
      };
      
      form.setFieldsValue({
        [`itemName_${i}`]: nextItem.name,
        [`itemChance_${i}`]: nextItem.chance,
        [`itemName_${i + 1}`]: undefined,
        [`itemChance_${i + 1}`]: undefined
      });
    }
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

  // Render form items for blindbox items
  const renderItemFields = () => {
    const itemFields = [];
    
    for (let i = 0; i < itemCount; i++) {
      itemFields.push(
        <div key={i} className="item-fields mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <Title level={5} className="mb-0">Item #{i + 1}</Title>
            <Button 
              danger 
              type="text" 
              icon={<DeleteOutlined />} 
              onClick={() => removeItem(i)}
            />
          </div>
          
          <Row gutter={16}>
            <Col xs={24} md={16}>
              <Form.Item
                name={`itemName_${i}`}
                label="Item Name"
                rules={[{ required: true, message: 'Please enter item name' }]}
              >
                <Input placeholder={`Item ${i + 1}`} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name={`itemChance_${i}`}
                label={
                  <span>
                    Chance (%) 
                    <QuestionCircleOutlined className="ml-1 text-gray-400" title="Probability of this item appearing in a blindbox" />
                  </span>
                }
                rules={[
                  { required: true, message: 'Please enter chance' },
                  { type: 'number', min: 0, max: 100, message: 'Chance must be between 0-100%' }
                ]}
                initialValue={10}
              >
                <InputNumber
                  min={0}
                  max={100}
                  formatter={value => `${value}%`}
                  parser={value => value.replace('%', '')}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>
        </div>
      );
    }
    
    return itemFields;
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
            availableBoxUnits: 100,
            availablePackageUnits: 20,
            numberOfBlindboxesPerPackage: 6
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
          
          <Divider orientation="left">
            <div className="flex items-center">
              <span>Blindbox Items</span>
              <Button 
                type="primary" 
                size="small" 
                icon={<PlusOutlined />} 
                onClick={addItem}
                className="ml-4 bg-black hover:bg-gray-800"
              >
                Add Item
              </Button>
            </div>
          </Divider>
          
          <div className="blindbox-items-container mb-6">
            <Collapse defaultActiveKey={['0']}>
              <Panel header="Items Information" key="items">
                <Alert
                  message="Item Details"
                  description="Define the items that can be found in this blindbox series. Each item should have a name and probability of appearance."
                  type="info"
                  showIcon
                  className="mb-4"
                />
                
                {renderItemFields()}
                
                <div className="text-center mt-4">
                  <Button 
                    type="dashed" 
                    onClick={addItem} 
                    block
                    icon={<PlusOutlined />}
                  >
                    Add Another Item
                  </Button>
                </div>
              </Panel>
            </Collapse>
          </div>
          
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
                Create Blindbox Series
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