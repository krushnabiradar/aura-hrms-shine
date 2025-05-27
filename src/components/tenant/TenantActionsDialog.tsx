
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { useTenants } from "@/hooks/useTenants";
import { useBillingHistory } from "@/hooks/useBillingHistory";
import { useProfiles } from "@/hooks/useProfiles";
import type { Database } from '@/integrations/supabase/types';

type Tenant = Database['public']['Tables']['tenants']['Row'];

interface TenantActionsDialogProps {
  tenant: Tenant | null;
  isOpen: boolean;
  onClose: () => void;
  action: 'edit' | 'users' | 'billing' | 'suspend' | null;
}

export const TenantActionsDialog = ({ tenant, isOpen, onClose, action }: TenantActionsDialogProps) => {
  const [editForm, setEditForm] = useState({
    name: tenant?.name || '',
    domain: tenant?.domain || '',
    plan: tenant?.plan || 'trial',
    status: tenant?.status || 'active'
  });

  const { updateTenant, isUpdatingTenant } = useTenants();
  const { fetchTenantBilling } = useBillingHistory();
  const { profiles } = useProfiles();

  // Get billing data for the specific tenant
  const { data: tenantBilling, isLoading: isLoadingBilling } = tenant 
    ? fetchTenantBilling(tenant.id) 
    : { data: [], isLoading: false };

  // Get users for the specific tenant
  const tenantUsers = profiles?.filter(p => p.tenant_id === tenant?.id) || [];

  const handleEditSubmit = () => {
    if (!tenant) return;

    updateTenant(
      { id: tenant.id, updates: editForm },
      {
        onSuccess: () => {
          toast.success("Tenant updated successfully");
          onClose();
        },
        onError: (error: any) => {
          toast.error(error.message || "Failed to update tenant");
        }
      }
    );
  };

  const handleSuspend = () => {
    if (!tenant) return;

    const newStatus = tenant.status === 'active' ? 'suspended' : 'active';
    updateTenant(
      { id: tenant.id, updates: { status: newStatus } },
      {
        onSuccess: () => {
          toast.success(`Tenant ${newStatus === 'suspended' ? 'suspended' : 'activated'} successfully`);
          onClose();
        },
        onError: (error: any) => {
          toast.error(error.message || "Failed to update tenant status");
        }
      }
    );
  };

  const getDialogTitle = () => {
    if (!tenant) return '';
    switch (action) {
      case 'edit': return `Edit ${tenant.name}`;
      case 'users': return `Users - ${tenant.name}`;
      case 'billing': return `Billing History - ${tenant.name}`;
      case 'suspend': return `${tenant.status === 'active' ? 'Suspend' : 'Activate'} ${tenant.name}`;
      default: return tenant.name;
    }
  };

  if (!tenant) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>
            {action === 'edit' && 'Update tenant information and settings'}
            {action === 'users' && 'View and manage users in this tenant'}
            {action === 'billing' && 'View billing history and payment records'}
            {action === 'suspend' && `${tenant.status === 'active' ? 'Suspend' : 'Activate'} this tenant organization`}
          </DialogDescription>
        </DialogHeader>

        {action === 'edit' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Organization Name</Label>
                <Input
                  id="name"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="domain">Domain</Label>
                <Input
                  id="domain"
                  value={editForm.domain}
                  onChange={(e) => setEditForm(prev => ({ ...prev, domain: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plan">Plan</Label>
                <Select value={editForm.plan} onValueChange={(value) => setEditForm(prev => ({ ...prev, plan: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={editForm.status} onValueChange={(value) => setEditForm(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="trial">Trial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handleEditSubmit} disabled={isUpdatingTenant}>
                {isUpdatingTenant ? "Updating..." : "Update Tenant"}
              </Button>
            </div>
          </div>
        )}

        {action === 'users' && (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Total users: {tenantUsers.length}
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenantUsers.length > 0 ? (
                  tenantUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        {user.first_name && user.last_name 
                          ? `${user.first_name} ${user.last_name}` 
                          : 'Not specified'
                        }
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.role}</Badge>
                      </TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No users found for this tenant
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {action === 'billing' && (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Total billing records: {tenantBilling?.length || 0}
            </div>
            {isLoadingBilling ? (
              <div className="text-center py-4">Loading billing history...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Billing Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Method</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenantBilling && tenantBilling.length > 0 ? (
                    tenantBilling.map((bill) => (
                      <TableRow key={bill.id}>
                        <TableCell className="font-medium">{bill.invoice_id || 'N/A'}</TableCell>
                        <TableCell>${bill.amount.toLocaleString()}</TableCell>
                        <TableCell>{new Date(bill.billing_date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={bill.status === 'paid' ? 'default' : 'destructive'}>
                            {bill.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{bill.payment_method || 'N/A'}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No billing history found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        )}

        {action === 'suspend' && (
          <div className="space-y-4">
            <div className="p-4 border rounded-md bg-muted/50">
              <p className="text-sm">
                {tenant.status === 'active' 
                  ? 'Suspending this tenant will prevent all users from accessing the system.'
                  : 'Activating this tenant will restore access for all users.'
                }
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Current status: <Badge>{tenant.status}</Badge>
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button 
                variant={tenant.status === 'active' ? 'destructive' : 'default'}
                onClick={handleSuspend}
                disabled={isUpdatingTenant}
              >
                {isUpdatingTenant 
                  ? "Processing..." 
                  : tenant.status === 'active' 
                    ? "Suspend Tenant" 
                    : "Activate Tenant"
                }
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
