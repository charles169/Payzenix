import { useState, useEffect } from 'react';
import { loanAPI, employeeAPI, Loan, Employee } from '@/services/api';
import toast from 'react-hot-toast';
import { Plus, Download, Eye, CheckCircle, XCircle, Clock, Search, FileText } from 'lucide-react';
import { SimpleLoanForm } from '@/components/SimpleLoanForm';
import { useAuthStore } from '@/stores/authStore';
import { hasPermission } from '@/utils/rbac';
import { downloadLoansPDF } from '@/utils/downloadUtils';

export const LoansSimplePage = () => {
  const { user } = useAuthStore();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);

  if (!user) return null;

  // Check permissions
  const canAdd = hasPermission(user.role, 'canAddLoan');
  const canApprove = hasPermission(user.role, 'canApproveLoan');
  const canExport = hasPermission(user.role, 'canExportData');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [loansData, employeesData] = await Promise.all([
        loanAPI.getAll(),
        employeeAPI.getAll()
      ]);
      setLoans(loansData);
      setEmployees(employeesData);
      toast.success(`Loaded ${loansData.length} loans from backend!`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load data');
      setLoans([]);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLoan = () => {
    console.log('Add Loan clicked!');
    setEditingLoan(null);
    setDialogOpen(true);
  };

  const handleExport = () => {
    try {
      toast.loading('Generating CSV...', { id: 'loans-csv' });
      const headers = ['Loan ID', 'Employee', 'Amount', 'Tenure', 'Status', 'Date'];
      const rows = loans.map(l => [
        l._id || '',
        getEmployeeName(l),
        l.amount,
        l.tenure,
        l.status,
        new Date().toLocaleDateString()
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `loans_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Loans CSV exported!', { id: 'loans-csv' });
    } catch (error) {
      toast.error('Failed to export CSV', { id: 'loans-csv' });
    }
  };

  const handleSaveLoan = async (loanData: Partial<Loan>) => {
    try {
      await loanAPI.create(loanData);
      toast.success('Loan created successfully!');
      await loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save loan');
      throw error;
    }
  };

  const handleApproveLoan = async (id: string, status: 'approved' | 'rejected') => {
    if (!confirm(`Are you sure you want to ${status} this loan?`)) return;
    try {
      await loanAPI.approve(id, status);
      toast.success(`Loan ${status} successfully!`);
      await loadData();
    } catch (error: any) {
      toast.error(error.message || `Failed to ${status} loan`);
    }
  };

  const getEmployeeName = (loan: Loan) => {
    if (typeof loan.employee === 'string') {
      const emp = employees.find(e => e._id === loan.employee);
      return emp ? `${emp.name} (${emp.employeeId})` : loan.employee;
    }
    return (loan.employee as any)?.name || 'Unknown';
  };

  const filteredLoans = loans.filter((loan) => {
    const employeeName = getEmployeeName(loan);
    const matchesSearch = employeeName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || loan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalDisbursed: loans.reduce((sum, loan) => sum + loan.amount, 0),
    totalRecovered: loans.reduce((sum, loan) => sum + (loan.paidAmount || 0), 0),
    activeLoans: loans.filter(l => l.status === 'active').length,
    pendingLoans: loans.filter(l => l.status === 'pending').length,
  };

  if (loading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <p style={{ fontSize: '18px' }}>Loading loans from backend...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '30px', maxWidth: '1400px', margin: '0 auto' }}>
      <SimpleLoanForm
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        loan={editingLoan}
        onSave={handleSaveLoan}
        employees={employees.map(e => ({ _id: e._id!, name: e.name, employeeId: e.employeeId }))}
      />

      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>Loans & Advances</h1>
            <p style={{ color: '#666', fontSize: '14px' }}>
              Manage employee loans and salary advances ({loans.length} loans)
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {canExport && (
              <>
                <button
                  onClick={async () => {
                    try {
                      toast.loading('Generating Loans PDF...', { id: 'loans-pdf' });
                      await downloadLoansPDF(loans);
                      toast.success('Loans PDF downloaded!', { id: 'loans-pdf' });
                    } catch (error) {
                      toast.error('Failed to download PDF', { id: 'loans-pdf' });
                    }
                  }}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    background: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <FileText style={{ width: '16px', height: '16px' }} />
                  PDF
                </button>
                <button
                  onClick={handleExport}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    background: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Download style={{ width: '16px', height: '16px' }} />
                  CSV
                </button>
              </>
            )}
            {canAdd && (
              <button
                onClick={handleAddLoan}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  background: '#4f46e5',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Plus style={{ width: '16px', height: '16px' }} />
                Add Loan
              </button>
            )}
            {!canAdd && !canExport && (
              <div style={{
                padding: '8px 16px',
                background: '#f3f4f6',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#666'
              }}>
                View Only Mode
              </div>
            )}
          </div>
        </div>

        {/* Search and Filter */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#999' }} />
            <input
              type="text"
              placeholder="Search by employee name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 40px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              minWidth: '150px'
            }}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ padding: '20px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '8px' }}>Total Disbursed</p>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>₹{(stats.totalDisbursed / 1000).toFixed(0)}K</p>
        </div>
        <div style={{ padding: '20px', background: '#dcfce7', borderRadius: '8px', border: '1px solid #86efac' }}>
          <p style={{ color: '#166534', fontSize: '14px', marginBottom: '8px' }}>Total Recovered</p>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#166534', margin: 0 }}>
            ₹{(stats.totalRecovered / 1000).toFixed(0)}K
          </p>
        </div>
        <div style={{ padding: '20px', background: '#dbeafe', borderRadius: '8px', border: '1px solid #93c5fd' }}>
          <p style={{ color: '#1e40af', fontSize: '14px', marginBottom: '8px' }}>Active Loans</p>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#1e40af', margin: 0 }}>
            {stats.activeLoans}
          </p>
        </div>
        <div style={{ padding: '20px', background: '#fef3c7', borderRadius: '8px', border: '1px solid #fcd34d' }}>
          <p style={{ color: '#92400e', fontSize: '14px', marginBottom: '8px' }}>Pending Approval</p>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#92400e', margin: 0 }}>
            {stats.pendingLoans}
          </p>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f9fafb' }}>
            <tr>
              <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: '600', fontSize: '14px' }}>Employee</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: '600', fontSize: '14px' }}>Loan Type</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '1px solid #e5e7eb', fontWeight: '600', fontSize: '14px' }}>Amount</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '1px solid #e5e7eb', fontWeight: '600', fontSize: '14px' }}>EMI</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '1px solid #e5e7eb', fontWeight: '600', fontSize: '14px' }}>Remaining</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: '600', fontSize: '14px' }}>Status</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '1px solid #e5e7eb', fontWeight: '600', fontSize: '14px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLoans.map((loan) => {
              const progress = loan.amount > 0 ? ((loan.paidAmount || 0) / loan.amount) * 100 : 0;
              
              return (
                <tr key={loan._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div>
                      <p style={{ fontWeight: '500', margin: 0, marginBottom: '4px' }}>{getEmployeeName(loan)}</p>
                      <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>{loan._id}</p>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      background: '#f3f4f6',
                      color: '#374151'
                    }}>
                      {loan.loanType}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '500' }}>
                    ₹{loan.amount.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div>
                      <p style={{ fontWeight: '500', margin: 0 }}>₹{loan.emiAmount.toLocaleString('en-IN')}</p>
                      <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
                        {Math.ceil(loan.remainingAmount / loan.emiAmount)} EMIs left
                      </p>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div>
                      <p style={{ fontWeight: '500', margin: 0 }}>₹{loan.remainingAmount.toLocaleString('en-IN')}</p>
                      <div style={{ width: '80px', marginLeft: 'auto', marginTop: '4px' }}>
                        <div style={{ background: '#e5e7eb', height: '4px', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ 
                            background: '#10b981', 
                            height: '100%', 
                            width: `${progress}%`,
                            transition: 'width 0.3s'
                          }} />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      background: 
                        loan.status === 'active' ? '#dbeafe' :
                        loan.status === 'completed' ? '#dcfce7' :
                        loan.status === 'pending' ? '#fef3c7' :
                        loan.status === 'approved' ? '#d1fae5' :
                        '#fee2e2',
                      color: 
                        loan.status === 'active' ? '#1e40af' :
                        loan.status === 'completed' ? '#166534' :
                        loan.status === 'pending' ? '#92400e' :
                        loan.status === 'approved' ? '#065f46' :
                        '#991b1b'
                    }}>
                      {loan.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      {loan.status === 'pending' && canApprove && (
                        <>
                          <button
                            onClick={() => loan._id && handleApproveLoan(loan._id, 'approved')}
                            style={{
                              padding: '6px 12px',
                              background: '#10b981',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <CheckCircle style={{ width: '14px', height: '14px' }} />
                            Approve
                          </button>
                          <button
                            onClick={() => loan._id && handleApproveLoan(loan._id, 'rejected')}
                            style={{
                              padding: '6px 12px',
                              background: 'white',
                              color: '#dc2626',
                              border: '1px solid #dc2626',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <XCircle style={{ width: '14px', height: '14px' }} />
                            Reject
                          </button>
                        </>
                      )}
                      {loan.status !== 'pending' && (
                        <button
                          onClick={() => toast.success(`Viewing loan ${loan._id}`)}
                          style={{
                            padding: '6px 12px',
                            background: 'white',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Eye style={{ width: '14px', height: '14px' }} />
                        </button>
                      )}
                      {loan.status === 'pending' && !canApprove && (
                        <span style={{
                          padding: '6px 12px',
                          fontSize: '12px',
                          color: '#666',
                          fontStyle: 'italic'
                        }}>
                          Pending Approval
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredLoans.length === 0 && (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <p style={{ color: '#666', fontSize: '16px', margin: 0 }}>
              {searchQuery ? 'No loans found matching your search.' : 'No loans in the database.'}
            </p>
            {!searchQuery && (
              <button
                onClick={handleAddLoan}
                style={{
                  marginTop: '20px',
                  padding: '10px 20px',
                  background: '#4f46e5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Plus style={{ width: '16px', height: '16px' }} />
                Create Your First Loan
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
