import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, TrendingUp } from 'lucide-react';
import api from '../utils/api';
import { useTheme } from '../context/ThemeContext';

const PublicEvent = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const response = await api.get('/events');
        setEvents(response.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleViewDetails = () => {
    navigate('/loginsignup');
  };

  const getCurrentEvents = () => {
    const now = new Date();
    return events.filter(event => {
      const eventDate = new Date(event.event_date);
      return eventDate.toDateString() === now.toDateString();
    });
  };

  const getUpcomingEvents = () => {
    const now = new Date();
    return events.filter(event => {
      const eventDate = new Date(event.event_date);
      return eventDate > now;
    }).slice(0, 3); // Show only top 3 upcoming events
  };

  const EventCard = ({ event }) => (
    <div
      className={`group rounded-lg border transition-all duration-300 ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700 hover:border-gray-600' 
          : 'bg-white border-gray-200 hover:border-blue-500'
      }`}
    >
      <div className="relative aspect-video">
        <img
          src={event.image ? `/uploads/events/${event.image.split('/').pop()}` : "/default-event.jpg"}
          alt={event.event_name}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            isDarkMode 
              ? 'bg-gray-900/80 text-gray-300' 
              : 'bg-white/80 text-gray-900'
          }`}>
            {event.status}
          </span>
        </div>
      </div>

      <div className="p-6">
        <h3 className={`text-xl font-semibold mb-2 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          {event.event_name}
        </h3>
        <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-4 line-clamp-2`}>
          {event.description}
        </p>
        <div className="space-y-2 text-sm">
          <div className={`flex items-center gap-2 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            <Calendar className="w-4 h-4" />
            <span>{new Date(event.event_date).toLocaleDateString()}</span>
          </div>
          <div className={`flex items-center gap-2 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            <MapPin className="w-4 h-4" />
            <span>{event.location}</span>
          </div>
          <div className={`flex items-center gap-2 ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            <span>Rs. {event.price}</span>
          </div>
        </div>
        <button 
          onClick={handleViewDetails}
          className={`mt-6 w-full py-2 rounded-lg transition-colors ${
            isDarkMode 
              ? 'bg-gray-700 text-white hover:bg-gray-600' 
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}>
          View Details
        </button>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen pt-16 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header Section */}
      <div className={`${
        isDarkMode 
          ? 'bg-gradient-to-r from-gray-700 to-gray-800' 
          : 'bg-gradient-to-r from-blue-600 to-blue-800'
      } text-white py-12`}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Find Your Perfect Event</h1>
          <p className={`${isDarkMode ? 'text-gray-200' : 'text-blue-100'} text-lg max-w-2xl mx-auto`}>
            Discover amazing events happening around you
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${
              isDarkMode ? 'border-gray-400' : 'border-blue-500'
            }`}></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className={`inline-block px-6 py-4 rounded-lg ${
              isDarkMode 
                ? 'bg-gray-800 border border-gray-700 text-gray-300' 
                : 'bg-white border border-red-200 text-red-600'
            }`}>
              {error}
            </div>
          </div>
        ) : (
          <>
            {/* Happening Now Section */}
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-6">
                <Clock className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Happening Right Now
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {getCurrentEvents().map(event => (
                  <EventCard key={event._id} event={event} />
                ))}
                {getCurrentEvents().length === 0 && (
                  <div className={`col-span-full text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    No events happening right now
                  </div>
                )}
              </div>
            </div>

            {/* Featured Upcoming Events */}
            <div className="mb-12">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Featured Upcoming Events
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {getUpcomingEvents().map(event => (
                  <EventCard key={event._id} event={event} />
                ))}
              </div>
            </div>

            {/* All Events */}
            <div>
              <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                All Events
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {events.map(event => (
                  <EventCard key={event._id} event={event} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PublicEvent;