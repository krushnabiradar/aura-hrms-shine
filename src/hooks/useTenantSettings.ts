
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type TenantSetting = Database['public']['Tables']['tenant_settings']['Row'];
type TenantSettingInsert = Database['public']['Tables']['tenant_settings']['Insert'];
type TenantSettingUpdate = Database['public']['Tables']['tenant_settings']['Update'];

export const useTenantSettings = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Tenant Settings
  const {
    data: tenantSettings,
    isLoading: isLoadingTenantSettings,
    error: tenantSettingsError
  } = useQuery({
    queryKey: ['tenant-settings'],
    queryFn: async () => {
      console.log('Fetching tenant settings...');
      const { data, error } = await supabase
        .from('tenant_settings')
        .select('*')
        .order('setting_category', { ascending: true });

      if (error) {
        console.error('Error fetching tenant settings:', error);
        throw error;
      }

      console.log('Tenant settings fetched successfully:', data);
      return data as TenantSetting[];
    },
    enabled: !!user && (user.role === 'system_admin' || user.role === 'tenant_admin')
  });

  // Create or update setting mutation
  const upsertSettingMutation = useMutation({
    mutationFn: async (settingData: Omit<TenantSettingInsert, 'tenant_id' | 'updated_by'>) => {
      console.log('Upserting tenant setting:', settingData);
      
      const { data, error } = await supabase
        .from('tenant_settings')
        .upsert({
          ...settingData,
          tenant_id: user!.tenant_id!,
          updated_by: user!.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error upserting tenant setting:', error);
        throw error;
      }

      console.log('Tenant setting upserted successfully:', data);
      return data as TenantSetting;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant-settings'] });
    }
  });

  // Get setting by category and key
  const getSetting = (category: string, key: string) => {
    return tenantSettings?.find(
      setting => setting.setting_category === category && setting.setting_key === key
    );
  };

  // Get settings by category
  const getSettingsByCategory = (category: string) => {
    return tenantSettings?.filter(setting => setting.setting_category === category) || [];
  };

  return {
    tenantSettings,
    isLoadingTenantSettings,
    tenantSettingsError,
    upsertSetting: upsertSettingMutation.mutate,
    isUpsertingSetting: upsertSettingMutation.isPending,
    getSetting,
    getSettingsByCategory
  };
};
