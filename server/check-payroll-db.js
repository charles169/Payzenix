import mongoose from 'mongoose';
import Payroll from './models/Payroll.js';
import Employee from './models/Employee.js';

mongoose.connect('mongodb://localhost:27017/payzenix')
  .then(async () => {
    console.log('✅ Connected to MongoDB (payzenix database)');
    
    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📁 Collections:', collections.map(c => c.name).join(', '));
    
    const payrolls = await Payroll.find({});
    console.log('\n📊 Payrolls in DB:', payrolls.length);
    payrolls.forEach(p => {
      console.log(`  - ${p._id}: employee=${p.employee}, month=${p.month}, year=${p.year}, status=${p.status}`);
    });
    
    const employees = await Employee.find({});
    console.log('\n👥 Employees in DB:', employees.length);
    employees.forEach(e => {
      console.log(`  - ${e._id}: ${e.name} (${e.employeeId})`);
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });
