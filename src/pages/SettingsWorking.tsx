import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useAuthStore } from '@/stores/authStore';
import { Building2, IndianRupee, FileText, Bell, Save, Plus, Edit, Trash2, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const salaryComponents = [
  { id: 1, name: 'Basic Salary', type: 'earning', calculation: 'Fixed', taxable: true, active: true },
  { id: 2, name: 'HRA', type: 'earning', calculation: '40% of Basic', taxable: true, active: true },
  { id: 3, name: 'Special Allowance', type: 'earning', calculation: 'Fixed', taxable: true, active: true },
  { id: 4, name: 'Conveyance Allowance', type: 'earning', calculation: 'Fixed', taxable: false, active: true },
  { id: 5, name: 'Medical Allowance', type: 'earning', calculation: 'Fixed', taxable: false, active: true },
  { id: 6, name: 'PF Deduction', type: 'deduction', calculation: '12% of Basic', taxable: false, active: true },
  { id: 7, name: 'Professional Tax', type: 'deduction', calculation: 'State Rules', taxable: false, active: true },
  { id: 8, name: 'TDS', type: 'deduction', calculation: 'As per slab', taxable: false, active: true },
];

export const SettingsWorkingPage = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('company');
  const [companyName, setCompanyName] = useState('PayZenix Technologies Pvt. Ltd.');
  const [pfEnabled, setPfEnabled] = useState(true);
  const [esiEnabled, setEsiEnabled] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  const handleSave = () => {
    toast.success('Settings saved successfully!', {
      duration: 4000,
      icon: '✅',
    });
  };

  const handleAddComponent = () => {
    toast.success('Add new salary component feature coming soon!', {
      duration: 3000,
      icon: '➕',
    });
  };

  const handleEditComponent = (componentName: string) => {
    toast.success(`Edit ${componentName} feature coming soon!`, {
      duration: 3000,
      icon: '✏️',
    });
  };

  const handleDeleteComponent = (componentName: string) => {
    toast.error(`Delete ${componentName}? This will affect future payroll calculations.`, {
      duration: 4000,
      icon: '⚠️',
    });
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
          style={{ 
            marginLeft: sidebarCollapsed ? '80px' : '280px',
            transition: 'margin-left 0.3s ease-in-out'
          }}
        >
          <Header />
          <main className="p-6">
            <div style={{ maxWidth: '600px', margin: '100px auto', textAlign: 'center' }}>
              <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '40px' }}>
                <Shield style={{ width: '48px', height: '48px', color: '#dc2626', margin: '0 auto 20px' }} />
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px' }}>Access Denied</h2>
                <p style={{ color: '#666', fontSize: '14px' }}>
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
        style={{ 
          marginLeft: sidebarCollapsed ? '80px' : '280px',
          transition: 'margin-left 0.3s ease-in-out'
        }}
      >
        <Header />
        <main className="p-6 animate-fadeIn">
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '30px' }}>
              <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>Settings</h1>
              <p style={{ color: '#666', fontSize: '14px' }}>Manage company settings, salary components, and policies</p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '30px', borderBottom: '1px solid #e5e7eb' }}>
              {[
                { id: 'company', label: 'Company', icon: Building2 },
                { id: 'salary', label: 'Salary', icon: IndianRupee },
                { id: 'compliance', label: 'Compliance', icon: FileText },
                { id: 'notifications', label: 'Notifications', icon: Bell },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '12px 20px',
                    background: activeTab === tab.id ? '#ede9fe' : 'transparent',
                    border: 'none',
                    borderBottom: activeTab === tab.id ? '2px solid #7c3aed' : '2px solid transparent',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: activeTab === tab.id ? '#7c3aed' : '#666',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <tab.icon style={{ width: '16px', height: '16px' }} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Company Tab */}
            {activeTab === 'company' && (
              <div style={{ display: 'grid', gap: '20px' }}>
                <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '24px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>Company Information</h2>
                  <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>Basic company details used across the platform</p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>Company Name</label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>Registration Number</label>
                      <input
                        type="text"
                        defaultValue="CIN: U72200KA2020PTC123456"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>Company PAN</label>
                      <input
                        type="text"
                        defaultValue="ABCDE1234F"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>TAN Number</label>
                      <input
                        type="text"
                        defaultValue="BLRA12345F"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>Registered Address</label>
                      <input
                        type="text"
                        defaultValue="123, Tech Park, Whitefield, Bangalore - 560066"
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d1d5db',
                          borderRadius: '6px',
                          fontSize: '14px'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={handleSave}
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
                      <Save style={{ width: '16px', height: '16px' }} />
                      Save Changes
                    </button>
                  </div>
                </div>

                <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '24px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>Statutory Details</h2>
                  <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>PF, ESI, and other statutory registration details</p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>PF Registration Number</label>
                      <input type="text" defaultValue="BGBNG1234567000" style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>ESI Registration Number</label>
                      <input type="text" defaultValue="12345678901234567" style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>PT Registration Number</label>
                      <input type="text" defaultValue="PTKA/BLR/12345" style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>GST Number</label>
                      <input type="text" defaultValue="29ABCDE1234F1Z5" style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Salary Tab */}
            {activeTab === 'salary' && (
              <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>Salary Components</h2>
                    <p style={{ color: '#666', fontSize: '14px' }}>Configure earnings and deductions for salary calculation</p>
                  </div>
                  <button
                    onClick={handleAddComponent}
                    style={{
                      padding: '8px 16px',
                      background: '#4f46e5',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Plus style={{ width: '16px', height: '16px' }} />
                    Add Component
                  </button>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ background: '#f9fafb' }}>
                    <tr>
                      <th style={{ padding: '12px 24px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Component Name</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Type</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Calculation</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600' }}>Taxable</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', fontWeight: '600' }}>Status</th>
                      <th style={{ padding: '12px 24px', textAlign: 'right', fontSize: '14px', fontWeight: '600' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salaryComponents.map((component) => (
                      <tr key={component.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '12px 24px', fontWeight: '500' }}>{component.name}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            padding: '4px 12px',
                            background: component.type === 'earning' ? '#dcfce7' : '#fee2e2',
                            color: component.type === 'earning' ? '#166534' : '#991b1b',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}>
                            {component.type === 'earning' ? 'Earning' : 'Deduction'}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>{component.calculation}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            padding: '4px 12px',
                            background: component.taxable ? '#f3f4f6' : '#f9fafb',
                            color: '#666',
                            borderRadius: '12px',
                            fontSize: '12px',
                            border: '1px solid #e5e7eb'
                          }}>
                            {component.taxable ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                            <input type="checkbox" checked={component.active} readOnly style={{ opacity: 0, width: 0, height: 0 }} />
                            <span style={{
                              position: 'absolute',
                              cursor: 'pointer',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              background: component.active ? '#4f46e5' : '#d1d5db',
                              borderRadius: '24px',
                              transition: '0.3s'
                            }}>
                              <span style={{
                                position: 'absolute',
                                content: '',
                                height: '18px',
                                width: '18px',
                                left: component.active ? '23px' : '3px',
                                bottom: '3px',
                                background: 'white',
                                borderRadius: '50%',
                                transition: '0.3s'
                              }} />
                            </span>
                          </label>
                        </td>
                        <td style={{ padding: '12px 24px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => handleEditComponent(component.name)}
                              style={{
                                padding: '6px 12px',
                                background: 'transparent',
                                border: '1px solid #d1d5db',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            >
                              <Edit style={{ width: '16px', height: '16px' }} />
                            </button>
                            <button
                              onClick={() => handleDeleteComponent(component.name)}
                              style={{
                                padding: '6px 12px',
                                background: 'transparent',
                                border: '1px solid #d1d5db',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                color: '#dc2626'
                              }}
                            >
                              <Trash2 style={{ width: '16px', height: '16px' }} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Compliance Tab */}
            {activeTab === 'compliance' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
                <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <Building2 style={{ width: '20px', height: '20px', color: '#4f46e5' }} />
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Provident Fund (PF)</h2>
                  </div>
                  <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>Configure PF contribution settings</p>

                  <div style={{ display: 'grid', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontWeight: '500', fontSize: '14px' }}>Enable PF Deduction</label>
                      <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                        <input type="checkbox" checked={pfEnabled} onChange={(e) => setPfEnabled(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                        <span style={{
                          position: 'absolute',
                          cursor: 'pointer',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: pfEnabled ? '#4f46e5' : '#d1d5db',
                          borderRadius: '24px',
                          transition: '0.3s'
                        }}>
                          <span style={{
                            position: 'absolute',
                            content: '',
                            height: '18px',
                            width: '18px',
                            left: pfEnabled ? '23px' : '3px',
                            bottom: '3px',
                            background: 'white',
                            borderRadius: '50%',
                            transition: '0.3s'
                          }} />
                        </span>
                      </label>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>Employee Contribution Rate</label>
                      <input type="text" defaultValue="12%" disabled={!pfEnabled} style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>Employer Contribution Rate</label>
                      <input type="text" defaultValue="12%" disabled={!pfEnabled} style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>Wage Ceiling Limit</label>
                      <input type="text" defaultValue="₹15,000" disabled={!pfEnabled} style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }} />
                    </div>
                  </div>
                </div>

                <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                    <Shield style={{ width: '20px', height: '20px', color: '#2563eb' }} />
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>ESI (Employee State Insurance)</h2>
                  </div>
                  <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>Configure ESI contribution settings</p>

                  <div style={{ display: 'grid', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label style={{ fontWeight: '500', fontSize: '14px' }}>Enable ESI Deduction</label>
                      <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                        <input type="checkbox" checked={esiEnabled} onChange={(e) => setEsiEnabled(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                        <span style={{
                          position: 'absolute',
                          cursor: 'pointer',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: esiEnabled ? '#4f46e5' : '#d1d5db',
                          borderRadius: '24px',
                          transition: '0.3s'
                        }}>
                          <span style={{
                            position: 'absolute',
                            content: '',
                            height: '18px',
                            width: '18px',
                            left: esiEnabled ? '23px' : '3px',
                            bottom: '3px',
                            background: 'white',
                            borderRadius: '50%',
                            transition: '0.3s'
                          }} />
                        </span>
                      </label>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>Employee Contribution</label>
                      <input type="text" defaultValue="0.75%" disabled={!esiEnabled} style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>Employer Contribution</label>
                      <input type="text" defaultValue="3.25%" disabled={!esiEnabled} style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>Gross Salary Limit</label>
                      <input type="text" defaultValue="₹21,000" disabled={!esiEnabled} style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>Email Notifications</h2>
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>Configure when to send email notifications</p>

                <div style={{ display: 'grid', gap: '16px' }}>
                  {[
                    { label: 'Payroll processed notification', description: 'Send email when monthly payroll is processed', enabled: true },
                    { label: 'Payslip available', description: 'Notify employees when their payslip is generated', enabled: true },
                    { label: 'Compliance due reminders', description: 'Send reminders before compliance filing deadlines', enabled: true },
                    { label: 'New employee onboarded', description: 'Notify HR team when a new employee is added', enabled: false },
                    { label: 'Loan application updates', description: 'Notify employees about loan application status', enabled: true },
                  ].map((item) => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '16px 0', borderBottom: '1px solid #f3f4f6' }}>
                      <div>
                        <p style={{ fontWeight: '500', margin: 0, marginBottom: '4px' }}>{item.label}</p>
                        <p style={{ fontSize: '14px', color: '#666', margin: 0 }}>{item.description}</p>
                      </div>
                      <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', flexShrink: 0 }}>
                        <input type="checkbox" defaultChecked={item.enabled} style={{ opacity: 0, width: 0, height: 0 }} />
                        <span style={{
                          position: 'absolute',
                          cursor: 'pointer',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: item.enabled ? '#4f46e5' : '#d1d5db',
                          borderRadius: '24px',
                          transition: '0.3s'
                        }}>
                          <span style={{
                            position: 'absolute',
                            content: '',
                            height: '18px',
                            width: '18px',
                            left: item.enabled ? '23px' : '3px',
                            bottom: '3px',
                            background: 'white',
                            borderRadius: '50%',
                            transition: '0.3s'
                          }} />
                        </span>
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
