
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAdvancedAnalytics } from '@/hooks/useAdvancedAnalytics';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Plus, BarChart3, TrendingUp, PieChart as PieChartIcon, Activity } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const AdvancedAnalytics = () => {
  const { toast } = useToast();
  const {
    analyticsDashboards,
    analyticsData,
    isLoadingDashboards,
    createDashboard,
    createWidget,
    isCreatingDashboard
  } = useAdvancedAnalytics();

  const [isCreateDashboardOpen, setIsCreateDashboardOpen] = useState(false);
  const [newDashboard, setNewDashboard] = useState({
    name: '',
    description: ''
  });

  const handleCreateDashboard = () => {
    if (!newDashboard.name) {
      toast({
        title: "Error",
        description: "Please enter a dashboard name",
        variant: "destructive"
      });
      return;
    }

    createDashboard(newDashboard, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Analytics dashboard created successfully"
        });
        setIsCreateDashboardOpen(false);
        setNewDashboard({ name: '', description: '' });
      }
    });
  };

  // Sample chart data
  const sampleBarData = [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 500 },
    { name: 'Apr', value: 280 },
    { name: 'May', value: 590 },
    { name: 'Jun', value: 320 }
  ];

  const sampleLineData = [
    { name: 'Week 1', employees: 240, attendance: 220 },
    { name: 'Week 2', employees: 245, attendance: 235 },
    { name: 'Week 3', employees: 250, attendance: 240 },
    { name: 'Week 4', employees: 248, attendance: 245 }
  ];

  const samplePieData = [
    { name: 'Engineering', value: 45 },
    { name: 'Sales', value: 25 },
    { name: 'Marketing', value: 15 },
    { name: 'HR', value: 10 },
    { name: 'Finance', value: 5 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Advanced Analytics</h2>
          <p className="text-muted-foreground">Create custom dashboards and analyze HR metrics</p>
        </div>
        <Dialog open={isCreateDashboardOpen} onOpenChange={setIsCreateDashboardOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Dashboard
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Analytics Dashboard</DialogTitle>
              <DialogDescription>Set up a new custom analytics dashboard</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="dashboard-name">Name</Label>
                <Input
                  id="dashboard-name"
                  value={newDashboard.name}
                  onChange={(e) => setNewDashboard({ ...newDashboard, name: e.target.value })}
                  placeholder="HR Metrics Dashboard"
                />
              </div>
              <div>
                <Label htmlFor="dashboard-description">Description</Label>
                <Textarea
                  id="dashboard-description"
                  value={newDashboard.description}
                  onChange={(e) => setNewDashboard({ ...newDashboard, description: e.target.value })}
                  placeholder="Dashboard for tracking HR KPIs and metrics"
                />
              </div>
              <Button onClick={handleCreateDashboard} disabled={isCreatingDashboard} className="w-full">
                {isCreatingDashboard ? 'Creating...' : 'Create Dashboard'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Dashboards</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsDashboards?.length || 0}</div>
                <p className="text-xs text-muted-foreground">Custom analytics dashboards</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Data Points</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData?.length || 0}</div>
                <p className="text-xs text-muted-foreground">Analytics data points collected</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Widgets</CardTitle>
                <PieChartIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analyticsDashboards?.reduce((total, dashboard) => 
                    total + (dashboard.analytics_widgets?.length || 0), 0) || 0}
                </div>
                <p className="text-xs text-muted-foreground">Visualization widgets</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Metrics Tracked</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">Different HR metrics</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Employee Attendance Trend</CardTitle>
                <CardDescription>Weekly attendance rates over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={sampleLineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="employees" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="attendance" stroke="#82ca9d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Department Distribution</CardTitle>
                <CardDescription>Employee distribution by department</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={samplePieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {samplePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Performance Metrics</CardTitle>
              <CardDescription>Key performance indicators by month</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={sampleBarData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dashboards" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {analyticsDashboards?.map((dashboard) => (
              <Card key={dashboard.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{dashboard.name}</CardTitle>
                    {dashboard.is_default && <Badge>Default</Badge>}
                  </div>
                  <CardDescription>{dashboard.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      Widgets: {dashboard.analytics_widgets?.length || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Created: {new Date(dashboard.created_at).toLocaleDateString()}
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      View Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Available Metrics</CardTitle>
                <CardDescription>Configure and track custom HR metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[
                    'Employee Turnover Rate',
                    'Average Time to Hire',
                    'Training Completion Rate',
                    'Employee Satisfaction',
                    'Attendance Rate',
                    'Performance Ratings'
                  ].map((metric) => (
                    <div key={metric} className="p-4 border rounded-lg">
                      <div className="font-medium">{metric}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Track and analyze {metric.toLowerCase()}
                      </div>
                      <Button variant="outline" size="sm" className="mt-2">
                        Configure
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Reports</CardTitle>
              <CardDescription>Generate detailed analytics reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button>Generate Monthly Report</Button>
                <Button variant="outline">Export Data</Button>
                <Button variant="outline">Schedule Report</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
