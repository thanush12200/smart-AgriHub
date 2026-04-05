require('dotenv').config();

const connectDB = require('../config/db');
const User = require('../models/User');

const run = async () => {
  await connectDB();

  const email = process.env.ADMIN_EMAIL || 'admin@smartagrihub.com';
  const password = process.env.ADMIN_PASSWORD || 'Admin@123';

  const exists = await User.findOne({ email });
  if (exists) {
    console.log(`Admin already exists: ${email}`);
  } else {
    await User.create({
      name: 'Platform Admin',
      email,
      password,
      role: 'admin',
      region: 'India',
      language: 'en'
    });
    console.log(`Admin created: ${email}`);
  }

  // Seed Demo User
  const demoEmail = 'demo@agrihub.com';
  const demoExists = await User.findOne({ email: demoEmail });
  if (!demoExists) {
    await User.create({
      name: 'Demo Farmer',
      email: demoEmail,
      password: 'DemoPassword123!',
      role: 'farmer',
      region: 'Punjab',
      language: 'en',
      isDemo: true
    });
    console.log(`Demo farmer created: ${demoEmail}`);
  }

  process.exit(0);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
