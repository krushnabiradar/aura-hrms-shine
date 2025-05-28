
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "@/components/ui/sonner";
import { CalendarDays, Clock, CheckCircle, XCircle, AlertCircle, FileText } from "lucide-react";
import { useLeaveRequests } from "@/hooks/useLeaveRequests";
import { useEmployees } from "@/hooks/useEmployees";
import { useProfiles } from "@/hooks/useProfiles";
import { useAuth } from "@/context/AuthContext";

export default function LeaveAdministrationPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { user } = useAuth();
  
  // Use real data hooks
  const { leaveRequests, isLoadingLeaveRequests, updateLeaveRequest } = useLeaveRequests();
  const { employees } = useEmployees();
  const { profiles } = useProfiles();

  // Filter data by tenant
  const tenantLeaveRequests = leaveRequests?.filter(lr => lr.tenant_id === user?.tenant_id) || [];
  const tenantEmployees = employees?.filter(emp => emp.tenant_id === user?.tenant_id) || [];

  const getEmployeeInfo = (employeeId: string) => {
    const employee = tenantEmployees.find(emp => emp.id === employeeId);
    if (!employee) return { name: 'Unknown Employee', email: '' };
    
    const profile = profiles?.find(p => p.id === employee.user_id);
    const name = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'Unknown';
    return { name: name || 'Unknown', email: profile?.email || '' };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="h-3 w-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleApprove = async (requestId: string, employeeName: string) => {
    try {
      await updateLeaveRequest({ 
        id: requestId, 
        updates: { 
          status: 'approved',
          approved_by: user?.id,
          approved_at: new Date().toISOString()
        } 
      });
      toast.success(`Approved leave request for ${employeeName}`);
    } catch (error) {
      toast.error('Failed to approve leave request');
    }
  };

  const handleReject = async (requestId: string, employeeName: string) => {
    try {
      await updateLeaveRequest({ 
        id: requestId, 
        updates: { 
          status: 'rejected',
          approved_by: user?.id,
          approved_at: new Date().toISOString()
        } 
      });
      toast.error(`Rejected leave request for ${employeeName}`);
    } catch (error) {
      toast.error('Failed to reject leave request');
    }
  };

  const pendingRequests = tenantLeaveRequests.filter(req => req.status === "pending").length;
  const approvedThisMonth = tenantLeaveRequests.filter(req => req.status === "approved").length;
  const totalDaysRequested = tenantLeaveRequests.reduce((sum, req) => sum + req.days_requested, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Leave Administration</h2>
        <p className="text-muted-foreground">Manage leave requests, policies, and employee balances</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingRequests}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved This Month</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedThisMonth}</div>
            <p className="text-xs text-muted-foreground">Processed requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Days Requested</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDaysRequested}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilization Rate</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tenantEmployees.length > 0 ? Math.round((approvedThisMonth / tenantEmployees.length) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Average leave usage</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="requests">Leave Requests</TabsTrigger>
          <TabsTrigger value="balances">Employee Balances</TabsTrigger>
          <TabsTrigger value="policies">Leave Policies</TabsTrigger>
          <TabsTrigger value="calendar">Leave Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Leave Requests</CardTitle>
              <CardDescription>Review and approve employee leave requests</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingLeaveRequests ? (
                <div className="text-center py-8">Loading leave requests...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tenantLeaveRequests.length > 0 ? (
                      tenantLeaveRequests.map((request) => {
                        const employeeInfo = getEmployeeInfo(request.employee_id);
                        return (
                          <TableRow key={request.id}>
                            <TableCell className="font-medium">{employeeInfo.name}</TableCell>
                            <TableCell>{request.leave_type}</TableCell>
                            <TableCell>{new Date(request.start_date).toLocaleDateString()}</TableCell>
                            <TableCell>{new Date(request.end_date).toLocaleDateString()}</TableCell>
                            <TableCell>{request.days_requested}</TableCell>
                            <TableCell>{getStatusBadge(request.status)}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                {request.status === "pending" && (
                                  <>
                                    <Button
                                      size="sm"
                                      onClick={() => handleApprove(request.id, employeeInfo.name)}
                                    >
                                      Approve
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleReject(request.id, employeeInfo.name)}
                                    >
                                      Reject
                                    </Button>
                                  </>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => toast.info(`Viewing details for ${employeeInfo.name}'s request`)}
                                >
                                  View
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                          No leave requests found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balances" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Employee Leave Balances</CardTitle>
              <CardDescription>Current leave entitlements and remaining balances</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Annual Leave</TableHead>
                    <TableHead>Sick Leave</TableHead>
                    <TableHead>Personal Leave</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenantEmployees.length > 0 ? (
                    tenantEmployees.map((employee) => {
                      const employeeInfo = getEmployeeInfo(employee.id);
                      return (
                        <TableRow key={employee.id}>
                          <TableCell className="font-medium">{employeeInfo.name}</TableCell>
                          <TableCell>20 days</TableCell>
                          <TableCell>15 days</TableCell>
                          <TableCell>5 days</TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toast.info("Leave balance adjustment functionality coming soon")}
                            >
                              Adjust
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No employees found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Leave Policies</CardTitle>
              <CardDescription>Configure leave types and entitlements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Leave policies configuration coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Company Leave Calendar</CardTitle>
                <CardDescription>Overview of scheduled leaves across the organization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tenantLeaveRequests.filter(req => req.status === "approved").map((leave) => {
                    const employeeInfo = getEmployeeInfo(leave.employee_id);
                    return (
                      <div key={leave.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{employeeInfo.name}</h4>
                          <p className="text-sm text-muted-foreground">{leave.leave_type}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(leave.start_date).toLocaleDateString()} - {new Date(leave.end_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{leave.days_requested} days</p>
                          {getStatusBadge(leave.status)}
                        </div>
                      </div>
                    );
                  })}
                  {tenantLeaveRequests.filter(req => req.status === "approved").length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No approved leave requests to display
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Calendar View</CardTitle>
                <CardDescription>Select date to view details</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
