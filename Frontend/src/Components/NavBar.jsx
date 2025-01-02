import  { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import eventA from "../assets/images/eventA.png";
import {jwtDecode} from "jwt-decode";
import { 
   Bell, User, LogOut, Settings, ChevronDown,
  Sun, Moon, Plus, Menu, Home, Calendar, Phone, Info
} from 'lucide-react';

const NavBar = () => {
  const [sticky, setSticky] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [user, setUser] = useState(null); // State to store user info
  const location = useLocation();

  const isAuthenticated = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');
  
  useEffect(() => {
    if (isAuthenticated) {
      try {
        const decodedToken = jwtDecode(isAuthenticated);
        setUser(decodedToken.user); // Save user info in state
      } catch (error) {
        console.error("Invalid token:", error);
      }
    }
  }, [isAuthenticated]);
  const themeClasses = {
    nav: `fixed w-full top-0 z-50 transition-all duration-300 ${
      sticky 
        ? (isDarkMode ? 'bg-gray-900/95' : 'bg-white/95') 
        : (isDarkMode ? 'bg-gray-900' : 'bg-white')
    } border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} backdrop-blur-lg`,
    text: isDarkMode ? 'text-gray-100' : 'text-gray-800',
    textMuted: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    button: `bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white transition-all duration-300`,
    input: isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200',
    card: isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
  };

  useEffect(() => {
    const handleScroll = () => setSticky(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/loginsignup';
  };

  if (location.pathname.startsWith("/admindb") || location.pathname.startsWith("/orgdb")) {
    return null;
  }

  return (
    <div className={themeClasses.nav}>
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src={eventA} alt="logo" className="h-12 w-auto" />
          </Link>

          {/* Right-aligned items container */}
          <div className="flex items-center gap-4">
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center">
              <ul className="flex items-center gap-6">
                <li>
                  <Link to="/" className={`flex items-center gap-2 ${themeClasses.textMuted} hover:text-blue-600`}>
                    <Home className="h-4 w-4" />
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/search-event" className={`flex items-center gap-2 ${themeClasses.textMuted} hover:text-blue-600`}>
                    <Calendar className="h-4 w-4" />
                    Event
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className={`flex items-center gap-2 ${themeClasses.textMuted} hover:text-blue-600`}>
                    <Phone className="h-4 w-4" />
                    Contact
                  </Link>
                </li>
                <li>
                  <Link to="/about" className={`flex items-center gap-2 ${themeClasses.textMuted} hover:text-blue-600`}>
                    <Info className="h-4 w-4" />
                    About
                  </Link>
                </li>
              </ul>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              }`}
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5 text-gray-300" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600" />
              )}
            </button>

            {/* Authentication and User Controls */}
            {!isAuthenticated ? (
              <Link
                to="/loginsignup"
                className={`px-6 py-2 rounded-full text-white ${themeClasses.button}`}
              >
                Login
              </Link>
            ) : (
              <div className="flex items-center gap-4">
                {userRole === 'Organizer' && (
                  <Link
                    to="/create-event"
                    className={`hidden md:flex items-center gap-2 px-6 py-2 rounded-full ${themeClasses.button} shadow-lg hover:shadow-xl`}
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create Event</span>
                  </Link>
                )}

                <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                  <Bell className={`h-5 w-5 ${themeClasses.textMuted}`} />
                  <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
                </button>

                <div className="relative profile-dropdown">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                      <span className="text-white text-sm font-medium">JD</span>
                    </div>
                    <ChevronDown className={`h-4 w-4 ${themeClasses.textMuted}`} />
                  </button>

                  {isProfileOpen && (
                    <div className={`absolute right-0 mt-2 w-56 rounded-xl ${themeClasses.card} shadow-lg border overflow-hidden`}>
                      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                        <p className={`text-sm font-medium ${themeClasses.text}`}>{isAuthenticated ? user.fullname: ""}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{isAuthenticated ? user.email: ""}</p>
                      </div>
                      <div className="p-2">
                        <Link 
                          to="/profile" 
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${themeClasses.text}`}
                        >
                          <User className="h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                        <Link 
                          to="/settings" 
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 ${themeClasses.text}`}
                        >
                          <Settings className="h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
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

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <div className="dropdown dropdown-end">
                <button tabIndex={0} className={`btn btn-ghost ${themeClasses.textMuted}`}>
                  <Menu className="h-5 w-5" />
                </button>
                <ul tabIndex={0} className={`menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow rounded-box w-52 ${themeClasses.card}`}>
                  <li>
                    <Link to="/" className={themeClasses.textMuted}>
                      <Home className="h-4 w-4" />
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link to="/search-event" className={themeClasses.textMuted}>
                      <Calendar className="h-4 w-4" />
                      Event
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" className={themeClasses.textMuted}>
                      <Phone className="h-4 w-4" />
                      Contact
                    </Link>
                  </li>
                  <li>
                    <Link to="/about" className={themeClasses.textMuted}>
                      <Info className="h-4 w-4" />
                      About
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavBar;