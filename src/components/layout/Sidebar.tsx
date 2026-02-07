import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Calculator,
  FileText,
  Wallet,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight,
  User,
  Receipt,
  Landmark,
  LogOut,
  Shield,
  ShieldCheck,
} from 'lucide-react';
import { useAuthStore, canAccessRoute } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/Logo';

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
  roles: ('superadmin' | 'admin' | 'hr' | 'employee')[];
  badge?: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['superadmin', 'admin', 'hr', 'employee'] },
  { label: 'Employees', icon: Users, path: '/employees', roles: ['superadmin', 'admin', 'hr'] },
  { label: 'Payroll', icon: Calculator, path: '/payroll', roles: ['superadmin', 'admin', 'hr'] },
  { label: 'Compliance', icon: FileText, path: '/compliance', roles: ['superadmin', 'admin', 'hr'] },
  { label: 'Loans & Advances', icon: Wallet, path: '/loans', roles: ['superadmin', 'admin', 'hr'] },
  { label: 'Payouts', icon: CreditCard, path: '/payouts', roles: ['superadmin', 'admin', 'hr'] },
];

const employeeNavItems: NavItem[] = [
  { label: 'My Profile', icon: User, path: '/profile', roles: ['employee'] },
  { label: 'My Payslips', icon: Receipt, path: '/my-payslips', roles: ['employee'] },
  { label: 'My Loans', icon: Landmark, path: '/my-loans', roles: ['employee'] },
];

const adminNavItems: NavItem[] = [
  { label: 'Audit Logs', icon: ShieldCheck, path: '/audit-logs', roles: ['superadmin', 'admin'] },
  { label: 'Settings', icon: Settings, path: '/settings', roles: ['superadmin', 'admin'] },
];

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(true); // Start collapsed
  const location = useLocation();
  const { user, logout } = useAuthStore();

  if (!user) return null;

  const renderNavItem = (item: NavItem) => {
    if (!item.roles.includes(user.role)) return null;
    if (!canAccessRoute(user.role, item.path)) return null;

    const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
    const Icon = item.icon;

    return (
      <Link key={item.path} to={item.path}>
        <motion.div
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            'nav-item',
            isActive && 'nav-item-active'
          )}
        >
          <Icon className="h-5 w-5 flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="truncate"
              >
                {item.label}
              </motion.span>
            )}
          </AnimatePresence>
          {item.badge && !collapsed && (
            <span className="ml-auto text-xs bg-sidebar-primary text-sidebar-primary-foreground px-2 py-0.5 rounded-full">
              {item.badge}
            </span>
          )}
        </motion.div>
      </Link>
    );
  };

  const getRoleBadge = () => {
    switch (user.role) {
      case 'superadmin':
        return { label: 'Super Admin', color: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' };
      case 'admin':
        return { label: 'Admin', color: 'bg-primary text-primary-foreground' };
      case 'hr':
        return { label: 'HR', color: 'bg-info text-info-foreground' };
      case 'employee':
        return { label: 'Employee', color: 'bg-success text-success-foreground' };
    }
  };

  const roleBadge = getRoleBadge();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      onMouseEnter={() => setCollapsed(false)}
      onMouseLeave={() => setCollapsed(true)}
      className="fixed left-0 top-0 h-screen z-40 flex flex-col"
      style={{ background: 'var(--gradient-sidebar)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-sidebar-border">
        <div className="flex-shrink-0">
          <Logo size={40} />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h1 className="text-xl font-bold text-white tracking-tight">PayZenix</h1>
              <p className="text-xs text-sidebar-muted">Payroll & HR Suite</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center flex-shrink-0">
            <User className="h-5 w-5 text-sidebar-foreground" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <span className={cn('text-xs px-2 py-0.5 rounded-full', roleBadge.color)}>
                  {roleBadge.label}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {/* Main nav */}
        <div className="space-y-1">
          {navItems.map(renderNavItem)}
        </div>

        {/* Employee self-service */}
        {user.role === 'employee' && (
          <div className="pt-4 space-y-1">
            {!collapsed && (
              <p className="px-3 text-xs font-semibold text-sidebar-muted uppercase tracking-wider mb-2">
                Self Service
              </p>
            )}
            {employeeNavItems.map(renderNavItem)}
          </div>
        )}

        {/* Admin section */}
        {(user.role === 'superadmin' || user.role === 'admin') && (
          <div className="pt-4 space-y-1">
            {!collapsed && (
              <p className="px-3 text-xs font-semibold text-sidebar-muted uppercase tracking-wider mb-2">
                Administration
              </p>
            )}
            {adminNavItems.map(renderNavItem)}
          </div>
        )}
      </nav>

      {/* Bottom actions */}
      <div className="border-t border-sidebar-border p-3 space-y-2">
        <motion.button
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          onClick={logout}
          className="nav-item w-full text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Hover indicator - shows when collapsed */}
      {collapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-16 bg-gradient-to-b from-transparent via-white/30 to-transparent rounded-l-full"
        />
      )}
    </motion.aside>
  );
};
