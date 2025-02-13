import api from '../utils/api';

const NOTIFICATIONS_ENDPOINT = '/notifications';

export const notificationService = {
  getNotifications: async (page = 1, filter = 'all', limit = 10) => {
    try {
        const response = await api.safeGet(
            `${NOTIFICATIONS_ENDPOINT}?page=${page}&limit=${limit}&filter=${filter}`
        );
        return {
            data: response.data.data || { notifications: [], pagination: {} }
        };
    } catch (error) {
        console.error('Failed to fetch notifications:', error);
        return { data: { notifications: [], pagination: {} } };
    }
},
  
markAsRead: async (notificationId) => {
  try {
      const response = await api.safePatch(`${NOTIFICATIONS_ENDPOINT}/${notificationId}/read`);
      return response.data;
  } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
  }
},

  markAllAsRead: async () => {
    try {
        const response = await api.safePatch(`${NOTIFICATIONS_ENDPOINT}/read-all`, {}); 
        return response.data;
    } catch (error) {
        console.error('Failed to mark all notifications as read:', error);
        throw error;
    }
  },

  getUnreadCount: async () => {
    try {
        const response = await api.safeGet(`${NOTIFICATIONS_ENDPOINT}/count`);
        return response?.data?.data?.count || 0;
    } catch (error) {
        console.error('Failed to get unread count:', error);
        return 0;
    }
  },

  deleteNotification: async (notificationId) => {
    try {
      const response = await api.safeDelete(`${NOTIFICATIONS_ENDPOINT}/${notificationId}`);
      return response;
    } catch (error) {
      console.error('Failed to delete notification:', error);
      throw error;
    }
  }
};

export default notificationService;