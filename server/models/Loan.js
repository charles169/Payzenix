import mongoose from 'mongoose';

const loanSchema = new mongoose.Schema({
  employee: {
    type: String,
    required: true
  },
  loanType: {
    type: String,
    enum: ['personal', 'advance', 'emergency'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  interestRate: {
    type: Number,
    default: 0
  },
  tenure: {
    type: Number,
    required: true // in months
  },
  emiAmount: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'active', 'completed'],
    default: 'pending'
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  remainingAmount: {
    type: Number,
    required: true
  },
  reason: String,
  approvedBy: {
    type: String
  },
  approvedDate: Date,
  remarks: String
}, { 
  timestamps: true 
});

export default mongoose.model('Loan', loanSchema);
