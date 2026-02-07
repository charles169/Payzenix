import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loan } from '@/services/api';
import { X } from 'lucide-react';

interface SimpleLoanFormProps {
  open: boolean;
  onClose: () => void;
  loan?: Loan | null;
  onSave: (loan: Partial<Loan>) => Promise<void>;
  employees: Array<{ _id: string; name: string; employeeId: string }>;
}

export function SimpleLoanForm({ open, onClose, loan, onSave, employees }: SimpleLoanFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    employee: '',
    loanType: 'personal' as 'personal' | 'advance' | 'emergency',
    amount: '',
    interestRate: '0',
    tenure: '',
    reason: '',
  });

  useEffect(() => {
    if (loan) {
      const employeeId = typeof loan.employee === 'string' ? loan.employee : (loan.employee as any)?._id || '';
      setFormData({
        employee: employeeId,
        loanType: loan.loanType || 'personal',
        amount: loan.amount?.toString() || '',
        interestRate: loan.interestRate?.toString() || '0',
        tenure: loan.tenure?.toString() || '',
        reason: loan.reason || '',
      });
    } else {
      setFormData({
        employee: '',
        loanType: 'personal',
        amount: '',
        interestRate: '0',
        tenure: '',
        reason: '',
      });
    }
  }, [loan, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const amount = Number(formData.amount);
      const tenure = Number(formData.tenure);
      const emiAmount = Math.ceil(amount / tenure);
      
      await onSave({
        employee: formData.employee,
        loanType: formData.loanType,
        amount,
        interestRate: Number(formData.interestRate),
        tenure,
        emiAmount,
        remainingAmount: amount,
        startDate: new Date(),
        status: 'pending',
        reason: formData.reason,
      });
      onClose();
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '8px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, background: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
                {loan ? 'Edit Loan' : 'Create New Loan'}
              </h2>
              <p style={{ fontSize: '14px', color: '#666', margin: '4px 0 0 0' }}>
                {loan ? 'Update loan information' : 'Fill in the details to create a new loan'}
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '4px'
              }}
            >
              <X style={{ width: '20px', height: '20px' }} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
          <div style={{ display: 'grid', gap: '16px' }}>
            {/* Employee */}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                Employee *
              </label>
              <select
                value={formData.employee}
                onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="">Select employee</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name} ({emp.employeeId})
                  </option>
                ))}
              </select>
            </div>

            {/* Loan Type */}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                Loan Type *
              </label>
              <select
                value={formData.loanType}
                onChange={(e) => setFormData({ ...formData, loanType: e.target.value as 'personal' | 'advance' | 'emergency' })}
                required
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              >
                <option value="personal">Personal Loan</option>
                <option value="advance">Salary Advance</option>
                <option value="emergency">Emergency Loan</option>
              </select>
            </div>

            {/* Amount */}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                Loan Amount (₹) *
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="50000"
                required
                min="1000"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Tenure */}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                Tenure (Months) *
              </label>
              <input
                type="number"
                value={formData.tenure}
                onChange={(e) => setFormData({ ...formData, tenure: e.target.value })}
                placeholder="12"
                required
                min="1"
                max="60"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
              {formData.amount && formData.tenure && (
                <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  EMI: ₹{Math.ceil(Number(formData.amount) / Number(formData.tenure)).toLocaleString('en-IN')}/month
                </p>
              )}
            </div>

            {/* Interest Rate */}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                Interest Rate (% per annum)
              </label>
              <input
                type="number"
                value={formData.interestRate}
                onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                placeholder="0"
                min="0"
                max="20"
                step="0.1"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Reason */}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                Reason
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Purpose of the loan..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '24px', justifyContent: 'flex-end' }}>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : loan ? 'Update Loan' : 'Create Loan'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
