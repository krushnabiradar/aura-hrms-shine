
import { useState } from "react";
import { BarChart3, TrendingUp, Users, DollarSign, Calendar, Download, Filter } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-picker";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { toast } from "@/components/ui/sonner";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useTenants } from "@/hooks/useTenants";
import { useProfiles } from "@/hooks/useProfiles";
import { useSubscriptions } from "@/hooks/useSubscriptions";

const AnalyticsPage = () => {
  const [dateRange, setDateRange] = useState({ from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), to: new Date() });
  const [selectedTenant, setSelectedTenant] = useState("all");
  
  const { systemAnalytics, isLoadingAnalytics } = useAnalytics();
  const { tenants } = useTenants();
  const { profiles } = useProfiles();
  const { subscriptions } = useSubscriptions();

  // Mock data for charts (in a real app, this would come from your analytics hook)
  const userGrowthData = [
    { month: 'Jan', users: 120, revenue: 12000 },
    { month: 'Feb', users: 180, revenue: 18000 },
    { month: 'Mar', users: 240, revenue: 24000 },
    { month: 'Apr', users: 320, revenue: 32000 },
    { month: 'May', users: 450, revenue: 45000 },
    { month: 'Jun', users: 580, revenue: 58000 },
  ];

  const tenantDistributionData = [
    { name: 'Enterprise', value: 40, color: '#8884d8' },
    { name: 'Professional', value: 35, color: '#82ca9d' },
    { name: 'Starter', value: 25, color: '#ffc658' },
  ];

  const activeUsersData = [
    { day: 'Mon', active: 340 },
    { day: 'Tue', active: 380 },
    { day: 'Wed', active: 420 },
    { day: 'Thu', active: 390 },
    { day: 'Fri', active: 460 },
    { day: 'Sat', active: 320 },
    { day: 'Sun', active: 280 },
  ];

  const revenueByTenantData = tenants?.map(tenant => ({
    name: tenant.name,
    revenue: tenant.mrr || 0,
    users: profiles?.filter(p => p.tenant_id === tenant.id).length || 0
  })) || [];

  const handleExportReport = (reportType: string) => {
    toast.success(`${reportType} report exported successfully`);
  };

  // Calculate key metrics
  const totalUsers = profiles?.length || 0;
  const totalTenants = tenants?.length || 0;
  const totalRevenue = tenants?.reduce((sum, tenant) => sum + (tenant.mrr || 0), 0) || 0;
  const activeSubscriptions = subscriptions?.filter(sub => sub.status === 'active').length || 0;

  const userGrowthPercentage = 15.3; // Mock calculation
  const revenueGrowthPercentage = 12.8; // Mock calculation

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Monitor system performance and business metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedTenant} onValueChange={setSelectedTenant}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select tenant" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tenants</SelectItem>
              {tenants?.map(tenant => (
                <SelectItem key={tenant.id} value={tenant.id}>{tenant.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => handleExportReport("Analytics")}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{userGrowthPercentage}%</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tenants</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTenants}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2</span> new this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{revenueGrowthPercentage}%</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+8</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">User Analytics</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Analytics</TabsTrigger>
          <TabsTrigger value="tenants">Tenant Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Growth Trend</CardTitle>
                <CardDescription>Monthly user registration and revenue growth</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="users" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Daily Active Users</CardTitle>
                <CardDescription>Users active in the last 7 days</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={activeUsersData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="active" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subscription Distribution</CardTitle>
                <CardDescription>Breakdown of subscription plans</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={tenantDistributionData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {tenantDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue by Tenant</CardTitle>
                <CardDescription>Monthly recurring revenue by organization</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueByTenantData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Registration Timeline</CardTitle>
                <CardDescription>New user registrations over time</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Role Distribution</CardTitle>
                <CardDescription>Breakdown of user roles across the system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">System Admins</span>
                    <span className="text-sm font-medium">{profiles?.filter(p => p.role === 'system_admin').length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Tenant Admins</span>
                    <span className="text-sm font-medium">{profiles?.filter(p => p.role === 'tenant_admin').length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Employees</span>
                    <span className="text-sm font-medium">{profiles?.filter(p => p.role === 'employee').length || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Growth</CardTitle>
                <CardDescription>Monthly recurring revenue trend</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" stroke="#82ca9d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue by Plan</CardTitle>
                <CardDescription>Revenue breakdown by subscription plan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Enterprise Plans</span>
                    <span className="text-sm font-medium">${(totalRevenue * 0.6).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Professional Plans</span>
                    <span className="text-sm font-medium">${(totalRevenue * 0.3).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Starter Plans</span>
                    <span className="text-sm font-medium">${(totalRevenue * 0.1).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tenants" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tenant Performance</CardTitle>
              <CardDescription>Key metrics by tenant organization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tenants?.slice(0, 10).map(tenant => (
                  <div key={tenant.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{tenant.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {profiles?.filter(p => p.tenant_id === tenant.id).length || 0} users • {tenant.plan} plan
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${tenant.mrr || 0}/month</div>
                      <div className="text-sm text-muted-foreground">{tenant.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsPage;
