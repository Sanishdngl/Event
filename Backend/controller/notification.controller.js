// controllers/notification.controller.js
import Notification from '../model/notification.schema.js';
import Event from '../model/event.schema.js';
import User from '../model/user.schema.js';
import { wsManager } from '../webSocket.js';

const createResponse = (success, message, data = null, error = null) => ({
  success,
  message,
  data,
  error
});

export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filter = req.query.filter || 'all';
    
    const skip = (page - 1) * limit;
    
    // Use aggregation to lookup user's role
    const user = await User.findById(userId).populate('role', 'name');
    if (!user) {
      return res.status(404).json(createResponse(false, 'User not found'));
    }
    
    let query = {
      $or: [
        { userId: userId },
        { forRole: user.role.name } // Use the role name from populated role document
      ]
    };
    
    // Apply filters
    switch(filter) {
      case 'unread':
        query.read = false;
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
    res.status(500).json(createResponse(false, 'Error fetching notifications', null, error.message));
  }
};

export const requestEventNotification = async (req, res) => {
  try {
    const { eventId } = req.body;
    const session = await Notification.startSession();
    
    await session.withTransaction(async () => {
      const event = await Event.findById(eventId)
        .populate({
          path: 'org_ID',
          select: 'username fullname',
          populate: { path: 'role', select: 'name' }
        })
        .session(session);
        
      if (!event) {
        throw new Error('Event not found');
      }

      // Find users with Admin role
      const adminRole = await Role.findOne({ name: 'Admin' });
      if (!adminRole) {
        throw new Error('Admin role not found');
      }

      const notification = await Notification.create([{
        message: `Organizer ${event.org_ID.fullname} has created an event "${event.event_name}" and is awaiting approval.`,
        type: 'event_request',
        forRole: 'Admin',
        userId: event.org_ID._id,
        eventId: event._id,
        status: 'unread'
      }], { session });

      // Broadcast to admin users
      wsManager.broadcastToRole('Admin', {
        type: 'new_notification',
        notification: notification[0]
      });

      res.status(201).json(createResponse(true, 'Notification created successfully', { notification: notification[0] }));
    });

    await session.endSession();
  } catch (error) {
    res.status(500).json(createResponse(false, 'Error creating notification', null, error.message));
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
    });

    wsManager.broadcastToUser(organizer._id, {
      type: 'new_notification',
      notification
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
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json(createResponse(false, 'Notification not found'));
    }

    // Broadcast read status via WebSocket
    wsManager.broadcastToUser(req.user._id, {
      type: 'notification_read',
      notificationId: id
    });

    res.status(200).json(createResponse(true, 'Notification marked as read', { notification }));
  } catch (error) {
    res.status(500).json(createResponse(false, 'Error marking notification as read', null, error.message));
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      {
        $or: [
          { userId: req.user._id },
          { forRole: req.user.role }
        ],
        read: false
      },
      { read: true }
    );
    
    // Broadcast all read via WebSocket
    wsManager.broadcastToUser(req.user._id, {
      type: 'all_notifications_read'
    });
    
    res.status(200).json(createResponse(true, 'All notifications marked as read', { modifiedCount: result.modifiedCount }));
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

    // Broadcast deletion via WebSocket
    wsManager.broadcastToUser(req.user._id, {
      type: 'notification_deleted',
      notificationId: id
    });

    res.status(200).json(createResponse(true, 'Notification deleted successfully'));
  } catch (error) {
    res.status(500).json(createResponse(false, 'Error deleting notification', null, error.message));
  }
};

// Get admin notifications
export const getAdminNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ 
      forRole: 'Admin', 
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
    if (req.user.role === 'Admin') {
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
    const count = await Notification.countDocuments({
      $or: [
        { userId: req.user._id },
        { forRole: req.user.role }
      ],
      read: false
    });
    
    // Send initial count through HTTP
    res.status(200).json(createResponse(true, 'Unread count retrieved', { count }));

    // Set up WebSocket subscription for real-time count updates
    wsManager.broadcastToUser(req.user._id, {
      type: 'unread_count_subscription',
      count
    });
  } catch (error) {
    res.status(500).json(createResponse(false, 'Error getting unread count', null, error.message));
  }
};