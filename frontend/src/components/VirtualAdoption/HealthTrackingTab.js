import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VaccinesIcon from '@mui/icons-material/Vaccines';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import api from '../../redux/api';
import VaccinationForm from './VaccinationForm';
import MedicalRecordForm from './MedicalRecordForm';
import HealthStatusForm from './HealthStatusForm';

function HealthTrackingTab({ animalId }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [healthData, setHealthData] = useState(null);
  const [vaccinations, setVaccinations] = useState([]);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [healthStatus, setHealthStatus] = useState(null);
  
  // Form dialog states
  const [vaccinationFormOpen, setVaccinationFormOpen] = useState(false);
  const [medicalFormOpen, setMedicalFormOpen] = useState(false);
  const [healthStatusFormOpen, setHealthStatusFormOpen] = useState(false);

  useEffect(() => {
    fetchHealthData();
  }, [animalId]);

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      
      // Fetch all health data
      const [vaccinationsRes, medicalRecordsRes, healthStatusRes] = await Promise.all([
        api.get(`/vaccinations/?animal=${animalId}`),
        api.get(`/medical-records/?animal=${animalId}`),
        api.get(`/health-status/by_animal/?animal=${animalId}`).catch(() => ({ data: null }))
      ]);
      
      setVaccinations(vaccinationsRes.data);
      setMedicalRecords(medicalRecordsRes.data);
      setHealthStatus(healthStatusRes.data);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching health data:', err);
      setError('Failed to load health data');
      setLoading(false);
    }
  };

  const handleAddVaccination = async (data) => {
    try {
      await api.post('/vaccinations/', data);
      fetchHealthData();
      setVaccinationFormOpen(false);
    } catch (err) {
      console.error('Error adding vaccination:', err);
      setError('Failed to add vaccination record');
    }
  };

  const handleAddMedicalRecord = async (data) => {
    try {
      await api.post('/medical-records/', data);
      fetchHealthData();
      setMedicalFormOpen(false);
    } catch (err) {
      console.error('Error adding medical record:', err);
      setError('Failed to add medical record');
    }
  };

  const handleUpdateHealthStatus = async (data) => {
    try {
      if (healthStatus?.id) {
        await api.patch(`/health-status/${healthStatus.id}/`, data);
      } else {
        await api.post('/health-status/', data);
      }
      fetchHealthData();
      setHealthStatusFormOpen(false);
    } catch (err) {
      console.error('Error updating health status:', err);
      setError('Failed to update health status');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'HEALTHY':
        return 'success';
      case 'SICK':
        return 'error';
      case 'INJURED':
        return 'warning';
      case 'RECOVERING':
        return 'info';
      case 'CRITICAL':
        return 'error';
      case 'QUARANTINE':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Health Status Card */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                  <MonitorHeartIcon sx={{ mr: 1 }} />
                  Health Status
                </Typography>
                <Button
                  startIcon={healthStatus ? <EditIcon /> : <AddIcon />}
                  onClick={() => setHealthStatusFormOpen(true)}
                >
                  {healthStatus ? 'Update Status' : 'Add Status'}
                </Button>
              </Box>
              
              {healthStatus ? (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Current Status
                    </Typography>
                    <Chip
                      label={healthStatus.current_status}
                      color={getStatusColor(healthStatus.current_status)}
                      sx={{ mt: 1 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Weight
                    </Typography>
                    <Typography variant="body1">
                      {healthStatus.weight ? `${healthStatus.weight} kg` : 'Not recorded'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Temperature
                    </Typography>
                    <Typography variant="body1">
                      {healthStatus.temperature ? `${healthStatus.temperature}°C` : 'Not recorded'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Next Checkup
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(healthStatus.next_checkup_date)}
                    </Typography>
                  </Grid>
                  {healthStatus.notes && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Notes
                      </Typography>
                      <Typography variant="body1">
                        {healthStatus.notes}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              ) : (
                <Typography color="text.secondary">
                  No health status recorded yet
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Vaccinations Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                <VaccinesIcon sx={{ mr: 1 }} />
                Vaccinations
              </Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={() => setVaccinationFormOpen(true)}
              >
                Add Vaccination
              </Button>
            </Box>
            
            {vaccinations.length > 0 ? (
              <List>
                {vaccinations.map((vaccination) => (
                  <React.Fragment key={vaccination.id}>
                    <ListItem>
                      <ListItemText
                        primary={vaccination.vaccine_type}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary">
                              {formatDate(vaccination.date_administered)}
                            </Typography>
                            {' — '}
                            {vaccination.veterinarian} at {vaccination.clinic_name || 'Unknown clinic'}
                            {vaccination.next_due_date && (
                              <>
                                <br />
                                Next due: {formatDate(vaccination.next_due_date)}
                              </>
                            )}
                          </>
                        }
                      />
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                No vaccination records
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* Medical Records Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                <LocalHospitalIcon sx={{ mr: 1 }} />
                Medical Records
              </Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={() => setMedicalFormOpen(true)}
              >
                Add Record
              </Button>
            </Box>
            
            {medicalRecords.length > 0 ? (
              <List>
                {medicalRecords.map((record) => (
                  <React.Fragment key={record.id}>
                    <ListItem>
                      <ListItemText
                        primary={record.reason}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary">
                              {record.record_type} - {formatDate(record.date)}
                            </Typography>
                            {' — '}
                            {record.veterinarian} at {record.clinic_name || 'Unknown clinic'}
                            {record.diagnosis && (
                              <>
                                <br />
                                Diagnosis: {record.diagnosis}
                              </>
                            )}
                          </>
                        }
                      />
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                No medical records
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Forms */}
      <VaccinationForm
        open={vaccinationFormOpen}
        onClose={() => setVaccinationFormOpen(false)}
        onSubmit={handleAddVaccination}
        animalId={animalId}
      />
      
      <MedicalRecordForm
        open={medicalFormOpen}
        onClose={() => setMedicalFormOpen(false)}
        onSubmit={handleAddMedicalRecord}
        animalId={animalId}
      />
      
      <HealthStatusForm
        open={healthStatusFormOpen}
        onClose={() => setHealthStatusFormOpen(false)}
        onSubmit={handleUpdateHealthStatus}
        animalId={animalId}
        currentStatus={healthStatus}
      />
    </Box>
  );
}

export default HealthTrackingTab;