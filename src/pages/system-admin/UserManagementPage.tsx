
import { useState } from "react";
import { Users, Plus, Shield, Mail, MoreHorizontal, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/sonner";
import { useProfiles } from "@/hooks/useProfiles";
import { useTenants } from "@/hooks/useTenants";
import { useInvitations } from "@/hooks/useInvitations";
import { UserRole } from "@/context/AuthContext";

const roles = [
  { value: "system_admin", label: "System Admin", permissions: ["Full System Access"] },
  { value: "tenant_admin", label: "Tenant Admin", permissions: ["Tenant Management", "User Management", "Billing"] },
  { value: "employee", label: "Employee", permissions: ["Basic Access", "Profile Management"] }
];

const UserManagementPage = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<UserRole>("employee");
  const [selectedTenantId, setSelectedTenantId] = useState("");

  // Use real data hooks
  const { profiles, isLoadingProfiles } = useProfiles();
  const { tenants } = useTenants();
  const { invitations, isLoadingInvitations, createInvitation, isCreatingInvitation } = useInvitations();

  // Calculate real statistics
  const totalUsers = profiles?.length || 0;
  const systemAdmins = profiles?.filter(p => p.role === 'system_admin').length || 0;
  const activeUsers = profiles?.length || 0; // All profiles are considered active
  const pendingInvitations = invitations?.filter(i => !i.accepted_at).length || 0;

  const filteredUsers = profiles?.filter(user => {
    const matchesSearch = user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  }) || [];

  const handleCreateUser = async () => {
    if (!newUserEmail || !newUserRole) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (newUserRole !== 'system_admin' && !selectedTenantId) {
      toast.error("Please select a tenant for non-system admin users");
      return;
    }

    try {
      await createInvitation({
        email: newUserEmail,
        role: newUserRole,
        tenant_id: newUserRole === 'system_admin' ? null : selectedTenantId
      });
      
      toast.success("User invitation sent successfully");
      setIsCreateDialogOpen(false);
      setNewUserEmail("");
      setNewUserRole("employee");
      setSelectedTenantId("");
    } catch (error: any) {
      toast.error(error.message || "Failed to create user invitation");
    }
  };

  const handleUserAction = (action: string, userName: string) => {
    toast.info(`${action} for ${userName} executed`);
  };

  const getStatusColor = (status: string = "Active") => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Suspended":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "system_admin":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "tenant_admin":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "employee":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "system_admin":
        return "System Admin";
      case "tenant_admin":
        return "Tenant Admin";
      case "employee":
        return "Employee";
      default:
        return role;
    }
  };

  const getTenantName = (tenantId: string | null) => {
    if (!tenantId) return "System";
    const tenant = tenants?.find(t => t.id === tenantId);
    return tenant?.name || "Unknown";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">Manage system users, roles, and permissions</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>Send an invitation to a new user with specific roles and permissions</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="john.doe@company.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">User Role</Label>
                <select 
                  className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md"
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                >
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
              </div>
              {newUserRole !== 'system_admin' && (
                <div className="space-y-2">
                  <Label htmlFor="tenant">Tenant Organization</Label>
                  <select 
                    className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md"
                    value={selectedTenantId}
                    onChange={(e) => setSelectedTenantId(e.target.value)}
                  >
                    <option value="">Select Tenant</option>
                    {tenants?.map(tenant => (
                      <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateUser} disabled={isCreatingInvitation}>
                  {isCreatingInvitation ? "Sending..." : "Send Invitation"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
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
            <CardTitle className="text-sm font-medium">System Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoadingProfiles ? "..." : systemAdmins}</div>
            <p className="text-xs text-muted-foreground">Super admin access</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoadingProfiles ? "..." : activeUsers}</div>
            <p className="text-xs text-muted-foreground">Currently registered</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invites</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoadingInvitations ? "..." : pendingInvitations}</div>
            <p className="text-xs text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>User Directory</CardTitle>
              <CardDescription>Manage system users and their access permissions</CardDescription>
            </div>
            <div className="flex gap-2">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">All Roles</option>
                <option value="system_admin">System Admin</option>
                <option value="tenant_admin">Tenant Admin</option>
                <option value="employee">Employee</option>
              </select>
              <Input
                placeholder="Search users..."
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
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingProfiles ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Loading user data...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar_url || undefined} />
                          <AvatarFallback>
                            {user.first_name?.[0] || user.email[0].toUpperCase()}
                            {user.last_name?.[0] || ""}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.email}
                          </div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getRoleColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </TableCell>
                    <TableCell>{getTenantName(user.tenant_id)}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor("Active")}`}>
                        Active
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleUserAction("Edit User", user.email)}>
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUserAction("Reset Password", user.email)}>
                            Reset Password
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUserAction("View Permissions", user.email)}>
                            View Permissions
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUserAction("Suspend User", user.email)}>
                            Suspend User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagementPage;
