import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Typography,
  Row,
  Col,
  Space,
  Tooltip,
  message,
  Popconfirm,
  Switch
} from 'antd';
import {
  UserAddOutlined,
  EditOutlined,
  DeleteOutlined,
  UserSwitchOutlined,
  SearchOutlined,
  ReloadOutlined,
  UploadOutlined,
  DownloadOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import useUserManagement from '../../../hooks/useUserManagement';

const { Title, Text } = Typography;
const { Option } = Select;
const { confirm } = Modal;

/**
 * UserManagement component - Admin interface for managing users
 * Provides functionalities to view, search, promote, and update user statuses
 */
const UserManagement = () => {
  // Custom hook for user management logic and API
  const {
    users,
    pagination,
    loading,
    fetchUsers,
    promoteToStaff,
    updateUserActiveStatus,
    deleteUser,
    updateUser
  } = useUserManagement();

  // Component-specific state
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    role: '',
    isActive: null
  });
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  // Initial fetch
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle filter change
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Apply filters
  const applyFilters = () => {
    fetchUsers({ page: 1, filters }); // Reset to first page when filtering
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      name: '',
      email: '',
      role: '',
      isActive: null
    });
    // Fetch with cleared filters
    fetchUsers({ page: 1, filters: {} });
  };

  // Handle table pagination change
  const handleTableChange = (newPagination, filters, sorter) => {
    fetchUsers({
      page: newPagination.current,
      pageSize: newPagination.pageSize,
      sortField: sorter.field || 'id',
      sortDirection: sorter.order === 'descend' ? 'desc' : 'asc'
    });
  };

  // Show edit modal
  const showEditModal = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      active: user.active
    });
    setEditModalVisible(true);
  };

  // Handle edit form submit
  const handleEditFormSubmit = async () => {
    try {
      const values = await form.validateFields();
      const success = await updateUser(editingUser.id, values);
      
      if (success) {
        setEditModalVisible(false);
      }
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  // Show delete confirmation
  const showDeleteConfirm = (user) => {
    confirm({
      title: 'Are you sure you want to delete this user?',
      icon: <ExclamationCircleOutlined />,
      content: `This will permanently delete ${user.name}. This action cannot be undone.`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        return deleteUser(user.id);
      }
    });
  };

  // Format date from timestamp
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString();
  };

  // Table columns
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          <div>
            <Text type="secondary">{record.email}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        // Set color based on role
        let color = 'default';
        if (role === 'ADMIN') color = 'purple';
        else if (role === 'STAFF') color = 'blue';
        else if (role === 'USER') color = 'green';
        
        return <Tag color={color}>{role}</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'active',
      render: (active) => (
        <Tag color={active ? 'success' : 'error'}>
          {active ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (timestamp) => formatDate(timestamp),
    },
    {
      title: 'Updated At',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (timestamp) => formatDate(timestamp),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {/* Edit Button */}
          <Tooltip title="Edit User">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => showEditModal(record)} 
            />
          </Tooltip>
          
          {/* Promote to Staff Button (only for USER role) */}
          {record.role === 'USER' && (
            <Tooltip title="Promote to Staff">
              <Popconfirm
                title="Promote to Staff?"
                description="Are you sure you want to promote this user to staff role?"
                onConfirm={() => promoteToStaff(record.id)}
                okText="Yes"
                cancelText="No"
              >
                <Button type="text" icon={<UserSwitchOutlined />} />
              </Popconfirm>
            </Tooltip>
          )}
          
          {/* Activate/Deactivate Button */}
          <Tooltip title={record.active ? 'Deactivate User' : 'Activate User'}>
            <Switch
              checked={record.active}
              onChange={(checked) => updateUserActiveStatus(record.id, checked)}
              loading={loading}
              size="small"
            />
          </Tooltip>
          
          {/* Delete Button - Only show for non-admin users */}
          {record.role !== 'ADMIN' && (
            <Tooltip title="Delete User">
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />}
                onClick={() => showDeleteConfirm(record)}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="user-management">
      <Row gutter={[16, 16]} justify="space-between" align="middle" className="mb-4">
        <Col>
          <Title level={2}>User Management</Title>
          <Text type="secondary">Manage system users, roles, and permissions</Text>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() => window.location.href = '/dashboard/user-management/create'}
          >
            Add New User
          </Button>
        </Col>
      </Row>
      
      {/* Filters */}
      <Card className="mb-4">
        <Form layout="inline" className="mb-4">
          <Form.Item label="Name">
            <Input
              placeholder="Search by name"
              value={filters.name}
              onChange={(e) => handleFilterChange('name', e.target.value)}
              allowClear
            />
          </Form.Item>
          <Form.Item label="Email">
            <Input
              placeholder="Search by email"
              value={filters.email}
              onChange={(e) => handleFilterChange('email', e.target.value)}
              allowClear
            />
          </Form.Item>
          <Form.Item label="Role">
            <Select
              placeholder="Select role"
              value={filters.role}
              onChange={(value) => handleFilterChange('role', value)}
              allowClear
              style={{ width: 120 }}
            >
              <Option value="ADMIN">Admin</Option>
              <Option value="STAFF">Staff</Option>
              <Option value="USER">User</Option>
            </Select>
          </Form.Item>
          <Form.Item label="Status">
            <Select
              placeholder="Select status"
              value={filters.isActive}
              onChange={(value) => handleFilterChange('isActive', value)}
              allowClear
              style={{ width: 120 }}
            >
              <Option value={true}>Active</Option>
              <Option value={false}>Inactive</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" icon={<SearchOutlined />} onClick={applyFilters}>
              Search
            </Button>
          </Form.Item>
          <Form.Item>
            <Button icon={<ReloadOutlined />} onClick={clearFilters}>
              Reset
            </Button>
          </Form.Item>
        </Form>
      </Card>
      
      {/* Users Table */}
      <Card
        title={`Users (${pagination.total})`}
        extra={
          <Space>
            <Button icon={<UploadOutlined />}>Import</Button>
            <Button icon={<DownloadOutlined />}>Export</Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Total ${total} users`
          }}
          loading={loading}
          onChange={handleTableChange}
        />
      </Card>
      
      {/* Edit User Modal */}
      <Modal
        title="Edit User"
        open={editModalVisible}
        onOk={handleEditFormSubmit}
        onCancel={() => setEditModalVisible(false)}
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input disabled />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Phone"
            rules={[{ required: true, message: 'Please enter phone number' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Please select role' }]}
          >
            <Select>
              <Option value="ADMIN">Admin</Option>
              <Option value="STAFF">Staff</Option>
              <Option value="USER">User</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="active"
            label="Status"
            valuePropName="checked"
          >
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;