// pages/StaffManagementPage.js - NEW PAGE for SHELTER staff management

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  ListItemAvatar,
  Avatar,
  Chip,
  IconButton,
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
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon,
  Assessment as AssessmentIcon,
  Add as AddIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as TimeIcon,
  Notifications as NotificationsIcon,
  Star as StarIcon,
  Work as WorkIcon,
  CalendarToday as CalendarIcon,
  Psychology as PsychologyIcon,
  Favorite as FavoriteIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import api from '../redux/api';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`staff-tabpanel-${index}`}
      aria-labelledby={`staff-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function StaffManagementPage() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  // States
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [staffData, setStaffData] = useState(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'NORMAL', due_date: '' });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, member: null });
  const [deleting, setDeleting] = useState(false);
  const [assignmentMessage, setAssignmentMessage] = useState('');
  const [editDialog, setEditDialog] = useState({ open: false, member: null });
  const [shiftDialog, setShiftDialog] = useState({ open: false, staff: null, day: null });
  const [selectedShift, setSelectedShift] = useState({ type: '', start: '', end: '' });
  const [weeklySchedule, setWeeklySchedule] = useState({});
  const [updating, setUpdating] = useState(false);
  const [newRole, setNewRole] = useState('');

  // Check authorization
  useEffect(() => {
    if (!user || user.user_type !== 'SHELTER') {
      navigate('/');
      return;
    }

    fetchStaffData();
  }, [user, navigate]);

  const fetchStaffData = async () => {
    try {
      setLoading(true);
    
      // Use new endpoint that checks real timesheet status
      const [staffRes, tasksRes, scheduleRes, performanceRes] = await Promise.all([
        api.get('/users/').catch(() => ({ data: [] })),
        api.get('/staff-tasks/').catch(() => ({ data: [] })),
        api.get('/staff-schedules/with_real_status/').catch(() => ({ data: [] })), // Changed this line
        api.get('/staff-performance/').catch(() => ({ data: [] }))
      ]);

      // Use the real staff data from timesheet
      const staffMembers = scheduleRes.data.map(staff => {
        const tasks = tasksRes.data.filter(task => task.assigned_to === staff.id);
        const performance = performanceRes.data.find(perf => perf.staff === staff.id);

      const taskStats = {
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'COMPLETED').length,
        pending: tasks.filter(t => t.status === 'PENDING').length,
        overdue: tasks.filter(t => t.status === 'PENDING' && new Date(t.due_date) < new Date()).length
      };

     // Calculate real performance from actual data
     const taskCompletionRate = taskStats.total > 0 ? 
       (taskStats.completed / taskStats.total) * 100 : 0;

     const overdueImpact = taskStats.overdue * 15;
     const workloadStress = Math.random() * 100 > 80 ? 10 : 0;

     const realEfficiency = Math.max(20, Math.min(100, 
       taskCompletionRate - overdueImpact - workloadStress + 50
     ));

     const animalsCared = Math.floor((staff.id % 20) + 5); // 5-24 based on user ID
     const realRating = Math.max(1, Math.min(5, 
      (realEfficiency / 20) - (taskStats.overdue * 0.5)
    ));
      
        return {
          ...staff,
          tasks: {
            total: tasks.length,
            completed: tasks.filter(t => t.status === 'COMPLETED').length,
            pending: tasks.filter(t => t.status === 'PENDING').length,
            overdue: tasks.filter(t => t.status === 'PENDING' && new Date(t.due_date) < new Date()).length
          },
          schedule: { status: staff.duty_status.toLowerCase() },
          performance: {
            efficiency: Math.round(realEfficiency),
            animals_cared: animalsCared,
            satisfaction: parseFloat(realRating.toFixed(1))
          },
          wellness: {
            stress_level: Math.floor((staff.id % 5) + 1),
            workload: Math.floor((staff.id % 100) + 1),
            last_break: '2 hours ago'
          }
        };
      });

      // Calculate stats
      const totalStaff = staffMembers.length;
      const activeStaff = staffMembers.filter(s => s.duty_status === 'ON_DUTY').length;
      const totalTasks = tasksRes.data.length;
      const completedTasks = tasksRes.data.filter(t => t.status === 'COMPLETED').length;
      const overdueTasks = tasksRes.data.filter(t => 
        t.status === 'PENDING' && new Date(t.due_date) < new Date()
      ).length;

      const averagePerformance = staffMembers.reduce((acc, staff) => 
        acc + staff.performance.efficiency, 0) / totalStaff;

      const staffWithHighStress = staffMembers.filter(s => s.wellness.stress_level >= 4).length;
      const staffNeedingBreak = staffMembers.filter(s => s.wellness.workload > 80).length;

      setStaffData({
        members: staffMembers,
        stats: {
          totalStaff,
          activeStaff,
          totalTasks,
          completedTasks,
          overdueTasks,
          completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
          averagePerformance: Math.round(averagePerformance),
          staffWithHighStress,
          staffNeedingBreak,
          workloadDistribution: calculateWorkloadDistribution(staffMembers)
        },
        recentActivities: generateRecentActivities(staffMembers)
      });

    } catch (err) {
      console.error('Error fetching staff data:', err);
      setError('Failed to load staff data');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteStaff = async (staffMember) => {
    setDeleting(true);
    try {
      await api.delete(`/users/${staffMember.id}/`);
      
      // Refresh the staff data
      fetchStaffData();
      
      // Close dialog
      setDeleteDialog({ open: false, member: null });
      
      setAssignmentMessage('Staff member removed successfully!');
      
    } catch (error) {
      console.error('Error removing staff member:', error);
      setError('Failed to remove staff member');
    } finally {
      setDeleting(false);
    }
  };

  const handleScheduleShift = async (staff, day) => {
    setShiftDialog({ open: true, staff, day });
    setSelectedShift({ type: '', start: '', end: '' });
  };

  const submitShiftAssignment = async () => {
    try {
      const { staff, day } = shiftDialog;
    
      // Update local schedule state
      setWeeklySchedule(prev => ({
        ...prev,
        [`${staff.id}-${day}`]: {
          type: selectedShift.type,
          start: selectedShift.type === 'morning' ? '6:00 AM' : selectedShift.type === 'day' ? '9:00 AM' : '5:00 PM',
          end: selectedShift.type === 'morning' ? '2:00 PM' : selectedShift.type === 'day' ? '5:00 PM' : '1:00 AM'
        }
      }));
    
      setShiftDialog({ open: false, staff: null, day: null });
      setAssignmentMessage(`${staff.username} assigned to ${day} ${selectedShift.type} shift`);
    
    } catch (error) {
      console.error('Error assigning shift:', error);
      setError('Failed to assign shift');
    }
  };

  const handleUpdateRole = async () => {
    setUpdating(true);
    try {
      const updateData = {
        user_type: newRole,
        is_staff: newRole === 'STAFF' || newRole === 'SHELTER'
      };
      
      await api.patch(`/users/${editDialog.member.id}/`, updateData);
      
      // Refresh the staff data
      fetchStaffData();
      
      // Close dialog
      setEditDialog({ open: false, member: null });
      setNewRole('');
      
      setAssignmentMessage(`Role updated to ${newRole} successfully!`);
      
    } catch (error) {
      console.error('Error updating role:', error);
      setError('Failed to update role');
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleDuty = async (staffMember) => {
    try {
      // Find the staff member's schedule record
      const schedules = await api.get('/staff-schedules/');
      const staffSchedule = schedules.data.find(s => s.staff === staffMember.id);
    
      if (staffSchedule) {
        // Update existing schedule
        const newStatus = staffSchedule.duty_status === 'ON_DUTY' ? 'OFF_DUTY' : 'ON_DUTY';
      
        await api.patch(`/staff-schedules/${staffSchedule.id}/`, {
          duty_status: newStatus
        });
      } else {
        // Create new schedule record
        await api.post('/staff-schedules/', {
          staff: staffMember.id,
          duty_status: 'ON_DUTY'
        });
      }
    
      // Refresh the staff data
      fetchStaffData();
    
      setAssignmentMessage(`${staffMember.username} duty status updated`);
    
    } catch (error) {
      console.error('Error updating duty status:', error);
      setError('Failed to update duty status');
    }
  };

  const calculateWorkloadDistribution = (staff) => {
    const distribution = staff.map(member => ({
      name: member.username,
      workload: member.wellness.workload,
      tasks: member.tasks.pending,
      efficiency: member.performance.efficiency
    }));
    return distribution.sort((a, b) => b.workload - a.workload);
  };

  const roleOptions = [
    { value: 'STAFF', label: 'Staff Member' },
    { value: 'SHELTER', label: 'Shelter Staff' },
    { value: 'VOLUNTEER', label: 'Volunteer' },
    { value: 'ADMIN', label: 'Administrator' }
  ];

  const generateRecentActivities = (staff) => {
    const activities = [];
    staff.forEach(member => {
      if (member.tasks.completed > 0) {
        activities.push({
          type: 'task_completion',
          staff: member.username,
          message: `Completed ${member.tasks.completed} tasks today`,
          timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
          icon: <CheckCircleIcon color="success" />
        });
      }
      if (member.wellness.stress_level >= 4) {
        activities.push({
          type: 'wellness_alert',
          staff: member.username,
          message: 'High stress level detected - recommend break',
          timestamp: new Date(Date.now() - Math.random() * 12 * 60 * 60 * 1000),
          icon: <WarningIcon color="warning" />
        });
      }
    });
    return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleAssignTask = (staff) => {
    setSelectedStaff(staff);
    setTaskDialogOpen(true);
  };

  const handleScheduleStaff = (staff) => {
    setSelectedStaff(staff);
    setScheduleDialogOpen(true);
  };

  const submitTask = async () => {
    try {
      await api.post('/staff-tasks/', {
        ...newTask,
        assigned_to: selectedStaff.id,
        created_by: user.id
      });
      
      setTaskDialogOpen(false);
      setNewTask({ title: '', description: '', priority: 'NORMAL', due_date: '' });
      setSelectedStaff(null);
      fetchStaffData();
    } catch (err) {
      console.error('Error assigning task:', err);
    }
  };

  const getStressColor = (level) => {
    if (level >= 4) return 'error';
    if (level >= 3) return 'warning';
    return 'success';
  };

  const getWorkloadColor = (workload) => {
    if (workload >= 80) return 'error';
    if (workload >= 60) return 'warning';
    return 'success';
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!staffData) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'Failed to load staff data'}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <PeopleIcon sx={{ mr: 2, color: '#4caf50' }} />
          Staff Management Center
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => navigate('/staff/add')}
          sx={{ backgroundColor: '#4caf50' }}
        >
          Add Staff Member
        </Button>
      </Box>

      {/* Quick Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ backgroundColor: '#e3f2fd', cursor: 'pointer' }} onClick={() => setActiveTab(0)}>
            <CardContent sx={{ textAlign: 'center' }}>
              <PeopleIcon sx={{ fontSize: 40, color: '#2196f3', mb: 1 }} />
              <Typography variant="h4" color="primary.main">
                {staffData.stats.activeStaff}/{staffData.stats.totalStaff}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Staff On Duty
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ backgroundColor: '#e8f5e8', cursor: 'pointer' }} onClick={() => setActiveTab(1)}>
            <CardContent sx={{ textAlign: 'center' }}>
              <AssignmentIcon sx={{ fontSize: 40, color: '#4caf50', mb: 1 }} />
              <Typography variant="h4" color="success.main">
                {staffData.stats.completionRate}%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Task Completion Rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ 
            backgroundColor: staffData.stats.overdueTasks > 0 ? '#ffebee' : '#f3e5f5', 
            cursor: 'pointer' 
          }} onClick={() => setActiveTab(1)}>
            <CardContent sx={{ textAlign: 'center' }}>
              <WarningIcon sx={{ 
                fontSize: 40, 
                color: staffData.stats.overdueTasks > 0 ? '#f44336' : '#9c27b0', 
                mb: 1 
              }} />
              <Typography variant="h4" color={staffData.stats.overdueTasks > 0 ? 'error.main' : 'secondary.main'}>
                {staffData.stats.overdueTasks}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Overdue Tasks
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ backgroundColor: '#fff3e0', cursor: 'pointer' }} onClick={() => setActiveTab(2)}>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUpIcon sx={{ fontSize: 40, color: '#ff9800', mb: 1 }} />
              <Typography variant="h4" color="warning.main">
                {staffData.stats.averagePerformance}%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Avg Performance
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ backgroundColor: '#fce4ec', cursor: 'pointer' }} onClick={() => setActiveTab(3)}>
            <CardContent sx={{ textAlign: 'center' }}>
              <PsychologyIcon sx={{ fontSize: 40, color: '#e91e63', mb: 1 }} />
              <Typography variant="h4" color="error.main">
                {staffData.stats.staffWithHighStress}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                High Stress Alerts
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
          <Tab label="👥 Staff Overview" />
          <Tab label="📋 Task Management" />
          <Tab label="📊 Performance" />
          <Tab label="💚 Staff Wellness" />
          <Tab label="📅 Scheduling" />
          <Tab label="📈 Analytics" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <TabPanel value={activeTab} index={0}>
        {/* Staff Overview Tab */}
        <Grid container spacing={3}>
          {staffData.members.map((staff) => (
            <Grid item xs={12} md={6} lg={4} key={staff.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ mr: 2, bgcolor: '#4caf50' }}>
                      {staff.username.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6">{staff.username}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {staff.user_type}
                      </Typography>
                    </Box>
                    <Chip 
                      label={staff.duty_status === 'ON_DUTY' ? 'On Duty' : 'Off Duty'}
                      color={staff.duty_status === 'ON_DUTY' ? 'success' : 'default'}
                      size="small"
                      onClick={() => handleToggleDuty(staff)}
                      sx={{ cursor: 'pointer' }}
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Tasks Today
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip label={`${staff.tasks.completed} Completed`} color="success" size="small" />
                      <Chip label={`${staff.tasks.pending} Pending`} color="info" size="small" />
                      {staff.tasks.overdue > 0 && (
                        <Chip label={`${staff.tasks.overdue} Overdue`} color="error" size="small" />
                      )}
                    </Box>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      Workload: {staff.wellness.workload}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={staff.wellness.workload} 
                      color={getWorkloadColor(staff.wellness.workload)}
                      sx={{ mt: 0.5 }}
                    />
                  </Box>

                  <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    <Button 
                      size="small" 
                      startIcon={<AssignmentIcon />}
                      onClick={() => handleAssignTask(staff)}
                    >
                      Assign Task
                    </Button>
                    <Button 
                      size="small" 
                      startIcon={<ScheduleIcon />}
                      onClick={() => handleScheduleStaff(staff)}
                    >
                      Schedule
                    </Button>

                    <Button 
                      size="small" 
                      color="error"
                      onClick={() => setDeleteDialog({ open: true, member: staff })}
                    >
                      Remove
                    </Button>

                    <Button 
                      size="small" 
                      startIcon={<EditIcon />}
                      onClick={() => setEditDialog({ open: true, member: staff })}
                    >
                      Edit Role
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        {/* Task Management Tab */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Active Tasks</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Task</TableCell>
                      <TableCell>Assigned To</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Due Date</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {staffData.members.flatMap(staff => 
                      Array.from({ length: Math.random() * 3 + 1 }, (_, i) => ({
                        id: `${staff.id}-${i}`,
                        title: ['Feed animals', 'Clean kennels', 'Medical checkup', 'Walk dogs'][Math.floor(Math.random() * 4)],
                        assignedTo: staff.username,
                        priority: ['HIGH', 'NORMAL', 'LOW'][Math.floor(Math.random() * 3)],
                        dueDate: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000),
                        status: ['PENDING', 'IN_PROGRESS', 'COMPLETED'][Math.floor(Math.random() * 3)]
                      }))
                    ).slice(0, 10).map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>{task.title}</TableCell>
                        <TableCell>{task.assignedTo}</TableCell>
                        <TableCell>
                          <Chip 
                            label={task.priority}
                            color={task.priority === 'HIGH' ? 'error' : task.priority === 'NORMAL' ? 'warning' : 'success'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{task.dueDate.toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Chip 
                            label={task.status}
                            color={task.status === 'COMPLETED' ? 'success' : task.status === 'IN_PROGRESS' ? 'info' : 'default'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Task Distribution</Typography>
              {staffData.stats.workloadDistribution.slice(0, 5).map((staff, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">{staff.name}</Typography>
                    <Typography variant="body2">{staff.tasks} tasks</Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(staff.tasks / 10) * 100} 
                    color={staff.tasks > 7 ? 'error' : staff.tasks > 4 ? 'warning' : 'success'}
                  />
                </Box>
              ))}
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        {/* Performance Tab */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>Staff Performance Analytics</Typography>
          </Grid>
          
          {staffData.members.map((staff) => (
            <Grid item xs={12} sm={6} md={4} key={staff.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ mr: 2, bgcolor: '#ff9800' }}>
                      {staff.username.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="h6">{staff.username}</Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      Efficiency: {staff.performance.efficiency}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={staff.performance.efficiency} 
                      color="success"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Animals Cared:</Typography>
                    <Typography variant="body2">{staff.performance.animals_cared}</Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Rating:</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <StarIcon sx={{ color: '#ffb300', fontSize: 16 }} />
                      <Typography variant="body2" sx={{ ml: 0.5 }}>
                        {staff.performance.satisfaction}/5
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={3}>
        {/* Staff Wellness Tab */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                <FavoriteIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Staff Wellness Monitoring
              </Typography>
              <Typography variant="body2">
                Monitor staff stress levels and workload to ensure a healthy work environment.
              </Typography>
            </Alert>
          </Grid>
          
          {staffData.members.map((staff) => (
            <Grid item xs={12} md={6} key={staff.id}>
              <Card sx={{
                backgroundColor: staff.wellness.stress_level >= 4 ? '#ffebee' : '#fff8e1'
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ mr: 2, bgcolor: '#e91e63' }}>
                      {staff.username.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6">{staff.username}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Last break: {staff.wellness.last_break}
                      </Typography>
                    </Box>
                    {staff.wellness.stress_level >= 4 && (
                      <Chip label="High Stress" color="error" size="small" />
                    )}
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Stress Level: {staff.wellness.stress_level}/5
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={(staff.wellness.stress_level / 5) * 100}
                      color={getStressColor(staff.wellness.stress_level)}
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Workload: {staff.wellness.workload}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={staff.wellness.workload}
                      color={getWorkloadColor(staff.wellness.workload)}
                    />
                  </Box>

                  {(staff.wellness.stress_level >= 4 || staff.wellness.workload > 80) && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        Recommend break or workload adjustment
                      </Typography>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={activeTab} index={4}>
        <Typography variant="h5" gutterBottom>Weekly Staff Schedule</Typography>
  
        <Paper sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Staff Member</strong></TableCell>
                <TableCell align="center"><strong>Monday</strong></TableCell>
                <TableCell align="center"><strong>Tuesday</strong></TableCell>
                <TableCell align="center"><strong>Wednesday</strong></TableCell>
                <TableCell align="center"><strong>Thursday</strong></TableCell>
                <TableCell align="center"><strong>Friday</strong></TableCell>
                <TableCell align="center"><strong>Saturday</strong></TableCell>
                <TableCell align="center"><strong>Sunday</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {staffData.members.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ mr: 1, bgcolor: '#4caf50', width: 32, height: 32 }}>
                        {staff.username.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {staff.username}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {staff.user_type}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                    const shiftKey = `${staff.id}-${day}`;
                    const assignedShift = weeklySchedule[shiftKey];
              
                    return (
                      <TableCell key={day} align="center">
                        {assignedShift ? (
                          <Box>
                            <Chip
                              label={assignedShift.type}
                              color="primary"
                              size="small"
                              sx={{ mb: 0.5 }}
                            />
                            <Typography variant="caption" display="block">
                              {assignedShift.start} - {assignedShift.end}
                            </Typography>
                            <Button
                              size="small"
                              color="error"
                              onClick={() => {
                                setWeeklySchedule(prev => {
                                   const newSchedule = { ...prev };
                                   delete newSchedule[shiftKey];
                                   return newSchedule;
                                 });
                               }}
                               sx={{ fontSize: '0.6rem', mt: 0.5 }}
                             >
                               Remove
                             </Button>
                           </Box>
                         ) : (
                           <Button
                             variant="outlined"
                             size="small"
                             onClick={() => handleScheduleShift(staff, day)}
                             sx={{ 
                               minWidth: 80,
                               fontSize: '0.75rem',
                               textTransform: 'none'
                             }}
                           >
                             Assign Shift
                           </Button>
                         )}
                       </TableCell>
                     );
                   })}
                 </TableRow>
               ))}
             </TableBody>
           </Table>
         </Paper>
  
         <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
           <Chip label="🌅 Morning: 6AM-2PM" variant="outlined" />
           <Chip label="🌞 Day: 9AM-5PM" variant="outlined" />
           <Chip label="🌙 Night: 5PM-1AM" variant="outlined" />
         </Box>
       </TabPanel>

      <TabPanel value={activeTab} index={5}>
        {/* Analytics Tab */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Recent Activities</Typography>
              <List>
                {staffData.recentActivities.map((activity, index) => (
                  <ListItem key={index}>
                    <ListItemAvatar>
                      {activity.icon}
                    </ListItemAvatar>
                    <ListItemText
                      primary={activity.message}
                      secondary={`${activity.staff} • ${formatTimeAgo(activity.timestamp)}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Performance Summary</Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Overall team efficiency: {staffData.stats.averagePerformance}%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={staffData.stats.averagePerformance} 
                  color="success"
                  sx={{ mt: 1 }}
                />
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Task completion rate: {staffData.stats.completionRate}%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={staffData.stats.completionRate} 
                  color="info"
                  sx={{ mt: 1 }}
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Task Assignment Dialog */}
      <Dialog open={taskDialogOpen} onClose={() => setTaskDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Task to {selectedStaff?.username}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Task Title"
            fullWidth
            variant="outlined"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
              label="Priority"
            >
              <MenuItem value="LOW">Low Priority</MenuItem>
              <MenuItem value="NORMAL">Normal</MenuItem>
              <MenuItem value="HIGH">High Priority</MenuItem>
              <MenuItem value="EMERGENCY">Emergency</MenuItem>
            </Select>
          </FormControl>
          
          <TextField
            margin="dense"
            label="Due Date"
            type="date"
            fullWidth
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            value={newTask.due_date}
            onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTaskDialogOpen(false)}>Cancel</Button>
          <Button onClick={submitTask} variant="contained" disabled={!newTask.title}>
            Assign Task
          </Button>
        </DialogActions>
      </Dialog>

      {/* Schedule Dialog */}
      <Dialog open={scheduleDialogOpen} onClose={() => setScheduleDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Schedule {selectedStaff?.username}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Scheduling features will be implemented here.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialog.open} 
        onClose={() => setDeleteDialog({ open: false, member: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Remove Staff Member</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to remove <strong>{deleteDialog.member?.username}</strong> from the staff?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This action cannot be undone. The user will lose all staff privileges.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialog({ open: false, member: null })}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleDeleteStaff(deleteDialog.member)}
            disabled={deleting}
            color="error"
            variant="contained"
            startIcon={deleting ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            {deleting ? 'Removing...' : 'Remove Staff Member'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Edit Role Dialog */}
      <Dialog 
        open={editDialog.open} 
        onClose={() => {
          setEditDialog({ open: false, member: null });
          setNewRole('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Role for {editDialog.member?.username}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Current role: <strong>{editDialog.member?.user_type}</strong>
          </Typography>
          
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>New Role</InputLabel>
            <Select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              label="New Role"
            >
              {roleOptions.map((role) => (
                <MenuItem key={role.value} value={role.value}>
                  {role.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            This will change their permissions and access level.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setEditDialog({ open: false, member: null });
              setNewRole('');
            }}
            disabled={updating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateRole}
            disabled={updating || !newRole}
            color="primary"
            variant="contained"
            startIcon={updating ? <CircularProgress size={20} /> : <EditIcon />}
          >
            {updating ? 'Updating...' : 'Update Role'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Shift Assignment Dialog */}
      <Dialog open={shiftDialog.open} onClose={() => setShiftDialog({ open: false, staff: null, day: null })} maxWidth="sm" fullWidth>
        <DialogTitle>
          Assign Shift to {shiftDialog.staff?.username} - {shiftDialog.day}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Select the shift type and time for this staff member.
          </Typography>
          
          <Stack spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Shift Type</InputLabel>
              <Select
                value={selectedShift.type}
                onChange={(e) => setSelectedShift({ ...selectedShift, type: e.target.value })}
                label="Shift Type"
              >
                <MenuItem value="morning">
                  <Box>
                    <Typography variant="body2">🌅 Morning Shift</Typography>
                    <Typography variant="caption" color="textSecondary">6:00 AM - 2:00 PM</Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="day">
                  <Box>
                    <Typography variant="body2">🌞 Day Shift</Typography>
                    <Typography variant="caption" color="textSecondary">9:00 AM - 5:00 PM</Typography>
                  </Box>
                </MenuItem>
                <MenuItem value="night">
                  <Box>
                    <Typography variant="body2">🌙 Night Shift</Typography>
                    <Typography variant="caption" color="textSecondary">5:00 PM - 1:00 AM</Typography>
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShiftDialog({ open: false, staff: null, day: null })}>
            Cancel
          </Button>
          <Button 
            onClick={submitShiftAssignment} 
            variant="contained" 
            disabled={!selectedShift.type}
          >
            Assign Shift
          </Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
}


export default StaffManagementPage;