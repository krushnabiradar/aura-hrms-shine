
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { DollarSign, Calculator, FileText, Settings, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { usePayroll } from "@/hooks/usePayroll";
import { useEmployees } from "@/hooks/useEmployees";
import { useProfiles } from "@/hooks/useProfiles";
import { useAuth } from "@/context/AuthContext";

export default function PayrollProcessingPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("January 2024");
  const { user } = useAuth();
  
  // Use real data hooks
  const { payrollRecords, isLoadingPayroll, createPayroll, updatePayroll } = usePayroll();
  const { employees } = useEmployees();
  const { profiles } = useProfiles();

  // Filter data by tenant
  const tenantPayroll = payrollRecords?.filter(pr => pr.tenant_id === user?.tenant_id) || [];
  const tenantEmployees = employees?.filter(emp => emp.tenant_id === user?.tenant_id) || [];

  const getEmployeeInfo = (employeeId: string) => {
    const employee = tenantEmployees.find(emp => emp.id === employeeId);
    if (!employee) return { name: 'Unknown Employee', email: '', salary: 0 };
    
    const profile = profiles?.find(p => p.id === employee.user_id);
    const name = profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'Unknown';
    return { 
      name: name || 'Unknown', 
      email: profile?.email || '',
      salary: employee.salary || 0
    };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "processed":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Processed</Badge>;
      case "approved":
        return <Badge className="bg-blue-100 text-blue-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case "draft":
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleGeneratePayroll = async () => {
    try {
      // Generate payroll for all employees
      const currentDate = new Date();
      const payPeriodStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const payPeriodEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      for (const employee of tenantEmployees) {
        const employeeInfo = getEmployeeInfo(employee.id);
        const monthlySalary = employeeInfo.salary / 12; // Assuming annual salary
        const grossPay = monthlySalary;
        const deductions = grossPay * 0.2; // 20% deductions
        const netPay = grossPay - deductions;

        await createPayroll({
          employee_id: employee.id,
          pay_period_start: payPeriodStart.toISOString().split('T')[0],
          pay_period_end: payPeriodEnd.toISOString().split('T')[0],
          gross_pay: grossPay,
          deductions: deductions,
          net_pay: netPay,
          status: 'draft'
        });
      }

      toast.success('Payroll generated successfully for all employees');
    } catch (error) {
      toast.error('Failed to generate payroll');
    }
  };

  const handleApprovePayroll = async (payrollId: string, employeeName: string) => {
    try {
      await updatePayroll({ 
        id: payrollId, 
        updates: { 
          status: 'approved'
        } 
      });
      toast.success(`Approved payroll for ${employeeName}`);
    } catch (error) {
      toast.error('Failed to approve payroll');
    }
  };

  const handleProcessPayroll = async (payrollId: string, employeeName: string) => {
    try {
      await updatePayroll({ 
        id: payrollId, 
        updates: { 
          status: 'processed',
          processed_at: new Date().toISOString()
        } 
      });
      toast.success(`Processed payroll for ${employeeName}`);
    } catch (error) {
      toast.error('Failed to process payroll');
    }
  };

  const totalPayroll = tenantPayroll.reduce((sum, emp) => sum + emp.net_pay, 0);
  const pendingPayroll = tenantPayroll.filter(emp => emp.status === "draft").length;
  const processedPayroll = tenantPayroll.filter(emp => emp.status === "processed").length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Payroll Processing</h2>
        <p className="text-muted-foreground">Manage salary calculations, deductions, and payroll approvals</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPayroll.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingPayroll}</div>
            <p className="text-xs text-muted-foreground">Require approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{processedPayroll}</div>
            <p className="text-xs text-muted-foreground">Completed payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Run</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28th</div>
            <p className="text-xs text-muted-foreground">Next month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="payroll" className="space-y-4">
        <TabsList>
          <TabsTrigger value="payroll">Current Payroll</TabsTrigger>
          <TabsTrigger value="structure">Salary Structure</TabsTrigger>
          <TabsTrigger value="benefits">Benefits & Deductions</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="payroll" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payroll for {selectedPeriod}</CardTitle>
              <CardDescription>Review and process employee salaries</CardDescription>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Label htmlFor="period">Pay Period:</Label>
                  <Input
                    id="period"
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="w-40"
                  />
                </div>
                <Button onClick={handleGeneratePayroll}>
                  <Calculator className="h-4 w-4 mr-2" />
                  Generate Payroll
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => toast.info("Bulk processing coming soon...")}
                >
                  Process All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingPayroll ? (
                <div className="text-center py-8">Loading payroll data...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Gross Pay</TableHead>
                      <TableHead>Deductions</TableHead>
                      <TableHead>Net Pay</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tenantPayroll.length > 0 ? (
                      tenantPayroll.map((payroll) => {
                        const employeeInfo = getEmployeeInfo(payroll.employee_id);
                        return (
                          <TableRow key={payroll.id}>
                            <TableCell className="font-medium">{employeeInfo.name}</TableCell>
                            <TableCell>${payroll.gross_pay.toLocaleString()}</TableCell>
                            <TableCell>${payroll.deductions?.toLocaleString() || '0'}</TableCell>
                            <TableCell className="font-semibold">${payroll.net_pay.toLocaleString()}</TableCell>
                            <TableCell>{getStatusBadge(payroll.status)}</TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                {payroll.status === "draft" && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleApprovePayroll(payroll.id, employeeInfo.name)}
                                  >
                                    Approve
                                  </Button>
                                )}
                                {payroll.status === "approved" && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleProcessPayroll(payroll.id, employeeInfo.name)}
                                  >
                                    Process
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => toast.info(`Viewing payslip for ${employeeInfo.name}`)}
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
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          No payroll records found. Generate payroll to get started.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="structure" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Salary Structure Configuration</CardTitle>
              <CardDescription>Define salary components and calculations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Salary structure configuration coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benefits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Benefits & Deductions</CardTitle>
              <CardDescription>Manage employee benefits and deduction policies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Benefits and deductions management coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Payroll Summary</CardTitle>
                <CardDescription>Key metrics for {selectedPeriod}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Total Gross Pay</span>
                  <span className="font-semibold">
                    ${tenantPayroll.reduce((sum, p) => sum + p.gross_pay, 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Deductions</span>
                  <span className="font-semibold">
                    ${tenantPayroll.reduce((sum, p) => sum + (p.deductions || 0), 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Net Pay</span>
                  <span className="font-semibold">${totalPayroll.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Average Salary</span>
                  <span className="font-semibold">
                    ${tenantPayroll.length > 0 ? (totalPayroll / tenantPayroll.length).toLocaleString() : '0'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Export Reports</CardTitle>
                <CardDescription>Generate payroll reports and statements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full"
                  onClick={() => toast.info("Payroll register export coming soon...")}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Export Payroll Register
                </Button>
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => toast.info("Tax report export coming soon...")}
                >
                  Export Tax Reports
                </Button>
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => toast.info("Bank transfer file coming soon...")}
                >
                  Generate Bank Transfer File
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
