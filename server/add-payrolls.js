import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Payroll from './models/Payroll.js';
import Employee from './models/Employee.js';

dotenv.config();

const addMorePayrolls = async () => {
    try {
        console.log('🔄 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Get all employees
        const employees = await Employee.find({});
        console.log(`\n📋 Found ${employees.length} employees`);

        // Create payroll records for each employee for the last 3 months
        const months = [
            { month: 12, year: 2025, name: 'December 2025' },
            { month: 1, year: 2026, name: 'January 2026' },
            { month: 2, year: 2026, name: 'February 2026' }
        ];

        const payrollsToCreate = [];

        for (const emp of employees) {
            for (const period of months) {
                const basicSalary = emp.salary * 0.5;
                const hra = emp.salary * 0.3;
                const specialAllowance = emp.salary * 0.2;
                const grossSalary = basicSalary + hra + specialAllowance;

                const pfDeduction = basicSalary * 0.12;
                const professionalTax = 200;
                const totalDeductions = pfDeduction + professionalTax;

                const netSalary = grossSalary - totalDeductions;

                payrollsToCreate.push({
                    employee: emp.employeeId,
                    month: period.month,
                    year: period.year,
                    basicSalary: Math.round(basicSalary),
                    allowances: {
                        hra: Math.round(hra),
                        specialAllowance: Math.round(specialAllowance)
                    },
                    deductions: {
                        pf: Math.round(pfDeduction),
                        professionalTax: professionalTax
                    },
                    grossSalary: Math.round(grossSalary),
                    netSalary: Math.round(netSalary),
                    status: period.month < 2 ? 'paid' : 'pending',
                    paidDate: period.month < 2 ? new Date(period.year, period.month, 5) : null
                });
            }
        }

        console.log(`\n🔄 Creating ${payrollsToCreate.length} payroll records...`);

        // Clear existing payrolls
        await Payroll.deleteMany({});

        // Insert new payrolls
        await Payroll.insertMany(payrollsToCreate);

        console.log(`✅ Successfully created ${payrollsToCreate.length} payroll records!`);

        // Show summary
        const payrollsByMonth = await Payroll.aggregate([
            {
                $group: {
                    _id: { month: '$month', year: '$year' },
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$netSalary' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        console.log('\n📊 Payroll Summary:');
        payrollsByMonth.forEach(p => {
            const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            console.log(`   ${monthNames[p._id.month]} ${p._id.year}: ${p.count} employees, ₹${p.totalAmount.toLocaleString('en-IN')}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
};

addMorePayrolls();
