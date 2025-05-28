
import { useLocation } from "react-router-dom";
import { TenantAdminSidebar } from "@/components/sidebars/TenantAdminSidebar";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

// Import existing pages
import EmployeeManagementPage from "./EmployeeManagementPage";
import AttendanceManagementPage from "./AttendanceManagementPage";
import LeaveAdministrationPage from "./LeaveAdministrationPage";
import PayrollProcessingPage from "./PayrollProcessingPage";

// Import new Phase 2 pages
import RecruitmentManagementPage from "./RecruitmentManagementPage";
import ReportsPage from "./ReportsPage";
import DocumentsManagementPage from "./DocumentsManagementPage";
import SettingsPage from "./SettingsPage";

// Import dashboard cards and hooks
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, Calendar, DollarSign, Briefcase, BarChart3, FileText } from "lucide-react";
import { useTenantDashboard } from "@/hooks/useTenantDashboard";

function TenantAdminOverview() {
  const { dashboardData, isLoading, error } = useTenantDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Welcome to your HR administration dashboard</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Welcome to your HR administration dashboard</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">Error loading dashboard data: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Welcome to your HR administration dashboard</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Total Employees"
          value={dashboardData?.totalEmployees || 0}
          description={`${dashboardData?.activeEmployees || 0} active employees`}
          icon={Users}
        />

        <DashboardCard
          title="Present Today"
          value={dashboardData?.presentToday || 0}
          description={`${dashboardData?.attendanceRate || 0}% attendance rate`}
          icon={Clock}
        />

        <DashboardCard
          title="Pending Leaves"
          value={dashboardData?.pendingLeavesCount || 0}
          description="Awaiting approval"
          icon={Calendar}
        />

        <DashboardCard
          title="Monthly Payroll"
          value={`$${(dashboardData?.monthlyPayrollTotal || 0).toLocaleString()}`}
          description="Current month total"
          icon={DollarSign}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Open Positions"
          value={dashboardData?.openJobsCount || 0}
          description="Active job postings"
          icon={Briefcase}
        />

        <DashboardCard
          title="Applications"
          value={dashboardData?.totalApplications || 0}
          description={`${dashboardData?.pendingApplications || 0} pending review`}
          icon={Users}
        />

        <DashboardCard
          title="Reports Generated"
          value="0"
          description="This month"
          icon={BarChart3}
        />

        <DashboardCard
          title="Documents"
          value={dashboardData?.documentsCount || 0}
          description="Total documents"
          icon={FileText}
        />
      </div>
    </div>
  );
}

export default function TenantAdminDashboard() {
  const { pathname } = useLocation();

  const renderContent = () => {
    switch (pathname) {
      case "/tenant-admin":
        return <TenantAdminOverview />;
      case "/tenant-admin/employees":
        return <EmployeeManagementPage />;
      case "/tenant-admin/attendance":
        return <AttendanceManagementPage />;
      case "/tenant-admin/leave":
        return <LeaveAdministrationPage />;
      case "/tenant-admin/payroll":
        return <PayrollProcessingPage />;
      case "/tenant-admin/recruitment":
        return <RecruitmentManagementPage />;
      case "/tenant-admin/reports":
        return <ReportsPage />;
      case "/tenant-admin/documents":
        return <DocumentsManagementPage />;
      case "/tenant-admin/settings":
        return <SettingsPage />;
      case "/tenant-admin/help":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Help & Support</h2>
              <p className="text-muted-foreground">Get help and support for your HR system</p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Support Center</CardTitle>
                <CardDescription>Find answers to common questions and get help</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Contact our support team for assistance with your HR management system.</p>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return <TenantAdminOverview />;
    }
  };

  return (
    <DashboardLayout sidebar={<TenantAdminSidebar />}>
      {renderContent()}
    </DashboardLayout>
  );
}
