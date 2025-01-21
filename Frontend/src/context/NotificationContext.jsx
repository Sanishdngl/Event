// context/NotificationContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { notificationService } from '../services/notificationService';
import websocketManager from '../utils/websocketManager';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalNotifications: 0,
    limit: 10
  });
  const [wsConnected, setWsConnected] = useState(false);

  // WebSocket connection and event handlers
  useEffect(() => {
    let reconnectTimeout;
    
    const handleConnectionChange = (connected) => {
      setWsConnected(connected);
      if (connected) {
        // Clear any existing reconnect timeout
        if (reconnectTimeout) {
          clearTimeout(reconnectTimeout);
          reconnectTimeout = null;
        }
      }
    };

    if (isAuthenticated) {
      const connect = () => {
        websocketManager.connect();
      };

      // Handle WebSocket events
      websocketManager.on('connected', () => handleConnectionChange(true));
      websocketManager.on('disconnected', () => {
        handleConnectionChange(false);
        // Attempt to reconnect after 5 seconds
        reconnectTimeout = setTimeout(connect, 5000);
      });
      websocketManager.on('newNotification', handleNewNotification);
      websocketManager.on('notificationRead', handleNotificationRead);
      websocketManager.on('allNotificationsRead', handleAllNotificationsRead);
      websocketManager.on('notificationDeleted', handleNotificationDeleted);
      websocketManager.on('error', handleWebSocketError);

      // Initial connection
      connect();

      // Cleanup
      return () => {
        if (reconnectTimeout) {
          clearTimeout(reconnectTimeout);
        }
        websocketManager.disconnect();
        websocketManager.off('connected');
        websocketManager.off('disconnected');
        websocketManager.off('newNotification');
        websocketManager.off('notificationRead');
        websocketManager.off('allNotificationsRead');
        websocketManager.off('notificationDeleted');
        websocketManager.off('error');
      };
    }
  }, [isAuthenticated]);

  // Fetch initial notifications and unread count
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      updateUnreadCount();
    }
  }, [isAuthenticated]);

  const handleWebSocketError = (error) => {
    console.error('WebSocket error:', error);
    setError('Connection error. Trying to reconnect...');
  };

  const fetchNotifications = async (page = 1, filter = 'all') => {
    if (!isAuthenticated) {
      setError('Please log in to view notifications');
      return [];
    }
  
    try {
      setIsLoading(true);
      setError(null);
      const response = await notificationService.getNotifications(page, filter);
      
      if (!response?.data?.notifications || !response?.data?.pagination) {
        throw new Error('Invalid response format from server');
      }
  
      const { notifications: newNotifications, pagination: newPagination } = response.data;
      
      setPagination(newPagination);
      
      if (page === 1) {
        setNotifications(newNotifications);
      } else {
        setNotifications(prev => [...prev, ...newNotifications]);
      }
      
      return newNotifications;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch notifications';
      setError(errorMessage);
      console.error('Error fetching notifications:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };


  const updateUnreadCount = async () => {
    if (!isAuthenticated) return;
    try {
      setError(null);
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error updating unread count:', error);
      // Don't set error state here to avoid UI clutter
    }
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen(prev => !prev);
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      websocketManager.send('markAsRead', { notificationId });
      
      // Optimistically update the UI
      setNotifications(prev =>
        prev.map(notification =>
          notification._id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
      updateUnreadCount();
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Revert optimistic update if needed
      await fetchNotifications(pagination.currentPage);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      websocketManager.send('markAllAsRead');
      
      // Optimistically update the UI
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // Revert optimistic update if needed
      await fetchNotifications(pagination.currentPage);
      await updateUnreadCount();
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      websocketManager.send('deleteNotification', { notificationId });
      
      // Optimistically update the UI
      setNotifications(prev =>
        prev.filter(notification => notification._id !== notificationId)
      );
      updateUnreadCount();
    } catch (error) {
      console.error('Error deleting notification:', error);
      // Revert optimistic update if needed
      await fetchNotifications(pagination.currentPage);
    }
  };

  // WebSocket event handlers
  const handleNewNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  const handleNotificationRead = ({ notificationId }) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification._id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
    updateUnreadCount();
  };

  const handleAllNotificationsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  const handleNotificationDeleted = ({ notificationId }) => {
    setNotifications(prev =>
      prev.filter(notification => notification._id !== notificationId)
    );
    updateUnreadCount();
  };

  const value = {
    notifications,
    isNotificationsOpen,
    unreadCount,
    error,
    isLoading,
    isAuthenticated,
    pagination,
    wsConnected,
    toggleNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchNotifications,
    clearError: () => setError(null),
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;