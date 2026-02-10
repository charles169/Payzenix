import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Employee from './models/Employee.js';
import Payroll from './models/Payroll.js';
import Loan from './models/Loan.js';
import AuditLog from './models/AuditLog.js';

dotenv.config();

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB:', mongoose.connection.name);

        const users = await User.countDocuments();
        const employees = await Employee.countDocuments();
        const payrolls = await Payroll.countDocuments();
        const loans = await Loan.countDocuments();
        const auditLogs = await AuditLog.countDocuments();

        console.log('Data counts:');
        console.log(' - Users:', users);
        console.log(' - Employees:', employees);
        console.log(' - Payrolls:', payrolls);
        console.log(' - Loans:', loans);
        console.log(' - AuditLogs:', auditLogs);

        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

checkDB();
