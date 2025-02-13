import api from './api';

class WebSocketManager {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.listeners = new Map();
    this.authenticated = false;
    this.pingInterval = null;
    this.lastPongReceived = null;
    this.connectionTimeout = null;
    this.messageQueue = [];
    this.MAX_QUEUE_SIZE = 1000;
    this.MAX_MESSAGE_SIZE = 1024 * 1024;
    this.userDetails = null;
    this.isConnecting = false;
    this.connectionPromise = null;
  }

  isConnected() {
    return this.ws?.readyState === WebSocket.OPEN && this.authenticated;
  }

  notifyListeners(eventType, data) {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${eventType} listener:`, error);
        }
      });
    }
  }

  async getUserDetails() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const userId = decodedToken.userId || decodedToken.sub || decodedToken.user?.id;
      
      if (!userId || !decodedToken.user?.email) {
        throw new Error("Invalid token format");
      }

      const response = await api.safeGet(`/users/email/${decodedToken.user.email}`);
      return response.data.user;
    } catch (error) {
      console.error('Error fetching user details:', error);
      return null;
    }
  }

  async connect() {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return this.connectionPromise;
    }

    this.isConnecting = true;
    this.connectionPromise = new Promise(async (resolve, reject) => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        if (!this.userDetails) {
          this.userDetails = await this.getUserDetails();
          if (!this.userDetails) {
            throw new Error("Could not fetch user details");
          }
        }

        const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.hostname}:4001/notifications/ws?token=${token}`;
        
        this.cleanup(); 
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('WebSocket connected successfully');
          this.authenticated = true;
          this.reconnectAttempts = 0;
          this.setupPingPong();
          this.processMessageQueue();
          this.notifyListeners('connected', true);
          this.isConnecting = false;
          resolve();
        };

        this.ws.onmessage = this.handleMessage.bind(this);
        this.ws.onclose = this.handleClose.bind(this);
        this.ws.onerror = this.handleError.bind(this);

        this.connectionTimeout = setTimeout(() => {
          if (this.ws?.readyState === WebSocket.CONNECTING) {
            this.ws.close();
            reject(new Error('Connection timeout'));
          }
        }, 10000);

      } catch (error) {
        console.error('Error creating WebSocket connection:', error);
        this.isConnecting = false;
        this.handleReconnection();
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  handleMessage(event) {
    try {
      const data = JSON.parse(event.data);
      
      if (data.type === 'pong') {
        this.lastPongReceived = Date.now();
        return;
      }
      
      if (data.type === 'ping') {
        this.send('pong', {});
        return;
      }
  
      console.debug('Received WebSocket message:', data);
  
      if (!data.type) {
        console.warn('Received message without type:', data);
        return;
      }
  
      const messageHandlers = {
        'notification': this.handleNotification.bind(this),
        'new_notification': this.handleNotification.bind(this),
        'allNotificationsRead': this.handleAllNotificationsRead.bind(this),
        
        'unreadCountUpdate': this.handleGenericMessage.bind(this),
        'notification_deleted': this.handleNotificationDeleted.bind(this),
        
        'error': this.handleSystemError.bind(this)
      };
  
      const handler = messageHandlers[data.type] || this.handleGenericMessage.bind(this);
      handler(data);
  
    } catch (error) {
      console.error('Error processing WebSocket message:', error);

      try {
        console.debug('Raw message content:', event.data);
      } catch (e) {
        console.debug('Could not log raw message content');
      }
      
      this.notifyListeners('error', 'Failed to process message');
    }
  }

  handleNotification(data) {
    const payload = {
      ...data.payload,
      ...(data.notification && { notification: data.notification }),
      type: 'notification',
      action: data.action || 'received',
      timestamp: data.timestamp || new Date().toISOString()
    };

    if (this.listeners.has('notification')) {
      this.notifyListeners('notification', payload);
    }
  }

  handleEventRequest(data) {
    const payload = {
      ...data.payload,
      type: 'event_request',
      timestamp: data.timestamp || new Date().toISOString()
    };
    this.notifyListeners('event_request', payload);
  }

  handleEventResponse(data) {
    const payload = {
      ...data.payload,
      type: 'event_response',
      timestamp: data.timestamp || new Date().toISOString()
    };
    this.notifyListeners('event_response', payload);
  }

  handleNotificationRead(data) {
    const payload = {
      notificationId: data.payload?.notificationId,
      type: 'notificationRead',
      timestamp: data.timestamp || new Date().toISOString()
    };
    this.notifyListeners('notificationRead', payload);
  }

  handleAllNotificationsRead(data) {
    const payload = {
      type: 'allNotificationsRead',
      timestamp: data.timestamp || new Date().toISOString()
    };
    this.notifyListeners('allNotificationsRead', payload);
  }

  handleNotificationDeleted(data) {
    const notificationId = data.payload?.notificationId;
    if (notificationId) {
      this.notifyListeners('notification_deleted', { notificationId });
    }
  }
  
  handleSystemError(data) {
    console.error('WebSocket error message:', data.message);
    this.notifyListeners('error', data.message || 'Unknown error occurred');
  }
  
  handleGenericMessage(data) {
    const hasListeners = this.listeners.has(data.type);
    
    if (!hasListeners) {
      console.warn(`No listeners registered for message type: ${data.type}`);
      return;
    }
  
    const payload = {
      ...data.payload,
      type: data.type,
      timestamp: data.timestamp || new Date().toISOString()
    };
  
    this.notifyListeners(data.type, payload);
  }

  handleClose(event) {
    this.authenticated = false;
    this.clearPingInterval();
    clearTimeout(this.connectionTimeout);
    
    console.log('WebSocket closed:', event.code, event.reason);

    if (event.code >= 4001 && event.code <= 4005) {
      this.notifyListeners('error', `Authentication error: ${event.reason}`);
      this.userDetails = null;
      this.isConnecting = false;
      return;
    }

    this.notifyListeners('disconnected', false);
    
    if (this.authenticated) {
      this.handleReconnection();
    }
  }

  handleError(error) {
    console.error('WebSocket error:', error);
    this.notifyListeners('error', 'Connection error occurred');
    
    if (!this.authenticated) {
      this.disconnect();
    }
  }

  setupPingPong() {
    this.clearPingInterval();
    this.lastPongReceived = Date.now();
    
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        if (Date.now() - this.lastPongReceived > 40000) {
          this.reconnect();
          return;
        }
        this.send('ping', {});
      }
    }, 30000);
  }

  clearPingInterval() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  async handleReconnection() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.userDetails = null;
      this.isConnecting = false;
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    try {
      await this.connect();
    } catch (error) {
      console.error('Reconnection attempt failed:', error);
    }
  }

  async reconnect() {
    await this.disconnect();
    return this.connect();
  }

  disconnect() {
    return new Promise((resolve) => {
      this.clearPingInterval();
      clearTimeout(this.connectionTimeout);
      
      if (this.ws) {
        this.ws.onclose = () => {
          this.ws = null;
          this.authenticated = false;
          this.isConnecting = false;
          resolve();
        };
        this.ws.close();
      } else {
        resolve();
      }
    });
  }

  cleanup() {
    this.clearPingInterval();
    clearTimeout(this.connectionTimeout);
    if (this.ws) {
      this.ws.onclose = null;
      this.ws.onerror = null;
      this.ws.onmessage = null;
      this.ws.close();
      this.ws = null;
    }
    this.authenticated = false;
    this.isConnecting = false;
  }

  on(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType).add(callback);
  }

  off(eventType, callback) {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  send(type, payload) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        const message = JSON.stringify({
          type,
          payload: {
            ...payload,
            timestamp: new Date().toISOString()
          }
        });

        if (message.length <= this.MAX_MESSAGE_SIZE) {
          this.ws.send(message);
        } else {
          throw new Error('Message exceeds size limit');
        }
      } catch (error) {
        console.error('Error sending message:', error);
        this.addToMessageQueue(type, payload);
      }
    } else {
      this.addToMessageQueue(type, payload);
      if (!this.isConnecting) {
        this.connect();
      }
    }
  }

  addToMessageQueue(type, payload) {
    if (this.messageQueue.length >= this.MAX_QUEUE_SIZE) {
      this.messageQueue = this.messageQueue
        .filter(msg => ['ping', 'markAsRead', 'notification'].some(key => msg.type.includes(key)))
        .slice(-this.MAX_QUEUE_SIZE/2);
    }
    this.messageQueue.push({ type, payload });
  }

  processMessageQueue() {
    const BATCH_SIZE = 10;
    const INTERVAL = 100;

    const processNextBatch = () => {
      if (this.messageQueue.length === 0 || this.ws?.readyState !== WebSocket.OPEN) {
        return;
      }

      const batch = this.messageQueue.splice(0, BATCH_SIZE);
      
      batch.forEach(({ type, payload }) => {
        this.send(type, payload);
      });

      if (this.messageQueue.length > 0) {
        setTimeout(processNextBatch, INTERVAL);
      }
    };

    processNextBatch();
  }
}

export default new WebSocketManager();