
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type Attendance = Database['public']['Tables']['attendance']['Row'];
type AttendanceInsert = Database['public']['Tables']['attendance']['Insert'];
type AttendanceUpdate = Database['public']['Tables']['attendance']['Update'];

export const useAttendance = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Query to fetch attendance records
  const {
    data: attendanceRecords,
    isLoading: isLoadingAttendance,
    error: attendanceError
  } = useQuery({
    queryKey: ['attendance'],
    queryFn: async () => {
      console.log('Fetching attendance records...');
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching attendance:', error);
        throw error;
      }

      console.log('Attendance records fetched successfully:', data);
      return data as Attendance[];
    },
    enabled: !!user
  });

  // Query to fetch today's attendance for current user
  const {
    data: todaysAttendance,
    isLoading: isLoadingTodaysAttendance,
    error: todaysAttendanceError
  } = useQuery({
    queryKey: ['attendance', 'today', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const today = new Date().toISOString().split('T')[0];
      console.log('Fetching today\'s attendance for:', user.id, 'date:', today);
      
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('date', today)
        .maybeSingle();

      if (error) {
        console.error('Error fetching today\'s attendance:', error);
        throw error;
      }

      console.log('Today\'s attendance fetched successfully:', data);
      return data as Attendance | null;
    },
    enabled: !!user?.id
  });

  // Mutation to create attendance record
  const createAttendanceMutation = useMutation({
    mutationFn: async (attendanceData: AttendanceInsert) => {
      console.log('Creating attendance record:', attendanceData);
      const { data, error } = await supabase
        .from('attendance')
        .insert(attendanceData)
        .select()
        .single();

      if (error) {
        console.error('Error creating attendance:', error);
        throw error;
      }

      console.log('Attendance record created successfully:', data);
      return data as Attendance;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['attendance', 'today'] });
    }
  });

  // Mutation to update attendance record
  const updateAttendanceMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: AttendanceUpdate }) => {
      console.log('Updating attendance record:', id, updates);
      const { data, error } = await supabase
        .from('attendance')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating attendance:', error);
        throw error;
      }

      console.log('Attendance record updated successfully:', data);
      return data as Attendance;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['attendance', 'today'] });
    }
  });

  return {
    attendanceRecords,
    isLoadingAttendance,
    attendanceError,
    todaysAttendance,
    isLoadingTodaysAttendance,
    todaysAttendanceError,
    createAttendance: createAttendanceMutation.mutate,
    isCreatingAttendance: createAttendanceMutation.isPending,
    updateAttendance: updateAttendanceMutation.mutate,
    isUpdatingAttendance: updateAttendanceMutation.isPending
  };
};
