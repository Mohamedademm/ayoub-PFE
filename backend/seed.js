require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existing = await User.findOne({ email: 'admin@pfe.com' });
    if (existing) {
      console.log('⚠️  Admin user already exists. Email: admin@pfe.com');
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      name: 'Administrateur PFE',
      email: 'admin@pfe.com',
      password: 'Admin@2024',
      role: 'admin',
    });

    console.log('✅ Admin user created successfully!');
    console.log('   Email:    admin@pfe.com');
    console.log('   Password: Admin@2024');
    console.log('   ⚠️  Please change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedAdmin();
