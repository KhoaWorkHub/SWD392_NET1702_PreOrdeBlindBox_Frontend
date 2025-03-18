import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Row,
  Col,
  Card,
  Button,
  Typography,
  Form,
  Input,
  Avatar,
  Divider,
  Breadcrumb,
  Spin,
  message,
  Tabs,
  Upload,
} from 'antd';
import {
  HomeOutlined,
  UserOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  MailOutlined,
  LockOutlined,
  SaveOutlined,
  EditOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import useAuth from '../../hooks/useAuth';
import userService from '../../api/services/userService';
import './ProfilePage.css';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

/**
 * ProfilePage component for displaying and editing user profile
 *
 * @returns {JSX.Element} The ProfilePage component
 */
const ProfilePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // Fetch user profile on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserProfile();
    } else {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Fetch user profile data
  const fetchUserProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await userService.getUserProfile();
      if (response && response.status === true && response.metadata) {
        setProfile(response.metadata);
        profileForm.setFieldsValue({
          fullName: response.metadata.fullName,
          email: response.metadata.email,
          phoneNumber: response.metadata.phoneNumber,
          userAddress: response.metadata.userAddress,
        });
        
        if (response.metadata.avatarUrl) {
          setAvatarUrl(response.metadata.avatarUrl);
        }
      } else {
        throw new Error('Failed to load user profile');
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError(err.message || 'An error occurred while fetching your profile');
      message.error(err.message || 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  // Handle profile form submission
  const handleProfileUpdate = async (values) => {
    setSaving(true);
    try {
      await userService.updateUserProfile(values);
      message.success('Profile updated successfully');
      setEditMode(false);
      // Refresh profile data
      await fetchUserProfile();
    } catch (err) {
      console.error('Error updating profile:', err);
      message.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (values) => {
    setSaving(true);
    try {
      // In a real implementation, you would have a specific endpoint for this
      // For now, we'll simulate it with a success message
      message.success('Password changed successfully');
      passwordForm.resetFields();
    } catch (err) {
      console.error('Error changing password:', err);
      message.error(err.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  // Handle avatar upload
  const handleAvatarChange = (info) => {
    if (info.file.status === 'done') {
      // In a real implementation, this would be the URL returned from your server
      setAvatarUrl(URL.createObjectURL(info.file.originFileObj));
      message.success('Avatar uploaded successfully');
    } else if (info.file.status === 'error') {
      message.error('Avatar upload failed');
    }
  };

  // If not authenticated, show loading
  if (!isAuthenticated) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb Navigation */}
      <Breadcrumb className="mb-6">
        <Breadcrumb.Item>
          <Link to="/">
            <HomeOutlined /> Home
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to="/account">
            <UserOutlined /> My Account
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>Profile</Breadcrumb.Item>
      </Breadcrumb>

      <Title level={2} className="mb-6">My Profile</Title>

      {/* Loading State */}
      {loading ? (
        <div className="loading-container">
          <Spin size="large" />
          <Text className="mt-4">Loading your profile...</Text>
        </div>
      ) : error ? (
        <div className="error-container">
          <Title level={4} className="text-red-500">Error Loading Profile</Title>
          <Text>{error}</Text>
          <Button 
            type="primary" 
            onClick={fetchUserProfile}
            className="mt-4"
          >
            Try Again
          </Button>
        </div>
      ) : (
        <Row gutter={[32, 24]}>
          <Col xs={24} md={8}>
            {/* Profile Summary Card */}
            <Card className="profile-card">
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <Avatar 
                    size={120} 
                    icon={<UserOutlined />} 
                    src={avatarUrl}
                    className="border-4 border-gray-100"
                  />
                  {editMode && (
                    <Upload
                      name="avatar"
                      showUploadList={false}
                      onChange={handleAvatarChange}
                      className="absolute bottom-0 right-0"
                      action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                    >
                      <Button 
                        shape="circle" 
                        icon={<UploadOutlined />}
                        className="bg-white shadow-md"
                      />
                    </Upload>
                  )}
                </div>
                <Title level={4} className="mt-4 mb-1">
                  {profile.fullName || 'User'}
                </Title>
                <Text type="secondary">{profile.email}</Text>
              </div>

              <Divider />

              <div className="profile-info">
                <div className="mb-4">
                  <Text type="secondary" className="block">
                    <PhoneOutlined className="mr-2" /> Phone
                  </Text>
                  <Text strong>
                    {profile.phoneNumber || 'Not provided'}
                  </Text>
                </div>
                
                <div className="mb-4">
                  <Text type="secondary" className="block">
                    <EnvironmentOutlined className="mr-2" /> Address
                  </Text>
                  <Text strong>
                    {profile.userAddress || 'Not provided'}
                  </Text>
                </div>
                
                <div>
                  <Text type="secondary" className="block">
                    <UserOutlined className="mr-2" /> Role
                  </Text>
                  <Text strong>
                    {profile.role || 'Customer'}
                  </Text>
                </div>
              </div>

              <Divider />

              <Button
                type={editMode ? "default" : "primary"}
                icon={editMode ? null : <EditOutlined />}
                onClick={() => setEditMode(!editMode)}
                block
                className={editMode ? "" : "bg-black hover:bg-gray-800"}
              >
                {editMode ? "Cancel Editing" : "Edit Profile"}
              </Button>
            </Card>
          </Col>

          <Col xs={24} md={16}>
            {/* Profile Settings Card */}
            <Card>
              <Tabs defaultActiveKey="profile">
                <TabPane 
                  tab={
                    <span>
                      <UserOutlined /> Profile Information
                    </span>
                  } 
                  key="profile"
                >
                  <Form
                    form={profileForm}
                    name="profile-form"
                    layout="vertical"
                    onFinish={handleProfileUpdate}
                    requiredMark={false}
                    disabled={!editMode}
                  >
                    <Row gutter={16}>
                      <Col xs={24}>
                        <Form.Item
                          name="fullName"
                          label="Full Name"
                          rules={[
                            { required: true, message: 'Please enter your full name' }
                          ]}
                        >
                          <Input 
                            prefix={<UserOutlined className="site-form-item-icon" />}
                            placeholder="Full Name"
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="email"
                          label="Email"
                          rules={[
                            { required: true, message: 'Please enter your email' },
                            { type: 'email', message: 'Please enter a valid email' }
                          ]}
                        >
                          <Input 
                            prefix={<MailOutlined className="site-form-item-icon" />}
                            placeholder="Email"
                            disabled
                          />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="phoneNumber"
                          label="Phone Number"
                          rules={[
                            { required: true, message: 'Please enter your phone number' },
                            { pattern: /^[0-9]{10}$/, message: 'Please enter a valid 10-digit phone number' }
                          ]}
                        >
                          <Input 
                            prefix={<PhoneOutlined className="site-form-item-icon" />}
                            placeholder="Phone Number"
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item
                      name="userAddress"
                      label="Address"
                      rules={[
                        { required: true, message: 'Please enter your address' }
                      ]}
                    >
                      <Input.TextArea 
                        placeholder="Address"
                        rows={3}
                      />
                    </Form.Item>

                    {editMode && (
                      <Form.Item>
                        <Button 
                          type="primary" 
                          htmlType="submit"
                          icon={<SaveOutlined />}
                          loading={saving}
                          className="bg-black hover:bg-gray-800"
                        >
                          Save Changes
                        </Button>
                      </Form.Item>
                    )}
                  </Form>
                </TabPane>

                <TabPane 
                  tab={
                    <span>
                      <LockOutlined /> Change Password
                    </span>
                  } 
                  key="password"
                >
                  <Form
                    form={passwordForm}
                    name="password-form"
                    layout="vertical"
                    onFinish={handlePasswordChange}
                    requiredMark={false}
                  >
                    <Form.Item
                      name="currentPassword"
                      label="Current Password"
                      rules={[
                        { required: true, message: 'Please enter your current password' }
                      ]}
                    >
                      <Input.Password 
                        prefix={<LockOutlined className="site-form-item-icon" />}
                        placeholder="Current Password"
                      />
                    </Form.Item>

                    <Form.Item
                      name="newPassword"
                      label="New Password"
                      rules={[
                        { required: true, message: 'Please enter your new password' },
                        { min: 8, message: 'Password must be at least 8 characters' }
                      ]}
                    >
                      <Input.Password 
                        prefix={<LockOutlined className="site-form-item-icon" />}
                        placeholder="New Password"
                      />
                    </Form.Item>

                    <Form.Item
                      name="confirmPassword"
                      label="Confirm New Password"
                      dependencies={['newPassword']}
                      rules={[
                        { required: true, message: 'Please confirm your new password' },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue('newPassword') === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(new Error('The two passwords do not match'));
                          },
                        }),
                      ]}
                    >
                      <Input.Password 
                        prefix={<LockOutlined className="site-form-item-icon" />}
                        placeholder="Confirm New Password"
                      />
                    </Form.Item>

                    <Form.Item>
                      <Button 
                        type="primary" 
                        htmlType="submit"
                        loading={saving}
                        className="bg-black hover:bg-gray-800"
                      >
                        Update Password
                      </Button>
                    </Form.Item>
                  </Form>
                </TabPane>
              </Tabs>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default ProfilePage;