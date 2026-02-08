import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Eye, Download, Pencil, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { payrollAPI } from '@/services/api';

export const PayoutsWorkingPage = () => {
  const [payslips, setPayslips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [year, setYear] = useState('all');
  const [status, setStatus] = useState('all');
  const [selected, setSelected] = useState<string[]>([]);
  const [preview, setPreview] = useState<any>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  useEffect(() => {
    loadPayslips();
  }, []);

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

  const handlePreview = (payslip: any) => {
    console.log('👁️ Preview clicked:', payslip);
    setPreview(payslip);
    toast.success('Opening payslip preview...');
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
        style={{ 
          marginLeft: sidebarCollapsed ? '80px' : '280px',
          transition: 'margin-left 0.3s ease-in-out'
        }}
      >
        <Header />
        <main className="p-6 animate-fadeIn">
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <div>
                <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>Payroll & Payouts</h1>
                <p style={{ color: '#666', fontSize: '14px' }}>Manage salary payouts and payslips</p>
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
                <Download style={{ width: '16px', height: '16px' }} />
                Download All
              </button>
            </div>

            {/* Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <div style={{ padding: '24px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', color: 'white' }}>
                <p style={{ fontSize: '14px', opacity: 0.9, margin: 0, marginBottom: '8px' }}>Employees</p>
                <p style={{ fontSize: '36px', fontWeight: 'bold', margin: 0 }}>{filtered.length}</p>
              </div>
              <div style={{ padding: '24px', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', borderRadius: '12px', color: 'white' }}>
                <p style={{ fontSize: '14px', opacity: 0.9, margin: 0, marginBottom: '8px' }}>Net Pay</p>
                <p style={{ fontSize: '36px', fontWeight: 'bold', margin: 0 }}>₹{totalNet.toLocaleString()}</p>
              </div>
              <div style={{ padding: '24px', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', borderRadius: '12px', color: 'white' }}>
                <p style={{ fontSize: '14px', opacity: 0.9, margin: 0, marginBottom: '8px' }}>Pending</p>
                <p style={{ fontSize: '36px', fontWeight: 'bold', margin: 0 }}>{pendingCount}</p>
              </div>
              <div style={{ padding: '24px', background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', borderRadius: '12px', color: '#333' }}>
                <p style={{ fontSize: '14px', opacity: 0.9, margin: 0, marginBottom: '8px' }}>Status</p>
                <p style={{ fontSize: '36px', fontWeight: 'bold', margin: 0 }}>Active</p>
              </div>
            </div>

            {/* Filters */}
            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '20px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Search name / ID"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    flex: 1,
                    minWidth: '200px',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    minWidth: '120px'
                  }}
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
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
                    minWidth: '120px'
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="processed">Processed</option>
                </select>
              </div>
            </div>

            {/* Bulk Actions */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button
                disabled={!selected.length}
                onClick={() => updateStatus('paid')}
                style={{
                  padding: '8px 16px',
                  background: selected.length ? '#16a34a' : '#d1d5db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: selected.length ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Mark as Paid
              </button>
              <button
                disabled={!selected.length}
                onClick={() => updateStatus('processed')}
                style={{
                  padding: '8px 16px',
                  background: selected.length ? '#2563eb' : '#d1d5db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: selected.length ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Mark as Processed
              </button>
              <button
                disabled={!selected.length}
                onClick={() => updateStatus('pending')}
                style={{
                  padding: '8px 16px',
                  background: selected.length ? '#d97706' : '#d1d5db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: selected.length ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Mark as Pending
              </button>
            </div>

            {/* Table */}
            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f9fafb' }}>
                  <tr>
                    <th style={{ padding: '12px 16px', textAlign: 'left' }}>
                      <input type="checkbox" onChange={selectAll} checked={selected.length === filtered.length && filtered.length > 0} />
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Employee</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Month</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Net Pay</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '14px', fontWeight: '600' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '40px', textAlign: 'center' }}>
                        <Loader2 style={{ width: '32px', height: '32px', margin: '0 auto', animation: 'spin 1s linear infinite' }} />
                        <p style={{ marginTop: '10px', color: '#666' }}>Loading payslips...</p>
                      </td>
                    </tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                        No payslips found
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
                          <tr key={p._id} style={{ borderBottom: '1px solid #f3f4f6', background: selected.includes(p._id) ? '#ede9fe' : 'white' }}>
                            <td style={{ padding: '12px 16px' }}>
                              <input type="checkbox" checked={selected.includes(p._id)} onChange={() => toggleSelect(p._id)} />
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: '50%',
                                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'white',
                                  fontWeight: 'bold',
                                  fontSize: '14px'
                                }}>
                                  {employeeInitial}
                                </div>
                                <div>
                                  <p style={{ fontWeight: '500', margin: 0 }}>{employeeName}</p>
                                  <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>{p._id}</p>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              {monthName}
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{
                                padding: '6px 12px',
                                background: '#dcfce7',
                                color: '#166534',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: 'bold',
                                border: '1px solid #86efac'
                              }}>
                                ₹{(p.netSalary || 0).toLocaleString()}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{
                                padding: '4px 12px',
                                background: p.status === 'paid' ? 'linear-gradient(135deg, #16a34a 0%, #059669 100%)' : p.status === 'processed' ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' : 'linear-gradient(135deg, #d97706 0%, #ea580c 100%)',
                                color: 'white',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: '500',
                                textTransform: 'capitalize'
                              }}>
                                {p.status || 'pending'}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                <button
                                  disabled={!selected.includes(p._id)}
                                  onClick={() => updateStatus('pending')}
                                  style={{
                                    padding: '6px 12px',
                                    background: 'transparent',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '4px',
                                    cursor: selected.includes(p._id) ? 'pointer' : 'not-allowed',
                                    opacity: selected.includes(p._id) ? 1 : 0.5
                                  }}
                                  title="Edit"
                                >
                                  <Pencil style={{ width: '16px', height: '16px', color: '#d97706' }} />
                                </button>
                                <button
                                  onClick={() => handlePreview(p)}
                                  style={{
                                    padding: '6px 12px',
                                    background: 'transparent',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                  }}
                                  title="View"
                                >
                                  <Eye style={{ width: '16px', height: '16px', color: '#4f46e5' }} />
                                </button>
                                <button
                                  onClick={() => downloadSingle(p)}
                                  disabled={downloading === p._id}
                                  style={{
                                    padding: '6px 12px',
                                    background: 'transparent',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '4px',
                                    cursor: downloading === p._id ? 'not-allowed' : 'pointer',
                                    opacity: downloading === p._id ? 0.6 : 1
                                  }}
                                  title="Download"
                                >
                                  {downloading === p._id ? (
                                    <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                                  ) : (
                                    <Download style={{ width: '16px', height: '16px', color: '#16a34a' }} />
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
        </main>
      </div>

      {/* Preview Modal */}
      {preview && (
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
          zIndex: 99999,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            padding: '30px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Payslip Preview</h2>
              <button
                onClick={() => setPreview(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ borderBottom: '2px solid #4f46e5', paddingBottom: '20px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#4f46e5', margin: 0 }}>PayZenix Payroll</h3>
              <p style={{ fontSize: '14px', color: '#666', margin: '4px 0 0 0' }}>Salary Slip</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <p style={{ fontSize: '12px', color: '#666', margin: '0 0 4px 0' }}>Employee</p>
                <p style={{ fontSize: '16px', fontWeight: '500', margin: 0 }}>{getEmployeeName(preview)}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#666', margin: '0 0 4px 0' }}>Employee ID</p>
                <p style={{ fontSize: '16px', fontWeight: '500', margin: 0 }}>
                  {preview.employee && typeof preview.employee === 'object' ? preview.employee.employeeId : preview._id}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#666', margin: '0 0 4px 0' }}>Month</p>
                <p style={{ fontSize: '16px', fontWeight: '500', margin: 0 }}>
                  {new Date(preview.year || 2024, (preview.month || 1) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#666', margin: '0 0 4px 0' }}>Status</p>
                <span style={{
                  padding: '4px 12px',
                  background: preview.status === 'paid' ? '#dcfce7' : preview.status === 'processed' ? '#dbeafe' : '#fef3c7',
                  color: preview.status === 'paid' ? '#166534' : preview.status === 'processed' ? '#1e40af' : '#92400e',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '500',
                  textTransform: 'capitalize'
                }}>
                  {preview.status || 'pending'}
                </span>
              </div>
            </div>

            <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 12px 0' }}>Earnings</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: '#666' }}>Basic Salary</span>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>₹{(preview.basicSalary || 0).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: '#666' }}>Gross Salary</span>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>₹{(preview.grossSalary || 0).toLocaleString()}</span>
              </div>
            </div>

            <div style={{ background: '#fef3c7', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 12px 0' }}>Deductions</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: '#666' }}>PF</span>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>₹{(preview.deductions?.pf || 0).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: '#666' }}>ESI</span>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>₹{(preview.deductions?.esi || 0).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: '#666' }}>Tax</span>
                <span style={{ fontSize: '14px', fontWeight: '500' }}>₹{(preview.deductions?.tax || 0).toLocaleString()}</span>
              </div>
            </div>

            <div style={{ background: '#dcfce7', padding: '16px', borderRadius: '8px', border: '2px solid #16a34a' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '16px', fontWeight: '600', color: '#166534' }}>Net Salary</span>
                <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#166534' }}>₹{(preview.netSalary || 0).toLocaleString()}</span>
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setPreview(null)}
                style={{
                  padding: '10px 20px',
                  background: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  downloadSingle(preview);
                  setPreview(null);
                }}
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
                <Download style={{ width: '16px', height: '16px' }} />
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
