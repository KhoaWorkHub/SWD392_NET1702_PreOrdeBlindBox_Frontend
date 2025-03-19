import { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Input, 
  Space, 
  Tooltip, 
  Tag, 
  Modal, 
  Image, 
  Typography,
  Row,
  Col,
  Select,
  message
} from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined, 
  ReloadOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import useBlindboxManagement from '../../../hooks/useBlindboxManagement';

const { Title, Text } = Typography;
const { Option } = Select;

/**
 * BlindboxList Component for the Dashboard
 * Lists all blindbox series with search, filter, and sorting capabilities
 */
const BlindboxList = () => {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const isAdmin = hasRole('ADMIN');
  
  const { 
    blindboxSeries, 
    pagination, 
    loading, 
    fetchBlindboxSeries,
    deleteBlindboxSeries
  } = useBlindboxManagement();

  const [selectedSeries, setSelectedSeries] = useState(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [searchParams, setSearchParams] = useState({
    seriesName: '',
    sortField: 'id',
    sortDirection: 'desc'
  });

  // Load blindbox series on component mount
  useEffect(() => {
    fetchBlindboxSeries();
  }, [fetchBlindboxSeries]);

  // Handle search form submission
  const handleSearch = () => {
    fetchBlindboxSeries({
      seriesName: searchParams.seriesName,
      sortField: searchParams.sortField,
      sortDirection: searchParams.sortDirection,
      page: 1 // Reset to first page on search
    });
  };

  // Handle table change (pagination, sorting)
  const handleTableChange = (pagination, _, sorter) => {
    // Update sort parameters if the user changed column sorting
    const sortField = sorter.field || searchParams.sortField;
    const sortDirection = sorter.order === 'ascend' ? 'asc' : 'desc';
    
    setSearchParams(prev => ({
      ...prev,
      sortField,
      sortDirection
    }));
    
    fetchBlindboxSeries({
      seriesName: searchParams.seriesName,
      sortField,
      sortDirection,
      page: pagination.current,
      pageSize: pagination.pageSize
    });
  };

  // Reset search filters
  const resetFilters = () => {
    setSearchParams({
      seriesName: '',
      sortField: 'id',
      sortDirection: 'desc'
    });
    
    fetchBlindboxSeries({
      page: 1,
      seriesName: '',
      sortField: 'id',
      sortDirection: 'desc'
    });
  };

  // Handle delete confirmation
  const confirmDelete = (id) => {
    Modal.confirm({
      title: 'Are you sure you want to delete this blindbox series?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => handleDeleteSeries(id),
    });
  };

  // Handle deleting a blindbox series
  const handleDeleteSeries = async (id) => {
    try {
      const success = await deleteBlindboxSeries(id);
      if (success) {
        message.success('Blindbox series deleted successfully');
      }
    } catch (error) {
      console.error('Failed to delete blindbox series:', error);
    }
  };

  // Show details modal
  const showSeriesDetails = (series) => {
    setSelectedSeries(series);
    setDetailsVisible(true);
  };

  // Navigate to edit page
  const navigateToEdit = (id) => {
    navigate(`/dashboard/blindboxes/edit/${id}`);
  };

  // Navigate to create page
  const navigateToCreate = () => {
    navigate('/dashboard/blindboxes/create');
  };

  // Table columns configuration
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      sorter: true,
      sortDirections: ['ascend', 'descend'],
      defaultSortOrder: 'descend',
      render: id => <Text strong>#{id}</Text>,
      width: 80,
    },
    {
      title: 'Series Name',
      dataIndex: 'seriesName',
      key: 'seriesName',
      sorter: true,
      sortDirections: ['ascend', 'descend'],
      render: (seriesName, record) => (
        <div className="flex items-center">
          <div className="mr-4">
            <Image 
              src={record.seriesImageUrls?.[0] || 'https://placehold.co/40x40?text=No+Image'} 
              alt={seriesName}
              width={40}
              height={40}
              className="rounded"
              preview={false}
            />
          </div>
          <Text className="font-medium">{seriesName}</Text>
        </div>
      ),
    },
    {
      title: 'Box Price',
      dataIndex: 'boxPrice',
      key: 'boxPrice',
      sorter: true,
      sortDirections: ['ascend', 'descend'],
      render: price => <Text>{Number(price).toLocaleString()} ₫</Text>,
    },
    {
      title: 'Package Price',
      dataIndex: 'packagePrice',
      key: 'packagePrice',
      sorter: true,
      sortDirections: ['ascend', 'descend'],
      render: price => <Text>{Number(price).toLocaleString()} ₫</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'active',
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
      onFilter: (value, record) => record.active === value,
      render: active => (
        <Tag color={active ? 'success' : 'error'}>
          {active ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Stock (Boxes)',
      dataIndex: 'availableBoxUnits',
      key: 'availableBoxUnits',
      sorter: true,
      sortDirections: ['ascend', 'descend'],
      render: (stock) => (
        <Text 
          type={stock <= 10 ? "danger" : stock <= 50 ? "warning" : ""}
          strong={stock <= 10}
        >
          {stock}
        </Text>
      ),
    },
    {
      title: 'Stock (Packages)',
      dataIndex: 'availablePackageUnits',
      key: 'availablePackageUnits',
      sorter: true,
      sortDirections: ['ascend', 'descend'],
      render: (stock) => (
        <Text 
          type={stock <= 10 ? "danger" : stock <= 50 ? "warning" : ""}
          strong={stock <= 10}
        >
          {stock}
        </Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Details">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => showSeriesDetails(record)}
            />
          </Tooltip>
          
          <Tooltip title="Edit">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => navigateToEdit(record.id)}
              disabled={!isAdmin}
            />
          </Tooltip>
          
          <Tooltip title="Delete">
            <Button 
              type="text" 
              danger
              icon={<DeleteOutlined />} 
              onClick={() => confirmDelete(record.id)}
              disabled={!isAdmin}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="blindbox-list-container">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <Title level={2} className="mb-0">Blindbox Series</Title>
          
          {isAdmin && (
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={navigateToCreate}
              className="bg-black hover:bg-gray-800"
            >
              Create New Series
            </Button>
          )}
        </div>
        
        {/* Search and filter section */}
        <div className="mb-6 bg-gray-50 p-4 rounded">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={8}>
              <Input
                placeholder="Search by series name"
                value={searchParams.seriesName}
                onChange={(e) => setSearchParams(prev => ({ ...prev, seriesName: e.target.value }))}
                allowClear
                prefix={<SearchOutlined className="text-gray-400" />}
                onPressEnter={handleSearch}
              />
            </Col>
            
            <Col xs={24} md={8}>
              <Select
                placeholder="Sort by"
                style={{ width: '100%' }}
                value={`${searchParams.sortField}-${searchParams.sortDirection}`}
                onChange={(value) => {
                  const [field, direction] = value.split('-');
                  setSearchParams(prev => ({
                    ...prev,
                    sortField: field,
                    sortDirection: direction
                  }));
                }}
              >
                <Option value="id-desc">Newest First</Option>
                <Option value="id-asc">Oldest First</Option>
                <Option value="seriesName-asc">Name (A-Z)</Option>
                <Option value="seriesName-desc">Name (Z-A)</Option>
                <Option value="boxPrice-asc">Box Price (Low to High)</Option>
                <Option value="boxPrice-desc">Box Price (High to Low)</Option>
                <Option value="availableBoxUnits-asc">Stock (Low to High)</Option>
                <Option value="availableBoxUnits-desc">Stock (High to Low)</Option>
              </Select>
            </Col>
            
            <Col xs={24} md={8}>
              <div className="flex justify-end gap-2">
                <Button 
                  type="primary"
                  onClick={handleSearch}
                  icon={<SearchOutlined />}
                  className="bg-black hover:bg-gray-800"
                >
                  Search
                </Button>
                <Button 
                  onClick={resetFilters}
                  icon={<ReloadOutlined />}
                >
                  Reset
                </Button>
              </div>
            </Col>
          </Row>
        </div>
        
        {/* Blindbox series table */}
        <Table
          columns={columns}
          dataSource={blindboxSeries}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (total) => `Total ${total} series`
          }}
          onChange={handleTableChange}
        />
      </Card>

      {/* Details modal */}
      <Modal
        title={`Blindbox Series Details: ${selectedSeries?.seriesName || ''}`}
        open={detailsVisible}
        onCancel={() => setDetailsVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailsVisible(false)}>
            Close
          </Button>,
          isAdmin && (
            <Button 
              key="edit" 
              type="primary" 
              onClick={() => {
                setDetailsVisible(false);
                navigateToEdit(selectedSeries.id);
              }}
              className="bg-black hover:bg-gray-800"
            >
              Edit
            </Button>
          )
        ]}
        width={800}
      >
        {selectedSeries && (
          <div>
            <Row gutter={[24, 16]}>
              <Col xs={24} md={12}>
                <div className="mb-4">
                  <Text strong className="block text-gray-500">ID</Text>
                  <Text>{selectedSeries.id}</Text>
                </div>
                
                <div className="mb-4">
                  <Text strong className="block text-gray-500">Series Name</Text>
                  <Text>{selectedSeries.seriesName}</Text>
                </div>
                
                <div className="mb-4">
                  <Text strong className="block text-gray-500">Description</Text>
                  <Text>{selectedSeries.description || 'No description provided'}</Text>
                </div>
                
                <div className="mb-4">
                  <Text strong className="block text-gray-500">Status</Text>
                  <Tag color={selectedSeries.active ? 'success' : 'error'}>
                    {selectedSeries.active ? 'Active' : 'Inactive'}
                  </Tag>
                </div>
              </Col>
              
              <Col xs={24} md={12}>
                <div className="mb-4">
                  <Text strong className="block text-gray-500">Box Price</Text>
                  <Text>{Number(selectedSeries.boxPrice).toLocaleString()} ₫</Text>
                </div>
                
                <div className="mb-4">
                  <Text strong className="block text-gray-500">Package Price</Text>
                  <Text>{Number(selectedSeries.packagePrice).toLocaleString()} ₫</Text>
                </div>
                
                <div className="mb-4">
                  <Text strong className="block text-gray-500">Available Box Units</Text>
                  <Text>{selectedSeries.availableBoxUnits}</Text>
                </div>
                
                <div className="mb-4">
                  <Text strong className="block text-gray-500">Available Package Units</Text>
                  <Text>{selectedSeries.availablePackageUnits}</Text>
                </div>
              </Col>
            </Row>
            
            {/* Series Images */}
            <div className="mt-4">
              <Text strong className="block text-gray-500 mb-2">Series Images</Text>
              <div className="flex flex-wrap gap-2">
                {selectedSeries.seriesImageUrls && selectedSeries.seriesImageUrls.length > 0 ? (
                  selectedSeries.seriesImageUrls.map((url, index) => (
                    <Image
                      key={index}
                      src={url}
                      alt={`${selectedSeries.seriesName} - Image ${index + 1}`}
                      width={80}
                      height={80}
                      className="rounded object-cover"
                    />
                  ))
                ) : (
                  <Text type="secondary">No images available</Text>
                )}
              </div>
            </div>
            
            {/* Items in this series */}
            {selectedSeries.items && selectedSeries.items.length > 0 && (
              <div className="mt-6">
                <Text strong className="block text-gray-500 mb-2">Items in this Series ({selectedSeries.items.length})</Text>
                <Row gutter={[16, 16]}>
                  {selectedSeries.items.map(item => (
                    <Col xs={24} sm={12} md={8} key={item.id}>
                      <Card 
                        size="small" 
                        title={item.itemName || `Item #${item.id}`}
                        extra={
                          <Tag color={
                            item.itemChance <= 5 ? 'red' : 
                            item.itemChance <= 15 ? 'orange' : 
                            item.itemChance <= 25 ? 'blue' : 'green'
                          }>
                            {item.itemChance}% chance
                          </Tag>
                        }
                      >
                        <div className="flex justify-center mb-2">
                          <Image
                            src={item.imageUrls?.[0] || 'https://placehold.co/100x100?text=No+Image'}
                            alt={item.itemName || `Item #${item.id}`}
                            width={60}
                            height={60}
                            className="rounded"
                          />
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BlindboxList;