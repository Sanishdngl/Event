// controllers/notification.controller.js
import Notification from '../model/notification.schema.js';
import Event from '../model/event.schema.js';
import User from '../model/user.schema.js';
import { wsManager } from '../webSocket.js';
import Role from "../model/role.schema.js"; 
import { v4 as uuidv4 } from 'uuid';

const createResponse = (success, message, data = null, error = null) => ({
  success,
  message,
  data,
  error
});

export const getUserNotifications = async (req, res) => {
  try {
    const { _id: userId, role: roleId } = req.user;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const filter = req.query.filter || 'all';
    
    const skip = (page - 1) * limit;
    
    let query = {
      $or: [
        { userId },
        { forRole: roleId } // Using roleId directly since we're using ObjectId
      ]
    };
    
    // Apply filters using switch with proper type checking
    switch(filter.toLowerCase()) {
      case 'unread':
        query.status = 'unread';
        break;
      case 'event':
        query.type = { $in: ['event_request', 'event_response', 'event_update'] };
        break;
      case 'system':
        query.type = 'system_notification';
        break;
      case 'profile':
        query.type = 'profile_update';
        break;
    }
    
    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('eventId', 'event_name event_date')
        .lean(),
      Notification.countDocuments(query)
    ]);
    
    const responseData = {
      notifications,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalNotifications: total,
        limit
      }
    };

    res.status(200).json(createResponse(true, 'Notifications retrieved successfully', responseData));
  } catch (error) {
    console.error('Error in getUserNotifications:', error);
    res.status(500).json(createResponse(false, 'Error fetching notifications', null, error.message));
  }
};

export const requestEventNotification = async (req, res) => {
  try {
    console.log('Received notification request:', req.body);
    const { eventId, message } = req.body;
    const userId = req.user._id;

    if (!eventId) {
      console.log('Missing eventId in request');
      return res.status(400).json(createResponse(false, 'EventId is required'));
    }

    const event = await Event.findById(eventId)
      .populate('org_ID', 'fullname')
      .lean();

    if (!event) {
      console.log('Event not found:', eventId);
      return res.status(404).json(createResponse(false, 'Event not found'));
    }

    // Find admin role ID
    const adminRole = await Role.findOne({ role_Name: 'Admin' }).lean();
    if (!adminRole) {
      console.log('Admin role not found');
      return res.status(500).json(createResponse(false, 'Admin role not found'));
    }

    const notification = await Notification.create({
      message: message || `New event requires approval`,
      type: 'event_request',
      forRole: adminRole._id,
      userId,
      eventId,
      status: 'unread',
      metadata: {
        event: {
          id: event._id,
          name: event.event_name,
          organizer: event.org_ID.fullname
        },
        correlationId: uuidv4()
      }  
    });

    console.log('Notification created:', notification);

    // Find all admin users
    const adminUsers = await User.find({ role: adminRole._id }).lean();

    // Broadcast to all admin users
    if (wsManager && adminUsers.length > 0) {
      const notificationData = {
        type: 'notification',
        action: 'event_request',
        payload: {
          notification: notification.toObject(),
          metadata: notification.metadata
        }
      };

      // Broadcast to each admin user
      for (const admin of adminUsers) {
        wsManager.broadcastToUser(admin._id, notificationData);
      }
    }

    return res.status(201).json(
      createResponse(true, 'Notification sent successfully', notification)
    );

  } catch (error) {
    console.error('Error in requestEventNotification:', error);
    return res.status(500).json(
      createResponse(false, 'Error sending notification', null, error.message)
    );
  }
};

export const approveEventNotification = async (req, res) => {
  const { eventId } = req.params;
  const { status } = req.body;
  
  try {
    // Convert status to lowercase to match event schema enum
    const normalizedStatus = status.toLowerCase();
    if (normalizedStatus !== 'approved' && normalizedStatus !== 'rejected') {
      return res.status(400).json(createResponse(false, "Invalid status, must be 'Approved' or 'Rejected'"));
    }

    const event = await Event.findByIdAndUpdate(
      eventId,
      { status: normalizedStatus },
      { new: true }
    ).populate('org_ID');
    
    if (!event) {
      return res.status(404).json(createResponse(false, 'Event not found'));
    }

    const organizer = await User.findById(event.org_ID).populate('role', 'name');
    if (!organizer) {
      return res.status(404).json(createResponse(false, 'Organizer not found'));
    }

    const notification = await Notification.create({
      message: `Your event "${event.event_name}" has been ${normalizedStatus}.`,
      type: 'event_response',
      forRole: organizer.role.name,
      userId: organizer._id,
      eventId: event._id,
      status: 'unread',
      metadata: {
        event: {
          id: event._id,
          name: event.event_name,
          status: normalizedStatus
        },
        correlationId: uuidv4()
      }
    });

    wsManager.broadcastToUser(organizer._id, {
      type: 'notification',
      action: 'event_response',
      payload: {
        notification,
        metadata: notification.metadata
      }
    });

    res.status(200).json(createResponse(true, `Event ${normalizedStatus} successfully`, { notification }));
  } catch (error) {
    res.status(500).json(createResponse(false, 'Error processing event status', null, error.message));
  }
};

export const markAsRead = async (req, res) => {
  const { id } = req.params;
  try {
    const notification = await Notification.findByIdAndUpdate(
      id,
      { 
        status: 'read'
      },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json(createResponse(false, 'Notification not found'));
    }
    
    // Broadcast read status via WebSocket
    wsManager.broadcastToUser(req.user._id, {
      type: 'notification_read',
      notificationId: id,
      status: notification.status
    });
    
    res.status(200).json(createResponse(true, 'Notification marked as read', { notification }));
  } catch (error) {
    res.status(500).json(createResponse(false, 'Error marking notification as read', null, error.message));
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    // Use the schema's static method for consistency
    const result = await Notification.markAllAsRead(req.user._id, req.user.role);
    
    // Broadcast all read via WebSocket with updated information
    wsManager.broadcastToUser(req.user._id, {
      type: 'all_notifications_read',
      modifiedCount: result.modifiedCount
    });
    
    res.status(200).json(createResponse(true, 'All notifications marked as read', { 
      modifiedCount: result.modifiedCount 
    }));
  } catch (error) {
    res.status(500).json(createResponse(false, 'Error marking all notifications as read', null, error.message));
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndDelete({
      _id: id,
      $or: [
        { userId: req.user._id },
        { forRole: req.user.role }
      ]
    });

    if (!notification) {
      return res.status(404).json(createResponse(false, 'Notification not found or unauthorized'));
    }

    wsManager.broadcastToUser(req.user._id, {
      type: 'notification_deleted',
      payload: { 
        notificationId: id 
      }
    });

    res.status(200).json(createResponse(true, 'Notification deleted successfully', { 
      deletedNotification: notification 
    }));
  } catch (error) {
    res.status(500).json(createResponse(false, 'Error deleting notification', null, error.message));
  }
};

// Get admin notifications
export const getAdminNotifications = async (req, res) => {
  try {
    const adminRole = await Role.findOne({ role_Name: 'Admin' });
    if (!adminRole) {
      throw new Error('Admin role not found');
    }

    const notifications = await Notification.find({ 
      forRole: adminRole._id, // Using the dynamically retrieved admin role ID
      type: 'event_request' 
    })
    .sort({ createdAt: -1 })
    .lean();

    // Send initial data through HTTP
    res.status(200).json(createResponse(
      true, 
      notifications.length ? 'Admin notifications retrieved' : 'No notifications found',
      { notifications }
    ));

    // Set up WebSocket subscription for real-time updates
    if (req.user.role === adminRole._id.toString()) {
      wsManager.broadcastToUser(req.user._id, {
        type: 'admin_notifications_subscription',
        notifications
      });
    }
  } catch (error) {
    res.status(500).json(createResponse(false, 'Error fetching admin notifications', null, error.message));
  }
};

// Get unread count
export const getUnreadCount = async (req, res) => {
  try {
    // Update query to use status field for more precise counting
    const count = await Notification.countDocuments({
      $or: [
        { userId: req.user._id },
        { forRole: req.user.role }
      ],
      status: 'unread'
    });

    // Include additional metadata about notifications
    const summary = await Notification.aggregate([
      {
        $match: {
          $or: [
            { userId: req.user._id },
            { forRole: req.user.role }
          ]
        }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: { $cond: [{ $eq: ['$status', 'unread'] }, 1, 0] } }
        }
      }
    ]);

    const response = {
      totalUnread: count,
      byType: summary.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    };

    // Send comprehensive response through HTTP
    res.status(200).json(createResponse(true, 'Unread count retrieved', response));

    // Enhanced WebSocket subscription with detailed counts
    wsManager.broadcastToUser(req.user._id, {
      type: 'unread_count_subscription',
      ...response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json(createResponse(false, 'Error getting unread count', null, error.message));
  }
};