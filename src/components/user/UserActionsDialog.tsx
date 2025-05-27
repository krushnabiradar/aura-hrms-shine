
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/sonner";
import { useProfiles } from "@/hooks/useProfiles";
import { useTenants } from "@/hooks/useTenants";
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type UserRole = 'system_admin' | 'tenant_admin' | 'employee';

interface UserActionsDialogProps {
  user: Profile | null;
  isOpen: boolean;
  onClose: () => void;
  action: 'edit' | 'reset-password' | 'permissions' | 'suspend' | null;
}

export const UserActionsDialog = ({ user, isOpen, onClose, action }: UserActionsDialogProps) => {
  const [editForm, setEditForm] = useState<{
    first_name: string;
    last_name: string;
    email: string;
    role: UserRole;
  }>({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    role: (user?.role as UserRole) || 'employee'
  });

  const { updateProfile, isUpdatingProfile } = useProfiles();
  const { tenants } = useTenants();

  const handleEditSubmit = () => {
    if (!user) return;

    updateProfile(
      { id: user.id, updates: editForm },
      {
        onSuccess: () => {
          toast.success("User updated successfully");
          onClose();
        },
        onError: (error: any) => {
          toast.error(error.message || "Failed to update user");
        }
      }
    );
  };

  const handleResetPassword = () => {
    if (!user) return;
    // This would typically trigger a password reset email
    toast.info("Password reset email would be sent to " + user.email);
    onClose();
  };

  const handleSuspend = () => {
    if (!user) return;
    // This would typically update user status or disable their account
    toast.info("User suspension functionality would be implemented here");
    onClose();
  };

  const getTenantName = (tenantId: string | null) => {
    if (!tenantId) return "System";
    const tenant = tenants?.find(t => t.id === tenantId);
    return tenant?.name || "Unknown";
  };

  const getDialogTitle = () => {
    if (!user) return '';
    const userName = user.first_name && user.last_name 
      ? `${user.first_name} ${user.last_name}` 
      : user.email;
    
    switch (action) {
      case 'edit': return `Edit User - ${userName}`;
      case 'reset-password': return `Reset Password - ${userName}`;
      case 'permissions': return `Permissions - ${userName}`;
      case 'suspend': return `Suspend User - ${userName}`;
      default: return userName;
    }
  };

  const getRolePermissions = (role: string) => {
    switch (role) {
      case 'system_admin':
        return ['Full System Access', 'Tenant Management', 'User Management', 'System Settings'];
      case 'tenant_admin':
        return ['Tenant Management', 'User Management', 'Employee Management', 'Reports'];
      case 'employee':
        return ['Profile Management', 'Attendance', 'Leave Requests', 'Documents'];
      default:
        return [];
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>
            {action === 'edit' && 'Update user information and role'}
            {action === 'reset-password' && 'Send password reset email to user'}
            {action === 'permissions' && 'View user permissions and access levels'}
            {action === 'suspend' && 'Suspend or activate user account'}
          </DialogDescription>
        </DialogHeader>

        {action === 'edit' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={editForm.first_name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, first_name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={editForm.last_name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, last_name: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={editForm.role} onValueChange={(value: UserRole) => setEditForm(prev => ({ ...prev, role: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system_admin">System Admin</SelectItem>
                  <SelectItem value="tenant_admin">Tenant Admin</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handleEditSubmit} disabled={isUpdatingProfile}>
                {isUpdatingProfile ? "Updating..." : "Update User"}
              </Button>
            </div>
          </div>
        )}

        {action === 'reset-password' && (
          <div className="space-y-4">
            <div className="p-4 border rounded-md bg-muted/50">
              <p className="text-sm">
                A password reset email will be sent to: <strong>{user.email}</strong>
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                The user will receive instructions to create a new password.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button onClick={handleResetPassword}>Send Reset Email</Button>
            </div>
          </div>
        )}

        {action === 'permissions' && (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="font-medium">Current Role:</span>
                <Badge variant="outline">{user.role}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium">Tenant:</span>
                <span>{getTenantName(user.tenant_id)}</span>
              </div>
              <div>
                <span className="font-medium">Permissions:</span>
                <ul className="mt-2 space-y-1">
                  {getRolePermissions(user.role).map((permission, index) => (
                    <li key={index} className="text-sm flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      {permission}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {action === 'suspend' && (
          <div className="space-y-4">
            <div className="p-4 border rounded-md bg-muted/50">
              <p className="text-sm">
                Suspending this user will prevent them from accessing the system.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                You can reactivate their account at any time.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>Cancel</Button>
              <Button variant="destructive" onClick={handleSuspend}>
                Suspend User
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
