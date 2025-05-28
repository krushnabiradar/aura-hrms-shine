
import { useLocation } from "react-router-dom";
import { TenantAdminSidebar } from "@/components/sidebars/TenantAdminSidebar";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

// Import existing pages
import EmployeeManagementPage from "./EmployeeManagementPage";
import AttendanceManagementPage from "./AttendanceManagementPage";
import LeaveAdministrationPage from "./LeaveAdministrationPage";
import PayrollProcessingPage from "./PayrollProcessingPage";

// Import Phase 2 pages
import RecruitmentManagementPage from "./RecruitmentManagementPage";
import ReportsPage from "./ReportsPage";
import DocumentsManagementPage from "./DocumentsManagementPage";
import SettingsPage from "./SettingsPage";

// Import Phase 3 pages
import PerformanceManagementPage from "./PerformanceManagementPage";
import AdvancedAnalyticsPage from "./AdvancedAnalyticsPage";

// Import dashboard cards
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, Calendar, DollarSign, Briefcase, BarChart3, FileText, Settings, Target, TrendingUp, Smartphone, Key, Shield } from "lucide-react";

function TenantAdminOverview() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Welcome to your advanced HR administration dashboard</p>
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
            <CardTitle className="text-sm font-medium">Performance Reviews</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
            <p className="text-xs text-muted-foreground">Due this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mobile Users</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">Active mobile sessions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">Excellent security</p>
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
      case "/tenant-admin/performance":
        return <PerformanceManagementPage />;
      case "/tenant-admin/advanced-analytics":
        return <AdvancedAnalyticsPage />;
      case "/tenant-admin/reports":
        return <ReportsPage />;
      case "/tenant-admin/documents":
        return <DocumentsManagementPage />;
      case "/tenant-admin/mobile-support":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Mobile Support</h2>
              <p className="text-muted-foreground">Manage mobile devices and push notifications</p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Mobile App Management</CardTitle>
                <CardDescription>Configure mobile app settings and push notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Mobile support features coming soon...</p>
              </CardContent>
            </Card>
          </div>
        );
      case "/tenant-admin/api-integration":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">API Integration</h2>
              <p className="text-muted-foreground">Manage API keys and third-party integrations</p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>API Management</CardTitle>
                <CardDescription>Create and manage API keys for system integrations</CardDescription>
              </CardHeader>
              <CardContent>
                <p>API integration features coming soon...</p>
              </CardContent>
            </Card>
          </div>
        );
      case "/tenant-admin/security":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Enhanced Security</h2>
              <p className="text-muted-foreground">Manage security policies and monitor incidents</p>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Security Management</CardTitle>
                <CardDescription>Configure security policies and monitor security incidents</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Enhanced security features coming soon...</p>
              </CardContent>
            </Card>
          </div>
        );
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
