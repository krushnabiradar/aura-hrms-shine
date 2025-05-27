
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export const useSessionManagement = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Query to get session statistics
  const {
    data: sessionStats,
    isLoading: isLoadingStats,
    error: statsError
  } = useQuery({
    queryKey: ['session-statistics'],
    queryFn: async () => {
      console.log('Fetching session statistics...');
      
      const { data: activeSessions, error: activeError } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('is_active', true);
        
      if (activeError) throw activeError;

      const { data: expiredSessions, error: expiredError } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('is_active', false)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
        
      if (expiredError) throw expiredError;

      // Get concurrent session violations
      const concurrentViolations = activeSessions?.reduce((acc, session) => {
        const userSessions = activeSessions.filter(s => s.user_id === session.user_id);
        if (userSessions.length > 3) { // Default limit
          acc.add(session.user_id);
        }
        return acc;
      }, new Set()).size || 0;

      const stats = {
        activeSessions: activeSessions?.length || 0,
        expiredToday: expiredSessions?.length || 0,
        concurrentViolations,
        totalUsers: new Set(activeSessions?.map(s => s.user_id)).size || 0
      };

      console.log('Session statistics:', stats);
      return stats;
    },
    enabled: !!user && user.role === 'system_admin',
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  // Mutation to create user session
  const createSessionMutation = useMutation({
    mutationFn: async ({ sessionToken, expiresAt, ipAddress, userAgent }: {
      sessionToken: string;
      expiresAt: string;
      ipAddress?: string;
      userAgent?: string;
    }) => {
      console.log('Creating user session...');
      const { data, error } = await supabase.rpc('create_user_session', {
        p_session_token: sessionToken,
        p_expires_at: expiresAt,
        p_ip_address: ipAddress || null,
        p_user_agent: userAgent || null
      });

      if (error) {
        console.error('Error creating session:', error);
        throw error;
      }

      console.log('Session created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['session-statistics'] });
    }
  });

  return {
    sessionStats,
    isLoadingStats,
    statsError,
    createSession: createSessionMutation.mutate,
    isCreatingSession: createSessionMutation.isPending
  };
};
