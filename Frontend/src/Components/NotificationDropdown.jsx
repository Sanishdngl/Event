import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { formatDistance } from 'date-fns';
import { Bell, Filter, Check, Loader, Trash2 } from 'lucide-react';

const NotificationDropdown = ({ isDarkMode }) => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const observerTarget = useRef(null);
  const userRole = localStorage.getItem('role');

  const {
    notifications,
    isNotificationsOpen,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchNotifications,
    isLoading,
    pagination
  } = useNotifications();

  // Infinite scroll setup
  useEffect(() => {
    if (!pagination) return; // Guard clause for when pagination is undefined

    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting && 
            !isLoading && 
            pagination?.totalPages && // Add null check
            currentPage < pagination.totalPages) {
          const nextPage = currentPage + 1;
          await fetchNotifications(nextPage, filter);
          setCurrentPage(nextPage);
        }
      },
      { threshold: 0.5 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [currentPage, pagination?.totalPages, filter, isLoading]);

  const handleNotificationClick = async (notification) => {
    try {
      await markAsRead(notification._id);

      switch (notification.type) {
        case 'event_request':
          if (userRole === 'Admin') {
            navigate('/admindb/events', {
              state: { highlightEventId: notification.eventId }
            });
          }
          break;

        case 'event_response':
          if (userRole === 'Organizer') {
            navigate('/orgdb/events', {
              state: { highlightEventId: notification.eventId }
            });
          }
          break;

        case 'event_update':
          navigate(`/event/${notification.eventId}`);
          break;

        case 'profile_update':
          navigate('/profile');
          break;

        case 'system_notification':
          switch (notification.subType) {
            case 'maintenance':
              navigate('/system-status');
              break;
            case 'announcement':
              break;
            default:
              console.info('System notification received:', notification);
          }
          break;

        case 'general_update':
          if (notification.link) {
            navigate(notification.link);
          }
          break;

        default:
          console.warn('Unknown notification type:', notification.type);
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  const handleFilterChange = async (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
    await fetchNotifications(1, newFilter);
  };

  const handleDeleteNotification = async (e, notificationId) => {
    e.stopPropagation();
    try {
      await deleteNotification(notificationId);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
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
      <div className={themeClasses.header}>
        <h3 className={`font-semibold ${themeClasses.text}`}>Notifications</h3>
        <button
          onClick={markAllAsRead}
          className={`${themeClasses.filterButton} flex items-center gap-1`}
        >
          <Check className="w-4 h-4" />
          <span>Mark all read</span>
        </button>
      </div>

      <div className="p-2 border-b border-gray-200 flex gap-2 overflow-x-auto">
        {['all', 'event', 'system', 'profile', 'unread'].map((filterType) => (
          <button
            key={filterType}
            onClick={() => handleFilterChange(filterType)}
            className={`${themeClasses.filterButton} ${
              filter === filterType ? themeClasses.activeFilter : ''
            }`}
          >
            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
          </button>
        ))}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length > 0 ? (
          <>
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`${themeClasses.item} ${
                  !notification.read ? 'bg-blue-50/10' : ''
                } flex justify-between items-start`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex-1">
                  <p className={`text-sm ${themeClasses.text} ${
                    !notification.read ? 'font-semibold' : ''
                  }`}>
                    {notification.message}
                  </p>
                  <p className={`text-xs ${themeClasses.mutedText} mt-1`}>
                    {formatDistance(new Date(notification.createdAt), new Date(), { 
                      addSuffix: true 
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!notification.read && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                  )}
                  <button
                    onClick={(e) => handleDeleteNotification(e, notification._id)}
                    className={`p-1 rounded-full ${themeClasses.mutedText} hover:text-red-500`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            <div ref={observerTarget} className="h-4" />
            {isLoading && (
              <div className="p-4 text-center">
                <Loader className="w-6 h-6 animate-spin mx-auto" />
              </div>
            )}
          </>
        ) : (
          <div className={`p-4 text-center ${themeClasses.mutedText}`}>
            No notifications
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;