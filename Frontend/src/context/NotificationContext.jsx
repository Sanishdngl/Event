import React, { createContext, useContext, useState, useEffect } from 'react';
import { notificationService } from '../services/notificationService';
import websocketManager from '../utils/websocketManager';
import { useAuth } from './AuthContext';
import notificationSound from '../assets/sounds/notification.mp3';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [filter, setFilter] = useState('all');
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
  const [audioNotification, setAudioNotification] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      const audio = new Audio(notificationSound);
      setAudioNotification(audio);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    let reconnectTimeout;
    
    const handleConnectionChange = (connected) => {
      setWsConnected(connected);
      if (connected && reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };

    if (isAuthenticated) {
      const connect = () => websocketManager.connect();

      
      const handleNotification = (payload) => {
        const notification = payload.notification || payload;
      
        if (!notification._id) {
          notification._id = `temp-${Date.now()}-${Math.random()}`;
        }
      
        if (filter !== 'all' && notification.type !== filter) return;
      
        if (audioNotification) {
          audioNotification.play().catch(() => {});
        }
      
        setNotifications(prev => {
          const exists = prev.some(n => n._id === notification._id);
          return exists ? prev : [notification, ...prev];
        });
      
        setUnreadCount(prev => prev + 1);
      };

      const handleNotificationRead = ({ payload }) => {
        setNotifications(prev => prev.map(n => 
          n._id === payload.notificationId ? { ...n, read: true } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      };

      const handleAllNotificationsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
      };

      const handleNotificationDeleted = ({ payload }) => {
        setNotifications(prev => prev.filter(n => 
          n._id !== payload.notificationId
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      };

      const handleWebSocketError = (error) => {
        console.error('WebSocket error:', error);
        setError('Connection error. Trying to reconnect...');
      };

      websocketManager.on('connected', () => handleConnectionChange(true));
      websocketManager.on('disconnected', () => {
        handleConnectionChange(false);
        reconnectTimeout = setTimeout(connect, 5000);
      });
      websocketManager.on('notification', handleNotification);
      websocketManager.on('notificationRead', handleNotificationRead);
      websocketManager.on('allNotificationsRead', handleAllNotificationsRead);
      websocketManager.on('notification_deleted', handleNotificationDeleted);
      websocketManager.on('error', handleWebSocketError);

      connect();

      return () => {
        clearTimeout(reconnectTimeout);
        websocketManager.disconnect();
        websocketManager.off('connected');
        websocketManager.off('disconnected');
        websocketManager.off('notification', handleNotification);
        websocketManager.off('notificationRead');
        websocketManager.off('allNotificationsRead');
        websocketManager.off('notification_deleted');
        websocketManager.off('error');
      };
    }
  }, [isAuthenticated, filter]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      updateUnreadCount();
    }
  }, [isAuthenticated]);

  const fetchNotifications = async (page = 1, filter = 'all') => {
    try {
      setIsLoading(true);
      const response = await notificationService.getNotifications(page, filter);
      
      if (response?.data?.notifications && response?.data?.pagination) {
        setPagination(response.data.pagination);
        setNotifications(prev => 
          page === 1 ? response.data.notifications : [...prev, ...response.data.notifications]
        );
      }
    } catch (error) {
      setError(error.message || 'Failed to fetch notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const updateUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error updating unread count:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      websocketManager.send('markAsRead', { notificationId });
      setNotifications(prev => prev.map(n => 
        n._id === notificationId ? { ...n, read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking read:', error);
      await fetchNotifications(pagination.currentPage);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      websocketManager.send('markAllAsRead');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all read:', error);
      await fetchNotifications(pagination.currentPage);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      websocketManager.send('deleteNotification', { notificationId });
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error deleting notification:', error);
      await fetchNotifications(pagination.currentPage);
    }
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
    filter,
    toggleNotifications: () => setIsNotificationsOpen(prev => !prev),
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchNotifications,
    clearError: () => setError(null),
    setFilter,
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