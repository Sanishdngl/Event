import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../utils/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '../../../components/ui/alert';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  CalendarIcon, 
  UserIcon, 
  DollarSignIcon,
  AlertCircle,
  Loader2,
  Calendar,
  ArrowRight
} from 'lucide-react';

const UserBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.safeGet('/bookings/MyEvents');
        
        if (!mounted) return;

        if (response.data?.bookedEvents) {
          setBookings(response.data.bookedEvents);
        } else {
          setError('No booking data available');
        }
      } catch (err) {
        if (!mounted) return;
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchBookings();
    
    return () => {
      mounted = false;
    };
  }, []);

  const renderPaymentStatus = (status) => {
    const statusConfig = {
      completed: { icon: CheckCircleIcon, color: 'text-green-600', text: 'Paid' },
      pending: { icon: AlertCircle, color: 'text-yellow-600', text: 'Pending' },
      failed: { icon: XCircleIcon, color: 'text-red-600', text: 'Failed' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const StatusIcon = config.icon;

    return (
      <div className={`flex items-center ${config.color}`}>
        <StatusIcon className="mr-2 h-5 w-5" />
        {config.text}
      </div>
    );
  };

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <Calendar className="h-16 w-16 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">No Bookings Found</h3>
      <p className="text-gray-500 mb-6 max-w-md">
        You haven't made any bookings yet. Explore our events and find something exciting to attend!
      </p>
      <Button 
        onClick={() => navigate('/userdb/events')}
        className="flex items-center space-x-2"
      >
        <span>Browse Events</span>
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-muted-foreground">Loading your bookings...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">My Bookings</h1>
      
      {error && error !== 'No bookings found' ? (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      
      {bookings.length > 0 ? (
        <>
          {bookings.map((booking) => (
            <Card key={booking.bookingId} className="mb-4">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{booking.event.event_name}</span>
                  {renderPaymentStatus(booking.event.payment?.status || 'pending')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <CalendarIcon className="mr-2 text-blue-500 h-5 w-5" />
                    <span>Seats Booked: {booking.numberOfSeats}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <DollarSignIcon className="mr-2 text-green-500 h-5 w-5" />
                    <span>Total Amount: NPR {booking.totalAmount}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <UserIcon className="mr-2 text-purple-500 h-5 w-5" />
                    <span>Organizer: {booking.event.org_ID.fullname}</span>
                  </div>
                  
                  <div>
                    <span className="font-medium">
                      Payment Method: {booking.paymentMethod || 'Not specified'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </>
      ) : (
        renderEmptyState()
      )}
    </div>
  );
};

export default UserBookings;