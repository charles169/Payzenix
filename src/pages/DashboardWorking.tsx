import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { DashboardCharts } from '@/components/DashboardCharts';
import { Users, IndianRupee, Calendar, FileCheck, Download, TrendingUp, Clock, AlertCircle, CheckCircle, Building2, Wallet } from 'lucide-react';
import { cn } from '@/lib/utils';

export const DashboardWorkingPage = () => {
  const { user } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    payrollAmount: '0',
    payrollEmployees: 0,
    pendingApprovals: 0,
    complianceScore: 98,
  });
  const [recentPayrolls, setRecentPayrolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== 'employee') {
      fetchDashboardStats();
      fetchRecentPayrolls();
    }
  }, [user]);

  // Refresh stats when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user && user.role !== 'employee') {
        fetchDashboardStats();
        fetchRecentPayrolls();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user]);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        cache: 'no-store'
      });
      const data = await response.json();

      // Fetch actual payroll data for current month
      const payrollResponse = await fetch('http://localhost:3001/api/payroll', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        cache: 'no-store'
      });
      const payrolls = await payrollResponse.json();

      // Calculate actual payroll amount for current month (February 2026)
      const currentMonth = 2;
      const currentYear = 2026;
      const currentMonthPayrolls = payrolls.filter((p: any) =>
        p.month === currentMonth && p.year === currentYear
      );
      const totalPayrollAmount = currentMonthPayrolls.reduce((sum: number, p: any) =>
        sum + (p.netSalary || 0), 0
      );
      const payrollAmountInLakhs = (totalPayrollAmount / 100000).toFixed(2);

      setStats({
        totalEmployees: data.totalEmployees || 0,
        activeEmployees: data.activeEmployees || 0,
        payrollAmount: payrollAmountInLakhs + 'L',
        payrollEmployees: currentMonthPayrolls.length,
        pendingApprovals: data.activeLoans || 0,
        complianceScore: 98,
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setLoading(false);
    }
  };

  const fetchRecentPayrolls = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/payroll', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        cache: 'no-store'
      });
      const payrolls = await response.json();

      // Month names for formatting
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

      // Format and group payrolls by month/year
      const grouped: any = {};
      payrolls.forEach((p: any) => {
        const key = `${p.month}-${p.year}`;
        if (!grouped[key]) {
          grouped[key] = {
            monthName: `${monthNames[p.month - 1]} ${p.year}`,
            month: p.month,
            year: p.year,
            employees: 0,
            totalAmount: 0
          };
        }
        grouped[key].employees += 1;
        grouped[key].totalAmount += (p.netSalary || 0);
      });

      // Convert to array, sort by date (newest first), and take top 3
      const payrollArray = Object.values(grouped)
        .sort((a: any, b: any) => {
          if (a.year !== b.year) return b.year - a.year;
          return b.month - a.month;
        })
        .slice(0, 3)
        .map((p: any) => ({
          monthName: p.monthName,
          employees: p.employees,
          amount: `₹${p.totalAmount.toLocaleString('en-IN')}`,
          status: 'completed'
        }));

      setRecentPayrolls(payrollArray);
    } catch (error) {
      console.error('Error fetching recent payrolls:', error);
      setRecentPayrolls([]);
    }
  };

  const downloadPayslip = () => {
    // Create a simple HTML payslip
    const payslipHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Payslip - January 2024</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .company-name { font-size: 24px; font-weight: bold; color: #2563eb; }
          .payslip-title { font-size: 18px; margin-top: 10px; }
          .info-section { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .info-block { flex: 1; }
          .info-label { font-weight: bold; color: #666; font-size: 12px; }
          .info-value { font-size: 14px; margin-top: 5px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f3f4f6; font-weight: bold; }
          .earnings { color: #059669; }
          .deductions { color: #dc2626; }
          .net-pay { background-color: #2563eb; color: white; font-size: 18px; font-weight: bold; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">PayZenix</div>
          <div class="payslip-title">Payroll & HR Suite</div>
          <div style="margin-top: 10px; font-size: 16px; font-weight: bold;">Payslip for January 2024</div>
        </div>
        
        <div class="info-section">
          <div class="info-block">
            <div class="info-label">Employee Name</div>
            <div class="info-value">${user?.name || 'N/A'}</div>
          </div>
          <div class="info-block">
            <div class="info-label">Employee ID</div>
            <div class="info-value">${user?.employeeId || 'N/A'}</div>
          </div>
          <div class="info-block">
            <div class="info-label">Designation</div>
            <div class="info-value">Employee</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Earnings</th>
              <th style="text-align: right;">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Basic Salary</td>
              <td class="earnings" style="text-align: right;">35,000</td>
            </tr>
            <tr>
              <td>HRA</td>
              <td class="earnings" style="text-align: right;">14,000</td>
            </tr>
            <tr>
              <td>Special Allowance</td>
              <td class="earnings" style="text-align: right;">8,500</td>
            </tr>
          </tbody>
        </table>

        <table>
          <thead>
            <tr>
              <th>Deductions</th>
              <th style="text-align: right;">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>PF Deduction</td>
              <td class="deductions" style="text-align: right;">-4,200</td>
            </tr>
            <tr>
              <td>Professional Tax</td>
              <td class="deductions" style="text-align: right;">-200</td>
            </tr>
            <tr>
              <td>Loan EMI</td>
              <td class="deductions" style="text-align: right;">-5,000</td>
            </tr>
          </tbody>
        </table>

        <table>
          <tbody>
            <tr class="net-pay">
              <td>Net Pay</td>
              <td style="text-align: right;">₹52,450</td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          <p>This is a computer-generated payslip and does not require a signature.</p>
          <p>Generated on: ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </body>
      </html>
    `;

    // Create a Blob and download
    const blob = new Blob([payslipHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Payslip_${user?.name?.replace(/\s+/g, '_')}_January_2024.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showPopup('Payslip downloaded successfully!');
  };

  const showPopup = (message: string) => {
    setModalMessage(message);
    setShowModal(true);
  };

  if (!user) return null;

  const isEmployee = user.role === 'employee';

  // Employee Dashboard
  if (isEmployee) {
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
              <h1 className="text-3xl font-bold mb-1.5 text-foreground">
                Welcome back, {user.name?.split(' ')[0] || 'User'}!
              </h1>
              <p className="text-muted-foreground text-sm mb-8">
                Here's an overview of your salary and benefits
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                <div className="p-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white shadow-lg shadow-indigo-500/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <IndianRupee className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-wider opacity-90 m-0">Net Salary (Feb)</p>
                  </div>
                  <p className="text-3xl font-bold m-0 text-white">₹52,450</p>
                  <p className="text-[10px] opacity-75 mt-2 font-medium">Credited on 1st Feb</p>
                </div>

                <div className="p-6 bg-gradient-to-br from-rose-500 to-orange-500 rounded-xl text-white shadow-lg shadow-rose-500/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-wider opacity-90 m-0">PF Balance</p>
                  </div>
                  <p className="text-3xl font-bold m-0 text-white">₹1,24,560</p>
                  <p className="text-[10px] opacity-75 mt-2 font-medium">As of Jan 2024</p>
                </div>

                <div className="p-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl text-white shadow-lg shadow-blue-500/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Wallet className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-wider opacity-90 m-0">Active Loan</p>
                  </div>
                  <p className="text-3xl font-bold m-0 text-white">₹15,000</p>
                  <p className="text-[10px] opacity-75 mt-2 font-medium">EMI: ₹5,000/month</p>
                </div>
              </div>

              {/* Salary Breakdown */}
              <div className="bg-card text-card-foreground rounded-xl border border-border p-6 mb-5 shadow-sm">
                <h2 className="text-xl font-bold mb-2">Salary Breakdown</h2>
                <p className="text-muted-foreground text-sm mb-5">January 2024</p>

                <div className="grid gap-3">
                  {[
                    { label: 'Basic Salary', value: '₹35,000', type: 'earning' },
                    { label: 'HRA', value: '₹14,000', type: 'earning' },
                    { label: 'Special Allowance', value: '₹8,500', type: 'earning' },
                    { label: 'PF Deduction', value: '-₹4,200', type: 'deduction' },
                    { label: 'Professional Tax', value: '-₹200', type: 'deduction' },
                    { label: 'Loan EMI', value: '-₹5,000', type: 'deduction' },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between py-3 border-b border-muted last:border-0">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className={cn(
                        "font-bold",
                        item.type === 'deduction' ? 'text-destructive' : 'text-emerald-500'
                      )}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between pt-4 mt-4 border-t-2 border-border">
                  <span className="font-bold text-lg">Net Pay</span>
                  <span className="text-2xl font-bold text-primary">₹52,450</span>
                </div>

                <button
                  onClick={downloadPayslip}
                  className="w-full mt-5 p-3 bg-primary text-primary-foreground border-none rounded-lg cursor-pointer text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Payslip
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Admin/HR Dashboard
  const pendingActions = [
    { title: 'Process March payroll', dueIn: '3 days', priority: 'high' },
    { title: 'Submit PF challan', dueIn: '5 days', priority: 'medium' },
    { title: 'Review new employee documents', dueIn: '1 week', priority: 'low' },
  ];

  if (loading) {
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
            <div className="p-12 text-center text-muted-foreground animate-pulse">Loading dashboard...</div>
          </main>
        </div>
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
        <main className="p-6">
          <div className="max-w-[1400px] mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-1.5 text-foreground text-gradient">Dashboard</h1>
                <p className="text-muted-foreground text-sm">
                  Welcome back, {user.name || 'User'}. Here's what's happening today.
                </p>
              </div>
              <button
                onClick={() => showPopup('Payroll will be processed for all active employees. This feature calculates salaries, deductions, and generates payslips automatically.')}
                className="px-5 py-2.5 bg-primary text-primary-foreground border-none rounded-lg cursor-pointer text-sm font-medium flex items-center gap-2 hover:bg-primary/90 transition-all shadow-md active:scale-95"
              >
                <Calendar className="w-4 h-4" />
                Run Payroll
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              <div className="p-6 bg-card text-card-foreground rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground font-medium m-0">Total Employees</p>
                </div>
                <p className="text-3xl font-bold m-0 text-foreground">{stats.totalEmployees}</p>
                <p className="text-xs text-muted-foreground mt-2">{stats.activeEmployees} active</p>
              </div>

              <div className="p-6 bg-card text-card-foreground rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-info/10 rounded-lg">
                    <IndianRupee className="w-5 h-5 text-info" />
                  </div>
                  <p className="text-sm text-muted-foreground font-medium m-0">Payroll This Month</p>
                </div>
                <p className="text-3xl font-bold m-0 text-foreground">₹{stats.payrollAmount}</p>
                <p className="text-xs text-muted-foreground mt-2">{stats.payrollEmployees} employees</p>
              </div>

              <div className="p-6 bg-card text-card-foreground rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-warning/10 rounded-lg">
                    <Clock className="w-5 h-5 text-warning" />
                  </div>
                  <p className="text-sm text-muted-foreground font-medium m-0">Pending Approvals</p>
                </div>
                <p className="text-3xl font-bold m-0 text-foreground">{stats.pendingApprovals}</p>
                <p className="text-xs text-muted-foreground mt-2">Requires attention</p>
              </div>

              <div className="p-6 bg-card text-card-foreground rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-success/10 rounded-lg">
                    <FileCheck className="w-5 h-5 text-success" />
                  </div>
                  <p className="text-sm text-muted-foreground font-medium m-0">Compliance Score</p>
                </div>
                <p className="text-3xl font-bold m-0 text-foreground">{stats.complianceScore}%</p>
                <p className="text-xs text-muted-foreground mt-2">All filings up to date</p>
              </div>
            </div>

            {/* Dashboard Charts */}
            <DashboardCharts />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Recent Payroll */}
              <div className="lg:col-span-2 bg-card text-card-foreground rounded-xl border border-border p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-bold mb-1">Recent Payroll Runs</h2>
                    <p className="text-muted-foreground text-sm">Last 3 months payroll summary</p>
                  </div>
                  <button
                    onClick={() => showPopup('Viewing all payrolls...')}
                    className="px-3 py-1.5 bg-transparent border border-border rounded-md cursor-pointer text-sm hover:bg-muted transition-colors"
                  >
                    View All
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="p-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Month</th>
                        <th className="p-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Employees</th>
                        <th className="p-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                        <th className="p-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentPayrolls.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="p-10 text-center text-muted-foreground">
                            No payroll data available
                          </td>
                        </tr>
                      ) : (
                        recentPayrolls.map((payroll, index) => (
                          <tr key={`payroll-${index}`} className="border-b border-border hover:bg-muted/30 transition-colors">
                            <td className="p-4 text-sm font-medium text-foreground">
                              {payroll.monthName || 'N/A'}
                            </td>
                            <td className="p-4 text-sm text-foreground">
                              {payroll.employees || 0}
                            </td>
                            <td className="p-4 text-sm font-medium text-foreground">
                              {payroll.amount || '₹0'}
                            </td>
                            <td className="p-4">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 text-success text-xs font-semibold border border-success/20">
                                <CheckCircle size={14} />
                                Completed
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pending Actions */}
              <div className="bg-card text-card-foreground rounded-xl border border-border p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-1">Pending Actions</h2>
                <p className="text-muted-foreground text-sm mb-5">Tasks requiring your attention</p>

                <div className="grid gap-3">
                  {pendingActions.map((action) => (
                    <div
                      key={action.title}
                      className="p-3 bg-muted/30 rounded-lg cursor-pointer flex gap-3 items-start hover:bg-muted/50 transition-colors"
                    >
                      <div className={cn(
                        "w-2 h-2 rounded-full mt-1.5",
                        action.priority === 'high' ? 'bg-destructive' : action.priority === 'medium' ? 'bg-warning' : 'bg-success'
                      )} />
                      <div className="flex-1">
                        <p className="text-sm font-medium mb-1">{action.title}</p>
                        <p className="text-xs text-muted-foreground">Due in {action.dueIn}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => showPopup('Viewing all tasks...')}
                  className="w-full mt-4 p-2.5 bg-transparent border border-border rounded-md cursor-pointer text-sm hover:bg-muted transition-colors font-medium"
                >
                  View All Tasks
                </button>
              </div>
            </div>

            {/* Employee Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { label: 'Active', value: stats.activeEmployees, icon: Users, variant: 'primary' },
                { label: 'On Leave', value: stats.totalEmployees - stats.activeEmployees, icon: Clock, variant: 'warning' },
                { label: 'Total Employees', value: stats.totalEmployees, icon: TrendingUp, variant: 'success' },
                { label: 'Pending Loans', value: stats.pendingApprovals, icon: AlertCircle, variant: 'info' },
              ].map((stat) => (
                <div key={stat.label} className="p-5 bg-card text-card-foreground rounded-xl border border-border flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className={cn(
                    "p-3 rounded-lg flex-shrink-0",
                    stat.variant === 'primary' ? 'bg-primary/10 text-primary' :
                      stat.variant === 'warning' ? 'bg-warning/10 text-warning' :
                        stat.variant === 'success' ? 'bg-success/10 text-success' :
                          'bg-info/10 text-info'
                  )}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Modal Popup - Professional Design */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[99999] animate-in fade-in duration-200">
          <div className="bg-card text-card-foreground rounded-2xl min-w-[450px] max-w-[550px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300 border border-border">
            {/* Header with gradient */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl shadow-inner">
                ℹ️
              </div>
              <div>
                <h3 className="m-0 text-white text-xl font-bold tracking-tight">PayZenix</h3>
                <p className="m-0 text-white/80 text-sm mt-0.5">Payroll Management System</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <p className="text-base leading-relaxed text-foreground/80 m-0">
                {modalMessage}
              </p>
            </div>

            {/* Footer */}
            <div className="p-4 px-6 bg-muted/30 flex justify-end border-t border-border">
              <button
                onClick={() => setShowModal(false)}
                className="px-8 py-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none rounded-lg cursor-pointer text-sm font-bold shadow-lg shadow-indigo-500/20 hover:-translate-y-0.5 hover:shadow-indigo-500/30 active:translate-y-0 transition-all tracking-wide"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};
