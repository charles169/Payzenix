import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const updatePasswords = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected!');

    console.log('\n🔐 Updating all user passwords to "admin123"...');
    
    const users = await User.find();
    
    for (const user of users) {
      user.password = 'admin123';
      await user.save();
      console.log(`✅ Updated password for ${user.email}`);
    }

    console.log('\n🎉 ALL PASSWORDS UPDATED TO: admin123');
    console.log('\n📋 Login Credentials:');
    console.log('   Email: admin@payzenix.com');
    console.log('   Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

updatePasswords();
