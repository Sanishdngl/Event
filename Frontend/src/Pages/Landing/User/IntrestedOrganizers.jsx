import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../utils/api';

const InterestedOrganizers = () => {
  const [eventRequests, setEventRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEventRequests = async () => {
      try {
        const response = await api.safeGet("/eventrequest/event-requests-for-user");
        setEventRequests(response.data.eventRequests);
        setError(null);
      } catch (error) {
        setEventRequests([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEventRequests();
  }, []);

  const handleSelectOrganizer = async (eventId, organizerId) => {
    try {
      const response = await api.safePut(
        '/eventrequest/event-request/select-organizer',
        { eventId, organizerId }
      );

      if (response.status >= 200 && response.status < 300) {
        alert('Organizer selected successfully, and status updated to deal_done.');
        const updatedResponse = await api.safeGet("/eventrequest/event-requests-for-user");
        setEventRequests(updatedResponse.data.eventRequests);
      } else {
        alert(`Error: ${response.data.message || 'Failed to select organizer'}`);
      }
    } catch (error) {
      console.error('Error selecting organizer:', error);
      alert(error.message || 'An error occurred while selecting the organizer.');
    }
  };

  const handleCreateEventRequest = () => {
    navigate('/userdb/eventrequest');
  };

  if (loading) return <p>Loading...</p>;

  if (error) return <p className="text-red-500">{error}</p>;

  if (!eventRequests || eventRequests.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="mb-6">
          <h3 className="text-2xl font-semibold mb-2">No Event Requests Found</h3>
          <p className="text-gray-600 mb-4">
            You haven't created any event requests yet. Start planning your perfect event today!
          </p>
          <button
            onClick={handleCreateEventRequest}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center mx-auto"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create New Event Request
          </button>
        </div>
        <div className="max-w-md mx-auto bg-gray-50 p-6 rounded-lg">
          <h4 className="text-lg font-medium mb-3">Why create an event request?</h4>
          <ul className="text-left text-gray-600 space-y-2">
            <li>• Connect with experienced event organizers</li>
            <li>• Get multiple proposals and budgets</li>
            <li>• Choose the best fit for your event</li>
            <li>• Save time on event planning</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl">Event Requests</h3>
        <button
          onClick={handleCreateEventRequest}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          New Event Request
        </button>
      </div>
      <div>
        {eventRequests.map((event) => (
          <div key={event.eventId} className="mb-6 p-4 border rounded-lg shadow-sm">
            <h4 className="text-xl font-semibold mb-4">{event.eventType} Event</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="font-medium">Venue:</p>
                <p>{event.venue}</p>
              </div>
              <div>
                <p className="font-medium">Date:</p>
                <p>{new Date(event.date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="font-medium">Budget:</p>
                <p>${event.budget}</p>
              </div>
              <div>
                <p className="font-medium">Status:</p>
                <p>{event.status}</p>
              </div>
            </div>
            <div className="mb-4">
              <p className="font-medium">Description:</p>
              <p>{event.description}</p>
            </div>
            {event.organizers.length === 0 ? (
              <p className="p-4 bg-gray-50 rounded-md">No organizers have accepted for this event yet.</p>
            ) : (
              <ul>
                {event.organizers.map((organizer, index) => (
                  <li key={index} className="p-4 mb-2 border rounded-md hover:shadow-md transition-shadow duration-200">
                    <p>Fullname: {organizer.fullname}</p>
                    <p>Contact: {organizer.contact}</p>
                    <p>Message: {organizer.message}</p>
                    <p>Proposed Budget: {organizer.proposedBudget}</p>
                    <p>Status: {organizer.status}</p>
                    <p>Response Date: {new Date(organizer.responseDate).toLocaleDateString()}</p>
                    <button
                      onClick={() => handleSelectOrganizer(event.eventId, organizer.organizerId)}
                      className="px-4 py-2 mt-2 text-white bg-green-500 rounded hover:bg-green-600 transition-colors duration-200"
                    >
                      Select Organizer
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default InterestedOrganizers;