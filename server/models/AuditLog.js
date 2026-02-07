import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true
  },
  user: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  details: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['create', 'update', 'delete', 'process', 'approval', 'settings', 'report', 'auth'],
    required: true
  },
  module: {
    type: String,
    enum: ['Employees', 'Payroll', 'Loans', 'Settings', 'Reports', 'Leave', 'Authentication'],
    required: true
  }
}, {
  timestamps: true
});

// Index for faster queries
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ module: 1, createdAt: -1 });
auditLogSchema.index({ type: 1, createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
