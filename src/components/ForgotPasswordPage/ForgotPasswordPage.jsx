import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Steps, 
  Form, 
  Input, 
  Button, 
  Card, 
  Typography, 
  message, 
  Divider,
  Result
} from 'antd';
import { 
  MailOutlined, 
  LockOutlined, 
  KeyOutlined, 
  ArrowLeftOutlined, 
  CheckCircleOutlined
} from '@ant-design/icons';
import userService from '../../api/services/userService';
import './ForgotPassword.css';

const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;

/**
 * ForgotPasswordPage component for handling the password reset flow
 * 
 * @returns {JSX.Element} The ForgotPasswordPage component
 */
const ForgotPasswordPage = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);

  // Handle requesting OTP
  const handleRequestOTP = async (values) => {
    setLoading(true);
    try {
      const { email } = values;
      await userService.forgotPassword({ email });
      
      setEmail(email);
      setOtpRequested(true);
      setCurrentStep(1);
      message.success('OTP code has been sent to your email');
    } catch (error) {
      message.error(error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification and password reset
  const handleVerifyOTP = async (values) => {
    setLoading(true);
    try {
      const { otpCode, newPassword } = values;
      
      await userService.confirmOTP({ 
        email, 
        otpCode, 
        newPassword 
      });
      
      setOtpVerified(true);
      setResetComplete(true);
      setCurrentStep(2);
      message.success('Password has been reset successfully');
    } catch (error) {
      message.error(error.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOTP = async () => {
    setLoading(true);
    try {
      await userService.resendOTP({ email });
      message.success('A new OTP has been sent to your email');
    } catch (error) {
      message.error(error.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Render different steps based on current state
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Form
            form={form}
            name="forgot-password"
            onFinish={handleRequestOTP}
            layout="vertical"
            requiredMark={false}
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' }
              ]}
            >
              <Input 
                prefix={<MailOutlined className="site-form-item-icon" />}
                placeholder="Email"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={loading}
                className="bg-black hover:bg-gray-800"
              >
                Send Reset Code
              </Button>
            </Form.Item>
          </Form>
        );
        
      case 1:
        return (
          <Form
            form={form}
            name="reset-password"
            onFinish={handleVerifyOTP}
            layout="vertical"
            requiredMark={false}
          >
            <Paragraph className="mb-4">
              We've sent a verification code to <Text strong>{email}</Text>.
              Please check your inbox and enter the code below.
            </Paragraph>
            
            <Form.Item
              name="otpCode"
              rules={[
                { required: true, message: 'Please enter the verification code' },
                { min: 4, message: 'Please enter a valid verification code' }
              ]}
            >
              <Input 
                prefix={<KeyOutlined className="site-form-item-icon" />}
                placeholder="Verification Code"
                size="large"
                maxLength={6}
              />
            </Form.Item>

            <Form.Item
              name="newPassword"
              rules={[
                { required: true, message: 'Please enter your new password' },
                { min: 8, message: 'Password must be at least 8 characters' }
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined className="site-form-item-icon" />}
                placeholder="New Password"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
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
                placeholder="Confirm Password"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                loading={loading}
                className="bg-black hover:bg-gray-800"
              >
                Reset Password
              </Button>
              <Button
                type="link"
                block
                onClick={handleResendOTP}
                disabled={loading}
                className="mt-2"
              >
                Didn't receive the code? Resend
              </Button>
            </Form.Item>
          </Form>
        );
        
      case 2:
        return (
          <Result
            status="success"
            icon={<CheckCircleOutlined />}
            title="Password Reset Successful!"
            subTitle="Your password has been reset successfully. You can now login with your new password."
            extra={[
              <Button
                type="primary"
                key="login"
                size="large"
                onClick={() => navigate('/login')}
                className="bg-black hover:bg-gray-800"
              >
                Go to Login
              </Button>,
              <Button 
                key="home" 
                size="large" 
                onClick={() => navigate('/')}
              >
                Back to Home
              </Button>,
            ]}
          />
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-white px-4 py-12">
      <Card className="w-full max-w-md shadow-sm">
        <div className="mb-6">
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            Back
          </Button>
          <Title level={3} className="text-center mb-1">Reset Your Password</Title>
          <Text type="secondary" className="text-center block mb-6">
            Follow the steps to recover your account
          </Text>

          <Steps
            current={currentStep}
            className="mb-8"
            items={[
              {
                title: 'Email',
                description: 'Verify email',
              },
              {
                title: 'Verification',
                description: 'Enter OTP',
              },
              {
                title: 'Completed',
                description: 'Reset success',
              },
            ]}
          />
        </div>

        {renderStepContent()}

        <Divider />
        
        <div className="text-center">
          <Text type="secondary">
            Remember your password? <Link to="/login">Login</Link>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;