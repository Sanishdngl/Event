import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../../../components/ui/card';
import api from '../../../../utils/api';
import ReactQR from 'react-qr-code';

const BookingSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const pidx = searchParams.get('pidx');
  const transactionId = searchParams.get('transaction_id');

  const updatePaymentStatus = async (bookingData) => {
    try {
      setUpdatingStatus(true);
      
      // Make API call to update payment status
      const response = await api.safePatch(`/bookings/update-status/${transactionId}`, {
        paymentStatus: 'completed',
        pidx: pidx
      });

      if (response?.data?.success) {
        // Update local state with completed status
        setBookingDetails(prev => ({
          ...prev,
          paymentStatus: 'completed'
        }));
      } else {
        console.error('Failed to update payment status');
      }
    } catch (err) {
      console.error('Error updating payment status:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  useEffect(() => {
    const verifyBooking = async () => {
      try {
        setLoading(true);
        setError(null);
  
        if (!transactionId || !pidx) {
          throw new Error('Missing payment verification details');
        }
  
        const response = await api.safeGet(`/bookings/booking-details/${transactionId}`);
  
        if (!response?.data?.success) {
          throw new Error('Payment verification failed');
        }
  
        // Store the full booking details
        setBookingDetails(response.data);
        setRetryCount(0);

        // update the payment status to completed
        if (response.data.paymentStatus === 'pending') {
          await updatePaymentStatus(response.data);
        }
    
      } catch (err) {
        console.error('Booking verification failed:', {
          error: err,
          errorMessage: err.message,
          errorStatus: err.status,
          transactionId,
          pidx
        });
  
        if (err.status === 404 && retryCount < 3) {
          console.log(`Retry attempt ${retryCount + 1} of 3`);
          setRetryCount(prev => prev + 1);
          setTimeout(() => verifyBooking(), 2000);
          return;
        }
  
        let errorMessage = 'Failed to verify booking';
        
        if (err.status === 404) {
          errorMessage = 'Booking verification is taking longer than expected. Please check your email for confirmation.';
        } else if (err.status === 401) {
          errorMessage = 'Session expired. Please login and check your bookings.';
        } else if (err.message) {
          errorMessage = err.message;
        }
  
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
  
    verifyBooking();
  }, [transactionId, pidx, retryCount]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {retryCount > 0 ? 'Verifying payment status...' : 'Verifying your booking...'}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="text-yellow-600 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-800 mb-4">Verification Status</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-4">
              <button
                onClick={() => navigate('/userdb/events')}
                className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 w-full"
              >
                Return Home
              </button>
              <button
                onClick={() => navigate('/dashboard/bookings')}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 w-full"
              >
                View My Bookings
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!bookingDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h1 className="text-xl font-bold text-gray-800 mb-4">No Booking Found</h1>
            <p className="text-gray-600 mb-6">Your payment may still be processing. Please check your email for confirmation.</p>
            <div className="space-y-4">
              <button
                onClick={() => navigate('/')}
                className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 w-full"
              >
                Return Home
              </button>
              <button
                onClick={() => navigate('/dashboard/bookings')}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 w-full"
              >
                View My Bookings
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { eventName, seatsBooked, totalAmount, userName } = bookingDetails;

  const qrContent = JSON.stringify({
    event: eventName,
    seats: seatsBooked,
    amount: totalAmount,
    user: userName,
    transactionId,
    pidx,
    timestamp: new Date().toISOString()
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="text-green-600 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Booking Confirmed!</h1>
            <p className="text-gray-600">Your booking has been successfully processed.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">Booking Details</h2>
              <div className="space-y-2">
                <p className="text-gray-600">Event: <span className="font-medium text-gray-800">{eventName}</span></p>
                <p className="text-gray-600">Seats: <span className="font-medium text-gray-800">{seatsBooked}</span></p>
                <p className="text-gray-600">Amount: <span className="font-medium text-gray-800">NPR {totalAmount?.toLocaleString()}</span></p>
                <p className="text-gray-600">Booked by: <span className="font-medium text-gray-800">{userName}</span></p>
                <p className="text-gray-600">Transaction ID: <span className="font-medium text-gray-800">{transactionId}</span></p>
                <p className="text-gray-600">Payment ID: <span className="font-medium text-gray-800">{pidx}</span></p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">Entry QR Code</h2>
              <div className="bg-white p-4 rounded-lg shadow-inner">
                <ReactQR
                  value={qrContent}
                  size={200}
                  className="mx-auto"
                  level="H"
                />
              </div>
              <p className="text-sm text-gray-500 text-center">Show this QR code at the event entrance</p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Return to Home
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingSuccess;