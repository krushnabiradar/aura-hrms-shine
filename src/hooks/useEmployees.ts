
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type Employee = Database['public']['Tables']['employees']['Row'];
type EmployeeInsert = Database['public']['Tables']['employees']['Insert'];
type EmployeeUpdate = Database['public']['Tables']['employees']['Update'];

export const useEmployees = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Query to fetch employees based on user role
  const {
    data: employees,
    isLoading: isLoadingEmployees,
    error: employeesError
  } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      console.log('Fetching employees...');
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching employees:', error);
        throw error;
      }

      console.log('Employees fetched successfully:', data);
      return data as Employee[];
    },
    enabled: !!user && (user.role === 'system_admin' || user.role === 'tenant_admin')
  });

  // Query to fetch current user's employee record
  const {
    data: currentEmployee,
    isLoading: isLoadingCurrentEmployee,
    error: currentEmployeeError
  } = useQuery({
    queryKey: ['employee', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      console.log('Fetching current employee record...');
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching current employee:', error);
        throw error;
      }

      console.log('Current employee fetched successfully:', data);
      return data as Employee | null;
    },
    enabled: !!user?.id
  });

  // Mutation to create new employee
  const createEmployeeMutation = useMutation({
    mutationFn: async (employeeData: EmployeeInsert) => {
      console.log('Creating new employee:', employeeData);
      const { data, error } = await supabase
        .from('employees')
        .insert(employeeData)
        .select()
        .single();

      if (error) {
        console.error('Error creating employee:', error);
        throw error;
      }

      console.log('Employee created successfully:', data);
      return data as Employee;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    }
  });

  // Mutation to update employee
  const updateEmployeeMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: EmployeeUpdate }) => {
      console.log('Updating employee:', id, updates);
      const { data, error } = await supabase
        .from('employees')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating employee:', error);
        throw error;
      }

      console.log('Employee updated successfully:', data);
      return data as Employee;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employee', data.user_id] });
    }
  });

  return {
    employees,
    isLoadingEmployees,
    employeesError,
    currentEmployee,
    isLoadingCurrentEmployee,
    currentEmployeeError,
    createEmployee: createEmployeeMutation.mutate,
    isCreatingEmployee: createEmployeeMutation.isPending,
    updateEmployee: updateEmployeeMutation.mutate,
    isUpdatingEmployee: updateEmployeeMutation.isPending
  };
};
