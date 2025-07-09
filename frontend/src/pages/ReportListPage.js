// pages/ReportListPage.js - ENHANCED VERSION with priority levels and better tracking

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { fetchReports, fetchMyReports, reset, addReportNote, cancelReport } from '../redux/slices/reportSlice';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  CircularProgress,
  Alert,
  Pagination,
  Modal,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Pets as PetsIcon,
  LocationOn as LocationOnIcon,
  AccessTime as AccessTimeIcon,
  NoteAdd as NoteAddIcon,
  Cancel as CancelIcon,
  Timeline as TimelineIcon,
  Map as MapIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Emergency as EmergencyIcon,
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import api from '../redux/api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A4DE6C', '#8884D8'];

function ReportListPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { user } = useSelector((state) => state.auth);
  const { reports, myReports, isLoading, isError, message } = useSelector((state) => state.reports);
  
  // States for individual reports view
  const [page, setPage] = useState(1);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false); // NEW
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [assignToUser, setAssignToUser] = useState(''); // NEW
  const [availableStaff, setAvailableStaff] = useState([]); // NEW
  
  // NEW: Filter states for SHELTER users
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [assignedFilter, setAssignedFilter] = useState('');
  
  // States for authority strategic view
  const [activeTab, setActiveTab] = useState(0);
  const [territoryData, setTerritoryData] = useState(null);
  const [territoryLoading, setTerritoryLoading] = useState(false);
  
  const reportsPerPage = 6;

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      // Fetch reports based on user type
      if (user.user_type === 'PUBLIC') {
        dispatch(fetchMyReports());
      } else if (user.user_type === 'AUTHORITY') {
        // Fetch strategic territory data for authorities
        fetchTerritoryAnalysis();
      } else {
        // For staff, admin, shelter workers - fetch all reports
        dispatch(fetchReports());
        fetchAvailableStaff(); // NEW: Fetch staff for assignment
      }
    }
    
    return () => {
      dispatch(reset());
    };
  }, [user, navigate, dispatch]);

  // NEW: Fetch available staff for assignment
  const fetchAvailableStaff = async () => {
    try {
      const response = await api.get('/users/?user_type=STAFF,VOLUNTEER');
      setAvailableStaff(response.data);
    } catch (err) {
      console.error('Failed to fetch staff:', err);
    }
  };

  const fetchTerritoryAnalysis = async () => {
    try {
      setTerritoryLoading(true);
      
      // Fetch strategic territory data
      const [strategicRes] = await Promise.all([
        api.get('/authority-analytics/test_endpoint/'),
      ]);

      // Mock territory analysis data (same as before)
      const territoryAnalysis = {
        overview: {
          total_territory_reports: strategicRes.data.total_reports,
          pending_interventions: Math.round(strategicRes.data.total_reports * 0.75),
          avg_response_time: 98,
          territory_coverage: 87.5,
          high_priority_areas: 5
        },
        geographic_hotspots: [
          { area: 'Downtown District', reports: 8, risk_level: 'High', avg_response: 65, efficiency: 78 },
          { area: 'Industrial Zone', reports: 6, risk_level: 'High', avg_response: 89, efficiency: 82 },
          { area: 'Commercial Center', reports: 4, risk_level: 'Medium', avg_response: 95, efficiency: 91 },
          { area: 'Residential North', reports: 3, risk_level: 'Medium', avg_response: 110, efficiency: 88 },
          { area: 'University Area', reports: 2, risk_level: 'Low', avg_response: 75, efficiency: 95 },
          { area: 'Suburban South', reports: 1, risk_level: 'Low', avg_response: 120, efficiency: 85 }
        ],
        status_distribution: [
          { name: 'High Priority', value: 5, color: '#f44336' },
          { name: 'Medium Priority', value: 8, color: '#ff9800' },
          { name: 'Low Priority', value: 12, color: '#4caf50' },
          { name: 'Resolved', value: 15, color: '#2196f3' }
        ],
        monthly_trends: [
          { month: 'Jan', incidents: 28, resolved: 24, efficiency: 86 },
          { month: 'Feb', incidents: 32, resolved: 28, efficiency: 88 },
          { month: 'Mar', incidents: 35, resolved: 31, efficiency: 89 },
          { month: 'Apr', incidents: 38, resolved: 35, efficiency: 92 },
          { month: 'May', incidents: 34, resolved: 32, efficiency: 94 },
          { month: 'Jun', incidents: 30, resolved: 29, efficiency: 97 }
        ],
        resource_recommendations: [
          {
            area: 'Downtown District',
            recommendation: 'Deploy additional mobile unit',
            priority: 'High',
            estimated_impact: '+25% efficiency',
            timeline: '2 weeks'
          },
          {
            area: 'Industrial Zone', 
            recommendation: 'Increase patrol frequency',
            priority: 'High',
            estimated_impact: '+15% response time',
            timeline: '1 week'
          },
          {
            area: 'Commercial Center',
            recommendation: 'Partner with local businesses',
            priority: 'Medium',
            estimated_impact: '+20% early detection',
            timeline: '1 month'
          }
        ]
      };

      setTerritoryData(territoryAnalysis);
      
    } catch (err) {
      console.error('Failed to fetch territory analysis:', err);
    } finally {
      setTerritoryLoading(false);
    }
  };

  // Use appropriate reports array based on user type
  const displayReports = user?.user_type === 'PUBLIC' ? myReports : reports;

  // NEW: Apply filters for SHELTER users
  const getFilteredReports = () => {
    if (user?.user_type !== 'SHELTER' && user?.user_type !== 'STAFF') {
      return displayReports;
    }

    let filtered = [...displayReports];

    if (priorityFilter) {
      filtered = filtered.filter(report => report.urgency_level === priorityFilter);
    }

    if (statusFilter) {
      filtered = filtered.filter(report => report.status === statusFilter);
    }

    if (assignedFilter === 'assigned') {
      filtered = filtered.filter(report => report.assigned_to);
    } else if (assignedFilter === 'unassigned') {
      filtered = filtered.filter(report => !report.assigned_to);
    }

    // Sort by priority and recency
    filtered.sort((a, b) => {
      const priorityOrder = { 'EMERGENCY': 0, 'HIGH': 1, 'NORMAL': 2, 'LOW': 3 };
      const aPriority = priorityOrder[a.urgency_level] || 2;
      const bPriority = priorityOrder[b.urgency_level] || 2;
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      
      return new Date(b.created_at) - new Date(a.created_at);
    });

    return filtered;
  };

  const filteredReports = getFilteredReports();

  // Get current reports for pagination
  const indexOfLastReport = page * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = filteredReports.slice(indexOfFirstReport, indexOfLastReport);
  const pageCount = Math.ceil(filteredReports.length / reportsPerPage);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // ENHANCED: Get status color with new status types
  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'ASSIGNED':
        return 'info';
      case 'IN_PROGRESS':
        return 'primary';
      case 'INVESTIGATING': // NEW
        return 'secondary';
      case 'RESCUE_IN_PROGRESS': // NEW
        return 'primary';
      case 'COMPLETED':
      case 'RESCUED': // NEW
      case 'RELOCATED': // NEW
        return 'success';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  // NEW: Get urgency color
  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'EMERGENCY':
        return '#f44336';
      case 'HIGH':
        return '#ff9800';
      case 'NORMAL':
        return '#4caf50';
      case 'LOW':
        return '#9e9e9e';
      default:
        return '#9e9e9e';
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'High':
        return '#f44336';
      case 'Medium':
        return '#ff9800';
      case 'Low':
        return '#4caf50';
      default:
        return '#9e9e9e';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'High':
        return <WarningIcon sx={{ color: '#f44336' }} />;
      case 'Medium':
        return <AssessmentIcon sx={{ color: '#ff9800' }} />;
      case 'Low':
        return <CheckCircleIcon sx={{ color: '#4caf50' }} />;
      default:
        return <CheckCircleIcon />;
    }
  };

  // NEW: Get urgency icon
  const getUrgencyIcon = (urgency) => {
    switch (urgency) {
      case 'EMERGENCY':
        return <EmergencyIcon sx={{ color: '#f44336' }} />;
      case 'HIGH':
        return <WarningIcon sx={{ color: '#ff9800' }} />;
      default:
        return null;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // NEW: Calculate response time
  const getResponseTime = (report) => {
    if (!report.assigned_to || !report.created_at) return 'N/A';
    
    const created = new Date(report.created_at);
    const now = new Date();
    const hours = Math.round((now - created) / (1000 * 60 * 60));
    
    if (hours < 1) return '< 1h';
    if (hours < 24) return `${hours}h`;
    return `${Math.round(hours / 24)}d`;
  };

  const handleAddNote = (reportId) => {
    setSelectedReportId(reportId);
    setNoteDialogOpen(true);
  };

  const handleCancelReport = (reportId) => {
    setSelectedReportId(reportId);
    setCancelDialogOpen(true);
  };

  // NEW: Handle assign report
  const handleAssignReport = (reportId) => {
    setSelectedReportId(reportId);
    setAssignDialogOpen(true);
  };

  const submitNote = () => {
    if (noteText.trim() && selectedReportId) {
      dispatch(addReportNote({ id: selectedReportId, notes: noteText }));
      setNoteDialogOpen(false);
      setNoteText('');
      setSelectedReportId(null);
      // Refresh the reports
      if (user.user_type === 'PUBLIC') {
        dispatch(fetchMyReports());
      }
    }
  };

  const submitCancel = () => {
    if (selectedReportId) {
      dispatch(cancelReport({ id: selectedReportId, reason: cancelReason }));
      setCancelDialogOpen(false);
      setCancelReason('');
      setSelectedReportId(null);
      // Refresh the reports
      if (user.user_type === 'PUBLIC') {
        dispatch(fetchMyReports());
      }
    }
  };

  // NEW: Submit assignment
  const submitAssignment = async () => {
    if (selectedReportId && assignToUser) {
      try {
        await api.patch(`/reports/${selectedReportId}/`, {
          assigned_to: assignToUser,
          status: 'ASSIGNED'
        });
        
        setAssignDialogOpen(false);
        setAssignToUser('');
        setSelectedReportId(null);
        
        // Refresh reports
        dispatch(fetchReports());
      } catch (err) {
        console.error('Failed to assign report:', err);
      }
    }
  };

  const canModifyReport = (report) => {
    return user?.user_type === 'PUBLIC' && 
           report.reporter === user.id && 
           report.status === 'PENDING';
  };

  // NEW: Check if user can assign reports
  const canAssignReports = () => {
    return user?.user_type === 'SHELTER' || user?.user_type === 'STAFF';
  };

  if (isLoading || territoryLoading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  // AUTHORITY Strategic Territory Analysis View (unchanged)
  if (user?.user_type === 'AUTHORITY') {
    return (
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <MapIcon sx={{ mr: 2 }} />
          Territory Analysis Dashboard
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" gutterBottom sx={{ mb: 4 }}>
          Strategic oversight of incident patterns and resource deployment across territorial zones
        </Typography>

        {isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        {territoryData && (
          <>
            {/* Strategic Overview Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={2.4}>
                <Card sx={{ backgroundColor: '#fff8e1', borderRadius: 2, boxShadow: '0 4px 12px rgba(129, 199, 132, 0.3)' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography color="text.secondary" gutterBottom>Territory Reports</Typography>
                    <Typography variant="h4">{territoryData.overview.total_territory_reports}</Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>Active incidents</Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={2.4}>
                <Card sx={{ backgroundColor: '#fff8e1', borderRadius: 2, boxShadow: '0 4px 12px rgba(129, 199, 132, 0.3)' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography color="text.secondary" gutterBottom>Pending Interventions</Typography>
                    <Typography variant="h4" color="warning.main">{territoryData.overview.pending_interventions}</Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>Require action</Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={2.4}>
                <Card sx={{ backgroundColor: '#fff8e1', borderRadius: 2, boxShadow: '0 4px 12px rgba(129, 199, 132, 0.3)' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography color="text.secondary" gutterBottom>Avg Response Time</Typography>
                    <Typography variant="h4" color="info.main">{territoryData.overview.avg_response_time}m</Typography>
                    <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>Below target</Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={2.4}>
                <Card sx={{ backgroundColor: '#fff8e1', borderRadius: 2, boxShadow: '0 4px 12px rgba(129, 199, 132, 0.3)' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography color="text.secondary" gutterBottom>Territory Coverage</Typography>
                    <Typography variant="h4" color="primary.main">{territoryData.overview.territory_coverage}%</Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>Area monitored</Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={2.4}>
                <Card sx={{ backgroundColor: '#fff8e1', borderRadius: 2, boxShadow: '0 4px 12px rgba(129, 199, 132, 0.3)' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography color="text.secondary" gutterBottom>High Priority Areas</Typography>
                    <Typography variant="h4" color="error.main">{territoryData.overview.high_priority_areas}</Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>Need intervention</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Tabs for different analysis views */}
            <Paper sx={{ backgroundColor: '#fff8e1', borderRadius: 2, boxShadow: '0 4px 12px rgba(129, 199, 132, 0.3)', mb: 3 }}>
              <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tab label="🗺️ Geographic Hotspots" />
                <Tab label="📊 Priority Distribution" />
                <Tab label="📈 Territory Trends" />
                <Tab label="🎯 Resource Deployment" />
              </Tabs>
            </Paper>

            {/* Tab Content - same as before */}
            {activeTab === 0 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationOnIcon sx={{ mr: 1 }} /> Geographic Incident Hotspots
                  </Typography>
                </Grid>
                
                {territoryData.geographic_hotspots.map((hotspot, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card sx={{ backgroundColor: '#fff8e1', borderRadius: 2, boxShadow: '0 4px 12px rgba(129, 199, 132, 0.3)' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6">{hotspot.area}</Typography>
                          <Chip 
                            label={hotspot.risk_level}
                            sx={{
                              backgroundColor: getRiskColor(hotspot.risk_level),
                              color: 'white',
                              fontWeight: '600'
                            }}
                            size="small"
                          />
                        </Box>
                        
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                          <strong>Active Reports:</strong> {hotspot.reports}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                          <strong>Avg Response:</strong> {hotspot.avg_response} minutes
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                          <strong>Efficiency:</strong> {hotspot.efficiency}%
                        </Typography>
                        
                        <LinearProgress 
                          variant="determinate" 
                          value={hotspot.efficiency} 
                          sx={{ 
                            height: 8, 
                            borderRadius: 4,
                            backgroundColor: '#e0e0e0',
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: hotspot.efficiency > 90 ? '#4caf50' : hotspot.efficiency > 80 ? '#ff9800' : '#f44336'
                            }
                          }}
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}

            {activeTab === 1 && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, backgroundColor: '#fff8e1', borderRadius: 2, boxShadow: '0 4px 12px rgba(129, 199, 132, 0.3)' }}>
                    <Typography variant="h6" gutterBottom>Priority Level Distribution</Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={territoryData.status_distribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {territoryData.status_distribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(value) => [`${value} areas`, 'Count']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, backgroundColor: '#fff8e1', borderRadius: 2, boxShadow: '0 4px 12px rgba(129, 199, 132, 0.3)' }}>
                    <Typography variant="h6" gutterBottom>Resource Allocation Strategy</Typography>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        <strong>High Priority Areas (5):</strong> Immediate intervention required
                      </Typography>
                      <LinearProgress variant="determinate" value={75} sx={{ mb: 2, height: 8, borderRadius: 4 }} color="error" />
                      
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        <strong>Medium Priority Areas (8):</strong> Monitor and schedule
                      </Typography>
                      <LinearProgress variant="determinate" value={60} sx={{ mb: 2, height: 8, borderRadius: 4 }} color="warning" />
                      
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        <strong>Low Priority Areas (12):</strong> Routine maintenance
                      </Typography>
                      <LinearProgress variant="determinate" value={30} sx={{ mb: 2, height: 8, borderRadius: 4 }} color="success" />
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            )}

            {activeTab === 2 && (
              <Paper sx={{ p: 3, backgroundColor: '#fff8e1', borderRadius: 2, boxShadow: '0 4px 12px rgba(129, 199, 132, 0.3)' }}>
                <Typography variant="h6" gutterBottom>Territory Incident Trends (6 Months)</Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={territoryData.monthly_trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="incidents" fill="#8884d8" name="Incidents Reported" />
                    <Bar dataKey="resolved" fill="#82ca9d" name="Cases Resolved" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            )}

            {activeTab === 3 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <TrendingUpIcon sx={{ mr: 1 }} /> Strategic Resource Deployment Recommendations
                  </Typography>
                </Grid>
                
                {territoryData.resource_recommendations.map((rec, index) => (
                  <Grid item xs={12} md={4} key={index}>
                    <Card sx={{ backgroundColor: '#fff8e1', borderRadius: 2, boxShadow: '0 4px 12px rgba(129, 199, 132, 0.3)', height: '100%' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          {getPriorityIcon(rec.priority)}
                          <Typography variant="h6" sx={{ ml: 1 }}>{rec.area}</Typography>
                        </Box>
                        
                        <Typography variant="body1" sx={{ mb: 2, fontWeight: '600' }}>
                          {rec.recommendation}
                        </Typography>
                        
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                          <strong>Priority:</strong> {rec.priority}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                          <strong>Expected Impact:</strong> {rec.estimated_impact}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                          <strong>Timeline:</strong> {rec.timeline}
                        </Typography>
                        
                        <Chip 
                          label={`${rec.priority} Priority`}
                          color={rec.priority === 'High' ? 'error' : rec.priority === 'Medium' ? 'warning' : 'success'}
                          variant="outlined"
                          size="small"
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}
      </Container>
    );
  }

  // ENHANCED STAFF/SHELTER/PUBLIC Individual Reports View
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          {user?.user_type === 'PUBLIC' ? 'My Reports' : 'Stray Animal Reports'}
        </Typography>
        <Button 
          variant="contained" 
          component={RouterLink} 
          to="/report-animal"
        >
          Report Animal
        </Button>
      </Box>

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      {/* NEW: Enhanced filtering for SHELTER users */}
      {(user?.user_type === 'SHELTER' || user?.user_type === 'STAFF') && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Filter Reports</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Priority Level</InputLabel>
                <Select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  label="Priority Level"
                >
                  <MenuItem value="">All Priorities</MenuItem>
                  <MenuItem value="EMERGENCY">🚨 Emergency</MenuItem>
                  <MenuItem value="HIGH">⚠️ High Priority</MenuItem>
                  <MenuItem value="NORMAL">✅ Normal</MenuItem>
                  <MenuItem value="LOW">📝 Low Priority</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="ASSIGNED">Assigned</MenuItem>
                  <MenuItem value="INVESTIGATING">Investigating</MenuItem>
                  <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                  <MenuItem value="RESCUE_IN_PROGRESS">Rescue in Progress</MenuItem>
                  <MenuItem value="COMPLETED">Completed</MenuItem>
                  <MenuItem value="RESCUED">Rescued</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Assignment</InputLabel>
                <Select
                  value={assignedFilter}
                  onChange={(e) => setAssignedFilter(e.target.value)}
                  label="Assignment"
                >
                  <MenuItem value="">All Reports</MenuItem>
                  <MenuItem value="assigned">Assigned</MenuItem>
                  <MenuItem value="unassigned">Unassigned</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Button 
                variant="outlined" 
                fullWidth
                onClick={() => {
                  setPriorityFilter('');
                  setStatusFilter('');
                  setAssignedFilter('');
                }}
                sx={{ height: '100%' }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* NEW: Quick stats for SHELTER users */}
      {(user?.user_type === 'SHELTER' || user?.user_type === 'STAFF') && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Card sx={{ backgroundColor: '#ffebee', textAlign: 'center' }}>
              <CardContent sx={{ py: 1 }}>
                <Typography variant="h6" color="error.main">
                  {filteredReports.filter(r => r.urgency_level === 'EMERGENCY').length}
                </Typography>
                <Typography variant="body2">Emergency</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ backgroundColor: '#fff3e0', textAlign: 'center' }}>
              <CardContent sx={{ py: 1 }}>
                <Typography variant="h6" color="warning.main">
                  {filteredReports.filter(r => r.status === 'PENDING').length}
                </Typography>
                <Typography variant="body2">Pending</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ backgroundColor: '#e3f2fd', textAlign: 'center' }}>
              <CardContent sx={{ py: 1 }}>
                <Typography variant="h6" color="primary.main">
                  {filteredReports.filter(r => r.assigned_to).length}
                </Typography>
                <Typography variant="body2">Assigned</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card sx={{ backgroundColor: '#e8f5e8', textAlign: 'center' }}>
              <CardContent sx={{ py: 1 }}>
                <Typography variant="h6" color="success.main">
                  {Math.round((filteredReports.filter(r => ['COMPLETED', 'RESCUED'].includes(r.status)).length / filteredReports.length) * 100) || 0}%
                </Typography>
                <Typography variant="body2">Completion Rate</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {filteredReports.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="textSecondary">
            {user?.user_type === 'PUBLIC' ? 'You haven\'t submitted any reports yet' : 'No reports found'}
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1, mb: 2 }}>
            {user?.user_type === 'PUBLIC' 
              ? 'Help an animal in need by reporting a stray animal sighting' 
              : 'New reports will appear here when submitted by community members'}
          </Typography>
          {user?.user_type === 'PUBLIC' && (
            <Button 
              variant="contained" 
              component={RouterLink} 
              to="/report-animal"
              sx={{ mt: 2 }}
            >
              Report a Stray Animal
            </Button>
          )}
        </Paper>
      ) : (
        <>
          <Grid container spacing={3}>
            {currentReports.map((report) => (
              <Grid item xs={12} sm={6} md={4} key={report.id}>
                <Card sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  // NEW: Special styling for urgent reports
                  ...(report.urgency_level === 'EMERGENCY' && {
                    border: '2px solid #f44336',
                    backgroundColor: '#ffebee'
                  })
                }}>
                  {/* NEW: Emergency banner */}
                  {report.urgency_level === 'EMERGENCY' && (
                    <Box sx={{ 
                      backgroundColor: '#f44336', 
                      color: 'white', 
                      p: 0.5, 
                      textAlign: 'center',
                      fontWeight: 'bold',
                      fontSize: '0.8rem'
                    }}>
                      🚨 EMERGENCY REPORT
                    </Box>
                  )}

                  {report.photos && report.photos.length > 0 && (
                    <Box
                      component="img"
                      sx={{
                        height: 200,
                        width: '100%',
                        objectFit: 'cover',
                      }}
                      src={`http://localhost:8000${report.photos[0]}`}
                      alt="Reported Animal"
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" component="div">
                        <PetsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Report #{report.id}
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Chip 
                          label={report.status} 
                          color={getStatusColor(report.status)}
                          size="small"
                        />
                        {/* NEW: Priority chip */}
                        {report.urgency_level && report.urgency_level !== 'NORMAL' && (
                          <Chip 
                            label={report.urgency_level}
                            size="small"
                            sx={{ 
                              backgroundColor: getUrgencyColor(report.urgency_level),
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                            icon={getUrgencyIcon(report.urgency_level)}
                          />
                        )}
                      </Box>
                    </Box>
                    
                    {report.animal && (
                      <Typography sx={{ mb: 1 }} color="text.secondary">
                        <strong>Animal:</strong> {report.animal.animal_type} 
                        {report.animal.color && ` - ${report.animal.color}`}
                      </Typography>
                    )}
                    
                    <Typography sx={{ mb: 1.5 }} color="text.secondary">
                      <LocationOnIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                      {report.location_details || 'Location details not provided'}
                    </Typography>
                    
                    <Typography sx={{ mb: 1.5 }} color="text.secondary">
                      <AccessTimeIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                      {formatDate(report.created_at)}
                    </Typography>

                    {/* NEW: Response time for SHELTER users */}
                    {(user?.user_type === 'SHELTER' || user?.user_type === 'STAFF') && (
                      <Typography sx={{ mb: 1.5 }} color="text.secondary">
                        <SpeedIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                        Response time: {getResponseTime(report)}
                      </Typography>
                    )}

                    {/* NEW: Assignment info for SHELTER users */}
                    {(user?.user_type === 'SHELTER' || user?.user_type === 'STAFF') && report.assigned_to_name && (
                      <Typography sx={{ mb: 1.5 }} color="text.secondary">
                        <PeopleIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                        Assigned to: {report.assigned_to_name}
                      </Typography>
                    )}
                    
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {report.description && report.description.length > 100 
                        ? `${report.description.substring(0, 100)}...` 
                        : report.description}
                    </Typography>

                    {/* Status updates for public users */}
                    {user?.user_type === 'PUBLIC' && report.assigned_to_name && (
                      <Alert severity="info" sx={{ mt: 1, mb: 1 }}>
                        Assigned to: {report.assigned_to_name}
                      </Alert>
                    )}

                    {report.response_notes && (
                      <Alert severity="success" sx={{ mt: 1, mb: 1 }}>
                        <strong>Update:</strong> {report.response_notes}
                      </Alert>
                    )}
                  </CardContent>
                  
                  <CardActions sx={{ justifyContent: 'space-between' }}>
                    <Button 
                      size="small" 
                      onClick={() => navigate(`/reports/${report.id}`)}
                      startIcon={<TimelineIcon />}
                    >
                      View Details
                    </Button>
                    
                    {/* Action buttons for public users on their own pending reports */}
                    {canModifyReport(report) && (
                      <Box>
                        <Tooltip title="Add additional information">
                          <IconButton 
                            size="small" 
                            onClick={() => handleAddNote(report.id)}
                            color="primary"
                          >
                            <NoteAddIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Cancel report">
                          <IconButton 
                            size="small" 
                            onClick={() => handleCancelReport(report.id)}
                            color="error"
                          >
                            <CancelIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}

                    {/* NEW: Assignment button for SHELTER users */}
                    {canAssignReports() && !report.assigned_to && report.status === 'PENDING' && (
                      <Tooltip title="Assign to team member">
                        <IconButton 
                          size="small" 
                          onClick={() => handleAssignReport(report.id)}
                          color="primary"
                        >
                          <AssignmentIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {pageCount > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination 
                count={pageCount} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
              />
            </Box>
          )}
        </>
      )}

      {/* Add Note Dialog */}
      <Dialog open={noteDialogOpen} onClose={() => setNoteDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Additional Information</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Additional Notes"
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Provide any additional information about the animal or situation..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNoteDialogOpen(false)}>Cancel</Button>
          <Button onClick={submitNote} variant="contained" disabled={!noteText.trim()}>
            Add Note
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Report Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cancel Report</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Are you sure you want to cancel this report? This action cannot be undone.
          </Typography>
          <TextField
            margin="dense"
            label="Reason for cancellation (optional)"
            multiline
            rows={3}
            fullWidth
            variant="outlined"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="e.g., Animal was already rescued, False alarm, etc."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>Keep Report</Button>
          <Button onClick={submitCancel} variant="contained" color="error">
            Cancel Report
          </Button>
        </DialogActions>
      </Dialog>

      {/* NEW: Assign Report Dialog */}
      <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Report to Team Member</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Assign this report to a staff member or volunteer for investigation.
          </Typography>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Assign to</InputLabel>
            <Select
              value={assignToUser}
              onChange={(e) => setAssignToUser(e.target.value)}
              label="Assign to"
            >
              {availableStaff.map((staff) => (
                <MenuItem key={staff.id} value={staff.id}>
                  {staff.username} - {staff.user_type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialogOpen(false)}>Cancel</Button>
          <Button onClick={submitAssignment} variant="contained" disabled={!assignToUser}>
            Assign Report
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default ReportListPage;