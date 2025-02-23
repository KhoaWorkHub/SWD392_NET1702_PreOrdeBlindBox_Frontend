import { Input, Button, Row, Col, Space } from 'antd';
import { 
  InstagramOutlined,
  FacebookOutlined,
  TwitterOutlined,
  YoutubeOutlined,
  LinkedinOutlined,
  PinterestOutlined,
  TikTokOutlined
} from '@ant-design/icons';
import './Footer.css';
import visaLogo from '../../assets/visa.png';
import mastercardLogo from '../../assets/mastercard.png';
import paypalLogo from '../../assets/paypal.png';

export const Footer = () => {
  return (
    <footer>
      {/* Social Media Bar */}
      <div className="bg-gray-50 py-6">
        <div className="text-center">
          <span className="font-bold mr-6">FOLLOW US ON</span>
          <div className="social-icons inline-flex">
            <InstagramOutlined />
            <FacebookOutlined />
            <TwitterOutlined />
            <YoutubeOutlined />
            <TikTokOutlined />
            <LinkedinOutlined />
            <PinterestOutlined />
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="bg-black text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <Row gutter={[64, 32]}>
            {/* Join Community Section */}
            <Col span={8}>
              <h3 className="text-white font-normal mb-4">JOIN THE COMMUNITY</h3>
              <p className="text-gray-400 text-sm mb-4">
                Be the first to catch our new releases, exclusive offers, and more.
              </p>
              <div className="flex mb-8">
                <Input 
                  placeholder="Your email address"
                  className="email-signup-input"
                />
                <Button className="email-signup-button">
                  Sign Me Up
                </Button>
              </div>

              <div className="mt-8">
                <h3 className="text-white font-normal mb-4">Contact Us</h3>
                <div className="footer-contact-box">
                  <p>Chat</p>
                  <p className="time">Monday - Friday 9:00 am - 18:00 pm CST</p>
                  <Button type="link" className="contact-link">
                    Chat with us
                  </Button>
                </div>
                <div className="footer-contact-box">
                  <p>Email</p>
                  <p className="time">support@popmart.com</p>
                  <Button type="link" className="contact-link">
                    Email us
                  </Button>
                </div>
              </div>

              <div className="mt-8">
                <Button type="link" className="contact-link">
                  Visit Help Center (FAQs)
                </Button>
              </div>

              <Button className="language-button">
                CHANGE COUNTRY/REGION | 🇻🇳 VN
              </Button>
              <Button className="language-button">
                LANGUAGE | English
              </Button>
            </Col>

            {/* Help Section */}
            <Col span={5} className="footer-links">
              <h3 className="text-white font-normal mb-4">HELP</h3>
              <Space direction="vertical" size={12}>
                <Button type="link">FAQs</Button>
                <Button type="link">Terms & Conditions</Button>
                <Button type="link">Privacy Policy</Button>
                <Button type="link">Shipping Policy</Button>
                <Button type="link">Returns & Refunds</Button>
                <Button type="link">Track your order</Button>
                <Button type="link">POP BLOCKS after-sales</Button>
                <Button type="link">Order Status</Button>
              </Space>
            </Col>

            {/* Information Section */}
            <Col span={5} className="footer-links">
              <h3 className="text-white font-normal mb-4">INFORMATION</h3>
              <Space direction="vertical" size={12}>
                <Button type="link">Store</Button>
                <Button type="link">About us</Button>
                <Button type="link">Investor Relations</Button>
                <Button type="link">Contact us</Button>
                <Button type="link">Global Ambassador</Button>
                <Button type="link">News</Button>
                <Button type="link">Stamps Event</Button>
              </Space>
            </Col>

            {/* Shop Section */}
            <Col span={5} className="footer-links">
              <h3 className="text-white font-normal mb-4">SHOP</h3>
              <Space direction="vertical" size={12}>
                <Button type="link">All Blind Box</Button>
                <Button type="link">All Figures</Button>
                <Button type="link">Accessories</Button>
              </Space>
            </Col>
          </Row>
        </div>
      </div>

      {/* Copyright and Payment Methods */}
      <div className="bg-black border-t border-gray-800 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-400 mb-4">© 2025 POP MART ALL RIGHTS RESERVED</p>
            <Space size={16} className="justify-center">
            <img src={visaLogo} alt="Visa" className="h-6" />
            <img src={mastercardLogo} alt="Mastercard" className="h-6" />
            <img src={paypalLogo} alt="PayPal" className="h-6" />
            </Space>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;