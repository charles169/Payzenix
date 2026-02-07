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
      setPayslips(data);
    } catch (error) {
      console.error('Error loading payslips:', error);
      toast.error('Failed to load payslips');
    } finally {
      setLoading(false);
    }
  };

  const filtered = payslips.filter(
    (p) =>
      ((p.employee || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.employeeId || '').toLowerCase().includes(search.toLowerCase())) &&
      (year === 'all' || p.year?.toString() === year) &&
      (status === 'all' || p.status === status)
  );

  const totalNet = filtered.reduce((s, p) => s + p.net, 0);
  const pendingCount = payslips.filter((p) => p.status === 'Pending').length;

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelected(selected.length === filtered.length ? [] : filtered.map((p) => p.empId));
  };

  const updateStatus = (value: 'Paid' | 'Rejected' | 'Pending') => {
    setPayslips((prev) =>
      prev.map((p) =>
        selected.includes(p.empId) ? { ...p, status: value } : p
      )
    );
    setSelected([]);
    toast.success(`Payslips marked as ${value}`);
  };

  const downloadCSV = (rows: any[], name = 'payslips.csv') => {
    if (!rows.length) {
      toast.error('No data to download');
      return;
    }
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
  };

  const downloadSingle = (p: any) => {
    setDownloading(p.empId);
    setTimeout(() => {
      downloadCSV([p], `${p.empId}.csv`);
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
        <main className="p-6">
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <div>
                <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>Payroll & Payouts</h1>
                <p style={{ color: '#666', fontSize: '14px' }}>Manage salary payouts and payslips</p>
              </div>
              <button
                onClick={() => downloadCSV(filtered)}
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
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Bulk Actions */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button
                disabled={!selected.length}
                onClick={() => updateStatus('Paid')}
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
                Approve
              </button>
              <button
                disabled={!selected.length}
                onClick={() => updateStatus('Pending')}
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
                Pending
              </button>
              <button
                disabled={!selected.length}
                onClick={() => updateStatus('Rejected')}
                style={{
                  padding: '8px 16px',
                  background: selected.length ? '#dc2626' : '#d1d5db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: selected.length ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Reject
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
                  {filtered.map((p) => (
                    <tr key={p.empId} style={{ borderBottom: '1px solid #f3f4f6', background: selected.includes(p.empId) ? '#ede9fe' : 'white' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <input type="checkbox" checked={selected.includes(p.empId)} onChange={() => toggleSelect(p.empId)} />
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
                            {p.name.charAt(0)}
                          </div>
                          <div>
                            <p style={{ fontWeight: '500', margin: 0 }}>{p.name}</p>
                            <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>{p.empId}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>{p.month} {p.year}</td>
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
                          ₹{p.net.toLocaleString()}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          padding: '4px 12px',
                          background: p.status === 'Paid' ? 'linear-gradient(135deg, #16a34a 0%, #059669 100%)' : p.status === 'Rejected' ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' : 'linear-gradient(135deg, #d97706 0%, #ea580c 100%)',
                          color: 'white',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          {p.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            disabled={!selected.includes(p.empId)}
                            onClick={() => updateStatus('Pending')}
                            style={{
                              padding: '6px 12px',
                              background: 'transparent',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              cursor: selected.includes(p.empId) ? 'pointer' : 'not-allowed',
                              opacity: selected.includes(p.empId) ? 1 : 0.5
                            }}
                            title="Edit"
                          >
                            <Pencil style={{ width: '16px', height: '16px', color: '#d97706' }} />
                          </button>
                          <button
                            onClick={() => setPreview(p)}
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
                            style={{
                              padding: '6px 12px',
                              background: 'transparent',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                            title="Download"
                          >
                            {downloading === p.empId ? (
                              <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                            ) : (
                              <Download style={{ width: '16px', height: '16px', color: '#16a34a' }} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};
