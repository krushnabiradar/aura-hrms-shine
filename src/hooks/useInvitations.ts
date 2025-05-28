
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

  // Function to validate invitation token
  const validateInvitation = async (token: string) => {
    try {
      console.log('Validating invitation token:', token);
      
      // Clean the token - remove any whitespace and decode if needed
      const cleanToken = token.trim();
      console.log('Cleaned token:', cleanToken);
      
      // First try using the database function
      const { data: functionResult, error: functionError } = await supabase
        .rpc('validate_invitation_token', { token_value: cleanToken });

      if (functionError) {
        console.error('Database function error:', functionError);
        // Fall back to direct query if function fails
      } else if (functionResult && functionResult.length > 0) {
        const invitation = functionResult[0];
        console.log('Function validation result:', invitation);
        
        if (invitation.is_valid) {
          return { 
            is_valid: true, 
            id: invitation.invitation_id,
            email: invitation.email,
            tenant_id: invitation.tenant_id,
            role: invitation.role
          };
        } else {
          return { is_valid: false, message: 'Invitation has expired or has already been used' };
        }
      }

      // Fallback: Direct query to invitations table
      console.log('Falling back to direct invitation query...');
      const { data: directData, error: directError } = await supabase
        .from('invitations')
        .select('*')
        .eq('token', cleanToken)
        .maybeSingle();

      if (directError) {
        console.error('Direct query error:', directError);
        return { is_valid: false, message: 'Failed to validate invitation' };
      }

      if (!directData) {
        console.log('No invitation found for token');
        return { is_valid: false, message: 'Invitation not found' };
      }

      console.log('Direct query result:', directData);

      // Check if invitation is valid
      const now = new Date();
      const expiresAt = new Date(directData.expires_at);
      const isValid = expiresAt > now && !directData.accepted_at;

      if (!isValid) {
        console.log('Invitation is not valid - expired or already accepted');
        return { is_valid: false, message: 'Invitation has expired or has already been used' };
      }

      return { 
        is_valid: true, 
        id: directData.id,
        email: directData.email,
        tenant_id: directData.tenant_id,
        role: directData.role
      };
    } catch (error) {
      console.error('Error validating invitation:', error);
      return { is_valid: false, message: 'Failed to validate invitation' };
    }
  };

  // Function to mark invitation as accepted
  const markInvitationAccepted = async (token: string) => {
    try {
      console.log('Marking invitation as accepted...');
      
      const cleanToken = token.trim();
      const currentUser = (await supabase.auth.getUser()).data.user;
      
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }
      
      // Try using the database function first
      try {
        const { data, error } = await supabase
          .rpc('accept_invitation', {
            token_value: cleanToken,
            user_id: currentUser.id,
            first_name: currentUser.user_metadata?.first_name || '',
            last_name: currentUser.user_metadata?.last_name || ''
          });

        if (error) {
          console.error('Database function error:', error);
          throw error;
        }

        console.log('Invitation accepted via function:', data);
        return data;
      } catch (functionError) {
        console.error('Function failed, trying direct update:', functionError);
        
        // Fallback: Direct update
        const { data, error } = await supabase
          .from('invitations')
          .update({ 
            accepted_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('token', cleanToken)
          .select()
          .single();

        if (error) {
          console.error('Direct update error:', error);
          throw error;
        }

        console.log('Invitation marked as accepted via direct update:', data);
        return data;
      }
    } catch (error) {
      console.error('Error in markInvitationAccepted:', error);
      throw error;
    }
  };

  return {
    invitations,
    isLoadingInvitations,
    invitationsError,
    createInvitation: createInvitationMutation.mutate,
    isCreatingInvitation: createInvitationMutation.isPending,
    validateInvitation,
    markInvitationAccepted
  };
};
