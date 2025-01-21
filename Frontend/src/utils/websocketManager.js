import api from './api';

class WebSocketManager {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.listeners = new Map();
    this.readyState = WebSocket.CLOSED;
    this.authenticated = false;
    this.pingTimeout = null;
    this.connectionId = null;
    this.messageQueue = [];
    this.userDetails = null;
  }

  async getUserDetails() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
  
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      // Check for userId in different possible fields
      const userId = decodedToken.userId || decodedToken.sub || decodedToken.user?.id;
      
      if (!userId) {
        throw new Error("Token does not contain user ID");
      }
  
      if (!decodedToken.user?.email) {
        throw new Error("Token does not contain user email");
      }
  
      const response = await api.safeGet(`/users/email/${decodedToken.user.email}`);
      return response.data.user;
    } catch (error) {
      console.error('Error fetching user details:', error);
      return null;
    }
  }

  async connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No authentication token found');
      return;
    }

    try {
      // Get user details if not already cached
      if (!this.userDetails) {
        this.userDetails = await this.getUserDetails();
        if (!this.userDetails) {
          throw new Error("Could not fetch user details");
        }
      }

      const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.hostname}:4001/notifications/ws?token=${token}`;
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected successfully');
        this.readyState = WebSocket.OPEN;
        this.authenticated = true;
        this.reconnectAttempts = 0;
        this.setupPingPong();
        this.processMessageQueue();
        this.notifyListeners('connected', true);
      };

      this.ws.onmessage = this.handleMessage.bind(this);
      this.ws.onclose = this.handleClose.bind(this);
      this.ws.onerror = this.handleError.bind(this);

    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      this.handleReconnection();
    }
  }

  handleMessage(event) {
    try {
      const data = JSON.parse(event.data);
      
      if (data.type === 'pong') {
        this.lastPongReceived = Date.now();
        return;
      }
  
      switch (data.type) {
        case 'notificationRead':
          this.handleNotificationRead(data);
          break;
        case 'allNotificationsRead':
          this.handleAllNotificationsRead();
          break;
        case 'newNotification':
          const newNotificationListeners = this.listeners.get('newNotification') || [];
          newNotificationListeners.forEach(callback => callback(data.payload));
          break;
        case 'notificationDeleted':
          const deleteListeners = this.listeners.get('notificationDeleted') || [];
          deleteListeners.forEach(callback => callback(data.payload));
          break;
        case 'unread_count_update':
          this.handleUnreadCountUpdate(data);
          break;
        case 'error':
          console.error('WebSocket error message:', data.message);
          this.notifyListeners('error', data.message);
          break;
        default:
          const defaultListeners = this.listeners.get(data.type) || [];
          defaultListeners.forEach(callback => callback(data.payload || data));
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
      this.notifyListeners('error', 'Invalid message format');
    }
  }

  handleClose(event) {
    this.readyState = WebSocket.CLOSED;
    this.authenticated = false;
    this.clearPingTimeout();
    
    console.log('WebSocket closed with code:', event.code, 'reason:', event.reason);
    
    switch (event.code) {
      case 4001:
      case 4002:
      case 4003:
      case 4004:
      case 4005:
        this.notifyListeners('error', `Authentication error: ${event.reason}`);
        // Clear user details on authentication error
        this.userDetails = null;
        break;
      default:
        if (this.authenticated) {
          this.handleReconnection();
        }
    }
    
    this.notifyListeners('disconnected', false);
  }

  handleError(error) {
    console.error('WebSocket error:', error);
    this.notifyListeners('error', 'Connection error occurred');
    if (!this.authenticated) {
      this.disconnect();
    }
  }

  setupPingPong() {
    this.clearPingTimeout();
    
    this.lastPongReceived = Date.now();
    this.pingTimeout = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        if (Date.now() - this.lastPongReceived > 40000) {
          this.reconnect();
          return;
        }
        this.send('ping', {});
      }
    }, 30000);
  }

  clearPingTimeout() {
    if (this.pingTimeout) {
      clearInterval(this.pingTimeout);
      this.pingTimeout = null;
    }
  }

  handleReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
      this.userDetails = null; // Clear user details after max attempts
    }
  }

  reconnect() {
    this.disconnect();
    this.connect();
  }

  disconnect() {
    this.clearPingTimeout();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.readyState = WebSocket.CLOSED;
    }
    this.userDetails = null;
  }

  // Notification handlers
  handleNotificationRead(data) {
    const listeners = this.listeners.get('notification_read') || [];
    listeners.forEach(callback => callback(data.notificationId));
  }

  handleAllNotificationsRead() {
    const listeners = this.listeners.get('all_notifications_read') || [];
    listeners.forEach(callback => callback());
  }

  handleAdminNotificationsUpdate(data) {
    const listeners = this.listeners.get('admin_notifications_update') || [];
    listeners.forEach(callback => callback(data.notifications));
  }

  handleUnreadCountUpdate(data) {
    const listeners = this.listeners.get('unread_count_update') || [];
    listeners.forEach(callback => callback(data.count));
  }

  // Event listeners
  on(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType).push(callback);
  }

  off(eventType, callback) {
    if (!this.listeners.has(eventType)) return;
    
    const listeners = this.listeners.get(eventType);
    const index = listeners.indexOf(callback);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  }

  notifyListeners(eventType, data) {
    const listeners = this.listeners.get(eventType) || [];
    listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in ${eventType} listener:`, error);
      }
    });
  }

  // Message sending
  send(type, payload) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify({ type, payload }));
      } catch (error) {
        console.error('Error sending message:', error);
        this.messageQueue.push({ type, payload });
      }
    } else {
      this.messageQueue.push({ type, payload });
      this.connect();
    }
  }

  processMessageQueue() {
    while (this.messageQueue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
      const { type, payload } = this.messageQueue.shift();
      this.send(type, payload);
    }
  }

  // Notification-specific actions
  markNotificationAsRead(notificationId) {
    this.send('read_notification', { notificationId });
  }

  markAllNotificationsAsRead() {
    this.send('read_all_notifications', {});
  }

  subscribeToAdminNotifications() {
    this.send('subscribe_admin_notifications', {});
  }

  subscribeToUnreadCount() {
    this.send('subscribe_unread_count', {});
  }
}



export default new WebSocketManager();