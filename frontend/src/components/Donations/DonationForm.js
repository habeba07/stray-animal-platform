import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  Box,
  Divider,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  Chip,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import api from '../../redux/api';

function DonationForm() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [donationType, setDonationType] = useState('one-time'); // 'one-time' or 'recurring'
  
  const [formData, setFormData] = useState({
    amount: '',
    payment_method: 'CREDIT_CARD',
    is_anonymous: false,
    message: '',
    // Recurring donation fields
    frequency: 'MONTHLY',
    end_date: null,
  });

  useEffect(() => {
    fetchCampaign();
  }, [campaignId]);

  const fetchCampaign = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/donation-campaigns/${campaignId}/`);
      setCampaign(response.data);
    } catch (err) {
      setError('Failed to load campaign details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({
      ...prev,
      end_date: date
    }));
  };

  const calculateImpact = () => {
    const amount = parseFloat(formData.amount) || 0;
    if (donationType === 'recurring') {
      const multipliers = {
        'WEEKLY': 52,
        'MONTHLY': 12,
        'QUARTERLY': 4,
        'ANNUALLY': 1
      };
      return amount * multipliers[formData.frequency];
    }
    return amount;
  };

  const getFrequencyDisplay = () => {
    const frequencies = {
      'WEEKLY': 'week',
      'MONTHLY': 'month', 
      'QUARTERLY': '3 months',
      'ANNUALLY': 'year'
    };
    return frequencies[formData.frequency];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (donationType === 'one-time') {
        // One-time donation
        await api.post(`/donation-campaigns/${campaignId}/donate/`, {
          amount: formData.amount,
          payment_method: formData.payment_method,
          is_anonymous: formData.is_anonymous,
          message: formData.message
        });
        setSuccess(true);
        setTimeout(() => {
          navigate('/donations');
        }, 2000);
      } else {
        // Recurring donation
        const recurringData = {
          amount: formData.amount,
          frequency: formData.frequency,
          payment_method: formData.payment_method,
          is_anonymous: formData.is_anonymous,
          message: formData.message,
          campaign: campaignId
        };
        
        // Add end_date if specified
        if (formData.end_date) {
          recurringData.end_date = formData.end_date.toISOString();
        }
        
        await api.post('/recurring-donations/', recurringData);
        setSuccess(true);
        setTimeout(() => {
          navigate('/donations');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to process donation');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Support {campaign?.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {campaign?.description}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {donationType === 'one-time' 
                ? 'Thank you for your donation! Redirecting...'
                : 'Thank you for setting up recurring donations! Redirecting...'
              }
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            {/* Donation Type Selection */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Donation Type
              </Typography>
              <RadioGroup
                value={donationType}
                onChange={(e) => setDonationType(e.target.value)}
                row
              >
                <FormControlLabel 
                  value="one-time" 
                  control={<Radio />} 
                  label="One-time Donation" 
                />
                <FormControlLabel 
                  value="recurring" 
                  control={<Radio />} 
                  label="Recurring Donation" 
                />
              </RadioGroup>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Amount Field */}
            <TextField
              name="amount"
              label={donationType === 'recurring' 
                ? `Amount per ${getFrequencyDisplay()} ($)` 
                : "Amount ($)"
              }
              type="number"
              fullWidth
              required
              value={formData.amount}
              onChange={handleChange}
              sx={{ mb: 2 }}
              inputProps={{ min: "1", step: "0.01" }}
              helperText={donationType === 'recurring' && formData.amount 
                ? `Annual impact: $${calculateImpact().toFixed(2)}`
                : ''
              }
            />

            {/* Recurring Donation Options */}
            {donationType === 'recurring' && (
              <Card sx={{ mb: 3, bgcolor: '#f8f9fa' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    🔄 Recurring Donation Settings
                  </Typography>
                  
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Frequency</InputLabel>
                    <Select
                      name="frequency"
                      value={formData.frequency}
                      onChange={handleChange}
                      label="Frequency"
                    >
                      <MenuItem value="WEEKLY">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          Weekly
                          <Chip label="52x/year" size="small" />
                        </Box>
                      </MenuItem>
                      <MenuItem value="MONTHLY">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          Monthly
                          <Chip label="12x/year" size="small" color="primary" />
                        </Box>
                      </MenuItem>
                      <MenuItem value="QUARTERLY">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          Quarterly
                          <Chip label="4x/year" size="small" />
                        </Box>
                      </MenuItem>
                      <MenuItem value="ANNUALLY">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          Annually
                          <Chip label="1x/year" size="small" />
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>

                  <DatePicker
                    label="End Date (Optional)"
                    value={formData.end_date}
                    onChange={handleDateChange}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        helperText: "Leave blank for ongoing recurring donations"
                      }
                    }}
                    minDate={new Date()}
                  />

                  {formData.amount && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                      <Typography variant="body2" color="primary.contrastText">
                        <strong>💡 Impact Summary:</strong><br />
                        ${formData.amount} every {getFrequencyDisplay()} = ${calculateImpact().toFixed(2)} annually
                        {formData.end_date && ` (until ${formData.end_date.toLocaleDateString()})`}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Payment Method */}
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Payment Method</InputLabel>
              <Select
                name="payment_method"
                value={formData.payment_method}
                onChange={handleChange}
                label="Payment Method"
              >
                <MenuItem value="CREDIT_CARD">Credit Card</MenuItem>
                <MenuItem value="DEBIT_CARD">Debit Card</MenuItem>
                <MenuItem value="PAYPAL">PayPal</MenuItem>
                <MenuItem value="BANK_TRANSFER">Bank Transfer</MenuItem>
              </Select>
            </FormControl>

            {/* Anonymous Option */}
            <FormControlLabel
              control={
                <Checkbox
                  name="is_anonymous"
                  checked={formData.is_anonymous}
                  onChange={handleChange}
                />
              }
              label="Make this donation anonymous"
              sx={{ mb: 2 }}
            />

            {/* Message */}
            <TextField
              name="message"
              label="Message (optional)"
              multiline
              rows={3}
              fullWidth
              value={formData.message}
              onChange={handleChange}
              sx={{ mb: 3 }}
              placeholder={donationType === 'recurring' 
                ? "Share why you want to support this cause regularly..."
                : "Share your message of support..."
              }
            />

            {/* Submit Button */}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={submitting}
              sx={{ py: 1.5 }}
            >
              {submitting ? (
                <CircularProgress size={24} />
              ) : donationType === 'recurring' ? (
                `🔄 Set Up Recurring Donation`
              ) : (
                `💝 Donate Now`
              )}
            </Button>

            {/* Help Text */}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
              {donationType === 'recurring' 
                ? "You can pause, modify, or cancel your recurring donation anytime from your account."
                : "You'll receive an email receipt immediately after your donation."
              }
            </Typography>
          </form>
        </Paper>
      </Container>
    </LocalizationProvider>
  );
}

export default DonationForm;