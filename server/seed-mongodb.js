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
    let users, employees, payrolls, loans, auditLogs;
    
    try {
      users = await User.insertMany(jsonData.users.map(user => ({
        ...user,
        _id: undefined // Let MongoDB generate new IDs
      })));
      console.log(`✅ ${users.length} users created!`);
    } catch (err) {
      console.error('❌ Error seeding users:', err.message);
      throw err;
    }

    // Seed Employees
    console.log('\n👨‍💼 Seeding employees...');
    try {
      employees = await Employee.insertMany(jsonData.employees.map(emp => ({
        ...emp,
        _id: undefined
      })));
      console.log(`✅ ${employees.length} employees created!`);
      console.log('Employee IDs:', employees.map(e => e._id));
    } catch (err) {
      console.error('❌ Error seeding employees:', err.message);
      throw err;
    }

    // Seed Payrolls
    console.log('\n💰 Seeding payroll records...');
    try {
      payrolls = await Payroll.insertMany(jsonData.payrolls.map(payroll => ({
        ...payroll,
        _id: undefined
      })));
      console.log(`✅ ${payrolls.length} payroll records created!`);
      console.log('Payroll IDs:', payrolls.map(p => p._id));
    } catch (err) {
      console.error('❌ Error seeding payrolls:', err.message);
      throw err;
    }

    // Seed Loans
    console.log('\n🏦 Seeding loans...');
    try {
      loans = await Loan.insertMany(jsonData.loans.map(loan => ({
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
      auditLogs = await AuditLog.insertMany(jsonData.auditLogs.map(log => ({
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
