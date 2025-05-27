
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type SecuritySetting = Database['public']['Tables']['security_settings']['Row'];
type SecuritySettingUpdate = Database['public']['Tables']['security_settings']['Update'];

export const useSecuritySettings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Query to fetch security settings
  const {
    data: settings,
    isLoading: isLoadingSettings,
    error: settingsError
  } = useQuery({
    queryKey: ['security-settings'],
    queryFn: async () => {
      console.log('Fetching security settings...');
      const { data, error } = await supabase
        .from('security_settings')
        .select('*')
        .order('category', { ascending: true });

      if (error) {
        console.error('Error fetching security settings:', error);
        throw error;
      }

      console.log('Security settings fetched successfully:', data);
      return data as SecuritySetting[];
    },
    enabled: !!user && user.role === 'system_admin'
  });

  // Mutation to update security setting
  const updateSettingMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: SecuritySettingUpdate }) => {
      console.log('Updating security setting:', id, updates);
      const { data, error } = await supabase
        .from('security_settings')
        .update({
          ...updates,
          updated_by: user?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating security setting:', error);
        throw error;
      }

      console.log('Security setting updated successfully:', data);
      return data as SecuritySetting;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-settings'] });
    }
  });

  return {
    settings,
    isLoadingSettings,
    settingsError,
    updateSetting: updateSettingMutation.mutate,
    isUpdatingSetting: updateSettingMutation.isPending
  };
};
