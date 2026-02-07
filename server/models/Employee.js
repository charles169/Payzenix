import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    required: true
  },
  designation: {
    type: String,
    required: true
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  salary: {
    type: Number,
    required: true
  },
  location: {
    type: String,
    default: 'Not specified'
  },
  status: {
    type: String,
    enum: ['active', 'probation', 'onleave', 'inactive'],
    default: 'active'
  },
  bankDetails: {
    accountNumber: String,
    ifscCode: String,
    bankName: String
  },
  taxDetails: {
    panNumber: String,
    pfNumber: String,
    esiNumber: String
  }
}, { 
  timestamps: true 
});

export default mongoose.model('Employee', employeeSchema);
