import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Shield, Search, Filter, Download, User, FileText, DollarSign, Settings, Clock } from 'lucide-react';
import { downloadAuditLogsPDF } from '@/utils/downloadUtils';
import toast from 'react-hot-toast';

export const AuditLogsPage = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/audit-logs', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setAuditLogs(data);
    } catch (error) {
      console.error('Error loading audit logs:', error);
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const showPopup = (message: string) => {
    setModalMessage(message);
    setShowModal(true);
  };

  // Helper function to get icon and color based on action type
  const getLogIcon = (action: string) => {
    if (action.includes('Employee') || action.includes('User')) return { icon: User, color: '#10b981' };
    if (action.includes('Payroll') || action.includes('Loan')) return { icon: DollarSign, color: '#4f46e5' };
    if (action.includes('Settings')) return { icon: Settings, color: '#8b5cf6' };
    if (action.includes('Report')) return { icon: FileText, color: '#06b6d4' };
    return { icon: Clock, color: '#666' };
  };

  const filteredLogs = auditLogs.filter(log =>
    (log.action || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.user || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.details || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeBadge = (type: string) => {
    const badges: Record<string, { bg: string; color: string; text: string }> = {
      create: { bg: '#dcfce7', color: '#16a34a', text: 'Create' },
      update: { bg: '#fef3c7', color: '#d97706', text: 'Update' },
      delete: { bg: '#fee2e2', color: '#dc2626', text: 'Delete' },
      process: { bg: '#ede9fe', color: '#7c3aed', text: 'Process' },
      approval: { bg: '#dcfce7', color: '#16a34a', text: 'Approval' },
      settings: { bg: '#f3e8ff', color: '#8b5cf6', text: 'Settings' },
      report: { bg: '#cffafe', color: '#0891b2', text: 'Report' },
    };
    return badges[type] || { bg: '#f3f4f6', color: '#6b7280', text: type };
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
                <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>Audit Logs</h1>
                <p style={{ color: '#666', fontSize: '14px' }}>
                  Track all system activities and changes
                </p>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => showPopup('Opening advanced filters...')}
                  style={{
                    padding: '10px 20px',
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <Filter style={{ width: '16px', height: '16px' }} />
                  Filter
                </button>
                <button
                  onClick={() => {
                    downloadAuditLogsPDF(auditLogs);
                    toast.success('Audit logs PDF downloaded!');
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
                  Export Logs
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '20px', marginBottom: '20px' }}>
              <div style={{ position: 'relative' }}>
                <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#9ca3af' }} />
                <input
                  type="text"
                  placeholder="Search logs by action, user, or details..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 44px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <div style={{ padding: '20px', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <Shield style={{ width: '20px', height: '20px', color: '#4f46e5' }} />
                  <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>Total Logs</p>
                </div>
                <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>{auditLogs.length}</p>
              </div>

              <div style={{ padding: '20px', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <Clock style={{ width: '20px', height: '20px', color: '#10b981' }} />
                  <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>Today</p>
                </div>
                <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>5</p>
              </div>

              <div style={{ padding: '20px', background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <User style={{ width: '20px', height: '20px', color: '#f59e0b' }} />
                  <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>Active Users</p>
                </div>
                <p style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>3</p>
              </div>
            </div>

            {/* Audit Logs Timeline */}
            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>Activity Timeline</h2>
              
              <div style={{ position: 'relative' }}>
                {/* Timeline Line */}
                <div style={{
                  position: 'absolute',
                  left: '28px',
                  top: '0',
                  bottom: '0',
                  width: '2px',
                  background: '#e5e7eb'
                }} />

                {/* Log Entries */}
                {filteredLogs.map((log, index) => {
                  const badge = getTypeBadge(log.type);
                  return (
                    <div
                      key={log.id}
                      style={{
                        position: 'relative',
                        paddingLeft: '60px',
                        paddingBottom: index === filteredLogs.length - 1 ? '0' : '24px'
                      }}
                    >
                      {/* Icon */}
                      <div style={{
                        position: 'absolute',
                        left: '12px',
                        top: '0',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'white',
                        border: `2px solid ${log.color}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1
                      }}>
                        <log.icon style={{ width: '16px', height: '16px', color: log.color }} />
                      </div>

                      {/* Content */}
                      <div style={{
                        padding: '16px',
                        background: '#f9fafb',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                          <div>
                            <h3 style={{ fontSize: '15px', fontWeight: '600', margin: 0, marginBottom: '4px' }}>
                              {log.action}
                            </h3>
                            <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
                              by <span style={{ fontWeight: '500', color: '#374151' }}>{log.user}</span>
                            </p>
                          </div>
                          <span style={{
                            padding: '4px 12px',
                            background: badge.bg,
                            color: badge.color,
                            borderRadius: '12px',
                            fontSize: '11px',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            {badge.text}
                          </span>
                        </div>
                        <p style={{ fontSize: '14px', color: '#374151', margin: 0, marginBottom: '8px' }}>
                          {log.details}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Clock style={{ width: '12px', height: '12px', color: '#9ca3af' }} />
                          <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                            {log.timestamp}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredLogs.length === 0 && (
                  <div style={{ padding: '40px', textAlign: 'center' }}>
                    <Shield style={{ width: '48px', height: '48px', color: '#d1d5db', margin: '0 auto 12px' }} />
                    <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>
                      No audit logs found matching your search
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal */}
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
            minWidth: '450px',
            maxWidth: '550px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            animation: 'slideUp 0.3s ease-out',
            overflow: 'hidden'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
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
                🔒
              </div>
              <div>
                <h3 style={{ margin: 0, color: 'white', fontSize: '20px', fontWeight: '600' }}>
                  PayZenix Audit
                </h3>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.9)', fontSize: '13px', marginTop: '2px' }}>
                  Security & Audit System
                </p>
              </div>
            </div>
            <div style={{ padding: '28px 24px' }}>
              <p style={{ fontSize: '15px', lineHeight: '1.6', color: '#374151', margin: 0 }}>
                {modalMessage}
              </p>
            </div>
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
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)'
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
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};
