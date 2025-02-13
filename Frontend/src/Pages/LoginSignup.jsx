import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Phone  } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import api from "../utils/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogAction } from '../Components/ui/dialog';
import { Alert, AlertTitle, AlertDescription } from '../Components/ui/alert';

const LoginSignup = () => {
  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('login');
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    confirmPassword: '',
    contactNo: '',
    role: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);

  useEffect(() => {
      window.scrollTo(0, 0);
    }, []);

  useEffect(() => {
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
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
    setShowErrorAlert(false);
  };

  const validateForm = () => {
    const newErrors = {};
    if (activeTab === 'signup' && !formData.fullname) {
      newErrors.fullname = 'Full name is required';
    }
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (activeTab === 'signup' && !formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required';
    }
    if (activeTab === 'signup' && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (activeTab === 'signup' && !formData.contactNo) {
      newErrors.contactNo = 'Contact number is required';
    }
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
        setShowErrorAlert(true);
    }
  };

  const handleLogin = async () => {
    try {
        const loginData = {
            email: formData.email,
            password: formData.password
        };

        const response = await api.post("/users/login", loginData);
        
        if (response.data?.token && response.data?.user) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('role', response.data.user.role);
            
            setError('');
            setShowErrorAlert(false);
            redirectBasedOnRole(response.data.user.role);
        } else {
            setError('Invalid response from server');
        }
    } catch (error) {
        console.error("Login Error:", error.response?.data || error.message);
        let errorMessage = 'Invalid email or password';
        
        if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        setError(errorMessage);
        setShowErrorAlert(true);
        setLoading(false);
    }
};

const handleSignup = async () => {
    try {
        const signupData = {
            fullname: formData.fullname,
            email: formData.email,
            password: formData.password,
            contactNo: formData.contactNo,
            role: formData.role
        };

        const response = await api.post("/users/signup", signupData);
        
        if (response.data?.user) {
            setError('');
            alert(response.data.message || 'Signup successful! Please login.');
            setActiveTab('login');
            setFormData({
                fullname: '',
                email: '',
                password: '',
                confirmPassword: '',
                contactNo: '',
                role: ''
            });
        } else {
            setError('Signup failed: Invalid response data');
        }
    } catch (error) {
        console.error("Signup Error:", error.response?.data || error.message);
        let errorMessage = 'An error occurred during signup';
        
        if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        setError(errorMessage);
        setShowErrorAlert(true);
    } finally {
        setLoading(false);
    }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setShowErrorAlert(false);
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
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gradient-to-b from-blue-600 to-blue-800'} pt-20`}>
      <div className="max-w-7xl mx-auto p-6 flex items-center justify-center">
        {/* Image Section */}
        <div className="hidden md:block md:w-1/2 p-2">
          <div className="relative rounded-lg overflow-hidden shadow-xl">
            <img 
              src='/src/assets/images/community.webp'
              alt="Illustration"
              className="w-full h-full object-cover rounded-lg transition-transform transform hover:scale-105 hover:shadow-lg"
            />
          </div>
        </div>

        {/* Form Section */}
        <div className="max-w-md mx-auto p-6">
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl overflow-hidden`}>
          <div className="flex">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-4 text-center font-semibold transition-colors ${
                activeTab === 'login'
                  ? 'bg-purple-600 text-white'
                  : isDarkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 py-4 text-center font-semibold transition-colors ${
                activeTab === 'signup'
                  ? 'bg-purple-600 text-white'
                  : isDarkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Sign Up
            </button>
          </div>

          <div className="p-8">
            <h2 className={`text-2xl font-bold text-center mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {activeTab === 'login' ? 'Welcome Back!' : 'Create Account'}
            </h2>

            {/* Error Alert */}
            {showErrorAlert && (
                <Alert variant="destructive" className="mb-6">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {activeTab === 'signup' && (
                <div className="relative">
                  <User className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                  <input
                    type="text"
                    name="fullname"
                    placeholder="Full Name"
                    value={formData.fullname}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'border-gray-300 focus:ring-2 focus:ring-purple-500'
                    } outline-none`}
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
                  className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <Eye /> : <EyeOff />}
                </button>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              {activeTab === 'signup' && (
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <Eye /> : <EyeOff />}
                  </button>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              )}

{activeTab === 'signup' && (
  <div className="relative">
    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
    <input
      type="tel"
      name="contactNo"
      placeholder="Contact Number"
      value={formData.contactNo}
      onChange={handleInputChange}
      className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
    />
    {errors.contactNo && (
      <p className="text-red-500 text-xs mt-1">{errors.contactNo}</p>
    )}
  </div>
)}

              {activeTab === 'signup' && (
                <div className="relative">
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
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
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Processing...' : activeTab === 'login' ? 'Login' : 'Sign Up'}
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>

          </div>
        </div>
        </div>
      </div>
      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onClose={() => setShowSuccessDialog(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Account Created Successfully!</DialogTitle>
            <DialogDescription>
              Your account has been created successfully. You can now log in with your credentials.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogAction
              onClick={() => {
                setShowSuccessDialog(false);
                setActiveTab('login');
              }}
            >
              Proceed to Login
            </DialogAction>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoginSignup;
