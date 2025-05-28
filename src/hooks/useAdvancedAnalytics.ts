
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type AnalyticsDashboard = Database['public']['Tables']['analytics_dashboards']['Row'];
type AnalyticsDashboardInsert = Database['public']['Tables']['analytics_dashboards']['Insert'];

type AnalyticsWidget = Database['public']['Tables']['analytics_widgets']['Row'];
type AnalyticsWidgetInsert = Database['public']['Tables']['analytics_widgets']['Insert'];

type AnalyticsData = Database['public']['Tables']['analytics_data']['Row'];

export const useAdvancedAnalytics = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Analytics Dashboards
  const {
    data: analyticsDashboards,
    isLoading: isLoadingDashboards,
    error: dashboardsError
  } = useQuery({
    queryKey: ['analytics-dashboards'],
    queryFn: async () => {
      console.log('Fetching analytics dashboards...');
      const { data, error } = await supabase
        .from('analytics_dashboards')
        .select(`
          *,
          analytics_widgets (*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching analytics dashboards:', error);
        throw error;
      }

      console.log('Analytics dashboards fetched successfully:', data);
      return data;
    },
    enabled: !!user && (user.role === 'system_admin' || user.role === 'tenant_admin')
  });

  // Analytics Data
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
        .limit(1000);

      if (error) {
        console.error('Error fetching analytics data:', error);
        throw error;
      }

      console.log('Analytics data fetched successfully:', data);
      return data as AnalyticsData[];
    },
    enabled: !!user && (user.role === 'system_admin' || user.role === 'tenant_admin')
  });

  // Create dashboard mutation
  const createDashboardMutation = useMutation({
    mutationFn: async (dashboardData: Omit<AnalyticsDashboardInsert, 'tenant_id' | 'created_by'>) => {
      console.log('Creating analytics dashboard:', dashboardData);
      
      const { data, error } = await supabase
        .from('analytics_dashboards')
        .insert({
          ...dashboardData,
          tenant_id: user!.tenant_id!,
          created_by: user!.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating analytics dashboard:', error);
        throw error;
      }

      console.log('Analytics dashboard created successfully:', data);
      return data as AnalyticsDashboard;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics-dashboards'] });
    }
  });

  // Create widget mutation
  const createWidgetMutation = useMutation({
    mutationFn: async (widgetData: AnalyticsWidgetInsert) => {
      console.log('Creating analytics widget:', widgetData);
      
      const { data, error } = await supabase
        .from('analytics_widgets')
        .insert(widgetData)
        .select()
        .single();

      if (error) {
        console.error('Error creating analytics widget:', error);
        throw error;
      }

      console.log('Analytics widget created successfully:', data);
      return data as AnalyticsWidget;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics-dashboards'] });
    }
  });

  return {
    // Dashboards
    analyticsDashboards,
    isLoadingDashboards,
    dashboardsError,
    createDashboard: createDashboardMutation.mutate,
    isCreatingDashboard: createDashboardMutation.isPending,

    // Widgets
    createWidget: createWidgetMutation.mutate,
    isCreatingWidget: createWidgetMutation.isPending,

    // Analytics Data
    analyticsData,
    isLoadingAnalyticsData,
    analyticsDataError
  };
};
