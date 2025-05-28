
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

// Import dashboard cards
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, Calendar, DollarSign, Briefcase, BarChart3, FileText, Settings } from "lucide-react";

function TenantAdminOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Welcome to your HR administration dashboard</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">245</div>
            <p className="text-xs text-muted-foreground">+12 from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">198</div>
            <p className="text-xs text-muted-foreground">80.8% attendance rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Leaves</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Payroll</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$148.2K</div>
            <p className="text-xs text-muted-foreground">+4.2% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">3 new this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">34</div>
            <p className="text-xs text-muted-foreground">12 pending review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reports Generated</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">16</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">127</div>
            <p className="text-xs text-muted-foreground">5 uploaded today</p>
          </CardContent>
        </Card>
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
