import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Building, Briefcase, Users, Activity, CreditCard, Database, BarChart3 } from "lucide-react";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { SystemAdminSidebar } from "@/components/sidebars/SystemAdminSidebar";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// Import the existing pages
import TenantManagementPage from "./TenantManagementPage";
import UserManagementPage from "./UserManagementPage";
import BillingSubscriptionPage from "./BillingSubscriptionPage";
import SystemLogsPage from "./SystemLogsPage";

// Import the new pages
import SecurityManagementPage from "./SecurityManagementPage";
import AnalyticsPage from "./AnalyticsPage";
import HelpSupportPage from "./HelpSupportPage";

// Import the existing Phase 4 components
import { SystemSettings } from "@/components/settings/SystemSettings";

// Import the hooks for real data
import { useTenants } from "@/hooks/useTenants";
import { useProfiles } from "@/hooks/useProfiles";
import { useInvitations } from "@/hooks/useInvitations";
import { useSystemLogs } from "@/hooks/useSystemLogs";
import { InvitationManager } from "@/components/invitations/InvitationManager";

type TenantPlan = 'trial' | 'business' | 'enterprise';

const SystemAdminDashboard = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateTenantOpen, setIsCreateTenantOpen] = useState(false);
  const [newTenantData, setNewTenantData] = useState<{
    name: string;
    domain: string;
    plan: TenantPlan;
  }>({
    name: '',
    domain: '',
    plan: 'trial'
  });
  
  // Use real data hooks
  const { tenants, isLoadingTenants, createTenant, isCreatingTenant } = useTenants();
  const { profiles, isLoadingProfiles } = useProfiles();
  const { invitations, isLoadingInvitations } = useInvitations();
  
  // Add system logs hook
  const { logAction } = useSystemLogs();

  // Simulating data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleAddTenant = () => {
    setIsCreateTenantOpen(true);
  };

  const handleCreateTenant = async () => {
    if (!newTenantData.name.trim()) {
      toast.error("Please enter a tenant name");
      return;
    }

    try {
      await createTenant({
        name: newTenantData.name,
        domain: newTenantData.domain || null,
        plan: newTenantData.plan,
        status: 'active'
      });
      
      logAction("create_tenant", "tenants", undefined, { name: newTenantData.name });
      toast.success("Tenant created successfully");
      setIsCreateTenantOpen(false);
      setNewTenantData({ name: '', domain: '', plan: 'trial' });
    } catch (error: any) {
      toast.error(error.message || "Failed to create tenant");
    }
  };

  // Calculate statistics from real data
  const totalTenants = tenants?.length || 0;
  const totalUsers = profiles?.length || 0;
  const activeSubscriptions = tenants?.filter(t => t.status === 'active').length || 0;
  const pendingInvitations = invitations?.filter(i => !i.accepted_at).length || 0;

  // Route to appropriate page based on current path
  const renderPageContent = () => {
    switch (location.pathname) {
      case "/system-admin/tenants":
        return <TenantManagementPage />;
      case "/system-admin/users":
        return <UserManagementPage />;
      case "/system-admin/billing":
        return <BillingSubscriptionPage />;
      case "/system-admin/security":
        return <SecurityManagementPage />;
      case "/system-admin/analytics":
        return <AnalyticsPage />;
      case "/system-admin/logs":
        return <SystemLogsPage />;
      case "/system-admin/settings":
        return <SystemSettings />;
      case "/system-admin/help":
        return <HelpSupportPage />;
      default:
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">System Dashboard</h2>
              <p className="text-muted-foreground">Monitor and manage all tenants from a central location.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <DashboardCard
                title="Total Tenants"
                value={isLoadingTenants ? "Loading..." : totalTenants.toString()}
                icon={Building}
                trend={12.5}
                trendLabel="from last month"
              />
              <DashboardCard
                title="Active Subscriptions"
                value={isLoadingTenants ? "Loading..." : activeSubscriptions.toString()}
                icon={CreditCard}
                trend={8.2}
                trendLabel="from last month"
              />
              <DashboardCard
                title="Total Users"
                value={isLoadingProfiles ? "Loading..." : totalUsers.toString()}
                icon={Users}
                trend={24.5}
                trendLabel="from last month"
              />
              <DashboardCard
                title="Pending Invitations"
                value={isLoadingInvitations ? "Loading..." : pendingInvitations.toString()}
                icon={Activity}
                description="Awaiting acceptance"
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Tenant Management</CardTitle>
                    <CardDescription>
                      Manage all tenant organizations in the system.
                    </CardDescription>
                  </div>
                  <Button onClick={handleAddTenant}>Add Tenant</Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tenant</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Plan</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingTenants ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center">
                            Loading tenant data...
                          </TableCell>
                        </TableRow>
                      ) : tenants && tenants.length > 0 ? (
                        tenants.slice(0, 5).map((tenant) => (
                          <TableRow key={tenant.id}>
                            <TableCell className="font-medium">{tenant.name}</TableCell>
                            <TableCell>
                              <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                tenant.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                tenant.status === 'inactive' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              }`}>
                                {tenant.status}
                              </span>
                            </TableCell>
                            <TableCell>{tenant.plan}</TableCell>
                            <TableCell>{new Date(tenant.created_at).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" onClick={() => toast.info(`View ${tenant.name} details`)}>
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            No tenants found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <InvitationManager />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>System Usage</CardTitle>
                  <CardDescription>Resource utilization across the platform</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <BarChart3 className="h-16 w-16" />
                    <p>Usage analytics chart will appear here</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Database Status</CardTitle>
                  <CardDescription>Real-time database performance metrics</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Database className="h-16 w-16" />
                    <p>Database metrics will appear here</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <DashboardLayout sidebar={<SystemAdminSidebar />}>
      {renderPageContent()}
      
      {/* Add Tenant Dialog */}
      <Dialog open={isCreateTenantOpen} onOpenChange={setIsCreateTenantOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Tenant</DialogTitle>
            <DialogDescription>Add a new client organization to the system</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name</Label>
              <Input 
                id="name" 
                placeholder="Acme Corporation"
                value={newTenantData.name}
                onChange={(e) => setNewTenantData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="domain">Domain (Optional)</Label>
              <Input 
                id="domain" 
                placeholder="acme.com"
                value={newTenantData.domain}
                onChange={(e) => setNewTenantData(prev => ({ ...prev, domain: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan">Plan</Label>
              <select 
                className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md"
                value={newTenantData.plan}
                onChange={(e) => setNewTenantData(prev => ({ ...prev, plan: e.target.value as TenantPlan }))}
              >
                <option value="trial">Trial</option>
                <option value="business">Business</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateTenantOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateTenant} disabled={isCreatingTenant}>
                {isCreatingTenant ? "Creating..." : "Create Tenant"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default SystemAdminDashboard;
