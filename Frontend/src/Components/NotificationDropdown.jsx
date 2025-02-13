import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { formatDistance } from 'date-fns';
import { Bell, Filter, Check, Loader, Trash2 } from 'lucide-react';

const NotificationDropdown = ({ isDarkMode }) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const observerTarget = useRef(null);
  const userRole = localStorage.getItem('role');

  const {
    notifications,
    isNotificationsOpen,
    filter,
    setFilter,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchNotifications,
    isLoading,
    error,
    pagination
  } = useNotifications();

  const formatTimestamp = (notification) => {
    try {
      const timestamp = notification.createdAt || notification.timestamp || notification.created_at;
      
      if (!timestamp) {
        return 'Just now';
      }

      const date = new Date(timestamp);
      
      if (isNaN(date.getTime())) {
        console.warn('Invalid timestamp for notification:', notification);
        return 'Recently';
      }

      return formatDistance(date, new Date(), { addSuffix: true });
    } catch (error) {
      console.warn('Error formatting timestamp:', error);
      return 'Recently';
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && 
            !isLoading && 
            pagination?.totalPages && 
            currentPage < pagination.totalPages) {
          fetchNotifications(currentPage + 1, filter)
            .then(() => setCurrentPage(prev => prev + 1));
        }
      },
      { threshold: 0.5 }
    );

    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [currentPage, filter, isLoading, pagination?.totalPages]);

  const handleNotificationClick = async (notification) => {
    try {
      // Prevent API call for temporary notifications
      if (!notification._id.startsWith('temp-')) {
        await markAsRead(notification._id);
      }
  
      // Existing navigation logic
      const path = navigationMap[userRole]?.[notification.type];
      if (path) navigate(path, { state: { highlightId: notification.eventId } });
    } catch (error) {
      console.error('Notification click error:', error);
    }
  };

  const NotificationItem = ({ notification }) => (
    <div
      className={`${themeClasses.item} ${
        !notification.read ? 'bg-blue-50/10' : ''
      } flex justify-between items-start`}
      onClick={() => {
        if (!notification.eventId || !notification.type) return;
        handleNotificationClick(notification);
      }}
    >
      <div className="flex-1">
        <p className={`text-sm ${themeClasses.text} ${
          !notification.read ? 'font-semibold' : ''
        }`}>
          {notification.message}
        </p>
        <p className={`text-xs ${themeClasses.mutedText} mt-1`}>
          {formatTimestamp(notification)}
        </p>
      </div>
      <div className="flex items-center gap-2"> 
        {!notification.read && (
          <span 
            className="w-2 h-2 bg-blue-500 rounded-full" 
          /> 
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteNotification(notification._id);
          }}
          className={`p-1 rounded-full ${themeClasses.mutedText} hover:text-red-500`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const FilterButtons = () => (
    <div className="p-2 border-b border-gray-200 flex gap-2 overflow-x-auto">
      {['all', 'event', 'system', 'profile', 'unread'].map((filterType) => (
        <button
          key={`filter-${filterType}`}
          onClick={() => handleFilterChange(filterType)}
          className={`${themeClasses.filterButton} ${
            filter === filterType ? themeClasses.activeFilter : ''
          }`}
        >
          {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
        </button>
      ))}
    </div>
  );

  const NotificationsList = () => (
    <div className="max-h-96 overflow-y-auto">
      {notifications.length > 0 ? (
        <div key="notifications-container">
          <div key="notifications-list">
          {notifications.map((notification) => (
  <NotificationItem 
    key={notification._id || `temp-${Date.now()}-${Math.random()}`}
    notification={notification} 
  />
))}
          </div>
          <div key="observer-target" ref={observerTarget} className="h-4" />
          {isLoading && (
            <div key="loading-indicator" className="p-4 text-center">
              <Loader className="w-6 h-6 animate-spin mx-auto" />
            </div>
          )}
        </div>
      ) : (
        <div key="no-notifications" className={`p-4 text-center ${themeClasses.mutedText}`}>
          No notifications
        </div>
      )}
    </div>
  );

  const handleFilterChange = (newFilter) => {
    setCurrentPage(1);
    setFilter(newFilter); // Now uses context setFilter
    fetchNotifications(1, newFilter);
  };

  const themeClasses = {
    dropdown: `absolute right-0 mt-2 w-80 rounded-xl ${
      isDarkMode ? 'bg-gray-900' : 'bg-white'
    } shadow-lg border ${
      isDarkMode ? 'border-gray-700' : 'border-gray-200'
    } overflow-hidden`,
    header: `p-4 border-b ${
      isDarkMode ? 'border-gray-700' : 'border-gray-200'
    } flex justify-between items-center`,
    filterButton: `px-3 py-1 rounded-full text-sm ${
      isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
    }`,
    activeFilter: 'bg-blue-100 text-blue-600',
    item: `px-4 py-3 ${
      isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
    } border-b ${
      isDarkMode ? 'border-gray-700' : 'border-gray-200'
    } last:border-0 cursor-pointer`,
    text: isDarkMode ? 'text-gray-100' : 'text-gray-800',
    mutedText: isDarkMode ? 'text-gray-400' : 'text-gray-600',
  };

  if (!isNotificationsOpen) return null;

  return (
    <div className={themeClasses.dropdown}>
      <div key="header" className={themeClasses.header}>
        <h3 className={`font-semibold ${themeClasses.text}`}>Notifications</h3>
        <button
          onClick={markAllAsRead}
          className={`${themeClasses.filterButton} flex items-center gap-1`}
        >
          <Check className="w-4 h-4" />
          <span>Mark all read</span>
        </button>
      </div>

      <FilterButtons key="filter-buttons" />
      <NotificationsList key="notifications-list" />
      {error && (
  <div className="p-2 text-red-500 text-sm text-center border-t border-red-200 bg-red-50">
    Error: {error.message || 'Failed to process notification'}
  </div>
)}
    </div>
  );
};

export default NotificationDropdown;