
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export const useProfiles = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Query to fetch all profiles (for system admins)
  const {
    data: profiles,
    isLoading: isLoadingProfiles,
    error: profilesError
  } = useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      console.log('Fetching all profiles...');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching profiles:', error);
        throw error;
      }

      console.log('Profiles fetched successfully:', data);
      return data as Profile[];
    },
    enabled: !!user && (user.role === 'system_admin' || user.role === 'tenant_admin')
  });

  // Query to fetch current user's profile
  const {
    data: currentProfile,
    isLoading: isLoadingCurrentProfile,
    error: currentProfileError
  } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      console.log('Fetching current profile...');
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching current profile:', error);
        throw error;
      }

      console.log('Current profile fetched successfully:', data);
      return data as Profile | null;
    },
    enabled: !!user?.id
  });

  // Mutation to update profile
  const updateProfileMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ProfileUpdate }) => {
      console.log('Updating profile:', id, updates);
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }

      console.log('Profile updated successfully:', data);
      return data as Profile;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
      queryClient.invalidateQueries({ queryKey: ['profile', data.id] });
    }
  });

  return {
    profiles,
    isLoadingProfiles,
    profilesError,
    currentProfile,
    isLoadingCurrentProfile,
    currentProfileError,
    updateProfile: updateProfileMutation.mutate,
    isUpdatingProfile: updateProfileMutation.isPending
  };
};
