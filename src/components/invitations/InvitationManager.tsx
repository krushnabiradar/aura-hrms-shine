
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useInvitations } from '@/hooks/useInvitations';
import { useTenants } from '@/hooks/useTenants';
import { useAuth, UserRole } from '@/context/AuthContext';
import { Loader2, Mail, Users, Clock } from 'lucide-react';
import { format } from 'date-fns';

export const InvitationManager = () => {
  const { user } = useAuth();
  const { invitations, isLoadingInvitations, createInvitation, isCreatingInvitation } = useInvitations();
  const { tenants, currentTenant } = useTenants();
  
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('employee');
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !role) {
      setError('Please fill in all required fields');
      return;
    }

    // For tenant admins, use their tenant. For system admins, require tenant selection
    const tenantId = user?.role === 'system_admin' ? selectedTenantId : currentTenant?.id;
    
    if (!tenantId) {
      setError('Please select a tenant');
      return;
    }

    try {
      await createInvitation({
        email,
        role,
        tenant_id: tenantId
      });
      
      setSuccess(`Invitation sent to ${email}`);
      setEmail('');
      setRole('employee');
      setSelectedTenantId('');
    } catch (err: any) {
      setError(err.message || 'Failed to create invitation');
    }
  };

  const getStatusBadge = (invitation: any) => {
    if (invitation.accepted_at) {
      return <Badge variant="default">Accepted</Badge>;
    }
    
    const isExpired = new Date(invitation.expires_at) < new Date();
    if (isExpired) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    
    return <Badge variant="secondary">Pending</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Invitation
          </CardTitle>
          <CardDescription>
            Invite new users to join your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                disabled={isCreatingInvitation}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="tenant_admin">HR Admin</SelectItem>
                  {user?.role === 'system_admin' && (
                    <SelectItem value="system_admin">System Admin</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {user?.role === 'system_admin' && (
              <div className="space-y-2">
                <Label htmlFor="tenant">Organization</Label>
                <Select value={selectedTenantId} onValueChange={setSelectedTenantId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an organization" />
                  </SelectTrigger>
                  <SelectContent>
                    {tenants?.map((tenant) => (
                      <SelectItem key={tenant.id} value={tenant.id}>
                        {tenant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={isCreatingInvitation} className="w-full">
              {isCreatingInvitation ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Invitation...
                </>
              ) : (
                'Send Invitation'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Pending Invitations
          </CardTitle>
          <CardDescription>
            Manage sent invitations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingInvitations ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : invitations && invitations.length > 0 ? (
            <div className="space-y-4">
              {invitations.map((invitation) => (
                <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">{invitation.email}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Role: {invitation.role}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Expires: {format(new Date(invitation.expires_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                  {getStatusBadge(invitation)}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No invitations sent yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
