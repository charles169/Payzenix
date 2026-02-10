import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const updateSuperAdminName = async () => {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const newName = 'Jesika'; // Super Admin name

        const result = await User.updateOne(
            { role: 'superadmin' },
            { $set: { name: newName } }
        );

        console.log(`\n✅ Updated super admin name to: ${newName}`);

        const superAdmin = await User.findOne({ role: 'superadmin' });
        console.log('\n📋 Super Admin Details:');
        console.log(`   Name: ${superAdmin.name}`);
        console.log(`   Email: ${superAdmin.email}`);
        console.log(`   Role: ${superAdmin.role}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

updateSuperAdminName();
