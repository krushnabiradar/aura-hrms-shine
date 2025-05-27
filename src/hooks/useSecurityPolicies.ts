
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
      const results: Record<string, boolean> = {};
      
      // Check session timeout policy
      const { data: timeoutSetting } = await supabase
        .from('security_settings')
        .select('setting_value')
        .eq('setting_key', 'session_timeout')
        .single();
        
      if (timeoutSetting) {
        const timeoutSeconds = parseInt(timeoutSetting.setting_value as string);
        const cutoffTime = new Date(Date.now() - timeoutSeconds * 1000).toISOString();
        
        const { data: expiredSessions } = await supabase
          .from('user_sessions')
          .select('id')
          .eq('is_active', true)
          .lt('last_activity', cutoffTime);
          
        results.session_timeout = !expiredSessions || expiredSessions.length === 0;
      } else {
        results.session_timeout = true;
      }
      
      // Check concurrent session limit
      const { data: limitSetting } = await supabase
        .from('security_settings')
        .select('setting_value')
        .eq('setting_key', 'session_concurrent_limit')
        .single();
        
      if (limitSetting) {
        const limit = parseInt(limitSetting.setting_value as string);
        
        // Get session counts per user
        const { data: sessionCounts } = await supabase
          .from('user_sessions')
          .select('user_id')
          .eq('is_active', true);
          
        if (sessionCounts) {
          const userSessionCounts = sessionCounts.reduce((acc, session) => {
            acc[session.user_id] = (acc[session.user_id] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          
          const violations = Object.values(userSessionCounts).filter(count => count > limit);
          results.session_concurrent_limit = violations.length === 0;
        } else {
          results.session_concurrent_limit = true;
        }
      } else {
        results.session_concurrent_limit = true;
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
      
      // Get session timeout setting
      const { data: timeoutSetting } = await supabase
        .from('security_settings')
        .select('setting_value')
        .eq('setting_key', 'session_timeout')
        .single();
        
      if (!timeoutSetting) {
        throw new Error('Session timeout setting not found');
      }
      
      const timeoutSeconds = parseInt(timeoutSetting.setting_value as string);
      const cutoffTime = new Date(Date.now() - timeoutSeconds * 1000).toISOString();
      
      // Update expired sessions
      const { data, error } = await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('is_active', true)
        .lt('last_activity', cutoffTime)
        .select();
      
      if (error) {
        console.error('Error cleaning up sessions:', error);
        throw error;
      }
      
      console.log('Sessions cleaned up:', data?.length || 0);
      return data?.length || 0;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['security-policy-compliance'] });
      queryClient.invalidateQueries({ queryKey: ['session-statistics'] });
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
