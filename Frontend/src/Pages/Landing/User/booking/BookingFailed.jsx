import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../../../components/ui/card';
import api from '../../../../utils/api';

const BookingFailed = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const pidx = searchParams.get('pidx');
  const transactionId = searchParams.get('transaction_id');
  const status = searchParams.get('status');
  const message = searchParams.get('message') || 'Your payment could not be processed.';
  const eventId = searchParams.get('eventId');
  const seats = searchParams.get('seats');
  const amount = searchParams.get('amount');
  const eventName = searchParams.get('eventName');

  const handleRetry = async () => {
    if (!eventId) {
      navigate('/userdb/events');
      return;
    }

    try {
      // Re-fetch event details to ensure availability
      const response = await api.safeGet(`/events/${eventId}`);
      const event = response.data;

      // Check if seats are still available
      const availableSeats = event.totalSlots - (event.attendees?.length || 0);
      
      if (availableSeats < seats) {
        throw new Error('Selected number of seats no longer available');
      }

      // Redirect back to the event booking page
      navigate(`/userdb/events/${eventId}/book`, {
        state: { 
          preselectedSeats: seats 
        }
      });
    } catch (error) {
      console.error('Error retrying booking:', error);
      // If we can't fetch event details, redirect to events listing
      navigate('/userdb/events');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center">
          <div className="text-red-600 mb-6">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Payment Failed</h1>
          <p className="text-gray-600 mb-4">{message}</p>
          
          {eventName && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h2 className="font-medium text-gray-800 mb-2">Booking Details</h2>
              <p className="text-gray-600">Event: {eventName}</p>
              {seats && <p className="text-gray-600">Seats: {seats}</p>}
              {amount && <p className="text-gray-600">Amount: NPR {parseInt(amount).toLocaleString()}</p>}
            </div>
          )}

          <div className="space-y-2 mb-6">
            {status && <p className="text-gray-600">Status: {status}</p>}
            {pidx && <p className="text-gray-600">Payment ID: {pidx}</p>}
            {transactionId && <p className="text-gray-600">Transaction ID: {transactionId}</p>}
          </div>

          <div className="space-x-4">
            <button
              onClick={() => navigate('/userdb/events')}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Browse Events
            </button>
            <button
              onClick={handleRetry}
              className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              Try Again
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingFailed;