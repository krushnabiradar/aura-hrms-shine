
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";
import { 
  BarChart3, 
  FileText, 
  Download, 
  Plus, 
  Search, 
  Calendar,
  Users,
  Clock,
  DollarSign,
  TrendingUp
} from "lucide-react";
import { useReports } from "@/hooks/useReports";

export default function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [reportParameters, setReportParameters] = useState({
    templateId: "",
    startDate: "",
    endDate: "",
    format: "pdf"
  });

  const {
    reportTemplates,
    isLoadingReportTemplates,
    generatedReports,
    isLoadingGeneratedReports,
    generateReport,
    isGeneratingReport
  } = useReports();

  const handleGenerateReport = async () => {
    if (!reportParameters.templateId) {
      toast.error('Please select a report template');
      return;
    }

    try {
      const template = reportTemplates?.find(t => t.id === reportParameters.templateId);
      await generateReport({
        template_id: reportParameters.templateId,
        name: `${template?.name} - ${new Date().toLocaleDateString()}`,
        parameters: {
          start_date: reportParameters.startDate,
          end_date: reportParameters.endDate,
          format: reportParameters.format
        }
      });

      toast.success('Report generation started!');
      setReportParameters({
        templateId: "",
        startDate: "",
        endDate: "",
        format: "pdf"
      });
    } catch (error) {
      toast.error('Failed to generate report');
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      generating: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800"
    };
    
    return (
      <Badge variant="secondary" className={colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredReports = generatedReports?.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || report.report_templates?.report_type === selectedType;
    return matchesSearch && matchesType;
  }) || [];

  const filteredTemplates = reportTemplates?.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || template.report_type === selectedType;
    return matchesSearch && matchesType;
  }) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
          <p className="text-muted-foreground">Generate and manage business reports</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Report Templates</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportTemplates?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Available templates</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Generated Reports</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{generatedReports?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Total generated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {generatedReports?.filter(report => 
                new Date(report.generated_at).getMonth() === new Date().getMonth()
              ).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Reports generated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {generatedReports?.filter(report => report.status === 'completed').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Ready for download</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="generate" className="space-y-4">
        <TabsList>
          <TabsTrigger value="generate">Generate Report</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="history">Report History</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate New Report</CardTitle>
              <CardDescription>Create a new report from available templates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="template">Report Template</Label>
                  <Select
                    value={reportParameters.templateId}
                    onValueChange={(value) => setReportParameters({...reportParameters, templateId: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {reportTemplates?.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={reportParameters.startDate}
                      onChange={(e) => setReportParameters({...reportParameters, startDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={reportParameters.endDate}
                      onChange={(e) => setReportParameters({...reportParameters, endDate: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="format">Format</Label>
                  <Select
                    value={reportParameters.format}
                    onValueChange={(value) => setReportParameters({...reportParameters, format: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleGenerateReport}
                  disabled={isGeneratingReport}
                  className="w-full"
                >
                  {isGeneratingReport ? 'Generating...' : 'Generate Report'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Reports */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Reports</CardTitle>
              <CardDescription>Generate common reports with pre-configured settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-blue-500" />
                      <CardTitle className="text-base">Attendance Summary</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">Current month attendance overview</p>
                    <Button size="sm" variant="outline" className="w-full">
                      Generate Now
                    </Button>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5 text-green-500" />
                      <CardTitle className="text-base">Payroll Report</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">Latest payroll processing summary</p>
                    <Button size="sm" variant="outline" className="w-full">
                      Generate Now
                    </Button>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-purple-500" />
                      <CardTitle className="text-base">Employee Report</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">Employee demographics and statistics</p>
                    <Button size="sm" variant="outline" className="w-full">
                      Generate Now
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Report Templates</CardTitle>
                  <CardDescription>Manage available report templates</CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="attendance">Attendance</SelectItem>
                    <SelectItem value="payroll">Payroll</SelectItem>
                    <SelectItem value="leave">Leave</SelectItem>
                    <SelectItem value="employee">Employee</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isLoadingReportTemplates ? (
                <div className="text-center py-8">Loading templates...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Template Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTemplates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell className="font-medium">{template.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {template.report_type.charAt(0).toUpperCase() + template.report_type.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{template.description}</TableCell>
                        <TableCell>{new Date(template.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Report History</CardTitle>
              <CardDescription>View and download previously generated reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search reports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="attendance">Attendance</SelectItem>
                    <SelectItem value="payroll">Payroll</SelectItem>
                    <SelectItem value="leave">Leave</SelectItem>
                    <SelectItem value="employee">Employee</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isLoadingGeneratedReports ? (
                <div className="text-center py-8">Loading reports...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Report Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Generated</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">{report.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {report.report_templates?.report_type?.charAt(0).toUpperCase() + 
                             report.report_templates?.report_type?.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(report.generated_at).toLocaleString()}</TableCell>
                        <TableCell>{getStatusBadge(report.status)}</TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            disabled={report.status !== 'completed'}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
