import { useState, useEffect } from 'react';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import api from '../../../utils/api';
import { getToken } from '../../../utils/auth';

const MyEvents = ({ isDarkMode }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError("");

        const token = getToken();
        if (!token) {
          throw new Error("No authentication token found");
        }

        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        if (!decodedToken.user?.email) {
          throw new Error("Unable to verify user email");
        }

        const userResponse = await api.get(`/users/email/${decodedToken.user.email}`);
        const userData = userResponse.data.user;
            
        if (!userData || !userData._id) {
          throw new Error("Unable to verify user credentials");
        }

        const eventsResponse = await api.get(`/events/user/${userData._id}`);
        setEvents(eventsResponse.data);
      } catch (err) {
        console.error("Error fetching events:", err);
        let errorMessage = "Failed to fetch events";
        
        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, []);

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    
    try {
      await api.delete(`/events/delete/${eventId}`);
      setEvents(events.filter(event => event._id !== eventId));
    } catch (err) {
      setError("Failed to delete event");
      console.error(err);
    }
  };

  if (loading) return <div className="flex justify-center p-8">Loading...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      
      {events.map((event) => (
        <div key={event._id} className={`${
          isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white'
        } rounded-lg shadow-md overflow-hidden`}> 
        
        <img
   src={event.image ? `/uploads/events/${event.image.split('/').pop()}` : "/default-event.jpg"}
   alt={event.event_name}
   className="w-full h-48 object-cover"
/>
          
          <div className="p-4">
            <h3 className="text-xl font-semibold mb-2">{event.event_name}</h3>
            <p className={`${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            } mb-2 line-clamp-2`}>
              {event.description}
            </p>
            
            <div className={`space-y-2 text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              <p>Date: {format(new Date(event.event_date), 'PPP')}</p>
              <p>Location: {event.location}</p>
              <p>Price: Rs.{event.price}</p>
              <p>Slots: {event.attendees?.length || 0}/{event.totalSlots}</p>
            </div>
            
            <div className="mt-4 flex justify-end space-x-2">
              <button 
                onClick={() => window.location.href = `/event/${event._id}`}
                className="p-2 text-blue-500 hover:bg-blue-50 rounded"
              >
                <Eye size={20} />
              </button>
              <button 
                onClick={() => window.location.href = `/event/edit/${event._id}`}
                className="p-2 text-green-500 hover:bg-green-50 rounded"
              >
                <Edit size={20} />
              </button>
              <button 
                onClick={() => handleDeleteEvent(event._id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded"
                disabled={event.status !== 'upcoming'}
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        </div>
      ))}
      
      {events.length === 0 && (
        <div className={`col-span-full text-center py-8 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-500'
        }`}>
          No events found. Create your first event to get started!
        </div>
      )}
    </div>
  );
};

export default MyEvents;