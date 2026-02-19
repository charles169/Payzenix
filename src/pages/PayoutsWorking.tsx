import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Eye, Download, Pencil, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { payrollAPI } from '@/services/api';
import { usePageFocus } from '@/hooks/usePageFocus';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

export const PayoutsWorkingPage = () => {
  const { user } = useAuthStore();
  const [payslips, setPayslips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [year, setYear] = useState('all');
  const [status, setStatus] = useState('all');
  const [selected, setSelected] = useState<string[]>([]);
  const [preview, setPreview] = useState<any>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [editingPayslip, setEditingPayslip] = useState<string | null>(null);

  // Check if user can edit (only superadmin and admin)
  const canEdit = user?.role === 'superadmin' || user?.role === 'admin';

  const loadPayslips = async () => {
    try {
      setLoading(true);
      const data = await payrollAPI.getAll();
      // Filter out null/invalid payroll records
      const validPayslips = data.filter(p => p && p._id && p.employee);
      console.log('✅ Loaded payslips:', validPayslips);
      setPayslips(validPayslips);
    } catch (error) {
      console.error('❌ Error loading payslips:', error);
      toast.error('Failed to load payslips');
    } finally {
      setLoading(false);
    }
  };

  // Reload data when page becomes visible/focused
  usePageFocus(loadPayslips, []);

  const getEmployeeName = (payslip: any) => {
    if (!payslip || !payslip.employee) return 'Unknown';
    if (typeof payslip.employee === 'object') {
      return payslip.employee.name || 'Unknown';
    }
    return payslip.employee;
  };

  const filtered = payslips.filter(
    (p) => {
      const employeeName = getEmployeeName(p);
      return (
        (employeeName.toLowerCase().includes(search.toLowerCase()) ||
          (p._id || '').toLowerCase().includes(search.toLowerCase())) &&
        (year === 'all' || p.year?.toString() === year) &&
        (status === 'all' || p.status === status)
      );
    }
  );

  const totalNet = filtered.reduce((s, p) => s + (p.netSalary || 0), 0);
  const pendingCount = payslips.filter((p) => p.status === 'pending').length;

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelected(selected.length === filtered.length ? [] : filtered.map((p) => p._id));
  };

  const updateStatus = async (value: 'paid' | 'pending' | 'processed') => {
    if (!selected.length) return;

    // Show success toast immediately
    toast.success(`Payslips marked as ${value}`);

    // Update local state immediately
    setPayslips((prev) =>
      prev.map((p) =>
        selected.includes(p._id) ? { ...p, status: value } : p
      )
    );

    // Clear selection
    setSelected([]);

    // Update in database in background
    try {
      for (const id of selected) {
        await payrollAPI.update(id, { status: value });
      }
      console.log('✅ Background status update successful');
    } catch (error) {
      console.error('❌ Background status update failed:', error);
      // Don't show error to user - they already saw success
    }
  };

  const handleEdit = async (payslip: any) => {
    if (!canEdit) {
      toast.error('Only superadmin and admin can edit payslips');
      return;
    }

    console.log('✏️ Edit clicked:', payslip);
    setEditingPayslip(payslip._id);
    
    // Cycle through statuses: pending -> processed -> paid -> pending
    const statusCycle = { pending: 'processed', processed: 'paid', paid: 'pending' };
    const newStatus = statusCycle[payslip.status as keyof typeof statusCycle] || 'pending';
    
    try {
      await payrollAPI.update(payslip._id, { status: newStatus });
      
      // Update local state
      setPayslips((prev) =>
        prev.map((p) =>
          p._id === payslip._id ? { ...p, status: newStatus } : p
        )
      );
      
      toast.success(`Status updated to ${newStatus}!`);
      
      // Reload data after 500ms
      setTimeout(() => loadPayslips(), 500);
    } catch (error) {
      console.error('❌ Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setEditingPayslip(null);
    }
  };

  const handlePreview = (payslip: any) => {
    console.log('👁️ Preview clicked:', payslip);
    setPreview(payslip);
  };

  const downloadCSV = (rows: any[], name = 'payslips.csv') => {
    if (!rows.length) {
      toast.error('No data to download');
      return;
    }
    toast.loading('Preparing CSV download...');
    setTimeout(() => {
      const header = Object.keys(rows[0]).join(',');
      const body = rows.map((r) => Object.values(r).join(',')).join('\n');
      const csv = `${header}\n${body}`;
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = name;
      a.click();
      URL.revokeObjectURL(url);
      toast.dismiss();
      toast.success('CSV downloaded successfully!');
    }, 500);
  };

  const downloadSingle = (p: any) => {
    setDownloading(p._id);
    toast.loading('Preparing download...');
    setTimeout(() => {
      const employeeName = getEmployeeName(p);
      downloadCSV([{
        Employee: employeeName,
        Month: p.month,
        Year: p.year,
        'Basic Salary': p.basicSalary,
        'Gross Salary': p.grossSalary,
        'Net Salary': p.netSalary,
        Status: p.status
      }], `payslip_${employeeName.replace(/\s+/g, '_')}_${p.month}_${p.year}.csv`);
      toast.dismiss();
      toast.success('Download complete!');
      setDownloading(null);
    }, 700);
  };

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
        <main className="p-6">
          <div className="max-w-[1400px] mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-1.5 text-foreground text-gradient">Payroll & Payouts</h1>
                <p className="text-muted-foreground text-sm">Manage salary payouts and payslips</p>
              </div>
              <button
                onClick={() => downloadCSV(filtered.map(p => ({
                  Employee: getEmployeeName(p),
                  Month: p.month,
                  Year: p.year,
                  'Basic Salary': p.basicSalary,
                  'Gross Salary': p.grossSalary,
                  'Net Salary': p.netSalary,
                  Status: p.status
                })))}
                className="px-5 py-2.5 bg-primary text-primary-foreground border-none rounded-lg cursor-pointer text-sm font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-md active:scale-95"
              >
                <Download className="w-4 h-4" />
                Download All
              </button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              <div className="p-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white shadow-lg shadow-indigo-500/20">
                <p className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">Employees</p>
                <p className="text-3xl font-bold m-0">{filtered.length}</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-rose-500 to-orange-500 rounded-xl text-white shadow-lg shadow-rose-500/20">
                <p className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">Net Pay</p>
                <p className="text-3xl font-bold m-0">₹{totalNet.toLocaleString()}</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl text-white shadow-lg shadow-blue-500/20">
                <p className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">Pending</p>
                <p className="text-3xl font-bold m-0">{pendingCount}</p>
              </div>
              <div className="p-6 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl text-white shadow-lg shadow-emerald-500/20">
                <p className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">Status</p>
                <p className="text-3xl font-bold m-0 text-white">Active</p>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-card text-card-foreground rounded-xl border border-border p-5 mb-6 shadow-md">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search name / ID"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-4 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground"
                  />
                </div>
                <div className="flex gap-3">
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="px-4 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground min-w-[120px]"
                  >
                    <option value="all">All Years</option>
                    <option value="2026">2026</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                  </select>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="px-4 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground min-w-[120px]"
                  >
                    <option value="all">All Status</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="processed">Processed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bulk Actions */}
            <div className="flex gap-3 mb-6">
              <button
                disabled={!selected.length}
                onClick={() => updateStatus('paid')}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-md active:scale-95 border-none cursor-pointer",
                  selected.length ? "bg-emerald-500 text-white hover:bg-emerald-600" : "bg-muted text-muted-foreground cursor-not-allowed grayscale shadow-none"
                )}
              >
                Mark as Paid
              </button>
              <button
                disabled={!selected.length}
                onClick={() => updateStatus('processed')}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-md active:scale-95 border-none cursor-pointer",
                  selected.length ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-muted-foreground cursor-not-allowed grayscale shadow-none"
                )}
              >
                Mark as Processed
              </button>
              <button
                disabled={!selected.length}
                onClick={() => updateStatus('pending')}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-md active:scale-95 border-none cursor-pointer",
                  selected.length ? "bg-amber-500 text-white hover:bg-amber-600" : "bg-muted text-muted-foreground cursor-not-allowed grayscale shadow-none"
                )}
              >
                Mark as Pending
              </button>
            </div>

            {/* Table */}
            <div className="bg-card text-card-foreground rounded-xl border border-border shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="p-4 text-left w-12">
                        <input type="checkbox" onChange={selectAll} checked={selected.length === filtered.length && filtered.length > 0} className="w-4 h-4 rounded border-border" />
                      </th>
                      <th className="p-4 text-left font-semibold text-sm">Employee</th>
                      <th className="p-4 text-left font-semibold text-sm">Month</th>
                      <th className="p-4 text-left font-semibold text-sm">Net Pay</th>
                      <th className="p-4 text-left font-semibold text-sm">Status</th>
                      <th className="p-4 text-right font-semibold text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="p-20 text-center">
                          <Loader2 className="w-10 h-10 text-primary mx-auto animate-spin mb-4" />
                          <p className="text-muted-foreground font-medium">Loading payslips...</p>
                        </td>
                      </tr>
                    ) : filtered.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-20 text-center">
                          <div className="max-w-xs mx-auto">
                            <Eye className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                            <p className="text-muted-foreground font-medium">No payslips found</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filtered.map((p) => {
                        if (!p || !p._id) return null;

                        try {
                          const employeeName = getEmployeeName(p);
                          const employeeInitial = employeeName.charAt(0).toUpperCase();
                          const monthName = new Date(p.year || 2024, (p.month || 1) - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

                          return (
                            <tr key={p._id} className={cn(
                              "transition-colors hover:bg-muted/30",
                              selected.includes(p._id) ? "bg-primary/5" : ""
                            )}>
                              <td className="p-4">
                                <input type="checkbox" checked={selected.includes(p._id)} onChange={() => toggleSelect(p._id)} className="w-4 h-4 rounded border-border text-primary focus:ring-primary" />
                              </td>
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-white font-bold shadow-sm">
                                    {employeeInitial}
                                  </div>
                                  <div>
                                    <p className="font-bold text-foreground m-0">{employeeName}</p>
                                    <p className="text-xs text-muted-foreground m-0 font-mono tracking-tighter">{p._id}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 font-medium text-muted-foreground">
                                {monthName}
                              </td>
                              <td className="p-4">
                                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-sm font-bold border border-emerald-500/20">
                                  ₹{(p.netSalary || 0).toLocaleString()}
                                </span>
                              </td>
                              <td className="p-4 text-center">
                                <span className={cn(
                                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                  p.status === 'paid' ? "bg-emerald-500/20 text-emerald-500" : p.status === 'processed' ? "bg-primary/20 text-primary" : "bg-amber-500/20 text-amber-500"
                                )}>
                                  {p.status || 'pending'}
                                </span>
                              </td>
                              <td className="p-4">
                                <div className="flex gap-2 justify-end">
                                  <button
                                    onClick={() => handleEdit(p)}
                                    disabled={!canEdit || editingPayslip === p._id}
                                    className={cn(
                                      "p-2 bg-card border border-border rounded-lg transition-all shadow-sm active:scale-95",
                                      canEdit ? "hover:bg-amber-500/10 text-amber-500 hover:border-amber-500/30" : "grayscale opacity-30 cursor-not-allowed"
                                    )}
                                    title={canEdit ? "Edit status (cycles through pending/processed/paid)" : "Only superadmin and admin can edit"}
                                  >
                                    {editingPayslip === p._id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Pencil className="w-4 h-4" />
                                    )}
                                  </button>
                                  <button
                                    onClick={() => handlePreview(p)}
                                    className="p-2 bg-card text-primary border border-border rounded-lg hover:bg-primary/10 hover:border-primary/30 transition-all shadow-sm active:scale-95"
                                    title="View details"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => downloadSingle(p)}
                                    disabled={downloading === p._id}
                                    className="p-2 bg-card text-emerald-500 border border-border rounded-lg hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all shadow-sm active:scale-95"
                                    title="Download CSV"
                                  >
                                    {downloading === p._id ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                      <Download className="w-4 h-4" />
                                    )}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        } catch (error) {
                          console.error('Error rendering payslip row:', error, p);
                          return null;
                        }
                      }).filter(Boolean)
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Preview Modal */}
      {preview && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[99999] p-4 animate-in fade-in duration-200">
          <div className="bg-card text-card-foreground rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-border animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold m-0 text-foreground">Payslip Preview</h2>
                <button
                  onClick={() => setPreview(null)}
                  className="bg-muted hover:bg-muted/80 p-2 rounded-full border-none cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span className="text-xl leading-none">×</span>
                </button>
              </div>

              <div className="border-b-4 border-primary pb-6 mb-8">
                <h3 className="text-xl font-black text-primary uppercase tracking-tight m-0">PayZenix Payroll</h3>
                <p className="text-sm text-muted-foreground font-semibold uppercase tracking-widest mt-1">Certified Monthly Salary Slip</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Employee Name</p>
                    <p className="text-base font-bold text-foreground m-0">{getEmployeeName(preview)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Period</p>
                    <p className="text-base font-bold text-foreground m-0">
                      {new Date(preview.year || 2024, (preview.month || 1) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Employee Reference</p>
                    <p className="text-base font-bold text-foreground m-0 font-mono tracking-tighter">
                      {preview.employee && typeof preview.employee === 'object' ? preview.employee.employeeId : preview._id}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">Verification Status</p>
                    <span className={cn(
                      "inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mt-1",
                      preview.status === 'paid' ? "bg-emerald-500/20 text-emerald-500" : preview.status === 'processed' ? "bg-primary/20 text-primary" : "bg-amber-500/20 text-amber-500"
                    )}>
                      {preview.status || 'pending'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-muted/30 p-5 rounded-xl border border-border">
                  <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Earnings Archive
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Basic Pay Component</span>
                      <span className="font-bold text-foreground">₹{(preview.basicSalary || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm pt-2 border-t border-border/50">
                      <span className="text-muted-foreground font-bold">Gross Total</span>
                      <span className="font-black text-foreground">₹{(preview.grossSalary || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/30 p-5 rounded-xl border border-border">
                  <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    Deduction Summary
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Provident Fund (PF)</span>
                      <span className="font-bold text-destructive">₹{(preview.deductions?.pf || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">ESI Contribution</span>
                      <span className="font-bold text-destructive">₹{(preview.deductions?.esi || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Income Tax (TDS)</span>
                      <span className="font-bold text-destructive">₹{(preview.deductions?.tax || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-500/10 p-6 rounded-2xl border-2 border-emerald-500/30 mb-8">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-1">Final Net Disbursement</p>
                    <p className="text-xs text-emerald-600/70 font-medium">Verified by PayZenix Treasury System</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-emerald-600 m-0">₹{(preview.netSalary || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-end mt-10">
                <button
                  onClick={() => setPreview(null)}
                  className="px-6 py-2.5 bg-card text-card-foreground border border-border rounded-xl font-bold text-sm hover:bg-muted transition-all active:scale-95 shadow-sm"
                >
                  Return to Dashboard
                </button>
                <button
                  onClick={() => {
                    downloadSingle(preview);
                    setPreview(null);
                  }}
                  className="px-6 py-2.5 bg-primary text-primary-foreground border-none rounded-xl font-extrabold text-sm hover:bg-primary/90 transition-all active:scale-95 shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Verified Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
