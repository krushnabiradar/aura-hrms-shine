
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

      // Get concurrent session limit from settings
      const { data: limitSetting } = await supabase
        .from('security_settings')
        .select('setting_value')
        .eq('setting_key', 'session_concurrent_limit')
        .maybeSingle();
        
      const limit = limitSetting ? parseInt(String(limitSetting.setting_value)) : 3;

      // Calculate concurrent session violations
      const userSessionCounts = activeSessions?.reduce((acc, session) => {
        acc[session.user_id] = (acc[session.user_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};
      
      const concurrentViolations = Object.values(userSessionCounts).filter(count => count > limit).length;

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
      
      // Check if session already exists
      const { data: existingSession } = await supabase
        .from('user_sessions')
        .select('id')
        .eq('session_token', sessionToken)
        .eq('is_active', true)
        .maybeSingle();
        
      if (existingSession) {
        console.log('Session already exists, skipping creation');
        return existingSession;
      }
      
      // Get concurrent session limit
      const { data: limitSetting } = await supabase
        .from('security_settings')
        .select('setting_value')
        .eq('setting_key', 'session_concurrent_limit')
        .maybeSingle();
        
      const limit = limitSetting ? parseInt(String(limitSetting.setting_value)) : 3;
      
      // Count current active sessions for user
      const { data: currentSessions } = await supabase
        .from('user_sessions')
        .select('id, last_activity')
        .eq('user_id', user?.id)
        .eq('is_active', true)
        .order('last_activity', { ascending: true });
        
      // If limit exceeded, deactivate oldest session
      if (currentSessions && currentSessions.length >= limit) {
        await supabase
          .from('user_sessions')
          .update({ is_active: false })
          .eq('id', currentSessions[0].id);
      }
      
      // Create new session
      const { data, error } = await supabase
        .from('user_sessions')
        .insert({
          user_id: user?.id!,
          session_token: sessionToken,
          expires_at: expiresAt,
          ip_address: ipAddress || null,
          user_agent: userAgent || null
        })
        .select()
        .single();

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
