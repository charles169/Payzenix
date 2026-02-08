import { useState, useEffect } from 'react';
import { loanAPI, employeeAPI, Loan, Employee } from '@/services/api';
import toast from 'react-hot-toast';
import { Plus, Download, Eye, CheckCircle, XCircle, Clock, Search, FileText } from 'lucide-react';
import { SimpleLoanForm } from '@/components/SimpleLoanForm';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [updateKey, setUpdateKey] = useState(0); // Force re-render
  const [approveModal, setApproveModal] = useState<{ show: boolean; loan: { id: string; status: 'approved' | 'rejected' } | null }>({
    show: false,
    loan: null
  });
  const [viewModal, setViewModal] = useState<{ show: boolean; loan: Loan | null }>({
    show: false,
    loan: null
  });

  // useEffect MUST be before any early returns!
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [updateKey, user]); // Reload when updateKey changes

  if (!user) return null;

  const canAdd = hasPermission(user.role, 'canAddLoan');
  const canApprove = hasPermission(user.role, 'canApproveLoan');
  const canExport = hasPermission(user.role, 'canExportData');

  const loadData = async () => {
    try {
      setLoading(true);
      const [loansData, employeesData] = await Promise.all([
        loanAPI.getAll(),
        employeeAPI.getAll()
      ]);
      const validLoans = loansData.filter(l => l && l._id);
      const validEmployees = employeesData.filter(e => e && e._id && e.name);
      setLoans(validLoans);
      setEmployees(validEmployees);
    } catch (error: any) {
      console.error('Error loading data:', error);
      setLoans([]);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLoan = async (loanData: Partial<Loan>) => {
    setDialogOpen(false);
    
    try {
      await loanAPI.create(loanData);
      toast.success('Loan created!', { duration: 3000, icon: '✅' });
      // Trigger reload
      setUpdateKey(prev => prev + 1);
      // ALSO call loadData directly
      setTimeout(() => loadData(), 100);
    } catch (error: any) {
      console.error('Failed to save loan:', error);
      toast.error('Failed to save loan');
    }
  };

  const confirmApprove = async () => {
    if (!approveModal.loan) return;

    const loanId = approveModal.loan.id;
    const newStatus = approveModal.loan.status;

    setApproveModal({ show: false, loan: null });

    try {
      await loanAPI.approve(loanId, newStatus);
      toast.success(`Loan ${newStatus}!`, { duration: 4000, icon: '✅' });
      // Trigger reload
      setUpdateKey(prev => prev + 1);
      // ALSO call loadData directly
      setTimeout(() => loadData(), 100);
    } catch (error: any) {
      console.error('Failed to approve loan:', error);
      toast.error('Failed to update loan status');
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

  const handleApproveLoan = async (id: string, status: 'approved' | 'rejected') => {
    setApproveModal({ show: true, loan: { id, status } });
  };

  const getEmployeeName = (loan: Loan) => {
    try {
      if (!loan || !loan.employee) {
        return null; // Return null for invalid loans
      }
      
      const employee = loan.employee;
      
      // If employee is an object (populated), use it directly
      if (typeof employee === 'object' && employee !== null) {
        const empObj = employee as any;
        if (empObj._id) {
          return `${empObj.name} (${empObj.employeeId || 'N/A'})`;
        }
      }
      
      // If employee is a string ID, look it up in employees array
      const loanEmployeeId = typeof employee === 'string' ? employee : (employee as any)?._id;
      
      // Try exact match first
      let emp = employees.find(e => e && e._id === loanEmployeeId);
      
      // If not found, try string comparison
      if (!emp && loanEmployeeId) {
        emp = employees.find(e => e && e._id?.toString() === loanEmployeeId.toString());
      }
      
      if (emp) {
        return `${emp.name} (${emp.employeeId})`;
      }
      
      // If employee not found, return null (will be filtered out)
      return null;
    } catch (error) {
      console.error('Error getting employee name:', error);
      return null;
    }
  };

  // Filter out loans with deleted employees AND apply search/status filters
  const filteredLoans = loans.filter((loan) => {
    const employeeName = getEmployeeName(loan);
    
    // Skip loans with deleted employees
    if (!employeeName) {
      console.warn('⚠️ Skipping loan with deleted employee:', loan._id);
      return false;
    }
    
    const matchesSearch = employeeName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || loan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalDisbursed: loans.reduce((sum, loan) => sum + (loan?.amount || 0), 0),
    totalRecovered: loans.reduce((sum, loan) => sum + (loan?.paidAmount || 0), 0),
    activeLoans: loans.filter(l => l?.status === 'active').length,
    pendingLoans: loans.filter(l => l?.status === 'pending').length,
  };

  if (loading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <p style={{ fontSize: '18px' }}>Loading loans from backend...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div 
        onMouseEnter={() => setSidebarCollapsed(false)}
        onMouseLeave={() => setSidebarCollapsed(true)}
      >
        <Sidebar />
      </div>
      <div 
        style={{ 
          marginLeft: sidebarCollapsed ? '80px' : '280px',
          transition: 'margin-left 0.3s ease-in-out'
        }}
      >
        <Header />
        <main className="p-6 animate-fadeIn">
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
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
      <div key={`loans-table-${updateKey}`} style={{ background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
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
              if (!loan || !loan._id) return null;
              
              try {
                const progress = loan.amount > 0 ? ((loan.paidAmount || 0) / loan.amount) * 100 : 0;
                const employeeName = getEmployeeName(loan);
                const remainingEMIs = loan.emiAmount > 0 ? Math.ceil((loan.remainingAmount || 0) / loan.emiAmount) : 0;
                
                // Use a unique key that includes status to force re-render when status changes
                const uniqueKey = `${loan._id}-${loan.status}-${(loan as any)._updatedAt || ''}`;
                
                return (
                  <tr key={uniqueKey} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div>
                        <p style={{ fontWeight: '500', margin: 0, marginBottom: '4px' }}>{employeeName}</p>
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
                        {loan.loanType || 'N/A'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '500' }}>
                      ₹{(loan.amount || 0).toLocaleString('en-IN')}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div>
                        <p style={{ fontWeight: '500', margin: 0 }}>₹{(loan.emiAmount || 0).toLocaleString('en-IN')}</p>
                        <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>
                          {remainingEMIs} EMIs left
                        </p>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div>
                        <p style={{ fontWeight: '500', margin: 0 }}>₹{(loan.remainingAmount || 0).toLocaleString('en-IN')}</p>
                        <div style={{ width: '80px', marginLeft: 'auto', marginTop: '4px' }}>
                          <div style={{ background: '#e5e7eb', height: '4px', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{ 
                              background: '#10b981', 
                              height: '100%', 
                              width: `${Math.min(100, Math.max(0, progress))}%`,
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
                        {loan.status || 'pending'}
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
                            onClick={() => setViewModal({ show: true, loan })}
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
                            title="View Loan Details"
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
              } catch (error) {
                console.error('Error rendering loan row:', error, loan);
                return null;
              }
            }).filter(Boolean)}
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

      {/* Approve/Reject Confirmation Modal */}
      {approveModal.show && (
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
          zIndex: 99999
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            minWidth: '400px',
            maxWidth: '480px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
          }}>
            {/* Header */}
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ 
                margin: 0, 
                fontSize: '20px', 
                fontWeight: '600',
                color: '#111827',
                marginBottom: '8px'
              }}>
                {approveModal.loan?.status === 'approved' ? 'Approve Loan' : 'Reject Loan'}
              </h3>
              <p style={{ 
                margin: 0, 
                fontSize: '14px',
                color: '#6b7280',
                lineHeight: '1.5'
              }}>
                Are you sure you want to {approveModal.loan?.status} this loan? This action cannot be undone.
              </p>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setApproveModal({ show: false, loan: null })}
                style={{
                  padding: '10px 20px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  background: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#374151'
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmApprove}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '8px',
                  background: approveModal.loan?.status === 'approved' ? '#16a34a' : '#dc2626',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                {approveModal.loan?.status === 'approved' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Loan Details Modal */}
      {viewModal.show && viewModal.loan && (
        <div className="modal-backdrop" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '20px'
        }}>
          <div className="modal-content animate-zoomIn" style={{
            background: 'white',
            borderRadius: '12px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            {/* Header */}
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #e5e7eb',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px 12px 0 0'
            }}>
              <h3 style={{ 
                margin: 0, 
                fontSize: '24px', 
                fontWeight: '600',
                color: 'white',
                marginBottom: '8px'
              }}>
                Loan Details
              </h3>
              <p style={{ 
                margin: 0, 
                fontSize: '14px',
                color: 'rgba(255,255,255,0.9)'
              }}>
                {getEmployeeName(viewModal.loan)}
              </p>
            </div>

            {/* Content */}
            <div style={{ padding: '24px' }}>
              {/* Status Badge */}
              <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                <span style={{
                  padding: '8px 24px',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'inline-block',
                  background: 
                    viewModal.loan.status === 'active' ? '#dbeafe' :
                    viewModal.loan.status === 'completed' ? '#dcfce7' :
                    viewModal.loan.status === 'pending' ? '#fef3c7' :
                    viewModal.loan.status === 'approved' ? '#d1fae5' :
                    '#fee2e2',
                  color: 
                    viewModal.loan.status === 'active' ? '#1e40af' :
                    viewModal.loan.status === 'completed' ? '#166534' :
                    viewModal.loan.status === 'pending' ? '#92400e' :
                    viewModal.loan.status === 'approved' ? '#065f46' :
                    '#991b1b'
                }}>
                  {viewModal.loan.status?.toUpperCase()}
                </span>
              </div>

              {/* Loan Information Grid */}
              <div style={{ display: 'grid', gap: '16px' }}>
                <div style={{ 
                  padding: '16px', 
                  background: '#f9fafb', 
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ color: '#666', fontSize: '14px' }}>Loan ID</span>
                  <span style={{ fontWeight: '600', fontSize: '14px', fontFamily: 'monospace' }}>
                    {viewModal.loan._id}
                  </span>
                </div>

                <div style={{ 
                  padding: '16px', 
                  background: '#f9fafb', 
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ color: '#666', fontSize: '14px' }}>Loan Type</span>
                  <span style={{ fontWeight: '600', fontSize: '14px', textTransform: 'capitalize' }}>
                    {viewModal.loan.loanType || 'N/A'}
                  </span>
                </div>

                <div style={{ 
                  padding: '16px', 
                  background: '#dcfce7', 
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ color: '#166534', fontSize: '14px', fontWeight: '500' }}>Loan Amount</span>
                  <span style={{ fontWeight: '700', fontSize: '20px', color: '#166534' }}>
                    ₹{(viewModal.loan.amount || 0).toLocaleString('en-IN')}
                  </span>
                </div>

                <div style={{ 
                  padding: '16px', 
                  background: '#f9fafb', 
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ color: '#666', fontSize: '14px' }}>Interest Rate</span>
                  <span style={{ fontWeight: '600', fontSize: '14px' }}>
                    {viewModal.loan.interestRate || 0}% per annum
                  </span>
                </div>

                <div style={{ 
                  padding: '16px', 
                  background: '#f9fafb', 
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ color: '#666', fontSize: '14px' }}>Tenure</span>
                  <span style={{ fontWeight: '600', fontSize: '14px' }}>
                    {viewModal.loan.tenure || 0} months
                  </span>
                </div>

                <div style={{ 
                  padding: '16px', 
                  background: '#dbeafe', 
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ color: '#1e40af', fontSize: '14px', fontWeight: '500' }}>Monthly EMI</span>
                  <span style={{ fontWeight: '700', fontSize: '18px', color: '#1e40af' }}>
                    ₹{(viewModal.loan.emiAmount || 0).toLocaleString('en-IN')}
                  </span>
                </div>

                <div style={{ 
                  padding: '16px', 
                  background: '#f9fafb', 
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ color: '#666', fontSize: '14px' }}>Paid Amount</span>
                  <span style={{ fontWeight: '600', fontSize: '14px', color: '#16a34a' }}>
                    ₹{(viewModal.loan.paidAmount || 0).toLocaleString('en-IN')}
                  </span>
                </div>

                <div style={{ 
                  padding: '16px', 
                  background: '#fef3c7', 
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ color: '#92400e', fontSize: '14px', fontWeight: '500' }}>Remaining Amount</span>
                  <span style={{ fontWeight: '700', fontSize: '18px', color: '#92400e' }}>
                    ₹{(viewModal.loan.remainingAmount || 0).toLocaleString('en-IN')}
                  </span>
                </div>

                <div style={{ 
                  padding: '16px', 
                  background: '#f9fafb', 
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ color: '#666', fontSize: '14px' }}>Start Date</span>
                  <span style={{ fontWeight: '600', fontSize: '14px' }}>
                    {viewModal.loan.startDate ? new Date(viewModal.loan.startDate).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    }) : 'N/A'}
                  </span>
                </div>

                {viewModal.loan.reason && (
                  <div style={{ 
                    padding: '16px', 
                    background: '#f9fafb', 
                    borderRadius: '8px'
                  }}>
                    <span style={{ color: '#666', fontSize: '14px', display: 'block', marginBottom: '8px' }}>Reason</span>
                    <span style={{ fontWeight: '500', fontSize: '14px' }}>
                      {viewModal.loan.reason}
                    </span>
                  </div>
                )}

                {viewModal.loan.remarks && (
                  <div style={{ 
                    padding: '16px', 
                    background: '#f9fafb', 
                    borderRadius: '8px'
                  }}>
                    <span style={{ color: '#666', fontSize: '14px', display: 'block', marginBottom: '8px' }}>Remarks</span>
                    <span style={{ fontWeight: '500', fontSize: '14px' }}>
                      {viewModal.loan.remarks}
                    </span>
                  </div>
                )}

                {/* Progress Bar */}
                <div style={{ 
                  padding: '16px', 
                  background: '#f9fafb', 
                  borderRadius: '8px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#666', fontSize: '14px' }}>Repayment Progress</span>
                    <span style={{ fontWeight: '600', fontSize: '14px' }}>
                      {viewModal.loan.amount > 0 ? Math.round(((viewModal.loan.paidAmount || 0) / viewModal.loan.amount) * 100) : 0}%
                    </span>
                  </div>
                  <div style={{ background: '#e5e7eb', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ 
                      background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)', 
                      height: '100%', 
                      width: `${viewModal.loan.amount > 0 ? Math.min(100, ((viewModal.loan.paidAmount || 0) / viewModal.loan.amount) * 100) : 0}%`,
                      transition: 'width 0.3s',
                      borderRadius: '4px'
                    }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ 
              padding: '16px 24px', 
              background: '#f9fafb',
              display: 'flex', 
              justifyContent: 'flex-end',
              borderTop: '1px solid #e5e7eb',
              borderRadius: '0 0 12px 12px'
            }}>
              <button
                onClick={() => setViewModal({ show: false, loan: null })}
                style={{
                  padding: '10px 28px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
          </div>
        </main>
      </div>
    </div>
  );
};
