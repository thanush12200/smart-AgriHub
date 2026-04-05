import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axiosClient';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const fetchNotifications = async () => {
      try {
        const { data } = await api.get('/announcements');
        
        const mapped = data.announcements.map(a => ({
          _id: a._id,
          title: a.title,
          body: a.body,
          type: a.type,
          date: new Date(a.createdAt).toLocaleString(),
          isRead: false
        }));
        
        setNotifications(mapped);
        setUnreadCount(mapped.filter(n => !n.isRead).length);
      } catch (err) {
        console.error('Failed to fetch announcements', err);
      }
    };

    fetchNotifications();
    // In a real app we might set up a socket connection or polling here.
  }, [isAuthenticated]);

  const markAsRead = (id) => {
    setNotifications(prev => {
      const updated = prev.map(n => n._id === id ? { ...n, isRead: true } : n);
      setUnreadCount(updated.filter(n => !n.isRead).length);
      return updated;
    });
  };

  const markAllAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, isRead: true }));
      setUnreadCount(0);
      return updated;
    });
  };

  const addNotification = (notif) => {
    const newNotif = {
      _id: 'local-' + Date.now().toString(),
      ...notif,
      date: new Date().toLocaleString(),
      isRead: false
    };
    setNotifications(prev => [newNotif, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, addNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};
