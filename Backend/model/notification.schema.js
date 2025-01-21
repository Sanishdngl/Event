import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    message: { 
      type: String, 
      required: true 
    },
    type: { 
      type: String, 
      required: true,
      enum: ['event_request', 'event_response', 'event_update', 
             'system_notification', 'profile_update']
    },
    forRole: { 
      type: mongoose.Schema.Types.ObjectId,  // Changed from String to ObjectId
      ref: 'Role',                          // Added reference to Role model
      required: true
    },
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    eventId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Event',
      required: function() {
        return ['event_request', 'event_response', 'event_update'].includes(this.type);
      }
    },
    read: { 
      type: Boolean, 
      default: false 
    },
    status: {                               // Added status field
      type: String,
      enum: ['read', 'unread', 'archived'],
      default: 'unread'
    }
  },
  { 
    timestamps: true,
    indexes: [
      { userId: 1, read: 1 },
      { forRole: 1, type: 1 },
      { createdAt: -1 },
      { status: 1 }                         // Added index for status
    ]
  }
);

// Updated method to work with ObjectId roles
notificationSchema.statics.markAllAsRead = async function(userId, roleId) {
  return this.updateMany(
    {
      $or: [
        { userId: userId },
        { forRole: roleId }
      ],
      read: false
    },
    { 
      read: true,
      status: 'read'
    }
  );
};

export const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;