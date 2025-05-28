
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import InviteAccept from "./pages/InviteAccept";
import SystemAdminDashboard from "./pages/system-admin/SystemAdminDashboard";
import TenantAdminDashboard from "./pages/tenant-admin/TenantAdminDashboard";
import EmployeeDashboard from "./pages/ess/EmployeeDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/landing" element={<Landing />} />
              <Route path="/login" element={<Auth />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/invite-accept" element={<InviteAccept />} />
              
              {/* System Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={["system_admin"]} />}>
                <Route path="/system-admin" element={<SystemAdminDashboard />} />
                <Route path="/system-admin/tenants" element={<SystemAdminDashboard />} />
                <Route path="/system-admin/users" element={<SystemAdminDashboard />} />
                <Route path="/system-admin/billing" element={<SystemAdminDashboard />} />
                <Route path="/system-admin/security" element={<SystemAdminDashboard />} />
                <Route path="/system-admin/analytics" element={<SystemAdminDashboard />} />
                <Route path="/system-admin/logs" element={<SystemAdminDashboard />} />
                <Route path="/system-admin/settings" element={<SystemAdminDashboard />} />
                <Route path="/system-admin/help" element={<SystemAdminDashboard />} />
              </Route>
              
              {/* Tenant Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={["tenant_admin"]} />}>
                <Route path="/tenant-admin" element={<TenantAdminDashboard />} />
                <Route path="/tenant-admin/employees" element={<TenantAdminDashboard />} />
                <Route path="/tenant-admin/attendance" element={<TenantAdminDashboard />} />
                <Route path="/tenant-admin/leave" element={<TenantAdminDashboard />} />
                <Route path="/tenant-admin/payroll" element={<TenantAdminDashboard />} />
                <Route path="/tenant-admin/recruitment" element={<TenantAdminDashboard />} />
                <Route path="/tenant-admin/reports" element={<TenantAdminDashboard />} />
                <Route path="/tenant-admin/documents" element={<TenantAdminDashboard />} />
                <Route path="/tenant-admin/settings" element={<TenantAdminDashboard />} />
                <Route path="/tenant-admin/help" element={<TenantAdminDashboard />} />
              </Route>
              
              {/* Employee Self-Service Routes */}
              <Route element={<ProtectedRoute allowedRoles={["employee"]} />}>
                <Route path="/ess" element={<EmployeeDashboard />} />
                <Route path="/ess/profile" element={<EmployeeDashboard />} />
                <Route path="/ess/attendance" element={<EmployeeDashboard />} />
                <Route path="/ess/leave" element={<EmployeeDashboard />} />
                <Route path="/ess/documents" element={<EmployeeDashboard />} />
                <Route path="/ess/payslips" element={<EmployeeDashboard />} />
                <Route path="/ess/performance" element={<EmployeeDashboard />} />
                <Route path="/ess/help" element={<EmployeeDashboard />} />
                <Route path="/ess/settings" element={<EmployeeDashboard />} />
              </Route>
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
