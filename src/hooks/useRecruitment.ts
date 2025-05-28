
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type JobPosting = Database['public']['Tables']['job_postings']['Row'];
type JobPostingInsert = Database['public']['Tables']['job_postings']['Insert'];
type JobPostingUpdate = Database['public']['Tables']['job_postings']['Update'];

type JobApplication = Database['public']['Tables']['job_applications']['Row'];
type JobApplicationInsert = Database['public']['Tables']['job_applications']['Insert'];
type JobApplicationUpdate = Database['public']['Tables']['job_applications']['Update'];

type Interview = Database['public']['Tables']['interviews']['Row'];
type InterviewInsert = Database['public']['Tables']['interviews']['Insert'];
type InterviewUpdate = Database['public']['Tables']['interviews']['Update'];

export const useRecruitment = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Job Postings
  const {
    data: jobPostings,
    isLoading: isLoadingJobPostings,
    error: jobPostingsError
  } = useQuery({
    queryKey: ['job-postings'],
    queryFn: async () => {
      console.log('Fetching job postings...');
      const { data, error } = await supabase
        .from('job_postings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching job postings:', error);
        throw error;
      }

      console.log('Job postings fetched successfully:', data);
      return data as JobPosting[];
    },
    enabled: !!user && (user.role === 'system_admin' || user.role === 'tenant_admin')
  });

  // Job Applications
  const {
    data: jobApplications,
    isLoading: isLoadingJobApplications,
    error: jobApplicationsError
  } = useQuery({
    queryKey: ['job-applications'],
    queryFn: async () => {
      console.log('Fetching job applications...');
      const { data, error } = await supabase
        .from('job_applications')
        .select(`
          *,
          job_postings (
            title,
            department
          )
        `)
        .order('applied_at', { ascending: false });

      if (error) {
        console.error('Error fetching job applications:', error);
        throw error;
      }

      console.log('Job applications fetched successfully:', data);
      return data;
    },
    enabled: !!user && (user.role === 'system_admin' || user.role === 'tenant_admin')
  });

  // Interviews
  const {
    data: interviews,
    isLoading: isLoadingInterviews,
    error: interviewsError
  } = useQuery({
    queryKey: ['interviews'],
    queryFn: async () => {
      console.log('Fetching interviews...');
      const { data, error } = await supabase
        .from('interviews')
        .select(`
          *,
          job_applications (
            applicant_name,
            applicant_email,
            job_postings (
              title
            )
          )
        `)
        .order('scheduled_at', { ascending: true });

      if (error) {
        console.error('Error fetching interviews:', error);
        throw error;
      }

      console.log('Interviews fetched successfully:', data);
      return data;
    },
    enabled: !!user && (user.role === 'system_admin' || user.role === 'tenant_admin')
  });

  // Create job posting mutation
  const createJobPostingMutation = useMutation({
    mutationFn: async (jobPostingData: Omit<JobPostingInsert, 'tenant_id' | 'posted_by'>) => {
      console.log('Creating job posting:', jobPostingData);
      
      const { data, error } = await supabase
        .from('job_postings')
        .insert({
          ...jobPostingData,
          tenant_id: user!.tenant_id!,
          posted_by: user!.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating job posting:', error);
        throw error;
      }

      console.log('Job posting created successfully:', data);
      return data as JobPosting;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-postings'] });
    }
  });

  // Update job posting mutation
  const updateJobPostingMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: JobPostingUpdate }) => {
      console.log('Updating job posting:', id, updates);
      const { data, error } = await supabase
        .from('job_postings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating job posting:', error);
        throw error;
      }

      console.log('Job posting updated successfully:', data);
      return data as JobPosting;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-postings'] });
    }
  });

  // Update job application mutation
  const updateJobApplicationMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: JobApplicationUpdate }) => {
      console.log('Updating job application:', id, updates);
      const { data, error } = await supabase
        .from('job_applications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating job application:', error);
        throw error;
      }

      console.log('Job application updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
    }
  });

  // Create interview mutation
  const createInterviewMutation = useMutation({
    mutationFn: async (interviewData: Omit<InterviewInsert, 'tenant_id'>) => {
      console.log('Creating interview:', interviewData);
      
      const { data, error } = await supabase
        .from('interviews')
        .insert({
          ...interviewData,
          tenant_id: user!.tenant_id!
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating interview:', error);
        throw error;
      }

      console.log('Interview created successfully:', data);
      return data as Interview;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
    }
  });

  return {
    // Job Postings
    jobPostings,
    isLoadingJobPostings,
    jobPostingsError,
    createJobPosting: createJobPostingMutation.mutate,
    isCreatingJobPosting: createJobPostingMutation.isPending,
    updateJobPosting: updateJobPostingMutation.mutate,
    isUpdatingJobPosting: updateJobPostingMutation.isPending,

    // Job Applications
    jobApplications,
    isLoadingJobApplications,
    jobApplicationsError,
    updateJobApplication: updateJobApplicationMutation.mutate,
    isUpdatingJobApplication: updateJobApplicationMutation.isPending,

    // Interviews
    interviews,
    isLoadingInterviews,
    interviewsError,
    createInterview: createInterviewMutation.mutate,
    isCreatingInterview: createInterviewMutation.isPending
  };
};
