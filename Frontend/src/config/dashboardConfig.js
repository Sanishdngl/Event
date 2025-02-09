// Import icons
import { 
  BarChart3, 
  Plus, 
  List, 
  Settings as SettingsIcon,
  Users,
  Users2,
  Calendar,
  Heart, 
  PenSquare,
  Ticket,
  FolderTree,
  Lock
} from 'lucide-react';

// Import Organizer components
import Overview from '../Pages/Landing/Organizer/Overview';
import CreateEvent from '../Pages/Landing/Organizer/CreateEvent';
import MyEvents from '../Pages/Landing/Organizer/MyEvents';
import EventRequestorg from '../Pages/Landing/Organizer/EventRequest';

// Import Admin components
import AdminOverview from '../Pages/Landing/Admin/Overview';
import EventsManagement from '../Pages/Landing/Admin/EventsManagement';
import UsersManagement from '../Pages/Landing/Admin/UsersManagement';
import PermissionsManagement from '../Pages/Landing/Admin/PermissionsManagement';
import CategoriesManagement from '../Pages/Landing/Admin/CategoriesManagement';
import Settings from '../Pages/Landing/Admin/Settings';

// Import User components
import UserEvents from '../Pages/Landing/User/UserEvents';
import EventDetails from '../Pages/Landing/User/EventDetail';
import EventRequest from '../Pages/Landing/User/EventRequest';
import InterestedOrganizers from '../Pages/Landing/User/IntrestedOrganizers';
import UserWishlist from '../Pages/Landing/User/UserWishlist';
import UserBookings from '../Pages/Landing/User/UserBookings';
import BookingSuccess from '../Pages/Landing/User/booking/BookingSuccess';
import BookingFailed from '../Pages/Landing/User/booking/BookingFailed';

export const userDashboardConfig = {
  basePath: '/userdb',
  defaultTab: 'events',
  tabs: {
    events: {
      title: 'My Events',
      description: 'View and manage your registered events',
      component: UserEvents,
      permissions: ['VIEW_USER_EVENTS'],
      icon: Calendar
    },
    eventrequest: {
      title: 'Request Event',
      description: 'Submit new event requests to organizers',
      component: EventRequest,
      permissions: ['CREATE_EVENT_REQUEST'],
      icon: PenSquare
    },
    interestedorganizers: {
      title: 'Interested Organizers',
      description: 'View and select organizers interested in your events',
      component: InterestedOrganizers,
      permissions: ['VIEW_INTERESTED_ORGANIZERS'],
      icon: Users2
    },
    wishlist: {
      title: 'Wishlist',
      description: 'Events you\'ve saved for later',
      component: UserWishlist,
      permissions: ['VIEW_USER_WISHLIST'],
      icon: Heart
    },
    bookings: {
      title: 'Bookings',
      description: 'Your event booking history',
      component: UserBookings,
      permissions: ['VIEW_USER_BOOKINGS'],
      icon: Ticket
    }
  },
  additionalRoutes: {
    'events/:eventName': {
      component: EventDetails,
      permissions: ['VIEW_EVENT_DETAILS']
    },
    'booking/success': {
      component: BookingSuccess,
      permissions: ['VIEW_BOOKING_DETAILS']
    },
    'booking/failed': {
      component: BookingFailed,
      permissions: ['VIEW_BOOKING_DETAILS']
    }
  }
};

export const organizerDashboardConfig = {
  basePath: '/orgdb',
  defaultTab: 'overview',
  tabs: {
    overview: {
      title: 'Overview',
      description: 'View your event management statistics and insights',
      component: Overview,
      permissions: ['VIEW_DASHBOARD'],
      icon: BarChart3
    },
    'create-event': {
      title: 'Create Event',
      description: 'Create and configure new events',
      component: CreateEvent,
      permissions: ['CREATE_EVENT'],
      icon: Plus
    },
    'my-events': {
      title: 'My Events',
      description: 'Manage your existing events',
      component: MyEvents,
      permissions: ['VIEW_EVENTS'],
      icon: List
    },
    eventrequest: {
      title: 'Request Event',
      description: 'Submit new event requests to organizers',
      component: EventRequestorg,
      permissions: ['CREATE_EVENT_REQUEST'],
      icon: PenSquare
    },
  }
};

export const adminDashboardConfig = {
  basePath: '/admindb',
  defaultTab: 'overview',
  tabs: {
    overview: {
      title: 'Dashboard Overview',
      description: 'System-wide statistics and insights',
      component: AdminOverview,
      permissions: ['ADMIN_VIEW_DASHBOARD'],
      icon: BarChart3
    },
    events: {
      title: 'Events Management',
      description: 'Manage all events in the system',
      component: EventsManagement,
      permissions: ['MANAGE_EVENTS'],
      icon: Calendar
    },
    users: {
      title: 'Users Management',
      description: 'Manage system users',
      component: UsersManagement,
      permissions: ['MANAGE_USERS'],
      icon: Users
    },
    permissions: {
      title: 'Permissions Management',
      description: 'Manage user roles and permissions',
      component: PermissionsManagement,
      permissions: ['MANAGE_PERMISSIONS'],
      icon: Lock
    },
    categories: {
      title: 'Categories Management',
      description: 'Manage event categories',
      component: CategoriesManagement,
      permissions: ['MANAGE_CATEGORIES'],
      icon: FolderTree
    },
    settings: {
      title: 'Settings',
      description: 'Configure system-wide settings',
      component: Settings,
      permissions: ['MANAGE_SETTINGS'],
      icon: SettingsIcon
    }
  }
};

// Helper function to get tab data
export const getTabData = (config, tabKey) => {
  return config.tabs[tabKey] || config.tabs[config.defaultTab];
};