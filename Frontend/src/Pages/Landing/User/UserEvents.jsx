import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Search } from 'lucide-react';
import { Card, CardContent } from '../../../components/ui/card';
import UserBooking from '../../../Components/BookingForm';
import api from '../../../utils/api';

const UserEvents = ({ isDarkMode, user }) => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParentCategory, setSelectedParentCategory] = useState('all');
  const [selectedChildCategory, setSelectedChildCategory] = useState('all');

  const themeClasses = {
    layout: isDarkMode 
      ? 'bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100' 
      : 'bg-gradient-to-br from-blue-50 to-white text-gray-800',
    text: isDarkMode ? 'text-gray-100' : 'text-gray-800',
    textMuted: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    card: isDarkMode 
      ? 'bg-gray-800/50 border-gray-700' 
      : 'bg-white/50 border-gray-200',
    header: isDarkMode 
      ? 'bg-gray-900/95 border-gray-700' 
      : 'bg-white/95 border-gray-200',
    input: isDarkMode
      ? 'bg-gray-800 text-gray-100 placeholder-gray-400 border-gray-700'
      : 'bg-gray-50 text-gray-900 placeholder-gray-500 border-gray-200',
    button: isDarkMode
      ? 'bg-gray-800 text-gray-100 hover:bg-gray-700'
      : 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    badge: isDarkMode
      ? 'bg-gray-700 text-gray-100'
      : 'bg-gray-200 text-gray-800'
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        let eventsEndpoint = '/events';
        
        // Add category filter to API call if a category is selected
        if (selectedParentCategory !== 'all') {
          eventsEndpoint += `?parentCategory=${selectedParentCategory}`;
          if (selectedChildCategory !== 'all') {
            eventsEndpoint += `&category=${selectedChildCategory}`;
          }
        }

        const [eventsResponse, categoriesResponse] = await Promise.all([
          api.get(eventsEndpoint),
          api.get('/categories')
        ]);
        
        // Process events data
        const processedEvents = eventsResponse.data.map(event => ({
          ...event,
          status: determineEventStatus(event.event_date)
        }));
        
        setEvents(processedEvents);
        setFilteredEvents(processedEvents);
        
        // Process categories data
        const parentCategories = categoriesResponse.data.filter(cat => !cat.parentCategory);
        const categoriesWithChildren = parentCategories.map(parent => ({
          ...parent,
          children: categoriesResponse.data.filter(cat => 
            cat.parentCategory && cat.parentCategory === parent._id
          )
        }));
        
        setCategories(categoriesWithChildren);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [selectedParentCategory, selectedChildCategory]);

  const determineEventStatus = (eventDate) => {
    const now = new Date();
    const eventDateTime = new Date(eventDate);
    
    if (eventDateTime < now) return 'completed';
    if (eventDateTime.toDateString() === now.toDateString()) return 'ongoing';
    return 'upcoming';
  };

  useEffect(() => {
    // Filter events based on search term
    let filtered = [...events];
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(event =>
        event.event_name.toLowerCase().includes(searchLower) ||
        event.description.toLowerCase().includes(searchLower) ||
        event.location.toLowerCase().includes(searchLower) ||
        (event.tags && event.tags.some(tag => 
          tag.toLowerCase().includes(searchLower)
        ))
      );
    }
    
    setFilteredEvents(filtered);
  }, [searchTerm, events]);

  const handleParentCategoryChange = (categoryId) => {
    setSelectedParentCategory(categoryId);
    setSelectedChildCategory('all');
  };

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const handleViewDetails = (event) => {
    const urlFriendlyName = event.event_name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    navigate(`/userdb/events/${urlFriendlyName}`, {
      state: {
        eventId: event._id,
        eventData: event,
        source: 'events' 
      }
    });
  };

  const handleBooking = (event, e) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setShowBookingForm(true);
  };

  if (loading) return (
    <div className={`flex justify-center items-center h-screen ${themeClasses.layout}`}>
      Loading events...
    </div>
  );

  if (error) return (
    <div className={`p-4 ${themeClasses.text} bg-red-500/10`}>
      Error: {error}
    </div>
  );

  return (
    <>
      {/* Header Section */}
      <div className={`sticky top-0 z-10 ${themeClasses.header} border-b shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 py-3">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search events by name, description, location, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${themeClasses.input}`}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </form>

          {/* Categories Navigation */}
          <div className="mt-4 space-y-3">
            {/* Parent Categories */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => {
                  setSelectedParentCategory('all');
                  setSelectedChildCategory('all');
                }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap
                  ${selectedParentCategory === 'all'
                    ? 'bg-purple-600 text-white'
                    : `${themeClasses.button}`
                  }`}
              >
                All Categories
              </button>
              {categories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => handleParentCategoryChange(category._id)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap
                    ${selectedParentCategory === category._id
                      ? 'bg-purple-600 text-white'
                      : `${themeClasses.button}`
                    }`}
                >
                  {category.categoryName}
                </button>
              ))}
            </div>

            {/* Child Categories */}
            {selectedParentCategory !== 'all' && (
              <div className="flex gap-2 overflow-x-auto pl-4">
                <button
                  onClick={() => setSelectedChildCategory('all')}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap
                    ${selectedChildCategory === 'all'
                      ? 'bg-purple-400 text-white'
                      : `${themeClasses.button}`
                    }`}
                >
                  All {categories.find(cat => cat._id === selectedParentCategory)?.categoryName} Events
                </button>
                {categories
                  .find(cat => cat._id === selectedParentCategory)
                  ?.children.map((child) => (
                    <button
                      key={child._id}
                      onClick={() => setSelectedChildCategory(child._id)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap
                        ${selectedChildCategory === child._id
                          ? 'bg-purple-400 text-white'
                          : `${themeClasses.button}`
                        }`}
                    >
                      {child.categoryName}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <main className={`min-h-screen p-6 ${themeClasses.layout}`}>
        <div className="max-w-7xl mx-auto">
          {filteredEvents.length === 0 ? (
            <div className={`text-center py-12 ${themeClasses.text}`}>
              No events found matching your criteria.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map(event => (
                <Card
                  key={event._id}
                  className={`overflow-hidden rounded-xl shadow-lg transition-all hover:shadow-xl ${themeClasses.card}`}
                  onClick={() => handleViewDetails(event)}
                >
                  <figure className="relative">
                    <img
                      src={event.image ? `/uploads/events/${event.image.split('/').pop()}` : "/default-event.jpg"}
                      alt={event.event_name}
                      className="w-full h-48 object-cover"
                    />
                    <span className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm">
                      Rs. {event.price}
                    </span>
                  </figure>
                  
                  <CardContent className="p-6">
                    <header className="flex items-center justify-between mb-3">
                      <span className="flex items-center space-x-2">
                        <Calendar className={`h-4 w-4 ${themeClasses.textMuted}`} />
                        <span className={`text-sm ${themeClasses.textMuted}`}>
                          {new Date(event.date).toLocaleDateString('en-US', {
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
                    
                    <span className="flex items-center space-x-2">
                      <MapPin className={`h-4 w-4 ${themeClasses.textMuted}`} />
                      <span className={`text-sm ${themeClasses.textMuted}`}>
                        {event.location}
                      </span>
                    </span>

                    <div className="mt-3 mb-4">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                        event.status === 'upcoming' ? 'bg-green-500/10 text-green-500' :
                        event.status === 'ongoing' ? 'bg-blue-500/10 text-blue-500' :
                        event.status === 'completed' ? 'bg-gray-500/10 text-gray-500' :
                        'bg-red-500/10 text-red-500'
                      }`}>
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </span>
                    </div>

                    {/* Category badges */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {event.category && (
                        <>
                          <span className={`px-2 py-1 rounded-full text-xs ${themeClasses.badge}`}>
                            {event.category.parentCategory?.categoryName}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${themeClasses.badge}`}>
                            {event.category.categoryName}
                          </span>
                        </>
                      )}
                    </div>

                    {event.tags && event.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
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
                    
                    <div className="flex gap-2 mt-4">
                      <button
                        className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors duration-200 flex items-center justify-center space-x-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(event);
                        }}
                      >
                        <span>Details</span>
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
                      <button
                        className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
                        onClick={(e) => handleBooking(event, e)}
                        disabled={event.status !== 'upcoming' || event.attendees?.length >= event.totalSlots}
                      >
                        {event.status !== 'upcoming' ? 'Event Not Available' :
                         event.attendees?.length >= event.totalSlots ? 'Fully Booked' : 'Book'}
                      </button>
                    </div>

                    {event.registrationDeadline && (
                      <p className={`text-xs ${themeClasses.textMuted} mt-3 text-center`}>
                        Registration closes on {new Date(event.registrationDeadline).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Booking Form Modal */}
      {showBookingForm && selectedEvent && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => {
            setShowBookingForm(false);
            setSelectedEvent(null);
          }}
        >
          <div 
            className="relative w-full max-w-md" 
            onClick={(e) => e.stopPropagation()}
          >
            <UserBooking 
              event={selectedEvent}
              isDarkMode={isDarkMode}
              onClose={() => {
                setShowBookingForm(false);
                setSelectedEvent(null);
              }}
              onBookingComplete={() => {
                // Refresh events after successful booking
                const updatedEvents = events.map(event => {
                  if (event._id === selectedEvent._id) {
                    return {
                      ...event,
                      attendees: [...(event.attendees || []), user._id]
                    };
                  }
                  return event;
                });
                setEvents(updatedEvents);
                setFilteredEvents(updatedEvents);
                setShowBookingForm(false);
                setSelectedEvent(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`text-xl ${themeClasses.text}`}>
            Loading events...
          </div>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg">
          {error}
        </div>
      )}
    </>
  );
};

export default UserEvents;
                          