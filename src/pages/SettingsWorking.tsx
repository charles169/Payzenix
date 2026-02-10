import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useAuthStore } from '@/stores/authStore';
import { Building2, IndianRupee, FileText, Bell, Save, Plus, Edit, Trash2, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

const initialSalaryComponents = [
  { id: 1, name: 'Basic Salary', type: 'earning', calculation: 'Fixed', taxable: true, active: true },
  { id: 2, name: 'HRA', type: 'earning', calculation: '40% of Basic', taxable: true, active: true },
  { id: 3, name: 'Special Allowance', type: 'earning', calculation: 'Fixed', taxable: true, active: true },
  { id: 4, name: 'Conveyance Allowance', type: 'earning', calculation: 'Fixed', taxable: false, active: true },
  { id: 5, name: 'Medical Allowance', type: 'earning', calculation: 'Fixed', taxable: false, active: true },
  { id: 6, name: 'PF Deduction', type: 'deduction', calculation: '12% of Basic', taxable: false, active: true },
  { id: 7, name: 'Professional Tax', type: 'deduction', calculation: 'State Rules', taxable: false, active: true },
  { id: 8, name: 'TDS', type: 'deduction', calculation: 'As per slab', taxable: false, active: true },
];

// Load settings from localStorage before component renders
const loadSavedSettings = () => {
  try {
    const savedSettings = localStorage.getItem('payzenix_settings');
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
  return null;
};

const savedData = loadSavedSettings();

export const SettingsWorkingPage = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('company');
  const [companyName, setCompanyName] = useState(savedData?.companyName || 'PayZenix Technologies Pvt. Ltd.');
  const [registrationNumber, setRegistrationNumber] = useState(savedData?.registrationNumber || 'CIN: U72200KA2020PTC123456');
  const [companyPAN, setCompanyPAN] = useState(savedData?.companyPAN || 'ABCDE1234F');
  const [tanNumber, setTanNumber] = useState(savedData?.tanNumber || 'BLRA12345F');
  const [address, setAddress] = useState(savedData?.address || '123, Tech Park, Whitefield, Bangalore - 560066');
  const [pfEnabled, setPfEnabled] = useState(savedData?.pfEnabled !== undefined ? savedData.pfEnabled : true);
  const [esiEnabled, setEsiEnabled] = useState(savedData?.esiEnabled !== undefined ? savedData.esiEnabled : true);
  const [pfEmployeeRate, setPfEmployeeRate] = useState(savedData?.pfEmployeeRate || '12%');
  const [pfEmployerRate, setPfEmployerRate] = useState(savedData?.pfEmployerRate || '12%');
  const [pfWageLimit, setPfWageLimit] = useState(savedData?.pfWageLimit || '₹15,000');
  const [esiEmployeeRate, setEsiEmployeeRate] = useState(savedData?.esiEmployeeRate || '0.75%');
  const [esiEmployerRate, setEsiEmployerRate] = useState(savedData?.esiEmployerRate || '3.25%');
  const [esiSalaryLimit, setEsiSalaryLimit] = useState(savedData?.esiSalaryLimit || '₹21,000');
  const [salaryComponents, setSalaryComponents] = useState(savedData?.salaryComponents || initialSalaryComponents);
  const [editingComponent, setEditingComponent] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<any>({});
  const [notifications, setNotifications] = useState(savedData?.notifications || {
    payrollProcessed: true,
    payslipAvailable: true,
    complianceReminders: true,
    newEmployee: false,
    loanUpdates: true,
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  // Log on mount to verify settings loaded
  useEffect(() => {
    if (savedData) {
      console.log('✅ Settings loaded from localStorage on mount:', savedData);
    } else {
      console.log('ℹ️ No saved settings found, using defaults');
    }
  }, []);

  const handleSave = () => {
    // Save all settings to localStorage
    const settings = {
      companyName,
      registrationNumber,
      companyPAN,
      tanNumber,
      address,
      pfEnabled,
      esiEnabled,
      pfEmployeeRate,
      pfEmployerRate,
      pfWageLimit,
      esiEmployeeRate,
      esiEmployerRate,
      esiSalaryLimit,
      salaryComponents,
      notifications,
      lastUpdated: new Date().toISOString(),
    };
    
    console.log('💾 Saving settings to localStorage:', settings);
    localStorage.setItem('payzenix_settings', JSON.stringify(settings));
    console.log('✅ Settings saved successfully');
    
    toast.success('Settings saved successfully! Changes will persist after refresh.', {
      duration: 3000,
      icon: '✅',
    });
  };

  const handleAddComponent = () => {
    const newComponent = {
      id: salaryComponents.length + 1,
      name: 'New Component',
      type: 'earning',
      calculation: 'Fixed',
      taxable: true,
      active: true,
    };
    setSalaryComponents([...salaryComponents, newComponent]);
    toast.success('New salary component added! Click Save to persist changes.', {
      duration: 3000,
      icon: '➕',
    });
  };

  const handleEditComponent = (componentId: number) => {
    const component = salaryComponents.find(c => c.id === componentId);
    if (component) {
      setEditingComponent(componentId);
      setEditValues({
        name: component.name,
        calculation: component.calculation,
        taxable: component.taxable,
      });
    }
  };

  const handleSaveEdit = (componentId: number) => {
    setSalaryComponents(salaryComponents.map(c => 
      c.id === componentId ? { ...c, ...editValues } : c
    ));
    setEditingComponent(null);
    setEditValues({});
    toast.success('Component updated! Click Save Changes to persist.', {
      duration: 3000,
      icon: '✅',
    });
  };

  const handleCancelEdit = () => {
    setEditingComponent(null);
    setEditValues({});
  };

  const handleDeleteComponent = (componentId: number, componentName: string) => {
    if (confirm(`Are you sure you want to delete "${componentName}"? This will affect future payroll calculations.`)) {
      setSalaryComponents(salaryComponents.filter(c => c.id !== componentId));
      toast.success(`${componentName} deleted! Click Save to persist changes.`, {
        duration: 3000,
        icon: '🗑️',
      });
    }
  };

  const toggleComponentStatus = (componentId: number) => {
    const updatedComponents = salaryComponents.map(c => 
      c.id === componentId ? { ...c, active: !c.active } : c
    );
    setSalaryComponents(updatedComponents);
    
    // Auto-save to localStorage
    const settings = JSON.parse(localStorage.getItem('payzenix_settings') || '{}');
    settings.salaryComponents = updatedComponents;
    settings.lastUpdated = new Date().toISOString();
    localStorage.setItem('payzenix_settings', JSON.stringify(settings));
    console.log('🔄 Auto-saved component toggle');
  };

  const toggleNotification = (key: string) => {
    const updatedNotifications = { ...notifications, [key]: !notifications[key] };
    setNotifications(updatedNotifications);
    
    // Auto-save to localStorage
    const settings = JSON.parse(localStorage.getItem('payzenix_settings') || '{}');
    settings.notifications = updatedNotifications;
    settings.lastUpdated = new Date().toISOString();
    localStorage.setItem('payzenix_settings', JSON.stringify(settings));
    console.log('🔄 Auto-saved notification toggle');
  };

  const handlePfToggle = (enabled: boolean) => {
    setPfEnabled(enabled);
    
    // Auto-save to localStorage
    const settings = JSON.parse(localStorage.getItem('payzenix_settings') || '{}');
    settings.pfEnabled = enabled;
    settings.lastUpdated = new Date().toISOString();
    localStorage.setItem('payzenix_settings', JSON.stringify(settings));
    console.log('🔄 Auto-saved PF toggle:', enabled);
  };

  const handleEsiToggle = (enabled: boolean) => {
    setEsiEnabled(enabled);
    
    // Auto-save to localStorage
    const settings = JSON.parse(localStorage.getItem('payzenix_settings') || '{}');
    settings.esiEnabled = enabled;
    settings.lastUpdated = new Date().toISOString();
    localStorage.setItem('payzenix_settings', JSON.stringify(settings));
    console.log('🔄 Auto-saved ESI toggle:', enabled);
  };

  if (!user || (user.role !== 'superadmin' && user.role !== 'admin')) {
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
            <div className="max-w-xl mx-auto mt-24 text-center">
              <div className="bg-card text-card-foreground rounded-2xl border border-border p-10 shadow-lg">
                <Shield className="w-12 h-12 text-destructive mx-auto mb-5" />
                <h2 className="text-2xl font-bold mb-3">Access Denied</h2>
                <p className="text-muted-foreground text-sm">
                  You don't have permission to access this page. Only super admins and administrators can view settings.
                </p>
              </div>
            </div>
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
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-1.5 text-foreground text-gradient">Settings</h1>
              <p className="text-muted-foreground text-sm">Manage company settings, salary components, and policies</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-8 border-b border-border">
              {[
                { id: 'company', label: 'Company', icon: Building2 },
                { id: 'salary', label: 'Salary', icon: IndianRupee },
                { id: 'compliance', label: 'Compliance', icon: FileText },
                { id: 'notifications', label: 'Notifications', icon: Bell },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "px-5 py-3 border-none border-b-2 cursor-pointer text-sm font-semibold flex items-center gap-2 transition-all",
                    activeTab === tab.id
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-transparent border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Company Tab */}
            {activeTab === 'company' && (
              <div className="grid gap-5">
                <div className="bg-card text-card-foreground rounded-xl border border-border p-6 shadow-md">
                  <h2 className="text-xl font-bold mb-2">Company Information</h2>
                  <p className="text-muted-foreground text-sm mb-6">Basic company details used across the platform</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block font-semibold text-sm text-foreground/80">Company Name</label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full px-4 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block font-semibold text-sm text-foreground/80">Registration Number</label>
                      <input
                        type="text"
                        value={registrationNumber}
                        onChange={(e) => setRegistrationNumber(e.target.value)}
                        className="w-full px-4 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block font-semibold text-sm text-foreground/80">Company PAN</label>
                      <input
                        type="text"
                        value={companyPAN}
                        onChange={(e) => setCompanyPAN(e.target.value)}
                        className="w-full px-4 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block font-semibold text-sm text-foreground/80">TAN Number</label>
                      <input
                        type="text"
                        value={tanNumber}
                        onChange={(e) => setTanNumber(e.target.value)}
                        className="w-full px-4 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground"
                      />
                    </div>
                    <div className="col-span-full space-y-1.5">
                      <label className="block font-semibold text-sm text-foreground/80">Registered Address</label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full px-4 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground"
                      />
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-border flex justify-end">
                    <button
                      onClick={handleSave}
                      className="px-6 py-2 bg-primary text-primary-foreground border-none rounded-lg cursor-pointer text-sm font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-md active:scale-95"
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </button>
                  </div>
                </div>

                <div className="bg-card text-card-foreground rounded-xl border border-border p-6 shadow-md">
                  <h2 className="text-xl font-bold mb-2">Statutory Details</h2>
                  <p className="text-muted-foreground text-sm mb-6">PF, ESI, and other statutory registration details</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <label className="block font-semibold text-sm text-foreground/80">PF Registration Number</label>
                      <input type="text" defaultValue="BGBNG1234567000" className="w-full px-4 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block font-semibold text-sm text-foreground/80">ESI Registration Number</label>
                      <input type="text" defaultValue="12345678901234567" className="w-full px-4 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block font-semibold text-sm text-foreground/80">PT Registration Number</label>
                      <input type="text" defaultValue="PTKA/BLR/12345" className="w-full px-4 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block font-semibold text-sm text-foreground/80">GST Number</label>
                      <input type="text" defaultValue="29ABCDE1234F1Z5" className="w-full px-4 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Salary Tab */}
            {activeTab === 'salary' && (
              <div className="bg-card text-card-foreground rounded-xl border border-border overflow-hidden shadow-md">
                <div className="p-6 border-b border-border flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold mb-1 border-none">Salary Components</h2>
                    <p className="text-muted-foreground text-sm">Configure earnings and deductions for salary calculation</p>
                  </div>
                  <button
                    onClick={handleAddComponent}
                    className="px-4 py-2 bg-primary text-primary-foreground border-none rounded-lg cursor-pointer text-sm font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-md active:scale-95"
                  >
                    <Plus className="w-4 h-4" />
                    Add Component
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="px-6 py-4 text-left font-semibold text-sm">Component Name</th>
                        <th className="px-3 py-4 text-left font-semibold text-sm">Type</th>
                        <th className="px-3 py-4 text-left font-semibold text-sm">Calculation</th>
                        <th className="px-3 py-4 text-left font-semibold text-sm">Taxable</th>
                        <th className="px-3 py-4 text-center font-semibold text-sm">Status</th>
                        <th className="px-6 py-4 text-right font-semibold text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {salaryComponents.map((component) => (
                        <tr key={component.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4 font-semibold text-foreground">
                            {editingComponent === component.id ? (
                              <input
                                type="text"
                                value={editValues.name}
                                onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                                className="w-full px-3 py-1 bg-muted/30 border border-border rounded text-sm"
                                autoFocus
                              />
                            ) : (
                              component.name
                            )}
                          </td>
                          <td className="px-3 py-4">
                            <span className={cn(
                              "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                              component.type === 'earning' ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                            )}>
                              {component.type === 'earning' ? 'Earning' : 'Deduction'}
                            </span>
                          </td>
                          <td className="px-3 py-4 text-sm">
                            {editingComponent === component.id ? (
                              <input
                                type="text"
                                value={editValues.calculation}
                                onChange={(e) => setEditValues({ ...editValues, calculation: e.target.value })}
                                className="w-full px-3 py-1 bg-muted/30 border border-border rounded text-sm"
                              />
                            ) : (
                              component.calculation
                            )}
                          </td>
                          <td className="px-3 py-4">
                            {editingComponent === component.id ? (
                              <select
                                value={editValues.taxable ? 'yes' : 'no'}
                                onChange={(e) => setEditValues({ ...editValues, taxable: e.target.value === 'yes' })}
                                className="px-3 py-1 bg-muted/30 border border-border rounded text-xs"
                              >
                                <option value="yes">Yes</option>
                                <option value="no">No</option>
                              </select>
                            ) : (
                              <span className="px-3 py-1 bg-muted/50 text-muted-foreground rounded-full text-xs border border-border">
                                {component.taxable ? 'Yes' : 'No'}
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-4 text-center">
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={component.active}
                                onChange={() => toggleComponentStatus(component.id)}
                                className="sr-only peer"
                                disabled={editingComponent === component.id}
                              />
                              <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner peer-disabled:opacity-50"></div>
                            </label>
                          </td>
                          <td className="px-6 py-4">
                            {editingComponent === component.id ? (
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => handleSaveEdit(component.id)}
                                  className="px-3 py-1 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="px-3 py-1 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors text-sm font-medium"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => handleEditComponent(component.id)}
                                  className="p-2 bg-card text-card-foreground border border-border rounded-lg hover:bg-muted transition-colors shadow-sm"
                                  title="Edit component"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteComponent(component.id, component.name)}
                                  className="p-2 bg-card text-destructive border border-border rounded-lg hover:bg-destructive/10 transition-colors shadow-sm"
                                  title="Delete component"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Compliance Tab */}
            {activeTab === 'compliance' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-card text-card-foreground rounded-xl border border-border p-6 shadow-md">
                  <div className="flex items-center gap-3 mb-5 border-none">
                    <Building2 className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-bold m-0 border-none">Provident Fund (PF)</h2>
                  </div>
                  <p className="text-muted-foreground text-sm mb-6">Configure PF contribution settings</p>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-muted/20 p-3 rounded-lg border border-border">
                      <label className="font-semibold text-sm">Enable PF Deduction</label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={pfEnabled} onChange={(e) => handlePfToggle(e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                      </label>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block font-semibold text-sm text-foreground/80">Employee Contribution Rate</label>
                      <input
                        type="text"
                        value={pfEmployeeRate}
                        onChange={(e) => setPfEmployeeRate(e.target.value)}
                        disabled={!pfEnabled}
                        className="w-full px-4 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground disabled:opacity-50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block font-semibold text-sm text-foreground/80">Employer Contribution Rate</label>
                      <input
                        type="text"
                        value={pfEmployerRate}
                        onChange={(e) => setPfEmployerRate(e.target.value)}
                        disabled={!pfEnabled}
                        className="w-full px-4 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground disabled:opacity-50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block font-semibold text-sm text-foreground/80">Wage Ceiling Limit</label>
                      <input
                        type="text"
                        value={pfWageLimit}
                        onChange={(e) => setPfWageLimit(e.target.value)}
                        disabled={!pfEnabled}
                        className="w-full px-4 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-card text-card-foreground rounded-xl border border-border p-6 shadow-md">
                  <div className="flex items-center gap-3 mb-5">
                    <Shield className="w-5 h-5 text-blue-500" />
                    <h2 className="text-xl font-bold m-0 border-none">ESI (Employee State Insurance)</h2>
                  </div>
                  <p className="text-muted-foreground text-sm mb-6">Configure ESI contribution settings</p>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-muted/20 p-3 rounded-lg border border-border">
                      <label className="font-semibold text-sm">Enable ESI Deduction</label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={esiEnabled} onChange={(e) => handleEsiToggle(e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                      </label>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block font-semibold text-sm text-foreground/80">Employee Contribution</label>
                      <input
                        type="text"
                        value={esiEmployeeRate}
                        onChange={(e) => setEsiEmployeeRate(e.target.value)}
                        disabled={!esiEnabled}
                        className="w-full px-4 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground disabled:opacity-50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block font-semibold text-sm text-foreground/80">Employer Contribution</label>
                      <input
                        type="text"
                        value={esiEmployerRate}
                        onChange={(e) => setEsiEmployerRate(e.target.value)}
                        disabled={!esiEnabled}
                        className="w-full px-4 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground disabled:opacity-50"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block font-semibold text-sm text-foreground/80">Gross Salary Limit</label>
                      <input
                        type="text"
                        value={esiSalaryLimit}
                        onChange={(e) => setEsiSalaryLimit(e.target.value)}
                        disabled={!esiEnabled}
                        className="w-full px-4 py-2 bg-muted/30 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="bg-card text-card-foreground rounded-xl border border-border p-6 shadow-md">
                <h2 className="text-xl font-bold mb-2 border-none">Email Notifications</h2>
                <p className="text-muted-foreground text-sm mb-6">Configure when to send email notifications</p>

                <div className="divide-y divide-border">
                  {[
                    { key: 'payrollProcessed', label: 'Payroll processed notification', description: 'Send email when monthly payroll is processed', enabled: notifications.payrollProcessed },
                    { key: 'payslipAvailable', label: 'Payslip available', description: 'Notify employees when their payslip is generated', enabled: notifications.payslipAvailable },
                    { key: 'complianceReminders', label: 'Compliance due reminders', description: 'Send reminders before compliance filing deadlines', enabled: notifications.complianceReminders },
                    { key: 'newEmployee', label: 'New employee onboarded', description: 'Notify HR team when a new employee is added', enabled: notifications.newEmployee },
                    { key: 'loanUpdates', label: 'Loan application updates', description: 'Notify employees about loan application status', enabled: notifications.loanUpdates },
                  ].map((item) => (
                    <div key={item.key} className="py-4 flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-foreground mb-1">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={item.enabled}
                          onChange={() => toggleNotification(item.key)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary shadow-inner"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
