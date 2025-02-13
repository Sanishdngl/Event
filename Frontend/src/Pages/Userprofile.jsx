import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from "../Components/ui/card";
import { Button } from "../Components/ui/button";
import { Input } from "../Components/ui/input";
import { Alert, AlertDescription } from "../Components/ui/alert";
import { Avatar, AvatarImage, AvatarFallback } from "../Components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../Components/ui/tabs";
import { Camera, Calendar, MapPin, Clock, Edit2, X } from "lucide-react";

const UserProfile = () => {
  const [userData, setUserData] = useState({
    fullname: '',
    email: '',
    contactNo: '',
    role: '',
    profileImage: null
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  const [bookedEvents, setBookedEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [wishlistEvents, setWishlistEvents] = useState([]);
  const [organizedEvents, setOrganizedEvents] = useState([]);

  useEffect(() => {
    fetchUserData();
    fetchUserEvents();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:4001/api/v1/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserData(response.data.user);
    } catch (error) {
      setMessage({ type: 'error', content: 'Failed to fetch user data' });
    }
  };

  const fetchUserEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:4001/api/v1/users/events', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookedEvents(response.data.booked || []);
      setPastEvents(response.data.past || []);
      setWishlistEvents(response.data.wishlist || []);
      setOrganizedEvents(response.data.organized || []);
    } catch (error) {
      setMessage({ type: 'error', content: 'Failed to fetch events' });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:4001/api/v1/users/upload-profile-image',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setUserData(prev => ({ ...prev, profileImage: response.data.imageUrl }));
      setMessage({ type: 'success', content: 'Profile image updated successfully' });
    } catch (error) {
      setMessage({ type: 'error', content: error.response?.data?.message || 'Failed to upload image' });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.put(
        'http://localhost:4001/api/v1/users/update',
        {
          fullname: userData.fullname,
          contactNo: userData.contactNo,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage({ type: 'success', content: 'Profile updated successfully' });
      setIsEditing(false);
    } catch (error) {
      setMessage({ type: 'error', content: error.response?.data?.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleEventAction = async (eventId, action) => {
    try {
      const token = localStorage.getItem('token');
      switch (action) {
        case 'cancel':
          await axios.delete(`http://localhost:4001/api/v1/bookings/${eventId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setBookedEvents(prev => prev.filter(event => event._id !== eventId));
          break;
        case 'removeWishlist':
          await axios.delete(`http://localhost:4001/api/v1/wishlist/${eventId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setWishlistEvents(prev => prev.filter(event => event._id !== eventId));
          break;
        case 'edit':
          // Navigate to edit event page or open modal
          break;
      }
      setMessage({ type: 'success', content: `Event ${action} successful` });
    } catch (error) {
      setMessage({ type: 'error', content: error.response?.data?.message || `Failed to ${action} event` });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Profile Header Card */}
        <Card className="border-none shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative group">
                <Avatar className="h-32 w-32 ring-4 ring-white shadow-xl">
                  <AvatarImage src={userData.profileImage || "/default-avatar.png"} 
                             className="object-cover" />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {userData.fullname?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <label htmlFor="profile-image" 
                       className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg 
                                cursor-pointer transform transition-transform hover:scale-110">
                  <Camera className="h-5 w-5 text-gray-600" />
                  <input type="file" id="profile-image" className="hidden" 
                         accept="image/*" onChange={handleImageUpload} />
                </label>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent 
                             bg-gradient-to-r from-blue-600 to-purple-600">
                  {userData.fullname}
                </h1>
                <p className="text-gray-600 mt-1">{userData.role}</p>
                <div className="mt-4 flex flex-col md:flex-row gap-4">
                  <Button onClick={() => setIsEditing(!isEditing)}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 
                                   hover:from-blue-700 hover:to-purple-700">
                    {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                  </Button>
                  {userData.role === 'Organizer' && (
                    <Button variant="outline">Create Event</Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Information */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Profile Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Full Name</label>
                  <Input
                    name="fullname"
                    value={userData.fullname}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="border-gray-200 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <Input
                    name="email"
                    value={userData.email}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Contact Number</label>
                  <Input
                    name="contactNo"
                    value={userData.contactNo}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="border-gray-200 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {isEditing && (
                  <Button 
                    onClick={handleProfileUpdate}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 
                             hover:from-blue-700 hover:to-purple-700"
                  >
                    Save Changes
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Events Section */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="booked" className="space-y-4">
              <TabsList className="w-full justify-start bg-white p-1 rounded-lg shadow">
                <TabsTrigger value="booked" className="flex-1">Upcoming</TabsTrigger>
                <TabsTrigger value="wishlist" className="flex-1">Wishlist</TabsTrigger>
                <TabsTrigger value="past" className="flex-1">Past</TabsTrigger>
                {userData.role === 'Organizer' && (
                  <TabsTrigger value="organized" className="flex-1">Organized</TabsTrigger>
                )}
              </TabsList>

              {['booked', 'wishlist', 'past', 'organized'].map(tabValue => (
                <TabsContent key={tabValue} value={tabValue}>
                  <div className="grid gap-4">
                    {(tabValue === 'booked' ? bookedEvents :
                      tabValue === 'wishlist' ? wishlistEvents :
                      tabValue === 'past' ? pastEvents :
                      organizedEvents).map(event => (
                      <EventCard
                        key={event._id}
                        event={event}
                        onAction={id => handleEventAction(id, 
                          tabValue === 'booked' ? 'cancel' :
                          tabValue === 'wishlist' ? 'removeWishlist' :
                          tabValue === 'organized' ? 'edit' : null
                        )}
                        actionLabel={
                          tabValue === 'booked' ? 'Cancel Booking' :
                          tabValue === 'wishlist' ? 'Remove' :
                          tabValue === 'organized' ? 'Edit Event' : null
                        }
                        showAction={tabValue !== 'past'}
                      />
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </div>

        {/* Notification Alert */}
        {message.content && (
          <Alert className={`fixed bottom-4 right-4 max-w-md transform transition-transform
                            ${message.type === 'error' ? 'bg-red-50 border-red-200' : 
                                                       'bg-green-50 border-green-200'}`}>
            <AlertDescription className="flex items-center justify-between">
              <span>{message.content}</span>
              <button onClick={() => setMessage({ type: '', content: '' })}
                      className="ml-4 text-gray-400 hover:text-gray-600">
                <X className="h-4 w-4" />
              </button>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

const EventCard = ({ event, onAction, actionLabel, showAction = true }) => (
  <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
    <CardContent className="p-4">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-900">{event.name}</h3>
          <div className="flex flex-col gap-2 text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{new Date(event.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{event.location}</span>
            </div>
          </div>
        </div>
        {showAction && (
          <div className="flex items-center">
            <Button
              onClick={() => onAction(event._id)}
              variant={actionLabel.toLowerCase().includes('cancel') ? 'destructive' : 'secondary'}
              className="w-full md:w-auto"
            >
              {actionLabel === 'Edit Event' ? <Edit2 className="h-4 w-4 mr-2" /> : null}
              {actionLabel}
            </Button>
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

export default UserProfile;