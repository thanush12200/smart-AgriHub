import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axiosClient';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

const READ_IDS_KEY = 'smart_agri_read_notifications';

const loadReadIds = () => {
  try {
    const raw = localStorage.getItem(READ_IDS_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
};

const saveReadIds = (ids) => {
  localStorage.setItem(READ_IDS_KEY, JSON.stringify([...ids]));
};

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
        const readIds = loadReadIds();

        const mapped = data.announcements.map(a => ({
          _id: a._id,
          title: a.title,
          body: a.body,
          type: a.type,
          date: new Date(a.createdAt).toLocaleString(),
          isRead: readIds.has(a._id)
        }));

        setNotifications(mapped);
        setUnreadCount(mapped.filter(n => !n.isRead).length);
      } catch (err) {
        console.error('Failed to fetch announcements', err);
      }
    };

    fetchNotifications();
  }, [isAuthenticated]);

  const markAsRead = (id) => {
    setNotifications(prev => {
      const updated = prev.map(n => n._id === id ? { ...n, isRead: true } : n);
      setUnreadCount(updated.filter(n => !n.isRead).length);

      const readIds = loadReadIds();
      readIds.add(id);
      saveReadIds(readIds);

      return updated;
    });
  };

  const markAllAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, isRead: true }));
      setUnreadCount(0);

      const readIds = loadReadIds();
      updated.forEach(n => readIds.add(n._id));
      saveReadIds(readIds);

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
