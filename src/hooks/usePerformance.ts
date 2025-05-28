
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type PerformanceCycle = Database['public']['Tables']['performance_cycles']['Row'];
type PerformanceCycleInsert = Database['public']['Tables']['performance_cycles']['Insert'];

type PerformanceReview = Database['public']['Tables']['performance_reviews']['Row'];
type PerformanceReviewInsert = Database['public']['Tables']['performance_reviews']['Insert'];

type PerformanceGoal = Database['public']['Tables']['performance_goals']['Row'];
type PerformanceGoalInsert = Database['public']['Tables']['performance_goals']['Insert'];

type Competency = Database['public']['Tables']['competencies']['Row'];

export const usePerformance = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Performance Cycles
  const {
    data: performanceCycles,
    isLoading: isLoadingCycles,
    error: cyclesError
  } = useQuery({
    queryKey: ['performance-cycles'],
    queryFn: async () => {
      console.log('Fetching performance cycles...');
      const { data, error } = await supabase
        .from('performance_cycles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching performance cycles:', error);
        throw error;
      }

      console.log('Performance cycles fetched successfully:', data);
      return data as PerformanceCycle[];
    },
    enabled: !!user && (user.role === 'system_admin' || user.role === 'tenant_admin')
  });

  // Performance Reviews
  const {
    data: performanceReviews,
    isLoading: isLoadingReviews,
    error: reviewsError
  } = useQuery({
    queryKey: ['performance-reviews'],
    queryFn: async () => {
      console.log('Fetching performance reviews...');
      const { data, error } = await supabase
        .from('performance_reviews')
        .select(`
          *,
          performance_cycles (
            name,
            start_date,
            end_date
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching performance reviews:', error);
        throw error;
      }

      console.log('Performance reviews fetched successfully:', data);
      return data;
    },
    enabled: !!user
  });

  // Performance Goals
  const {
    data: performanceGoals,
    isLoading: isLoadingGoals,
    error: goalsError
  } = useQuery({
    queryKey: ['performance-goals'],
    queryFn: async () => {
      console.log('Fetching performance goals...');
      const { data, error } = await supabase
        .from('performance_goals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching performance goals:', error);
        throw error;
      }

      console.log('Performance goals fetched successfully:', data);
      return data as PerformanceGoal[];
    },
    enabled: !!user
  });

  // Competencies
  const {
    data: competencies,
    isLoading: isLoadingCompetencies,
    error: competenciesError
  } = useQuery({
    queryKey: ['competencies'],
    queryFn: async () => {
      console.log('Fetching competencies...');
      const { data, error } = await supabase
        .from('competencies')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });

      if (error) {
        console.error('Error fetching competencies:', error);
        throw error;
      }

      console.log('Competencies fetched successfully:', data);
      return data as Competency[];
    },
    enabled: !!user
  });

  // Create performance cycle mutation
  const createPerformanceCycleMutation = useMutation({
    mutationFn: async (cycleData: Omit<PerformanceCycleInsert, 'tenant_id' | 'created_by'>) => {
      console.log('Creating performance cycle:', cycleData);
      
      const { data, error } = await supabase
        .from('performance_cycles')
        .insert({
          ...cycleData,
          tenant_id: user!.tenant_id!,
          created_by: user!.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating performance cycle:', error);
        throw error;
      }

      console.log('Performance cycle created successfully:', data);
      return data as PerformanceCycle;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-cycles'] });
    }
  });

  // Create performance goal mutation
  const createPerformanceGoalMutation = useMutation({
    mutationFn: async (goalData: Omit<PerformanceGoalInsert, 'tenant_id' | 'created_by'>) => {
      console.log('Creating performance goal:', goalData);
      
      const { data, error } = await supabase
        .from('performance_goals')
        .insert({
          ...goalData,
          tenant_id: user!.tenant_id!,
          created_by: user!.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating performance goal:', error);
        throw error;
      }

      console.log('Performance goal created successfully:', data);
      return data as PerformanceGoal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['performance-goals'] });
    }
  });

  return {
    // Performance Cycles
    performanceCycles,
    isLoadingCycles,
    cyclesError,
    createPerformanceCycle: createPerformanceCycleMutation.mutate,
    isCreatingCycle: createPerformanceCycleMutation.isPending,

    // Performance Reviews
    performanceReviews,
    isLoadingReviews,
    reviewsError,

    // Performance Goals
    performanceGoals,
    isLoadingGoals,
    goalsError,
    createPerformanceGoal: createPerformanceGoalMutation.mutate,
    isCreatingGoal: createPerformanceGoalMutation.isPending,

    // Competencies
    competencies,
    isLoadingCompetencies,
    competenciesError
  };
};
