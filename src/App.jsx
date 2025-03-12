import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import 'antd/dist/reset.css';
import { Login } from "./components/Login/Login";
import { HomePage } from "./components/HomePage/HomePage";
import { Footer } from "./components/Footer/Footer";
import Register from "./components/Register/Register.jsx";
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './contexts/AuthContext';
import BlindboxPage from "./components/BlindboxPage/BlindboxPage.jsx";
import BlindboxDetailPage from "./components/BlindboxDetailPage/BlindboxDetailPage.jsx";

const App = () => {
  return (
    <AuthProvider>
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
          </Routes>
          <Footer/>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
