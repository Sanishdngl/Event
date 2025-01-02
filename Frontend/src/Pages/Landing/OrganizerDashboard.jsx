import  { useState, useEffect } from "react";
import { Calendar, Star, TrendingUp, BarChart2, PlusCircle, MapPin, DollarSign } from "lucide-react";

const OrganizerDashboard = () => {
  const [events, setEvents] = useState([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const [eventStats, setEventStats] = useState([]);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    location: "",
    date: "",
    ticketsSold: 0,
    pricePerTicket: 0,
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = () => {
    const dummyEvents = [
      {
        id: 1,
        title: "Wedding Party",
        location: "Beachside Resort",
        date: "2024-12-01",
        ticketsSold: 200,
        totalTickets: 300,
        pricePerTicket: 50,
        interested: 400,
        totalProfit: 10000,
        marginRatio: 0.25,
        status: "Upcoming"
      },
      {
        id: 2,
        title: "Corporate Event",
        location: "City Convention Center",
        date: "2024-11-15",
        ticketsSold: 150,
        totalTickets: 300,
        pricePerTicket: 75,
        interested: 500,
        totalProfit: 11250,
        marginRatio: 0.3,
        status: "Completed"
      },
    ];

    setEvents(dummyEvents);
    setTotalEvents(dummyEvents.length);
    setEventStats(dummyEvents);
  };

  const handleEventCreation = (e) => {
    e.preventDefault();
    const createdEvent = {
      id: events.length + 1,
      ...newEvent,
      totalProfit: newEvent.ticketsSold * newEvent.pricePerTicket,
      marginRatio: newEvent.ticketsSold / 1000,
      interested: Math.floor(newEvent.ticketsSold * 1.5),
      status: "Upcoming"
    };

    setEvents([...events, createdEvent]);
    setNewEvent({
      title: "",
      location: "",
      date: "",
      ticketsSold: 0,
      pricePerTicket: 0,
    });
    setShowCreateEventModal(false);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "Upcoming": return "badge-primary";
      case "Completed": return "badge-success";
      default: return "badge-neutral";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-800 flex items-center">
            <Star className="mr-3 text-yellow-500" size={40} />
            Organizer Dashboard
          </h1>
          <button 
            onClick={() => setShowCreateEventModal(true)}
            className="btn btn-primary btn-lg flex items-center gap-2"
          >
            <PlusCircle size={20} /> Create New Event
          </button>
        </header>

        {/* Stats Overview */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-700">Total Events</h3>
              <BarChart2 className="text-blue-500" />
            </div>
            <p className="text-4xl font-bold text-blue-600">{totalEvents}</p>
          </div>

          <div className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-700">Total Profit</h3>
              <DollarSign className="text-green-500" />
            </div>
            <p className="text-4xl font-bold text-green-600">
              ${eventStats.reduce((acc, event) => acc + event.totalProfit, 0).toLocaleString()}
            </p>
          </div>

          <div className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-700">Avg Margin Ratio</h3>
              <TrendingUp className="text-purple-500" />
            </div>
            <p className="text-4xl font-bold text-purple-600">
              {(
                eventStats.reduce((acc, event) => acc + event.marginRatio, 0) /
                eventStats.length
              ).toFixed(2)}
            </p>
          </div>
        </section>

        {/* Events Grid */}
        <section>
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Your Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div 
                key={event.id} 
                className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all hover:scale-105 hover:shadow-xl"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-bold text-gray-800">{event.title}</h3>
                    <span className={`badge ${getStatusColor(event.status)} font-semibold`}>
                      {event.status}
                    </span>
                  </div>
                  <div className="space-y-3 text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="mr-2 text-red-500" size={20} />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="mr-2 text-blue-500" size={20} />
                      <span>{event.date}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-4 border-t">
                      <div>
                        <p className="font-semibold text-gray-800">Tickets Sold</p>
                        <p className="text-lg">{event.ticketsSold}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">Total Profit</p>
                        <p className="text-lg text-green-600">${event.totalProfit}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Create Event Modal */}
        {showCreateEventModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8">
              <h2 className="text-2xl font-bold mb-6 text-center">Create New Event</h2>
              <form onSubmit={handleEventCreation} className="space-y-4">
                <input
                  type="text"
                  placeholder="Event Title"
                  className="input input-bordered w-full"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Event Location"
                  className="input input-bordered w-full"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  required
                />
                <input
                  type="date"
                  className="input input-bordered w-full"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    placeholder="Tickets Sold"
                    className="input input-bordered w-full"
                    value={newEvent.ticketsSold}
                    onChange={(e) => setNewEvent({ ...newEvent, ticketsSold: Number(e.target.value) })}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Price Per Ticket"
                    className="input input-bordered w-full"
                    value={newEvent.pricePerTicket}
                    onChange={(e) => setNewEvent({ ...newEvent, pricePerTicket: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="flex justify-between mt-6">
                  <button 
                    type="button" 
                    onClick={() => setShowCreateEventModal(false)} 
                    className="btn btn-ghost"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Event
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizerDashboard;