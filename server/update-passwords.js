import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const updatePasswords = async () => {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const newPassword = '123456';
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        console.log('\n🔄 Updating all user passwords to: 123456');

        const result = await User.updateMany(
            {},
            { $set: { password: hashedPassword } }
        );

        console.log(`✅ Updated ${result.modifiedCount} user passwords`);

        // Display all users
        const users = await User.find({});
        console.log('\n📋 All users:');
        users.forEach(user => {
            console.log(`   - ${user.email} (${user.role}) - Password: 123456`);
        });

        console.log('\n✅ Password update complete!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

updatePasswords();
