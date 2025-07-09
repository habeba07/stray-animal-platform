import React, { useState } from 'react';
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Button,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useNotifications } from '../../context/NotificationContext';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';


function NotificationBell() {
  const [anchorEl, setAnchorEl] = useState(null);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  
  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

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
          navigate(`/adoption/applications/${notification.related_object_id}`);
          break;
        case 'animal':
          navigate(`/animals/${notification.related_object_id}`);
          break;
        default:
          break;
      }
    }
    
    handleClose();
  };

  const formatNotificationDate = (dateString) => {
    return format(new Date(dateString), 'PPp');
  };

  const getNotificationColor = (notification) => {
    return notification.is_read ? 'text.secondary' : 'text.primary';
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleOpen}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: '70vh',
            width: '350px',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Notifications</Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </Box>
        
        <Divider />
        
        {notifications.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2">No notifications</Typography>
          </MenuItem>
        ) : (
          <List sx={{ width: '100%', p: 0 }}>
            {notifications.map((notification) => (
              <React.Fragment key={notification.id}>
                <ListItem 
                  button
                  alignItems="flex-start"
                  onClick={() => handleNotificationClick(notification)}
                  sx={{ 
                    bgcolor: notification.is_read ? 'transparent' : 'action.hover',
                    py: 1
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" color={getNotificationColor(notification)}>
                        {notification.title}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" component="span">
                          {notification.message}
                        </Typography>
                        <br />
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

	{notifications.length > 0 && (
 	  <>
            <Divider />
    	    <Box sx={{ p: 1, textAlign: 'center' }}>
      	      <Button 
               onClick={() => {
          	 navigate('/notifications');
                 handleClose();
               }}
               size="small"
      	     >
               View All Notifications
      	     </Button>
    	   </Box>
  	</>
      )}

      </Menu>
    </>
  );
}

export default NotificationBell;