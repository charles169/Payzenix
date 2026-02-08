import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster as HotToaster } from "react-hot-toast";
import toast from "react-hot-toast";

// Intercept toast.error to filter out null property errors
const originalToastError = toast.error;
toast.error = (message: any, options?: any) => {
  const messageStr = typeof message === 'string' ? message : String(message);
  
  // Suppress null/undefined property errors
  if (
    messageStr.includes('Cannot read properties of null') ||
    messageStr.includes('Cannot read properties of undefined') ||
    messageStr.includes('null is not an object') ||
    messageStr.includes('undefined is not an object')
  ) {
    console.warn('🔇 Suppressed error toast:', messageStr);
    return '';
  }
  
  // Show all other errors
  return originalToastError(message, options);
};

import { LoginPage } from "./pages/Login";
import { DashboardPage } from "./pages/Dashboard";
import { DashboardWorkingPage } from "./pages/DashboardWorking";
import { EmployeesPage } from "./pages/Employees";
import { EmployeesWorkingPage } from "./pages/EmployeesWorking";
import { PayrollPage } from "./pages/Payroll";
import { PayrollSimplePage } from "./pages/PayrollSimple";
import { CompliancePage } from "./pages/Compliance";
import { ComplianceWorkingPage } from "./pages/ComplianceWorking";
import { LoansPage } from "./pages/Loans";
import { LoansSimplePage } from "./pages/LoansSimple";
import { PayoutsPage } from "./pages/Payouts";
import { PayoutsWorkingPage } from "./pages/PayoutsWorking";
import { SettingsPage } from "./pages/Settings";
import { SettingsWorkingPage } from "./pages/SettingsWorking";
import { ProfilePage } from "./pages/Profile";
import { MyPayslipsPage } from "./pages/MyPayslips";
import { MyLoansPage } from "./pages/MyLoans";
import { AuditLogsPage } from "./pages/AuditLogs";
import NotFound from "./pages/NotFound";
import { TestPage } from "./pages/TestPage";
import { EmployeesSimplePage } from "./pages/EmployeesSimple";

import { AppLayout } from "./components/layout/AppLayout";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { useAuthStore } from "./stores/authStore";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} />

      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardWorkingPage />
        </ProtectedRoute>
      } />

      <Route path="/employees" element={
        <ProtectedRoute allowedRoles={["superadmin", "admin", "hr"]}>
          <EmployeesWorkingPage />
        </ProtectedRoute>
      } />

      <Route path="/payroll" element={
        <ProtectedRoute allowedRoles={["superadmin", "admin", "hr"]}>
          <PayrollSimplePage />
        </ProtectedRoute>
      } />

      <Route path="/compliance" element={
        <ProtectedRoute allowedRoles={["superadmin", "admin", "hr"]}>
          <ComplianceWorkingPage />
        </ProtectedRoute>
      } />

      <Route path="/loans" element={
        <ProtectedRoute allowedRoles={["superadmin", "admin", "hr"]}>
          <LoansSimplePage />
        </ProtectedRoute>
      } />

      <Route path="/payouts" element={
        <ProtectedRoute allowedRoles={["superadmin", "admin", "hr"]}>
          <PayoutsWorkingPage />
        </ProtectedRoute>
      } />

      <Route path="/settings" element={
        <ProtectedRoute allowedRoles={["superadmin", "admin"]}>
          <SettingsWorkingPage />
        </ProtectedRoute>
      } />

      <Route path="/profile" element={
        <ProtectedRoute>
          <AppLayout><ProfilePage /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/my-payslips" element={
        <ProtectedRoute allowedRoles={["employee"]}>
          <AppLayout><MyPayslipsPage /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/my-loans" element={
        <ProtectedRoute allowedRoles={["employee"]}>
          <AppLayout><MyLoansPage /></AppLayout>
        </ProtectedRoute>
      } />

      <Route path="/audit-logs" element={
        <ProtectedRoute allowedRoles={["superadmin", "admin"]}>
          <AuditLogsPage />
        </ProtectedRoute>
      } />

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/test" element={<TestPage />} />
      <Route path="/employees-simple" element={<EmployeesSimplePage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HotToaster 
        position="top-right"
        toastOptions={{
          // Success toasts - show prominently
          success: {
            duration: 4000,
            style: {
              background: '#10b981',
              color: 'white',
              fontWeight: '500',
              padding: '16px',
              borderRadius: '8px',
            },
          },
          // Loading toasts - show until dismissed
          loading: {
            duration: Infinity,
            style: {
              background: '#3b82f6',
              color: 'white',
              fontWeight: '500',
              padding: '16px',
              borderRadius: '8px',
            },
          },
          // Error toasts - show for 3 seconds
          error: {
            duration: 3000,
            style: {
              background: '#ef4444',
              color: 'white',
              fontWeight: '500',
              padding: '16px',
              borderRadius: '8px',
            },
          },
        }}
      />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
