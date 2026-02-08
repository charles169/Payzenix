import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Employee from './models/Employee.js';
import Payroll from './models/Payroll.js';
import Loan from './models/Loan.js';
import AuditLog from './models/AuditLog.js';

dotenv.config();

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const connectDB = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('\n💡 Make sure MongoDB is running:');
    console.error('   - Local: mongod');
    console.error('   - Docker: docker run -d -p 27017:27017 mongo');
    console.error('\n   Or update MONGO_URI in .env file');
    process.exit(1);
  }
};

connectDB();

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret-key', { expiresIn: '30d' });
};

// Auth middleware
const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Not authorized' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key');
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized' });
  }
};

// ==================== AUTH ROUTES ====================

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // For demo, all passwords are "admin123"
    const isMatch = password === 'admin123';
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);
    
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current user
app.get('/api/auth/me', protect, async (req, res) => {
  res.json(req.user);
});

// ==================== EMPLOYEE ROUTES ====================

// Get all employees
app.get('/api/employees', protect, async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single employee
app.get('/api/employees/:id', protect, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create employee
app.post('/api/employees', protect, async (req, res) => {
  try {
    // Check for duplicate email
    const existingEmail = await Employee.findOne({ email: req.body.email });
    if (existingEmail) {
      return res.status(400).json({ message: `Email ${req.body.email} is already registered` });
    }
    
    // Auto-generate employeeId if not provided or if it already exists
    let employeeId = req.body.employeeId;
    
    if (!employeeId || await Employee.findOne({ employeeId })) {
      // Find the highest existing employee ID
      const lastEmployee = await Employee.findOne().sort({ employeeId: -1 });
      
      if (lastEmployee && lastEmployee.employeeId) {
        // Extract number from EMP001, EMP002, etc.
        const match = lastEmployee.employeeId.match(/EMP(\d+)/);
        if (match) {
          const nextNum = parseInt(match[1]) + 1;
          employeeId = `EMP${String(nextNum).padStart(3, '0')}`;
        } else {
          employeeId = 'EMP001';
        }
      } else {
        employeeId = 'EMP001';
      }
      
      console.log(`🔄 Auto-generated employeeId: ${employeeId}`);
    }
    
    const employee = await Employee.create({
      ...req.body,
      employeeId
    });
    
    // Create audit log (with safety checks)
    try {
      await AuditLog.create({
        action: 'Employee Created',
        user: req.user?.name || 'Unknown',
        userId: req.user?._id?.toString() || 'unknown',
        details: `Created employee record for ${employee.name} (${employee.employeeId})`,
        type: 'create',
        module: 'Employees'
      });
    } catch (auditError) {
      console.error('Failed to create audit log:', auditError);
      // Don't fail the create if audit log fails
    }
    
    res.status(201).json(employee);
  } catch (error) {
    console.error('❌ Error creating employee:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ message: `${field} already exists` });
    }
    
    res.status(400).json({ message: error.message });
  }
});

// Update employee
app.put('/api/employees/:id', protect, async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Create audit log (with safety checks)
    try {
      await AuditLog.create({
        action: 'Employee Updated',
        user: req.user?.name || 'Unknown',
        userId: req.user?._id?.toString() || 'unknown',
        details: `Updated employee record for ${employee.name}`,
        type: 'update',
        module: 'Employees'
      });
    } catch (auditError) {
      console.error('Failed to create audit log:', auditError);
      // Don't fail the update if audit log fails
    }
    
    res.json(employee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete employee
app.delete('/api/employees/:id', protect, async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Store employee name before deletion
    const employeeName = employee.name;
    const employeeId = employee.employeeId;
    
    // Delete related payroll records
    await Payroll.deleteMany({ employee: req.params.id });
    
    // Delete related loan records
    await Loan.deleteMany({ employee: req.params.id });
    
    // Delete the employee
    await Employee.findByIdAndDelete(req.params.id);
    
    // Create audit log (with safety checks)
    try {
      await AuditLog.create({
        action: 'Employee Deleted',
        user: req.user?.name || 'Unknown',
        userId: req.user?._id?.toString() || 'unknown',
        details: `Deleted employee record for ${employeeName} (${employeeId}) and all related payroll/loan records`,
        type: 'delete',
        module: 'Employees'
      });
    } catch (auditError) {
      console.error('Failed to create audit log:', auditError);
      // Don't fail the delete if audit log fails
    }
    
    res.json({ message: 'Employee and related records deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting employee:', error);
    res.status(500).json({ message: error.message });
  }
});

// ==================== PAYROLL ROUTES ====================

// Get all payrolls
app.get('/api/payroll', protect, async (req, res) => {
  try {
    const payrolls = await Payroll.find().sort({ year: -1, month: -1 });
    
    // Manually populate employee data by looking up employeeId
    const populatedPayrolls = await Promise.all(
      payrolls.map(async (payroll) => {
        const employee = await Employee.findOne({ employeeId: payroll.employee });
        return {
          ...payroll.toObject(),
          employee: employee ? {
            _id: employee._id,
            employeeId: employee.employeeId,
            name: employee.name,
            department: employee.department
          } : payroll.employee // Keep original string if employee not found
        };
      })
    );
    
    console.log(`✅ Returning ${populatedPayrolls.length} payrolls`);
    res.json(populatedPayrolls);
  } catch (error) {
    console.error('❌ Error fetching payrolls:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get my payslips (for employees)
app.get('/api/payroll/my-payslips', protect, async (req, res) => {
  try {
    const payrolls = await Payroll.find({ employee: req.user.employeeId }).sort({ year: -1, month: -1 });
    
    // Manually populate employee data
    const populatedPayrolls = await Promise.all(
      payrolls.map(async (payroll) => {
        const employee = await Employee.findOne({ employeeId: payroll.employee });
        return {
          ...payroll.toObject(),
          employee: employee ? {
            _id: employee._id,
            employeeId: employee.employeeId,
            name: employee.name,
            department: employee.department
          } : payroll.employee
        };
      })
    );
    
    res.json(populatedPayrolls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create payroll
app.post('/api/payroll', protect, async (req, res) => {
  try {
    const payroll = await Payroll.create(req.body);
    
    // Create audit log (with safety checks)
    try {
      await AuditLog.create({
        action: 'Payroll Created',
        user: req.user?.name || 'Unknown',
        userId: req.user?._id?.toString() || 'unknown',
        details: `Created payroll record ${payroll._id}`,
        type: 'create',
        module: 'Payroll'
      });
    } catch (auditError) {
      console.error('Failed to create audit log:', auditError);
    }
    
    res.status(201).json(payroll);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update payroll
app.put('/api/payroll/:id', protect, async (req, res) => {
  try {
    const payroll = await Payroll.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: false } // Disable validators for partial updates
    );
    
    if (!payroll) {
      return res.status(404).json({ message: 'Payroll not found' });
    }
    
    // Create audit log (with safety checks)
    try {
      await AuditLog.create({
        action: 'Payroll Updated',
        user: req.user?.name || 'Unknown',
        userId: req.user?._id?.toString() || 'unknown',
        details: `Updated payroll record ${payroll._id}`,
        type: 'update',
        module: 'Payroll'
      });
    } catch (auditError) {
      console.error('Failed to create audit log:', auditError);
      // Don't fail the update if audit log fails
    }
    
    res.json(payroll);
  } catch (error) {
    console.error('Payroll update error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete payroll
app.delete('/api/payroll/:id', protect, async (req, res) => {
  try {
    const payroll = await Payroll.findByIdAndDelete(req.params.id);
    
    if (!payroll) {
      return res.status(404).json({ message: 'Payroll not found' });
    }
    
    // Create audit log (with safety checks)
    try {
      await AuditLog.create({
        action: 'Payroll Deleted',
        user: req.user?.name || 'Unknown',
        userId: req.user?._id?.toString() || 'unknown',
        details: `Deleted payroll record ${payroll._id}`,
        type: 'delete',
        module: 'Payroll'
      });
    } catch (auditError) {
      console.error('Failed to create audit log:', auditError);
    }
    
    res.json({ message: 'Payroll deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== LOAN ROUTES ====================

// Get all loans
app.get('/api/loans', protect, async (req, res) => {
  try {
    const loans = await Loan.find().populate('employee').sort({ createdAt: -1 });
    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get my loans (for employees)
app.get('/api/loans/my-loans', protect, async (req, res) => {
  try {
    const loans = await Loan.find({ employee: req.user.employeeId }).populate('employee').sort({ createdAt: -1 });
    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create loan
app.post('/api/loans', protect, async (req, res) => {
  try {
    const loan = await Loan.create(req.body);
    
    // Create audit log (with safety checks)
    try {
      await AuditLog.create({
        action: 'Loan Created',
        user: req.user?.name || 'Unknown',
        userId: req.user?._id?.toString() || 'unknown',
        details: `Created loan ${loan._id} for ₹${loan.amount}`,
        type: 'create',
        module: 'Loans'
      });
    } catch (auditError) {
      console.error('Failed to create audit log:', auditError);
    }
    
    res.status(201).json(loan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update loan (approve/reject)
app.put('/api/loans/:id', protect, async (req, res) => {
  try {
    const loan = await Loan.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }
    
    // Create audit log (with safety checks)
    try {
      await AuditLog.create({
        action: 'Loan Updated',
        user: req.user?.name || 'Unknown',
        userId: req.user?._id?.toString() || 'unknown',
        details: `Updated loan ${loan._id} - Status: ${loan.status}`,
        type: 'update',
        module: 'Loans'
      });
    } catch (auditError) {
      console.error('Failed to create audit log:', auditError);
    }
    
    res.json(loan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Approve/Reject loan
app.put('/api/loans/:id/approve', protect, async (req, res) => {
  try {
    console.log('🔄 Loan approve request received:', {
      loanId: req.params.id,
      body: req.body,
      user: req.user?._id
    });
    
    const { status, remarks } = req.body;
    
    // Build update data - make approvedBy optional if user is null
    const updateData = {
      status,
      remarks,
      approvedDate: new Date()
    };
    
    // Only add approvedBy if user exists
    if (req.user && req.user._id) {
      updateData.approvedBy = req.user._id.toString();
    }
    
    console.log('💾 Updating loan with data:', updateData);
    
    const loan = await Loan.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!loan) {
      console.error('❌ Loan not found:', req.params.id);
      return res.status(404).json({ message: 'Loan not found' });
    }
    
    console.log('✅ Loan updated successfully:', loan._id, 'status:', loan.status);
    
    // Create audit log only if user exists
    if (req.user && req.user._id) {
      await AuditLog.create({
        action: `Loan ${status}`,
        user: req.user.name || 'Unknown',
        userId: req.user._id.toString(),
        details: `${status} loan ${loan._id} for ₹${loan.amount}`,
        type: 'update',
        module: 'Loans'
      });
    }
    
    res.json(loan);
  } catch (error) {
    console.error('❌ Loan approve error:', error.message, error.stack);
    res.status(400).json({ message: error.message });
  }
});

// Delete loan
app.delete('/api/loans/:id', protect, async (req, res) => {
  try {
    const loan = await Loan.findByIdAndDelete(req.params.id);
    
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }
    
    // Create audit log (with safety checks)
    try {
      await AuditLog.create({
        action: 'Loan Deleted',
        user: req.user?.name || 'Unknown',
        userId: req.user?._id?.toString() || 'unknown',
        details: `Deleted loan ${loan._id}`,
        type: 'delete',
        module: 'Loans'
      });
    } catch (auditError) {
      console.error('Failed to create audit log:', auditError);
    }
    
    res.json({ message: 'Loan deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== AUDIT LOG ROUTES ====================

// Get all audit logs
app.get('/api/audit-logs', protect, async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== DASHBOARD STATS ====================

app.get('/api/dashboard/stats', protect, async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const activeEmployees = await Employee.countDocuments({ status: 'active' });
    const totalPayroll = await Payroll.countDocuments();
    const activeLoans = await Loan.countDocuments({ status: 'active' });
    
    res.json({
      totalEmployees,
      activeEmployees,
      totalPayroll,
      activeLoans
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'PayZenix Payroll API - MongoDB Version',
    version: '2.0.0',
    database: 'MongoDB',
    status: 'Running'
  });
});

// 404 handler - return JSON instead of HTML
app.use((req, res) => {
  res.status(404).json({ 
    message: `Route ${req.method} ${req.url} not found`,
    availableRoutes: [
      'POST /api/auth/login',
      'GET /api/auth/me',
      'GET /api/employees',
      'POST /api/employees',
      'PUT /api/employees/:id',
      'DELETE /api/employees/:id',
      'GET /api/payroll',
      'GET /api/payroll/my-payslips',
      'POST /api/payroll',
      'PUT /api/payroll/:id',
      'DELETE /api/payroll/:id',
      'GET /api/loans',
      'GET /api/loans/my-loans',
      'POST /api/loans',
      'PUT /api/loans/:id',
      'PUT /api/loans/:id/approve',
      'DELETE /api/loans/:id',
      'GET /api/audit-logs',
      'GET /api/dashboard/stats'
    ]
  });
});

// Error handler - return JSON instead of HTML
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ 
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`✅ Using MongoDB database`);
});
