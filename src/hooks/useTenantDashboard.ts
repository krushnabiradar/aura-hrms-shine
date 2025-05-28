
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export const useTenantDashboard = () => {
  const { user } = useAuth();

  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ['tenant-dashboard', user?.tenant_id],
    queryFn: async () => {
      if (!user?.tenant_id) throw new Error('No tenant ID found');

      console.log('Fetching tenant dashboard data for tenant:', user.tenant_id);

      // Get employees count
      const { data: employees, error: employeesError } = await supabase
        .from('employees')
        .select('*')
        .eq('tenant_id', user.tenant_id);

      if (employeesError) {
        console.error('Error fetching employees:', employeesError);
        throw employeesError;
      }

      // Get today's attendance
      const today = new Date().toISOString().split('T')[0];
      const { data: todayAttendance, error: attendanceError } = await supabase
        .from('attendance')
        .select('*')
        .eq('tenant_id', user.tenant_id)
        .eq('date', today);

      if (attendanceError) {
        console.error('Error fetching attendance:', attendanceError);
        throw attendanceError;
      }

      // Get pending leave requests
      const { data: pendingLeaves, error: leavesError } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('tenant_id', user.tenant_id)
        .eq('status', 'pending');

      if (leavesError) {
        console.error('Error fetching leave requests:', leavesError);
        throw leavesError;
      }

      // Get this month's payroll total
      const currentMonth = new Date();
      const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

      const { data: monthlyPayroll, error: payrollError } = await supabase
        .from('payroll')
        .select('gross_pay')
        .eq('tenant_id', user.tenant_id)
        .gte('pay_period_start', firstDay.toISOString().split('T')[0])
        .lte('pay_period_end', lastDay.toISOString().split('T')[0]);

      if (payrollError) {
        console.error('Error fetching payroll:', payrollError);
        throw payrollError;
      }

      // Get open job postings
      const { data: openJobs, error: jobsError } = await supabase
        .from('job_postings')
        .select('*')
        .eq('tenant_id', user.tenant_id)
        .eq('status', 'active');

      if (jobsError) {
        console.error('Error fetching job postings:', jobsError);
        throw jobsError;
      }

      // Get job applications
      const { data: applications, error: applicationsError } = await supabase
        .from('job_applications')
        .select('*, job_postings!inner(*)')
        .eq('job_postings.tenant_id', user.tenant_id);

      if (applicationsError) {
        console.error('Error fetching applications:', applicationsError);
        throw applicationsError;
      }

      // Get documents count
      const { data: documents, error: documentsError } = await supabase
        .from('documents')
        .select('id')
        .eq('tenant_id', user.tenant_id);

      if (documentsError) {
        console.error('Error fetching documents:', documentsError);
        throw documentsError;
      }

      // Calculate metrics
      const totalEmployees = employees?.length || 0;
      const activeEmployees = employees?.filter(emp => emp.status === 'active').length || 0;
      const presentToday = todayAttendance?.filter(att => att.status === 'present').length || 0;
      const attendanceRate = totalEmployees > 0 ? (presentToday / totalEmployees * 100).toFixed(1) : '0';
      const pendingLeavesCount = pendingLeaves?.length || 0;
      const monthlyPayrollTotal = monthlyPayroll?.reduce((sum, p) => sum + (Number(p.gross_pay) || 0), 0) || 0;
      const openJobsCount = openJobs?.length || 0;
      const totalApplications = applications?.length || 0;
      const pendingApplications = applications?.filter(app => app.status === 'pending').length || 0;
      const documentsCount = documents?.length || 0;

      console.log('Dashboard data calculated:', {
        totalEmployees,
        activeEmployees,
        presentToday,
        attendanceRate,
        pendingLeavesCount,
        monthlyPayrollTotal,
        openJobsCount,
        totalApplications,
        pendingApplications,
        documentsCount
      });

      return {
        totalEmployees,
        activeEmployees,
        presentToday,
        attendanceRate,
        pendingLeavesCount,
        monthlyPayrollTotal,
        openJobsCount,
        totalApplications,
        pendingApplications,
        documentsCount
      };
    },
    enabled: !!user?.tenant_id && (user.role === 'tenant_admin' || user.role === 'system_admin')
  });

  return {
    dashboardData,
    isLoading,
    error
  };
};
