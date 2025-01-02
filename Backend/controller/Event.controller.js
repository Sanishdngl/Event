import Event from "../model/event.schema.js";

// Create a new event
export const createEvent = async (req, res) => {
  try {
    const {
      event_name,
      description,
      event_date,
      registrationDeadline,
      time,
      location,
      price,
      category,
      tags,
      image,
      org_ID,
      totalSlots,
      isPublic,
      status
    } = req.body;

    const newEvent = new Event({
      event_name,
      description,
      event_date,
      registrationDeadline,
      time,
      location,
      price,
      category,
      tags: tags || [],
      image,
      org_ID,
      totalSlots,
      isPublic,
      status: status || 'upcoming'
    });

    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: "Error creating event", 
      error: error.message 
    });
  }
};

// Get all events
export const getEvents = async (req, res) => {
  const { search, location, category } = req.query;

  try {
    // Build query based on parameters
    const query = {};
    if (search) {
      query.$or = [
        { event_name: { $regex: search, $options: "i" }},
        { description: { $regex: search, $options: "i" }}
      ];
    }
    if (location) query.location = { $regex: location, $options: "i" };
    if (category) query.category = category;  // Changed from category_ID to category

    const events = await Event.find(query)
      .populate("org_ID", "username email")  // Changed from host_ID to org_ID
      .sort({ event_date: 1 });  // Sort by upcoming events first

    res.status(200).json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: "Error fetching events", 
      error: error.message 
    });
  }
};

// Get a single event by ID
export const getEventById = async (req, res) => {
  try {
    // Find the event by ID and populate org_ID and attendees
    const event = await Event.findById(req.params.id)
      .populate("org_ID", "username email")  // Ensure org_ID refers to the correct model (e.g., User)
      .populate("attendees", "username email");  // Ensure attendees is correctly populated

    // If no event is found, return 404
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // If event is found, return the event data
    res.status(200).json(event);
  } catch (error) {
    console.error(error);
    // Send a detailed error message
    res.status(500).json({ 
      message: "Error fetching event", 
      error: error.message 
    });
  }
};



export const getEventByIdName = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id, "event_name description event_date location org_ID") // Specify fields to include
      .populate("org_ID", "username email")  // Include organizer's details
      .populate("attendees", "username email");  // Include attendees' details if applicable

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json(event);
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: "Error fetching event", 
      error: error.message 
    });
  }
};

// Update an event
export const updateEvent = async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      updateData,
      { 
        new: true,
        runValidators: true  // This ensures schema validations run on update
      }
    );

    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json(updatedEvent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: "Error updating event", 
      error: error.message 
    });
  }
};

// Delete an event
export const deleteEvent = async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);

    if (!deletedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.status(200).json({ 
      message: "Event deleted successfully",
      deletedEvent 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: "Error deleting event", 
      error: error.message 
    });
  }
};