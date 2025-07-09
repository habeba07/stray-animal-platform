import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../redux/api';
import { useSelector } from 'react-redux';
import { useWebSocket } from '../hooks/useWebSocket';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useSelector((state) => state.auth);
  
  // Use WebSocket for real-time notifications
  const { notifications: realtimeNotifications, isConnected } = useWebSocket();

  // Fetch notifications on initial load and when user changes
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // Handle new real-time notifications
  useEffect(() => {
    if (realtimeNotifications.length > 0) {
      const latestNotification = realtimeNotifications[0];
      
      // Add to notifications list (avoiding duplicates)
      setNotifications(prevNotifications => {
        const exists = prevNotifications.some(notif => 
          notif.title === latestNotification.title && 
          notif.body === latestNotification.body
        );
        
        if (!exists) {
          const newNotification = {
            id: Date.now(), // Temporary ID for real-time notifications
            title: latestNotification.title,
            message: latestNotification.body,
            is_read: false,
            created_at: new Date().toISOString(),
            notification_type: latestNotification.type
          };
          
          // Increment unread count
          setUnreadCount(prev => prev + 1);
          
          return [newNotification, ...prevNotifications];
        }
        return prevNotifications;
      });
    }
  }, [realtimeNotifications]);

  // Fetch all notifications
  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications/');
      setNotifications(response.data);
      setUnreadCount(response.data.filter(notif => !notif.is_read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Fetch unread notifications
  const fetchUnreadNotifications = async () => {
    try {
      const response = await api.get('/notifications/unread/');
      return response.data;
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      return [];
    }
  };

  // Mark a notification as read
  const markAsRead = async (notificationId) => {
    try {
      // Only call API for real database notifications (not temporary real-time ones)
      if (notificationId > 999999) {
        // This is a temporary real-time notification, just update local state
        setNotifications(prevNotifications =>
          prevNotifications.map(notif =>
            notif.id === notificationId ? { ...notif, is_read: true } : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } else {
        // This is a database notification, call API
        await api.post(`/notifications/${notificationId}/mark_as_read/`);
        
        // Update local state
        setNotifications(prevNotifications =>
          prevNotifications.map(notif =>
            notif.id === notificationId ? { ...notif, is_read: true } : notif
          )
        );
        
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/mark_all_as_read/');
      
      // Update local state
      setNotifications(prevNotifications =>
        prevNotifications.map(notif => ({ ...notif, is_read: true }))
      );
      
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const value = {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    isConnected // Expose WebSocket connection status
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
