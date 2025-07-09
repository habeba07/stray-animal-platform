import React, { useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Box,
  Chip,
  Button,
} from '@mui/material';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { format } from 'date-fns';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

function NotificationsPage() {
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    // Refresh notifications when the page loads
    fetchNotifications();
  }, [fetchNotifications]);

  const handleNotificationClick = (notification) => {
    // Mark as read
    markAsRead(notification.id);
    
    // Navigate based on notification type and related object
    if (notification.related_object_type && notification.related_object_id) {
      switch(notification.related_object_type) {
        case 'report':
          navigate(`/reports/${notification.related_object_id}`);
          break;
        case 'adoption':
        case 'adoptionapplication':
          navigate(`/adoption/applications/${notification.related_object_id}`);
          break;
        case 'animal':
          navigate(`/animals/${notification.related_object_id}`);
          break;
        case 'donation':
          navigate(`/donations`);
          break;
        case 'volunteerassignment':
          navigate(`/volunteer/assignments`);
          break;
        default:
          break;
      }
    }
  };

  const formatNotificationDate = (dateString) => {
    return format(new Date(dateString), 'PPpp');
  };

  const getNotificationTypeColor = (type) => {
    switch (type) {
      case 'REPORT_UPDATE':
        return 'primary';
      case 'ADOPTION_UPDATE':
        return 'secondary';
      case 'VOLUNTEER_ASSIGNMENT':
        return 'success';
      case 'DONATION_RECEIVED':
        return 'error';
      case 'ANIMAL_UPDATE':
        return 'warning';
      case 'SYSTEM_MESSAGE':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Button 
              startIcon={<DoneAllIcon />}
              onClick={markAllAsRead}
              variant="outlined"
            >
              Mark All as Read
            </Button>
          )}
        </Box>

        <Divider sx={{ mb: 2 }} />

        {notifications.length === 0 ? (
          <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
            No notifications yet
          </Typography>
        ) : (
          <List>
            {notifications.map((notification) => (
              <React.Fragment key={notification.id}>
                <ListItem 
                  button
                  alignItems="flex-start"
                  onClick={() => handleNotificationClick(notification)}
                  sx={{ 
                    bgcolor: notification.is_read ? 'transparent' : 'action.hover',
                    py: 1.5
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="subtitle1">
                          {notification.title}
                        </Typography>
                        <Chip 
                          label={notification.notification_type.replace('_', ' ')} 
                          size="small"
                          color={getNotificationTypeColor(notification.notification_type)}
                        />
                        {!notification.is_read && (
                          <Chip label="New" size="small" color="error" variant="outlined" />
                        )}
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" component="div" sx={{ mb: 1 }}>
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatNotificationDate(notification.created_at)}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
}

export default NotificationsPage;