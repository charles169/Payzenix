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
    const employee = await Employee.create(req.body);
    
    // Create audit log
    await AuditLog.create({
      action: 'Employee Created',
      user: req.user.name,
      userId: req.user._id.toString(),
      details: `Created employee record for ${employee.name} (${employee.employeeId})`,
      type: 'create',
      module: 'Employees'
    });
    
    res.status(201).json(employee);
  } catch (error) {
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
    
    // Create audit log
    await AuditLog.create({
      action: 'Employee Updated',
      user: req.user.name,
      userId: req.user._id.toString(),
      details: `Updated employee record for ${employee.name}`,
      type: 'update',
      module: 'Employees'
    });
    
    res.json(employee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete employee
app.delete('/api/employees/:id', protect, async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Create audit log
    await AuditLog.create({
      action: 'Employee Deleted',
      user: req.user.name,
      userId: req.user._id.toString(),
      details: `Deleted employee record for ${employee.name}`,
      type: 'delete',
      module: 'Employees'
    });
    
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== PAYROLL ROUTES ====================

// Get all payrolls
app.get('/api/payroll', protect, async (req, res) => {
  try {
    const payrolls = await Payroll.find().sort({ year: -1, month: -1 });
    res.json(payrolls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get my payslips (for employees)
app.get('/api/payroll/my-payslips', protect, async (req, res) => {
  try {
    const payrolls = await Payroll.find({ employee: req.user.employeeId }).sort({ year: -1, month: -1 });
    res.json(payrolls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create payroll
app.post('/api/payroll', protect, async (req, res) => {
  try {
    const payroll = await Payroll.create(req.body);
    
    // Create audit log
    await AuditLog.create({
      action: 'Payroll Created',
      user: req.user.name,
      userId: req.user._id.toString(),
      details: `Created payroll record ${payroll._id}`,
      type: 'create',
      module: 'Payroll'
    });
    
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
      { new: true, runValidators: true }
    );
    
    if (!payroll) {
      return res.status(404).json({ message: 'Payroll not found' });
    }
    
    // Create audit log
    await AuditLog.create({
      action: 'Payroll Updated',
      user: req.user.name,
      userId: req.user._id.toString(),
      details: `Updated payroll record ${payroll._id}`,
      type: 'update',
      module: 'Payroll'
    });
    
    res.json(payroll);
  } catch (error) {
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
    
    // Create audit log
    await AuditLog.create({
      action: 'Payroll Deleted',
      user: req.user.name,
      userId: req.user._id.toString(),
      details: `Deleted payroll record ${payroll._id}`,
      type: 'delete',
      module: 'Payroll'
    });
    
    res.json({ message: 'Payroll deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== LOAN ROUTES ====================

// Get all loans
app.get('/api/loans', protect, async (req, res) => {
  try {
    const loans = await Loan.find().sort({ createdAt: -1 });
    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get my loans (for employees)
app.get('/api/loans/my-loans', protect, async (req, res) => {
  try {
    const loans = await Loan.find({ employee: req.user.employeeId }).sort({ createdAt: -1 });
    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create loan
app.post('/api/loans', protect, async (req, res) => {
  try {
    const loan = await Loan.create(req.body);
    
    // Create audit log
    await AuditLog.create({
      action: 'Loan Created',
      user: req.user.name,
      userId: req.user._id.toString(),
      details: `Created loan ${loan._id} for ₹${loan.amount}`,
      type: 'create',
      module: 'Loans'
    });
    
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
    
    // Create audit log
    await AuditLog.create({
      action: 'Loan Updated',
      user: req.user.name,
      userId: req.user._id.toString(),
      details: `Updated loan ${loan._id} - Status: ${loan.status}`,
      type: 'update',
      module: 'Loans'
    });
    
    res.json(loan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Approve/Reject loan
app.put('/api/loans/:id/approve', protect, async (req, res) => {
  try {
    const { status, remarks } = req.body;
    
    const updateData = {
      status,
      remarks,
      approvedBy: req.user._id.toString(),
      approvedDate: new Date()
    };
    
    const loan = await Loan.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }
    
    // Create audit log
    await AuditLog.create({
      action: `Loan ${status}`,
      user: req.user.name,
      userId: req.user._id.toString(),
      details: `${status} loan ${loan._id} for ₹${loan.amount}`,
      type: 'update',
      module: 'Loans'
    });
    
    res.json(loan);
  } catch (error) {
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
    
    // Create audit log
    await AuditLog.create({
      action: 'Loan Deleted',
      user: req.user.name,
      userId: req.user._id.toString(),
      details: `Deleted loan ${loan._id}`,
      type: 'delete',
      module: 'Loans'
    });
    
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
