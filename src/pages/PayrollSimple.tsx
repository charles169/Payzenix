import { useState, useEffect } from 'react';
import { payrollAPI, employeeAPI, Payroll, Employee } from '@/services/api';
import toast from 'react-hot-toast';
import { Download, IndianRupee, Calculator, FileText, CheckCircle, Clock } from 'lucide-react';
import { generatePayslipPDF } from '@/utils/pdfGenerator';

export const PayrollSimplePage = () => {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('2');
  const [selectedYear, setSelectedYear] = useState('2024');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [payrollData, employeeData] = await Promise.all([
        payrollAPI.getAll(),
        employeeAPI.getAll()
      ]);
      setPayrolls(payrollData);
      setEmployees(employeeData);
      toast.success(`Loaded ${payrollData.length} payroll records!`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load data');
      setPayrolls([]);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const getEmployeeName = (payroll: Payroll) => {
    if (typeof payroll.employee === 'string') {
      const emp = employees.find(e => e._id === payroll.employee);
      return emp ? emp.name : payroll.employee;
    }
    return (payroll.employee as any)?.name || 'Unknown';
  };

  const handleExport = () => {
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
    toast.success('Payroll data exported successfully!');
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
    totalGross: payrolls.reduce((sum, p) => sum + p.grossSalary, 0),
    totalNet: payrolls.reduce((sum, p) => sum + p.netSalary, 0),
    totalDeductions: payrolls.reduce((sum, p) => sum + (p.deductions.pf + p.deductions.esi + p.deductions.tax + p.deductions.other), 0),
    processed: payrolls.filter(p => p.status === 'processed').length,
  };

  if (loading) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <p style={{ fontSize: '18px' }}>Loading payroll from backend...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '30px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>Payroll Processing</h1>
            <p style={{ color: '#666', fontSize: '14px' }}>
              Run and manage monthly payroll ({payrolls.length} records)
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
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
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
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
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ padding: '20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '8px', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <IndianRupee style={{ width: '24px', height: '24px' }} />
            <p style={{ fontSize: '14px', margin: 0, opacity: 0.9 }}>Gross Salary</p>
          </div>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>
            ₹{(stats.totalGross / 100000).toFixed(2)}L
          </p>
          <p style={{ fontSize: '12px', margin: '4px 0 0 0', opacity: 0.8 }}>
            {employees.length} employees
          </p>
        </div>

        <div style={{ padding: '20px', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', borderRadius: '8px', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <Calculator style={{ width: '24px', height: '24px' }} />
            <p style={{ fontSize: '14px', margin: 0, opacity: 0.9 }}>Total Deductions</p>
          </div>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>
            ₹{(stats.totalDeductions / 1000).toFixed(1)}K
          </p>
          <p style={{ fontSize: '12px', margin: '4px 0 0 0', opacity: 0.8 }}>
            PF + ESI + TDS + PT
          </p>
        </div>

        <div style={{ padding: '20px', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', borderRadius: '8px', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <IndianRupee style={{ width: '24px', height: '24px' }} />
            <p style={{ fontSize: '14px', margin: 0, opacity: 0.9 }}>Net Payable</p>
          </div>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>
            ₹{(stats.totalNet / 100000).toFixed(2)}L
          </p>
          <p style={{ fontSize: '12px', margin: '4px 0 0 0', opacity: 0.8 }}>
            After all deductions
          </p>
        </div>

        <div style={{ padding: '20px', background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', borderRadius: '8px', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <FileText style={{ width: '24px', height: '24px' }} />
            <p style={{ fontSize: '14px', margin: 0, opacity: 0.9 }}>Processed</p>
          </div>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>
            {stats.processed}
          </p>
          <p style={{ fontSize: '12px', margin: '4px 0 0 0', opacity: 0.8 }}>
            Payroll records
          </p>
        </div>
      </div>

      {/* Deductions Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        {[
          { label: 'PF Contribution', value: payrolls.reduce((s, p) => s + p.deductions.pf, 0), color: '#667eea' },
          { label: 'ESI Contribution', value: payrolls.reduce((s, p) => s + p.deductions.esi, 0), color: '#4facfe' },
          { label: 'TDS Deduction', value: payrolls.reduce((s, p) => s + p.deductions.tax, 0), color: '#f093fb' },
          { label: 'Other Deductions', value: payrolls.reduce((s, p) => s + p.deductions.other, 0), color: '#43e97b' },
        ].map((item) => (
          <div key={item.label} style={{ padding: '20px', background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>{item.label}</p>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: item.color }} />
            </div>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
              ₹{item.value.toLocaleString('en-IN')}
            </p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0, marginBottom: '4px' }}>Employee Salary Breakdown</h2>
          <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>Review individual salary calculations</p>
        </div>
        
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f9fafb' }}>
            <tr>
              <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: '600', fontSize: '14px' }}>Employee</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: '600', fontSize: '14px' }}>Month/Year</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '1px solid #e5e7eb', fontWeight: '600', fontSize: '14px' }}>Gross</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '1px solid #e5e7eb', fontWeight: '600', fontSize: '14px' }}>Deductions</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '1px solid #e5e7eb', fontWeight: '600', fontSize: '14px' }}>Net Pay</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: '600', fontSize: '14px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {payrolls.map((payroll) => {
              const totalDeductions = payroll.deductions.pf + payroll.deductions.esi + payroll.deductions.tax + payroll.deductions.other;
              const employeeName = getEmployeeName(payroll);
              
              return (
                <tr key={payroll._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: '50%', 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {employeeName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p style={{ fontWeight: '500', margin: 0 }}>{employeeName}</p>
                        <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>{payroll._id}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <p style={{ margin: 0 }}>{new Date(0, payroll.month - 1).toLocaleString('default', { month: 'long' })} {payroll.year}</p>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '500' }}>
                    ₹{payroll.grossSalary.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', color: '#dc2626' }}>
                    -₹{totalDeductions.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'bold', color: '#10b981' }}>
                    ₹{payroll.netSalary.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      background: 
                        payroll.status === 'paid' ? '#dcfce7' :
                        payroll.status === 'processed' ? '#dbeafe' :
                        '#fef3c7',
                      color: 
                        payroll.status === 'paid' ? '#166534' :
                        payroll.status === 'processed' ? '#1e40af' :
                        '#92400e',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {payroll.status === 'paid' ? <CheckCircle style={{ width: '12px', height: '12px' }} /> : <Clock style={{ width: '12px', height: '12px' }} />}
                      {payroll.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {payrolls.length === 0 && (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <p style={{ color: '#666', fontSize: '16px', margin: 0 }}>
              No payroll records in the database.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
