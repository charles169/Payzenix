import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = 3001; // Fixed port to avoid conflicts
const DB_FILE = path.join(__dirname, 'db.json');

// Middleware
app.use(cors());
app.use(express.json());

// Simple file-based database
let db;
try {
  db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
} catch (error) {
  console.error('Error reading database file:', error.message);
  process.exit(1);
}

const saveDB = () => {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
};

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret-key', { expiresIn: '30d' });
};

// Auth middleware
const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Not authorized' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret-key');
    req.user = db.users.find(u => u._id === decoded.id);
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token invalid' });
  }
};

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'PayZenix API - Running with JSON database' });
});

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = db.users.find(u => u.email === email);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // All users use password: admin123 for demo
    if (password !== 'admin123') {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId,
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/auth/me', protect, (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    employeeId: req.user.employeeId
  });
});

// Employee routes
app.get('/api/employees', protect, (req, res) => {
  if (!['superadmin', 'admin', 'hr'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  res.json(db.employees);
});

app.post('/api/employees', protect, (req, res) => {
  if (!['superadmin', 'admin', 'hr'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  
  const newEmployee = {
    _id: `EMP${String(db.employees.length + 1).padStart(3, '0')}`,
    ...req.body,
    employeeId: req.body.employeeId || `EMP${String(db.employees.length + 1).padStart(3, '0')}`
  };
  
  db.employees.push(newEmployee);
  saveDB();
  res.status(201).json(newEmployee);
});

app.put('/api/employees/:id', protect, (req, res) => {
  if (!['superadmin', 'admin', 'hr'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  
  const index = db.employees.findIndex(e => e._id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Employee not found' });
  }
  
  db.employees[index] = { ...db.employees[index], ...req.body, _id: req.params.id };
  saveDB();
  res.json(db.employees[index]);
});

app.delete('/api/employees/:id', protect, (req, res) => {
  if (!['superadmin', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  
  db.employees = db.employees.filter(e => e._id !== req.params.id);
  saveDB();
  res.json({ message: 'Employee deleted' });
});

// Payroll routes
app.get('/api/payroll', protect, (req, res) => {
  if (!['superadmin', 'admin', 'hr'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  res.json(db.payrolls);
});

app.get('/api/payroll/my-payslips', protect, (req, res) => {
  const payslips = db.payrolls.filter(p => p.employee === req.user.employeeId);
  res.json(payslips);
});

// Loan routes
app.get('/api/loans', protect, (req, res) => {
  if (!['superadmin', 'admin', 'hr'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  res.json(db.loans);
});

app.post('/api/loans', protect, (req, res) => {
  if (!['superadmin', 'admin', 'hr'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  
  const newLoan = {
    _id: `LN${String(db.loans.length + 1).padStart(3, '0')}`,
    ...req.body,
    paidAmount: 0,
    remainingAmount: req.body.amount
  };
  
  db.loans.push(newLoan);
  saveDB();
  res.status(201).json(newLoan);
});

app.put('/api/loans/:id/approve', protect, (req, res) => {
  if (!['superadmin', 'admin', 'hr'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  
  const { status } = req.body;
  const index = db.loans.findIndex(l => l._id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Loan not found' });
  }
  
  db.loans[index].status = status;
  saveDB();
  res.json(db.loans[index]);
});

app.get('/api/loans/my-loans', protect, (req, res) => {
  const loans = db.loans.filter(l => l.employee === req.user.employeeId);
  res.json(loans);
});

// Attendance routes
app.get('/api/attendance', protect, (req, res) => {
  if (!['superadmin', 'admin', 'hr'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  res.json(db.attendance || []);
});

app.post('/api/attendance', protect, (req, res) => {
  if (!['superadmin', 'admin', 'hr'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  const newAttendance = {
    _id: `ATT${String((db.attendance?.length || 0) + 1).padStart(3, '0')}`,
    ...req.body,
    date: new Date().toISOString()
  };
  if (!db.attendance) db.attendance = [];
  db.attendance.push(newAttendance);
  saveDB();
  res.json({ message: 'Attendance marked successfully', data: newAttendance });
});

// Leave routes
app.get('/api/leaves', protect, (req, res) => {
  if (!['superadmin', 'admin', 'hr'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  res.json(db.leaves || []);
});

app.post('/api/leaves', protect, (req, res) => {
  if (!['superadmin', 'admin', 'hr'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  const newLeave = {
    _id: `LV${String((db.leaves?.length || 0) + 1).padStart(3, '0')}`,
    ...req.body,
    appliedDate: new Date().toISOString(),
    status: 'pending'
  };
  if (!db.leaves) db.leaves = [];
  db.leaves.push(newLeave);
  saveDB();
  res.json({ message: 'Leave application submitted', data: newLeave });
});

app.put('/api/leaves/:id', protect, (req, res) => {
  if (!['superadmin', 'admin', 'hr'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  const index = db.leaves?.findIndex(l => l._id === req.params.id);
  if (index === -1 || index === undefined) {
    return res.status(404).json({ message: 'Leave not found' });
  }
  db.leaves[index] = { 
    ...db.leaves[index], 
    ...req.body,
    approvedBy: req.user.name,
    approvedDate: new Date().toISOString()
  };
  saveDB();
  res.json({ message: 'Leave status updated', data: db.leaves[index] });
});

// Reports routes
app.get('/api/reports', protect, (req, res) => {
  if (!['superadmin', 'admin', 'hr'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  res.json(db.reports || []);
});

app.post('/api/reports/generate', protect, (req, res) => {
  if (!['superadmin', 'admin', 'hr'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  const newReport = {
    _id: `REP${String((db.reports?.length || 0) + 1).padStart(3, '0')}`,
    ...req.body,
    generatedDate: new Date().toISOString(),
    generatedBy: req.user.name,
    status: 'completed'
  };
  if (!db.reports) db.reports = [];
  db.reports.push(newReport);
  saveDB();
  res.json({ message: 'Report generated successfully', data: newReport });
});

// Audit logs routes
app.get('/api/audit-logs', protect, (req, res) => {
  if (!['superadmin', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Not authorized' });
  }
  res.json(db.auditLogs || []);
});

console.log('✅ Using JSON file database (no MongoDB required)');
console.log('🚀 Server running on port', PORT);
console.log(`   http://localhost:${PORT}`);

app.listen(PORT, () => {
  console.log('✅ Server started successfully!');
});
