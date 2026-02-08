import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { DashboardCharts } from '@/components/DashboardCharts';
import { Users, IndianRupee, Calendar, FileCheck, Download, TrendingUp, Clock, AlertCircle, CheckCircle, Building2, Wallet } from 'lucide-react';

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
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      // Fetch actual payroll data for current month
      const payrollResponse = await fetch('http://localhost:3001/api/payroll', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
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
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const payrolls = await response.json();
      
      console.log('🔍 Raw payrolls from API:', payrolls);
      
      // Simple approach: just format the data directly
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                         'July', 'August', 'September', 'October', 'November', 'December'];
      
      const formattedPayrolls = payrolls.map((p: any) => ({
        monthText: `${monthNames[p.month - 1]} ${p.year}`,
        month: p.month,
        year: p.year,
        employee: p.employee,
        netSalary: p.netSalary || 0
      }));
      
      console.log('📝 Formatted payrolls:', formattedPayrolls);
      
      // Group by month/year
      const grouped: any = {};
      formattedPayrolls.forEach((p: any) => {
        const key = `${p.month}-${p.year}`;
        if (!grouped[key]) {
          grouped[key] = {
            monthText: p.monthText,
            month: p.month,
            year: p.year,
            employees: 0,
            totalAmount: 0
          };
        }
        grouped[key].employees += 1;
        grouped[key].totalAmount += p.netSalary;
      });
      
      console.log('📦 Grouped payrolls:', grouped);
      
      // Convert to array and sort
      const payrollArray = Object.values(grouped)
        .sort((a: any, b: any) => {
          if (a.year !== b.year) return b.year - a.year;
          return b.month - a.month;
        })
        .slice(0, 3)
        .map((p: any) => ({
          monthName: p.monthText,
          employees: p.employees,
          amount: `₹${p.totalAmount.toLocaleString('en-IN')}`,
          status: 'completed'
        }));
      
      console.log('📊 Final payroll array:', payrollArray);
      setRecentPayrolls(payrollArray);
    } catch (error) {
      console.error('Error fetching recent payrolls:', error);
      setRecentPayrolls([]);
    }
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
          style={{ 
            marginLeft: sidebarCollapsed ? '80px' : '280px',
            transition: 'margin-left 0.3s ease-in-out'
          }}
        >
          <Header />
          <main className="p-6 animate-fadeIn">
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
              <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>
                Welcome back, {user.name?.split(' ')[0] || 'User'}!
              </h1>
              <p style={{ color: '#666', fontSize: '14px', marginBottom: '30px' }}>
                Here's an overview of your salary and benefits
              </p>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div style={{ padding: '24px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', color: 'white' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <IndianRupee style={{ width: '24px', height: '24px' }} />
                    <p style={{ fontSize: '14px', opacity: 0.9, margin: 0 }}>Net Salary (This Month)</p>
                  </div>
                  <p style={{ fontSize: '36px', fontWeight: 'bold', margin: 0 }}>₹52,450</p>
                  <p style={{ fontSize: '12px', opacity: 0.8, marginTop: '8px' }}>Credited on 1st Feb</p>
                </div>

                <div style={{ padding: '24px', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', borderRadius: '12px', color: 'white' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <Building2 style={{ width: '24px', height: '24px' }} />
                    <p style={{ fontSize: '14px', opacity: 0.9, margin: 0 }}>PF Balance</p>
                  </div>
                  <p style={{ fontSize: '36px', fontWeight: 'bold', margin: 0 }}>₹1,24,560</p>
                  <p style={{ fontSize: '12px', opacity: 0.8, marginTop: '8px' }}>As of Jan 2024</p>
                </div>

                <div style={{ padding: '24px', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', borderRadius: '12px', color: 'white' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <Wallet style={{ width: '24px', height: '24px' }} />
                    <p style={{ fontSize: '14px', opacity: 0.9, margin: 0 }}>Active Loan</p>
                  </div>
                  <p style={{ fontSize: '36px', fontWeight: 'bold', margin: 0 }}>₹15,000</p>
                  <p style={{ fontSize: '12px', opacity: 0.8, marginTop: '8px' }}>EMI: ₹5,000/month</p>
                </div>
              </div>

              {/* Salary Breakdown */}
              <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '24px', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>Salary Breakdown</h2>
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>January 2024</p>

                <div style={{ display: 'grid', gap: '12px' }}>
                  {[
                    { label: 'Basic Salary', value: '₹35,000', type: 'earning' },
                    { label: 'HRA', value: '₹14,000', type: 'earning' },
                    { label: 'Special Allowance', value: '₹8,500', type: 'earning' },
                    { label: 'PF Deduction', value: '-₹4,200', type: 'deduction' },
                    { label: 'Professional Tax', value: '-₹200', type: 'deduction' },
                    { label: 'Loan EMI', value: '-₹5,000', type: 'deduction' },
                  ].map((item) => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                      <span style={{ color: '#666' }}>{item.label}</span>
                      <span style={{ fontWeight: '500', color: item.type === 'deduction' ? '#dc2626' : '#000' }}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px', marginTop: '16px', borderTop: '2px solid #e5e7eb' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '18px' }}>Net Pay</span>
                  <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#4f46e5' }}>₹52,450</span>
                </div>

                <button
                  onClick={() => showPopup('Downloading payslip...')}
                  style={{
                    width: '100%',
                    marginTop: '20px',
                    padding: '12px',
                    background: '#4f46e5',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Download style={{ width: '16px', height: '16px' }} />
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
          style={{ 
            marginLeft: sidebarCollapsed ? '80px' : '280px',
            transition: 'margin-left 0.3s ease-in-out'
          }}
        >
          <Header />
          <main className="p-6">
            <div style={{ padding: '50px', textAlign: 'center' }}>Loading dashboard...</div>
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
        style={{ 
          marginLeft: sidebarCollapsed ? '80px' : '280px',
          transition: 'margin-left 0.3s ease-in-out'
        }}
      >
        <Header />
        <main className="p-6">
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <div>
                <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>Dashboard</h1>
                <p style={{ color: '#666', fontSize: '14px' }}>
                  Welcome back, {user.name || 'User'}. Here's what's happening today.
                </p>
              </div>
              <button
                onClick={() => showPopup('Payroll will be processed for all active employees. This feature calculates salaries, deductions, and generates payslips automatically.')}
                style={{
                  padding: '10px 20px',
                  background: '#4f46e5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Calendar style={{ width: '16px', height: '16px' }} />
                Run Payroll
              </button>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <div style={{ padding: '24px', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ padding: '12px', background: '#ede9fe', borderRadius: '8px' }}>
                    <Users style={{ width: '20px', height: '20px', color: '#7c3aed' }} />
                  </div>
                  <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>Total Employees</p>
                </div>
                <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>{stats.totalEmployees}</p>
                <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>{stats.activeEmployees} active</p>
              </div>

              <div style={{ padding: '24px', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ padding: '12px', background: '#dbeafe', borderRadius: '8px' }}>
                    <IndianRupee style={{ width: '20px', height: '20px', color: '#2563eb' }} />
                  </div>
                  <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>Payroll This Month</p>
                </div>
                <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>₹{stats.payrollAmount}</p>
                <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>{stats.payrollEmployees} employees</p>
              </div>

              <div style={{ padding: '24px', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ padding: '12px', background: '#fef3c7', borderRadius: '8px' }}>
                    <Clock style={{ width: '20px', height: '20px', color: '#d97706' }} />
                  </div>
                  <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>Pending Approvals</p>
                </div>
                <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>{stats.pendingApprovals}</p>
                <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>Requires attention</p>
              </div>

              <div style={{ padding: '24px', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ padding: '12px', background: '#dcfce7', borderRadius: '8px' }}>
                    <FileCheck style={{ width: '20px', height: '20px', color: '#16a34a' }} />
                  </div>
                  <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>Compliance Score</p>
                </div>
                <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>{stats.complianceScore}%</p>
                <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>All filings up to date</p>
              </div>
            </div>

            {/* Dashboard Charts */}
            <DashboardCharts />

            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '30px' }}>
              {/* Recent Payroll */}
              <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>Recent Payroll Runs</h2>
                    <p style={{ color: '#666', fontSize: '14px' }}>Last 3 months payroll summary</p>
                  </div>
                  <button
                    onClick={() => showPopup('Viewing all payrolls...')}
                    style={{
                      padding: '6px 12px',
                      background: 'transparent',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    View All
                  </button>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Month</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Employees</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Amount</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPayrolls.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                          No payroll data available
                        </td>
                      </tr>
                    ) : (
                      recentPayrolls.map((payroll, index) => (
                        <tr key={`payroll-${index}`} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '12px', fontWeight: '500' }}>{String(payroll.monthName)}</td>
                          <td style={{ padding: '12px' }}>{String(payroll.employees)}</td>
                          <td style={{ padding: '12px' }}>{String(payroll.amount)}</td>
                          <td style={{ padding: '12px' }}>
                            <span style={{
                              padding: '4px 12px',
                              background: '#dcfce7',
                              color: '#166534',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '500',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <CheckCircle style={{ width: '12px', height: '12px' }} />
                              Completed
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pending Actions */}
              <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>Pending Actions</h2>
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>Tasks requiring your attention</p>

                <div style={{ display: 'grid', gap: '12px' }}>
                  {pendingActions.map((action) => (
                    <div
                      key={action.title}
                      style={{
                        padding: '12px',
                        background: '#f9fafb',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        gap: '12px',
                        alignItems: 'flex-start'
                      }}
                    >
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        marginTop: '6px',
                        background: action.priority === 'high' ? '#dc2626' : action.priority === 'medium' ? '#d97706' : '#16a34a'
                      }} />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '14px', fontWeight: '500', margin: 0, marginBottom: '4px' }}>{action.title}</p>
                        <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>Due in {action.dueIn}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => showPopup('Viewing all tasks...')}
                  style={{
                    width: '100%',
                    marginTop: '16px',
                    padding: '10px',
                    background: 'transparent',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  View All Tasks
                </button>
              </div>
            </div>

            {/* Employee Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              {[
                { label: 'Active', value: stats.activeEmployees, icon: Users, color: '#7c3aed', bg: '#ede9fe' },
                { label: 'On Leave', value: stats.totalEmployees - stats.activeEmployees, icon: Clock, color: '#d97706', bg: '#fef3c7' },
                { label: 'Total Employees', value: stats.totalEmployees, icon: TrendingUp, color: '#16a34a', bg: '#dcfce7' },
                { label: 'Pending Loans', value: stats.pendingApprovals, icon: AlertCircle, color: '#2563eb', bg: '#dbeafe' },
              ].map((stat) => (
                <div key={stat.label} style={{ padding: '20px', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ padding: '12px', background: stat.bg, borderRadius: '8px' }}>
                      <stat.icon style={{ width: '20px', height: '20px', color: stat.color }} />
                    </div>
                    <div>
                      <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>{stat.label}</p>
                      <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>{stat.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Modal Popup - Professional Design */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '0',
            minWidth: '450px',
            maxWidth: '550px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            animation: 'slideUp 0.3s ease-out',
            overflow: 'hidden'
          }}>
            {/* Header with gradient */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px'
              }}>
                ℹ️
              </div>
              <div>
                <h3 style={{ 
                  margin: 0, 
                  color: 'white', 
                  fontSize: '20px', 
                  fontWeight: '600',
                  letterSpacing: '-0.5px'
                }}>
                  PayZenix
                </h3>
                <p style={{ 
                  margin: 0, 
                  color: 'rgba(255,255,255,0.9)', 
                  fontSize: '13px',
                  marginTop: '2px'
                }}>
                  Payroll Management System
                </p>
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: '28px 24px' }}>
              <p style={{ 
                fontSize: '15px', 
                lineHeight: '1.6', 
                color: '#374151',
                margin: 0
              }}>
                {modalMessage}
              </p>
            </div>

            {/* Footer */}
            <div style={{ 
              padding: '16px 24px', 
              background: '#f9fafb',
              display: 'flex', 
              justifyContent: 'flex-end',
              borderTop: '1px solid #e5e7eb'
            }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: '10px 28px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                  transition: 'all 0.2s',
                  letterSpacing: '0.3px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                }}
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
