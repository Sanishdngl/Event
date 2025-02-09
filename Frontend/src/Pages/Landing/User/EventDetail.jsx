import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { 
  Calendar, MapPin, Clock, Users, Tag, User, CalendarCheck, Share2, XCircle, 
  Calendar as CalendarIcon, ArrowLeft, Check, Heart 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '../../../components/ui/alert';
import { Button } from "../../../components/ui/button";
import api from '../../../utils/api';

const EventDetails = ({ isDarkMode }) => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [similarEvents, setSimilarEvents] = useState([]);
  const [addedToCalendar, setAddedToCalendar] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const themeClasses = {
    text: isDarkMode ? 'text-gray-100' : 'text-gray-800',
    textMuted: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    card: isDarkMode 
      ? 'bg-gray-800/50 border-gray-700' 
      : 'bg-white/50 border-gray-200',
    similarEventBox: isDarkMode
      ? 'bg-gray-800/30 hover:bg-gray-800/50 border-gray-700'
      : 'bg-white/30 hover:bg-white/50 border-gray-200'
  };

  const fetchWishlistStatus = async (eventId) => {
    try {
      const response = await api.safeGet('/users/wishlist');
      return response.data.wishlist?.some(item => item._id === eventId) || false;
    } catch (err) {
      console.error('Error fetching wishlist status:', err);
      return false;
    }
  };

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        const eventId = location.state?.eventId || id;
        
        if (eventId) {
          const [eventResponse, similarResponse, registrationResponse, wishlistStatus] = await Promise.all([
            api.safeGet(`/events/${eventId}`),
            api.safeGet(`/events/${eventId}/similar`),
            api.safeGet(`/events/${eventId}/registration-status`),
            fetchWishlistStatus(eventId)
          ]);
          
          setEvent(eventResponse.data);
          setSimilarEvents(similarResponse.data);
          setIsRegistered(registrationResponse.data.isRegistered);
          setIsInWishlist(wishlistStatus);
        } else {
          const eventsResponse = await api.safeGet('/events', {
            params: {
              search: id.replace(/-/g, ' ')
            }
          });
          
          if (eventsResponse.data.length > 0) {
            const foundEvent = eventsResponse.data[0];
            const [similarResponse, registrationResponse, wishlistStatus] = await Promise.all([
              api.safeGet(`/events/${foundEvent._id}/similar`),
              api.safeGet(`/events/${foundEvent._id}/registration-status`),
              fetchWishlistStatus(foundEvent._id)
            ]);
            
            setEvent(foundEvent);
            setSimilarEvents(similarResponse.data);
            setIsRegistered(registrationResponse.data.isRegistered);
            setIsInWishlist(wishlistStatus);
          } else {
            throw new Error('Event not found');
          }
        }
        
        setError(null);
      } catch (err) {
        setError(err.message || 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id, location.state]);

  const handleWishlist = async () => {
    if (!event?._id) return;
    
    try {
      setWishlistLoading(true);
      
      if (isInWishlist) {
        await api.safeDelete(`/users/wishlist/${event._id}`);
        setIsInWishlist(false);
      } else {
        await api.safePost('/users/wishlist', { eventId: event._id });
        setIsInWishlist(true);
      }
    } catch (err) {
      setError(err.message || 'Failed to update wishlist');
    } finally {
      setWishlistLoading(false);
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

  const handleRegistration = async () => {
    try {
      await api.safePost(`/events/${event._id}/register`);
      setIsRegistered(true);
      
      const response = await api.safeGet(`/events/${event._id}`);
      setEvent(response.data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to register for event');
    }
  };

  const handleCancelRegistration = async () => {
    try {
      await api.safeDelete(`/events/${event._id}/register`);
      setIsRegistered(false);
      
      const response = await api.safeGet(`/events/${event._id}`);
      setEvent(response.data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to cancel registration');
    }
  };

  const handleAddToCalendar = () => {
    const eventDetails = {
      title: event.event_name,
      description: event.description,
      location: event.location,
      start: new Date(event.event_date),
      duration: 60,
    };

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventDetails.title)}&details=${encodeURIComponent(eventDetails.description)}&location=${encodeURIComponent(eventDetails.location)}&dates=${eventDetails.start.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${new Date(eventDetails.start.getTime() + eventDetails.duration * 60000).toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;
    
    window.open(googleCalendarUrl, '_blank');
    setAddedToCalendar(true);
  };

  const handleShare = async () => {
    const shareData = {
      title: event.event_name,
      text: event.description,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleBack = () => {
    const source = location.state?.source || 'events';
    if (source === 'wishlist') {
      navigate('/userdb/wishlist');
    } else {
      navigate('/userdb/events');
    }
  };

  if (loading) return (
    <div className={`flex justify-center items-center h-screen ${themeClasses.layout}`}>
      Loading event details...
    </div>
  );

  if (error) return (
    <Alert variant="destructive" className="m-4">
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );

  if (!event) return null;

  const isEventFull = event.attendees.length >= event.totalSlots;
  const isPastDeadline = new Date(event.registrationDeadline) < new Date();

  return (
    <div className="max-w-6xl mx-auto p-4">
      <Button
  onClick={handleBack}
  variant="ghost"
  className={`mb-4 flex items-center gap-2 ${themeClasses.text} hover:bg-gray-100 dark:hover:bg-gray-800`}
>
  <ArrowLeft className="h-4 w-4" />
  {location.state?.source === 'wishlist' ? 'Back to Wishlist' : 'Back to Events'}
</Button>

      <Card className={`${themeClasses.card}`}>
        <div className="relative">
          <img
            src={event.image ? `/uploads/events/${event.image.split('/').pop()}` : "/default-event.jpg"}
            alt={event.event_name}
            className="w-full h-80 object-cover"
          />
          <div className="absolute top-4 right-4 flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-full p-2 ${
                isInWishlist 
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-white/80 hover:bg-white text-gray-700'
              } ${wishlistLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleWishlist}
              disabled={wishlistLoading}
            >
              <Heart
                className={`h-6 w-6 ${isInWishlist ? 'fill-current' : ''}`}
              />
            </Button>
            <span className={`px-4 py-2 rounded-full ${
              event.status === 'upcoming' ? 'bg-green-500' :
              event.status === 'ongoing' ? 'bg-blue-500' :
              event.status === 'completed' ? 'bg-gray-500' :
              'bg-red-500'
            } text-white`}>
              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
            </span>
          </div>
        </div>

        <CardHeader>
          <CardTitle className={`text-3xl font-bold ${themeClasses.text}`}>
            {event.event_name}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <p className={`text-lg ${themeClasses.text}`}>
            {event.description}
          </p>

          <div className="flex flex-wrap gap-4">
            <Button
              onClick={handleShare}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Share2 className="h-4 w-4" />
              Share Event
            </Button>

            <Button
              onClick={handleAddToCalendar}
              variant={addedToCalendar ? "success" : "outline"}
              className={`flex items-center gap-2 ${
                addedToCalendar ? 'bg-green-500 hover:bg-green-600 text-white border-green-500' : ''
              }`}
            >
              {addedToCalendar ? (
                <>
                  <Check className="h-4 w-4" />
                  Added to Calendar
                </>
              ) : (
                <>
                  <CalendarIcon className="h-4 w-4" />
                  Add to Calendar
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`flex items-center space-x-2 ${themeClasses.text}`}>
              <Calendar className="h-5 w-5" />
              <span>Event Date: {formatDate(event.event_date)}</span>
            </div>

            <div className={`flex items-center space-x-2 ${themeClasses.text}`}>
              <CalendarCheck className="h-5 w-5" />
              <span>Registration Deadline: {formatDate(event.registrationDeadline)}</span>
            </div>

            <div className={`flex items-center space-x-2 ${themeClasses.text}`}>
              <Clock className="h-5 w-5" />
              <span>Time: {event.time}</span>
            </div>

            <div className={`flex items-center space-x-2 ${themeClasses.text}`}>
              <MapPin className="h-5 w-5" />
              <span>Location: {event.location}</span>
            </div>

            <div className={`flex items-center space-x-2 ${themeClasses.text}`}>
              <span>Rs. {event.price}</span>
            </div>

            <div className={`flex items-center space-x-2 ${themeClasses.text}`}>
              <Users className="h-5 w-5" />
              <span>Capacity: {event.attendees.length}/{event.totalSlots}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className={`flex items-center space-x-2 ${themeClasses.text}`}>
              <Tag className="h-5 w-5" />
              <span>Category: {event.category?.categoryName}</span>
            </div>
            
            {event.tags && event.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag, index) => (
                  <span key={index} className="px-3 py-1 bg-purple-500 text-white rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className={`flex items-center space-x-2 ${themeClasses.text}`}>
            <User className="h-5 w-5" />
            <span>Organized by: {event.org_ID?.fullname}</span>
          </div>

          <div className="mt-6">
            {isRegistered ? (
              <Button
                onClick={handleCancelRegistration}
                className="w-full py-3 bg-red-500 hover:bg-red-600 text-white"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Cancel Registration
              </Button>
            ) : (
              <Button
                onClick={handleRegistration}
                disabled={isEventFull || isPastDeadline}
                className={`w-full py-3 ${
                  isEventFull || isPastDeadline 
                    ? 'bg-gray-500 cursor-not-allowed' 
                    : 'bg-purple-500 hover:bg-purple-600'
                } text-white`}
              >
                {isEventFull 
                  ? 'Event Full' 
                  : isPastDeadline 
                    ? 'Registration Closed' 
                    : 'Register for Event'}
              </Button>
            )}
          </div>

          {similarEvents.length > 0 && (
            <div className="mt-8">
              <h3 className={`text-xl font-semibold mb-4 ${themeClasses.text}`}>
                Similar Events
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {similarEvents.map((similarEvent) => (
                  <div 
                    key={similarEvent._id} 
                    className={`p-4 rounded-lg border transition-colors duration-200 ${themeClasses.similarEventBox}`}
                  >
                    <h4 className={`font-semibold ${themeClasses.text}`}>
                      {similarEvent.event_name}
                    </h4>
                    <p className={`mt-2 ${themeClasses.textMuted}`}>
                      {formatDate(similarEvent.event_date)}
                    </p>
                    <Button
                      variant="link"
                      onClick={() => navigate(`/userdb/events/${similarEvent._id}`)}
                      className="mt-2 pl-0"
                    >
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EventDetails;