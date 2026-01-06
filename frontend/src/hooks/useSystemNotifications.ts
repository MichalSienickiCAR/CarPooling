import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Notification as NotificationType } from '../services/api';

interface UseSystemNotificationsOptions {
  notifications: NotificationType[];
  notificationsEnabled: boolean;
  onNotificationClick?: (notification: NotificationType) => void;
}

export const useSystemNotifications = ({
  notifications,
  notificationsEnabled,
  onNotificationClick,
}: UseSystemNotificationsOptions) => {
  const navigate = useNavigate();
  const previousNotificationsRef = useRef<Set<number>>(new Set());
  const permissionRequestedRef = useRef(false);

  // Prośba o pozwolenie przy pierwszym użyciu
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

  // Pokazuj powiadomienia systemowe dla nowych powiadomień
  useEffect(() => {
    if (!notificationsEnabled) return;
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    // Znajdź nowe powiadomienia (nieprzeczytane, których jeszcze nie pokazywaliśmy)
    const newNotifications = notifications.filter(
      (notification: NotificationType) =>
        !notification.read &&
        !previousNotificationsRef.current.has(notification.id)
    );

    newNotifications.forEach((notification: NotificationType) => {
      // Dodaj do zbioru pokazanych powiadomień
      previousNotificationsRef.current.add(notification.id);

      // Utwórz powiadomienie systemowe
      const systemNotification = new Notification('Sheero - Nowe powiadomienie', {
        body: notification.message,
        icon: '/logo192.png', // Możesz zmienić na własną ikonę
        tag: `notification-${notification.id}`, // Zapobiega duplikatom
        requireInteraction: false, // Zniknie automatycznie
        silent: false,
      });

      // Obsługa kliknięcia w powiadomienie
      systemNotification.onclick = () => {
        window.focus(); // Przełącz na okno przeglądarki
        
        if (onNotificationClick) {
          onNotificationClick(notification);
        } else if (notification.trip_info) {
          // Domyślnie: przejdź do szczegółów przejazdu
          navigate(`/trips/${notification.trip_info.id}`);
        } else if (notification.trip) {
          navigate(`/trips/${notification.trip}`);
        }
        
        systemNotification.close();
      };

      // Automatyczne zamknięcie po 5 sekundach
      setTimeout(() => {
        systemNotification.close();
      }, 5000);
    });

    // Aktualizuj zbiór wszystkich powiadomień (dla nieprzeczytanych)
    notifications.forEach((notification: NotificationType) => {
      if (!notification.read) {
        previousNotificationsRef.current.add(notification.id);
      }
    });
  }, [notifications, notificationsEnabled, navigate, onNotificationClick]);

  // Czyszczenie przy odmontowaniu
  useEffect(() => {
    return () => {
      previousNotificationsRef.current.clear();
    };
  }, []);
};

