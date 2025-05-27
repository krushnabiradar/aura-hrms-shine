
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type SystemLog = Database['public']['Tables']['system_logs']['Row'];
type SystemLogInsert = Database['public']['Tables']['system_logs']['Insert'];

export const useSystemLogs = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Query to fetch system logs (only for system admins)
  const {
    data: logs,
    isLoading: isLoadingLogs,
    error: logsError
  } = useQuery({
    queryKey: ['system-logs'],
    queryFn: async () => {
      console.log('Fetching system logs...');
      const { data, error } = await supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) {
        console.error('Error fetching system logs:', error);
        throw error;
      }

      console.log('System logs fetched successfully:', data);
      return data as SystemLog[];
    },
    enabled: !!user && user.role === 'system_admin'
  });

  // Mutation to create system log
  const createLogMutation = useMutation({
    mutationFn: async (logData: SystemLogInsert) => {
      console.log('Creating system log:', logData);
      const { data, error } = await supabase
        .from('system_logs')
        .insert(logData)
        .select()
        .single();

      if (error) {
        console.error('Error creating system log:', error);
        throw error;
      }

      console.log('System log created successfully:', data);
      return data as SystemLog;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-logs'] });
    }
  });

  // Function to log actions using the database function
  const logAction = async (action: string, resourceType: string, resourceId?: string, details?: any) => {
    try {
      const { data, error } = await supabase.rpc('log_system_action', {
        p_action: action,
        p_resource_type: resourceType,
        p_resource_id: resourceId || null,
        p_details: details || {},
        p_severity: 'info'
      });

      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['system-logs'] });
      return data;
    } catch (error) {
      console.error('Error logging action:', error);
    }
  };

  return {
    logs,
    isLoadingLogs,
    logsError,
    createLog: createLogMutation.mutate,
    isCreatingLog: createLogMutation.isPending,
    logAction
  };
};
