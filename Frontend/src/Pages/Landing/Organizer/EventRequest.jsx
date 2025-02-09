import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode"; // Updated import statement

const EventRequest = () => {
  const [eventRequests, setEventRequests] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [proposedBudget, setProposedBudget] = useState({});

  const handleProposedBudgetChange = (eventId, value) => {
    setProposedBudget((prevState) => ({
      ...prevState,
      [eventId]: value,
    }));
  };

  useEffect(() => {
    const fetchEventRequests = async () => {
      setLoading(true);
      try {
        const url = `http://localhost:4001/api/v1/eventrequest/event-requests${
          filter ? `?eventType=${filter}` : ""
        }`;

        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setEventRequests(data);
        } else {
          alert("Failed to fetch event requests. Please try again.");
        }
      } catch (error) {
        alert("Error fetching event requests: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEventRequests();
  }, [filter]);

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
  };

  const handleAccept = async (eventId, proposedBudget) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No token found. Please log in again.");
        return;
      }

      const decodedToken = jwtDecode(token); // Using imported jwtDecode function
      const organizerId = decodedToken.user?.id;

      if (!organizerId) {
        console.error("Organizer ID is not found in the token.");
        alert("Organizer ID is missing. Please log in again.");
        return;
      }

      const response = await fetch(
        `http://localhost:4001/api/v1/eventrequest/event-request/${eventId}/accept`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            organizerId,
            proposedBudget,
          }),
        }
      );

      if (response.ok) {
        setEventRequests((prevRequests) =>
          prevRequests.map((request) =>
            request._id === eventId
              ? {
                  ...request,
                  status: "deal_done",
                  interestedOrganizers: request.interestedOrganizers.map((org) =>
                    org.organizerId === organizerId
                      ? { ...org, status: "accepted", proposedBudget }
                      : org
                  ),
                }
              : request
          )
        );
        alert("Event request accepted successfully");
      } else {
        alert("Error accepting event request");
      }
    } catch (error) {
      console.error("Error accepting event request:", error);
      alert("Error accepting event request");
    }
  };

  const handleReject = async (eventId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("No token found. Please log in again.");
        return;
      }

      const decodedToken = jwtDecode(token); // Using imported jwtDecode function
      const organizerId = decodedToken.user?.id;

      if (!organizerId) {
        console.error("Organizer ID is not found in the token.");
        alert("Organizer ID is missing. Please log in again.");
        return;
      }

      const response = await fetch(
        `http://localhost:4001/api/v1/eventrequest/event-request/${eventId}/reject`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setEventRequests((prevRequests) =>
          prevRequests
            .map((request) =>
              request._id === eventId
                ? {
                    ...request,
                    status: "open",
                    interestedOrganizers: request.interestedOrganizers.map((org) =>
                      org.organizerId === organizerId
                        ? { ...org, status: "rejected" }
                        : org
                    ),
                  }
                : request
            )
            .filter((request) => request._id !== eventId)
        );
        alert("Event request rejected successfully");
      } else {
        alert("Error rejecting event request");
      }
    } catch (error) {
      console.error("Error rejecting event request:", error);
      alert("Error rejecting event request");
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="mb-4 text-xl font-semibold">Event Requests</h2>

      <div className="mb-4">
        <label htmlFor="eventType" className="mr-2">
          Filter by Event Type:
        </label>
        <select
          id="eventType"
          value={filter}
          onChange={handleFilterChange}
          className="px-4 py-2 border rounded"
        >
          <option value="">All</option>
          <option value="Wedding">Wedding</option>
          <option value="Sports">Sports</option>
          <option value="Corporate">Corporate</option>
          <option value="Political">Political</option>
        </select>
      </div>

      {loading ? (
        <p>Loading event requests...</p>
      ) : eventRequests && eventRequests.length > 0 ? (
        <div className="space-y-4">
          {eventRequests.map((request) => (
            <div key={request._id} className="p-4 border rounded-lg">
              <h3 className="font-semibold">{request.eventType}</h3>
              <p>
                <strong>Requested by:</strong>{" "}
                {request.userId?.fullname || "Unknown User"}
              </p>
              <p>
                <strong>Email:</strong> {request.userId?.email || "No email provided"}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {new Date(request.date).toLocaleDateString()}
              </p>
              <p>
                <strong>Venue:</strong> {request.venue}
              </p>
              <p>
                <strong>Budget:</strong> {request.budget}
              </p>

              <div className="mb-4">
                <label htmlFor="proposedBudget" className="mr-2">
                  Proposed Budget (if any):
                </label>
                <input
                  type="number"
                  id={`proposedBudget-${request._id}`}
                  value={proposedBudget[request._id] || ""}
                  onChange={(e) =>
                    handleProposedBudgetChange(request._id, e.target.value)
                  }
                  className="px-4 py-2 border rounded"
                />
              </div>

              <div className="flex justify-between">
                <button
                  className="px-4 py-2 text-white bg-green-500 rounded"
                  onClick={() =>
                    handleAccept(request._id, proposedBudget[request._id] || "")
                  }
                >
                  Accept
                </button>
                <button
                  className="px-4 py-2 text-white bg-red-500 rounded"
                  onClick={() => handleReject(request._id)}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No event requests found.</p>
      )}
    </div>
  );
};

export default EventRequest;