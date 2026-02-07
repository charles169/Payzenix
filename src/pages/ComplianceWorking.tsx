import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Building2, FileText, Download, Calendar, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { downloadComplianceChallans } from '@/utils/downloadUtils';

const complianceData = {
  pf: { name: 'Provident Fund (PF)', employer: 156780, employee: 156780, total: 313560, dueDate: '15th Feb 2024', status: 'pending', filedMonths: 11, totalMonths: 12 },
  esi: { name: 'ESI', employer: 23456, employee: 5400, total: 28856, dueDate: '15th Feb 2024', status: 'pending', filedMonths: 11, totalMonths: 12 },
  tds: { name: 'TDS', employer: 0, employee: 98765, total: 98765, dueDate: '7th Feb 2024', status: 'due_soon', filedMonths: 10, totalMonths: 12 },
  pt: { name: 'Professional Tax', employer: 0, employee: 9600, total: 9600, dueDate: '20th Feb 2024', status: 'filed', filedMonths: 12, totalMonths: 12 },
};

const filingHistory = [
  { month: 'January 2024', pf: 'filed', esi: 'filed', tds: 'filed', pt: 'filed' },
  { month: 'December 2023', pf: 'filed', esi: 'filed', tds: 'filed', pt: 'filed' },
  { month: 'November 2023', pf: 'filed', esi: 'filed', tds: 'filed', pt: 'filed' },
  { month: 'October 2023', pf: 'filed', esi: 'filed', tds: 'filed', pt: 'filed' },
];

export const ComplianceWorkingPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const showPopup = (message: string) => {
    setModalMessage(message);
    setShowModal(true);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      filed: { bg: '#dcfce7', color: '#166534', text: 'Filed' },
      pending: { bg: '#fef3c7', color: '#92400e', text: 'Pending' },
      due_soon: { bg: '#fee2e2', color: '#991b1b', text: 'Due Soon' },
    };
    const style = styles[status as keyof typeof styles] || { bg: '#f3f4f6', color: '#666', text: status };
    
    return (
      <span style={{
        padding: '4px 12px',
        background: style.bg,
        color: style.color,
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: '500',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        {status === 'filed' && <CheckCircle style={{ width: '12px', height: '12px' }} />}
        {status === 'pending' && <Clock style={{ width: '12px', height: '12px' }} />}
        {status === 'due_soon' && <AlertCircle style={{ width: '12px', height: '12px' }} />}
        {style.text}
      </span>
    );
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
                <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>Statutory Compliance</h1>
                <p style={{ color: '#666', fontSize: '14px' }}>Manage PF, ESI, TDS, and Professional Tax filings</p>
              </div>
              <button
                onClick={() => {
                  downloadComplianceChallans();
                  showPopup('✅ All challans downloaded successfully!\n\nFiles saved to your Downloads folder:\n• PF_Challan_Feb2024.pdf\n• ESI_Challan_Feb2024.pdf\n• TDS_Challan_Feb2024.pdf\n• PT_Challan_Feb2024.pdf');
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
                Download All Challans
              </button>
            </div>

            {/* Compliance Score */}
            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', borderLeft: '4px solid #16a34a', padding: '24px', marginBottom: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>Compliance Score</h2>
                  <p style={{ color: '#666', fontSize: '14px' }}>FY 2023-24 (April - March)</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#16a34a', margin: 0 }}>98%</p>
                    <p style={{ fontSize: '14px', color: '#666' }}>Overall Score</p>
                  </div>
                  <div style={{ width: '1px', height: '60px', background: '#e5e7eb' }} />
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>44/45</p>
                    <p style={{ fontSize: '14px', color: '#666' }}>Filings Complete</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Compliance Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              {Object.entries(complianceData).map(([key, data]) => (
                <div key={key} style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Building2 style={{ width: '20px', height: '20px', color: '#4f46e5' }} />
                      <div>
                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>{data.name}</h3>
                      </div>
                    </div>
                    {getStatusBadge(data.status)}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ padding: '12px', background: '#f9fafb', borderRadius: '8px', textAlign: 'center' }}>
                      <p style={{ fontSize: '10px', color: '#666', margin: 0, marginBottom: '4px' }}>Employer</p>
                      <p style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>₹{data.employer.toLocaleString('en-IN')}</p>
                    </div>
                    <div style={{ padding: '12px', background: '#f9fafb', borderRadius: '8px', textAlign: 'center' }}>
                      <p style={{ fontSize: '10px', color: '#666', margin: 0, marginBottom: '4px' }}>Employee</p>
                      <p style={{ fontSize: '16px', fontWeight: 'bold', margin: 0 }}>₹{data.employee.toLocaleString('en-IN')}</p>
                    </div>
                    <div style={{ padding: '12px', background: '#ede9fe', borderRadius: '8px', textAlign: 'center' }}>
                      <p style={{ fontSize: '10px', color: '#7c3aed', margin: 0, marginBottom: '4px' }}>Total</p>
                      <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#7c3aed', margin: 0 }}>₹{data.total.toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                      <span style={{ color: '#666' }}>Filings Completed</span>
                      <span style={{ fontWeight: '500' }}>{data.filedMonths}/{data.totalMonths} months</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${(data.filedMonths / data.totalMonths) * 100}%`, height: '100%', background: '#4f46e5', borderRadius: '4px' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                      <Calendar style={{ width: '16px', height: '16px', color: '#666' }} />
                      <span style={{ color: '#666' }}>Due:</span>
                      <span style={{ fontWeight: '500', color: data.status === 'due_soon' ? '#dc2626' : '#000' }}>{data.dueDate}</span>
                    </div>
                    <button
                      onClick={() => showPopup(`Generating ${data.name} challan...`)}
                      style={{
                        padding: '6px 12px',
                        background: 'transparent',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <FileText style={{ width: '14px', height: '14px' }} />
                      Generate Challan
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Filing History */}
            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
              <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>Filing History</h2>
                <p style={{ color: '#666', fontSize: '14px' }}>Track your compliance filings across all categories</p>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f9fafb' }}>
                  <tr>
                    <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Month</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>PF</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>ESI</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>TDS</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>PT</th>
                    <th style={{ padding: '12px 24px', textAlign: 'right', fontSize: '14px', fontWeight: '600' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filingHistory.map((row) => (
                    <tr key={row.month} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px 24px', fontWeight: '500' }}>{row.month}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>{getStatusBadge(row.pf)}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>{getStatusBadge(row.esi)}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>{getStatusBadge(row.tds)}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>{getStatusBadge(row.pt)}</td>
                      <td style={{ padding: '12px 24px', textAlign: 'right' }}>
                        <button
                          onClick={() => showPopup(`Downloading ${row.month} reports...`)}
                          style={{
                            padding: '6px 12px',
                            background: 'transparent',
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <Download style={{ width: '14px', height: '14px' }} />
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
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
                📊
              </div>
              <div>
                <h3 style={{ 
                  margin: 0, 
                  color: 'white', 
                  fontSize: '20px', 
                  fontWeight: '600',
                  letterSpacing: '-0.5px'
                }}>
                  Compliance
                </h3>
                <p style={{ 
                  margin: 0, 
                  color: 'rgba(255,255,255,0.9)', 
                  fontSize: '13px',
                  marginTop: '2px'
                }}>
                  Statutory Compliance Management
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
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
                  transition: 'all 0.2s',
                  letterSpacing: '0.3px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.5)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
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
