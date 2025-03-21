import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Tabs } from "antd";
import { toast } from "react-toastify";
import { AuthContext } from "../../contexts/AuthContext";
import useForm from "../../hooks/useForm";
import { validateLoginForm } from "../../utils/validators";

export const Login = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("Vietnam");
  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const {
    login,
    isAuthenticated,
    loading,
    error: authError,
  } = useContext(AuthContext);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // Form submission handler
  const handleLogin = async (values) => {
    try {
      await login({
        email: values.email,
        password: values.password,
      });

      // Trigger auth state change event to update navbar
      window.dispatchEvent(new Event("authStateChanged"));

      toast.success("Login successful!");
      navigate("/");
    } catch (err) {
      //const errorMessage = err.message || 'Login failed. Please try again.';
      toast.error("Login failed. Please try again.");
    }
  };

  // Initialize form with useForm hook
  const { values, errors, isSubmitting, handleChange, handleSubmit } = useForm(
    { email: "", password: "" },
    handleLogin,
    validateLoginForm
  );

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  return (
    <div className="flex justify-center items-start pt-24 min-h-screen bg-white px-4">
      <div className="w-full max-w-[400px]">
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          centered
          className="mb-4"
          items={[
            {
              key: "login",
              label: "SIGN IN",
            },
            {
              key: "register",
              label: <Link to="/register">REGISTER</Link>,
            },
          ]}
        />

        <form onSubmit={handleSubmit}>
          {/* Country Selector */}
          <div className="mb-3 relative">
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
              <span className="text-gray-400 cursor-pointer">▼</span>
            </button>

            {isDropdownOpen && (
              <div className="absolute w-full mt-1 bg-white border border-gray-200 rounded shadow-lg z-10">
                <button
                  type="button"
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center"
                  onClick={() => {
                    setSelectedCountry("Vietnam");
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

          {/* Email Input */}
          <div className="mb-3">
            <input
              type="email"
              name="email"
              value={values.email}
              onChange={handleChange}
              placeholder="Enter your e-mail address"
              className={`w-full h-12 px-4 border ${
                errors.email ? "border-red-500" : "border-gray-200"
              } rounded focus:outline-none focus:border-gray-400`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password Input */}
          <div className="mb-3 relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={values.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className={`w-full h-12 px-4 border ${
                errors.password ? "border-red-500" : "border-gray-200"
              } rounded focus:outline-none focus:border-gray-400`}
            />
            <button
              type="button"
              className="absolute right-3 top-3 text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
          </div>
          {/* Forgot Password link */}
          <div className="text-right mb-3">
            <Link
              to="/forgot-password"
              className="text-sm text-gray-500 hover:text-black"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || loading}
            className="w-full h-12 bg-black text-white font-medium rounded mb-8 cursor-pointer disabled:bg-gray-400"
            style={{ color: "var(--color-white)", marginTop: "5px" }}
          >
            {isSubmitting || loading ? "LOGGING IN..." : "CONTINUE"}
          </button>
        </form>

        {/* Display auth errors */}
        {authError && (
          <div className="bg-red-100 text-red-700 p-3 mb-4 rounded">
            {authError}
          </div>
        )}

        {/* Divider */}
        <div className="flex items-center justify-center mb-6">
          <div className="h-px bg-gray-200 flex-grow"></div>
          <div className="px-4 text-gray-500 text-sm">Join With</div>
          <div className="h-px bg-gray-200 flex-grow"></div>
        </div>

        {/* Social Login */}
        <div className="flex justify-center gap-4 mb-6">
          {/* Google Button */}
          <button
            type="button"
            className="w-12 h-12 flex items-center justify-center rounded-full border border-gray-200 hover:border-gray-400 transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          </button>

          {/* Apple Button */}
          <button
            type="button"
            className="w-12 h-12 flex items-center justify-center rounded-full border border-gray-200 hover:border-gray-400 transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14.94 5.19A4.38 4.38 0 0 0 16 2.5a4.38 4.38 0 0 0-2.91 1.52 4.1 4.1 0 0 0-1.02 2.61 3.62 3.62 0 0 0 2.87-1.44zm2.52 7.44a4.51 4.51 0 0 1 2.16-3.81 4.66 4.66 0 0 0-3.66-2c-1.56-.16-3.05.92-3.83.92-.79 0-2-.9-3.3-.87a4.92 4.92 0 0 0-4.14 2.53c-1.77 3.07-.46 7.58 1.26 10.07.84 1.2 1.84 2.56 3.15 2.51 1.26-.05 1.74-.82 3.27-.82 1.52 0 1.95.82 3.28.79 1.36-.02 2.22-1.24 3.06-2.45a10.95 10.95 0 0 0 1.38-2.85 4.4 4.4 0 0 1-2.63-4.02z" />
            </svg>
          </button>
        </div>

        {/* Terms Text */}
        <p className="text-center text-sm text-gray-500">
          By continuing, you agree to our{" "}
          <a href="#" className="underline hover:text-black">
            Platform&apos;s Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="underline hover:text-black">
            Privacy Policy
          </a>
        </p>

        {/* Don't have an account */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="text-black font-medium hover:underline"
            >
              Register Now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
