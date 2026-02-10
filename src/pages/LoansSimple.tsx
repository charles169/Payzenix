import { useState, useEffect } from 'react';
import { loanAPI, employeeAPI, Loan, Employee } from '@/services/api';
import toast from 'react-hot-toast';
import { Plus, Download, Eye, CheckCircle, XCircle, Clock, Search, FileText, Wallet } from 'lucide-react';
import { SimpleLoanForm } from '@/components/SimpleLoanForm';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useAuthStore } from '@/stores/authStore';
import { hasPermission } from '@/utils/rbac';
import { downloadLoansPDF } from '@/utils/downloadUtils';
import { cn } from '@/lib/utils';

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
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-lg font-medium text-muted-foreground animate-pulse">
          Loading loans from backend...
        </p>
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
        className={cn(
          "transition-all duration-300",
          sidebarCollapsed ? "ml-[80px]" : "ml-[280px]"
        )}
      >
        <Header />
        <main className="p-6 pt-24 animate-fadeIn">
          <div className="max-w-[1400px] mx-auto">
            <SimpleLoanForm
              open={dialogOpen}
              onClose={() => setDialogOpen(false)}
              loan={editingLoan}
              onSave={handleSaveLoan}
              employees={employees.map(e => ({ _id: e._id!, name: e.name, employeeId: e.employeeId }))}
            />

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
              <div>
                <h1 className="text-3xl font-extrabold text-foreground mb-1 uppercase tracking-tight">Loans & Advances</h1>
                <p className="text-muted-foreground text-sm font-medium">Manage employee loan applications and recovery ({loans.length})</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <input
                    type="text"
                    placeholder="Search by ID or Name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-card text-card-foreground border border-border rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all w-[240px] shadow-sm font-medium"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-card text-card-foreground border border-border rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none transition-all shadow-sm cursor-pointer font-bold"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>

                <div className="flex items-center gap-2">
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
                        className="p-2.5 bg-card text-card-foreground hover:bg-muted border border-border rounded-xl transition-all shadow-sm active:scale-95"
                        title="Export to PDF"
                      >
                        <FileText className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleExport}
                        className="p-2.5 bg-card text-card-foreground hover:bg-muted border border-border rounded-xl transition-all shadow-sm active:scale-95"
                        title="Export CSV"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </>
                  )}

                  {canAdd && (
                    <button
                      onClick={handleAddLoan}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground border-none rounded-xl px-4 py-2.5 text-sm font-black flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-primary/20 uppercase tracking-widest"
                    >
                      <Plus className="w-4 h-4" />
                      Add Loan
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="p-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white shadow-xl shadow-indigo-500/20 transform hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest opacity-90">Total Disbursed</p>
                </div>
                <p className="text-4xl font-black mb-1">₹{(stats.totalDisbursed / 1000).toFixed(0)}K</p>
                <p className="text-xs font-medium opacity-75">{loans.length} active records</p>
              </div>

              <div className="p-6 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl text-white shadow-xl shadow-emerald-500/20 transform hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest opacity-90">Total Recovered</p>
                </div>
                <p className="text-4xl font-black mb-1">₹{(stats.totalRecovered / 1000).toFixed(0)}K</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white transition-all duration-1000"
                      style={{ width: `${stats.totalDisbursed > 0 ? (stats.totalRecovered / stats.totalDisbursed) * 100 : 0}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-black">{stats.totalDisbursed > 0 ? Math.round((stats.totalRecovered / stats.totalDisbursed) * 100) : 0}%</span>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl text-white shadow-xl shadow-blue-500/20 transform hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Clock className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest opacity-90">Active Loans</p>
                </div>
                <p className="text-4xl font-black mb-1">{stats.activeLoans}</p>
                <p className="text-xs font-medium opacity-75">Currently in repayment</p>
              </div>

              <div className="p-6 bg-gradient-to-br from-rose-500 to-orange-500 rounded-2xl text-white shadow-xl shadow-rose-500/20 transform hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <XCircle className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest opacity-90">Pending Approval</p>
                </div>
                <p className="text-4xl font-black mb-1">{stats.pendingLoans}</p>
                <p className="text-xs font-medium opacity-75">Awaiting admin review</p>
              </div>
            </div>

            {/* Table */}
            <div key={`loans-table-${updateKey}`} className="bg-card text-card-foreground rounded-2xl border border-border shadow-lg overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="px-6 py-4 text-left text-xs font-black text-muted-foreground uppercase tracking-widest">Employee</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-muted-foreground uppercase tracking-widest">Loan Type</th>
                    <th className="px-6 py-4 text-right text-xs font-black text-muted-foreground uppercase tracking-widest">Amount</th>
                    <th className="px-6 py-4 text-right text-xs font-black text-muted-foreground uppercase tracking-widest">EMI</th>
                    <th className="px-6 py-4 text-right text-xs font-black text-muted-foreground uppercase tracking-widest">Remaining</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-muted-foreground uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-black text-muted-foreground uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredLoans.map((loan) => {
                    if (!loan || !loan._id) return null;

                    try {
                      const progress = loan.amount > 0 ? ((loan.paidAmount || 0) / loan.amount) * 100 : 0;
                      const employeeName = getEmployeeName(loan);
                      const remainingEMIs = loan.emiAmount > 0 ? Math.ceil((loan.remainingAmount || 0) / loan.emiAmount) : 0;

                      // Use a unique key that includes status to force re-render when status changes
                      const uniqueKey = `${loan._id}-${loan.status}-${(loan as any)._updatedAt || ''}`;

                      const initials = employeeName.split(' ').map((n: string) => n[0] || '').join('').toUpperCase() || 'U';

                      return (
                        <tr key={uniqueKey} className="hover:bg-muted/30 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                                {initials}
                              </div>
                              <div>
                                <p className="font-bold text-foreground text-sm m-0">{employeeName}</p>
                                <p className="text-[10px] text-muted-foreground font-mono mt-0.5 uppercase tracking-tighter">{loan._id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-muted text-muted-foreground border border-border">
                              {loan.loanType || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-black text-foreground">
                            ₹{(loan.amount || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div>
                              <p className="text-sm font-black text-foreground m-0">₹{(loan.emiAmount || 0).toLocaleString('en-IN')}</p>
                              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter m-0">
                                {remainingEMIs} EMIs left
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div>
                              <p className="text-sm font-black text-primary m-0">₹{(loan.remainingAmount || 0).toLocaleString('en-IN')}</p>
                              <div className="w-20 ml-auto mt-1.5">
                                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-emerald-500 transition-all duration-500"
                                    style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                              loan.status === 'active' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                                loan.status === 'completed' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                  loan.status === 'pending' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                                    loan.status === 'approved' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                      "bg-destructive/10 text-destructive border-destructive/20"
                            )}>
                              {loan.status || 'pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {loan.status === 'pending' && canApprove && (
                                <>
                                  <button
                                    onClick={() => loan._id && handleApproveLoan(loan._id, 'approved')}
                                    className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
                                    title="Approve Loan"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => loan._id && handleApproveLoan(loan._id, 'rejected')}
                                    className="p-2 bg-destructive hover:bg-destructive/90 text-white rounded-lg transition-all active:scale-95 shadow-lg shadow-destructive/20"
                                    title="Reject Loan"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => setViewModal({ show: true, loan })}
                                className="p-2 bg-card text-card-foreground hover:bg-muted border border-border rounded-lg transition-all"
                                title="View Loan Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    } catch (error) {
                      console.error('Error rendering loan row:', error, loan);
                      return null;
                    }
                  }).filter(Boolean)}
                  {filteredLoans.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center justify-center gap-4">
                          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                            <Wallet className="w-8 h-8 text-muted-foreground opacity-50" />
                          </div>
                          <div>
                            <p className="text-lg font-bold text-foreground mb-1">No loans found</p>
                            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                              {searchQuery ? `We couldn't find any results for "${searchQuery}"` : 'Your loan records and applications will appear here.'}
                            </p>
                          </div>
                          {!searchQuery && canAdd && (
                            <button
                              onClick={handleAddLoan}
                              className="mt-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-black transition-all active:scale-95 shadow-lg shadow-primary/20"
                            >
                              Create Your First Loan
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Approve/Reject Confirmation Modal */}
            {approveModal.show && (
              <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[9999] animate-fadeIn p-4">
                <div className="bg-card text-card-foreground rounded-2xl p-8 max-w-md w-full shadow-2xl border border-border">
                  <div className="mb-6">
                    <h3 className="text-2xl font-black text-foreground mb-2">
                      {approveModal.loan?.status === 'approved' ? 'Approve Loan' : 'Reject Loan'}
                    </h3>
                    <p className="text-muted-foreground font-medium">
                      Are you sure you want to {approveModal.loan?.status} this loan application? This action will be recorded and cannot be undone.
                    </p>
                  </div>

                  <div className="flex gap-4 justify-end">
                    <button
                      onClick={() => setApproveModal({ show: false, loan: null })}
                      className="px-6 py-2.5 bg-card text-card-foreground hover:bg-muted border border-border rounded-xl font-bold transition-all active:scale-95"
                    >
                      Go Back
                    </button>
                    <button
                      onClick={confirmApprove}
                      className={cn(
                        "px-6 py-2.5 rounded-xl font-black text-white transition-all active:scale-95 shadow-lg",
                        approveModal.loan?.status === 'approved' ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20" : "bg-destructive hover:bg-destructive/90 shadow-destructive/20"
                      )}
                    >
                      {approveModal.loan?.status === 'approved' ? 'Yes, Approve' : 'Yes, Reject'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* View Loan Details Modal */}
            {viewModal.show && viewModal.loan && (
              <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[9999] animate-fadeIn p-4">
                <div className="bg-card text-card-foreground rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl border border-border animate-in zoom-in duration-300">
                  {/* Header */}
                  <div className="p-8 bg-gradient-to-br from-indigo-500 to-purple-600 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent)]" />
                    <h3 className="text-3xl font-black mb-2 relative z-10">Loan Details</h3>
                    <p className="text-indigo-100 font-medium relative z-10 opacity-90">
                      {getEmployeeName(viewModal.loan)}
                    </p>
                  </div>

                  {/* Content */}
                  <div className="p-8 overflow-y-auto max-h-[calc(90vh-140px)] custom-scrollbar">
                    {/* Status Badge */}
                    <div className="flex justify-center mb-8">
                      <span className={cn(
                        "px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest border shadow-sm",
                        viewModal.loan.status === 'active' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                          viewModal.loan.status === 'completed' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                            viewModal.loan.status === 'pending' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                              viewModal.loan.status === 'approved' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                "bg-destructive/10 text-destructive border-destructive/20"
                      )}>
                        {viewModal.loan.status}
                      </span>
                    </div>

                    {/* Loan Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-muted/50 rounded-2xl border border-border flex flex-col gap-1 transition-colors hover:bg-muted">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Loan ID</span>
                        <span className="font-mono text-sm font-bold text-foreground">{viewModal.loan._id}</span>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-2xl border border-border flex flex-col gap-1 transition-colors hover:bg-muted">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Loan Type</span>
                        <span className="text-sm font-bold text-foreground capitalize">{viewModal.loan.loanType || 'N/A'}</span>
                      </div>

                      <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex flex-col gap-1">
                        <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Loan Amount</span>
                        <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                          ₹{(viewModal.loan.amount || 0).toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-2xl border border-border flex flex-col gap-1 transition-colors hover:bg-muted">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Interest Rate</span>
                        <span className="text-sm font-bold text-foreground">{viewModal.loan.interestRate || 0}% per annum</span>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-2xl border border-border flex flex-col gap-1 transition-colors hover:bg-muted">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Tenure</span>
                        <span className="text-sm font-bold text-foreground">{viewModal.loan.tenure || 0} months</span>
                      </div>

                      <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 flex flex-col gap-1">
                        <span className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest">Monthly EMI</span>
                        <span className="text-xl font-black text-blue-600 dark:text-blue-400">
                          ₹{(viewModal.loan.emiAmount || 0).toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-2xl border border-border flex flex-col gap-1 transition-colors hover:bg-muted">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Paid Amount</span>
                        <span className="text-sm font-bold text-emerald-500">₹{(viewModal.loan.paidAmount || 0).toLocaleString('en-IN')}</span>
                      </div>

                      <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/20 flex flex-col gap-1">
                        <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">Remaining</span>
                        <span className="text-xl font-black text-amber-600 dark:text-amber-400">₹{(viewModal.loan.remainingAmount || 0).toLocaleString('en-IN')}</span>
                      </div>

                      <div className="p-4 bg-muted/50 rounded-2xl border border-border flex flex-col gap-1 transition-colors hover:bg-muted">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Start Date</span>
                        <span className="text-sm font-bold text-foreground">
                          {viewModal.loan.startDate ? new Date(viewModal.loan.startDate).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          }) : 'N/A'}
                        </span>
                      </div>

                      {viewModal.loan.reason && (
                        <div className="p-4 bg-muted/50 rounded-2xl border border-border transition-colors hover:bg-muted">
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Reason</span>
                          <p className="text-sm font-medium text-foreground">{viewModal.loan.reason}</p>
                        </div>
                      )}

                      {viewModal.loan.remarks && (
                        <div className="p-4 bg-muted/50 rounded-2xl border border-border transition-colors hover:bg-muted">
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block mb-1">Remarks</span>
                          <p className="text-sm font-medium text-foreground">{viewModal.loan.remarks}</p>
                        </div>
                      )}

                      {/* Progress Section */}
                      <div className="md:col-span-2 p-6 bg-muted/30 rounded-2xl border border-border mt-2">
                        <div className="flex justify-between items-end mb-4">
                          <div>
                            <h4 className="text-xs font-black text-foreground uppercase tracking-widest mb-1">Repayment Progress</h4>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">
                              {viewModal.loan.amount > 0 ? Math.round(((viewModal.loan.paidAmount || 0) / viewModal.loan.amount) * 100) : 0}% Recovered
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-black text-primary">₹{(viewModal.loan.paidAmount || 0).toLocaleString('en-IN')}</span>
                            <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-tighter">of total loan</span>
                          </div>
                        </div>
                        <div className="h-3 bg-muted rounded-full overflow-hidden p-0.5 border border-border shadow-inner">
                          <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-1000 shadow-lg shadow-indigo-500/20"
                            style={{ width: `${viewModal.loan.amount > 0 ? Math.min(100, ((viewModal.loan.paidAmount || 0) / viewModal.loan.amount) * 100) : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-6 bg-muted/20 border-t border-border flex justify-end">
                    <button
                      onClick={() => setViewModal({ show: false, loan: null })}
                      className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-sm rounded-xl transition-all active:scale-95 shadow-lg shadow-indigo-500/25 uppercase tracking-widest"
                    >
                      Close Details
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
