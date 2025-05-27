
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export const useSecurityPolicies = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Query to enforce security policies
  const {
    data: policyCompliance,
    isLoading: isCheckingPolicies,
    error: policyError
  } = useQuery({
    queryKey: ['security-policy-compliance'],
    queryFn: async () => {
      console.log('Checking security policy compliance...');
      const policies = ['session_timeout', 'session_concurrent_limit'];
      const results: Record<string, boolean> = {};
      
      for (const policy of policies) {
        const { data, error } = await supabase.rpc('enforce_security_policy', {
          p_policy_key: policy
        });
        
        if (error) {
          console.error(`Error checking policy ${policy}:`, error);
          results[policy] = false;
        } else {
          results[policy] = data;
        }
      }
      
      console.log('Policy compliance results:', results);
      return results;
    },
    enabled: !!user,
    refetchInterval: 60000 // Check every minute
  });

  // Mutation to cleanup expired sessions
  const cleanupSessionsMutation = useMutation({
    mutationFn: async () => {
      console.log('Cleaning up expired sessions...');
      const { data, error } = await supabase.rpc('cleanup_expired_sessions');
      
      if (error) {
        console.error('Error cleaning up sessions:', error);
        throw error;
      }
      
      console.log('Sessions cleaned up:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['security-policy-compliance'] });
    }
  });

  return {
    policyCompliance,
    isCheckingPolicies,
    policyError,
    cleanupSessions: cleanupSessionsMutation.mutate,
    isCleaningSessions: cleanupSessionsMutation.isPending
  };
};
