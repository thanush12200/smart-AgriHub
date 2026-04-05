const { Server } = require('socket.io');

let io;

const initSocket = (httpServer) => {
  const configuredOrigins = (process.env.CLIENT_URL || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        const allowed = /^https:\/\/.*\.vercel\.app$/.test(origin) || 
                        configuredOrigins.includes(origin) || 
                        origin === 'http://localhost:5173' || 
                        origin === 'http://127.0.0.1:5173';
        callback(null, allowed ? origin : false);
      },
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    socket.on('join_region', (region) => {
      if (region) socket.join(`region:${region.toLowerCase()}`);
    });
  });

  return io;
};

const emitWeatherAlerts = (region, alerts) => {
  if (!io || !alerts?.length) return;
  io.to(`region:${region.toLowerCase()}`).emit('weather_alerts', alerts);
};

module.exports = { initSocket, emitWeatherAlerts };
