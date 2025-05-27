
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
      
      // Log the attempt
      await supabase.rpc('log_system_action', {
        p_action: 'create_tenant_attempt',
        p_resource_type: 'tenants',
        p_details: { tenant_name: tenantData.name }
      });
      
      // Ensure all required fields are present with proper defaults
      const insertData: TenantInsert = {
        name: tenantData.name,
        domain: tenantData.domain || null,
        plan: tenantData.plan || 'trial',
        status: tenantData.status || 'active',
        mrr: tenantData.mrr || 0
      };
      
      const { data, error } = await supabase
        .from('tenants')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Error creating tenant:', error);
        // Log the failure
        await supabase.rpc('log_system_action', {
          p_action: 'create_tenant_failed',
          p_resource_type: 'tenants',
          p_details: { 
            tenant_name: tenantData.name, 
            error: error.message 
          },
          p_severity: 'error'
        });
        throw error;
      }

      console.log('Tenant created successfully:', data);
      
      // Log the success
      await supabase.rpc('log_system_action', {
        p_action: 'tenant_created',
        p_resource_type: 'tenant',
        p_resource_id: data.id,
        p_details: { tenant_name: data.name }
      });
      
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

  // Mutation to delete tenant
  const deleteTenantMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting tenant:', id);
      const { error } = await supabase
        .from('tenants')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting tenant:', error);
        throw error;
      }

      console.log('Tenant deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
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
    isUpdatingTenant: updateTenantMutation.isPending,
    deleteTenant: deleteTenantMutation.mutate,
    isDeletingTenant: deleteTenantMutation.isPending
  };
};
