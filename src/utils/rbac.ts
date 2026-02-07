// Role-Based Access Control (RBAC) Utilities

import { UserRole } from '@/stores/authStore';

// Define what each role can do
export const rolePermissions = {
  superadmin: {
    // View permissions
    canViewAllEmployees: true,
    canViewAllPayroll: true,
    canViewAllLoans: true,
    canViewAllCompliance: true,
    canViewAllPayouts: true,
    canViewSettings: true,
    canViewReports: true,
    
    // Edit permissions
    canAddEmployee: true,
    canEditEmployee: true,
    canDeleteEmployee: true,
    canAddPayroll: true,
    canEditPayroll: true,
    canDeletePayroll: true,
    canAddLoan: true,
    canEditLoan: true,
    canDeleteLoan: true,
    canApproveLoan: true,
    canRejectLoan: true,
    canEditSettings: true,
    canExportData: true,
    canProcessPayroll: true,
    canManageUsers: true,
    canManageRoles: true,
  },
  admin: {
    // View permissions
    canViewAllEmployees: true,
    canViewAllPayroll: true,
    canViewAllLoans: true,
    canViewAllCompliance: true,
    canViewAllPayouts: true,
    canViewSettings: true,
    canViewReports: true,
    
    // Edit permissions
    canAddEmployee: true,
    canEditEmployee: true,
    canDeleteEmployee: true,
    canAddPayroll: true,
    canEditPayroll: true,
    canDeletePayroll: true,
    canAddLoan: true,
    canEditLoan: true,
    canDeleteLoan: true,
    canApproveLoan: true,
    canRejectLoan: true,
    canEditSettings: true,
    canExportData: true,
    canProcessPayroll: true,
    canManageUsers: false,
    canManageRoles: false,
  },
  hr: {
    // View permissions
    canViewAllEmployees: true,
    canViewAllPayroll: true,
    canViewAllLoans: true,
    canViewAllCompliance: true,
    canViewAllPayouts: true,
    canViewSettings: false,
    canViewReports: true,
    
    // Edit permissions
    canAddEmployee: true,
    canEditEmployee: true,
    canDeleteEmployee: false, // HR can't delete
    canAddPayroll: true,
    canEditPayroll: true,
    canDeletePayroll: false,
    canAddLoan: true,
    canEditLoan: true,
    canDeleteLoan: false,
    canApproveLoan: true,
    canRejectLoan: true,
    canEditSettings: false,
    canExportData: true,
    canProcessPayroll: true,
    canManageUsers: false,
    canManageRoles: false,
  },
  employee: {
    // View permissions - only own data
    canViewAllEmployees: false,
    canViewAllPayroll: false,
    canViewAllLoans: false,
    canViewAllCompliance: false,
    canViewAllPayouts: false,
    canViewSettings: false,
    canViewReports: false,
    
    // Edit permissions - none
    canAddEmployee: false,
    canEditEmployee: false,
    canDeleteEmployee: false,
    canAddPayroll: false,
    canEditPayroll: false,
    canDeletePayroll: false,
    canAddLoan: false,
    canEditLoan: false,
    canDeleteLoan: false,
    canApproveLoan: false,
    canRejectLoan: false,
    canEditSettings: false,
    canExportData: false,
    canProcessPayroll: false,
    canManageUsers: false,
    canManageRoles: false,
  },
};

// Check if user has a specific permission
export const hasPermission = (role: UserRole, permission: keyof typeof rolePermissions.superadmin): boolean => {
  return rolePermissions[role]?.[permission] ?? false;
};

// Check if user can view a page
export const canViewPage = (role: UserRole, page: string): boolean => {
  const pageAccess: Record<string, UserRole[]> = {
    dashboard: ['superadmin', 'admin', 'hr', 'employee'],
    employees: ['superadmin', 'admin', 'hr'],
    payroll: ['superadmin', 'admin', 'hr'],
    compliance: ['superadmin', 'admin', 'hr'],
    loans: ['superadmin', 'admin', 'hr'],
    payouts: ['superadmin', 'admin', 'hr'],
    settings: ['superadmin', 'admin'],
    profile: ['superadmin', 'admin', 'hr', 'employee'],
    'my-payslips': ['employee'],
    'my-loans': ['employee'],
  };

  return pageAccess[page]?.includes(role) ?? false;
};

// Get user-friendly role name
export const getRoleName = (role: UserRole): string => {
  const roleNames: Record<UserRole, string> = {
    superadmin: 'Super Administrator',
    admin: 'Administrator',
    hr: 'HR Manager',
    employee: 'Employee',
  };
  return roleNames[role] || role;
};

// Get role color for badges
export const getRoleColor = (role: UserRole): string => {
  const roleColors: Record<UserRole, string> = {
    superadmin: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    admin: '#4f46e5',
    hr: '#0ea5e9',
    employee: '#10b981',
  };
  return roleColors[role] || '#6b7280';
};

// Check if user can perform action on specific data
export const canAccessOwnData = (role: UserRole, dataOwnerId: string, currentUserId: string): boolean => {
  // Super admin, admin, and HR can access all data
  if (role === 'superadmin' || role === 'admin' || role === 'hr') {
    return true;
  }
  
  // Employees can only access their own data
  if (role === 'employee') {
    return dataOwnerId === currentUserId;
  }
  
  return false;
};
