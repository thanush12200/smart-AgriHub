const { Server } = require('socket.io');

let io;

const initSocket = (httpServer) => {
  const configuredOrigins = (process.env.CLIENT_URL || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  io = new Server(httpServer, {
    cors: {
      origin: configuredOrigins.length
        ? configuredOrigins
        : ['http://localhost:5173', 'http://127.0.0.1:5173'],
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
