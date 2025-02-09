import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, CardHeader, CardTitle, CardContent 
} from '../../../components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '../../../components/ui/alert';
import { Button } from '../../../components/ui/button';
import { 
  Heart, Calendar, MapPin, Clock, Trash2, Users
} from 'lucide-react';
import api from '../../../utils/api';

const EnhancedWishlist = ({ isDarkMode }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const themeClasses = {
    text: isDarkMode ? 'text-gray-100' : 'text-gray-800',
    textMuted: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    card: isDarkMode 
      ? 'bg-gray-800/50 border-gray-700' 
      : 'bg-white/50 border-gray-200',
    hover: isDarkMode
      ? 'hover:bg-gray-700/50'
      : 'hover:bg-gray-50/50',
    layout: isDarkMode 
      ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100' 
      : 'bg-gradient-to-br from-blue-50 to-white text-gray-800'
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await api.safeGet('/users/wishlist');
      setWishlistItems(response.data.wishlist || []);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to fetch wishlist');
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (eventId, e) => {
    e.stopPropagation(); // Prevent triggering the card click
    try {
      await api.safeDelete(`/users/wishlist/${eventId}`);
      setWishlistItems(prevItems => prevItems.filter(item => item._id !== eventId));
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'Failed to remove from wishlist';
      setError(errorMessage);
      setTimeout(() => setError(null), 3000);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleViewEvent = (event) => {
    // Create URL-friendly event name
    const urlFriendlyName = event.event_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    
    navigate(`/userdb/events/${urlFriendlyName}`, {
      state: {
        eventId: event._id,
        eventData: event,
        source: 'wishlist' 
      }
    });
  };

  if (loading) {
    return (
      <div className={`flex justify-center items-center min-h-[400px] ${themeClasses.layout}`}>
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <Card className={`max-w-4xl mx-auto mt-8 ${themeClasses.card}`}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Heart className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className={`text-xl font-semibold mb-2 ${themeClasses.text}`}>
            Your wishlist is empty
          </h3>
          <p className={`${themeClasses.textMuted} mb-4 text-center`}>
            Browse events and add them to your wishlist to keep track of events you're interested in.
          </p>
          <Button
            onClick={() => navigate('/userdb/events')}
            className="bg-purple-500 hover:bg-purple-600 text-white"
          >
            Browse Events
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`min-h-screen ${themeClasses.layout}`}>
      <div className="max-w-6xl mx-auto p-4">
        <Card className={`mb-6 ${themeClasses.card}`}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${themeClasses.text}`}>
              <Heart className="h-6 w-6" />
              My Wishlist
            </CardTitle>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlistItems.map((event) => (
            <Card 
              key={event._id} 
              className={`${themeClasses.card} ${themeClasses.hover} transition-all hover:shadow-xl overflow-hidden rounded-xl`}
            >
              <figure className="relative">
                <img
                  src={event.image ? `/uploads/events/${event.image.split('/').pop()}` : "/default-event.jpg"}
                  alt={event.event_name}
                  className="w-full h-48 object-cover"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-white/80 hover:bg-white text-red-500 rounded-full p-2"
                  onClick={(e) => removeFromWishlist(event._id, e)}
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
                <div className="absolute bottom-2 right-2">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    event.status === 'upcoming' ? 'bg-green-500/10 text-green-500' :
                    event.status === 'ongoing' ? 'bg-blue-500/10 text-blue-500' :
                    event.status === 'completed' ? 'bg-gray-500/10 text-gray-500' :
                    'bg-red-500/10 text-red-500'
                  }`}>
                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  </span>
                </div>
                <span className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm">
                  Rs. {event.price}
                </span>
              </figure>

              <CardContent className="p-6">
                <header className="flex items-center justify-between mb-3">
                  <span className="flex items-center space-x-2">
                    <Calendar className={`h-4 w-4 ${themeClasses.textMuted}`} />
                    <span className={`text-sm ${themeClasses.textMuted}`}>
                      {new Date(event.event_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Users className={`h-4 w-4 ${themeClasses.textMuted}`} />
                    <span className={`text-sm ${themeClasses.textMuted}`}>
                      {event.attendees?.length || 0}/{event.totalSlots}
                    </span>
                  </span>
                </header>

                <h3 className={`text-lg font-semibold ${themeClasses.text} mb-2`}>
                  {event.event_name}
                </h3>

                <div className="space-y-2">
                  <span className="flex items-center space-x-2">
                    <MapPin className={`h-4 w-4 ${themeClasses.textMuted}`} />
                    <span className={`text-sm ${themeClasses.textMuted}`}>
                      {event.location}
                    </span>
                  </span>

                  <span className="flex items-center space-x-2">
                    <Clock className={`h-4 w-4 ${themeClasses.textMuted}`} />
                    <span className={`text-sm ${themeClasses.textMuted}`}>
                      {event.time}
                    </span>
                  </span>
                </div>

                {event.tags && event.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {event.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-purple-500/10 text-purple-500 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <button
                  className="w-full mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors duration-200 flex items-center justify-center space-x-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewEvent(event);
                  }}
                >
                  <span>View Details</span>
                  <svg 
                    className="w-4 h-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 5l7 7-7 7" 
                    />
                  </svg>
                </button>

                {event.registrationDeadline && (
                  <p className={`text-xs ${themeClasses.textMuted} mt-3 text-center`}>
                    Registration closes on {new Date(event.registrationDeadline).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EnhancedWishlist;