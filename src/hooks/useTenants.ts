
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type Tenant = Database['public']['Tables']['tenants']['Row'];
type TenantInsert = Database['public']['Tables']['tenants']['Insert'];
type TenantUpdate = Database['public']['Tables']['tenants']['Update'];

export const useTenants = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Query to fetch all tenants (for system admins)
  const {
    data: tenants,
    isLoading: isLoadingTenants,
    error: tenantsError
  } = useQuery({
    queryKey: ['tenants'],
    queryFn: async () => {
      console.log('Fetching all tenants...');
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tenants:', error);
        throw error;
      }

      console.log('Tenants fetched successfully:', data);
      return data as Tenant[];
    },
    enabled: !!user && user.role === 'system_admin'
  });

  // Query to fetch current user's tenant
  const {
    data: currentTenant,
    isLoading: isLoadingCurrentTenant,
    error: currentTenantError
  } = useQuery({
    queryKey: ['tenant', user?.tenant_id],
    queryFn: async () => {
      if (!user?.tenant_id) return null;
      
      console.log('Fetching current tenant...');
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', user.tenant_id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching current tenant:', error);
        throw error;
      }

      console.log('Current tenant fetched successfully:', data);
      return data as Tenant | null;
    },
    enabled: !!user?.tenant_id
  });

  // Mutation to create new tenant
  const createTenantMutation = useMutation({
    mutationFn: async (tenantData: TenantInsert) => {
      console.log('Creating new tenant:', tenantData);
      const { data, error } = await supabase
        .from('tenants')
        .insert(tenantData)
        .select()
        .single();

      if (error) {
        console.error('Error creating tenant:', error);
        throw error;
      }

      console.log('Tenant created successfully:', data);
      return data as Tenant;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
    }
  });

  // Mutation to update tenant
  const updateTenantMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: TenantUpdate }) => {
      console.log('Updating tenant:', id, updates);
      const { data, error } = await supabase
        .from('tenants')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating tenant:', error);
        throw error;
      }

      console.log('Tenant updated successfully:', data);
      return data as Tenant;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      queryClient.invalidateQueries({ queryKey: ['tenant', data.id] });
    }
  });

  return {
    tenants,
    isLoadingTenants,
    tenantsError,
    currentTenant,
    isLoadingCurrentTenant,
    currentTenantError,
    createTenant: createTenantMutation.mutate,
    isCreatingTenant: createTenantMutation.isPending,
    updateTenant: updateTenantMutation.mutate,
    isUpdatingTenant: updateTenantMutation.isPending
  };
};
