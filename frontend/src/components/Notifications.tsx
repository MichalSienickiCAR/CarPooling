import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Stack, IconButton, Badge, Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText, ListItemButton, Button, Chip, Divider } from '@mui/material';
import { Notifications as NotificationsIcon, Close, CheckCircle, DirectionsCar, ArrowForward } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { notificationService, Notification, authService } from '../services/api';
import { useSystemNotifications } from '../hooks/useSystemNotifications';

export const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const [allNotifications, count] = await Promise.all([
        notificationService.getNotifications(),
        notificationService.getUnreadCount(),
      ]);
      setNotifications(allNotifications);
      setUnreadCount(count);
    } catch (error) {
      enqueueSnackbar('Nie udało się pobrać powiadomień.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadUserSettings = async () => {
      try {
        const profile = await authService.getUserProfile();
        setNotificationsEnabled(profile.notifications_enabled ?? true);
      } catch (error) {
      }
    };
    loadUserSettings();
  }, []);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useSystemNotifications({
    notifications,
    notificationsEnabled,
    onNotificationClick: (notification) => {
      if (notification.trip_info) {
        navigate(`/trips/${notification.trip_info.id}`);
        setDialogOpen(false);
      } else if (notification.trip) {
        navigate(`/trips/${notification.trip}`);
        setDialogOpen(false);
      }
    },
  });

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(notifications.map(n => n.id === notificationId ? { ...n, read: true } : n));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      enqueueSnackbar('Nie udało się oznaczyć powiadomienia.', { variant: 'error' });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      enqueueSnackbar('Wszystkie powiadomienia oznaczone jako przeczytane.', { variant: 'success' });
    } catch (error) {
      enqueueSnackbar('Nie udało się oznaczyć powiadomień.', { variant: 'error' });
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await handleMarkAsRead(notification.id);
    }
    if (notification.trip_info) {
      navigate(`/trips/${notification.trip_info.id}`);
      setDialogOpen(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Przed chwilą';
    if (diffMins < 60) return `${diffMins} min temu`;
    if (diffHours < 24) return `${diffHours} godz. temu`;
    if (diffDays < 7) return `${diffDays} dni temu`;
    return date.toLocaleDateString('pl-PL');
  };

  return (
    <>
      <IconButton onClick={() => setDialogOpen(true)} sx={{ color: '#000' }} title="Powiadomienia">
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '30px' } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="bold">Powiadomienia{unreadCount > 0 && (<Chip label={unreadCount} color="error" size="small" sx={{ ml: 2 }} />)}</Typography>
          <Box>
            {unreadCount > 0 && (<Button size="small" onClick={handleMarkAllAsRead} sx={{ mr: 1, textTransform: 'none' }}>Oznacz wszystkie jako przeczytane</Button>)}
            <IconButton size="small" onClick={() => setDialogOpen(false)}><Close /></IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}><Typography>Ładowanie...</Typography></Box>
          ) : notifications.length === 0 ? (
            <Box textAlign="center" py={4}><NotificationsIcon sx={{ fontSize: 60, color: '#e0e0e0', mb: 2 }} /><Typography color="textSecondary">Brak powiadomień</Typography></Box>
          ) : (
            <List>
              {notifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <ListItem disablePadding sx={{ bgcolor: notification.read ? 'transparent' : '#f5f5f5', borderRadius: '15px', mb: 1 }}>
                    <ListItemButton onClick={() => handleNotificationClick(notification)} sx={{ borderRadius: '15px' }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', gap: 2 }}>
                        <DirectionsCar sx={{ color: notification.read ? '#9e9e9e' : '#c62828', mt: 0.5 }} />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body1" sx={{ fontWeight: notification.read ? 'normal' : 'bold', mb: 0.5 }}>{notification.message}</Typography>
                          {notification.trip_info && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, color: '#757575' }}>
                              <Typography variant="caption">{notification.trip_info.start_location}</Typography>
                              <ArrowForward fontSize="small" />
                              <Typography variant="caption">{notification.trip_info.end_location}</Typography>
                              <Typography variant="caption" sx={{ ml: 1 }}>• {notification.trip_info.price_per_seat} zł</Typography>
                            </Box>
                          )}
                          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5 }}>{formatDate(notification.created_at)}</Typography>
                        </Box>
                        {!notification.read && (<IconButton size="small" onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notification.id); }} sx={{ color: '#c62828' }}><CheckCircle fontSize="small" /></IconButton>)}
                      </Box>
                    </ListItemButton>
                  </ListItem>
                  {index < notifications.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
