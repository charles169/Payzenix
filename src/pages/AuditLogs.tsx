import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Shield, Search, Filter, Download, User, FileText, DollarSign, Settings, Clock } from 'lucide-react';
import { downloadAuditLogsPDF } from '@/utils/downloadUtils';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

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

      if (!response.ok) {
        if (response.status === 403) {
          toast.error('Access Denied: You do not have permission to view audit logs');
          setAuditLogs([]);
          return;
        }
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();
      setAuditLogs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading audit logs:', error);
      toast.error('Failed to load audit logs. Please check your connection.');
      setAuditLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const showPopup = (message: string) => {
    setModalMessage(message);
    setShowModal(true);
  };

  const getLogIcon = (action: string = '') => {
    const actionStr = String(action);
    if (actionStr.includes('Employee') || actionStr.includes('User')) return { icon: User, color: '#10b981' };
    if (actionStr.includes('Payroll') || actionStr.includes('Loan')) return { icon: DollarSign, color: '#4f46e5' };
    if (actionStr.includes('Settings')) return { icon: Settings, color: '#8b5cf6' };
    if (actionStr.includes('Report')) return { icon: FileText, color: '#06b6d4' };
    return { icon: Clock, color: '#666' };
  };

  const filteredLogs = auditLogs.filter(log =>
    (log.action || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.user || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.details || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeBadge = (type: string) => {
    const badges: Record<string, { className: string; text: string }> = {
      create: { className: 'bg-emerald-500/10 text-emerald-500', text: 'Create' },
      update: { className: 'bg-amber-500/10 text-amber-500', text: 'Update' },
      delete: { className: 'bg-rose-500/10 text-rose-500', text: 'Delete' },
      process: { className: 'bg-indigo-500/10 text-indigo-500', text: 'Process' },
      approval: { className: 'bg-emerald-500/10 text-emerald-500', text: 'Approval' },
      settings: { className: 'bg-purple-500/10 text-purple-500', text: 'Settings' },
      report: { className: 'bg-cyan-500/10 text-cyan-500', text: 'Report' },
    };
    return badges[type] || { className: 'bg-slate-500/10 text-slate-500', text: type };
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
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-1.5 text-foreground text-gradient">Audit Logs</h1>
                <p className="text-muted-foreground text-sm">Track all system activities and changes</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => showPopup('Opening advanced filters...')}
                  className="px-5 py-2.5 bg-card text-card-foreground border border-border rounded-lg cursor-pointer text-sm font-medium flex items-center gap-2 hover:bg-muted transition-colors shadow-sm"
                >
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
                <button
                  onClick={async () => {
                    if (auditLogs.length === 0) {
                      toast.error('No logs to export');
                      return;
                    }
                    try {
                      toast.loading('Generating Audit Logs PDF...', { id: 'audit-pdf' });
                      await downloadAuditLogsPDF(auditLogs);
                      toast.success('Audit logs PDF downloaded!', { id: 'audit-pdf' });
                    } catch (error) {
                      toast.error('Failed to download PDF', { id: 'audit-pdf' });
                    }
                  }}
                  className="px-5 py-2.5 bg-primary text-primary-foreground border-none rounded-lg cursor-pointer text-sm font-medium flex items-center gap-2 hover:bg-primary/90 transition-all shadow-md active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  Export Logs
                </button>
              </div>
            </div>

            <div className="bg-card text-card-foreground rounded-xl border border-border p-5 mb-5 shadow-sm">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search logs by action, user, or details..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-muted/30 border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
              <div className="p-5 bg-card text-card-foreground rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <p className="text-sm text-muted-foreground font-medium m-0">Total Logs</p>
                </div>
                <p className="text-3xl font-bold m-0 text-foreground">{auditLogs.length}</p>
              </div>

              <div className="p-5 bg-card text-card-foreground rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-success" />
                  <p className="text-sm text-muted-foreground font-medium m-0">Today</p>
                </div>
                <p className="text-3xl font-bold m-0 text-foreground">
                  {auditLogs.filter(log => new Date(log.createdAt || log.timestamp).toDateString() === new Date().toDateString()).length}
                </p>
              </div>

              <div className="p-5 bg-card text-card-foreground rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <User className="w-5 h-5 text-warning" />
                  <p className="text-sm text-muted-foreground font-medium m-0">Active Users</p>
                </div>
                <p className="text-3xl font-bold m-0 text-foreground">
                  {[...new Set(auditLogs.map(log => log.user))].length}
                </p>
              </div>
            </div>

            <div className="bg-card text-card-foreground rounded-xl border border-border p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-6">Activity Timeline</h2>
              <div className="relative">
                <div className="absolute left-7 top-0 bottom-0 w-px bg-border mt-2" />

                {loading ? (
                  <div className="py-10 text-center">
                    <div className="animate-spin w-8 h-8 border-3 border-muted border-t-primary rounded-full mx-auto" />
                    <p className="text-muted-foreground mt-3 text-sm">Loading audit logs...</p>
                  </div>
                ) : (
                  filteredLogs.map((log, index) => {
                    const badge = getTypeBadge(log.type);
                    const logUI = getLogIcon(log.action);
                    const Icon = logUI.icon;
                    return (
                      <div key={log._id || log.id || index} className={cn(
                        "relative pl-16",
                        index === filteredLogs.length - 1 ? "pb-0" : "pb-8"
                      )}>
                        <div className="absolute left-3 top-0 w-9 h-9 rounded-full bg-card border-2 flex items-center justify-center z-10 shadow-sm transition-transform hover:scale-110" style={{ borderColor: logUI.color }}>
                          <Icon className="w-4 h-4" style={{ color: logUI.color }} />
                        </div>
                        <div className="p-4 bg-muted/20 hover:bg-muted/40 rounded-xl border border-border/50 transition-all hover:shadow-sm">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="text-sm font-semibold mb-1 text-foreground">{log.action}</h3>
                              <p className="text-xs text-muted-foreground">
                                by <span className="font-medium text-foreground">{log.user}</span>
                              </p>
                            </div>
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm",
                              badge.className
                            )}>
                              {badge.text}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{log.details}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 w-fit px-2 py-1 rounded-md">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(log.createdAt || log.timestamp).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {filteredLogs.length === 0 && !loading && (
                  <div className="py-12 text-center">
                    <Shield className="w-12 h-12 text-muted mx-auto mb-4 opacity-20" />
                    <p className="text-muted-foreground text-sm">No audit logs found matching your search</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card text-card-foreground rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
            <div className="bg-gradient-to-br from-rose-500 to-rose-700 p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl shadow-inner">🔒</div>
              <div>
                <h3 className="m-0 text-white text-xl font-bold">PayZenix Audit</h3>
                <p className="m-0 text-white/80 text-xs mt-0.5">Security & Audit System</p>
              </div>
            </div>
            <div className="p-8">
              <p className="text-base leading-relaxed text-foreground/90">{modalMessage}</p>
            </div>
            <div className="p-5 bg-muted/30 flex justify-end border-t border-border">
              <button
                onClick={() => setShowModal(false)}
                className="px-8 py-2.5 bg-gradient-to-br from-rose-500 to-rose-700 text-white border-none rounded-lg cursor-pointer text-sm font-bold shadow-lg shadow-rose-500/30 hover:shadow-rose-500/40 active:scale-95 transition-all"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
