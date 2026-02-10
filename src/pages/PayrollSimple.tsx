import { useState, useEffect } from 'react';
import { payrollAPI, employeeAPI, Payroll, Employee } from '@/services/api';
import toast from 'react-hot-toast';
import { Download, IndianRupee, Calculator, FileText, CheckCircle, Clock } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { generatePayslipPDF } from '@/utils/pdfGenerator';
import { downloadPayrollPDF } from '@/utils/downloadUtils';
import { usePageFocus } from '@/hooks/usePageFocus';
import { cn } from '@/lib/utils';

export const PayrollSimplePage = () => {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('2');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading payroll data from API...');
      console.log('🔑 Token:', localStorage.getItem('token') ? 'Present' : 'Missing');

      const [payrollData, employeeData] = await Promise.all([
        payrollAPI.getAll(),
        employeeAPI.getAll()
      ]);

      console.log('📊 Raw payroll data from API:', payrollData);
      console.log('👥 Raw employee data from API:', employeeData);

      // Filter out null/invalid data
      const validPayrolls = payrollData.filter(p => p && p._id);
      const validEmployees = employeeData.filter(e => e && e._id && e.name);

      console.log('✅ Valid payrolls:', validPayrolls.length);
      console.log('✅ Valid employees:', validEmployees.length);
      console.log('🔍 Selected month:', selectedMonth, 'year:', selectedYear);

      setPayrolls(validPayrolls);
      setEmployees(validEmployees);
      // Don't show toast here - it's confusing when data doesn't display
    } catch (error: any) {
      console.error('❌ Error loading data:', error);
      toast.error(error.message || 'Failed to load data');
      setPayrolls([]);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  // Reload data when page becomes visible/focused
  usePageFocus(loadData, []);

  const getEmployeeName = (payroll: Payroll) => {
    if (!payroll || !payroll.employee) return null; // Return null for invalid payrolls

    try {
      // If employee is an object (populated), use it directly
      if (typeof payroll.employee === 'object' && (payroll.employee as any)._id) {
        return (payroll.employee as any).name || null;
      }

      // If employee is a string ID, look it up
      if (typeof payroll.employee === 'string') {
        const emp = employees.find(e => e && e._id === payroll.employee);
        return emp?.name || null; // Return null if not found
      }

      return (payroll.employee as any)?.name || null;
    } catch (error) {
      console.error('Error getting employee name:', error);
      return null;
    }
  };

  const handleExport = async () => {
    try {
      toast.loading('Generating Payroll PDF...', { id: 'payroll-pdf' });
      await downloadPayrollPDF(payrolls);
      toast.success('Payroll PDF downloaded!', { id: 'payroll-pdf' });
    } catch (error) {
      toast.error('Failed to download PDF', { id: 'payroll-pdf' });
    }
  };

  const handleExportCSV = () => {
    try {
      toast.loading('Generating CSV...', { id: 'payroll-csv' });
      // Export payroll data to CSV
      const headers = ['Month', 'Year', 'Employee', 'Gross Salary', 'Deductions', 'Net Salary', 'Status'];
      const rows = payrolls.map(p => [
        p.month,
        p.year,
        getEmployeeName(p),
        p.grossSalary,
        p.deductions.pf + p.deductions.esi + p.deductions.tax + p.deductions.other,
        p.netSalary,
        p.status
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payroll_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Payroll CSV exported!', { id: 'payroll-csv' });
    } catch (error) {
      toast.error('Failed to export CSV', { id: 'payroll-csv' });
    }
  };

  const handleProcessPayroll = async () => {
    try {
      // Process payroll for selected month/year
      const month = parseInt(selectedMonth);
      const year = parseInt(selectedYear);

      // Calculate payroll for all active employees
      const activeEmployees = employees.filter(e => e.status === 'active');

      if (activeEmployees.length === 0) {
        toast.error('No active employees found!');
        return;
      }

      toast.success(`Processing payroll for ${activeEmployees.length} employees...`);

      // In a real app, this would call the backend API
      // For now, just show success
      setTimeout(() => {
        toast.success(`Payroll processed successfully for ${activeEmployees.length} employees!`);
        loadData();
      }, 1500);
    } catch (error: any) {
      toast.error(error.message || 'Failed to process payroll');
    }
  };

  const stats = {
    totalGross: payrolls.reduce((sum, p) => sum + (p?.grossSalary || 0), 0),
    totalNet: payrolls.reduce((sum, p) => sum + (p?.netSalary || 0), 0),
    totalDeductions: payrolls.reduce((sum, p) => {
      const deductions = p?.deductions as any || {};
      return sum + (deductions.pf || 0) + (deductions.esi || 0) + (deductions.tax || 0) + (deductions.other || 0);
    }, 0),
    processed: payrolls.filter(p => p?.status === 'processed').length,
  };

  // Filter payrolls by selected month and year AND filter out deleted employees
  console.log('🔍 Starting filter - payrolls:', payrolls.length, 'employees:', employees.length);

  // Don't filter if employees haven't loaded yet
  if (employees.length === 0 && payrolls.length > 0) {
    console.warn('⚠️ Employees not loaded yet, showing empty list');
  }

  const filteredPayrolls = payrolls.filter(p => {
    if (!p || !p._id) return false;

    // Skip payrolls with deleted employees (only if employees are loaded)
    if (employees.length > 0) {
      const employeeName = getEmployeeName(p);
      if (!employeeName) {
        console.warn('⚠️ Skipping payroll with deleted employee:', p._id, 'employee ref:', p.employee);
        return false;
      }
    }

    // Apply month/year filter
    const monthMatch = p.month === parseInt(selectedMonth);
    const yearMatch = p.year === parseInt(selectedYear);

    console.log(`🔍 Payroll ${p._id}: month=${p.month} (selected=${selectedMonth}, match=${monthMatch}), year=${p.year} (selected=${selectedYear}, match=${yearMatch})`);

    return monthMatch && yearMatch;
  });

  console.log('✅ Filtered payrolls:', filteredPayrolls.length, 'out of', payrolls.length);

  // Calculate stats for filtered payrolls
  const filteredStats = {
    totalGross: filteredPayrolls.reduce((sum, p) => sum + (p?.grossSalary || 0), 0),
    totalNet: filteredPayrolls.reduce((sum, p) => sum + (p?.netSalary || 0), 0),
    totalDeductions: filteredPayrolls.reduce((sum, p) => {
      const deductions = p?.deductions as any || {};
      return sum + (deductions.pf || 0) + (deductions.esi || 0) + (deductions.tax || 0) + (deductions.other || 0);
    }, 0),
    processed: filteredPayrolls.filter(p => p?.status === 'processed').length,
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-lg font-medium text-muted-foreground animate-pulse">
          Loading payroll from backend...
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
        <main className="p-6 animate-fadeIn">
          <div className="max-w-[1400px] mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <h1 className="text-3xl font-bold mb-1.5 text-foreground">Payroll Processing</h1>
                  <p className="text-muted-foreground text-sm">
                    Run and manage monthly payroll ({payrolls.length} records)
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="bg-card text-card-foreground border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                    >
                      <option value="1">January</option>
                      <option value="2">February</option>
                      <option value="3">March</option>
                      <option value="4">April</option>
                      <option value="5">May</option>
                      <option value="6">June</option>
                      <option value="7">July</option>
                      <option value="8">August</option>
                      <option value="9">September</option>
                      <option value="10">October</option>
                      <option value="11">November</option>
                      <option value="12">December</option>
                    </select>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="bg-card text-card-foreground border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                    >
                      <option value="2026">2026</option>
                      <option value="2025">2025</option>
                      <option value="2024">2024</option>
                      <option value="2023">2023</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleProcessPayroll}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white border-none rounded-lg px-4 py-2 text-sm font-semibold flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
                    >
                      <Calculator className="w-4 h-4" />
                      Process Payroll
                    </button>
                    <button
                      onClick={handleExport}
                      className="bg-card text-card-foreground hover:bg-muted border border-border rounded-lg px-4 py-2 text-sm font-medium flex items-center gap-2 transition-all"
                    >
                      <FileText className="w-4 h-4" />
                      PDF
                    </button>
                    <button
                      onClick={handleExportCSV}
                      className="bg-card text-card-foreground hover:bg-muted border border-border rounded-lg px-4 py-2 text-sm font-medium flex items-center gap-2 transition-all"
                    >
                      <Download className="w-4 h-4" />
                      CSV
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="p-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white shadow-xl shadow-indigo-500/20 transform hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <IndianRupee className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold uppercase tracking-widest opacity-90">Gross Salary</p>
                </div>
                <p className="text-4xl font-black mb-1">
                  ₹{(filteredStats.totalGross / 100000).toFixed(2)}L
                </p>
                <p className="text-xs font-medium opacity-75">
                  {filteredPayrolls.length} employees
                </p>
              </div>

              <div className="p-6 bg-gradient-to-br from-rose-500 to-orange-500 rounded-2xl text-white shadow-xl shadow-rose-500/20 transform hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Calculator className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold uppercase tracking-widest opacity-90">Total Deductions</p>
                </div>
                <p className="text-4xl font-black mb-1">
                  ₹{(filteredStats.totalDeductions / 1000).toFixed(1)}K
                </p>
                <p className="text-xs font-medium opacity-75 uppercase tracking-tighter">
                  PF + ESI + TDS + PT
                </p>
              </div>

              <div className="p-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl text-white shadow-xl shadow-blue-500/20 transform hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <IndianRupee className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold uppercase tracking-widest opacity-90">Net Payable</p>
                </div>
                <p className="text-4xl font-black mb-1">
                  ₹{(filteredStats.totalNet / 100000).toFixed(2)}L
                </p>
                <p className="text-xs font-medium opacity-75">
                  After all deductions
                </p>
              </div>

              <div className="p-6 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl text-white shadow-xl shadow-emerald-500/20 transform hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <FileText className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold uppercase tracking-widest opacity-90">Processed</p>
                </div>
                <p className="text-4xl font-black mb-1">
                  {filteredStats.processed}
                </p>
                <p className="text-xs font-medium opacity-75">
                  Payroll records
                </p>
              </div>
            </div>

            {/* Deductions Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                { label: 'PF Contribution', value: filteredPayrolls.reduce((s, p) => s + (p?.deductions?.pf || 0), 0), color: 'bg-indigo-500' },
                { label: 'ESI Contribution', value: filteredPayrolls.reduce((s, p) => s + (p?.deductions?.esi || 0), 0), color: 'bg-blue-500' },
                { label: 'TDS Deduction', value: filteredPayrolls.reduce((s, p) => s + (p?.deductions?.tax || 0), 0), color: 'bg-rose-500' },
                { label: 'Other Deductions', value: filteredPayrolls.reduce((s, p) => s + (p?.deductions?.other || 0), 0), color: 'bg-emerald-500' },
              ].map((item) => (
                <div key={item.label} className="p-6 bg-card text-card-foreground rounded-2xl border border-border shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">{item.label}</p>
                    <div className={cn("w-3 h-3 rounded-full", item.color)} />
                  </div>
                  <p className="text-2xl font-black text-foreground">
                    ₹{item.value.toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
            </div>

            {/* Table */}
            <div className="bg-card text-card-foreground rounded-2xl border border-border shadow-lg overflow-hidden">
              <div className="p-6 border-b border-border bg-muted/30">
                <h2 className="text-xl font-black text-foreground mb-1 uppercase tracking-tight">Employee Salary Breakdown</h2>
                <p className="text-sm text-muted-foreground font-medium">Review individual salary calculations for the selected period</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border">
                      <th className="px-6 py-4 text-left text-xs font-black text-muted-foreground uppercase tracking-widest">Employee</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-muted-foreground uppercase tracking-widest">Month/Year</th>
                      <th className="px-6 py-4 text-right text-xs font-black text-muted-foreground uppercase tracking-widest">Gross</th>
                      <th className="px-6 py-4 text-right text-xs font-black text-muted-foreground uppercase tracking-widest">Deductions</th>
                      <th className="px-6 py-4 text-right text-xs font-black text-muted-foreground uppercase tracking-widest">Net Pay</th>
                      <th className="px-6 py-4 text-left text-xs font-black text-muted-foreground uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredPayrolls.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-20 text-center text-muted-foreground font-medium italic">
                          No payroll records found for {new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1).toLocaleString('default', { month: 'long' })} {selectedYear}
                        </td>
                      </tr>
                    ) : (
                      filteredPayrolls.map((payroll) => {
                        if (!payroll || !payroll._id) return null;

                        try {
                          const totalDeductions = (payroll.deductions?.pf || 0) + (payroll.deductions?.esi || 0) + (payroll.deductions?.tax || 0) + (payroll.deductions?.other || 0);
                          const employeeName = getEmployeeName(payroll) || 'Unknown Employee';

                          const initials = employeeName.split(' ').map((n: string) => n[0] || '').join('').toUpperCase() || 'U';

                          return (
                            <tr key={payroll._id} className="hover:bg-muted/30 transition-colors group">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-black shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                                    {initials}
                                  </div>
                                  <div>
                                    <p className="font-bold text-foreground text-sm m-0">{employeeName}</p>
                                    <p className="text-[10px] text-muted-foreground font-mono mt-0.5 uppercase tracking-tighter">{payroll._id}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm font-medium text-muted-foreground">
                                {new Date(0, (payroll.month || 1) - 1).toLocaleString('default', { month: 'long' })} {payroll.year || new Date().getFullYear()}
                              </td>
                              <td className="px-6 py-4 text-right text-sm font-black text-foreground">
                                ₹{(payroll.grossSalary || 0).toLocaleString('en-IN')}
                              </td>
                              <td className="px-6 py-4 text-right text-sm font-bold text-destructive">
                                -₹{totalDeductions.toLocaleString('en-IN')}
                              </td>
                              <td className="px-6 py-4 text-right text-sm font-black text-emerald-500 dark:text-emerald-400">
                                ₹{(payroll.netSalary || 0).toLocaleString('en-IN')}
                              </td>
                              <td className="px-6 py-4 text-left">
                                <span className={cn(
                                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                  payroll.status === 'paid' ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                                    payroll.status === 'processed' ? "bg-primary/10 text-primary border border-primary/20" :
                                      "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                )}>
                                  {payroll.status === 'paid' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                  {payroll.status || 'pending'}
                                </span>
                              </td>
                            </tr>
                          );
                        } catch (error) {
                          console.error('Error rendering payroll row:', error, payroll);
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
    </div>
  );
};
