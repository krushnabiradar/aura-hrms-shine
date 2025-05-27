
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type AnalyticsData = Database['public']['Tables']['analytics_data']['Row'];

interface SystemAnalytics {
  total_users: number;
  total_tenants: number;
  active_subscriptions: number;
  total_revenue: number;
  new_users_this_month: number;
  new_tenants_this_month: number;
}

export const useAnalytics = () => {
  const { user } = useAuth();

  // Query to fetch system analytics
  const {
    data: systemAnalytics,
    isLoading: isLoadingAnalytics,
    error: analyticsError
  } = useQuery({
    queryKey: ['system-analytics'],
    queryFn: async () => {
      console.log('Fetching system analytics...');
      const { data, error } = await supabase.rpc('get_system_analytics');

      if (error) {
        console.error('Error fetching system analytics:', error);
        throw error;
      }

      console.log('System analytics fetched successfully:', data);
      return data[0] as SystemAnalytics;
    },
    enabled: !!user && user.role === 'system_admin'
  });

  // Query to fetch analytics data
  const {
    data: analyticsData,
    isLoading: isLoadingAnalyticsData,
    error: analyticsDataError
  } = useQuery({
    queryKey: ['analytics-data'],
    queryFn: async () => {
      console.log('Fetching analytics data...');
      const { data, error } = await supabase
        .from('analytics_data')
        .select('*')
        .order('recorded_at', { ascending: false })
        .limit(500);

      if (error) {
        console.error('Error fetching analytics data:', error);
        throw error;
      }

      console.log('Analytics data fetched successfully:', data);
      return data as AnalyticsData[];
    },
    enabled: !!user && user.role === 'system_admin'
  });

  return {
    systemAnalytics,
    isLoadingAnalytics,
    analyticsError,
    analyticsData,
    isLoadingAnalyticsData,
    analyticsDataError
  };
};
