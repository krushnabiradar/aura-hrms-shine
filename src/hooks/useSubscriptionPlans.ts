
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type SubscriptionPlan = Database['public']['Tables']['subscription_plans']['Row'];

export const useSubscriptionPlans = () => {
  // Query to fetch all subscription plans
  const {
    data: plans,
    isLoading: isLoadingPlans,
    error: plansError
  } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: async () => {
      console.log('Fetching subscription plans...');
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price', { ascending: true });

      if (error) {
        console.error('Error fetching subscription plans:', error);
        throw error;
      }

      console.log('Subscription plans fetched successfully:', data);
      return data as SubscriptionPlan[];
    }
  });

  return {
    plans,
    isLoadingPlans,
    plansError
  };
};
