
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type Payroll = Database['public']['Tables']['payroll']['Row'];
type PayrollInsert = Database['public']['Tables']['payroll']['Insert'];
type PayrollUpdate = Database['public']['Tables']['payroll']['Update'];

export const usePayroll = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Query to fetch payroll records based on user role
  const {
    data: payrollRecords,
    isLoading: isLoadingPayroll,
    error: payrollError
  } = useQuery({
    queryKey: ['payroll'],
    queryFn: async () => {
      console.log('Fetching payroll records...');
      const { data, error } = await supabase
        .from('payroll')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching payroll:', error);
        throw error;
      }

      console.log('Payroll records fetched successfully:', data);
      return data as Payroll[];
    },
    enabled: !!user && (user.role === 'system_admin' || user.role === 'tenant_admin')
  });

  // Query to fetch current user's payroll records
  const {
    data: myPayrollRecords,
    isLoading: isLoadingMyPayroll,
    error: myPayrollError
  } = useQuery({
    queryKey: ['payroll', 'my', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      console.log('Fetching my payroll records...');
      
      // For employees, we need to get their employee record first
      const { data: employeeData, error: employeeError } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (employeeError) {
        console.error('Error fetching employee data:', employeeError);
        return [];
      }

      if (!employeeData) {
        console.log('No employee record found for user');
        return [];
      }

      const { data, error } = await supabase
        .from('payroll')
        .select('*')
        .eq('employee_id', employeeData.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching my payroll:', error);
        throw error;
      }

      console.log('My payroll records fetched successfully:', data);
      return data as Payroll[];
    },
    enabled: !!user?.id
  });

  // Mutation to create payroll record
  const createPayrollMutation = useMutation({
    mutationFn: async (payrollData: Omit<PayrollInsert, 'tenant_id'>) => {
      console.log('Creating payroll record:', payrollData);
      
      const { data, error } = await supabase
        .from('payroll')
        .insert({
          ...payrollData,
          tenant_id: user!.tenant_id!
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating payroll:', error);
        throw error;
      }

      console.log('Payroll record created successfully:', data);
      return data as Payroll;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll'] });
    }
  });

  // Mutation to update payroll record
  const updatePayrollMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: PayrollUpdate }) => {
      console.log('Updating payroll record:', id, updates);
      const { data, error } = await supabase
        .from('payroll')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating payroll:', error);
        throw error;
      }

      console.log('Payroll record updated successfully:', data);
      return data as Payroll;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll'] });
    }
  });

  return {
    payrollRecords,
    isLoadingPayroll,
    payrollError,
    myPayrollRecords,
    isLoadingMyPayroll,
    myPayrollError,
    createPayroll: createPayrollMutation.mutate,
    isCreatingPayroll: createPayrollMutation.isPending,
    updatePayroll: updatePayrollMutation.mutate,
    isUpdatingPayroll: updatePayrollMutation.isPending
  };
};
