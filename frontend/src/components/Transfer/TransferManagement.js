// components/TransferManagement.js - Complete Animal Transfer Interface

import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Alert,
  Tabs,
  Tab,
  LinearProgress,
} from '@mui/material';
import {
  SwapHoriz as TransferIcon,
  Schedule as ScheduleIcon,
  CheckCircle as ReadyIcon,
  Group as BulkIcon,
  LocationOn as LocationIcon,
  CalendarToday as DateIcon,
} from '@mui/icons-material';
import api from '../../redux/api';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`transfer-tabpanel-${index}`}
      aria-labelledby={`transfer-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function TransferManagement() {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [animalsReadyForTransfer, setAnimalsReadyForTransfer] = useState([]);
  const [availableShelters, setAvailableShelters] = useState([]);
  const [selectedAnimals, setSelectedAnimals] = useState([]);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [markReadyDialogOpen, setMarkReadyDialogOpen] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [transferForm, setTransferForm] = useState({
    new_shelter_id: '',
    transfer_date: '',
    notes: ''
  });

  const [readyForm, setReadyForm] = useState({
    transfer_date: '',
    notes: ''
  });

  useEffect(() => {
    fetchReadyForTransferAnimals();
    fetchAvailableShelters();
  }, []);

  const fetchReadyForTransferAnimals = async () => {
    try {
      setLoading(true);
      const response = await api.get('/animals/ready_for_transfer/');
      setAnimalsReadyForTransfer(response.data);
    } catch (err) {
      console.error('Error fetching animals ready for transfer:', err);
      setError('Failed to load animals ready for transfer');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableShelters = async () => {
    try {
      const response = await api.get('/animals/available_shelters/');
      setAvailableShelters(response.data);
    } catch (err) {
      console.error('Error fetching available shelters:', err);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSelectAnimal = (animalId) => {
    setSelectedAnimals(prev => 
      prev.includes(animalId) 
        ? prev.filter(id => id !== animalId)
        : [...prev, animalId]
    );
  };

  const handleSelectAll = () => {
    if (selectedAnimals.length === animalsReadyForTransfer.length) {
      setSelectedAnimals([]);
    } else {
      setSelectedAnimals(animalsReadyForTransfer.map(animal => animal.id));
    }
  };

  const handleBulkTransfer = () => {
    if (selectedAnimals.length === 0) {
      setError('Please select animals to transfer');
      return;
    }
    setTransferDialogOpen(true);
  };

  const handleIndividualTransfer = (animal) => {
    setSelectedAnimal(animal);
    setSelectedAnimals([animal.id]);
    setTransferDialogOpen(true);
  };

  const handleMarkReady = (animal) => {
    setSelectedAnimal(animal);
    setMarkReadyDialogOpen(true);
  };

  const executeBulkTransfer = async () => {
    try {
      setLoading(true);
      await api.post('/animals/bulk_transfer/', {
        animal_ids: selectedAnimals,
        new_shelter_id: transferForm.new_shelter_id,
        transfer_date: transferForm.transfer_date,
        notes: transferForm.notes
      });

      setMessage(`Successfully transferred ${selectedAnimals.length} animals`);
      setTransferDialogOpen(false);
      setSelectedAnimals([]);
      setTransferForm({ new_shelter_id: '', transfer_date: '', notes: '' });
      fetchReadyForTransferAnimals();
    } catch (err) {
      console.error('Error transferring animals:', err);
      setError(err.response?.data?.error || 'Failed to transfer animals');
    } finally {
      setLoading(false);
    }
  };

  const executeMarkReady = async () => {
    try {
      setLoading(true);
      await api.post(`/animals/${selectedAnimal.id}/mark_ready_for_transfer/`, {
        transfer_date: readyForm.transfer_date,
        notes: readyForm.notes
      });

      setMessage(`${selectedAnimal.name || 'Animal'} marked as ready for transfer`);
      setMarkReadyDialogOpen(false);
      setReadyForm({ transfer_date: '', notes: '' });
      fetchReadyForTransferAnimals();
    } catch (err) {
      console.error('Error marking animal ready:', err);
      setError(err.response?.data?.error || 'Failed to mark animal as ready');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getShelterName = (shelter) => {
    if (!shelter) return 'Unassigned';
    return `${shelter.first_name} ${shelter.last_name}`.trim() || 
           shelter.organization_name || 
           shelter.username;
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <TransferIcon sx={{ mr: 2, color: '#2196f3' }} />
          Animal Transfer Management
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<BulkIcon />}
          onClick={handleBulkTransfer}
          disabled={selectedAnimals.length === 0}
          sx={{ backgroundColor: '#2196f3' }}
        >
          Bulk Transfer ({selectedAnimals.length})
        </Button>
      </Box>

      {/* Messages */}
      {message && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage('')}>
          {message}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            label={`Ready for Transfer (${animalsReadyForTransfer.length})`}
            icon={<ReadyIcon />}
            iconPosition="start"
          />
          <Tab 
            label="Transfer History"
            icon={<ScheduleIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <TabPanel value={activeTab} index={0}>
        {/* Ready for Transfer Tab */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button 
            variant="outlined" 
            onClick={handleSelectAll}
          >
            {selectedAnimals.length === animalsReadyForTransfer.length ? 'Deselect All' : 'Select All'}
          </Button>
          <Typography variant="body2" color="textSecondary">
            {selectedAnimals.length} of {animalsReadyForTransfer.length} animals selected
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {animalsReadyForTransfer.map((animal) => (
            <Grid item xs={12} md={6} lg={4} key={animal.id}>
              <Card sx={{ 
                border: selectedAnimals.includes(animal.id) ? '2px solid #2196f3' : '1px solid #e0e0e0',
                backgroundColor: selectedAnimals.includes(animal.id) ? '#f3f9ff' : 'white'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Checkbox 
                        checked={selectedAnimals.includes(animal.id)}
                        onChange={() => handleSelectAnimal(animal.id)}
                      />
                      <Typography variant="h6">
                        {animal.name || 'Unnamed'} - {animal.animal_type}
                      </Typography>
                    </Box>
                    <Chip 
                      label="Ready for Transfer" 
                      color="info" 
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Current Shelter:</strong> {getShelterName(animal.current_shelter_details)}
                  </Typography>
                  
                  {animal.transfer_ready_date && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <DateIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                      <strong>Ready Date:</strong> {formatDate(animal.transfer_ready_date)}
                    </Typography>
                  )}

                  {animal.special_instructions && (
                    <Typography variant="body2" sx={{ mb: 2, fontStyle: 'italic' }}>
                      <strong>Instructions:</strong> {animal.special_instructions}
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                      variant="contained" 
                      size="small"
                      startIcon={<TransferIcon />}
                      onClick={() => handleIndividualTransfer(animal)}
                      sx={{ backgroundColor: '#4caf50' }}
                    >
                      Transfer
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {animalsReadyForTransfer.length === 0 && !loading && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="textSecondary">
              No animals are currently ready for transfer
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Animals marked as "Ready for Transfer" will appear here
            </Typography>
          </Paper>
        )}
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        {/* Transfer History Tab */}
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            Transfer History Feature
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Coming soon - View past transfer records and tracking
          </Typography>
        </Paper>
      </TabPanel>

      {/* Transfer Dialog */}
      <Dialog open={transferDialogOpen} onClose={() => setTransferDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Transfer {selectedAnimals.length} Animal{selectedAnimals.length > 1 ? 's' : ''}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Destination Shelter</InputLabel>
                <Select
                  value={transferForm.new_shelter_id}
                  onChange={(e) => setTransferForm({...transferForm, new_shelter_id: e.target.value})}
                  label="Destination Shelter"
                >
                  {availableShelters.map((shelter) => (
                    <MenuItem key={shelter.id} value={shelter.id}>
                      {getShelterName(shelter)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="date"
                label="Transfer Date"
                value={transferForm.transfer_date}
                onChange={(e) => setTransferForm({...transferForm, transfer_date: e.target.value})}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Transfer Notes"
                value={transferForm.notes}
                onChange={(e) => setTransferForm({...transferForm, notes: e.target.value})}
                placeholder="Special instructions, medical notes, behavioral notes..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransferDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={executeBulkTransfer}
            disabled={!transferForm.new_shelter_id || loading}
            sx={{ backgroundColor: '#4caf50' }}
          >
            {loading ? 'Transferring...' : 'Transfer Animals'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Mark Ready Dialog */}
      <Dialog open={markReadyDialogOpen} onClose={() => setMarkReadyDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Mark Animal Ready for Transfer</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                type="date"
                label="Ready Date"
                value={readyForm.transfer_date}
                onChange={(e) => setReadyForm({...readyForm, transfer_date: e.target.value})}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Transfer Instructions"
                value={readyForm.notes}
                onChange={(e) => setReadyForm({...readyForm, notes: e.target.value})}
                placeholder="Special care instructions, medical requirements..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMarkReadyDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={executeMarkReady}
            disabled={loading}
            sx={{ backgroundColor: '#ff9800' }}
          >
            {loading ? 'Marking...' : 'Mark Ready'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default TransferManagement;