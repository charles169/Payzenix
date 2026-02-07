import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Employee from './models/Employee.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected\n');

    // Clear existing data
    await User.deleteMany({});
    await Employee.deleteMany({});
    console.log('🗑️  Cleared existing data\n');

    // Create employees first
    const employees = await Employee.create([
      {
        employeeId: 'EMP001',
        name: 'Rajesh Kumar',
        email: 'rajesh@payzenix.com',
        phone: '+91 98765 43210',
        department: 'Engineering',
        designation: 'Senior Developer',
        salary: 85000,
        location: 'Bangalore',
        status: 'active'
      },
      {
        employeeId: 'EMP002',
        name: 'Priya Sharma',
        email: 'priya@payzenix.com',
        phone: '+91 98765 43211',
        department: 'Human Resources',
        designation: 'HR Manager',
        salary: 72000,
        location: 'Mumbai',
        status: 'active'
      },
      {
        employeeId: 'EMP003',
        name: 'Amit Patel',
        email: 'amit@payzenix.com',
        phone: '+91 98765 43212',
        department: 'Engineering',
        designation: 'Tech Lead',
        salary: 125000,
        location: 'Bangalore',
        status: 'active'
      }
    ]);

    console.log('✅ Created employees\n');

    // Create users
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@payzenix.com',
        password: 'admin123',
        role: 'admin',
        status: 'active'
      },
      {
        name: 'Priya Sharma',
        email: 'hr@payzenix.com',
        password: 'hr123',
        role: 'hr',
        employeeId: employees[1]._id,
        status: 'active'
      },
      {
        name: 'Amit Patel',
        email: 'employee@payzenix.com',
        password: 'emp123',
        role: 'employee',
        employeeId: employees[2]._id,
        status: 'active'
      }
    ]);

    console.log('✅ Created users\n');

    console.log('═══════════════════════════════════════');
    console.log('🎉 Database seeded successfully!');
    console.log('═══════════════════════════════════════\n');
    
    console.log('📝 Login Credentials:\n');
    console.log('Admin:');
    console.log('  Email: admin@payzenix.com');
    console.log('  Password: admin123\n');
    console.log('HR:');
    console.log('  Email: hr@payzenix.com');
    console.log('  Password: hr123\n');
    console.log('Employee:');
    console.log('  Email: employee@payzenix.com');
    console.log('  Password: emp123\n');
    console.log('═══════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
