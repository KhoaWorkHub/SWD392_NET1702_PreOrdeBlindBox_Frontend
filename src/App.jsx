import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import "antd/dist/reset.css";
import { Login } from "./components/Login/Login";
import { HomePage } from "./components/HomePage/HomePage";
import { Footer } from "./components/Footer/Footer";
import Register from "./components/Register/Register.jsx";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import BlindboxPage from "./components/BlindboxPage/BlindboxPage.jsx";
import BlindboxDetailPage from "./components/BlindboxDetailPage/BlindboxDetailPage.jsx";
import CartPage from "./components/CartPage/CartPage.jsx";
import CheckoutPage from "./components/CheckoutPage/CheckoutPage.jsx";
import OrderConfirmationPage from "./components/OrderConfirmationPage/OrderConfirmationPage.jsx";
import PreorderHistoryPage from "./components/PreorderHistoryPage/PreorderHistoryPage.jsx";
import PreorderDetailsPage from "./components/PreorderDetailsPage/PreorderDetailsPage.jsx";
import AccountPage from "./components/AccountPage/AccountPage.jsx";
import ForgotPasswordPage from "./components/ForgotPasswordPage/ForgotPasswordPage.jsx";
import ProfilePage from "./components/ProfilePage/ProfilePage.jsx";
import ProtectedRoute from "./components/Dashboard/route/ProtectedRoute.jsx";
import DashboardLayout from "./components/Dashboard/DashboardLayout.jsx";
import AdminDashboard from "./components/Dashboard/Admin/AdminDashboard.jsx";
import StaffDashboard from "./components/Dashboard/Staff/StaffDashboard.jsx";
import UserManagement from "./components/Dashboard/UserMangement/UserManagement.jsx";
import useAuth from "./hooks/useAuth.js";
import { NotFoundPage } from "./components/ErrorPage/ErrorPage.jsx";
import BlindboxEdit from "./components/Dashboard/BlindboxEdit/BlindboxEdit.jsx";
import BlindboxCreate from "./components/Dashboard/BlindboxCreate/BlindboxCreate.jsx";
import BlindboxList from "./components/Dashboard/BlindboxList/BlindboxList.jsx";
import CampaignList from "./components/Dashboard/CampaignManagement/CampaignList.jsx";
import CampaignDetails from "./components/Dashboard/CampaignManagement/CampaignDetails.jsx";
import CampaignCreate from "./components/Dashboard/CampaignManagement/CampaignCreate.jsx";

// Create a separate component for the routes
const AppRoutes = () => {
  const { isAuthenticated, user } = useAuth();

  // Helper function to determine dashboard redirect based on user role
  const getDashboardRedirect = () => {
    if (!isAuthenticated || !user) return null;

    if (user.includes("ADMIN")) {
      return <Navigate to="/dashboard" replace />;
    } else if (user.includes("STAFF")) {
      return <Navigate to="/dashboard" replace />;
    }

    return null;
  };

  return (
    <Routes>
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "STAFF"]} redirectPath="/" />
        }
      >
        <Route element={<DashboardLayout />}>
          <Route
            index
            element={
              user && user.includes("ADMIN") ? (
                <AdminDashboard />
              ) : (
                <StaffDashboard />
              )
            }
          />

          {/* User Management Routes - accessible to both ADMIN and STAFF */}
          <Route
            path="user-management"
            element={
              <ProtectedRoute
                allowedRoles={["ADMIN", "STAFF"]}
                redirectPath="/dashboard"
              />
            }
          >
            <Route index element={<UserManagement />} />
          </Route>

          {/* Blindbox Management Routes - accessible to both ADMIN and STAFF */}
          <Route path="blindboxes">
            <Route path="list" element={<BlindboxList />} />
            <Route path="create" element={<BlindboxCreate />} />
            <Route path="edit/:id" element={<BlindboxEdit />} />
          </Route>

          {/* Campaign Management Routes - accessible to both ADMIN and STAFF */}
          <Route path="campaigns">
            <Route path="series/:seriesId" element={<CampaignList />} />
            <Route path="create" element={<CampaignCreate />} />
            <Route path=":campaignId" element={<CampaignDetails />} />
          </Route>

          <Route path="orders" element={<div>Orders Management</div>} />
          <Route path="preorders" element={<div>Preorders Management</div>} />

          {/* Reports - accessible to both ADMIN and STAFF */}
          <Route path="reports" element={<div>Reports</div>} />

          <Route path="settings" element={<div>Settings</div>} />
        </Route>
      </Route>

      {/* Public and customer routes */}
      <Route
        path="/"
        element={
          <>
            <Navbar />
            <div className="min-h-screen bg-white">
              {/* Check if staff/admin should be redirected to dashboard */}
              {getDashboardRedirect() || <HomePage />}
            </div>
            <Footer />
          </>
        }
      />

      <Route
        path="*"
        element={
          <>
            <Navbar />
            <div className="min-h-screen bg-white">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/blindbox" element={<BlindboxPage />} />
                <Route path="/blindbox/:id" element={<BlindboxDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route
                  path="/order-confirmation/:preorderId"
                  element={<OrderConfirmationPage />}
                />
                <Route path="/account" element={<AccountPage />} />
                <Route
                  path="/account/preorders"
                  element={<PreorderHistoryPage />}
                />
                <Route
                  path="/account/preorders/:id"
                  element={<PreorderDetailsPage />}
                />
                <Route
                  path="/forgot-password"
                  element={<ForgotPasswordPage />}
                />
                <Route path="/account/profile" element={<ProfilePage />} />
                <Route
                  path="*"
                  element={
                    <NotFoundPage
                      title="Oops! Page Not Found"
                      subTitle="The page you're looking for might have been moved or deleted."
                    />
                  }
                />
              </Routes>
            </div>
            <Footer />
          </>
        }
      />
    </Routes>
  );
};

// Main App component
const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <ToastContainer position="top-right" autoClose={1000} />
          <AppRoutes />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;