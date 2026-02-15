require('dotenv').config();

const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./config/logger');
const { initSocket } = require('./services/socketService');
const { seedAdminIfEnabled } = require('./services/adminBootstrapService');

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  await seedAdminIfEnabled();
  const server = http.createServer(app);
  initSocket(server);

  server.listen(PORT, () => {
    logger.info(`Backend running on port ${PORT}`);
  });
};

start();
