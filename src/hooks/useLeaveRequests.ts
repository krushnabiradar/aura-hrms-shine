
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type LeaveRequest = Database['public']['Tables']['leave_requests']['Row'];
type LeaveRequestInsert = Database['public']['Tables']['leave_requests']['Insert'];
type LeaveRequestUpdate = Database['public']['Tables']['leave_requests']['Update'];

export const useLeaveRequests = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Query to fetch leave requests
  const {
    data: leaveRequests,
    isLoading: isLoadingLeaveRequests,
    error: leaveRequestsError
  } = useQuery({
    queryKey: ['leave-requests'],
    queryFn: async () => {
      console.log('Fetching leave requests...');
      const { data, error } = await supabase
        .from('leave_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching leave requests:', error);
        throw error;
      }

      console.log('Leave requests fetched successfully:', data);
      return data as LeaveRequest[];
    },
    enabled: !!user
  });

  // Query to fetch current user's leave requests
  const {
    data: myLeaveRequests,
    isLoading: isLoadingMyLeaveRequests,
    error: myLeaveRequestsError
  } = useQuery({
    queryKey: ['leave-requests', 'my', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      console.log('Fetching my leave requests...');
      const { data, error } = await supabase
        .from('leave_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching my leave requests:', error);
        throw error;
      }

      console.log('My leave requests fetched successfully:', data);
      return data as LeaveRequest[];
    },
    enabled: !!user?.id
  });

  // Mutation to create leave request
  const createLeaveRequestMutation = useMutation({
    mutationFn: async (leaveRequestData: LeaveRequestInsert) => {
      console.log('Creating leave request:', leaveRequestData);
      const { data, error } = await supabase
        .from('leave_requests')
        .insert(leaveRequestData)
        .select()
        .single();

      if (error) {
        console.error('Error creating leave request:', error);
        throw error;
      }

      console.log('Leave request created successfully:', data);
      return data as LeaveRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
    }
  });

  // Mutation to update leave request
  const updateLeaveRequestMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: LeaveRequestUpdate }) => {
      console.log('Updating leave request:', id, updates);
      const { data, error } = await supabase
        .from('leave_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating leave request:', error);
        throw error;
      }

      console.log('Leave request updated successfully:', data);
      return data as LeaveRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
    }
  });

  return {
    leaveRequests,
    isLoadingLeaveRequests,
    leaveRequestsError,
    myLeaveRequests,
    isLoadingMyLeaveRequests,
    myLeaveRequestsError,
    createLeaveRequest: createLeaveRequestMutation.mutate,
    isCreatingLeaveRequest: createLeaveRequestMutation.isPending,
    updateLeaveRequest: updateLeaveRequestMutation.mutate,
    isUpdatingLeaveRequest: updateLeaveRequestMutation.isPending
  };
};
