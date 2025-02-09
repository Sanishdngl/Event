import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { clearAuth } from '../utils/auth';
import { useSidebar } from '../context/SidebarContext';
import { ErrorBoundary } from '../Components/ErrorBoundary';
import { Spinner } from '../Components/ui/spinner';
import NavBar from './NavBar';
import Sidebar from './Sidebar';
import { adminDashboardConfig, organizerDashboardConfig, userDashboardConfig } from '../config/dashboardConfig';

const Dashboard = () => {
  const { '*': currentPath } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const { isSidebarOpen } = useSidebar();
  const [activeTab, setActiveTab] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const config = {
    admin: adminDashboardConfig,
    organizer: organizerDashboardConfig,
    user: userDashboardConfig
  }[user?.role?.toLowerCase()] || userDashboardConfig;

  const getFirstTabKey = () => {
    return Object.keys(config.tabs)[0];
  };

  const handleLogout = () => {
    try {
      clearAuth();
      navigate('/loginsignup', { replace: true });
    } catch (err) {
      setError('Logout failed. Please try again.');
    }
  };

  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        setLoading(true);
        // Get the current path segments
        const pathSegments = currentPath?.split('/') || [];
        const currentTab = pathSegments[0]?.toLowerCase() || '';
        
        // Check if the current path matches any additional routes
        const isAdditionalRoute = config.additionalRoutes && 
          Object.keys(config.additionalRoutes).some(route => {
            const routeSegments = route.split('/');
            return routeSegments.every((segment, index) => {
              // Handle route parameters (segments starting with ':')
              if (segment.startsWith(':')) return true;
              return segment === pathSegments[index];
            });
          });
        
        // Only redirect if it's not an additional route and not a valid tab
        if (!isAdditionalRoute && !config.tabs[currentTab]) {
          navigate(`${config.basePath}/${getFirstTabKey()}`, { replace: true });
          return;
        }
        
        // Set active tab only if it's a main tab
        if (config.tabs[currentTab]) {
          setActiveTab(currentTab);
        }
        
        setError('');
      } catch (err) {
        setError(err.message || 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    initializeDashboard();
  }, [currentPath, navigate, config]);

  const renderContent = () => {
    if (loading) {
      return <Spinner className="flex justify-center p-8" />;
    }

    return (
      <Routes>
        {/* Default route redirects to first tab */}
        <Route 
          index
          element={<Navigate to={getFirstTabKey()} replace />} 
        />

        {/* Regular tab routes */}
        {Object.entries(config.tabs).map(([key, tabConfig]) => (
          <Route 
            key={key}
            path={key}
            element={<tabConfig.component isDarkMode={isDarkMode} user={user} />}
          />
        ))}
        
        {/* Additional routes that don't show in sidebar */}
        {config.additionalRoutes && Object.entries(config.additionalRoutes).map(([path, routeConfig]) => (
          <Route
            key={path}
            path={path}
            element={<routeConfig.component isDarkMode={isDarkMode} user={user} />}
          />
        ))}

        {/* Only redirect to first tab if it's not an additional route */}
        <Route 
          path="*" 
          element={
            Object.keys(config.additionalRoutes || {}).some(route => 
              new RegExp('^' + route.replace(/:[^\s/]+/g, '[^/]+') + '$').test(currentPath)
            ) 
              ? null 
              : <Navigate to={getFirstTabKey()} replace />
          } 
        />
      </Routes>
    );
  };

  return (
    <ErrorBoundary>
      <main className={`flex min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Sidebar
          user={user}
          onLogout={handleLogout}
          config={config}
          activeTab={activeTab}
        />
        
        <section className="flex flex-col flex-1">
          <NavBar />
          <article 
            className={`
              flex-1 
              transition-all 
              duration-300 
              pt-20 
              ${isSidebarOpen ? 'ml-64' : 'ml-16'}
              ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}
              px-6
            `}
          >
            {renderContent()}
          </article>
        </section>
      </main>
    </ErrorBoundary>
  );
};

export default Dashboard;