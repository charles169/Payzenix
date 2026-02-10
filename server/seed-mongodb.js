import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Employee from './models/Employee.js';
import Payroll from './models/Payroll.js';
import Loan from './models/Loan.js';
import AuditLog from './models/AuditLog.js';

dotenv.config();

const jsonData = {
  "users": [
    {
      "name": "Super Admin",
      "email": "superadmin@payzenix.com",
      "password": "adminpassword123",
      "role": "superadmin",
      "status": "active"
    },
    {
      "name": "Admin User",
      "email": "admin@payzenix.com",
      "password": "adminpassword123",
      "role": "admin",
      "status": "active"
    },
    {
      "name": "Priya Sharma",
      "email": "hr@payzenix.com",
      "password": "hrpassword123",
      "role": "hr",
      "employeeId": "EMP002",
      "status": "active"
    },
    {
      "name": "Amit Patel",
      "email": "employee@payzenix.com",
      "password": "employeepassword123",
      "role": "employee",
      "employeeId": "EMP003",
      "status": "active"
    }
  ],
  "employees": [
    {
      "employeeId": "EMP001",
      "name": "Super Admin",
      "email": "superadmin@payzenix.com",
      "department": "Management",
      "designation": "System Administrator",
      "salary": 150000,
      "status": "active"
    },
    {
      "employeeId": "EMP002",
      "name": "Priya Sharma",
      "email": "hr@payzenix.com",
      "department": "Human Resources",
      "designation": "HR Manager",
      "salary": 75000,
      "status": "active"
    },
    {
      "employeeId": "EMP003",
      "name": "Amit Patel",
      "email": "amit@payzenix.com",
      "department": "Engineering",
      "designation": "Software Engineer",
      "salary": 85000,
      "status": "active"
    }
  ],
  "payrolls": [
    {
      "employee": "EMP002",
      "month": 2,
      "year": 2026,
      "basicSalary": 50000,
      "allowances": {
        "hra": 20000
      },
      "grossSalary": 70000,
      "netSalary": 65000,
      "status": "paid"
    }
  ],
  "loans": [
    {
      "employee": "EMP003",
      "loanType": "personal",
      "amount": 5000,
      "tenure": 12,
      "emiAmount": 500,
      "startDate": "2026-02-01T00:00:00.000Z",
      "status": "active",
      "remainingAmount": 4500
    }
  ],
  "auditLogs": [
    {
      "action": "Database Seeded",
      "user": "System",
      "userId": "system",
      "details": "Initial data seed",
      "timestamp": "2026-02-09T22:00:00.000Z",
      "type": "create",
      "module": "Authentication"
    }
  ]
};

const seedDatabase = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected!');

    // Clear existing data
    console.log('\n🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Employee.deleteMany({});
    await Payroll.deleteMany({});
    await Loan.deleteMany({});
    await AuditLog.deleteMany({});
    console.log('✅ Existing data cleared!');

    // Seed Users
    console.log('\n👥 Seeding users...');
    let users = [];
    for (const userData of jsonData.users) {
      const user = await User.create({
        ...userData,
        _id: undefined
      });
      users.push(user);
    }
    console.log(`✅ ${users.length} users created!`);

    // Seed Employees
    console.log('\n👨‍💼 Seeding employees...');
    try {
      const employees = await Employee.insertMany(jsonData.employees.map(emp => ({
        ...emp,
        _id: undefined
      })));
      console.log(`✅ ${employees.length} employees created!`);
    } catch (err) {
      console.error('❌ Error seeding employees:', err.message);
      if (err.errors) {
        Object.keys(err.errors).forEach(key => {
          console.error(`   Validation error for ${key}: ${err.errors[key].message}`);
        });
      }
      throw err;
    }

    // Seed Payrolls
    console.log('\n💰 Seeding payroll records...');
    try {
      const payrolls = await Payroll.insertMany(jsonData.payrolls.map(payroll => ({
        ...payroll,
        _id: undefined
      })));
      console.log(`✅ ${payrolls.length} payroll records created!`);
    } catch (err) {
      console.error('❌ Error seeding payrolls:', err.message);
      throw err;
    }

    // Seed Loans
    console.log('\n🏦 Seeding loans...');
    try {
      const loans = await Loan.insertMany(jsonData.loans.map(loan => ({
        ...loan,
        _id: undefined
      })));
      console.log(`✅ ${loans.length} loans created!`);
    } catch (err) {
      console.error('❌ Error seeding loans:', err.message);
      throw err;
    }

    // Seed Audit Logs
    console.log('\n📜 Seeding audit logs...');
    try {
      const auditLogs = await AuditLog.insertMany(jsonData.auditLogs.map(log => ({
        action: log.action,
        user: log.user,
        userId: log.userId,
        details: log.details,
        type: log.type,
        module: log.module,
        createdAt: new Date(log.timestamp)
      })));
      console.log(`✅ ${auditLogs.length} audit logs created!`);
    } catch (err) {
      console.error('❌ Error seeding audit logs:', err.message);
      throw err;
    }

    console.log('\n🎉 DATABASE SEEDING COMPLETE!');
    console.log('\n✅ MongoDB is ready to use!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
