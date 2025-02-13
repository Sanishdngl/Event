import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';
import { useNavigate } from 'react-router-dom';
import websocketManager from '../../../utils/websocketManager';

const EventsManagement = ({ isDarkMode }) => {
  const [pendingEvents, setPendingEvents] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const componentClass = isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await api.get("/admin/pending-events", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (Array.isArray(response?.data?.data)) {
        setPendingEvents(response.data.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      if (err.response?.status === 403) {
        setError("You don't have permission to access this resource. Please ensure you have admin privileges.");
      } else if (err.response?.status === 401) {
        setError("Session expired. Please login again");
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(err.message || "Failed to load events. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventAction = async (eventId, action) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      const notificationData = {
        eventId,
        status: action === 'approve' ? 'approved' : 'rejected',
        message: `Your event has been ${action === 'approve' ? 'approved' : 'rejected'}`,
        type: 'event_response'
      };
      const eventResponse = await api.post(`/admin/approve-event/${eventId}`, {
        status: action === 'approve' ? 'approved' : 'rejected'
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
   
      if (eventResponse?.data?.success) {
        let persistentNotificationResponse;
        try {
          persistentNotificationResponse = await api.post(`/notifications/events/${eventId}/approve`, notificationData);
        } catch (notificationError) {
          console.warn('Failed to create persistent notification:', notificationError);
        }
   
        if (
          (!persistentNotificationResponse ||
           persistentNotificationResponse.status === 200 ||
           persistentNotificationResponse.status === 201) &&
          websocketManager?.isConnected()
        ) {
          try {
            websocketManager.send('event_response', {
              ...notificationData,
              notificationId: persistentNotificationResponse?.data?.notificationId || Date.now()
            });
          } catch (wsError) {
            console.warn('WebSocket notification failed:', wsError);
          }
        }
        setPendingEvents(prev => prev.filter(event => event._id !== eventId));
        setError(null);
      } else {
        throw new Error('Failed to update event status');
      }
      return eventResponse;
    } catch (err) {
      console.error('Action error:', err);
      if (err.response?.status === 403) {
        setError("You don't have permission to perform this action");
      } else if (err.response?.status === 401) {
        setError("Session expired. Please login again");
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(`Failed to ${action} event: ${err.response?.data?.message || err.message}`);
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);
  
  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg" role="alert">
          <span className="font-medium">Error:</span> {error}
          <button 
            onClick={() => setError(null)} 
            className="float-right text-red-700 hover:text-red-900"
          >
            ×
          </button>
        </div>
      )}
      
      <div className={`${componentClass} border rounded-xl`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold">Event Management</h3>
              <p className="text-sm opacity-60">
                {pendingEvents.length} Pending Events
              </p>
            </div>
            <button 
              onClick={fetchEvents}
              disabled={isLoading}
              className={`px-4 py-2 rounded-lg text-sm bg-indigo-500 text-white transition-colors ${
                isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-600'
              }`}
            >
              {isLoading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          <div className="overflow-x-auto">
            {pendingEvents.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-gray-700">
                    <th className="pb-3 font-medium opacity-60">Event</th>
                    <th className="pb-3 font-medium opacity-60">Organizer</th>
                    <th className="pb-3 font-medium opacity-60">Date</th>
                    <th className="pb-3 font-medium opacity-60">Status</th>
                    <th className="pb-3 font-medium opacity-60">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingEvents.map((event) => (
                    <tr key={event._id} className="border-b border-gray-700">
                      <td className="py-4">
                        <div>
                          <p className="font-medium">{event.event_name}</p>
                          <p className="text-sm opacity-60">{event.category?.categoryName || 'Uncategorized'}</p>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center">
                          <div className="flex items-center justify-center w-8 h-8 font-bold text-white rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500">
                            {event.organizer?.name?.[0] || 'N/A'}
                          </div>
                          <span className="ml-3">{event.organizer?.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="py-4">{new Date(event.event_date).toLocaleDateString()}</td>
                      <td className="py-4">
                        <span className="px-3 py-1 text-sm text-yellow-500 rounded-full bg-yellow-500/10">
                          {event.status}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleEventAction(event._id, 'approve')}
                            disabled={isLoading}
                            className={`px-3 py-1 text-sm text-white transition-colors bg-indigo-500 rounded-lg ${
                              isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-600'
                            }`}
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleEventAction(event._id, 'reject')}
                            disabled={isLoading}
                            className={`px-3 py-1 text-sm transition-colors rounded-lg bg-gray-700/30 ${
                              isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700/50'
                            }`}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500">No pending events found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsManagement;