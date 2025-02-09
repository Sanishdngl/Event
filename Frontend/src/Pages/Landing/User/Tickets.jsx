import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';
import { Ticket, Calendar, MapPin, Clock } from 'lucide-react';

const Tickets = ({ isDarkMode, user }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await api.get('/tickets/my-tickets');
        setTickets(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const getTicketStatus = (ticket) => {
    const now = new Date();
    const eventDate = new Date(ticket.event.date);
    
    if (eventDate > now) return 'Upcoming';
    if (eventDate <= now && ticket.event.endDate > now) return 'Ongoing';
    return 'Completed';
  };

  if (loading) return <div>Loading tickets...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className={`space-y-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
      <h2 className="text-xl font-semibold mb-4">My Tickets</h2>
      {tickets.length === 0 ? (
        <p className="text-center text-gray-500">No tickets found</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tickets.map(ticket => (
            <div 
              key={ticket._id} 
              className={`border rounded-lg p-4 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
            >
              <div className="flex items-center justify-between mb-4">
                <Ticket className={`w-8 h-8 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                <span className={`px-2 py-1 rounded-full text-xs ${
                  getTicketStatus(ticket) === 'Upcoming' 
                    ? 'bg-green-100 text-green-800'
                    : getTicketStatus(ticket) === 'Ongoing'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {getTicketStatus(ticket)}
                </span>
              </div>
              <h3 className="font-semibold text-lg mb-2">{ticket.event.event_name}</h3>
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>{ticket.event.date}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>{ticket.event.time}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>{ticket.event.location}</span>
                </div>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <div className="font-semibold">Ticket #: {ticket.ticketNumber}</div>
                <button 
                  onClick={() => window.location.href = `/events/${ticket.event._id}`}
                  className={`py-2 px-4 rounded-lg ${isDarkMode ? 'bg-purple-600 hover:bg-purple-500' : 'bg-purple-500 hover:bg-purple-600'} text-white text-sm`}
                >
                  Event Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Tickets;