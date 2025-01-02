import  { useState, useEffect } from 'react';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import api from "../utils/api";

const LoginSignup = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    role: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (token && role) {
      redirectBasedOnRole(role);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (activeTab === 'signup' && !formData.fullname) {
      newErrors.fullname = 'Full name is required';
    }
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (activeTab === 'signup' && !formData.role) {
      newErrors.role = 'Role is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const redirectBasedOnRole = (role) => {
    switch (role) {
      case 'Admin':
        window.location.href = '/admindb';
        break;
      case 'Organizer':
        window.location.href = '/orgdb';
        break;
      case 'User':
        window.location.href = '/userdb';
        break;
      default:
        setError('Invalid user role');
    }
  };

  const handleLogin = async () => {
    try {
      const loginData = {
        email: formData.email,
        password: formData.password
      };

      const response = await api.post("/users/login", loginData);
      console.log("Login Response:", response.data);

      const { message, token, user } = response.data;

      if (token && user) {
        localStorage.setItem('token', token);
        localStorage.setItem('role', user.role);
        redirectBasedOnRole(user.role);
      } else {
        setError(message || 'Login failed: Invalid response data');
      }
    } catch (error) {
      console.error("Login Error:", error);
      if (error.response?.data?.message) {
        setError(`Error: ${error.response.data.message}`);
      } else if (error.message) {
        setError(`Error: ${error.message}`);
      } else {
        setError("An unknown error occurred. Please try again.");
      }
    }
  };

  const handleSignup = async () => {
    try {
      const response = await api.post("/users/signup", formData);
      console.log("Signup Response:", response.data);

      const { message, user } = response.data;

      if (user) {
        setError('');
        alert(message || 'Signup successful! Please login.');
        setActiveTab('login');
        setFormData(prev => ({
          ...prev,
          fullname: '',
          role: ''
        }));
      } else {
        setError('Signup failed: Invalid response data');
      }
    } catch (error) {
      console.error("Signup Error:", error);
      if (error.response?.data?.message) {
        setError(`Error: ${error.response.data.message}`);
      } else if (error.message) {
        setError(`Error: ${error.message}`);
      } else {
        setError("An unknown error occurred. Please try again.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      if (activeTab === 'login') {
        await handleLogin();
      } else {
        await handleSignup();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-600 to-blue-800 pt-20">
      <div className="max-w-md mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-4 text-center font-semibold transition-colors ${
                activeTab === 'login'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 py-4 text-center font-semibold transition-colors ${
                activeTab === 'signup'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Sign Up
            </button>
          </div>

          <div className="p-8">
            <h2 className="text-2xl font-bold text-center mb-8">
              {activeTab === 'login' ? 'Welcome Back!' : 'Create Account'}
            </h2>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {activeTab === 'signup' && (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="fullname"
                    placeholder="Full Name"
                    value={formData.fullname}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                  {errors.fullname && (
                    <p className="text-red-500 text-xs mt-1">{errors.fullname}</p>
                  )}
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              {activeTab === 'signup' && (
                <div className="relative">
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="">Select Role</option>
                    <option value="User">User</option>
                    <option value="Organizer">Organizer</option>
                  </select>
                  {errors.role && (
                    <p className="text-red-500 text-xs mt-1">{errors.role}</p>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Processing...' : activeTab === 'login' ? 'Login' : 'Sign Up'}
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>

            {activeTab === 'login' && (
              <div className="mt-6 text-center">
                <a href="#" className="text-blue-600 hover:underline">
                  Forgot your password?
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;