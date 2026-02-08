import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/payzenix');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Define schemas
const employeeSchema = new mongoose.Schema({}, { strict: false });
const payrollSchema = new mongoose.Schema({}, { strict: false });
const loanSchema = new mongoose.Schema({}, { strict: false });

const Employee = mongoose.model('Employee', employeeSchema);
const Payroll = mongoose.model('Payroll', payrollSchema);
const Loan = mongoose.model('Loan', loanSchema);

const cleanupDatabase = async () => {
  try {
    console.log('\n🧹 Starting database cleanup...\n');
    
    // 1. Find and remove invalid employees (missing name or _id)
    const allEmployees = await Employee.find({});
    console.log(`📊 Total employees in database: ${allEmployees.length}`);
    
    let invalidEmployees = 0;
    for (const emp of allEmployees) {
      if (!emp.name || !emp._id) {
        console.log(`❌ Removing invalid employee:`, emp);
        await Employee.deleteOne({ _id: emp._id });
        invalidEmployees++;
      }
    }
    console.log(`✅ Removed ${invalidEmployees} invalid employees\n`);
    
    // 2. Find and remove orphaned payroll records (employee doesn't exist)
    const allPayrolls = await Payroll.find({});
    console.log(`📊 Total payroll records: ${allPayrolls.length}`);
    
    let orphanedPayrolls = 0;
    for (const payroll of allPayrolls) {
      if (payroll.employee) {
        // Check if employee field is an ObjectId or a string (employeeId)
        let employeeExists = null;
        
        try {
          // Try as ObjectId first
          if (mongoose.Types.ObjectId.isValid(payroll.employee)) {
            employeeExists = await Employee.findById(payroll.employee);
          }
        } catch (e) {
          // Not an ObjectId, might be employeeId string
        }
        
        // If not found by _id, try by employeeId
        if (!employeeExists) {
          employeeExists = await Employee.findOne({ employeeId: payroll.employee });
        }
        
        if (!employeeExists) {
          console.log(`❌ Removing orphaned payroll (employee ${payroll.employee} not found):`, payroll._id);
          await Payroll.deleteOne({ _id: payroll._id });
          orphanedPayrolls++;
        }
      } else {
        console.log(`❌ Removing payroll with no employee:`, payroll._id);
        await Payroll.deleteOne({ _id: payroll._id });
        orphanedPayrolls++;
      }
    }
    console.log(`✅ Removed ${orphanedPayrolls} orphaned payroll records\n`);
    
    // 3. Find and remove orphaned loan records (employee doesn't exist)
    const allLoans = await Loan.find({});
    console.log(`📊 Total loan records: ${allLoans.length}`);
    
    let orphanedLoans = 0;
    for (const loan of allLoans) {
      if (loan.employee) {
        // Check if employee field is an ObjectId or a string (employeeId)
        let employeeExists = null;
        
        try {
          // Try as ObjectId first
          if (mongoose.Types.ObjectId.isValid(loan.employee)) {
            employeeExists = await Employee.findById(loan.employee);
          }
        } catch (e) {
          // Not an ObjectId, might be employeeId string
        }
        
        // If not found by _id, try by employeeId
        if (!employeeExists) {
          employeeExists = await Employee.findOne({ employeeId: loan.employee });
        }
        
        if (!employeeExists) {
          console.log(`❌ Removing orphaned loan (employee ${loan.employee} not found):`, loan._id);
          await Loan.deleteOne({ _id: loan._id });
          orphanedLoans++;
        }
      } else {
        console.log(`❌ Removing loan with no employee:`, loan._id);
        await Loan.deleteOne({ _id: loan._id });
        orphanedLoans++;
      }
    }
    console.log(`✅ Removed ${orphanedLoans} orphaned loan records\n`);
    
    // 4. Show final counts
    const finalEmployees = await Employee.countDocuments();
    const finalPayrolls = await Payroll.countDocuments();
    const finalLoans = await Loan.countDocuments();
    
    console.log('📊 Final database state:');
    console.log(`   Employees: ${finalEmployees}`);
    console.log(`   Payroll records: ${finalPayrolls}`);
    console.log(`   Loan records: ${finalLoans}`);
    
    console.log('\n✅ Database cleanup complete!');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run cleanup
connectDB().then(cleanupDatabase);
