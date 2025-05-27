import { useState } from "react";
import { Building, Users, DollarSign, TrendingUp, Plus, MoreHorizontal, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/sonner";
import { useTenants } from "@/hooks/useTenants";
import { useProfiles } from "@/hooks/useProfiles";
import { TenantActionsDialog } from "@/components/tenant/TenantActionsDialog";
import type { Database } from '@/integrations/supabase/types';

type Tenant = Database['public']['Tables']['tenants']['Row'];

const TenantManagementPage = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [newTenantName, setNewTenantName] = useState("");
  const [newTenantDomain, setNewTenantDomain] = useState("");
  
  // Tenant actions dialog state
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<'edit' | 'users' | 'billing' | 'suspend' | null>(null);

  // Use real data hooks
  const { tenants, isLoadingTenants, createTenant, isCreatingTenant } = useTenants();
  const { profiles, isLoadingProfiles } = useProfiles();

  // Calculate real statistics
  const totalTenants = tenants?.length || 0;
  const activeTenants = tenants?.filter(t => t.status === 'active').length || 0;
  const totalUsers = profiles?.length || 0;
  const totalMRR = tenants?.reduce((sum, tenant) => sum + (tenant.mrr || 0), 0) || 0;

  const filteredTenants = tenants?.filter(tenant => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (tenant.domain && tenant.domain.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === "all" || tenant.status === filterStatus;
    return matchesSearch && matchesStatus;
  }) || [];

  const handleCreateTenant = async () => {
    if (!newTenantName.trim()) {
      toast.error("Please enter a tenant name");
      return;
    }

    try {
      await createTenant({
        name: newTenantName.trim(),
        domain: newTenantDomain.trim() || null,
        plan: 'trial',
        status: 'active',
        mrr: 0
      });
      
      toast.success("Tenant created successfully");
      setIsCreateDialogOpen(false);
      setNewTenantName("");
      setNewTenantDomain("");
    } catch (error: any) {
      console.error('Tenant creation error:', error);
      toast.error(error.message || "Failed to create tenant");
    }
  };

  const handleTenantAction = (action: 'edit' | 'users' | 'billing' | 'suspend', tenant: Tenant) => {
    setSelectedTenant(tenant);
    setCurrentAction(action);
    setActionDialogOpen(true);
  };

  const closeActionDialog = () => {
    setActionDialogOpen(false);
    setSelectedTenant(null);
    setCurrentAction(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "suspended":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "trial":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "enterprise":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "business":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "professional":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "starter":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "trial":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getTenantUserCount = (tenantId: string) => {
    return profiles?.filter(p => p.tenant_id === tenantId).length || 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tenant Management</h2>
          <p className="text-muted-foreground">Manage client organizations and their configurations</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Tenant
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Tenant</DialogTitle>
              <DialogDescription>Add a new client organization to the system</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Organization Name *</Label>
                <Input 
                  id="name" 
                  placeholder="Acme Corporation"
                  value={newTenantName}
                  onChange={(e) => setNewTenantName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="domain">Domain (Optional)</Label>
                <Input 
                  id="domain" 
                  placeholder="acme.com"
                  value={newTenantDomain}
                  onChange={(e) => setNewTenantDomain(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateTenant} disabled={isCreatingTenant || !newTenantName.trim()}>
                  {isCreatingTenant ? "Creating..." : "Create Tenant"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoadingTenants ? "..." : totalTenants}</div>
            <p className="text-xs text-muted-foreground">Organizations managed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tenants</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoadingTenants ? "..." : activeTenants}</div>
            <p className="text-xs text-muted-foreground">Currently operational</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoadingProfiles ? "..." : totalUsers}</div>
            <p className="text-xs text-muted-foreground">Across all tenants</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total MRR</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalMRR.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Monthly recurring revenue</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Tenant Directory</CardTitle>
              <CardDescription>Manage tenant organizations and their settings</CardDescription>
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="trial">Trial</option>
                <option value="suspended">Suspended</option>
              </select>
              <Input
                placeholder="Search tenants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organization</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>MRR</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingTenants ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    Loading tenant data...
                  </TableCell>
                </TableRow>
              ) : filteredTenants.length > 0 ? (
                filteredTenants.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell className="font-medium">{tenant.name}</TableCell>
                    <TableCell>{tenant.domain || "Not set"}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getPlanColor(tenant.plan)}`}>
                        {tenant.plan.charAt(0).toUpperCase() + tenant.plan.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell>{getTenantUserCount(tenant.id)}</TableCell>
                    <TableCell>${tenant.mrr?.toLocaleString() || 0}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(tenant.status)}`}>
                        {tenant.status.charAt(0).toUpperCase() + tenant.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{new Date(tenant.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleTenantAction("edit", tenant)}>
                            Edit Settings
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleTenantAction("users", tenant)}>
                            View Users
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleTenantAction("billing", tenant)}>
                            Billing History
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleTenantAction("suspend", tenant)}>
                            {tenant.status === 'active' ? 'Suspend' : 'Activate'} Tenant
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    No tenants found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Tenant Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Tenant
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Tenant</DialogTitle>
            <DialogDescription>Add a new client organization to the system</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name *</Label>
              <Input 
                id="name" 
                placeholder="Acme Corporation"
                value={newTenantName}
                onChange={(e) => setNewTenantName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="domain">Domain (Optional)</Label>
              <Input 
                id="domain" 
                placeholder="acme.com"
                value={newTenantDomain}
                onChange={(e) => setNewTenantDomain(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateTenant} disabled={isCreatingTenant || !newTenantName.trim()}>
                {isCreatingTenant ? "Creating..." : "Create Tenant"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tenant Actions Dialog */}
      <TenantActionsDialog
        tenant={selectedTenant}
        isOpen={actionDialogOpen}
        onClose={closeActionDialog}
        action={currentAction}
      />
    </div>
  );
};

export default TenantManagementPage;
