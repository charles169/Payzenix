import express from 'express';
import Payroll from '../models/Payroll.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// @route   GET /api/payroll
// @desc    Get all payroll records
// @access  Private/Admin/HR
router.get('/', authorize('admin', 'hr'), async (req, res) => {
  try {
    const { month, year, employee } = req.query;
    const filter = {};
    
    if (month) filter.month = month;
    if (year) filter.year = year;
    if (employee) filter.employee = employee;

    const payrolls = await Payroll.find(filter)
      .populate('employee', 'name employeeId department')
      .sort({ year: -1, month: -1 });
    
    res.json(payrolls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/payroll/my-payslips
// @desc    Get employee's own payslips
// @access  Private/Employee
router.get('/my-payslips', async (req, res) => {
  try {
    if (!req.user.employeeId) {
      return res.status(400).json({ message: 'No employee record linked' });
    }

    const payrolls = await Payroll.find({ employee: req.user.employeeId })
      .sort({ year: -1, month: -1 });
    
    res.json(payrolls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/payroll
// @desc    Create payroll record
// @access  Private/Admin/HR
router.post('/', authorize('admin', 'hr'), async (req, res) => {
  try {
    const payroll = await Payroll.create(req.body);
    res.status(201).json(payroll);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/payroll/:id
// @desc    Update payroll record
// @access  Private/Admin/HR
router.put('/:id', authorize('admin', 'hr'), async (req, res) => {
  try {
    const payroll = await Payroll.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!payroll) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }

    res.json(payroll);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
