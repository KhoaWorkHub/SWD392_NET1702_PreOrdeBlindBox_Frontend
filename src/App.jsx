import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import 'antd/dist/reset.css';
import { Login } from "./components/Login/Login";
import { HomePage } from "./components/HomePage/HomePage";
import { Footer } from "./components/Footer/Footer";
import Register from "./components/Register/Register.jsx";
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import BlindboxPage from "./components/BlindboxPage/BlindboxPage.jsx";
import BlindboxDetailPage from "./components/BlindboxDetailPage/BlindboxDetailPage.jsx";
import CartPage from "./components/CartPage/CartPage.jsx";
import CheckoutPage from "./components/CheckoutPage/CheckoutPage.jsx";
import OrderConfirmationPage from "./components/OrderConfirmationPage/OrderConfirmationPage.jsx";

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <ToastContainer position="top-right" autoClose={1000} />
          <div className="min-h-screen bg-white">
            <Navbar />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/blindbox" element={<BlindboxPage />} />
              <Route path="/blindbox/:id" element={<BlindboxDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order-confirmation/:preorderId" element={<OrderConfirmationPage />} />
            </Routes>
            <Footer/>
          </div>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;