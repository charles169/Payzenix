import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './models/User.js';
import Employee from './models/Employee.js';
import Payroll from './models/Payroll.js';
import Loan from './models/Loan.js';
import AuditLog from './models/AuditLog.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const DB_FILE = path.join(__dirname, 'db.json');

// Read JSON database
const jsonData = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));

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
    const users = await User.insertMany(jsonData.users.map(user => ({
      ...user,
      _id: undefined // Let MongoDB generate new IDs
    })));
    console.log(`✅ ${users.length} users created!`);

    // Seed Employees
    console.log('\n👨‍💼 Seeding employees...');
    const employees = await Employee.insertMany(jsonData.employees.map(emp => ({
      ...emp,
      _id: undefined
    })));
    console.log(`✅ ${employees.length} employees created!`);

    // Seed Payrolls
    console.log('\n💰 Seeding payroll records...');
    const payrolls = await Payroll.insertMany(jsonData.payrolls.map(payroll => ({
      ...payroll,
      _id: undefined
    })));
    console.log(`✅ ${payrolls.length} payroll records created!`);

    // Seed Loans
    console.log('\n🏦 Seeding loans...');
    const loans = await Loan.insertMany(jsonData.loans.map(loan => ({
      ...loan,
      _id: undefined
    })));
    console.log(`✅ ${loans.length} loans created!`);

    // Seed Audit Logs
    console.log('\n📜 Seeding audit logs...');
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

    console.log('\n🎉 DATABASE SEEDING COMPLETE!');
    console.log('\n📊 Summary:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Employees: ${employees.length}`);
    console.log(`   Payroll Records: ${payrolls.length}`);
    console.log(`   Loans: ${loans.length}`);
    console.log(`   Audit Logs: ${auditLogs.length}`);
    console.log('\n✅ MongoDB is ready to use!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
