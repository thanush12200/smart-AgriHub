import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export const useSocketAlerts = (region) => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    if (!region) return;

    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001');

    socket.on('connect', () => {
      socket.emit('join_region', region);
    });

    socket.on('weather_alerts', (incoming) => {
      setAlerts(incoming);
    });

    return () => {
      socket.disconnect();
    };
  }, [region]);

  return alerts;
};
