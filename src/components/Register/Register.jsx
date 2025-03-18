import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input, Select, DatePicker, Button, Form, Divider, Steps, message, Alert } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone, UserOutlined, PhoneOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import userService from '../../api/services/userService';
import useAuth from '../../hooks/useAuth';
import './Register.css';

const { Option } = Select;
const { Step } = Steps;

const Register = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('Vietnam');
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onFinish = async (values) => {
    setLoading(true);
    setGeneralError(null);
    setFieldErrors({});

    console.log("Form values:", values);
    console.log("Current form values:", form.getFieldsValue());

    try {
      // Log field values for debugging
      const expectedFields = ['email', 'password', 'name', 'phone', 'gender', 'dateOfBirth', 'agreement'];
      console.log("Form fields status:", expectedFields.map(field => ({
        field,
        value: form.getFieldValue(field),
        isDefined: form.getFieldValue(field) !== undefined
      })));
      
      // Get form values directly to ensure we capture them correctly
      const formValues = form.getFieldsValue(true);
      console.log("All form values:", formValues);

      // Prepare registration payload with explicit values from form
      const registrationData = {
        email: formValues.email ? formValues.email.trim() : '',
        password: formValues.password ? formValues.password.trim() : '',
        name: formValues.name ? formValues.name.trim() : '',
        phone: formValues.phone ? formValues.phone.trim() : '',
        gender: formValues.gender || null,
        dateOfBirth: formValues.dateOfBirth 
          ? formValues.dateOfBirth.format('YYYY-MM-DD') 
          : null
      };

      console.log("Registration data to be sent:", registrationData);

      // Call user registration service
      const response = await userService.register(registrationData);

      // Handle successful registration
      message.success('Registration successful!');
      
      // Redirect based on response
      if (response.metadata?.accessToken) {
        navigate('/');
      } else {
        navigate('/login');
      }
    } catch (error) {
      console.error('Registration error:', error);

      // Handle backend validation errors
      if (error.metadata && Array.isArray(error.metadata)) {
        const errors = {};
        
        // Process field-specific errors
        error.metadata.forEach(err => {
          // Map backend error codes to form field names
          const fieldMapping = {
            'email': 'email',
            'password': 'password',
            'name': 'name',
            'phone': 'phone'
          };

          const mappedField = fieldMapping[err.code] || err.code;
          
          // Store first error for each field
          if (!errors[mappedField]) {
            errors[mappedField] = err.message;
          }
        });

        // Set field errors
        setFieldErrors(errors);
        form.setFields(
          Object.entries(errors).map(([field, message]) => ({
            name: field,
            errors: [message]
          }))
        );

        // Set general error message
        setGeneralError('Please correct the errors in the form.');

        // Determine which step to show based on errors
        const accountStepErrors = ['email', 'password'];
        const profileStepErrors = ['name', 'phone'];

        const hasAccountStepError = Object.keys(errors).some(field => 
          accountStepErrors.includes(field)
        );

        const hasProfileStepError = Object.keys(errors).some(field => 
          profileStepErrors.includes(field)
        );

        if (hasAccountStepError) {
          setCurrentStep(0);
        } else if (hasProfileStepError) {
          setCurrentStep(1);
        }
      } else {
        // Set a general error message if no specific field errors
        setGeneralError(
          error.message || 
          'Registration failed. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

    // Form validation rules
    const formRules = {
      email: [
        { required: true, message: 'Please enter your email' },
        { type: 'email', message: 'Please enter a valid email address' }
      ],
      password: [
        { required: true, message: 'Please enter your password' },
        { min: 8, message: 'Password must be at least 8 characters' },
        { 
          pattern: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
          message: 'Password must include letters, numbers, and special characters'
        }
      ],
      confirmPassword: [
        { required: true, message: 'Please confirm your password' },
        ({ getFieldValue }) => ({
          validator(_, value) {
            if (!value || getFieldValue('password') === value) {
              return Promise.resolve();
            }
            return Promise.reject(new Error('The two passwords do not match'));
          },
        }),
      ],
      name: [
        { required: true, message: 'Please enter your full name' }
      ],
      phone: [
        { required: true, message: 'Please enter your phone number' },
        { 
          pattern: /^[0-9]{10}$/, 
          message: 'Phone number must be 10 digits' 
        }
      ]
    };

  const steps = [
    {
      title: 'Account',
      content: (
        <>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
            validateStatus={fieldErrors.email ? 'error' : undefined}
            help={fieldErrors.email}
          >
            <Input 
              className="h-12 border-gray-200" 
              placeholder="Email address"
              prefix={<MailOutlined className="text-gray-300" />}
            />
          </Form.Item>
          
          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please enter your password' },
              { min: 8, message: 'Password must be at least 8 characters' },
              { 
                pattern: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
                message: 'Password must include letters, numbers, and special characters'
              }
            ]}
            validateStatus={fieldErrors.password ? 'error' : undefined}
            help={fieldErrors.password}
          >
            <Input.Password
              className="h-12 border-gray-200"
              placeholder="Create a password"
              iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>
          
          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password
              className="h-12 border-gray-200"
              placeholder="Confirm password"
              iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>
        </>
      ),
    },
    {
      title: 'Profile',
      content: (
        <>
          <Form.Item
            name="name"
            rules={[{ required: true, message: 'Please enter your name' }]}
            validateStatus={fieldErrors.name ? 'error' : undefined}
            help={fieldErrors.name}
          >
            <Input 
              className="h-12 border-gray-200" 
              placeholder="Full Name"
              prefix={<UserOutlined className="text-gray-300" />}
            />
          </Form.Item>

          <Form.Item
            name="phone"
            rules={[
              { required: true, message: 'Please enter your phone number' },
              { pattern: /^[0-9]{10}$/, message: 'Phone number must be 10 digits' }
            ]}
            validateStatus={fieldErrors.phone ? 'error' : undefined}
            help={fieldErrors.phone}
          >
            <Input 
              className="h-12 border-gray-200" 
              placeholder="Phone Number (10 digits)"
              prefix={<PhoneOutlined className="text-gray-300" />}
            />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="gender"
            >
              <Select
                placeholder="Select gender"
                className="h-12 w-full"
              >
                <Option value="MALE">Male</Option>
                <Option value="FEMALE">Female</Option>
                <Option value="OTHER">Other</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="dateOfBirth"
            >
              <DatePicker 
                className="h-12 w-full border-gray-200" 
                placeholder="Date of Birth"
              />
            </Form.Item>
          </div>
        </>
      ),
    },
    {
      title: 'Confirm',
      content: (
        <>
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h3 className="text-lg font-medium mb-2">Review Your Information</h3>
            
            <div className="mb-3">
              <p className="text-gray-600">Email:</p>
              <p className="font-medium">{form.getFieldValue('email')}</p>
            </div>
            
            <div className="mb-3">
              <p className="text-gray-600">Full Name:</p>
              <p className="font-medium">{form.getFieldValue('name')}</p>
            </div>
            
            <div className="mb-3">
              <p className="text-gray-600">Phone Number:</p>
              <p className="font-medium">{form.getFieldValue('phone')}</p>
            </div>
            
            {form.getFieldValue('gender') && (
              <div className="mb-3">
                <p className="text-gray-600">Gender:</p>
                <p className="font-medium">{form.getFieldValue('gender')}</p>
              </div>
            )}
            
            {form.getFieldValue('dateOfBirth') && (
              <div className="mb-3">
                <p className="text-gray-600">Date of Birth:</p>
                <p className="font-medium">{form.getFieldValue('dateOfBirth').format('YYYY-MM-DD')}</p>
              </div>
            )}
          </div>

          {/* Display error message from API if any */}
          {generalError && (
            <Alert
              message="Registration Error"
              description={generalError}
              type="error"
              showIcon
              className="mb-4"
            />
          )}

          <Form.Item
            name="agreement"
            valuePropName="checked"
            rules={[
              { 
                validator: (_, value) =>
                  value ? Promise.resolve() : Promise.reject(new Error('You must agree to the terms and conditions')),
              },
            ]}
          >
            <div className="flex items-start">
              <input 
                type="checkbox" 
                className="button-checkbox"
              />
              <p className="text-sm text-gray-500">
                By clicking Register, I agree to POP MART&apos;s{' '}
                <a href="#" className="underline hover:text-black">Terms of Service</a>{' '}
                and{' '}
                <a href="#" className="underline hover:text-black">Privacy Policy</a>.
              </p>
            </div>
          </Form.Item>
        </>
      ),
    },
  ];

  const next = async () => {
    try {
      // Validate fields in the current step
      let fieldsToValidate = [];
      
      if (currentStep === 0) {
        fieldsToValidate = ['email', 'password', 'confirmPassword'];
      } else if (currentStep === 1) {
        fieldsToValidate = ['name', 'phone'];
      }
      
      await form.validateFields(fieldsToValidate);
      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.log('Validation failed:', error);
    }
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  // Clear field errors when changing steps
  useEffect(() => {
    setFieldErrors({});
  }, [currentStep]);

  return (
    <div className="flex justify-center items-start pt-6 pb-12 min-h-screen bg-white px-4">
      <div className="w-full max-w-[500px]">
        <h1 className="text-center text-2xl font-medium mb-4">CREATE AN ACCOUNT</h1>
        
        {/* Country Selector */}
        <div className="mb-4 relative">
          <button 
            type="button"
            className="w-full h-12 px-4 border border-gray-200 rounded flex items-center justify-between bg-white"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <div className="flex items-center">
              <img 
                src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NDAgNDgwIj48cGF0aCBmaWxsPSIjZGEyNTFkIiBkPSJNMCAwaDY0MHY0ODBIMHoiLz48cGF0aCBmaWxsPSIjZmZmZjAwIiBkPSJNMjk5LjYgMTM5LjFsLTQzLjggMTM1LjIgMTE0LjctODMuMmgtMTQxLjhsMTE0LjcgODMuMnoiLz48L3N2Zz4=" 
                alt="VN Flag"
                className="w-6 h-4 mr-2"
              />
              {selectedCountry}
            </div>
            <span className="text-gray-400">▼</span>
          </button>
          
          {isDropdownOpen && (
            <div className="absolute w-full mt-1 bg-white border border-gray-200 rounded shadow-lg z-10">
              <button
                type="button"
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center"
                onClick={() => {
                  setSelectedCountry('Vietnam');
                  setIsDropdownOpen(false);
                }}
              >
                <img 
                  src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NDAgNDgwIj48cGF0aCBmaWxsPSIjZGEyNTFkIiBkPSJNMCAwaDY0MHY0ODBIMHoiLz48cGF0aCBmaWxsPSIjZmZmZjAwIiBkPSJNMjk5LjYgMTM5LjFsLTQzLjggMTM1LjIgMTE0LjctODMuMmgtMTQxLjhsMTE0LjcgODMuMnoiLz48L3N2Zz4=" 
                  alt="VN Flag"
                  className="w-6 h-4 mr-2"
                />
                Vietnam
              </button>
            </div>
          )}
        </div>

        {/* Display general error at the top if we have one */}
        {generalError && currentStep === 2 && (
          <Alert
            message="Registration Error"
            description={generalError}
            type="error"
            showIcon
            className="mb-4"
          />
        )}

        {/* Registration Steps */}
        <Steps 
          current={currentStep} 
          items={steps.map(item => ({ key: item.title, title: item.title }))}
          className="mb-6" 
        />

        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          layout="vertical"
          requiredMark={false}
          className="mb-4 mt-6"
        >
          <div className="min-h-[220px]">
            {steps[currentStep].content}
          </div>

          <div className="flex justify-between mt-6">
            {currentStep > 0 && (
              <Button 
                style={{ margin: '0 8px' }} 
                onClick={prev}
                className="h-12 px-6"
                disabled={loading}
              >
                Previous
              </Button>
            )}
            
            {currentStep < steps.length - 1 && (
              <Button 
                type="primary" 
                onClick={next}
                className="h-12 px-6 ml-auto bg-black text-white"
              >
                Next
              </Button>
            )}
            
            {currentStep === steps.length - 1 && (
              <Button 
                type="primary" 
                htmlType="submit"
                className="h-12 px-6 ml-auto bg-black text-white"
                loading={loading}
              >
                {loading ? 'REGISTERING...' : 'REGISTER'}
              </Button>
            )}
          </div>
        </Form>

        {/* Social Login Section */}
        <div className="mt-8">
          <Divider plain className="mb-6">
            <span className="text-gray-500 text-sm">Or Register With</span>
          </Divider>

          <div className="flex justify-center gap-4 mb-6">
            {/* Google Button */}
            <button type="button" className="w-12 h-12 flex items-center justify-center rounded-full border border-gray-200 hover:border-gray-400 transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </button>

            {/* Apple Button */}
            <button type="button" className="w-12 h-12 flex items-center justify-center rounded-full border border-gray-200 hover:border-gray-400 transition-colors">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14.94 5.19A4.38 4.38 0 0 0 16 2.5a4.38 4.38 0 0 0-2.91 1.52 4.1 4.1 0 0 0-1.02 2.61 3.62 3.62 0 0 0 2.87-1.44zm2.52 7.44a4.51 4.51 0 0 1 2.16-3.81 4.66 4.66 0 0 0-3.66-2c-1.56-.16-3.05.92-3.83.92-.79 0-2-.9-3.3-.87a4.92 4.92 0 0 0-4.14 2.53c-1.77 3.07-.46 7.58 1.26 10.07.84 1.2 1.84 2.56 3.15 2.51 1.26-.05 1.74-.82 3.27-.82 1.52 0 1.95.82 3.28.79 1.36-.02 2.22-1.24 3.06-2.45a10.95 10.95 0 0 0 1.38-2.85 4.4 4.4 0 0 1-2.63-4.02z"/>
              </svg>
            </button>
          </div>

          {/* Already have an account */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-black font-medium hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;