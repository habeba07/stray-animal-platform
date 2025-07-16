// pages/ReportListPage.js - ENHANCED VERSION with improved styling

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
  Fade,
  Slide,
  Zoom,
  alpha,
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
  Star as StarIcon,
  Report as ReportIcon,
  Add as AddIcon,
  FilterList as FilterListIcon,
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
import { keyframes } from '@mui/system';
import api from '../redux/api';

// Custom theme colors
const customTheme = {
  primary: '#8d6e63', // Warm Brown
  secondary: '#81c784', // Soft Green
  success: '#4caf50', // Fresh Green
  grey: '#f3e5ab', // Warm Cream
  accent: '#ff8a65', // Gentle Orange
  background: '#fff8e1', // Soft Cream
};

// Enhanced keyframe animations
const float = keyframes`
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
  100% { transform: translateY(0px) rotate(0deg); }
`;

const slideInUp = keyframes`
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 ${alpha('#f44336', 0.4)}; }
  70% { transform: scale(1.05); box-shadow: 0 0 0 20px ${alpha('#f44336', 0)}; }
  100% { transform: scale(1); box-shadow: 0 0 0 0 ${alpha('#f44336', 0)}; }
`;

const sparkle = keyframes`
  0% { opacity: 0; transform: scale(0) rotate(0deg); }
  50% { opacity: 1; transform: scale(1) rotate(180deg); }
  100% { opacity: 0; transform: scale(0) rotate(360deg); }
`;

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

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
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [assignToUser, setAssignToUser] = useState('');
  const [availableStaff, setAvailableStaff] = useState([]);
  
  // Filter states for SHELTER users
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
        fetchAvailableStaff();
      }
    }
    
    return () => {
      dispatch(reset());
    };
  }, [user, navigate, dispatch]);

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
      
      const [strategicRes] = await Promise.all([
        api.get('/authority-analytics/test_endpoint/'),
      ]);

      // Mock territory analysis data
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

  // Apply filters for SHELTER users
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return customTheme.accent;
      case 'ASSIGNED':
        return customTheme.secondary;
      case 'IN_PROGRESS':
        return customTheme.primary;
      case 'INVESTIGATING':
        return customTheme.secondary;
      case 'RESCUE_IN_PROGRESS':
        return customTheme.primary;
      case 'COMPLETED':
      case 'RESCUED':
      case 'RELOCATED':
        return customTheme.success;
      case 'CANCELLED':
        return '#f44336';
      default:
        return customTheme.primary;
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'EMERGENCY':
        return '#f44336';
      case 'HIGH':
        return customTheme.accent;
      case 'NORMAL':
        return customTheme.success;
      case 'LOW':
        return '#9e9e9e';
      case 'medium':
        return customTheme.accent;
      case 'high':
        return customTheme.accent;
      case 'emergency':
        return '#f44336';
      case 'low':
        return '#9e9e9e';
      default:
        return customTheme.accent;
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'High':
        return '#f44336';
      case 'Medium':
        return customTheme.accent;
      case 'Low':
        return customTheme.success;
      default:
        return '#9e9e9e';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'High':
        return <WarningIcon sx={{ color: '#f44336' }} />;
      case 'Medium':
        return <AssessmentIcon sx={{ color: customTheme.accent }} />;
      case 'Low':
        return <CheckCircleIcon sx={{ color: customTheme.success }} />;
      default:
        return <CheckCircleIcon />;
    }
  };

  const getUrgencyIcon = (urgency) => {
    switch (urgency) {
      case 'EMERGENCY':
      case 'emergency':
        return <EmergencyIcon sx={{ color: '#f44336' }} />;
      case 'HIGH':
      case 'high':
        return <WarningIcon sx={{ color: customTheme.accent }} />;
      case 'NORMAL':
      case 'normal':
        return <CheckCircleIcon sx={{ color: customTheme.success }} />;
      case 'LOW':
      case 'low':
        return <CheckCircleIcon sx={{ color: '#9e9e9e' }} />;
      case 'medium':
        return <WarningIcon sx={{ color: customTheme.accent }} />;
      default:
        return <WarningIcon sx={{ color: customTheme.accent }} />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

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

  const canAssignReports = () => {
    return user?.user_type === 'SHELTER' || user?.user_type === 'STAFF';
  };

  if (isLoading || territoryLoading) {
    return (
      <Box 
        sx={{ 
          minHeight: '100vh',
          background: `
            radial-gradient(circle at 20% 80%, ${alpha(customTheme.accent, 0.3)} 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, ${alpha(customTheme.secondary, 0.3)} 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, ${alpha(customTheme.grey, 0.4)} 0%, transparent 70%),
            linear-gradient(135deg, ${customTheme.background} 0%, ${alpha(customTheme.grey, 0.5)} 100%)
          `,
          display: 'flex', 
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Floating Background Elements */}
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            left: '15%',
            animation: `${float} 8s ease-in-out infinite`,
            animationDelay: '0s',
            opacity: 0.4
          }}
        >
          <ReportIcon sx={{ fontSize: 60, color: customTheme.primary, transform: 'rotate(15deg)' }} />
        </Box>
        <Box
          sx={{
            position: 'absolute',
            top: '70%',
            right: '20%',
            animation: `${float} 10s ease-in-out infinite`,
            animationDelay: '2s',
            opacity: 0.3
          }}
        >
          <PetsIcon sx={{ fontSize: 50, color: customTheme.accent, transform: 'rotate(-25deg)' }} />
        </Box>
        <Box
          sx={{
            position: 'absolute',
            bottom: '15%',
            left: '25%',
            animation: `${float} 12s ease-in-out infinite`,
            animationDelay: '4s',
            opacity: 0.5
          }}
        >
          <LocationOnIcon sx={{ fontSize: 40, color: customTheme.secondary, transform: 'rotate(45deg)' }} />
        </Box>
        
        <Box sx={{ textAlign: 'center', zIndex: 1 }}>
          <Box sx={{ position: 'relative', mb: 4 }}>
            <CircularProgress 
              size={90} 
              thickness={3}
              sx={{ 
                color: customTheme.primary,
                animation: `${pulse} 2s infinite`
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                animation: `${sparkle} 3s infinite`
              }}
            >
              <StarIcon sx={{ color: customTheme.accent, fontSize: 35 }} />
            </Box>
          </Box>
          <Typography 
            variant="h3" 
            sx={{ 
              color: customTheme.primary, 
              fontWeight: 800,
              mb: 2,
              background: `linear-gradient(45deg, ${customTheme.primary}, ${customTheme.accent})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em'
            }}
          >
            Loading Reports
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: alpha(customTheme.primary, 0.8),
              fontWeight: 500,
              animation: `${slideInUp} 1s ease-out 0.3s both`
            }}
          >
            Gathering animal rescue information...
          </Typography>
        </Box>
      </Box>
    );
  }

  // AUTHORITY Strategic Territory Analysis View
  if (user?.user_type === 'AUTHORITY') {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        background: `
          radial-gradient(circle at 20% 80%, ${alpha(customTheme.accent, 0.3)} 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, ${alpha(customTheme.secondary, 0.3)} 0%, transparent 50%),
          radial-gradient(circle at 50% 50%, ${alpha(customTheme.grey, 0.4)} 0%, transparent 70%),
          linear-gradient(135deg, ${customTheme.background} 0%, ${alpha(customTheme.grey, 0.5)} 100%)
        `,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Floating Background Elements */}
        <Box
          sx={{
            position: 'absolute',
            top: '5%',
            right: '5%',
            animation: `${float} 8s ease-in-out infinite`,
            opacity: 0.4,
            zIndex: 0
          }}
        >
          <MapIcon sx={{ fontSize: 60, color: customTheme.primary, transform: 'rotate(15deg)' }} />
        </Box>
        <Box
          sx={{
            position: 'absolute',
            bottom: '10%',
            left: '3%',
            animation: `${float} 12s ease-in-out infinite`,
            animationDelay: '2s',
            opacity: 0.3,
            zIndex: 0
          }}
        >
          <AssessmentIcon sx={{ fontSize: 50, color: customTheme.accent, transform: 'rotate(-20deg)' }} />
        </Box>
        <Box
          sx={{
            position: 'absolute',
            top: '25%',
            left: '8%',
            animation: `${float} 10s ease-in-out infinite`,
            animationDelay: '1s',
            opacity: 0.2,
            zIndex: 0
          }}
        >
          <TrendingUpIcon sx={{ fontSize: 45, color: customTheme.secondary, transform: 'rotate(30deg)' }} />
        </Box>

        <Container maxWidth="xl" sx={{ pt: 4, pb: 6, position: 'relative', zIndex: 1 }}>
          <Fade in timeout={800}>
            <Box sx={{ mb: 6, textAlign: 'center', position: 'relative' }}>
              {/* Floating sparkles */}
              <Box
                sx={{
                  position: 'absolute',
                  top: -30,
                  left: '25%',
                  animation: `${sparkle} 4s infinite`,
                  animationDelay: '0s'
                }}
              >
                <StarIcon sx={{ color: customTheme.accent, fontSize: 25 }} />
              </Box>
              <Box
                sx={{
                  position: 'absolute',
                  top: -20,
                  right: '20%',
                  animation: `${sparkle} 4s infinite`,
                  animationDelay: '2s'
                }}
              >
                <StarIcon sx={{ color: customTheme.secondary, fontSize: 20 }} />
              </Box>
              
              <Typography 
                variant="h2" 
                component="h1" 
                sx={{ 
                  fontWeight: 800,
                  background: `linear-gradient(45deg, ${customTheme.primary} 20%, ${customTheme.accent} 50%, ${customTheme.secondary} 80%)`,
                  backgroundSize: '200% 200%',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  animation: `${gradientShift} 4s ease infinite`,
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 3,
                  letterSpacing: '-0.02em'
                }}
              >
                <MapIcon sx={{ fontSize: 60, color: customTheme.primary }} />
                Territory Analysis Dashboard
              </Typography>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: alpha(customTheme.primary, 0.8), 
                  fontWeight: 500,
                  maxWidth: 800,
                  mx: 'auto',
                  lineHeight: 1.6,
                  animation: `${slideInUp} 1s ease-out 0.3s both`
                }}
              >
                Strategic oversight of incident patterns and resource deployment across territorial zones
              </Typography>
            </Box>
          </Fade>

          {isError && (
            <Fade in timeout={600}>
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 4,
                  borderRadius: 4,
                  backgroundColor: alpha('#f44336', 0.1),
                  border: `2px solid ${alpha('#f44336', 0.3)}`,
                  backdropFilter: 'blur(10px)',
                  fontSize: '1.1rem'
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {message}
                </Typography>
              </Alert>
            </Fade>
          )}

          {territoryData && (
            <>
              {/* Strategic Overview Cards */}
              <Slide direction="up" in timeout={1000}>
                <Grid container spacing={4} sx={{ mb: 8 }}>
                  {[
                    { label: 'Territory Reports', value: territoryData.overview.total_territory_reports, subtitle: 'Active incidents', color: customTheme.primary, icon: <ReportIcon /> },
                    { label: 'Pending Interventions', value: territoryData.overview.pending_interventions, subtitle: 'Require action', color: customTheme.accent, icon: <EmergencyIcon /> },
                    { label: 'Avg Response Time', value: `${territoryData.overview.avg_response_time}m`, subtitle: 'Below target', color: customTheme.secondary, icon: <SpeedIcon /> },
                    { label: 'Territory Coverage', value: `${territoryData.overview.territory_coverage}%`, subtitle: 'Area monitored', color: customTheme.success, icon: <MapIcon /> },
                    { label: 'High Priority Areas', value: territoryData.overview.high_priority_areas, subtitle: 'Need intervention', color: '#f44336', icon: <WarningIcon /> }
                  ].map((item, index) => (
                    <Grid item xs={12} sm={6} md={2.4} key={index}>
                      <Card 
                        sx={{
                          borderRadius: 5,
                          background: `
                            linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)
                          `,
                          backdropFilter: 'blur(20px)',
                          border: `3px solid ${alpha(item.color, 0.2)}`,
                          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                          position: 'relative',
                          overflow: 'hidden',
                          '&:hover': {
                            transform: 'translateY(-8px) scale(1.02)',
                            boxShadow: `0 25px 50px ${alpha(item.color, 0.3)}`,
                            border: `3px solid ${alpha(item.color, 0.4)}`,
                            '&::before': {
                              transform: 'translateX(100%)'
                            }
                          },
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: '-100%',
                            width: '100%',
                            height: '100%',
                            background: `linear-gradient(90deg, transparent, ${alpha(item.color, 0.1)}, transparent)`,
                            transition: 'transform 0.6s ease',
                            animation: `${shimmer} 3s infinite`
                          }
                        }}
                      >
                        <CardContent sx={{ textAlign: 'center', py: 4, position: 'relative', zIndex: 1 }}>
                          <Box sx={{ color: item.color, mb: 2 }}>
                            {React.cloneElement(item.icon, { sx: { fontSize: 40 } })}
                          </Box>
                          <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.7), fontWeight: 700, mb: 1 }}>
                            {item.label}
                          </Typography>
                          <Typography variant="h3" sx={{ color: item.color, fontWeight: 800, mb: 1 }}>
                            {item.value}
                          </Typography>
                          <Typography variant="caption" sx={{ color: alpha(customTheme.primary, 0.6), fontWeight: 500 }}>
                            {item.subtitle}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Slide>

              {/* Enhanced Tabs */}
              <Fade in timeout={1200}>
                <Paper 
                  sx={{ 
                    borderRadius: 5,
                    background: `
                      linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)
                    `,
                    backdropFilter: 'blur(20px)',
                    border: `3px solid ${alpha(customTheme.primary, 0.15)}`,
                    mb: 6,
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: `linear-gradient(90deg, ${customTheme.primary}, ${customTheme.accent}, ${customTheme.secondary})`,
                      animation: `${gradientShift} 3s ease infinite`
                    }}
                  />
                  <Tabs 
                    value={activeTab} 
                    onChange={(e, newValue) => setActiveTab(newValue)} 
                    sx={{ 
                      p: 3,
                      '& .MuiTabs-indicator': {
                        backgroundColor: customTheme.primary,
                        height: 4,
                        borderRadius: 2
                      },
                      '& .MuiTab-root': {
                        color: customTheme.primary,
                        fontWeight: 700,
                        textTransform: 'none',
                        fontSize: '1.1rem',
                        minHeight: 60,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          color: customTheme.accent,
                          transform: 'translateY(-2px)'
                        },
                        '&.Mui-selected': {
                          color: customTheme.primary,
                          fontWeight: 800
                        }
                      }
                    }}
                  >
                    <Tab label="Geographic Hotspots" />
                    <Tab label="Priority Distribution" />
                    <Tab label="Territory Trends" />
                    <Tab label="Resource Deployment" />
                  </Tabs>
                </Paper>
              </Fade>

              {/* Tab Content */}
              <Slide direction="up" in timeout={1400}>
                <Box>
                  {activeTab === 0 && (
                    <Grid container spacing={4}>
                      <Grid item xs={12}>
                        <Typography variant="h4" sx={{ color: customTheme.primary, fontWeight: 800, mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                          <LocationOnIcon sx={{ fontSize: 40 }} />
                          Geographic Incident Hotspots
                        </Typography>
                      </Grid>
                      
                      {territoryData.geographic_hotspots.map((hotspot, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                          <Card 
                            sx={{
                              borderRadius: 5,
                              background: `
                                linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)
                              `,
                              backdropFilter: 'blur(20px)',
                              border: `3px solid ${alpha(getRiskColor(hotspot.risk_level), 0.3)}`,
                              transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                              position: 'relative',
                              overflow: 'hidden',
                              '&:hover': {
                                transform: 'translateY(-10px) scale(1.02)',
                                boxShadow: `0 25px 50px ${alpha(getRiskColor(hotspot.risk_level), 0.3)}`,
                                border: `3px solid ${alpha(getRiskColor(hotspot.risk_level), 0.5)}`
                              }
                            }}
                          >
                            <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Typography variant="h5" sx={{ color: customTheme.primary, fontWeight: 800 }}>
                                  {hotspot.area}
                                </Typography>
                                <Chip 
                                  label={hotspot.risk_level}
                                  sx={{
                                    backgroundColor: getRiskColor(hotspot.risk_level),
                                    color: '#ffffff',
                                    fontWeight: 700,
                                    px: 2,
                                    py: 1,
                                    fontSize: '0.9rem'
                                  }}
                                />
                              </Box>
                              
                              <Box sx={{ mb: 3 }}>
                                <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.8), mb: 1.5, fontWeight: 600 }}>
                                  <strong>Active Reports:</strong> {hotspot.reports}
                                </Typography>
                                <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.8), mb: 1.5, fontWeight: 600 }}>
                                  <strong>Avg Response:</strong> {hotspot.avg_response} minutes
                                </Typography>
                                <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.8), mb: 2, fontWeight: 600 }}>
                                  <strong>Efficiency:</strong> {hotspot.efficiency}%
                                </Typography>
                              </Box>
                              
                              <Box sx={{ position: 'relative' }}>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={hotspot.efficiency} 
                                  sx={{ 
                                    height: 12, 
                                    borderRadius: 6,
                                    backgroundColor: alpha(customTheme.grey, 0.3),
                                    '& .MuiLinearProgress-bar': {
                                      backgroundColor: hotspot.efficiency > 90 ? customTheme.success : hotspot.efficiency > 80 ? customTheme.accent : '#f44336',
                                      borderRadius: 6,
                                      background: `linear-gradient(90deg, ${hotspot.efficiency > 90 ? customTheme.success : hotspot.efficiency > 80 ? customTheme.accent : '#f44336'}, ${alpha(hotspot.efficiency > 90 ? customTheme.success : hotspot.efficiency > 80 ? customTheme.accent : '#f44336', 0.7)})`
                                    }
                                  }}
                                />
                                <Typography
                                  variant="body2"
                                  sx={{
                                    position: 'absolute',
                                    right: 8,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    color: '#ffffff',
                                    fontWeight: 700,
                                    fontSize: '0.8rem'
                                  }}
                                >
                                  {hotspot.efficiency}%
                                </Typography>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}

                  {activeTab === 1 && (
                    <Grid container spacing={4}>
                      <Grid item xs={12} md={6}>
                        <Paper 
                          sx={{ 
                            p: 4,
                            borderRadius: 5,
                            background: `
                              linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)
                            `,
                            backdropFilter: 'blur(20px)',
                            border: `3px solid ${alpha(customTheme.primary, 0.15)}`,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-5px)',
                              boxShadow: `0 20px 40px ${alpha(customTheme.primary, 0.2)}`
                            }
                          }}
                        >
                          <Typography variant="h5" sx={{ color: customTheme.primary, fontWeight: 800, mb: 3 }}>
                            Priority Level Distribution
                          </Typography>
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
                        <Paper 
                          sx={{ 
                            p: 4,
                            borderRadius: 5,
                            background: `
                              linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)
                            `,
                            backdropFilter: 'blur(20px)',
                            border: `3px solid ${alpha(customTheme.primary, 0.15)}`,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-5px)',
                              boxShadow: `0 20px 40px ${alpha(customTheme.primary, 0.2)}`
                            }
                          }}
                        >
                          <Typography variant="h5" sx={{ color: customTheme.primary, fontWeight: 800, mb: 3 }}>
                            Resource Allocation Strategy
                          </Typography>
                          <Box sx={{ mt: 3 }}>
                            <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.8), mb: 2, fontWeight: 600 }}>
                              <strong>High Priority Areas (5):</strong> Immediate intervention required
                            </Typography>
                            <LinearProgress variant="determinate" value={75} sx={{ mb: 3, height: 12, borderRadius: 6 }} color="error" />
                            
                            <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.8), mb: 2, fontWeight: 600 }}>
                              <strong>Medium Priority Areas (8):</strong> Monitor and schedule
                            </Typography>
                            <LinearProgress variant="determinate" value={60} sx={{ mb: 3, height: 12, borderRadius: 6 }} color="warning" />
                            
                            <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.8), mb: 2, fontWeight: 600 }}>
                              <strong>Low Priority Areas (12):</strong> Routine maintenance
                            </Typography>
                            <LinearProgress variant="determinate" value={30} sx={{ mb: 2, height: 12, borderRadius: 6 }} color="success" />
                          </Box>
                        </Paper>
                      </Grid>
                    </Grid>
                  )}

                  {activeTab === 2 && (
                    <Paper 
                      sx={{ 
                        p: 4,
                        borderRadius: 5,
                        background: `
                          linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)
                        `,
                        backdropFilter: 'blur(20px)',
                        border: `3px solid ${alpha(customTheme.primary, 0.15)}`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: `0 20px 40px ${alpha(customTheme.primary, 0.2)}`
                        }
                      }}
                    >
                      <Typography variant="h5" sx={{ color: customTheme.primary, fontWeight: 800, mb: 3 }}>
                        Territory Incident Trends (6 Months)
                      </Typography>
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={territoryData.monthly_trends}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <RechartsTooltip />
                          <Legend />
                          <Bar dataKey="incidents" fill={customTheme.primary} name="Incidents Reported" />
                          <Bar dataKey="resolved" fill={customTheme.secondary} name="Cases Resolved" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Paper>
                  )}

                  {activeTab === 3 && (
                    <Grid container spacing={4}>
                      <Grid item xs={12}>
                        <Typography variant="h4" sx={{ color: customTheme.primary, fontWeight: 800, mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                          <TrendingUpIcon sx={{ fontSize: 40 }} />
                          Strategic Resource Deployment Recommendations
                        </Typography>
                      </Grid>
                      
                      {territoryData.resource_recommendations.map((rec, index) => (
                        <Grid item xs={12} md={4} key={index}>
                          <Card 
                            sx={{
                              borderRadius: 5,
                              background: `
                                linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)
                              `,
                              backdropFilter: 'blur(20px)',
                              border: `3px solid ${alpha(customTheme.primary, 0.15)}`,
                              height: '100%',
                              transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                              '&:hover': {
                                transform: 'translateY(-10px) scale(1.02)',
                                boxShadow: `0 25px 50px ${alpha(customTheme.primary, 0.2)}`,
                                border: `3px solid ${alpha(customTheme.primary, 0.3)}`
                              }
                            }}
                          >
                            <CardContent sx={{ p: 4 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                                {getPriorityIcon(rec.priority)}
                                <Typography variant="h5" sx={{ ml: 2, color: customTheme.primary, fontWeight: 800 }}>
                                  {rec.area}
                                </Typography>
                              </Box>
                              
                              <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: customTheme.primary }}>
                                {rec.recommendation}
                              </Typography>
                              
                              <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.8), mb: 1.5, fontWeight: 600 }}>
                                <strong>Priority:</strong> {rec.priority}
                              </Typography>
                              <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.8), mb: 1.5, fontWeight: 600 }}>
                                <strong>Expected Impact:</strong> {rec.estimated_impact}
                              </Typography>
                              <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.8), mb: 3, fontWeight: 600 }}>
                                <strong>Timeline:</strong> {rec.timeline}
                              </Typography>
                              
                              <Chip 
                                label={`${rec.priority} Priority`}
                                sx={{
                                  backgroundColor: rec.priority === 'High' ? '#f44336' : rec.priority === 'Medium' ? customTheme.accent : customTheme.success,
                                  color: '#ffffff',
                                  fontWeight: 700,
                                  px: 2,
                                  py: 1,
                                  fontSize: '0.9rem'
                                }}
                              />
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Box>
              </Slide>
            </>
          )}
        </Container>
      </Box>
    );
  }

  // ENHANCED STAFF/SHELTER/PUBLIC Individual Reports View
  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `
        radial-gradient(circle at 20% 80%, ${alpha(customTheme.accent, 0.3)} 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, ${alpha(customTheme.secondary, 0.3)} 0%, transparent 50%),
        radial-gradient(circle at 50% 50%, ${alpha(customTheme.grey, 0.4)} 0%, transparent 70%),
        linear-gradient(135deg, ${customTheme.background} 0%, ${alpha(customTheme.grey, 0.5)} 100%)
      `,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Enhanced Floating Background Elements */}
      <Box
        sx={{
          position: 'absolute',
          top: '8%',
          right: '12%',
          animation: `${float} 10s ease-in-out infinite`,
          opacity: 0.4,
          zIndex: 0
        }}
      >
        <ReportIcon sx={{ fontSize: 65, color: customTheme.primary, transform: 'rotate(25deg)' }} />
      </Box>
      <Box
        sx={{
          position: 'absolute',
          bottom: '15%',
          left: '5%',
          animation: `${float} 14s ease-in-out infinite`,
          animationDelay: '3s',
          opacity: 0.3,
          zIndex: 0
        }}
      >
        <PetsIcon sx={{ fontSize: 50, color: customTheme.accent, transform: 'rotate(-30deg)' }} />
      </Box>
      <Box
        sx={{
          position: 'absolute',
          top: '30%',
          left: '8%',
          animation: `${float} 12s ease-in-out infinite`,
          animationDelay: '1.5s',
          opacity: 0.25,
          zIndex: 0
        }}
      >
        <LocationOnIcon sx={{ fontSize: 45, color: customTheme.secondary, transform: 'rotate(45deg)' }} />
      </Box>
      <Box
        sx={{
          position: 'absolute',
          bottom: '35%',
          right: '8%',
          animation: `${float} 11s ease-in-out infinite`,
          animationDelay: '2.5s',
          opacity: 0.35,
          zIndex: 0
        }}
      >
        <EmergencyIcon sx={{ fontSize: 40, color: '#f44336', transform: 'rotate(-15deg)' }} />
      </Box>

      <Container maxWidth="lg" sx={{ py: 6, position: 'relative', zIndex: 1 }}>
        {/* Enhanced Header */}
        <Fade in timeout={800}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6, position: 'relative' }}>
            {/* Floating sparkles around header */}
            <Box
              sx={{
                position: 'absolute',
                top: -25,
                left: '20%',
                animation: `${sparkle} 4s infinite`,
                animationDelay: '0s'
              }}
            >
              <StarIcon sx={{ color: customTheme.accent, fontSize: 25 }} />
            </Box>
            <Box
              sx={{
                position: 'absolute',
                top: -15,
                right: '30%',
                animation: `${sparkle} 4s infinite`,
                animationDelay: '2s'
              }}
            >
              <StarIcon sx={{ color: customTheme.secondary, fontSize: 20 }} />
            </Box>
            
            <Typography 
              variant="h2" 
              component="h1"
              sx={{ 
                fontWeight: 800,
                background: `linear-gradient(45deg, ${customTheme.primary} 20%, ${customTheme.accent} 50%, ${customTheme.secondary} 80%)`,
                backgroundSize: '200% 200%',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: `${gradientShift} 4s ease infinite`,
                letterSpacing: '-0.02em',
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              <ReportIcon sx={{ fontSize: 60, color: customTheme.primary }} />
              {user?.user_type === 'PUBLIC' ? 'My Reports' : 'Stray Animal Reports'}
            </Typography>
            <Button 
              variant="contained" 
              component={RouterLink} 
              to="/report-animal"
              startIcon={<AddIcon />}
              sx={{
                background: `linear-gradient(45deg, ${customTheme.primary} 30%, ${alpha(customTheme.primary, 0.8)} 90%)`,
                fontWeight: 700,
                py: 2,
                px: 4,
                borderRadius: 4,
                textTransform: 'none',
                fontSize: '1.1rem',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  background: `linear-gradient(45deg, ${alpha(customTheme.primary, 0.9)} 30%, ${customTheme.primary} 90%)`,
                  transform: 'translateY(-3px)',
                  boxShadow: `0 12px 35px ${alpha(customTheme.primary, 0.4)}`,
                  '&::before': {
                    transform: 'translateX(100%)'
                  }
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: `linear-gradient(90deg, transparent, ${alpha('#ffffff', 0.2)}, transparent)`,
                  transition: 'transform 0.6s ease'
                }
              }}
            >
              Report Animal
            </Button>
          </Box>
        </Fade>

        {/* Enhanced Error Alert */}
        {isError && (
          <Fade in timeout={600}>
            <Alert 
              severity="error" 
              sx={{ 
                mb: 4,
                borderRadius: 4,
                backgroundColor: alpha('#f44336', 0.1),
                border: `3px solid ${alpha('#f44336', 0.3)}`,
                backdropFilter: 'blur(20px)',
                fontSize: '1.1rem',
                '& .MuiAlert-icon': {
                  fontSize: '2rem'
                }
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {message}
              </Typography>
            </Alert>
          </Fade>
        )}

        {/* Enhanced filtering for SHELTER users */}
        {(user?.user_type === 'SHELTER' || user?.user_type === 'STAFF') && (
          <Slide direction="down" in timeout={1000}>
            <Paper 
              sx={{ 
                p: 4, 
                mb: 6,
                borderRadius: 5,
                background: `
                  linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)
                `,
                backdropFilter: 'blur(20px)',
                border: `3px solid ${alpha(customTheme.primary, 0.15)}`,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: `linear-gradient(90deg, ${customTheme.primary}, ${customTheme.accent}, ${customTheme.secondary})`,
                  animation: `${gradientShift} 3s ease infinite`
                }}
              />
              <Typography variant="h5" sx={{ color: customTheme.primary, fontWeight: 800, mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                <FilterListIcon sx={{ fontSize: 30 }} />
                Filter Reports
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: customTheme.primary, fontWeight: 600 }}>Priority Level</InputLabel>
                    <Select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      label="Priority Level"
                      sx={{
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: alpha(customTheme.primary, 0.3),
                          borderWidth: 2
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: customTheme.primary
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: customTheme.primary
                        }
                      }}
                    >
                      <MenuItem value="">All Priorities</MenuItem>
                      <MenuItem value="EMERGENCY">Emergency</MenuItem>
                      <MenuItem value="HIGH">High Priority</MenuItem>
                      <MenuItem value="NORMAL">Normal</MenuItem>
                      <MenuItem value="LOW">Low Priority</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ color: customTheme.primary, fontWeight: 600 }}>Status</InputLabel>
                    <Select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      label="Status"
                      sx={{
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: alpha(customTheme.secondary, 0.3),
                          borderWidth: 2
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: customTheme.secondary
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: customTheme.secondary
                        }
                      }}
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
                    <InputLabel sx={{ color: customTheme.primary, fontWeight: 600 }}>Assignment</InputLabel>
                    <Select
                      value={assignedFilter}
                      onChange={(e) => setAssignedFilter(e.target.value)}
                      label="Assignment"
                      sx={{
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: alpha(customTheme.accent, 0.3),
                          borderWidth: 2
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: customTheme.accent
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: customTheme.accent
                        }
                      }}
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
                    sx={{ 
                      height: '100%',
                      borderColor: customTheme.primary,
                      color: customTheme.primary,
                      borderWidth: 2,
                      fontWeight: 700,
                      borderRadius: 2,
                      '&:hover': {
                        borderColor: customTheme.primary,
                        backgroundColor: alpha(customTheme.primary, 0.1),
                        borderWidth: 2,
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    Clear Filters
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Slide>
        )}

        {/* Enhanced stats for SHELTER users */}
        {(user?.user_type === 'SHELTER' || user?.user_type === 'STAFF') && (
          <Slide direction="up" in timeout={1200}>
            <Grid container spacing={4} sx={{ mb: 6 }}>
              {[
                { label: 'Emergency', count: filteredReports.filter(r => r.urgency_level === 'EMERGENCY').length, color: '#f44336', icon: <EmergencyIcon /> },
                { label: 'Pending', count: filteredReports.filter(r => r.status === 'PENDING').length, color: customTheme.accent, icon: <AccessTimeIcon /> },
                { label: 'Assigned', count: filteredReports.filter(r => r.assigned_to).length, color: customTheme.secondary, icon: <AssignmentIcon /> },
                { label: 'Completion Rate', count: `${Math.round((filteredReports.filter(r => ['COMPLETED', 'RESCUED'].includes(r.status)).length / filteredReports.length) * 100) || 0}%`, color: customTheme.success, icon: <CheckCircleIcon /> }
              ].map((stat, index) => (
                <Grid item xs={6} sm={3} key={index}>
                  <Card 
                    sx={{
                      borderRadius: 4,
                      background: `
                        linear-gradient(135deg, ${alpha(stat.color, 0.1)} 0%, ${alpha(customTheme.background, 0.9)} 100%)
                      `,
                      border: `3px solid ${alpha(stat.color, 0.3)}`,
                      textAlign: 'center',
                      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-8px) scale(1.05)',
                        boxShadow: `0 25px 50px ${alpha(stat.color, 0.3)}`,
                        border: `3px solid ${alpha(stat.color, 0.5)}`,
                        '&::before': {
                          transform: 'translateX(100%)'
                        }
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: `linear-gradient(90deg, transparent, ${alpha(stat.color, 0.1)}, transparent)`,
                        transition: 'transform 0.6s ease'
                      }
                    }}
                  >
                    <CardContent sx={{ py: 3, position: 'relative', zIndex: 1 }}>
                      <Box sx={{ color: stat.color, mb: 2 }}>
                        {React.cloneElement(stat.icon, { sx: { fontSize: 40 } })}
                      </Box>
                      <Typography variant="h3" sx={{ color: stat.color, fontWeight: 800, mb: 1 }}>
                        {stat.count}
                      </Typography>
                      <Typography variant="body1" sx={{ color: customTheme.primary, fontWeight: 700 }}>
                        {stat.label}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Slide>
        )}

        {/* Enhanced Reports Display */}
        {filteredReports.length === 0 ? (
          <Zoom in timeout={1000}>
            <Paper 
              sx={{ 
                p: 10, 
                textAlign: 'center',
                borderRadius: 6,
                background: `
                  radial-gradient(circle at center, ${alpha(customTheme.grey, 0.4)} 0%, ${alpha(customTheme.background, 0.9)} 70%),
                  linear-gradient(135deg, ${alpha(customTheme.grey, 0.3)} 0%, ${alpha(customTheme.background, 0.9)} 100%)
                `,
                border: `3px solid ${alpha(customTheme.primary, 0.2)}`,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ position: 'relative', mb: 4 }}>
                  <ReportIcon 
                    sx={{ 
                      fontSize: 120, 
                      color: alpha(customTheme.primary, 0.4), 
                      animation: `${float} 4s ease-in-out infinite`
                    }} 
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      animation: `${sparkle} 3s infinite`
                    }}
                  >
                    <StarIcon sx={{ color: customTheme.accent, fontSize: 40 }} />
                  </Box>
                </Box>
                
                <Typography variant="h3" sx={{ color: customTheme.primary, fontWeight: 800, mb: 3 }}>
                  {user?.user_type === 'PUBLIC' ? 'You haven\'t submitted any reports yet' : 'No reports found'}
                </Typography>
                <Typography variant="h6" sx={{ color: alpha(customTheme.primary, 0.8), maxWidth: 600, mx: 'auto', mb: 4, lineHeight: 1.6 }}>
                  {user?.user_type === 'PUBLIC' 
                    ? 'Help an animal in need by reporting a stray animal sighting. Every report makes a difference!' 
                    : 'New reports will appear here when submitted by community members'}
                </Typography>
                {user?.user_type === 'PUBLIC' && (
                  <Button 
                    variant="contained" 
                    component={RouterLink} 
                    to="/report-animal"
                    startIcon={<AddIcon />}
                    sx={{
                      background: `linear-gradient(45deg, ${customTheme.primary} 30%, ${alpha(customTheme.primary, 0.8)} 90%)`,
                      fontWeight: 700,
                      py: 2.5,
                      px: 5,
                      borderRadius: 4,
                      textTransform: 'none',
                      fontSize: '1.2rem',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        background: `linear-gradient(45deg, ${alpha(customTheme.primary, 0.9)} 30%, ${customTheme.primary} 90%)`,
                        transform: 'translateY(-3px)',
                        boxShadow: `0 12px 35px ${alpha(customTheme.primary, 0.4)}`,
                        '&::before': {
                          transform: 'translateX(100%)'
                        }
                      },
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: '-100%',
                        width: '100%',
                        height: '100%',
                        background: `linear-gradient(90deg, transparent, ${alpha('#ffffff', 0.2)}, transparent)`,
                        transition: 'transform 0.6s ease'
                      }
                    }}
                  >
                    Report a Stray Animal
                  </Button>
                )}
              </Box>
            </Paper>
          </Zoom>
        ) : (
          <>
            <Grid container spacing={5}>
              {currentReports.map((report, index) => (
                <Grid item xs={12} sm={6} md={4} key={report.id}>
                  <Fade in timeout={800 + index * 150}>
                    <Card 
                      sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        borderRadius: 5,
                        background: `
                          linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)
                        `,
                        backdropFilter: 'blur(20px)',
                        border: `3px solid ${alpha(customTheme.primary, 0.15)}`,
                        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        position: 'relative',
                        overflow: 'hidden',
                        // Special styling for urgent reports
                        ...(report.urgency_level === 'EMERGENCY' && {
                          borderColor: '#f44336',
                          borderWidth: 4,
                          backgroundColor: alpha('#f44336', 0.08)
                        }),
                        '&:hover': {
                          transform: 'translateY(-12px) scale(1.03)',
                          boxShadow: `0 30px 60px ${alpha(customTheme.primary, 0.25)}`,
                          border: `3px solid ${alpha(customTheme.primary, 0.3)}`,
                          ...(report.urgency_level === 'EMERGENCY' && {
                            borderColor: '#f44336',
                            borderWidth: 4,
                            boxShadow: `0 30px 60px ${alpha('#f44336', 0.3)}`
                          })
                        }
                      }}
                    >
                      {/* Enhanced emergency banner */}
                      {report.urgency_level === 'EMERGENCY' && (
                        <Box sx={{ 
                          background: `linear-gradient(90deg, #f44336, #d32f2f)`,
                          color: '#ffffff', 
                          p: 1.5, 
                          textAlign: 'center',
                          fontWeight: 800,
                          fontSize: '1rem',
                          animation: `${pulse} 2s infinite`,
                          position: 'relative',
                          overflow: 'hidden',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: '-100%',
                            width: '100%',
                            height: '100%',
                            background: `linear-gradient(90deg, transparent, ${alpha('#ffffff', 0.3)}, transparent)`,
                            animation: `${shimmer} 2s infinite`
                          }
                        }}>
                          <EmergencyIcon sx={{ mr: 1, fontSize: 20 }} />
                          EMERGENCY REPORT
                        </Box>
                      )}

                      {/* Enhanced Photo Section */}
                      {report.photos && report.photos.length > 0 && (
                        <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                          <Box
                            component="img"
                            sx={{
                              height: 220,
                              width: '100%',
                              objectFit: 'cover',
                              transition: 'transform 0.6s ease',
                              filter: 'brightness(1.05) contrast(1.1)',
                              '&:hover': { transform: 'scale(1.1)' }
                            }}
                            src={`http://localhost:8000${report.photos[0]}`}
                            alt="Reported Animal"
                          />
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              height: '100%',
                              background: `linear-gradient(180deg, ${alpha('#000000', 0.1)} 0%, transparent 30%, transparent 70%, ${alpha('#000000', 0.2)} 100%)`,
                              pointerEvents: 'none'
                            }}
                          />
                        </Box>
                      )}

                      <CardContent sx={{ flexGrow: 1, p: 4 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                          <Typography variant="h5" sx={{ color: customTheme.primary, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ReportIcon sx={{ fontSize: 24 }} />
                            Report #{report.id}
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, minWidth: 110 }}>
                            <Chip 
                              label={report.status} 
                              sx={{
                                backgroundColor: getStatusColor(report.status),
                                color: '#ffffff',
                                fontWeight: 700,
                                fontSize: '0.85rem',
                                minWidth: 90,
                                justifyContent: 'center'
                              }}
                            />
                            {/* Enhanced Priority chip */}
                            {report.urgency_level && report.urgency_level !== 'NORMAL' && (
                              <Chip 
                                label={report.urgency_level}
                                icon={getUrgencyIcon(report.urgency_level)}
                                sx={{ 
                                  backgroundColor: getUrgencyColor(report.urgency_level),
                                  color: '#ffffff',
                                  fontWeight: 700,
                                  fontSize: '0.85rem',
                                  minWidth: 90,
                                  justifyContent: 'center',
                                  '& .MuiChip-icon': { color: '#ffffff' }
                                }}
                              />
                            )}
                          </Box>
                        </Box>
                        
                        {report.animal && (
                          <Typography sx={{ mb: 2, color: alpha(customTheme.primary, 0.8), fontWeight: 600 }}>
                            <strong>Animal:</strong> {report.animal.animal_type} 
                            {report.animal.color && ` - ${report.animal.color}`}
                          </Typography>
                        )}
                        
                        <Typography sx={{ mb: 2, color: alpha(customTheme.primary, 0.8), display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                          <LocationOnIcon sx={{ fontSize: 18 }} />
                          {report.location_details || 'Location details not provided'}
                        </Typography>
                        
                        <Typography sx={{ mb: 2, color: alpha(customTheme.primary, 0.8), display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                          <AccessTimeIcon sx={{ fontSize: 18 }} />
                          {formatDate(report.created_at)}
                        </Typography>

                        {/* Enhanced Response time for SHELTER users */}
                        {(user?.user_type === 'SHELTER' || user?.user_type === 'STAFF') && (
                          <Typography sx={{ mb: 2, color: alpha(customTheme.primary, 0.8), display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                            <SpeedIcon sx={{ fontSize: 18 }} />
                            Response time: {getResponseTime(report)}
                          </Typography>
                        )}

                        {/* Enhanced Assignment info for SHELTER users */}
                        {(user?.user_type === 'SHELTER' || user?.user_type === 'STAFF') && report.assigned_to_name && (
                          <Typography sx={{ mb: 2, color: alpha(customTheme.primary, 0.8), display: 'flex', alignItems: 'center', gap: 1, fontWeight: 600 }}>
                            <PeopleIcon sx={{ fontSize: 18 }} />
                            Assigned to: {report.assigned_to_name}
                          </Typography>
                        )}
                        
                        <Typography variant="body1" sx={{ mb: 3, color: customTheme.primary, fontWeight: 500, lineHeight: 1.6 }}>
                          {report.description && report.description.length > 100 
                            ? `${report.description.substring(0, 100)}...` 
                            : report.description}
                        </Typography>

                        {/* Enhanced status updates for public users */}
                        {user?.user_type === 'PUBLIC' && report.assigned_to_name && (
                          <Alert 
                            severity="info" 
                            sx={{ 
                              mt: 2, 
                              mb: 2,
                              backgroundColor: alpha(customTheme.secondary, 0.1),
                              border: `2px solid ${alpha(customTheme.secondary, 0.3)}`,
                              borderRadius: 3,
                              '& .MuiAlert-icon': {
                                color: customTheme.secondary
                              }
                            }}
                          >
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              <strong>Update:</strong> Assigned to {report.assigned_to_name}
                            </Typography>
                          </Alert>
                        )}

                        {report.response_notes && (
                          <Alert 
                            severity="success" 
                            sx={{ 
                              mt: 2, 
                              mb: 2,
                              backgroundColor: alpha(customTheme.success, 0.1),
                              border: `2px solid ${alpha(customTheme.success, 0.3)}`,
                              borderRadius: 3,
                              '& .MuiAlert-icon': {
                                color: customTheme.success
                              }
                            }}
                          >
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              <strong>Update:</strong> {report.response_notes}
                            </Typography>
                          </Alert>
                        )}
                      </CardContent>
                      
                      <CardActions sx={{ justifyContent: 'space-between', p: 3 }}>
                        <Button 
                          variant="contained"
                          onClick={() => navigate(`/reports/${report.id}`)}
                          startIcon={<TimelineIcon />}
                          sx={{
                            backgroundColor: customTheme.primary,
                            fontWeight: 700,
                            borderRadius: 3,
                            px: 3,
                            py: 1.5,
                            '&:hover': {
                              backgroundColor: alpha(customTheme.primary, 0.8),
                              transform: 'translateY(-2px)',
                              boxShadow: `0 8px 25px ${alpha(customTheme.primary, 0.3)}`
                            }
                          }}
                        >
                          View Details
                        </Button>
                        
                        {/* Enhanced Action buttons for public users on their own pending reports */}
                        {canModifyReport(report) && (
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton 
                              onClick={() => handleAddNote(report.id)}
                              sx={{
                                color: customTheme.secondary,
                                backgroundColor: alpha(customTheme.secondary, 0.1),
                                borderRadius: 2,
                                '&:hover': {
                                  backgroundColor: alpha(customTheme.secondary, 0.2),
                                  transform: 'scale(1.1)'
                                }
                              }}
                            >
                              <NoteAddIcon />
                            </IconButton>
                            <IconButton 
                              onClick={() => handleCancelReport(report.id)}
                              sx={{
                                color: '#f44336',
                                backgroundColor: alpha('#f44336', 0.1),
                                borderRadius: 2,
                                '&:hover': {
                                  backgroundColor: alpha('#f44336', 0.2),
                                  transform: 'scale(1.1)'
                                }
                              }}
                            >
                              <CancelIcon />
                            </IconButton>
                          </Box>
                        )}

                        {/* Enhanced Assignment button for SHELTER users */}
                        {canAssignReports() && !report.assigned_to && report.status === 'PENDING' && (
                          <IconButton 
                            onClick={() => handleAssignReport(report.id)}
                            sx={{
                              color: customTheme.accent,
                              backgroundColor: alpha(customTheme.accent, 0.1),
                              borderRadius: 2,
                              '&:hover': {
                                backgroundColor: alpha(customTheme.accent, 0.2),
                                transform: 'scale(1.1)'
                              }
                            }}
                          >
                            <AssignmentIcon />
                          </IconButton>
                        )}
                      </CardActions>
                    </Card>
                  </Fade>
                </Grid>
              ))}
            </Grid>
            
            {/* Enhanced Pagination */}
            {pageCount > 1 && (
              <Fade in timeout={1400}>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      borderRadius: 5,
                      background: `
                        linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)
                      `,
                      backdropFilter: 'blur(20px)',
                      border: `3px solid ${alpha(customTheme.primary, 0.15)}`
                    }}
                  >
                    <Pagination 
                      count={pageCount} 
                      page={page} 
                      onChange={handlePageChange} 
                      size="large"
                      sx={{
                        '& .MuiPaginationItem-root': {
                          color: customTheme.primary,
                          fontWeight: 700,
                          fontSize: '1.1rem',
                          minWidth: 50,
                          height: 50,
                          borderRadius: 3,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            backgroundColor: alpha(customTheme.primary, 0.1),
                            transform: 'translateY(-3px)',
                            boxShadow: `0 8px 25px ${alpha(customTheme.primary, 0.2)}`
                          },
                          '&.Mui-selected': {
                            backgroundColor: customTheme.primary,
                            color: '#ffffff',
                            transform: 'scale(1.1)',
                            boxShadow: `0 8px 25px ${alpha(customTheme.primary, 0.4)}`,
                            '&:hover': {
                              backgroundColor: alpha(customTheme.primary, 0.8),
                              transform: 'scale(1.1) translateY(-3px)'
                            }
                          }
                        }
                      }}
                    />
                  </Paper>
                </Box>
              </Fade>
            )}
          </>
        )}

        {/* Enhanced Dialogs */}
        {/* Add Note Dialog */}
        <Dialog 
          open={noteDialogOpen} 
          onClose={() => setNoteDialogOpen(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 5,
              background: `
                linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)
              `,
              backdropFilter: 'blur(20px)',
              border: `3px solid ${alpha(customTheme.primary, 0.2)}`
            }
          }}
        >
          <DialogTitle sx={{ color: customTheme.primary, fontWeight: 800, fontSize: '1.5rem' }}>
            Add Additional Information
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
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
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  '& fieldset': {
                    borderColor: alpha(customTheme.primary, 0.3),
                    borderWidth: 2
                  },
                  '&:hover fieldset': {
                    borderColor: customTheme.primary
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: customTheme.primary
                  }
                },
                '& .MuiInputLabel-root': {
                  color: customTheme.primary,
                  fontWeight: 600,
                  '&.Mui-focused': { color: customTheme.primary }
                }
              }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button 
              onClick={() => setNoteDialogOpen(false)}
              sx={{ color: customTheme.primary, fontWeight: 700 }}
            >
              Cancel
            </Button>
            <Button 
              onClick={submitNote} 
              variant="contained" 
              disabled={!noteText.trim()}
              sx={{
                backgroundColor: customTheme.primary,
                fontWeight: 700,
                borderRadius: 3,
                px: 3,
                py: 1,
                '&:hover': {
                  backgroundColor: alpha(customTheme.primary, 0.8),
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 25px ${alpha(customTheme.primary, 0.3)}`
                }
              }}
            >
              Add Note
            </Button>
          </DialogActions>
        </Dialog>

        {/* Enhanced Cancel Report Dialog */}
        <Dialog 
          open={cancelDialogOpen} 
          onClose={() => setCancelDialogOpen(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 5,
              background: `
                linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)
              `,
              backdropFilter: 'blur(20px)',
              border: `3px solid ${alpha('#f44336', 0.3)}`
            }
          }}
        >
          <DialogTitle sx={{ color: '#f44336', fontWeight: 800, fontSize: '1.5rem' }}>
            Cancel Report
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.8), mb: 3, fontWeight: 600 }}>
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
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  '& fieldset': {
                    borderColor: alpha('#f44336', 0.3),
                    borderWidth: 2
                  },
                  '&:hover fieldset': {
                    borderColor: '#f44336'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#f44336'
                  }
                },
                '& .MuiInputLabel-root': {
                  color: '#f44336',
                  fontWeight: 600,
                  '&.Mui-focused': { color: '#f44336' }
                }
              }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button 
              onClick={() => setCancelDialogOpen(false)}
              sx={{ color: customTheme.primary, fontWeight: 700 }}
            >
              Keep Report
            </Button>
            <Button 
              onClick={submitCancel} 
              variant="contained" 
              sx={{
                backgroundColor: '#f44336',
                fontWeight: 700,
                borderRadius: 3,
                px: 3,
                py: 1,
                '&:hover': {
                  backgroundColor: alpha('#f44336', 0.8),
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 25px ${alpha('#f44336', 0.3)}`
                }
              }}
            >
              Cancel Report
            </Button>
          </DialogActions>
        </Dialog>

        {/* Enhanced Assign Report Dialog */}
        <Dialog 
          open={assignDialogOpen} 
          onClose={() => setAssignDialogOpen(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 5,
              background: `
                linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)
              `,
              backdropFilter: 'blur(20px)',
              border: `3px solid ${alpha(customTheme.secondary, 0.3)}`
            }
          }}
        >
          <DialogTitle sx={{ color: customTheme.secondary, fontWeight: 800, fontSize: '1.5rem' }}>
            Assign Report to Team Member
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Typography variant="body1" sx={{ color: alpha(customTheme.primary, 0.8), mb: 3, fontWeight: 600 }}>
              Assign this report to a staff member or volunteer for investigation.
            </Typography>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel sx={{ color: customTheme.primary, fontWeight: 600 }}>Assign to</InputLabel>
              <Select
                value={assignToUser}
                onChange={(e) => setAssignToUser(e.target.value)}
                label="Assign to"
                sx={{
                  borderRadius: 3,
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(customTheme.secondary, 0.3),
                    borderWidth: 2
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: customTheme.secondary
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: customTheme.secondary
                  }
                }}
              >
                {availableStaff.map((staff) => (
                  <MenuItem key={staff.id} value={staff.id}>
                    {staff.username} - {staff.user_type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button 
              onClick={() => setAssignDialogOpen(false)}
              sx={{ color: customTheme.primary, fontWeight: 700 }}
            >
              Cancel
            </Button>
            <Button 
              onClick={submitAssignment} 
              variant="contained" 
              disabled={!assignToUser}
              sx={{
                backgroundColor: customTheme.secondary,
                fontWeight: 700,
                borderRadius: 3,
                px: 3,
                py: 1,
                '&:hover': {
                  backgroundColor: alpha(customTheme.secondary, 0.8),
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 25px ${alpha(customTheme.secondary, 0.3)}`
                }
              }}
            >
              Assign Report
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

export default ReportListPage;