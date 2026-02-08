import express from 'express';
import Loan from '../models/Loan.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// @route   GET /api/loans
// @desc    Get all loans
// @access  Private/Admin/HR
router.get('/', authorize('admin', 'hr'), async (req, res) => {
  try {
    const loans = await Loan.find()
      .populate('employee', 'name employeeId department')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });
    
    // Filter out loans with deleted employees completely
    // Only return loans where employee exists
    const validLoans = loans.filter(loan => {
      if (!loan.employee || !loan.employee._id) {
        console.warn('⚠️ Skipping loan with deleted employee:', loan._id);
        return false;
      }
      return true;
    });
    
    console.log(`✅ Returning ${validLoans.length} valid loans (filtered from ${loans.length} total)`);
    res.json(validLoans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/loans/my-loans
// @desc    Get employee's own loans
// @access  Private/Employee
router.get('/my-loans', async (req, res) => {
  try {
    if (!req.user.employeeId) {
      return res.status(400).json({ message: 'No employee record linked' });
    }

    const loans = await Loan.find({ employee: req.user.employeeId })
      .sort({ createdAt: -1 });
    
    res.json(loans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/loans
// @desc    Create loan request
// @access  Private
router.post('/', async (req, res) => {
  try {
    const loanData = {
      ...req.body,
      employee: req.user.employeeId || req.body.employee
    };

    const loan = await Loan.create(loanData);
    res.status(201).json(loan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/loans/:id/approve
// @desc    Approve/Reject loan
// @access  Private/Admin/HR
router.put('/:id/approve', authorize('admin', 'hr'), async (req, res) => {
  try {
    const { status, remarks } = req.body;

    const loan = await Loan.findByIdAndUpdate(
      req.params.id,
      {
        status,
        remarks,
        approvedBy: req.user._id,
        approvedDate: Date.now()
      },
      { new: true }
    );

    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    res.json(loan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   PUT /api/loans/:id
// @desc    Update loan
// @access  Private/Admin/HR
router.put('/:id', authorize('admin', 'hr'), async (req, res) => {
  try {
    const loan = await Loan.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!loan) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    res.json(loan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
