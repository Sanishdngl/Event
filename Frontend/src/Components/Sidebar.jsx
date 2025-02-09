import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useSidebar } from '../context/SidebarContext';
import { 
  adminDashboardConfig, 
  organizerDashboardConfig, 
  userDashboardConfig 
} from '../config/dashboardConfig';

const Sidebar = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useTheme();
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();
  
  // Determine which configuration to use based on user role
  const config = user?.role?.toLowerCase() === 'admin' 
    ? adminDashboardConfig 
    : user?.role?.toLowerCase() === 'organizer'
    ? organizerDashboardConfig
    : userDashboardConfig;
  
  // Extract the current tab from the URL path
  const currentPath = location.pathname;
  const currentTab = currentPath.split('/').pop();
  
  // Get tabs from configuration
  const tabs = Object.entries(config.tabs).map(([key, value]) => ({
    label: value.title,
    path: key,
    icon: value.icon,
    description: value.description
  }));

  const handleTabClick = (tabPath) => {
    navigate(`${config.basePath}/${tabPath}`);
  };

  return (
    <div className={`
      fixed top-0 left-0 h-screen transition-all duration-300 z-50
      ${isSidebarOpen ? "w-64" : "w-16"}
      ${isDarkMode 
        ? 'bg-gray-900 border-r border-gray-800 text-gray-100' 
        : 'bg-white border-r border-gray-200 text-gray-800'}
    `}>
      <div className={`
        flex items-center justify-between p-4
        ${isDarkMode ? 'border-b border-gray-800' : 'border-b border-gray-200'}
      `}>
        <h1 className={`
          text-2xl font-semibold transition-all
          ${isSidebarOpen ? "block" : "hidden"}
          ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}
        `}>
          Event<span className="text-blue-400">A</span>
        </h1>
        <Menu 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
          className={`cursor-pointer ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}
        />
      </div>

      {/* User profile section */}
      <div className="p-4">
        <div className="flex items-center p-3 bg-gray-700/30 rounded-xl">
          <div className="flex items-center justify-center w-10 h-10 font-bold text-white rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500">
            {user?.fullname?.split(' ').map(name => name[0]).join('') || user?.role?.[0]?.toUpperCase()}
          </div>
          <div className={`ml-3 ${isSidebarOpen ? "block" : "hidden"}`}>
            <p className="font-medium">{user?.fullname || user?.role}</p>
            <p className="text-sm opacity-60">{user?.email || `${user?.role?.toLowerCase()}@eventa.com`}</p>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <ul className="space-y-1 mt-8">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.path;
          const Icon = tab.icon;
          
          return (
            <li
              key={tab.path}
              className={`
                flex items-center space-x-3 px-4 py-3 mx-2 cursor-pointer rounded-lg
                transition-all duration-200
                ${isActive
                  ? "bg-blue-500 text-white" 
                  : isDarkMode 
                    ? "text-gray-300 hover:bg-gray-800" 
                    : "text-gray-700 hover:bg-gray-100"}
              `}
              onClick={() => handleTabClick(tab.path)}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
              {isSidebarOpen && (
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{tab.label}</span>
                  {isActive && (
                    <span className="text-xs opacity-75">{tab.description}</span>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Sidebar;