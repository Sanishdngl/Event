import { useState } from 'react';
import api from '../../../utils/api';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';

const EVENT_TYPES = [
  { value: 'Wedding', label: 'Wedding' },
  { value: 'Sports', label: 'Sports' },
  { value: 'Educational', label: 'Educational' },
  { value: 'Political', label: 'Political' },
];

const INITIAL_FORM_STATE = {
  eventType: '',
  venue: '',
  date: '',
  budget: '',
  description: '',
};

const EventRequestForm = () => {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    const { eventType, venue, date, budget, description } = formData;

    if (!eventType) newErrors.eventType = 'Event type is required';
    if (!venue) newErrors.venue = 'Venue is required';
    if (!date) newErrors.date = 'Date is required';
    if (!budget) newErrors.budget = 'Budget is required';
    else if (isNaN(budget) || parseFloat(budget) <= 0) {
      newErrors.budget = 'Please enter a valid budget amount';
    }
    if (!description) newErrors.description = 'Description is required';
    else if (description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field) => (e) => {
    const value = e.target?.value ?? e;
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', content: '' });
  
    if (!validateForm()) {
      setMessage({ type: 'error', content: 'Please fix form errors' });
      return;
    }
  
    const requestData = {
      eventType: formData.eventType,
      venue: formData.venue,
      date: formData.date,
      budget: parseFloat(formData.budget),
      description: formData.description
    };
  
    setLoading(true);
    
    try {
      const response = await api.safePost(
        '/eventrequest', // Updated endpoint
        requestData
      );
  
      if (response.data.success) {
        setMessage({ 
          type: 'success', 
          content: 'Request submitted successfully!' 
        });
        setFormData(INITIAL_FORM_STATE);
      }
    } catch (err) {
      setMessage({
        type: 'error',
        content: err.response?.data?.message || 'Failed to submit request'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Create Event Request
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Select
              value={formData.eventType}
              onValueChange={handleChange('eventType')}
            >
              <SelectTrigger className={errors.eventType ? 'border-red-500' : ''}>
                <SelectValue placeholder="Choose Event Type" />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.eventType && (
              <p className="mt-1 text-sm text-red-500">{errors.eventType}</p>
            )}
          </div>

          <div>
            <Input
              type="text"
              value={formData.venue}
              onChange={handleChange('venue')}
              placeholder="Enter Your Destination"
              className={errors.venue ? 'border-red-500' : ''}
            />
            {errors.venue && (
              <p className="mt-1 text-sm text-red-500">{errors.venue}</p>
            )}
          </div>

          <div>
            <Input
              type="date"
              value={formData.date}
              onChange={handleChange('date')}
              className={errors.date ? 'border-red-500' : ''}
            />
            {errors.date && (
              <p className="mt-1 text-sm text-red-500">{errors.date}</p>
            )}
          </div>

          <div>
            <Input
              type="number"
              value={formData.budget}
              onChange={handleChange('budget')}
              placeholder="Enter budget"
              min="0"
              step="0.01"
              className={errors.budget ? 'border-red-500' : ''}
            />
            {errors.budget && (
              <p className="mt-1 text-sm text-red-500">{errors.budget}</p>
            )}
          </div>

          <div>
            <Textarea
              value={formData.description}
              onChange={handleChange('description')}
              placeholder="Enter event details"
              className={errors.description ? 'border-red-500' : ''}
              rows={4}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-500">{errors.description}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
            variant="default"
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </Button>
        </form>

        {message.content && (
          <Alert
            className={`mt-4 ${
              message.type === 'error' ? 'bg-red-50' : 'bg-green-50'
            }`}
          >
            <AlertDescription>
              {message.content}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default EventRequestForm;