
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Users,
  Calendar,
  DollarSign,
  Briefcase,
  BarChart3,
  Clock,
  UserCheck,
  FileText
} from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { TenantAdminSidebar } from "@/components/sidebars/TenantAdminSidebar";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/sonner";

// Import the new pages
import EmployeeManagementPage from "./EmployeeManagementPage";
import AttendanceManagementPage from "./AttendanceManagementPage";
import LeaveAdministrationPage from "./LeaveAdministrationPage";
import PayrollProcessingPage from "./PayrollProcessingPage";

// Import hooks for real data
import { useEmployees } from "@/hooks/useEmployees";
import { useLeaveRequests } from "@/hooks/useLeaveRequests";
import { useAttendance } from "@/hooks/useAttendance";
import { useInvitations } from "@/hooks/useInvitations";
import { useAuth } from "@/context/AuthContext";
import { InvitationManager } from "@/components/invitations/InvitationManager";

const TenantAdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { pathname } = useLocation();
  const { user } = useAuth();
  
  // Use real data hooks
  const { employees, isLoadingEmployees, createEmployee } = useEmployees();
  const { leaveRequests, isLoadingLeaveRequests } = useLeaveRequests();
  const { attendanceRecords, isLoadingAttendance } = useAttendance();
  const { invitations, isLoadingInvitations } = useInvitations();
  
  // Simulating data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleAddEmployee = () => {
    toast.info("Use the Employee Management page to add new employees or send invitations");
  };

  // Calculate statistics from real data - filter by tenant
  const tenantEmployees = employees?.filter(emp => emp.tenant_id === user?.tenant_id) || [];
  const tenantLeaveRequests = leaveRequests?.filter(lr => lr.tenant_id === user?.tenant_id) || [];
  const tenantAttendance = attendanceRecords?.filter(ar => ar.tenant_id === user?.tenant_id) || [];
  const tenantInvitations = invitations?.filter(inv => inv.tenant_id === user?.tenant_id) || [];

  const totalEmployees = tenantEmployees.length;
  const pendingLeaveRequests = tenantLeaveRequests.filter(lr => lr.status === 'pending').length;
  const todayAttendance = tenantAttendance.filter(ar => 
    new Date(ar.date).toDateString() === new Date().toDateString()
  ).length;
  const pendingInvitations = tenantInvitations.filter(i => !i.accepted_at).length;

  // Get recent employees (last 5)
  const recentEmployees = tenantEmployees.slice(-5);
  
  // Get pending requests for approval
  const pendingRequests = tenantLeaveRequests.filter(lr => lr.status === 'pending').slice(0, 3);

  // Route to appropriate page based on pathname
  const renderPage = () => {
    switch (pathname) {
      case "/tenant-admin/employees":
        return <EmployeeManagementPage />;
      case "/tenant-admin/attendance":
        return <AttendanceManagementPage />;
      case "/tenant-admin/leave":
        return <LeaveAdministrationPage />;
      case "/tenant-admin/payroll":
        return <PayrollProcessingPage />;
      case "/tenant-admin/recruitment":
        return <div className="p-8 text-center text-muted-foreground">Recruitment module coming soon...</div>;
      case "/tenant-admin/reports":
        return <div className="p-8 text-center text-muted-foreground">Reports module coming soon...</div>;
      case "/tenant-admin/documents":
        return <div className="p-8 text-center text-muted-foreground">Documents module coming soon...</div>;
      case "/tenant-admin/settings":
        return <div className="p-8 text-center text-muted-foreground">Settings module coming soon...</div>;
      case "/tenant-admin/help":
        return <div className="p-8 text-center text-muted-foreground">Help & Support module coming soon...</div>;
      default:
        // Default dashboard view
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">HR Dashboard</h2>
              <p className="text-muted-foreground">Manage your organization's human resources.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <DashboardCard
                title="Total Employees"
                value={isLoadingEmployees ? "Loading..." : totalEmployees.toString()}
                icon={Users}
                trend={totalEmployees > 0 ? 3.2 : 0}
                trendLabel="employees in your organization"
              />
              <DashboardCard
                title="Leave Requests"
                value={isLoadingLeaveRequests ? "Loading..." : pendingLeaveRequests.toString()}
                icon={Calendar}
                trend={pendingLeaveRequests > 0 ? -2.5 : 0}
                trendLabel="pending approval"
              />
              <DashboardCard
                title="Today's Attendance"
                value={isLoadingAttendance ? "Loading..." : `${todayAttendance}/${totalEmployees}`}
                icon={UserCheck}
                description="Present today"
              />
              <DashboardCard
                title="Pending Invitations"
                value={isLoadingInvitations ? "Loading..." : pendingInvitations.toString()}
                icon={Briefcase}
                description="Awaiting acceptance"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Recently Added Employees</CardTitle>
                    <CardDescription>
                      New employees in your organization.
                    </CardDescription>
                  </div>
                  <Button onClick={handleAddEmployee}>Add Employee</Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee ID</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingEmployees ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center">
                            Loading employee data...
                          </TableCell>
                        </TableRow>
                      ) : recentEmployees.length > 0 ? (
                        recentEmployees.map((employee) => (
                          <TableRow key={employee.id}>
                            <TableCell className="font-medium">{employee.employee_id}</TableCell>
                            <TableCell>{employee.position || 'Not specified'}</TableCell>
                            <TableCell>{employee.department || 'Not specified'}</TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                employee.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}>
                                {employee.status}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">
                            No employees found. Start by sending invitations to your team.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pending Approvals</CardTitle>
                  <CardDescription>
                    Requests waiting for your review
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingLeaveRequests ? (
                    <div className="text-center py-4">Loading requests...</div>
                  ) : pendingRequests.length > 0 ? (
                    <div className="space-y-4">
                      {pendingRequests.map((request) => (
                        <div key={request.id} className="flex items-start justify-between p-3 border rounded-md">
                          <div>
                            <h4 className="font-medium">{request.leave_type} Request</h4>
                            <p className="text-sm text-muted-foreground">{request.days_requested} days</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toast.info(`Viewing leave request details`)}
                          >
                            Review
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No pending requests
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Attendance Overview</CardTitle>
                  <CardDescription>Daily attendance statistics</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <UserCheck className="h-16 w-16" />
                    <p>Attendance chart will appear here</p>
                    {!isLoadingAttendance && (
                      <p className="text-sm">Total records: {tenantAttendance.length}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <InvitationManager />
            </div>
          </div>
        );
    }
  };

  return (
    <DashboardLayout sidebar={<TenantAdminSidebar />}>
      {renderPage()}
    </DashboardLayout>
  );
};

export default TenantAdminDashboard;
