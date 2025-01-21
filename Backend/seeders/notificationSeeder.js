import User from '../model/user.schema.js';
import Event from '../model/event.schema.js';
import Notification from '../model/notification.schema.js';

const notificationTemplates = [
  // Admin notifications
  {
    userEmail: 'admin@gmail.com',
    notifications: [
      {
        message: 'System maintenance scheduled for next week',
        type: 'system_notification'  // No eventId needed
      },
      {
        message: 'New event approval request pending',
        type: 'event_request',
        needsEvent: true  // Flag to indicate this needs an eventId
      }
    ]
  },
  // User notifications
  {
    userEmail: 'user@gmail.com',
    notifications: [
      {
        message: 'Welcome to our platform!',
        type: 'system_notification'  // No eventId needed
      },
      {
        message: 'New events available in your area',
        type: 'event_update',
        needsEvent: true  // Flag to indicate this needs an eventId
      }
    ]
  },
  // Organizer notifications
  {
    userEmail: 'organizer@gmail.com',
    notifications: [
      {
        message: 'Your event has been approved',
        type: 'event_response',
        needsEvent: true  // Flag to indicate this needs an eventId
      },
      {
        message: 'New organizer guidelines available',
        type: 'system_notification'  // No eventId needed
      },
      {
        message: 'Profile update reminder',
        type: 'profile_update'  // No eventId needed
      }
    ]
  }
];

const seedNotifications = async () => {
  let created = 0;
  let skipped = 0;
  let failed = 0;

  try {
    // Clear existing notifications
    await Notification.deleteMany({});
    console.log('Cleared existing notifications');

    // Get all events for reference
    const events = await Event.find({});
    if (events.length === 0) {
      console.log("No events found. Please run event seeder first.");
      return;
    }

    // Create notifications for each user
    for (const template of notificationTemplates) {
      const user = await User.findOne({ email: template.userEmail }).populate('role');
      
      if (!user) {
        console.log(`User not found: ${template.userEmail}`);
        failed += template.notifications.length;
        continue;
      }

      for (const notifData of template.notifications) {
        try {
          let notificationData = {
            message: notifData.message,
            type: notifData.type,
            forRole: user.role._id,
            userId: user._id,
            read: false,
            status: 'unread'
          };

          // Add eventId if needed based on notification type
          if (notifData.needsEvent) {
            // Get appropriate event based on user role and notification type
            let event;
            if (user.role.role_Name === 'Organizer') {
              // For organizer, get their own event
              event = events.find(e => e.org_ID.toString() === user._id.toString());
            } else {
              // For others, get any approved event
              event = events.find(e => e.status === 'approved');
            }

            if (!event) {
              console.log(`No suitable event found for ${template.userEmail}'s ${notifData.type} notification`);
              failed++;
              continue;
            }
            notificationData.eventId = event._id;
          }

          await Notification.create(notificationData);
          created++;
        } catch (error) {
          console.error(`Failed to create notification for ${template.userEmail}:`, error.message);
          failed++;
        }
      }
    }

    console.log(`Notifications: ${created} created, ${skipped} skipped, ${failed} failed`);
  } catch (error) {
    console.error('Error in notification seeder:', error);
  }
};

export default seedNotifications;