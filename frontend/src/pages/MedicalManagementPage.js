// pages/MedicalManagementPage.js - NEW PAGE for SHELTER users

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Box,
  CircularProgress,
  Alert,
  Button,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Tooltip,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  MedicalServices as MedicalIcon,
  Emergency as EmergencyIcon,
  LocalHospital as HospitalIcon,
  Vaccines as VaccinesIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Print as PrintIcon,
  Inventory as InventoryIcon,
  Lock as QuarantinedIcon, 
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import api from '../redux/api';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`medical-tabpanel-${index}`}
      aria-labelledby={`medical-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function MedicalManagementPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useSelector((state) => state.auth);
  
  // States
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [medicalData, setMedicalData] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState(null);


  const [treatmentForm, setTreatmentForm] = useState({
  treatmentType: '',
  treatmentNotes: '',
  veterinarian: '',
  newStatus: ''
});

  // Check authorization
  useEffect(() => {
    if (!user || !['STAFF', 'SHELTER'].includes(user.user_type)) {
      navigate('/');
      return;
    }

    // Check if we should focus on a specific animal from URL params
    const animalId = searchParams.get('animal');
    if (animalId) {
      setSelectedAnimal(animalId);
      setActiveTab(1); // Switch to urgent care tab
    }

    fetchMedicalData();
  }, [user, navigate, searchParams]);

  const fetchMedicalData = async () => {
    try {
      setLoading(true);
      
      // Fetch medical dashboard data
      const [urgentAnimalsRes, vaccinationsRes, treatmentsRes, inventoryRes] = await Promise.all([
        api.get('/animals/?status=URGENT_MEDICAL,UNDER_TREATMENT,QUARANTINE'),
        api.get('/vaccinations/'),
        api.get('/medical-records/'),
        api.get('/inventory-items/?category=medical').catch(() => ({ data: [] }))
      ]);

      // Process the data
      const urgentAnimals = urgentAnimalsRes.data.filter(animal => 
        ['URGENT_MEDICAL', 'UNDER_TREATMENT', 'QUARANTINE'].includes(animal.status) ||
        animal.priority_level === 'EMERGENCY'
      );

      const upcomingVaccinations = vaccinationsRes.data.filter(vacc => {
        if (!vacc.next_due_date) return false;
        const dueDate = new Date(vacc.next_due_date);
        const today = new Date();
        const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
        return diffDays <= 30 && diffDays >= 0;
      });

      const recentTreatments = treatmentsRes.data
        .filter(treatment => {
          const treatmentDate = new Date(treatment.date);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return treatmentDate >= weekAgo;
        })
        .slice(0, 10);

      setMedicalData({
        urgentAnimals,
        upcomingVaccinations,
        recentTreatments,
        medicalInventory: inventoryRes.data,
        stats: {
          urgentCases: urgentAnimals.filter(a => a.status === 'URGENT_MEDICAL' || a.priority_level === 'EMERGENCY').length,
          inTreatment: urgentAnimals.filter(a => a.status === 'UNDER_TREATMENT').length,
          inQuarantine: urgentAnimals.filter(a => a.status === 'QUARANTINE').length,
          vaccinationsDue: upcomingVaccinations.length,
          lowStockItems: inventoryRes.data.filter(item => item.quantity <= item.reorder_level).length
        }
      });

    } catch (err) {
      console.error('Error fetching medical data:', err);
      setError('Failed to load medical data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getUrgencyColor = (level) => {
    switch (level) {
      case 'EMERGENCY': return 'error';
      case 'HIGH': return 'warning';
      case 'NORMAL': return 'info';
      default: return 'default';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'EMERGENCY': return <EmergencyIcon color="error" />;
      case 'HIGH': return <WarningIcon color="warning" />;
      default: return <CheckCircleIcon color="success" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleQuickTreatment = (animal) => {
    setSelectedAnimal(animal);
    setDialogOpen(true);
  };

  const handleSaveEmergencyTreatment = async () => {
    console.log("🚨 Emergency treatment save clicked!");
    console.log("Form data:", treatmentForm);
  
    try {
      // Create medical record
      await api.post('/medical-records/', {
        animal: selectedAnimal.id,
        reason: treatmentForm.treatmentNotes,
        veterinarian: treatmentForm.veterinarian,
        record_type: treatmentForm.treatmentType.toUpperCase() || 'EMERGENCY',
        date: new Date().toISOString().split('T')[0],
        diagnosis: '',
  	treatment: treatmentForm.treatmentNotes,
 	medications: '',
        clinic_name: '',
  	follow_up_required: false,
  	follow_up_date: null
      });
    
      // Update animal status
      await api.patch(`/animals/${selectedAnimal.id}/`, {
        status: treatmentForm.newStatus,
        priority_level: 'NORMAL' 
      });
    
      // Refresh data and close dialog
      await fetchMedicalData();
      setDialogOpen(false);
      setTreatmentForm({ treatmentType: '', treatmentNotes: '', veterinarian: '', newStatus: '' });
    
    } catch (error) {
      console.error("Emergency treatment save error:", error);
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!medicalData) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'Failed to load medical data'}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <MedicalIcon sx={{ mr: 2, color: '#4caf50' }} />
          Medical Management Center
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => navigate('/animals?filter=medical')}
          sx={{ backgroundColor: '#4caf50' }}
        >
          Add Medical Record
        </Button>
      </Box>

      {/* Emergency Alert Banner */}
      {medicalData.stats.urgentCases > 0 && (
        <Alert 
          severity="error" 
          sx={{ mb: 3, backgroundColor: '#ffebee' }}
          icon={<EmergencyIcon />}
          action={
            <Button color="inherit" size="small" onClick={() => setActiveTab(1)}>
              VIEW URGENT CASES
            </Button>
          }
        >
          <Typography variant="h6" gutterBottom>
            🚨 {medicalData.stats.urgentCases} animals require immediate medical attention
          </Typography>
        </Alert>
      )}

      {/* Quick Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ 
            backgroundColor: '#ffebee', 
            border: medicalData.stats.urgentCases > 0 ? '2px solid #f44336' : 'none',
            cursor: 'pointer'
          }}
          onClick={() => setActiveTab(1)}
          >
            <CardContent sx={{ textAlign: 'center' }}>
              <EmergencyIcon sx={{ fontSize: 40, color: '#f44336', mb: 1 }} />
              <Typography variant="h4" color="error.main">
                {medicalData.stats.urgentCases}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Emergency Cases
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ backgroundColor: '#fff3e0', cursor: 'pointer' }} onClick={() => setActiveTab(2)}>
            <CardContent sx={{ textAlign: 'center' }}>
              <HospitalIcon sx={{ fontSize: 40, color: '#ff9800', mb: 1 }} />
              <Typography variant="h4" color="warning.main">
                {medicalData.stats.inTreatment}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                In Treatment
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ backgroundColor: '#f3e5f5', cursor: 'pointer' }} onClick={() => setActiveTab(3)}>
            <CardContent sx={{ textAlign: 'center' }}>
              <QuarantinedIcon sx={{ fontSize: 40, color: '#9c27b0', mb: 1 }} />
              <Typography variant="h4" color="secondary.main">
                {medicalData.stats.inQuarantine}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                In Quarantine
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ backgroundColor: '#e8f5e8', cursor: 'pointer' }} onClick={() => setActiveTab(4)}>
            <CardContent sx={{ textAlign: 'center' }}>
              <VaccinesIcon sx={{ fontSize: 40, color: '#4caf50', mb: 1 }} />
              <Typography variant="h4" color="success.main">
                {medicalData.stats.vaccinationsDue}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Vaccinations Due
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ backgroundColor: '#e3f2fd', cursor: 'pointer' }} onClick={() => setActiveTab(5)}>
            <CardContent sx={{ textAlign: 'center' }}>
              <InventoryIcon sx={{ fontSize: 40, color: '#2196f3', mb: 1 }} />
              <Typography variant="h4" color="primary.main">
                {medicalData.stats.lowStockItems}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Low Stock Alerts
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Navigation Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="📋 Overview" />
          <Tab 
            label={
              <Badge badgeContent={medicalData.stats.urgentCases} color="error">
                🚨 Emergency Cases
              </Badge>
            } 
          />
          <Tab label="🏥 Treatments" />
          <Tab label="🔒 Quarantine" />
          <Tab label="💉 Vaccinations" />
          <Tab label="📦 Medical Inventory" />
          <Tab label="📊 Reports & Analytics" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <TabPanel value={activeTab} index={0}>
        {/* Overview Tab */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <ScheduleIcon sx={{ mr: 1 }} />
                Today's Medical Schedule
              </Typography>
              <List>
                {medicalData.upcomingVaccinations.slice(0, 5).map((vaccination, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={`${vaccination.animal?.name || 'Unnamed'} - ${vaccination.vaccine_type}`}
                      secondary={`Due: ${formatDate(vaccination.next_due_date)}`}
                    />
                    <ListItemSecondaryAction>
                      <Chip label="Vaccination" color="success" size="small" />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <TimelineIcon sx={{ mr: 1 }} />
                Recent Medical Activities
              </Typography>
              <List>
                {medicalData.recentTreatments.slice(0, 5).map((treatment, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={`${treatment.animal?.name || 'Unnamed'} - ${treatment.reason}`}
                      secondary={`${formatDate(treatment.date)} by ${treatment.veterinarian}`}
                    />
                    <ListItemSecondaryAction>
                      <Chip label={treatment.record_type} color="info" size="small" />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        {/* Emergency Cases Tab */}
        <Typography variant="h5" gutterBottom color="error.main" sx={{ display: 'flex', alignItems: 'center' }}>
          <EmergencyIcon sx={{ mr: 1 }} />
          Emergency Medical Cases
        </Typography>
        
        {medicalData.urgentAnimals.filter(animal => 
          animal.status === 'URGENT_MEDICAL' || animal.priority_level === 'EMERGENCY'
        ).length === 0 ? (
          <Alert severity="success" sx={{ mt: 2 }}>
            No emergency cases at this time. All animals are stable.
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {medicalData.urgentAnimals
              .filter(animal => animal.status === 'URGENT_MEDICAL' || animal.priority_level === 'EMERGENCY')
              .map((animal) => (
                <Grid item xs={12} md={6} key={animal.id}>
                  <Card sx={{ 
                    border: '2px solid #f44336',
                    backgroundColor: '#ffebee'
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" color="error.main">
                          {animal.name || 'Unnamed'} - {animal.animal_type}
                        </Typography>
                        <Chip 
                          label={animal.priority_level || 'URGENT'} 
                          color="error" 
                          icon={<EmergencyIcon />}
                        />
                      </Box>
                      
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Status:</strong> {animal.status}
                      </Typography>
                      
                      {animal.health_status && (
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          <strong>Condition:</strong> {animal.health_status}
                        </Typography>
                      )}

                      {animal.special_instructions && (
                        <Alert severity="warning" sx={{ mb: 2, fontSize: '0.85rem' }}>
                          <strong>Special Instructions:</strong> {animal.special_instructions}
                        </Alert>
                      )}

                      <Stack direction="row" spacing={1}>
                        <Button 
                          variant="contained" 
                          color="error" 
                          size="small"
                          startIcon={<MedicalIcon />}
                          onClick={() => handleQuickTreatment(animal)}
                        >
                          Start Treatment
                        </Button>
                        <Button 
                          variant="outlined" 
                          size="small"
                          startIcon={<ViewIcon />}
                          onClick={() => navigate(`/animals/${animal.id}?tab=health`)}
                        >
                          View Details
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
          </Grid>
        )}
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        {/* Treatments Tab */}
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <HospitalIcon sx={{ mr: 1 }} />
          Animals Under Treatment
        </Typography>
        
        <Grid container spacing={3}>
          {medicalData.urgentAnimals
            .filter(animal => animal.status === 'UNDER_TREATMENT')
            .map((animal) => (
              <Grid item xs={12} md={6} key={animal.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {animal.name || 'Unnamed'} - {animal.animal_type}
                    </Typography>
                    
                    <Chip 
                      label="Under Treatment" 
                      color="warning" 
                      sx={{ mb: 2 }}
                    />
                    
                    {animal.health_status && (
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        <strong>Treatment for:</strong> {animal.health_status}
                      </Typography>
                    )}

                    <Stack direction="row" spacing={1}>
                      <Button 
                        variant="contained" 
                        size="small"
                        startIcon={<AssignmentIcon />}
                        onClick={() => navigate(`/animals/${animal.id}?tab=health`)}
                      >
                        Update Treatment
                      </Button>
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => navigate(`/animals/${animal.id}`)}
                      >
                        View Profile
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        {/* Quarantine Tab */}
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <QuarantinedIcon sx={{ mr: 1 }} />
          Quarantine Management
        </Typography>
        
        <Grid container spacing={3}>
          {medicalData.urgentAnimals
            .filter(animal => animal.status === 'QUARANTINE')
            .map((animal) => (
              <Grid item xs={12} md={6} key={animal.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {animal.name || 'Unnamed'} - {animal.animal_type}
                    </Typography>
                    
                    <Chip 
                      label="In Quarantine" 
                      color="secondary" 
                      sx={{ mb: 2 }}
                    />
                    
                    {animal.quarantine_end_date && (
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        <strong>Quarantine ends:</strong> {formatDate(animal.quarantine_end_date)}
                      </Typography>
                    )}

                    <Stack direction="row" spacing={1}>
                      <Button 
                        variant="contained" 
                        size="small"
                        onClick={() => navigate(`/animals/${animal.id}?tab=health`)}
                      >
                        Update Status
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={4}>
        {/* Vaccinations Tab */}
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <VaccinesIcon sx={{ mr: 1 }} />
          Vaccination Schedule
        </Typography>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Animal</TableCell>
                <TableCell>Vaccine Type</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Days Until Due</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {medicalData.upcomingVaccinations.map((vaccination, index) => {
                const dueDate = new Date(vaccination.next_due_date);
                const today = new Date();
                const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
                
                return (
                  <TableRow key={index}>
                    <TableCell>{vaccination.animal?.name || 'Unnamed'}</TableCell>
                    <TableCell>{vaccination.vaccine_type}</TableCell>
                    <TableCell>{formatDate(vaccination.next_due_date)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={`${daysUntilDue} days`}
                        color={daysUntilDue <= 7 ? 'error' : daysUntilDue <= 14 ? 'warning' : 'success'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => navigate(`/animals/${vaccination.animal}?tab=health`)}
                      >
                        Schedule
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      <TabPanel value={activeTab} index={5}>
        {/* Medical Inventory Tab */}
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <InventoryIcon sx={{ mr: 1 }} />
          Medical Inventory Status
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Button 
              variant="contained" 
              onClick={() => navigate('/inventory/dashboard')}
              sx={{ mb: 2 }}
            >
              View Full Inventory System
            </Button>
          </Grid>
          
          {medicalData.medicalInventory.slice(0, 6).map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{
                backgroundColor: item.quantity <= item.reorder_level ? '#ffebee' : '#fff8e1'
              }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {item.name}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Current Stock:</strong> {item.quantity} {item.unit}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    <strong>Reorder Level:</strong> {item.reorder_level} {item.unit}
                  </Typography>
                  
                  <LinearProgress 
                    variant="determinate" 
                    value={(item.quantity / (item.reorder_level * 2)) * 100}
                    color={item.quantity <= item.reorder_level ? 'error' : 'success'}
                    sx={{ mb: 2 }}
                  />
                  
                  {item.quantity <= item.reorder_level && (
                    <Chip label="LOW STOCK" color="error" size="small" />
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={6}>
        {/* Reports & Analytics Tab */}
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <AssignmentIcon sx={{ mr: 1 }} />
          Medical Reports & Analytics
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Medical Activity Summary</Typography>
              <Typography>Total Emergency Cases This Month: {medicalData.stats.urgentCases}</Typography>
              <Typography>Animals Currently in Treatment: {medicalData.stats.inTreatment}</Typography>
              <Typography>Successful Treatments: 85%</Typography>
              <Typography>Average Treatment Duration: 7 days</Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Quick Actions</Typography>
              <Stack spacing={2}>
                <Button variant="outlined" startIcon={<PrintIcon />}>
                  Generate Medical Report
                </Button>
                <Button variant="outlined" startIcon={<AssignmentIcon />}>
                  Export Treatment Records
                </Button>
                <Button variant="outlined" startIcon={<ScheduleIcon />}>
                  Schedule Vet Visit
                </Button>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Quick Treatment Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Quick Emergency Treatment</DialogTitle>
        <DialogContent>
          {selectedAnimal && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedAnimal.name || 'Unnamed'} - {selectedAnimal.animal_type}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Treatment Type</InputLabel>
                    <Select 
  		      label="Treatment Type"
                      value={treatmentForm.treatmentType}
                      onChange={(e) => setTreatmentForm({...treatmentForm, treatmentType: e.target.value})}
                    >
                      <MenuItem value="emergency">Emergency Care</MenuItem>
                      <MenuItem value="medication">Medication Administration</MenuItem>
                      <MenuItem value="wound_care">Wound Care</MenuItem>
                      <MenuItem value="stabilization">Patient Stabilization</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Treatment Notes"
                    placeholder="Describe the treatment provided..."
 		    value={treatmentForm.treatmentNotes}
		    onChange={(e) => setTreatmentForm({...treatmentForm, treatmentNotes: e.target.value})}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Veterinarian"
                    placeholder="Dr. Smith"
                    value={treatmentForm.veterinarian}
                    onChange={(e) => setTreatmentForm({...treatmentForm, veterinarian: e.target.value})}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>New Status</InputLabel>
                    <Select 
                      label="New Status"
  		      value={treatmentForm.newStatus}
  		      onChange={(e) => setTreatmentForm({...treatmentForm, newStatus: e.target.value})}
		    >
                      <MenuItem value="UNDER_TREATMENT">Under Treatment</MenuItem>
                      <MenuItem value="STABLE">Stable</MenuItem>
                      <MenuItem value="RECOVERING">Recovering</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
  	    variant="contained" 
  	    color="success"
  	    onClick={handleSaveEmergencyTreatment}
	  >
            Save Treatment
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default MedicalManagementPage;