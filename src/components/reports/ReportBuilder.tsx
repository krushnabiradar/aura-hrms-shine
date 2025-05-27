
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, BarChart3, TrendingUp, Users, Building } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Badge } from "@/components/ui/badge";

export const ReportBuilder = () => {
  const [dateRange, setDateRange] = useState<{from: Date, to: Date}>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date()
  });
  const [reportType, setReportType] = useState("overview");

  const { systemAnalytics, isLoadingAnalytics, analyticsData, isLoadingAnalyticsData } = useAnalytics();

  const handleGenerateReport = () => {
    console.log('Generating report:', { reportType, dateRange });
  };

  const handleExportReport = () => {
    console.log('Exporting report:', { reportType, dateRange });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics & Reports</h2>
          <p className="text-muted-foreground">Generate insights from system data</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleGenerateReport}>
            <BarChart3 className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
          <Button variant="outline" onClick={handleExportReport}>
            Export
          </Button>
        </div>
      </div>

      {/* System Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingAnalytics ? "..." : systemAnalytics?.total_users || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              +{systemAnalytics?.new_users_this_month || 0} this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tenants</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingAnalytics ? "..." : systemAnalytics?.total_tenants || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              +{systemAnalytics?.new_tenants_this_month || 0} this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingAnalytics ? "..." : systemAnalytics?.active_subscriptions || 0}
            </div>
            <p className="text-xs text-muted-foreground">Active plans</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${isLoadingAnalytics ? "..." : Number(systemAnalytics?.total_revenue || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">All time revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Report Configuration */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Report Configuration</CardTitle>
            <CardDescription>Configure your report parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Report Type</label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">System Overview</SelectItem>
                  <SelectItem value="users">User Analytics</SelectItem>
                  <SelectItem value="tenants">Tenant Analytics</SelectItem>
                  <SelectItem value="billing">Billing Report</SelectItem>
                  <SelectItem value="usage">Usage Statistics</SelectItem>
                  <SelectItem value="security">Security Audit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !dateRange.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                        format(dateRange.from, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateRange.from}
                      onSelect={(date) => date && setDateRange(prev => ({ ...prev, from: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal",
                        !dateRange.to && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.to ? (
                        format(dateRange.to, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dateRange.to}
                      onSelect={(date) => date && setDateRange(prev => ({ ...prev, to: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Analytics Data</CardTitle>
            <CardDescription>Latest system metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {isLoadingAnalyticsData ? (
                <div className="text-center text-muted-foreground">Loading analytics data...</div>
              ) : analyticsData && analyticsData.length > 0 ? (
                analyticsData.slice(0, 5).map((metric) => (
                  <div key={metric.id} className="flex justify-between items-center">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{metric.metric_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(metric.recorded_at).toLocaleDateString()}
                      </span>
                    </div>
                    <Badge variant="outline">
                      {metric.metric_value ? Number(metric.metric_value).toLocaleString() : 'N/A'}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground">No analytics data available</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Report Preview</CardTitle>
          <CardDescription>Preview of your selected report configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Report visualization will appear here based on your configuration
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
