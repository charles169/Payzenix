import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Employee from './models/Employee.js';

dotenv.config();

const updateSuperAdminName = async () => {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const newName = 'Jesika'; // Super Admin name

        // Update User model
        const userResult = await User.updateOne(
            { role: 'superadmin' },
            { $set: { name: newName } }
        );

        // Update Employee model
        const employeeResult = await Employee.updateOne(
            { email: 'superadmin@payzenix.com' },
            { $set: { name: newName } }
        );

        console.log(`\n✅ Updated super admin name to: ${newName}`);
        console.log(`   User records updated: ${userResult.modifiedCount}`);
        console.log(`   Employee records updated: ${employeeResult.modifiedCount}`);

        const superAdmin = await User.findOne({ role: 'superadmin' });
        console.log('\n📋 Super Admin User Details:');
        console.log(`   Name: ${superAdmin.name}`);
        console.log(`   Email: ${superAdmin.email}`);
        console.log(`   Role: ${superAdmin.role}`);

        const superAdminEmployee = await Employee.findOne({ email: 'superadmin@payzenix.com' });
        if (superAdminEmployee) {
            console.log('\n📋 Super Admin Employee Details:');
            console.log(`   Name: ${superAdminEmployee.name}`);
            console.log(`   Email: ${superAdminEmployee.email}`);
            console.log(`   Employee ID: ${superAdminEmployee.employeeId}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

updateSuperAdminName();
