import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  // Company Information
  companyName: {
    type: String,
    default: 'PayZenix Technologies Pvt. Ltd.'
  },
  registrationNumber: {
    type: String,
    default: 'CIN: U72200KA2020PTC123456'
  },
  companyPAN: {
    type: String,
    default: 'ABCDE1234F'
  },
  tanNumber: {
    type: String,
    default: 'BLRA12345F'
  },
  address: {
    type: String,
    default: '123, Tech Park, Whitefield, Bangalore - 560066'
  },
  
  // PF Settings
  pfEnabled: {
    type: Boolean,
    default: true
  },
  pfEmployeeRate: {
    type: String,
    default: '12%'
  },
  pfEmployerRate: {
    type: String,
    default: '12%'
  },
  pfWageLimit: {
    type: String,
    default: '₹15,000'
  },
  
  // ESI Settings
  esiEnabled: {
    type: Boolean,
    default: true
  },
  esiEmployeeRate: {
    type: String,
    default: '0.75%'
  },
  esiEmployerRate: {
    type: String,
    default: '3.25%'
  },
  esiSalaryLimit: {
    type: String,
    default: '₹21,000'
  },
  
  // Salary Components
  salaryComponents: [{
    id: Number,
    name: String,
    type: {
      type: String,
      enum: ['earning', 'deduction']
    },
    calculation: String,
    taxable: Boolean,
    active: Boolean
  }],
  
  // Notification Settings
  notifications: {
    payrollProcessed: { type: Boolean, default: true },
    payslipAvailable: { type: Boolean, default: true },
    complianceReminders: { type: Boolean, default: true },
    newEmployee: { type: Boolean, default: false },
    loanUpdates: { type: Boolean, default: true }
  },
  
  // Metadata
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;
