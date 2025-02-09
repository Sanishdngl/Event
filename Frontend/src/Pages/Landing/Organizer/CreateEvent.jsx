import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../utils/api';
import { getToken } from '../../../utils/auth';
import { Calendar, Clock, MapPin, Tags, Users, AlertCircle } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogAction
} from '../../../Components/ui/dialog';
import websocketManager from '../../../utils/websocketManager';

// Improved helper function to organize categories with recursive support
const organizeCategories = (categories) => {
  // Helper function to recursively find children
  const findChildren = (parentId) => {
    return categories
      .filter(cat => 
        cat.isActive && 
        cat.parentCategory?._id?.toString() === parentId?.toString()
      )
      .map(child => ({
        ...child,
        subCategories: findChildren(child._id)
      }));
  };

  // Start with root categories (those without parents)
  return categories
    .filter(cat => !cat.parentCategory && cat.isActive)
    .map(main => ({
      ...main,
      subCategories: findChildren(main._id)
    }));
};

const CreateEvent = ({ isDarkMode }) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [organizedCategories, setOrganizedCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userData, setUserData] = useState(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [pendingEventDetails, setPendingEventDetails] = useState(null);

  // Improved indentation helper for deeper nesting
  const getIndentationStyle = (level) => {
    return `ml-${Math.min(level * 4, 16)}`; // Cap at ml-16 to prevent excessive indentation
  };
  
  const getPrefix = (level) => {
    if (level === 0) return "";
    const spacing = "  ".repeat(level);
    const symbol = "-".repeat(level) + " ";
    return spacing + symbol;
  };

  // Recursive function to render category options
  const renderCategoryOptions = (category, level = 0) => {
    if (!category.isActive) return null;
    
    return (
      <React.Fragment key={category._id}>
        <option 
          value={category._id}
          className={getIndentationStyle(level)}
        >
          {getPrefix(level)}{category.categoryName}
        </option>
        {category.subCategories?.map(subCat => 
          renderCategoryOptions(subCat, level + 1)
        )}
      </React.Fragment>
    );
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);

        const token = getToken();
        if (!token) {
          throw new Error("No authentication token found");
        }

        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        if (!decodedToken.user?.email) {
          throw new Error("Token does not contain user email");
        }

        const [userResponse, categoryResponse] = await Promise.all([
          api.get(`/users/email/${decodedToken.user.email}`),
          api.get("/categories"),
        ]);

        setUserData(userResponse.data.user);
        setCategories(categoryResponse.data);
        
        // Use the improved organizeCategories function
        const organized = organizeCategories(categoryResponse.data);
        setOrganizedCategories(organized);
      } catch (err) {
        console.error("Error fetching initial data:", err);
        setError("Failed to load initial data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleCreateEvent = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!userData?._id) {
        throw new Error("User data not found. Please try again.");
      }

      const form = event.target;
      const eventDate = new Date(form.event_date.value);
      const registrationDeadline = new Date(form.registrationDeadline.value);
      const currentDate = new Date();
      const categoryId = form.category.value;

      // Comprehensive input validations
      const validations = [
        { condition: !categoryId, message: "Please select a valid category" },
        { condition: registrationDeadline >= eventDate, message: "Registration deadline must be before event date" },
        { condition: eventDate <= currentDate, message: "Event date must be in the future" }
      ];

      const failedValidation = validations.find(val => val.condition);
      if (failedValidation) {
        throw new Error(failedValidation.message);
      }

      // Construct event data object
      const eventData = {
        event_name: form.event_name.value.trim(),
        description: form.description.value.trim(),
        event_date: form.event_date.value,
        registrationDeadline: form.registrationDeadline.value,
        time: form.time.value,
        location: form.location.value.trim(),
        price: Number(form.price.value),
        category: categoryId,
        totalSlots: Number(form.totalSlots.value),
        org_ID: userData._id,
        tags: form.tags.value ? form.tags.value.split(",").map(tag => tag.trim()) : [],
        isPublic: form.isPublic?.checked || false
      };

      const response = await api.safePost("/events/create", eventData);

      if (response.data) {
        const eventId = response.data.event._id;
        
        // Handle image upload if present
        const imageFile = form.eventImage.files[0];
        if (imageFile) {
          await uploadEventImage(eventId, imageFile);
        }

        if (response.data.requiresApproval) {
          await sendAdminNotification(response.data.event);
          setPendingEventDetails(response.data.event);
          setShowApprovalDialog(true);
        } else {
          navigate("/orgdb/my-events");
        }
      }
    } catch (err) {
      const errorMessage = 
        err.response?.data?.error || 
        err.response?.data?.message || 
        err.message || 
        "Failed to create event";

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const uploadEventImage = async (eventId, imageFile) => {
    try {
      const formData = new FormData();
      formData.append("image", imageFile);
      formData.append("eventId", eventId);

      const response = await api.safePost("/events/upload-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        console.log("Image uploaded successfully!");
      } else {
        console.error("Image upload failed:", response.data.message);
      }
    } catch (err) {
      console.error("Error uploading image:", err.message);
      throw new Error("Failed to upload the event image");
    }
  };

  const sendAdminNotification = async (eventDetails) => {
    try {
      if (!eventDetails?._id || !userData?._id) {
        console.error('Missing required IDs:', { event: eventDetails, user: userData });
        return;
      }

      const notificationData = {
        eventId: eventDetails._id,
        message: `New event "${eventDetails.event_name}" requires approval`,
        userId: userData._id,
        type: 'event_request'
      };

      const response = await api.safePost('/notifications/events', notificationData);
      
      if (response.status === 200 || response.status === 201) {
        if (websocketManager && websocketManager.ws?.readyState === WebSocket.OPEN) {
          try {
            await websocketManager.send('notification', {
              type: 'event_request',
              ...notificationData
            });
          } catch (wsError) {
            console.warn('WebSocket notification failed:', wsError);
          }
        }
      }

      return response;
    } catch (err) {
      console.error('Error in sendAdminNotification:', err);
    }
  };

  const handleDialogClose = () => {
    setShowApprovalDialog(false);
    navigate("/orgdb/my-events");
  };

  if (loading && (!categories.length || !userData)) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl overflow-hidden`}>
      <div className="px-6 py-8">
        <form onSubmit={handleCreateEvent} className="space-y-8">
          {error && (
            <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Details Section */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Event Name</label>
                <input
                  name="event_name"
                  type="text"
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-gray-50 border-gray-200'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                  required
                  placeholder="Enter event name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <div className="relative">
                  <select
                    name="category"
                    className={`w-full px-4 py-2 rounded-lg border appearance-none ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-gray-50 border-gray-200'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                    required
                  >
                    <option value="">Select Category</option>
                    {organizedCategories.map(category => renderCategoryOptions(category))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Date and Time Section */}
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Event Date</span>
                    </div>
                  </label>
                  <input
                    name="event_date"
                    type="date"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-gray-50 border-gray-200'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Time</span>
                    </div>
                  </label>
                  <input
                    name="time"
                    type="time"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-gray-50 border-gray-200'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Registration Deadline</label>
                <input
                  name="registrationDeadline"
                  type="date"
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-gray-50 border-gray-200'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                  required
                />
              </div>
            </div>
          </div>

          {/* Location and Details Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>Location</span>
                </div>
              </label>
              <input
                name="location"
                type="text"
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-gray-50 border-gray-200'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                required
                placeholder="Enter venue location"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                <div className="flex items-center gap-2">
                  <Tags className="h-4 w-4" />
                  <span>Tags</span>
                </div>
              </label>
              <input
                name="tags"
                type="text"
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-gray-50 border-gray-200'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                  placeholder="Separate tags with commas"
                />
              </div>
            </div>
  
            {/* Capacity and Price Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Total Slots</span>
                  </div>
                </label>
                <input
                  name="totalSlots"
                  type="number"
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-gray-50 border-gray-200'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                  required
                  min="1"
                  placeholder="Enter capacity"
                />
              </div>
  
              <div>
                <label className="block text-sm font-medium mb-2">
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-4 font-bold">Rs</span>
                    <span>Price</span>
                  </div>
                </label>
                <input
                  name="price"
                  type="number"
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-gray-50 border-gray-200'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                  required
                  min="0"
                  step="0.01"
                  placeholder="Enter price"
                />
              </div>
            </div>
  
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">Event Image</label>
              <input
                name="eventImage"
                type="file"
                accept="image/*"
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              />
            </div>
  
            {/* Description Section */}
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                name="description"
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-gray-50 border-gray-200'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors`}
                rows="4"
                required
                placeholder="Describe your event..."
              />
            </div>
  
            {/* Public/Private Toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isPublic"
                id="isPublic"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isPublic" className="text-sm font-medium">
                Make this event public
              </label>
            </div>
  
            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className={`
                  w-full py-3 px-4 rounded-lg font-medium
                  bg-gradient-to-r from-blue-500 to-blue-600
                  text-white shadow-lg
                  hover:from-blue-600 hover:to-blue-700
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-200
                `}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    <span>Creating Event...</span>
                  </div>
                ) : (
                  'Create Event'
                )}
              </button>
            </div>
          </form>
        </div>
  
        {/* Approval Dialog */}
        <Dialog open={showApprovalDialog} onClose={handleDialogClose}>
          <DialogContent variant="info">
            <DialogTitle>
              Event Submitted Successfully
            </DialogTitle>
            <DialogDescription>
              Your event "{pendingEventDetails?.event_name || 'New Event'}" has been submitted and is awaiting admin approval. 
              You'll be notified once it's approved. You can view the status of your event in the My Events section.
            </DialogDescription>
            <DialogAction onClick={handleDialogClose}>
              Go to My Events
            </DialogAction>
          </DialogContent>
        </Dialog>
      </div>
    );
  };
  
  export default CreateEvent;