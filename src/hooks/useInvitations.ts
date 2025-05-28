
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type Invitation = Database['public']['Tables']['invitations']['Row'];
type InvitationInsert = Database['public']['Tables']['invitations']['Insert'];

export const useInvitations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Query to fetch invitations based on user role
  const {
    data: invitations,
    isLoading: isLoadingInvitations,
    error: invitationsError
  } = useQuery({
    queryKey: ['invitations'],
    queryFn: async () => {
      console.log('Fetching invitations...');
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching invitations:', error);
        throw error;
      }

      console.log('Invitations fetched successfully:', data);
      return data as Invitation[];
    },
    enabled: !!user && (user.role === 'system_admin' || user.role === 'tenant_admin')
  });

  // Mutation to create invitation
  const createInvitationMutation = useMutation({
    mutationFn: async (invitationData: Omit<InvitationInsert, 'token' | 'invited_by'>) => {
      console.log('Creating invitation:', invitationData);
      
      // Generate token using database function
      const { data: tokenData, error: tokenError } = await supabase
        .rpc('generate_invitation_token');
      
      if (tokenError) {
        console.error('Error generating token:', tokenError);
        throw tokenError;
      }

      const { data, error } = await supabase
        .from('invitations')
        .insert({
          ...invitationData,
          token: tokenData,
          invited_by: user!.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating invitation:', error);
        throw error;
      }

      console.log('Invitation created successfully:', data);
      
      // Send invitation email
      try {
        // Get tenant and inviter information
        const { data: tenantData } = await supabase
          .from('tenants')
          .select('name')
          .eq('id', invitationData.tenant_id)
          .single();

        const inviterName = user?.first_name && user?.last_name 
          ? `${user.first_name} ${user.last_name}`
          : user?.email || 'Administrator';

        await supabase.functions.invoke('send-invitation-email', {
          body: {
            email: data.email,
            token: data.token,
            role: data.role,
            tenantName: tenantData?.name || 'Your Organization',
            inviterName: inviterName,
          },
        });

        console.log('Invitation email sent successfully');
      } catch (emailError) {
        console.error('Failed to send invitation email:', emailError);
        // Don't throw error here - invitation was created successfully
        // Just log the email sending failure
      }

      return data as Invitation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
    }
  });

  // Function to validate invitation token using the database function
  const validateInvitation = async (token: string) => {
    try {
      console.log('Validating invitation token using database function:', token);
      
      // Use the existing database function that bypasses RLS
      const { data, error } = await supabase
        .rpc('validate_invitation_token', { token_value: token });

      if (error) {
        console.error('Error validating invitation:', error);
        return { is_valid: false, message: 'Failed to validate invitation' };
      }

      console.log('Database function result:', data);

      if (!data || data.length === 0) {
        console.log('No invitation found for token');
        return { is_valid: false, message: 'Invitation not found or has expired' };
      }

      const invitation = data[0];
      
      if (!invitation.is_valid) {
        console.log('Invitation is not valid');
        return { is_valid: false, message: 'Invitation has expired or has already been used' };
      }

      console.log('Invitation is valid:', invitation);
      return { 
        is_valid: true, 
        id: invitation.invitation_id,
        email: invitation.email,
        tenant_id: invitation.tenant_id,
        role: invitation.role
      };
    } catch (error) {
      console.error('Error validating invitation:', error);
      return { is_valid: false, message: 'Failed to validate invitation' };
    }
  };

  // Function to accept invitation during signup
  const acceptInvitation = async (token: string, firstName: string, lastName: string) => {
    console.log('Accepting invitation...');
    const { data: { user: authUser } } = await supabase.auth.getUser();
    
    if (!authUser) {
      throw new Error('User must be authenticated to accept invitation');
    }

    const { data, error } = await supabase
      .rpc('accept_invitation', {
        token_value: token,
        user_id: authUser.id,
        first_name: firstName,
        last_name: lastName
      });

    if (error) {
      console.error('Error accepting invitation:', error);
      throw error;
    }

    console.log('Invitation accepted successfully:', data);
    return data;
  };

  return {
    invitations,
    isLoadingInvitations,
    invitationsError,
    createInvitation: createInvitationMutation.mutate,
    isCreatingInvitation: createInvitationMutation.isPending,
    validateInvitation,
    acceptInvitation
  };
};
