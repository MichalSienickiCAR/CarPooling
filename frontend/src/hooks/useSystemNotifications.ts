import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Notification as NotificationType } from '../services/api';

interface UseSystemNotificationsOptions {
  notifications: NotificationType[];
  notificationsEnabled: boolean;
  onNotificationClick?: (notification: NotificationType) => void;
}

export const useSystemNotifications = ({ notifications, notificationsEnabled, onNotificationClick }: UseSystemNotificationsOptions) => {
  const navigate = useNavigate();
  const previousNotificationsRef = useRef<Set<number>>(new Set());
  const permissionRequestedRef = useRef(false);

  useEffect(() => {
    if (!notificationsEnabled || permissionRequestedRef.current) return;
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        permissionRequestedRef.current = true;
        if (permission === 'granted') {
          console.log('Powiadomienia systemowe włączone');
        } else {
          console.log('Powiadomienia systemowe zablokowane');
        }
      });
    } else {
      permissionRequestedRef.current = true;
    }
  }, [notificationsEnabled]);

  useEffect(() => {
    if (!notificationsEnabled) return;
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;
    const newNotifications = notifications.filter((notification: NotificationType) => !notification.read && !previousNotificationsRef.current.has(notification.id));
    newNotifications.forEach((notification: NotificationType) => {
      previousNotificationsRef.current.add(notification.id);
      const systemNotification = new Notification('Sheero - Nowe powiadomienie', {
        body: notification.message,
        icon: '/logo192.png',
        tag: `notification-${notification.id}`,
        requireInteraction: false,
        silent: false,
      });
      systemNotification.onclick = () => {
        window.focus();
        if (onNotificationClick) {
          onNotificationClick(notification);
        } else if (notification.trip_info) {
          navigate(`/trips/${notification.trip_info.id}`);
        } else if (notification.trip) {
          navigate(`/trips/${notification.trip}`);
        }
        systemNotification.close();
      };
      setTimeout(() => { systemNotification.close(); }, 5000);
    });
    notifications.forEach((notification: NotificationType) => { if (!notification.read) { previousNotificationsRef.current.add(notification.id); } });
  }, [notifications, notificationsEnabled, navigate, onNotificationClick]);

  useEffect(() => { return () => { previousNotificationsRef.current.clear(); }; }, []);
};
