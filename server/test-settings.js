import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Settings from './models/Settings.js';

dotenv.config();

const testSettings = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected!');

    console.log('\n📋 Fetching current settings...');
    const settings = await Settings.findOne();
    
    if (settings) {
      console.log('✅ Settings found:');
      console.log('   Company Name:', settings.companyName);
      console.log('   PF Enabled:', settings.pfEnabled);
      console.log('   ESI Enabled:', settings.esiEnabled);
      console.log('   Salary Components:', settings.salaryComponents?.length || 0);
      console.log('   Last Updated:', settings.lastUpdated);
      console.log('\n📄 Full settings:', JSON.stringify(settings, null, 2));
    } else {
      console.log('❌ No settings found in database');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

testSettings();
