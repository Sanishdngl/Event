import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Loader2 } from 'lucide-react';
import api from '../utils/api';

const PAYMENT_METHODS = {
  ESEWA: {
    id: 'eSewa',
    label: 'eSewa',
    icon: '💰'
  },
  KHALTI: {
    id: 'Khalti',
    label: 'Khalti',
    icon: '💰'
  }
};

const BookingForm = ({ event, onClose, isDarkMode, onSuccess }) => {
  const [bookingState, setBookingState] = useState({
    seats: 1,
    paymentMethod: '',
    loading: false,
    error: null,
    successMessage: null
  });

  const [timeoutId, setTimeoutId] = useState(null);

  const availableSeats = event.totalSlots - (event.attendees?.length || 0);
  const totalAmount = bookingState.seats * event.price;

  const themeClasses = {
    text: isDarkMode ? 'text-gray-100' : 'text-gray-800',
    textMuted: isDarkMode ? 'text-gray-300' : 'text-gray-600',
    card: isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
    input: isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900',
  };

  useEffect(() => {
    // Cleanup timeout on unmount
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [timeoutId]);

  const validateBooking = () => {
    if (!bookingState.paymentMethod) {
      throw new Error('Please select a payment method');
    }
    if (bookingState.seats < 1 || bookingState.seats > availableSeats) {
      throw new Error(`Please select between 1 and ${availableSeats} seats`);
    }
    if (!event._id) {
      throw new Error('Invalid event selected');
    }
  };

  const handleInputChange = (field, value) => {
    setBookingState(prev => ({
      ...prev,
      [field]: value,
      error: null
    }));
  };

  const handlePayment = async () => {
    try {
      setBookingState(prev => ({ ...prev, loading: true, error: null }));

      validateBooking();
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please login to continue booking');
      }

      const baseUrl = window.location.origin;
      const successUrl = `${baseUrl}/userdb/booking/success`;
      const failureUrl = `${baseUrl}/userdb/booking/failed`;

      const response = await api.safePost('/bookings', {
        eventId: event._id,
        numberOfSeats: bookingState.seats,
        paymentMethod: bookingState.paymentMethod,
        successUrl,
        failureUrl
      });

      if (response.data?.paymentUrl) {
        // Show success message briefly before redirect
        setBookingState(prev => ({
          ...prev,
          successMessage: 'Redirecting to payment gateway...'
        }));

        // Set a small delay before redirect for better UX
        const id = setTimeout(() => {
          window.location.href = response.data.paymentUrl;
        }, 1500);
        setTimeoutId(id);

        if (onSuccess) {
          onSuccess(response.data);
        }
      } else {
        throw new Error('Invalid payment URL received');
      }
    } catch (error) {
      setBookingState(prev => ({
        ...prev,
        error: error.message || 'Payment initiation failed'
      }));
      console.error('Booking error:', error);
    } finally {
      setBookingState(prev => ({ ...prev, loading: false }));
    }
  };

  const isButtonDisabled = 
    bookingState.loading || 
    bookingState.seats < 1 || 
    bookingState.seats > availableSeats || 
    !bookingState.paymentMethod;

  return (
    <Card className={`w-full max-w-md mx-auto shadow-lg ${themeClasses.card}`}>
      <CardHeader className="space-y-1">
        <CardTitle className={`text-2xl font-bold ${themeClasses.text}`}>
          Book Event
        </CardTitle>
        <p className={`${themeClasses.textMuted}`}>
          {event.event_name}
        </p>
      </CardHeader>

      <CardContent className="p-6">
        {bookingState.error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{bookingState.error}</AlertDescription>
          </Alert>
        )}

        {bookingState.successMessage && (
          <Alert className="mb-6 bg-green-50 text-green-700 border-green-200">
            <AlertDescription>{bookingState.successMessage}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="seats" className={themeClasses.text}>
              Number of Seats
            </Label>
            <div className="relative">
              <Input
                id="seats"
                type="number"
                min="1"
                max={availableSeats}
                value={bookingState.seats}
                onChange={(e) => handleInputChange('seats', Math.min(parseInt(e.target.value) || 1, availableSeats))}
                className={themeClasses.input}
                aria-describedby="seats-available"
              />
            </div>
            <p id="seats-available" className={`text-sm ${themeClasses.textMuted}`}>
              Available seats: {availableSeats}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment" className={themeClasses.text}>
              Payment Method
            </Label>
            <Select
              value={bookingState.paymentMethod}
              onValueChange={(value) => handleInputChange('paymentMethod', value)}
            >
              <SelectTrigger className={themeClasses.input}>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(PAYMENT_METHODS).map(method => (
                  <SelectItem key={method.id} value={method.id}>
                    <span className="flex items-center gap-2">
                      {method.icon} {method.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className={themeClasses.text}>
              Total Amount
            </Label>
            <p className="text-2xl font-bold text-purple-600">
              NPR {totalAmount.toLocaleString()}
            </p>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={handlePayment}
              disabled={isButtonDisabled}
              className="flex-1"
              variant="default"
            >
              {bookingState.loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Pay Now'
              )}
            </Button>
            <Button
              onClick={onClose}
              disabled={bookingState.loading}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookingForm;