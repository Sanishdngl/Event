import { WebSocketServer } from 'ws';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import Notification from './model/notification.schema.js';
import User from './model/user.schema.js';
import mongoose from 'mongoose';

class WebSocketManager {
  constructor() {
    this.wss = null;
    this.clients = new Map();
    this.pingIntervals = new Map();
  }

  initialize(server) {
    this.wss = new WebSocketServer({ server });

    this.wss.on('connection', async (ws, req) => {
      const connectionId = uuidv4();
      console.log(`New connection attempt: ${connectionId}`);

      try {
        const client = await this.authenticateConnection(ws, req, connectionId);
        if (!client) return; // Authentication failed

        this.setupClientConnection(ws, client, connectionId);
      } catch (error) {
        console.error(`Connection error for ${connectionId}:`, error);
        ws.close(4002, 'Connection error');
      }
    });

    return this.wss;
  }

  async authenticateConnection(ws, req, connectionId) {
    const url = new URL(req.url, `ws://${req.headers.host}`);
    const token = url.searchParams.get('token');
  
    if (!token) {
      console.error(`No token provided for connection ${connectionId}`);
      ws.close(4001, 'Authentication required');
      return null;
    }
  
    try {
      console.log(`Verifying token for connection ${connectionId}`);
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Support both token formats
      const userId = decoded.user?.id || decoded.userId || decoded.sub;
      
      if (!userId) {
        console.error(`No user ID in token for connection ${connectionId}`);
        ws.close(4004, 'User ID missing from token');
        return null;
      }

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        console.error(`Invalid ObjectId format for connection ${connectionId}: ${userId}`);
        ws.close(4004, 'Invalid user ID format');
        return null;
      }

      const userObjectId = new mongoose.Types.ObjectId(userId);

      console.log(`Finding user for ID: ${userObjectId}`);
      const user = await User.findById(userObjectId)
        .populate({
          path: 'role',
          select: '_id role_Name'
        })
        .select('_id role')
        .lean();
      
      if (!user) {
        console.error(`User not found for ID: ${userObjectId} (connection ${connectionId})`);
        ws.close(4005, 'User not found');
        return null;
      }

      if (!user.role) {
        console.error(`Role not found for user: ${userObjectId} (connection ${connectionId})`);
        ws.close(4005, 'User role not found');
        return null;
      }

      console.log(`Authentication successful for user ${userObjectId} (connection ${connectionId})`);
      
      return {
        userId: user._id.toString(),
        roleId: user.role._id.toString(),
        roleName: user.role.role_Name
      };

    } catch (error) {
      console.error(`Authentication error for connection ${connectionId}:`, error);
      
      if (error.name === 'TokenExpiredError') {
        ws.close(4003, 'Token expired');
      } else if (error.name === 'JsonWebTokenError') {
        ws.close(4004, 'Invalid token');
      } else {
        ws.close(4002, 'Authentication failed');
      }
      
      return null;
    }
  }


  setupClientConnection(ws, client, connectionId) {
    this.clients.set(ws, { ...client, ws });
    console.log(`WebSocket connected - ConnectionID: ${connectionId}, UserID: ${client.userId}, Role: ${client.roleName}`);

    // Setup ping with timeout check
    const pingInterval = setInterval(() => {
      if (ws.readyState !== ws.OPEN) {
        this.cleanupClient(ws, connectionId);
        return;
      }

      let pongReceived = false;
      ws.ping(() => { pongReceived = true; });

      // Set timeout to check if pong was received
      setTimeout(() => {
        if (!pongReceived && ws.readyState === ws.OPEN) {
          console.log(`No pong received for ${connectionId}, closing connection`);
          this.cleanupClient(ws, connectionId);
        }
      }, 5000); // 5 second timeout for pong
    }, 30000);

    this.pingIntervals.set(ws, pingInterval);

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);
        await this.handleMessage(ws, data);
      } catch (error) {
        this.sendToClient(ws, {
          type: 'error',
          message: 'Invalid message format'
        });
      }
    });

    ws.on('close', () => this.cleanupClient(ws, connectionId));
    ws.on('error', () => this.cleanupClient(ws, connectionId));
    ws.on('pong', () => {
      console.log(`Client responded to ping - ConnectionID: ${connectionId}`);
    });
  }

  cleanupClient(ws, connectionId) {
    const interval = this.pingIntervals.get(ws);
    if (interval) {
      clearInterval(interval);
      this.pingIntervals.delete(ws);
    }
    this.clients.delete(ws);
    console.log(`Connection closed: ${connectionId}`);
  }

  async handleMessage(ws, message) {
    const client = this.clients.get(ws);
    if (!client) {
      this.sendToClient(ws, {
        type: 'error',
        message: 'Client not authenticated'
      });
      return;
    }

    try {
      switch (message.type) {
        case 'read_notification':
          await this.handleReadNotification(client, message.payload.notificationId);
          break;
        case 'read_all_notifications':
          await this.handleReadAllNotifications(client);
          break;
        case 'subscribe_admin_notifications':
          if (client.roleName === 'Admin') {
            await this.handleAdminNotificationSubscription(client);
          }
          break;
        case 'subscribe_unread_count':
          await this.handleUnreadCountSubscription(client);
          break;
        case 'ping':
          this.sendToClient(ws, { type: 'pong' });
          break;
        default:
          console.log('Unknown message type:', message.type);
          this.sendToClient(ws, {
            type: 'error',
            message: 'Unknown message type'
          });
      }
    } catch (error) {
      console.error('Error handling message:', error);
      this.sendToClient(ws, {
        type: 'error',
        message: 'Internal server error'
      });
    }
  }

  async handleReadNotification(client, notificationId) {
    try {
      const notification = await Notification.findOneAndUpdate(
        {
          _id: notificationId,
          $or: [
            { userId: client.userId },
            { forRole: client.roleId }
          ]
        },
        { read: true, status: 'read' },
        { new: true }
      );

      if (notification) {
        this.broadcastToUser(client.userId, {
          type: 'notification_read',
          notificationId
        });
      }
    } catch (error) {
      console.error('Error handling read notification:', error);
      throw error;
    }
  }

  async handleReadAllNotifications(client) {
    try {
      await Notification.updateMany(
        {
          $or: [
            { userId: client.userId },
            { forRole: client.roleId }
          ],
          read: false
        },
        { read: true, status: 'read' }
      );

      this.broadcastToUser(client.userId, {
        type: 'all_notifications_read'
      });
    } catch (error) {
      console.error('Error handling read all notifications:', error);
      throw error;
    }
  }

  async handleAdminNotificationSubscription(client) {
    try {
      const notifications = await Notification.find({
        forRole: client.roleId,
        type: 'event_request'
      })
        .sort({ createdAt: -1 })
        .lean();

      this.broadcastToUser(client.userId, {
        type: 'admin_notifications_update',
        notifications
      });
    } catch (error) {
      console.error('Error handling admin notification subscription:', error);
      throw error;
    }
  }

  async handleUnreadCountSubscription(client) {
    try {
      const count = await Notification.countDocuments({
        $or: [
          { userId: client.userId },
          { forRole: client.roleId }
        ],
        read: false
      });

      this.broadcastToUser(client.userId, {
        type: 'unread_count_update',
        count
      });
    } catch (error) {
      console.error('Error handling unread count subscription:', error);
      throw error;
    }
  }

  sendToClient(ws, data) {
    if (ws.readyState === ws.OPEN) {
      try {
        ws.send(JSON.stringify(data));
      } catch (error) {
        console.error('Failed to send message to client:', error);
      }
    }
  }

  // Make sure broadcastToUser uses consistent ID comparison
  broadcastToUser(userId, data) {
    const disconnectedClients = [];
    this.clients.forEach((client, ws) => {
      // Ensure both IDs are strings for comparison
      if (client.userId === userId.toString()) {
        if (ws.readyState === ws.OPEN) {
          this.sendToClient(ws, data);
        } else {
          disconnectedClients.push(ws);
        }
      }
    });
    disconnectedClients.forEach(ws => this.cleanupClient(ws));
  }

  // Make sure broadcastToRole uses consistent ID comparison
  broadcastToRole(roleIdentifier, data) {
    const disconnectedClients = [];
    this.clients.forEach((client, ws) => {
      const matchesRole = typeof roleIdentifier === 'string' 
        ? client.roleName === roleIdentifier
        : client.roleId === roleIdentifier.toString();

      if (matchesRole) {
        if (ws.readyState === ws.OPEN) {
          this.sendToClient(ws, data);
        } else {
          disconnectedClients.push(ws);
        }
      }
    });
    disconnectedClients.forEach(ws => this.cleanupClient(ws));
  }

  async shutdown() {
    if (this.wss) {
      console.log('Initiating WebSocket server shutdown...');
      
      // Close all client connections first
      const closePromises = Array.from(this.clients.keys()).map(ws => {
        return new Promise(resolve => {
          ws.close(1001, 'Server shutting down');
          this.cleanupClient(ws);
          resolve();
        });
      });

      await Promise.all(closePromises);

      // Close the WebSocket server
      await new Promise(resolve => this.wss.close(resolve));
      console.log('WebSocket server shutdown complete');
    }
  }
}

export const wsManager = new WebSocketManager();