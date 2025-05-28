
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "@/components/ui/sonner";
import { Clock, Users, CheckCircle, XCircle, AlertCircle, Calendar as CalendarIcon, RefreshCw } from "lucide-react";
import { useAttendance } from "@/hooks/useAttendance";
import { useEmployees } from "@/hooks/useEmployees";
import { useProfiles } from "@/hooks/useProfiles";
import { useAuth } from "@/context/AuthContext";

export default function AttendanceManagementPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  const { user } = useAuth();
  const { attendanceRecords, isLoadingAttendance, updateAttendance } = useAttendance();
  const { employees } = useEmployees();
  const { profiles } = useProfiles();

  // Filter data by tenant
  const tenantAttendance = attendanceRecords?.filter(ar => ar.tenant_id === user?.tenant_id) || [];
  const tenantEmployees = employees?.filter(emp => emp.tenant_id === user?.tenant_id) || [];

  // Get attendance for selected date
  const selectedDateStr = selectedDate?.toISOString().split('T')[0];
  const selectedDateAttendance = tenantAttendance.filter(ar => 
    ar.date === selectedDateStr
  );

  // Get today's attendance
  const todayAttendance = tenantAttendance.filter(ar => 
    new Date(ar.date).toDateString() === new Date().toDateString()
  );

  const getEmployeeInfo = (employeeId: string) => {
    const employee = tenantEmployees.find(emp => emp.id === employeeId);
    if (!employee) return { name: 'Unknown Employee', email: '' };
    
    const profile = profiles?.find(p => p.id === employee.user_id);
    const name = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'Unknown';
    return { name: name || 'Unknown', email: profile?.email || '' };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Present</Badge>;
      case "absent":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Absent</Badge>;
      case "late":
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="h-3 w-3 mr-1" />Late</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleMarkAttendance = async (employeeId: string, status: string) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const existingRecord = todayAttendance.find(ar => ar.employee_id === employeeId);
      
      if (existingRecord) {
        await updateAttendance({
          id: existingRecord.id,
          updates: { status }
        });
      }
      
      const employeeInfo = getEmployeeInfo(employeeId);
      toast.success(`Marked ${employeeInfo.name} as ${status}`);
    } catch (error) {
      toast.error('Failed to update attendance');
    }
  };

  const totalEmployees = tenantEmployees.length;
  const presentToday = todayAttendance.filter(a => a.status === "present" || a.status === "late").length;
  const absentToday = totalEmployees - presentToday;
  const lateToday = todayAttendance.filter(a => a.status === "late").length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Attendance Management</h2>
          <p className="text-muted-foreground">Monitor and manage company-wide attendance</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
          disabled={isLoadingAttendance}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
            <p className="text-xs text-muted-foreground">Active workforce</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{presentToday}</div>
            <p className="text-xs text-muted-foreground">
              {totalEmployees > 0 ? ((presentToday/totalEmployees)*100).toFixed(1) : 0}% attendance rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent Today</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{absentToday}</div>
            <p className="text-xs text-muted-foreground">Need follow-up</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late Arrivals</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lateToday}</div>
            <p className="text-xs text-muted-foreground">Today's late check-ins</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList>
          <TabsTrigger value="daily">Daily Attendance</TabsTrigger>
          <TabsTrigger value="schedules">Work Schedules</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>
                  {selectedDate?.toDateString() === new Date().toDateString() 
                    ? "Today's Attendance" 
                    : `Attendance for ${selectedDate?.toLocaleDateString()}`}
                </CardTitle>
                <CardDescription>
                  {selectedDate?.toDateString() === new Date().toDateString() 
                    ? "Real-time attendance tracking" 
                    : "Historical attendance data"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingAttendance ? (
                  <div className="text-center py-8">Loading attendance data...</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Check In</TableHead>
                        <TableHead>Check Out</TableHead>
                        <TableHead>Hours</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedDateAttendance.length > 0 ? (
                        selectedDateAttendance.map((record) => {
                          const employeeInfo = getEmployeeInfo(record.employee_id);
                          return (
                            <TableRow key={record.id}>
                              <TableCell className="font-medium">{employeeInfo.name}</TableCell>
                              <TableCell>{record.check_in ? new Date(record.check_in).toLocaleTimeString() : '-'}</TableCell>
                              <TableCell>{record.check_out ? new Date(record.check_out).toLocaleTimeString() : '-'}</TableCell>
                              <TableCell>{record.total_hours || 0}h</TableCell>
                              <TableCell>{getStatusBadge(record.status)}</TableCell>
                              <TableCell>
                                <div className="flex space-x-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleMarkAttendance(record.employee_id, 'present')}
                                  >
                                    Present
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleMarkAttendance(record.employee_id, 'absent')}
                                  >
                                    Absent
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                            No attendance records for this date
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Calendar</CardTitle>
                <CardDescription>Select date to view attendance</CardDescription>
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

        <TabsContent value="schedules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Work Schedules</CardTitle>
              <CardDescription>Manage employee work schedules and shifts</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Shift Hours</TableHead>
                    <TableHead>Working Days</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenantEmployees.length > 0 ? (
                    tenantEmployees.slice(0, 10).map((employee) => {
                      const employeeInfo = getEmployeeInfo(employee.id);
                      return (
                        <TableRow key={employee.id}>
                          <TableCell className="font-medium">{employeeInfo.name}</TableCell>
                          <TableCell>9:00 AM - 5:00 PM</TableCell>
                          <TableCell>Mon-Fri</TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toast.info("Schedule management coming soon")}
                            >
                              Edit Schedule
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No employees found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Summary</CardTitle>
                <CardDescription>Attendance metrics for this week</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Average Attendance Rate</span>
                  <span className="font-semibold">
                    {totalEmployees > 0 ? ((presentToday/totalEmployees)*100).toFixed(1) : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Hours Logged</span>
                  <span className="font-semibold">
                    {tenantAttendance.reduce((sum, record) => sum + (record.total_hours || 0), 0)}h
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Late Arrivals</span>
                  <span className="font-semibold">{lateToday}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Records</span>
                  <span className="font-semibold">{tenantAttendance.length}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Export Reports</CardTitle>
                <CardDescription>Generate attendance reports</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full"
                  onClick={() => toast.info("Daily report export coming soon")}
                >
                  Export Daily Report
                </Button>
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => toast.info("Weekly report export coming soon")}
                >
                  Export Weekly Report
                </Button>
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => toast.info("Monthly report export coming soon")}
                >
                  Export Monthly Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
