import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import eventA from "../assets/images/eventA.png";
import { useTheme } from '../context/ThemeContext';
import { useSidebar } from '../context/SidebarContext';
import NotificationDropdown from './NotificationDropdown';
import { useNotifications } from '../context/NotificationContext';
import ConnectionStatus from '../components/ConnectionStatus';
import websocketManager from '../utils/websocketManager';
import { jwtDecode } from "jwt-decode";
import { 
  Bell, User, LogOut, Settings, 
  Sun, Moon, Plus, Menu, Home, Phone, Info,
  LayoutDashboard, Calendar, HelpCircle
} from 'lucide-react';

const NavBar = () => {
  const [sticky, setSticky] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode, setIsDarkMode } = useTheme(); 
  const { isSidebarOpen } = useSidebar();
  const { toggleNotifications, unreadCount } = useNotifications();  
  const [isConnected, setIsConnected] = useState(true);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const maxReconnectAttempts = 3;

  const isAuthenticated = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  const themeClasses = {
    nav: `fixed top-0 z-40 transition-all duration-300 ${
      sticky 
        ? (isDarkMode ? 'bg-gray-900/95' : 'bg-white/95') 
        : (isDarkMode ? 'bg-gray-900' : 'bg-white')
    } border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} backdrop-blur-lg`,
    text: isDarkMode ? 'text-gray-100' : 'text-gray-800',
    textMuted: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    button: `bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white transition-all duration-300`,
    dropdownMenu: `absolute right-0 mt-2 w-56 rounded-xl ${
      isDarkMode ? 'bg-gray-900' : 'bg-white'
    } shadow-lg border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`
  };

  useEffect(() => {
    if (isAuthenticated) {
      try {
        const decodedToken = jwtDecode(isAuthenticated);
        setUser(decodedToken.user);
      } catch (error) {
        console.error("Invalid token:", error);
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleScroll = () => setSticky(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const notificationHandler = (data) => {
      console.log('Received notification response:', data);
    };
    
    return () => {
      websocketManager.off('notification', notificationHandler);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileOpen && !event.target.closest('.profile-dropdown')) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen]);

  useEffect(() => {
    const handleOnline = () => {
      setIsConnected(true);
      setReconnectAttempts(0);
    };
    
    const handleOffline = () => {
      setIsConnected(false);
      if (reconnectAttempts < maxReconnectAttempts) {
        setReconnectAttempts(prev => prev + 1);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [reconnectAttempts, maxReconnectAttempts]);


  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/loginsignup';
  };

  const getNavigationItems = () => {
    if (!isAuthenticated || (isAuthenticated && userRole === 'User')) {
      const commonItems = [
        { to: "/", icon: Home, text: "Home" }
      ];
  
      if (!isAuthenticated) {
        commonItems.push(
          { to: "/event", icon: Calendar, text: "Events" },
          { to: "/contact", icon: Phone, text: "Contact" },
          { to: "/about", icon: Info, text: "About" }
        );
      } else {
        commonItems.push(
          { to: "/contact", icon: Phone, text: "Contact" }
        );
      }
  
      return commonItems;
    }
    return [];
  };
  

  const isDashboardPage = () => {
    const dashboardPaths = ['/admindb', '/orgdb', '/userdb'];
    return dashboardPaths.some(path => location.pathname.startsWith(path));
  };

  const renderDashboardNavbar = () => {
    return (
      <div 
        className={`${themeClasses.nav} right-0 transition-all duration-300`}
        style={{
          width: isSidebarOpen ? 'calc(100% - 16rem)' : 'calc(100% - 4rem)',
          marginLeft: isSidebarOpen ? '16rem' : '4rem',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center">
              <img src={eventA} alt="logo" className={`h-12 w-auto ${isDarkMode ? 'invert' : ''}`} />
            </Link>

            <div className="flex items-center gap-4">
              <div className="hidden lg:flex items-center">
                <ul className="flex items-center gap-6">
                  {getNavigationItems().map((item) => (
                    <li key={item.to}>
                      <Link 
                        to={item.to} 
                        className={`flex items-center gap-2 ${themeClasses.textMuted} hover:text-blue-600`}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.text}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-lg ${
                  isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                }`}
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5 text-gray-300" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-600" />
                )}
              </button>

              {!isAuthenticated ? (
                <Link
                  to="/loginsignup"
                  className={`px-6 py-2 rounded-full ${themeClasses.button}`}
                >
                  Login
                </Link>
              ) : (
                <div className="flex items-center gap-4">
                  {userRole?.toLowerCase() === 'user' && (
                    <button
                      onClick={() => navigate('/userdb')}
                      className={`flex items-center gap-2 px-6 py-2 rounded-full ${themeClasses.button}`}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Dashboard</span>
                    </button>
                  )}

                  <div className="relative notifications-dropdown">
                    <button
                      onClick={toggleNotifications}
                      className={`p-2 hover:bg-gray-100 rounded-full relative ${
                        isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                      }`}
                    >
                      <Bell className={`w-6 h-6 ${themeClasses.text}`} />
                      {unreadCount > 0 && (
                        <span 
                          className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center transform transition-all duration-300 animate-bounce">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                    <NotificationDropdown isDarkMode={isDarkMode} />
                  </div>

                  <div className="relative profile-dropdown">
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className={`p-2 rounded-lg ${
                        isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user?.fullname?.split(' ').map(name => name[0]).join('') || 'U'}
                        </span>
                      </div>
                    </button>

                    {isProfileOpen && (
                      <div className={themeClasses.dropdownMenu}>
                        <div className={`p-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                          <p className={`text-sm font-medium ${themeClasses.text}`}>
                            {user?.fullname || 'User'}
                          </p>
                          <p className={`text-sm ${themeClasses.textMuted}`}>
                            {user?.email || 'user@example.com'}
                          </p>
                        </div>
                        <div className="p-2">
                          <Link 
                            to="/profile" 
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                              isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                            } ${themeClasses.text}`}
                          >
                            <User className="h-4 w-4" />
                            <span>Profile</span>
                          </Link>
                          <Link 
                            to="/settings" 
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                              isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                            } ${themeClasses.text}`}
                          >
                            <Settings className="h-4 w-4" />
                            <span>Settings</span>
                          </Link>
                          <button 
                            onClick={handleLogout}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-500 ${
                              isDarkMode ? 'hover:bg-red-900/20' : 'hover:bg-red-50'
                            }`}
                          >
                            <LogOut className="h-4 w-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="lg:hidden">
                <div className="dropdown dropdown-end">
                  <button tabIndex={0} className={`btn btn-ghost ${themeClasses.textMuted}`}>
                    <Menu className="h-5 w-5" />
                  </button>
                  <ul tabIndex={0} className={`menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow rounded-box w-52 ${
                    isDarkMode ? 'bg-gray-900' : 'bg-white'
                  }`}>
                    {getNavigationItems().map((item) => (
                      <li key={item.to}>
                        <Link to={item.to} className={themeClasses.textMuted}>
                          <item.icon className="h-4 w-4" />
                          {item.text}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <ConnectionStatus 
          isConnected={isConnected}
          reconnectAttempts={reconnectAttempts}
          maxReconnectAttempts={maxReconnectAttempts}
        />
      </div>
    );
  };

  const renderRegularNavbar = () => {
    return (
      <div className={`${themeClasses.nav} w-full`}>
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center">
              <img src={eventA} alt="logo" className={`h-12 w-auto ${isDarkMode ? 'invert' : ''}`} />
            </Link>

            <div className="flex items-center gap-4">
              <div className="hidden lg:flex items-center">
                <ul className="flex items-center gap-6">
                  {getNavigationItems().map((item) => (
                    <li key={item.to}>
                      <Link 
                        to={item.to} 
                        className={`flex items-center gap-2 ${themeClasses.textMuted} hover:text-blue-600`}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.text}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-2 rounded-lg ${
                  isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                }`}
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5 text-gray-300" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-600" />
                )}
              </button>

              {!isAuthenticated ? (
                <Link
                  to="/loginsignup"
                  className={`px-6 py-2 rounded-full ${themeClasses.button}`}
                >
                  Login
                </Link>
              ) : (
                <div className="flex items-center gap-4">
                  {userRole?.toLowerCase() === 'user' && (
                    <button
                      onClick={() => navigate('/userdb')}
                      className={`flex items-center gap-2 px-6 py-2 rounded-full ${themeClasses.button}`}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Dashboard</span>
                    </button>
                  )}

                  <div className="relative notifications-dropdown">
                    <button
                      onClick={toggleNotifications}
                      className={`p-2 hover:bg-gray-100 rounded-full relative ${
                        isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                      }`}
                    >
                      <Bell className={`w-6 h-6 ${themeClasses.text}`} />
                      {unreadCount > 0 && (
                        <span 
                          className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center transform transition-all duration-300 animate-bounce">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                    <NotificationDropdown isDarkMode={isDarkMode} />
                  </div>

                  <div className="relative profile-dropdown">
                    <button
                      onClick={() => setIsProfileOpen(!isProfileOpen)}
                      className={`p-2 rounded-lg ${
                        isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user?.fullname?.split(' ').map(name => name[0]).join('') || 'U'}
                        </span>
                      </div>
                    </button>

                    {isProfileOpen && (
                      <div className={themeClasses.dropdownMenu}>
                        <div className={`p-3 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                          <p className={`text-sm font-medium ${themeClasses.text}`}>
                            {user?.fullname || 'User'}
                          </p>
                          <p className={`text-sm ${themeClasses.textMuted}`}>
                            {user?.email || 'user@example.com'}
                          </p>
                        </div>
                        <div className="p-2">
                          <Link 
                            to="/profile" 
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                              isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                            } ${themeClasses.text}`}
                          >
                            <User className="h-4 w-4" />
                            <span>Profile</span>
                          </Link>
                          <Link 
                            to="/settings" 
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                              isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                            } ${themeClasses.text}`}
                          >
                            <Settings className="h-4 w-4" />
                            <span>Settings</span>
                          </Link>
                          <button 
                            onClick={handleLogout}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-500 ${
                              isDarkMode ? 'hover:bg-red-900/20' : 'hover:bg-red-50'
                            }`}
                          >
                            <LogOut className="h-4 w-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="lg:hidden">
                <div className="dropdown dropdown-end">
                  <button tabIndex={0} className={`btn btn-ghost ${themeClasses.textMuted}`}>
                    <Menu className="h-5 w-5" />
                  </button>
                  <ul tabIndex={0} className={`menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow rounded-box w-52 ${
                    isDarkMode ? 'bg-gray-900' : 'bg-white'
                  }`}>
                    {getNavigationItems().map((item) => (
                      <li key={item.to}>
                        <Link to={item.to} className={themeClasses.textMuted}>
                          <item.icon className="h-4 w-4" />
                          {item.text}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        <ConnectionStatus 
          isConnected={isConnected}
          reconnectAttempts={reconnectAttempts}
          maxReconnectAttempts={maxReconnectAttempts}
        />
      </div>
    );
  };

  return isDashboardPage() ? renderDashboardNavbar() : renderRegularNavbar();
};

export default NavBar;