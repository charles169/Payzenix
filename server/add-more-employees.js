import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Employee from './models/Employee.js';
import Payroll from './models/Payroll.js';
import Loan from './models/Loan.js';

dotenv.config();

const newEmployees = [
  {
    employeeId: 'EMP006',
    name: 'Priya Sharma',
    email: 'priya.sharma@payzenix.com',
    phone: '+91 98765 43216',
    department: 'Marketing',
    designation: 'Marketing Manager',
    salary: 75000,
    location: 'Mumbai',
    status: 'active'
  },
  {
    employeeId: 'EMP007',
    name: 'Arjun Patel',
    email: 'arjun.patel@payzenix.com',
    phone: '+91 98765 43217',
    department: 'Sales',
    designation: 'Sales Executive',
    salary: 55000,
    location: 'Delhi',
    status: 'active'
  },
  {
    employeeId: 'EMP008',
    name: 'Sneha Reddy',
    email: 'sneha.reddy@payzenix.com',
    phone: '+91 98765 43218',
    department: 'Design',
    designation: 'UI/UX Designer',
    salary: 65000,
    location: 'Bangalore',
    status: 'active'
  },
  {
    employeeId: 'EMP009',
    name: 'Vikram Singh',
    email: 'vikram.singh@payzenix.com',
    phone: '+91 98765 43219',
    department: 'Engineering',
    designation: 'DevOps Engineer',
    salary: 85000,
    location: 'Hyderabad',
    status: 'active'
  },
  {
    employeeId: 'EMP010',
    name: 'Ananya Iyer',
    email: 'ananya.iyer@payzenix.com',
    phone: '+91 98765 43220',
    department: 'Finance',
    designation: 'Financial Analyst',
    salary: 70000,
    location: 'Chennai',
    status: 'active'
  },
  {
    employeeId: 'EMP011',
    name: 'Rahul Verma',
    email: 'rahul.verma@payzenix.com',
    phone: '+91 98765 43221',
    department: 'Engineering',
    designation: 'Backend Developer',
    salary: 80000,
    location: 'Pune',
    status: 'active'
  },
  {
    employeeId: 'EMP012',
    name: 'Kavya Nair',
    email: 'kavya.nair@payzenix.com',
    phone: '+91 98765 43222',
    department: 'Human Resources',
    designation: 'HR Executive',
    salary: 50000,
    location: 'Bangalore',
    status: 'probation'
  },
  {
    employeeId: 'EMP013',
    name: 'Aditya Gupta',
    email: 'aditya.gupta@payzenix.com',
    phone: '+91 98765 43223',
    department: 'Sales',
    designation: 'Business Development Manager',
    salary: 90000,
    location: 'Mumbai',
    status: 'active'
  },
  {
    employeeId: 'EMP014',
    name: 'Meera Joshi',
    email: 'meera.joshi@payzenix.com',
    phone: '+91 98765 43224',
    department: 'Marketing',
    designation: 'Content Writer',
    salary: 45000,
    location: 'Delhi',
    status: 'active'
  },
  {
    employeeId: 'EMP015',
    name: 'Karthik Rao',
    email: 'karthik.rao@payzenix.com',
    phone: '+91 98765 43225',
    department: 'Engineering',
    designation: 'QA Engineer',
    salary: 60000,
    location: 'Bangalore',
    status: 'active'
  }
];

const addEmployees = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected!\n');

    console.log('👥 Adding 10 new employees...');
    
    for (const empData of newEmployees) {
      // Check if employee already exists
      const existing = await Employee.findOne({ employeeId: empData.employeeId });
      if (existing) {
        console.log(`⏭️  Skipping ${empData.name} (${empData.employeeId}) - already exists`);
        continue;
      }

      const employee = await Employee.create(empData);
      console.log(`✅ Added: ${employee.name} (${employee.employeeId}) - ${employee.designation}`);

      // Create payroll record for February 2026
      const grossSalary = Math.round(employee.salary * 1.2);
      const netSalary = Math.round(employee.salary * 1.1);
      
      const payroll = await Payroll.create({
        employee: employee.employeeId,
        month: 2,
        year: 2026,
        basicSalary: employee.salary,
        allowances: {
          hra: Math.round(employee.salary * 0.1),
          transport: Math.round(employee.salary * 0.05),
          medical: Math.round(employee.salary * 0.03),
          other: Math.round(employee.salary * 0.02)
        },
        deductions: {
          pf: Math.round(employee.salary * 0.05),
          esi: Math.round(employee.salary * 0.02),
          tax: Math.round(employee.salary * 0.02),
          other: Math.round(employee.salary * 0.01)
        },
        grossSalary: grossSalary,
        netSalary: netSalary,
        status: 'paid',
        paymentDate: new Date('2026-02-28')
      });
      console.log(`   💰 Created payroll for ${employee.name}`);

      // Create a loan for some employees (50% chance)
      if (Math.random() > 0.5) {
        const loanAmount = Math.round(employee.salary * (1 + Math.random()));
        const tenure = 12;
        const emiAmount = Math.round(loanAmount / tenure);
        const loanTypes = ['personal', 'advance', 'emergency'];
        const reasons = ['Medical Emergency', 'Home Renovation', 'Education', 'Vehicle Purchase'];
        
        const loan = await Loan.create({
          employee: employee._id,
          loanType: loanTypes[Math.floor(Math.random() * loanTypes.length)],
          amount: loanAmount,
          interestRate: 8.5,
          tenure: tenure,
          emiAmount: emiAmount,
          startDate: new Date('2026-02-01'),
          reason: reasons[Math.floor(Math.random() * reasons.length)],
          status: Math.random() > 0.5 ? 'approved' : 'pending',
          paidAmount: 0,
          remainingAmount: loanAmount,
          approvedDate: Math.random() > 0.5 ? new Date('2026-02-05') : null
        });
        console.log(`   🏦 Created loan for ${employee.name}: ₹${loanAmount.toLocaleString()}`);
      }
    }

    console.log('\n🎉 Successfully added employees!');
    
    const totalEmployees = await Employee.countDocuments();
    const totalPayrolls = await Payroll.countDocuments();
    const totalLoans = await Loan.countDocuments();
    
    console.log('\n📊 Database Summary:');
    console.log(`   Total Employees: ${totalEmployees}`);
    console.log(`   Total Payroll Records: ${totalPayrolls}`);
    console.log(`   Total Loans: ${totalLoans}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

addEmployees();
