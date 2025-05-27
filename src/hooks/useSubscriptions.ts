
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type Subscription = Database['public']['Tables']['subscriptions']['Row'];
type SubscriptionInsert = Database['public']['Tables']['subscriptions']['Insert'];
type SubscriptionUpdate = Database['public']['Tables']['subscriptions']['Update'];

export const useSubscriptions = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Query to fetch all subscriptions (for system admins)
  const {
    data: subscriptions,
    isLoading: isLoadingSubscriptions,
    error: subscriptionsError
  } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: async () => {
      console.log('Fetching all subscriptions...');
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          tenant:tenants(name),
          plan:subscription_plans(name, price)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching subscriptions:', error);
        throw error;
      }

      console.log('Subscriptions fetched successfully:', data);
      return data as (Subscription & {
        tenant: { name: string };
        plan: { name: string; price: number };
      })[];
    },
    enabled: !!user && user.role === 'system_admin'
  });

  // Mutation to create subscription
  const createSubscriptionMutation = useMutation({
    mutationFn: async (subscriptionData: SubscriptionInsert) => {
      console.log('Creating subscription:', subscriptionData);
      const { data, error } = await supabase
        .from('subscriptions')
        .insert(subscriptionData)
        .select()
        .single();

      if (error) {
        console.error('Error creating subscription:', error);
        throw error;
      }

      console.log('Subscription created successfully:', data);
      return data as Subscription;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    }
  });

  // Mutation to update subscription
  const updateSubscriptionMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: SubscriptionUpdate }) => {
      console.log('Updating subscription:', id, updates);
      const { data, error } = await supabase
        .from('subscriptions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating subscription:', error);
        throw error;
      }

      console.log('Subscription updated successfully:', data);
      return data as Subscription;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    }
  });

  return {
    subscriptions,
    isLoadingSubscriptions,
    subscriptionsError,
    createSubscription: createSubscriptionMutation.mutate,
    isCreatingSubscription: createSubscriptionMutation.isPending,
    updateSubscription: updateSubscriptionMutation.mutate,
    isUpdatingSubscription: updateSubscriptionMutation.isPending
  };
};
