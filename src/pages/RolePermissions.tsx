import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useAuthStore } from '@/stores/authStore';
import { rolePermissions, getRoleName, getRoleColor, hasPermission } from '@/utils/rbac';
import { Shield, Check, X, Users, Lock, Eye, Edit, Trash2, Plus, Download, Settings, FileCheck } from 'lucide-react';

export const RolePermissionsPage = () => {
  const { user } = useAuthStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [selectedRole, setSelectedRole] = useState<'superadmin' | 'admin' | 'hr' | 'employee'>('admin');

  if (!user) return null;

  // Only admin and superadmin can view this page
  if (user.role !== 'admin' && user.role !== 'superadmin') {
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
            <div style={{ maxWidth: '1400px', margin: '0 auto', textAlign: 'center', paddingTop: '100px' }}>
              <Lock style={{ width: '64px', height: '64px', margin: '0 auto 20px', color: '#dc2626' }} />
              <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>Access Denied</h1>
              <p style={{ color: '#666', fontSize: '16px' }}>You don't have permission to view this page.</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const roles = ['superadmin', 'admin', 'hr', 'employee'] as const;
  
  const permissionGroups = {
    'View Permissions': [
      { key: 'canViewAllEmployees', label: 'View All Employees', icon: Users },
      { key: 'canViewAllPayroll', label: 'View All Payroll', icon: FileCheck },
      { key: 'canViewAllLoans', label: 'View All Loans', icon: FileCheck },
      { key: 'canViewAllCompliance', label: 'View Compliance', icon: Shield },
      { key: 'canViewAllPayouts', label: 'View Payouts', icon: FileCheck },
      { key: 'canViewSettings', label: 'View Settings', icon: Settings },
      { key: 'canViewReports', label: 'View Reports', icon: FileCheck },
    ],
    'Employee Management': [
      { key: 'canAddEmployee', label: 'Add Employee', icon: Plus },
      { key: 'canEditEmployee', label: 'Edit Employee', icon: Edit },
      { key: 'canDeleteEmployee', label: 'Delete Employee', icon: Trash2 },
    ],
    'Payroll Management': [
      { key: 'canAddPayroll', label: 'Add Payroll', icon: Plus },
      { key: 'canEditPayroll', label: 'Edit Payroll', icon: Edit },
      { key: 'canDeletePayroll', label: 'Delete Payroll', icon: Trash2 },
      { key: 'canProcessPayroll', label: 'Process Payroll', icon: FileCheck },
    ],
    'Loan Management': [
      { key: 'canAddLoan', label: 'Add Loan', icon: Plus },
      { key: 'canEditLoan', label: 'Edit Loan', icon: Edit },
      { key: 'canDeleteLoan', label: 'Delete Loan', icon: Trash2 },
      { key: 'canApproveLoan', label: 'Approve Loan', icon: Check },
      { key: 'canRejectLoan', label: 'Reject Loan', icon: X },
    ],
    'System Permissions': [
      { key: 'canEditSettings', label: 'Edit Settings', icon: Settings },
      { key: 'canExportData', label: 'Export Data', icon: Download },
      { key: 'canManageUsers', label: 'Manage Users', icon: Users },
      { key: 'canManageRoles', label: 'Manage Roles', icon: Shield },
    ],
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
            <div style={{ marginBottom: '30px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                <Shield style={{ width: '32px', height: '32px', color: '#4f46e5' }} />
                <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>Role Permissions</h1>
              </div>
              <p style={{ color: '#666', fontSize: '14px' }}>
                View and understand role-based access control in PayZenix
              </p>
            </div>

            {/* Role Selector */}
            <div style={{ marginBottom: '30px' }}>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {roles.map((role) => (
                  <button
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className="stat-card"
                    style={{
                      padding: '16px 24px',
                      background: selectedRole === role ? getRoleColor(role) : 'white',
                      color: selectedRole === role ? 'white' : '#374151',
                      border: selectedRole === role ? 'none' : '2px solid #e5e7eb',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: '600',
                      transition: 'all 0.3s',
                      boxShadow: selectedRole === role ? '0 4px 12px rgba(79, 70, 229, 0.3)' : 'none'
                    }}
                  >
                    {getRoleName(role)}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Role Info */}
            <div className="animate-slideUp" style={{
              padding: '24px',
              background: 'white',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              marginBottom: '30px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  background: getRoleColor(selectedRole),
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Shield style={{ width: '24px', height: '24px', color: 'white' }} />
                </div>
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, marginBottom: '4px' }}>
                    {getRoleName(selectedRole)}
                  </h2>
                  <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
                    {selectedRole === 'superadmin' && 'Full system access with all permissions'}
                    {selectedRole === 'admin' && 'Manage employees, payroll, and loans'}
                    {selectedRole === 'hr' && 'Manage employees and approve loans (cannot delete)'}
                    {selectedRole === 'employee' && 'View own payslips and loans only'}
                  </p>
                </div>
              </div>

              {/* Permission Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                <div style={{ padding: '12px', background: '#dcfce7', borderRadius: '8px', textAlign: 'center' }}>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#166534', margin: 0 }}>
                    {Object.values(rolePermissions[selectedRole]).filter(Boolean).length}
                  </p>
                  <p style={{ fontSize: '12px', color: '#166534', margin: 0 }}>Permissions Granted</p>
                </div>
                <div style={{ padding: '12px', background: '#fee2e2', borderRadius: '8px', textAlign: 'center' }}>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#991b1b', margin: 0 }}>
                    {Object.values(rolePermissions[selectedRole]).filter(v => !v).length}
                  </p>
                  <p style={{ fontSize: '12px', color: '#991b1b', margin: 0 }}>Permissions Denied</p>
                </div>
              </div>
            </div>

            {/* Permissions Grid */}
            <div style={{ display: 'grid', gap: '20px' }}>
              {Object.entries(permissionGroups).map(([groupName, permissions]) => (
                <div
                  key={groupName}
                  className="animate-slideUp"
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}
                >
                  <div style={{
                    padding: '16px 20px',
                    background: '#f9fafb',
                    borderBottom: '1px solid #e5e7eb'
                  }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>{groupName}</h3>
                  </div>
                  <div style={{ padding: '20px' }}>
                    <div style={{ display: 'grid', gap: '12px' }}>
                      {permissions.map((permission) => {
                        const hasAccess = rolePermissions[selectedRole][permission.key as keyof typeof rolePermissions.superadmin];
                        const Icon = permission.icon;
                        
                        return (
                          <div
                            key={permission.key}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '12px 16px',
                              background: hasAccess ? '#f0fdf4' : '#fef2f2',
                              borderRadius: '8px',
                              border: `1px solid ${hasAccess ? '#86efac' : '#fecaca'}`,
                              transition: 'all 0.3s'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{
                                width: '32px',
                                height: '32px',
                                background: hasAccess ? '#dcfce7' : '#fee2e2',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                <Icon style={{ width: '16px', height: '16px', color: hasAccess ? '#166534' : '#991b1b' }} />
                              </div>
                              <span style={{ fontWeight: '500', fontSize: '14px' }}>{permission.label}</span>
                            </div>
                            <div style={{
                              width: '32px',
                              height: '32px',
                              background: hasAccess ? '#16a34a' : '#dc2626',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              {hasAccess ? (
                                <Check style={{ width: '18px', height: '18px', color: 'white' }} />
                              ) : (
                                <X style={{ width: '18px', height: '18px', color: 'white' }} />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Info Box */}
            <div style={{
              marginTop: '30px',
              padding: '20px',
              background: '#eff6ff',
              border: '1px solid #93c5fd',
              borderRadius: '12px'
            }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <Shield style={{ width: '20px', height: '20px', color: '#2563eb', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1e40af', margin: 0, marginBottom: '8px' }}>
                    About Role-Based Access Control
                  </h4>
                  <p style={{ fontSize: '13px', color: '#1e40af', margin: 0, lineHeight: '1.6' }}>
                    PayZenix uses role-based access control (RBAC) to ensure data security and proper authorization. 
                    Each role has specific permissions that determine what actions users can perform. 
                    Employees can only view their own data, while HR and Admin roles have broader access to manage the system.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
