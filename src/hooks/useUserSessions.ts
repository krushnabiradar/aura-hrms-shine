
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type UserSession = Database['public']['Tables']['user_sessions']['Row'];

export const useUserSessions = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Query to fetch user sessions
  const {
    data: sessions,
    isLoading: isLoadingSessions,
    error: sessionsError
  } = useQuery({
    queryKey: ['user-sessions'],
    queryFn: async () => {
      console.log('Fetching user sessions...');
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .order('last_activity', { ascending: false });

      if (error) {
        console.error('Error fetching user sessions:', error);
        throw error;
      }

      console.log('User sessions fetched successfully:', data);
      return data as UserSession[];
    },
    enabled: !!user && user.role === 'system_admin'
  });

  // Mutation to terminate session
  const terminateSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      console.log('Terminating session:', sessionId);
      const { data, error } = await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) {
        console.error('Error terminating session:', error);
        throw error;
      }

      console.log('Session terminated successfully:', data);
      return data as UserSession;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-sessions'] });
    }
  });

  return {
    sessions,
    isLoadingSessions,
    sessionsError,
    terminateSession: terminateSessionMutation.mutate,
    isTerminatingSession: terminateSessionMutation.isPending
  };
};
