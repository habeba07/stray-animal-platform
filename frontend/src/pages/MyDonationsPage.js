import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  LinearProgress,
  Badge,
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  Pause as PauseIcon,
  PlayArrow as ResumeIcon,
  Cancel as CancelIcon,
  Download as DownloadIcon,
  Email as EmailIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Print as PrintIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import api from '../redux/api';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`donations-tabpanel-${index}`}
      aria-labelledby={`donations-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function MyDonationsPage() {
  const { user } = useSelector((state) => state.auth);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Data states
  const [donations, setDonations] = useState([]);
  const [recurringDonations, setRecurringDonations] = useState([]);
  const [personalImpact, setPersonalImpact] = useState({});

  // Dialog states
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: '',
    message: '',
    action: null,
    recurring: null
  });

  // Receipt modal state
  const [receiptModal, setReceiptModal] = useState({
    open: false,
    donation: null,
    loading: false
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [donationsRes, recurringRes, impactRes] = await Promise.all([
        api.get('/donations/my_donations/'),
        api.get('/recurring-donations/my_subscriptions/'),
        api.get('/impact-dashboard/donor_impact/')
      ]);

      setDonations(donationsRes.data);
      setRecurringDonations(recurringRes.data);
      setPersonalImpact(impactRes.data);
    } catch (err) {
      setError('Failed to load donation data');
      console.error('Error fetching donations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleRecurringAction = async (recurring, action) => {
    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      const endpoint = `/recurring-donations/${recurring.id}/${action}/`;
      await api.post(endpoint);
      
      setSuccess(`Recurring donation ${action}d successfully!`);
      await fetchAllData(); // Refresh data
      setConfirmDialog({ ...confirmDialog, open: false });
    } catch (err) {
      setError(err.response?.data?.error || `Failed to ${action} recurring donation`);
    } finally {
      setActionLoading(false);
    }
  };

  const openConfirmDialog = (recurring, action) => {
    const actions = {
      pause: {
        title: 'Pause Recurring Donation',
        message: `Are you sure you want to pause your $${recurring.amount} ${recurring.frequency.toLowerCase()} donation? You can resume it anytime.`
      },
      resume: {
        title: 'Resume Recurring Donation',
        message: `Are you sure you want to resume your $${recurring.amount} ${recurring.frequency.toLowerCase()} donation? The next payment will be scheduled.`
      },
      cancel: {
        title: 'Cancel Recurring Donation',
        message: `Are you sure you want to permanently cancel your $${recurring.amount} ${recurring.frequency.toLowerCase()} donation? This action cannot be undone.`
      }
    };

    setConfirmDialog({
      open: true,
      title: actions[action].title,
      message: actions[action].message,
      action: action,
      recurring: recurring
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    const colors = {
      'ACTIVE': 'success',
      'PAUSED': 'warning',
      'CANCELLED': 'error',
      'EXPIRED': 'default'
    };
    return colors[status] || 'default';
  };

  const getFrequencyColor = (frequency) => {
    const colors = {
      'WEEKLY': 'primary',
      'MONTHLY': 'success',
      'QUARTERLY': 'warning',
      'ANNUALLY': 'info'
    };
    return colors[frequency] || 'default';
  };

  // NEW MODAL RECEIPT FUNCTION
  const viewReceipt = async (donationId) => {
    try {
      setReceiptModal({ open: true, donation: null, loading: true });
      
      // Get donation details for the receipt
      const response = await api.get(`/donations/${donationId}/`);
      const donation = response.data;
      
      setReceiptModal({ 
        open: true, 
        donation: donation, 
        loading: false 
      });
      
    } catch (err) {
      setError('Failed to load receipt');
      setReceiptModal({ open: false, donation: null, loading: false });
    }
  };

  const closeReceiptModal = () => {
    setReceiptModal({ open: false, donation: null, loading: false });
  };

  const printReceipt = () => {
    window.print();
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <MoneyIcon color="primary" />
        My Donations
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Personal Impact Summary */}
      {personalImpact.personal_stats && (
        <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)', color: 'white' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUpIcon />
              Your Impact Summary
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={3}>
                <Box textAlign="center">
                  <Typography variant="h4" fontWeight="bold">
                    {formatCurrency(personalImpact.personal_stats.total_donated)}
                  </Typography>
                  <Typography variant="body2">Total Donated</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box textAlign="center">
                  <Typography variant="h4" fontWeight="bold">
                    {personalImpact.personal_stats.animals_helped}
                  </Typography>
                  <Typography variant="body2">Animals Helped</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box textAlign="center">
                  <Typography variant="h4" fontWeight="bold">
                    {personalImpact.personal_stats.donations_count}
                  </Typography>
                  <Typography variant="body2">Donations Made</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Box textAlign="center">
                  <Typography variant="h4" fontWeight="bold">
                    {personalImpact.personal_stats.donor_level}
                  </Typography>
                  <Typography variant="body2">Donor Level</Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="donation tabs">
          <Tab 
            label={
              <Badge badgeContent={donations.length} color="primary">
                Donation History
              </Badge>
            } 
            icon={<ReceiptIcon />}
          />
          <Tab 
            label={
              <Badge badgeContent={recurringDonations.length} color="secondary">
                Recurring Donations
              </Badge>
            }
            icon={<CalendarIcon />}
          />
        </Tabs>
      </Box>

      {/* Donation History Tab */}
      <TabPanel value={tabValue} index={0}>
        {donations.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <ReceiptIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No donation history yet
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Your donation history will appear here after you make your first donation.
              </Typography>
              <Button variant="contained" href="/donations">
                Make Your First Donation
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {donations.map((donation) => (
              <Grid item xs={12} key={donation.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          {formatCurrency(donation.amount)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {donation.campaign_details?.title || 'General Fund'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(donation.created_at)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip 
                          label={donation.get_payment_method_display || donation.payment_method}
                          size="small"
                          variant="outlined"
                        />
                        <IconButton 
                          size="small" 
                          color="primary"
                          title="View Receipt"
                          onClick={() => viewReceipt(donation.id)}
                        >
                          <ReceiptIcon />
                        </IconButton>
                      </Box>
                    </Box>
                    
                    {donation.message && (
                      <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                        "{donation.message}"
                      </Typography>
                    )}
                    
                    <Typography variant="caption" color="text.secondary">
                      Transaction ID: {donation.transaction_id}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* Recurring Donations Tab */}
      <TabPanel value={tabValue} index={1}>
        {recurringDonations.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <CalendarIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No recurring donations set up
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Set up a recurring donation to provide ongoing support for animals in need.
              </Typography>
              <Button variant="contained" href="/donations">
                Set Up Recurring Donation
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={2}>
            {recurringDonations.map((recurring) => (
              <Grid item xs={12} md={6} key={recurring.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          {formatCurrency(recurring.amount)}
                          <Chip 
                            label={recurring.frequency}
                            size="small"
                            color={getFrequencyColor(recurring.frequency)}
                            sx={{ ml: 1 }}
                          />
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {recurring.campaign_details?.title || 'General Fund'}
                        </Typography>
                      </Box>
                      <Chip 
                        label={recurring.status}
                        color={getStatusColor(recurring.status)}
                        size="small"
                      />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Next Payment:</strong> {formatDate(recurring.next_payment_date)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        <strong>Total Donated:</strong> {formatCurrency(recurring.total_donated)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Payments Made:</strong> {recurring.successful_payments}
                      </Typography>
                    </Box>

                    {recurring.message && (
                      <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary', mb: 2 }}>
                        "{recurring.message}"
                      </Typography>
                    )}

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {recurring.status === 'ACTIVE' && (
                        <Button
                          size="small"
                          startIcon={<PauseIcon />}
                          onClick={() => openConfirmDialog(recurring, 'pause')}
                          disabled={actionLoading}
                        >
                          Pause
                        </Button>
                      )}
                      
                      {recurring.status === 'PAUSED' && (
                        <Button
                          size="small"
                          startIcon={<ResumeIcon />}
                          color="success"
                          onClick={() => openConfirmDialog(recurring, 'resume')}
                          disabled={actionLoading}
                        >
                          Resume
                        </Button>
                      )}
                      
                      {(recurring.status === 'ACTIVE' || recurring.status === 'PAUSED') && (
                        <Button
                          size="small"
                          startIcon={<CancelIcon />}
                          color="error"
                          onClick={() => openConfirmDialog(recurring, 'cancel')}
                          disabled={actionLoading}
                        >
                          Cancel
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* Receipt Modal */}
      <Dialog
        open={receiptModal.open}
        onClose={closeReceiptModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { minHeight: '80vh' }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Donation Receipt</Typography>
          <Box>
            <IconButton 
              onClick={printReceipt} 
              title="Print Receipt"
              sx={{ mr: 1 }}
            >
              <PrintIcon />
            </IconButton>
            <IconButton 
              onClick={closeReceiptModal}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {receiptModal.loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : receiptModal.donation ? (
            <Box sx={{ p: 2 }}>
              {/* Receipt Content */}
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h4" color="primary" gutterBottom>
                  PAW Rescue
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  Donation Receipt
                </Typography>
              </Box>
              
              <Box sx={{ 
                backgroundColor: 'primary.main', 
                color: 'white', 
                p: 3, 
                borderRadius: 2, 
                mb: 3,
                textAlign: 'center'
              }}>
                <Typography variant="h5">
                  Thank You for Your Generous Donation!
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  Your support helps save animal lives
                </Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Donation Amount:
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {formatCurrency(receiptModal.donation.amount)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Date:
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(receiptModal.donation.created_at)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Campaign:
                  </Typography>
                  <Typography variant="body1">
                    {receiptModal.donation.campaign_details?.title || 'General Fund'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Transaction ID:
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                    {receiptModal.donation.transaction_id}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Payment Method:
                  </Typography>
                  <Typography variant="body1">
                    {receiptModal.donation.payment_method}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Donor:
                  </Typography>
                  <Typography variant="body1">
                    {receiptModal.donation.is_anonymous ? 'Anonymous' : receiptModal.donation.donor_name}
                  </Typography>
                </Grid>
              </Grid>
              
              {receiptModal.donation.message && (
                <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.100', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Message:
                  </Typography>
                  <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                    "{receiptModal.donation.message}"
                  </Typography>
                </Box>
              )}
              
              <Box sx={{ mt: 4, p: 2, border: '1px dashed #ccc', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  This receipt serves as confirmation of your donation for tax purposes. 
                  PAW Rescue is a registered non-profit organization. Please keep this 
                  receipt for your records.
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Questions? Contact us at support@pawrescue.com
                </Typography>
              </Box>
            </Box>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{confirmDialog.message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setConfirmDialog({ ...confirmDialog, open: false })}
            disabled={actionLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => handleRecurringAction(confirmDialog.recurring, confirmDialog.action)}
            color={confirmDialog.action === 'cancel' ? 'error' : 'primary'}
            disabled={actionLoading}
            startIcon={actionLoading && <CircularProgress size={16} />}
          >
            {confirmDialog.action === 'cancel' ? 'Permanently Cancel' : 
             confirmDialog.action === 'pause' ? 'Pause' : 'Resume'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default MyDonationsPage;