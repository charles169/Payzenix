import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Building2, FileText, Download, Calendar, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { downloadComplianceChallans, downloadPFChallan, downloadESIChallan, downloadTDSChallan, downloadPTChallan } from '@/utils/downloadUtils';
import { payrollAPI } from '@/services/api';
import toast from 'react-hot-toast';
import { usePageFocus } from '@/hooks/usePageFocus';
import { cn } from '@/lib/utils';

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
  const [payrolls, setPayrolls] = useState<any[]>([]);

  const loadPayrolls = async () => {
    try {
      const data = await payrollAPI.getAll();
      setPayrolls(data);
    } catch (error) {
      console.error('Error loading payrolls:', error);
    }
  };

  // Reload data when page becomes visible/focused
  usePageFocus(loadPayrolls, []);

  const showPopup = (message: string) => {
    setModalMessage(message);
    setShowModal(true);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      filed: { className: 'bg-emerald-500/10 text-emerald-500', icon: CheckCircle, text: 'Filed' },
      pending: { className: 'bg-amber-500/10 text-amber-500', icon: Clock, text: 'Pending' },
      due_soon: { className: 'bg-destructive/10 text-destructive', icon: AlertCircle, text: 'Due Soon' },
    };
    const style = styles[status as keyof typeof styles] || { className: 'bg-muted text-muted-foreground', icon: Clock, text: status };
    const Icon = style.icon;

    return (
      <span className={cn(
        "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5",
        style.className
      )}>
        <Icon className="w-3.5 h-3.5" />
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
                <h1 className="text-3xl font-bold mb-1.5 text-foreground text-gradient">Statutory Compliance</h1>
                <p className="text-muted-foreground text-sm">Manage PF, ESI, TDS, and Professional Tax filings</p>
              </div>
              <button
                onClick={async () => {
                  try {
                    const loadingToast = toast.loading('Generating compliance challans...');

                    await downloadComplianceChallans(payrolls);

                    setTimeout(() => {
                      toast.dismiss(loadingToast);
                      toast.success('All 4 challans downloaded successfully!');
                    }, 2000);
                  } catch (error) {
                    console.error('Error downloading challans:', error);
                    toast.error('Failed to download challans');
                  }
                }}
                className="px-5 py-2.5 bg-primary text-primary-foreground border-none rounded-lg cursor-pointer text-sm font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-md active:scale-95 whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                Download All Challans
              </button>
            </div>

            {/* Compliance Score */}
            <div className="bg-card text-card-foreground rounded-xl border border-border border-l-4 border-l-emerald-500 p-6 mb-8 shadow-md">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                  <h2 className="text-xl font-bold mb-1">Compliance Score</h2>
                  <p className="text-muted-foreground text-sm">FY 2023-24 (April - March)</p>
                </div>
                <div className="flex items-center gap-10">
                  <div className="text-center">
                    <p className="text-5xl font-bold text-emerald-500 m-0">98%</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">Overall Score</p>
                  </div>
                  <div className="w-px h-12 bg-border hidden md:block" />
                  <div className="text-center">
                    <p className="text-3xl font-bold text-foreground m-0">44/45</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-1">Filings Complete</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Compliance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6 mb-8">
              {Object.entries(complianceData).map(([key, data]) => (
                <div key={key} className="bg-card text-card-foreground rounded-xl border border-border p-6 shadow-md transition-all hover:shadow-lg hover:border-primary/30">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Building2 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold m-0">{data.name}</h3>
                      </div>
                    </div>
                    {getStatusBadge(data.status)}
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="p-3 bg-muted/30 rounded-lg text-center border border-border/50">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">Employer</p>
                      <p className="text-sm font-bold truncate">₹{data.employer.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg text-center border border-border/50">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">Employee</p>
                      <p className="text-sm font-bold truncate">₹{data.employee.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-lg text-center border border-primary/20">
                      <p className="text-[10px] text-primary uppercase tracking-wider font-bold mb-1">Total</p>
                      <p className="text-sm font-bold text-primary truncate">₹{data.total.toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between text-xs font-semibold mb-2">
                      <span className="text-muted-foreground">Filings Completed</span>
                      <span className="text-foreground">{data.filedMonths}/{data.totalMonths} months</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden shadow-inner">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${(data.filedMonths / data.totalMonths) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-5 border-t border-border">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground font-medium">Due:</span>
                      <span className={cn(
                        "font-bold",
                        data.status === 'due_soon' ? "text-destructive" : "text-foreground"
                      )}>{data.dueDate}</span>
                    </div>
                    <button
                      onClick={async () => {
                        const loadingToast = toast.loading(`Generating ${data.name} challan...`);
                        setTimeout(() => {
                          if (key === 'pf') downloadPFChallan(payrolls);
                          else if (key === 'esi') downloadESIChallan(payrolls);
                          else if (key === 'tds') downloadTDSChallan(payrolls);
                          else if (key === 'pt') downloadPTChallan(payrolls);

                          toast.dismiss(loadingToast);
                          toast.success(`${data.name} challan downloaded!`);
                        }, 800);
                      }}
                      className="px-4 py-2 bg-card text-card-foreground border border-border rounded-lg hover:bg-muted transition-colors shadow-sm text-xs font-bold flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Generate Challan
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Filing History */}
            <div className="bg-card text-card-foreground rounded-xl border border-border shadow-md overflow-hidden">
              <div className="p-6 border-b border-border">
                <h2 className="text-xl font-bold mb-1 border-none">Filing History</h2>
                <p className="text-muted-foreground text-sm">Track your compliance filings across all categories</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="px-6 py-4 text-left font-semibold text-sm">Month</th>
                      <th className="px-3 py-4 text-center font-semibold text-sm">PF</th>
                      <th className="px-3 py-4 text-center font-semibold text-sm">ESI</th>
                      <th className="px-3 py-4 text-center font-semibold text-sm">TDS</th>
                      <th className="px-3 py-4 text-center font-semibold text-sm">PT</th>
                      <th className="px-6 py-4 text-right font-semibold text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filingHistory.map((row) => (
                      <tr key={row.month} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-semibold text-foreground">{row.month}</td>
                        <td className="px-3 py-4 flex justify-center">{getStatusBadge(row.pf)}</td>
                        <td className="px-3 py-4 text-center">{getStatusBadge(row.esi)}</td>
                        <td className="px-3 py-4 text-center">{getStatusBadge(row.tds)}</td>
                        <td className="px-3 py-4 text-center">{getStatusBadge(row.pt)}</td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end">
                            <button
                              onClick={async () => {
                                const loadingToast = toast.loading(`Downloading ${row.month} reports...`);
                                setTimeout(async () => {
                                  await downloadComplianceChallans(payrolls);
                                  toast.dismiss(loadingToast);
                                  toast.success(`${row.month} reports downloaded!`);
                                }, 1000);
                              }}
                              className="px-3 py-1.5 bg-card text-card-foreground border border-border rounded-lg hover:bg-muted transition-colors shadow-sm text-xs font-bold flex items-center gap-2"
                            >
                              <Download className="w-3.5 h-3.5 text-primary" />
                              Download
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal Popup - Professional Design */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[99999] animate-in fade-in duration-200">
          <div className="bg-card text-card-foreground rounded-2xl min-w-[450px] max-w-[550px] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300 border border-border">
            {/* Header with gradient */}
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl shadow-inner">
                📊
              </div>
              <div>
                <h3 className="m-0 text-white text-xl font-bold tracking-tight">Compliance</h3>
                <p className="m-0 text-white/80 text-sm mt-0.5">Statutory Compliance Management</p>
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
                className="px-8 py-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-none rounded-lg cursor-pointer text-sm font-bold shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 hover:shadow-emerald-500/30 active:translate-y-0 transition-all tracking-wide"
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
