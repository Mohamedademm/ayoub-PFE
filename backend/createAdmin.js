require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB!');

    // Get the users collection directly to avoid any model validation issues
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Delete any existing admin@gmail.com account to start fresh
    const deleted = await usersCollection.deleteMany({ email: 'admin@gmail.com' });
    if (deleted.deletedCount > 0) {
      console.log(`🗑️  Removed ${deleted.deletedCount} old admin account(s)`);
    }

    // Hash the password manually
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Insert admin directly
    const result = await usersCollection.insertOne({
      name: 'Administrateur',
      email: 'admin@gmail.com',
      password: hashedPassword,
      role: 'admin',
      avatar: null,
      lastLogin: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('\n✅ Admin account created successfully!');
    console.log('   Email:    admin@gmail.com');
    console.log('   Password: admin123');
    console.log('   Role:     admin');
    console.log('   ID:       ' + result.insertedId);
    console.log('\n👉 You can now login at http://localhost:5174/login');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();
