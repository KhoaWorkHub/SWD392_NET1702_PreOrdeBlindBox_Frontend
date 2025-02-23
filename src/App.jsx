import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import 'antd/dist/reset.css';
import { Login } from "./components/Login/Login";
import { HomePage } from "./components/HomePage/HomePage";
import { Footer } from "./components/Footer/Footer";
const App = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
        </Routes>
        <Footer/>
      </div>
    </BrowserRouter>
  );
};

export default App;
