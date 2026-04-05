require('dotenv').config();

const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./config/logger');
const { initSocket } = require('./services/socketService');
const { seedAdminIfEnabled } = require('./services/adminBootstrapService');

const PORT = process.env.PORT || 5000;

const start = async () => {
  // ── Security guard: reject weak/default JWT secrets ──
  const jwtSecret = process.env.JWT_SECRET || '';
  const WEAK_DEFAULTS = ['change_me_super_secret', 'secret', 'jwt_secret', ''];
  if (WEAK_DEFAULTS.includes(jwtSecret) || jwtSecret.length < 32) {
    if (process.env.NODE_ENV === 'production') {
      logger.error(
        'FATAL: JWT_SECRET is missing, default, or too short (min 32 chars). ' +
          'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"'
      );
      process.exit(1);
    } else {
      logger.warn('WARNING: Using weak or default JWT_SECRET in development.');
    }
  }

  await connectDB();
  await seedAdminIfEnabled();
  const server = http.createServer(app);
  initSocket(server);

  server.listen(PORT, () => {
    logger.info(`Backend running on port ${PORT}`);
  });
};

start();
