
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/sonner";
import { Search, Plus, Edit, Eye, UserX, UserPlus } from "lucide-react";
import { useEmployees } from "@/hooks/useEmployees";
import { useProfiles } from "@/hooks/useProfiles";
import { useAuth } from "@/context/AuthContext";
import { InvitationManager } from "@/components/invitations/InvitationManager";

export default function EmployeeManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  
  const { user } = useAuth();
  const { employees, isLoadingEmployees } = useEmployees();
  const { profiles } = useProfiles();

  // Filter employees by tenant and search term
  const tenantEmployees = employees?.filter(emp => emp.tenant_id === user?.tenant_id) || [];
  const filteredEmployees = tenantEmployees.filter(employee => {
    // Get profile info for the employee
    const profile = profiles?.find(p => p.id === employee.user_id);
    const fullName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : '';
    const email = profile?.email || '';
    
    return (
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.department || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (employee.position || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "inactive":
        return <Badge variant="destructive">Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getEmployeeProfile = (employee: any) => {
    return profiles?.find(p => p.id === employee.user_id);
  };

  const activeEmployees = tenantEmployees.filter(e => e.status === "active").length;
  const inactiveEmployees = tenantEmployees.filter(e => e.status === "inactive").length;
  const departments = new Set(tenantEmployees.map(e => e.department).filter(Boolean)).size;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Employee Management</h2>
          <p className="text-muted-foreground">Manage your organization's employees</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tenantEmployees.length}</div>
            <p className="text-xs text-muted-foreground">In your organization</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeEmployees}</div>
            <p className="text-xs text-muted-foreground">Currently working</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inactiveEmployees}</div>
            <p className="text-xs text-muted-foreground">Not active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departments}</div>
            <p className="text-xs text-muted-foreground">Active departments</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Employee Directory</CardTitle>
            <CardDescription>Search and manage all employees</CardDescription>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingEmployees ? (
              <div className="text-center py-8">Loading employees...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((employee) => {
                      const profile = getEmployeeProfile(employee);
                      const fullName = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'Unknown';
                      const email = profile?.email || 'No email';
                      
                      return (
                        <TableRow key={employee.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={profile?.avatar_url} alt={fullName} />
                                <AvatarFallback>{fullName.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{fullName}</div>
                                <div className="text-sm text-muted-foreground">{email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{employee.position || 'Not specified'}</TableCell>
                          <TableCell>{employee.department || 'Not specified'}</TableCell>
                          <TableCell>{getStatusBadge(employee.status)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedEmployee(employee)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Employee Details</DialogTitle>
                                    <DialogDescription>
                                      Detailed information about {fullName}
                                    </DialogDescription>
                                  </DialogHeader>
                                  {selectedEmployee && (
                                    <div className="space-y-4">
                                      <div className="flex items-center space-x-4">
                                        <Avatar className="h-16 w-16">
                                          <AvatarImage src={profile?.avatar_url} alt={fullName} />
                                          <AvatarFallback>{fullName.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                          <h3 className="text-lg font-semibold">{fullName}</h3>
                                          <p className="text-muted-foreground">{selectedEmployee.position || 'Position not specified'}</p>
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-sm font-medium">Email</label>
                                          <p className="text-sm">{email}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium">Department</label>
                                          <p className="text-sm">{selectedEmployee.department || 'Not specified'}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium">Employee ID</label>
                                          <p className="text-sm">{selectedEmployee.employee_id}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium">Status</label>
                                          <p className="text-sm">{selectedEmployee.status}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium">Hire Date</label>
                                          <p className="text-sm">{selectedEmployee.hire_date ? new Date(selectedEmployee.hire_date).toLocaleDateString() : 'Not specified'}</p>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium">Salary</label>
                                          <p className="text-sm">{selectedEmployee.salary ? `$${selectedEmployee.salary.toLocaleString()}` : 'Not specified'}</p>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toast.info("Edit functionality not implemented yet")}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        {searchTerm ? 'No employees found matching your search.' : 'No employees found. Start by sending invitations.'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <InvitationManager />
      </div>
    </div>
  );
}
