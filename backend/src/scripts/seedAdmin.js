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
    process.exit(0);
  }

  await User.create({
    name: 'Platform Admin',
    email,
    password,
    role: 'admin',
    region: 'India',
    language: 'en'
  });

  console.log(`Admin created: ${email}`);
  process.exit(0);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
