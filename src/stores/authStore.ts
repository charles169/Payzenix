import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI, User as APIUser } from '@/services/api';

export type UserRole = 'superadmin' | 'admin' | 'hr' | 'employee';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  employeeId?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const userData = await authAPI.login(email, password);
          const user: User = {
            _id: userData._id,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            employeeId: userData.employeeId,
          };
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      logout: () => {
        authAPI.logout();
        set({ user: null, isAuthenticated: false });
      },
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'payzenix-auth',
    }
  )
);

// RBAC Permission helpers
export const permissions = {
  superadmin: {
    canManageUsers: true,
    canManageRoles: true,
    canManageCompanySettings: true,
    canManageSalaryComponents: true,
    canManagePolicies: true,
    canViewAuditLogs: true,
    canLockPayroll: true,
    canOverrideCalculations: true,
    canViewAllEmployees: true,
    canViewAllPayslips: true,
    canViewAllReports: true,
    canExportData: true,
    canDeleteAnyData: true,
    canManageAdmins: true,
    canAccessSystemSettings: true,
    canViewSystemLogs: true,
  },
  admin: {
    canManageUsers: true,
    canManageRoles: true,
    canManageCompanySettings: true,
    canManageSalaryComponents: true,
    canManagePolicies: true,
    canViewAuditLogs: true,
    canLockPayroll: true,
    canOverrideCalculations: true,
    canViewAllEmployees: true,
    canViewAllPayslips: true,
    canViewAllReports: true,
    canExportData: true,
  },
  hr: {
    canManageUsers: false,
    canManageRoles: false,
    canManageCompanySettings: false,
    canManageSalaryComponents: false,
    canManagePolicies: false,
    canViewAuditLogs: false,
    canLockPayroll: false,
    canOverrideCalculations: false,
    canViewAllEmployees: true,
    canViewAllPayslips: true,
    canViewAllReports: true,
    canExportData: true,
    canManageEmployees: true,
    canRunPayroll: true,
    canManageLoans: true,
    canProcessPayouts: true,
  },
  employee: {
    canManageUsers: false,
    canManageRoles: false,
    canManageCompanySettings: false,
    canManageSalaryComponents: false,
    canManagePolicies: false,
    canViewAuditLogs: false,
    canLockPayroll: false,
    canOverrideCalculations: false,
    canViewAllEmployees: false,
    canViewAllPayslips: false,
    canViewAllReports: false,
    canExportData: false,
    canViewOwnProfile: true,
    canViewOwnPayslips: true,
    canViewOwnLoans: true,
    canViewOwnStatutory: true,
  },
};

export const hasPermission = (role: UserRole, permission: string): boolean => {
  const rolePermissions = permissions[role] as Record<string, boolean>;
  return rolePermissions[permission] ?? false;
};

export const canAccessRoute = (role: UserRole, route: string): boolean => {
  const routePermissions: Record<string, UserRole[]> = {
    '/dashboard': ['superadmin', 'admin', 'hr', 'employee'],
    '/employees': ['superadmin', 'admin', 'hr'],
    '/employees/new': ['superadmin', 'admin', 'hr'],
    '/payroll': ['superadmin', 'admin', 'hr'],
    '/compliance': ['superadmin', 'admin', 'hr'],
    '/loans': ['superadmin', 'admin', 'hr'],
    '/payouts': ['superadmin', 'admin', 'hr'],
    '/settings': ['superadmin', 'admin'],
    '/profile': ['superadmin', 'admin', 'hr', 'employee'],
    '/my-payslips': ['employee'],
    '/my-loans': ['employee'],
  };

  const allowedRoles = routePermissions[route];
  if (!allowedRoles) return true; // Default allow if not specified
  return allowedRoles.includes(role);
};
