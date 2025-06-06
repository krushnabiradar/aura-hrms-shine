
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type BillingHistory = Database['public']['Tables']['billing_history']['Row'];

export const useBillingHistory = () => {
  const { user } = useAuth();

  // Query to fetch all billing history (for system admins)
  const {
    data: billingHistory,
    isLoading: isLoadingBillingHistory,
    error: billingHistoryError
  } = useQuery({
    queryKey: ['billing-history'],
    queryFn: async () => {
      console.log('Fetching billing history...');
      const { data, error } = await supabase
        .from('billing_history')
        .select(`
          *,
          tenant:tenants(name)
        `)
        .order('billing_date', { ascending: false });

      if (error) {
        console.error('Error fetching billing history:', error);
        throw error;
      }

      console.log('Billing history fetched successfully:', data);
      return data as (BillingHistory & {
        tenant: { name: string };
      })[];
    },
    enabled: !!user && user.role === 'system_admin'
  });

  // Query to fetch billing history for a specific tenant
  const fetchTenantBilling = (tenantId: string) => {
    return useQuery({
      queryKey: ['billing-history', tenantId],
      queryFn: async () => {
        console.log('Fetching billing history for tenant:', tenantId);
        const { data, error } = await supabase
          .from('billing_history')
          .select('*')
          .eq('tenant_id', tenantId)
          .order('billing_date', { ascending: false });

        if (error) {
          console.error('Error fetching tenant billing history:', error);
          throw error;
        }

        return data as BillingHistory[];
      },
      enabled: !!tenantId
    });
  };

  return {
    billingHistory,
    isLoadingBillingHistory,
    billingHistoryError,
    fetchTenantBilling
  };
};
