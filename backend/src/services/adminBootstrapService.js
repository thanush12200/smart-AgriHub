const User = require('../models/User');
const logger = require('../config/logger');

const seedAdminIfEnabled = async () => {
  // Never auto-seed in production
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  const enabled = String(process.env.AUTO_SEED_ADMIN || '').toLowerCase() === 'true';
  if (!enabled) return;

  const email = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = String(process.env.ADMIN_PASSWORD || '').trim();

  if (!email || !password) {
    logger.warn('AUTO_SEED_ADMIN=true but ADMIN_EMAIL / ADMIN_PASSWORD are missing');
    return;
  }

  // Reject weak / placeholder passwords
  if (password.length < 12 || /^(Admin@?\d+!?|change.?me|password|REPLACE_ME)/i.test(password)) {
    logger.error(
      'ADMIN_PASSWORD is too weak or still a placeholder. Use a strong random password (min 12 chars).'
    );
    return;
  }

  const existing = await User.findOne({ email }).select('+password');
  if (existing) {
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      await existing.save();
      logger.warn(`User promoted to admin due to AUTO_SEED_ADMIN: ${email}`);
    }
    return;
  }

  await User.create({
    name: 'Platform Admin',
    email,
    password,
    role: 'admin',
    region: 'India',
    language: 'en'
  });

  logger.info(`Admin user created via AUTO_SEED_ADMIN: ${email}`);
};

module.exports = { seedAdminIfEnabled };

