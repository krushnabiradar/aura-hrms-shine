
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type ReportTemplate = Database['public']['Tables']['report_templates']['Row'];
type ReportTemplateInsert = Database['public']['Tables']['report_templates']['Insert'];
type ReportTemplateUpdate = Database['public']['Tables']['report_templates']['Update'];

type GeneratedReport = Database['public']['Tables']['generated_reports']['Row'];
type GeneratedReportInsert = Database['public']['Tables']['generated_reports']['Insert'];

export const useReports = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Report Templates
  const {
    data: reportTemplates,
    isLoading: isLoadingReportTemplates,
    error: reportTemplatesError
  } = useQuery({
    queryKey: ['report-templates'],
    queryFn: async () => {
      console.log('Fetching report templates...');
      const { data, error } = await supabase
        .from('report_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching report templates:', error);
        throw error;
      }

      console.log('Report templates fetched successfully:', data);
      return data as ReportTemplate[];
    },
    enabled: !!user && (user.role === 'system_admin' || user.role === 'tenant_admin')
  });

  // Generated Reports
  const {
    data: generatedReports,
    isLoading: isLoadingGeneratedReports,
    error: generatedReportsError
  } = useQuery({
    queryKey: ['generated-reports'],
    queryFn: async () => {
      console.log('Fetching generated reports...');
      const { data, error } = await supabase
        .from('generated_reports')
        .select(`
          *,
          report_templates (
            name,
            report_type
          )
        `)
        .order('generated_at', { ascending: false });

      if (error) {
        console.error('Error fetching generated reports:', error);
        throw error;
      }

      console.log('Generated reports fetched successfully:', data);
      return data;
    },
    enabled: !!user && (user.role === 'system_admin' || user.role === 'tenant_admin')
  });

  // Create report template mutation
  const createReportTemplateMutation = useMutation({
    mutationFn: async (templateData: Omit<ReportTemplateInsert, 'tenant_id' | 'created_by'>) => {
      console.log('Creating report template:', templateData);
      
      const { data, error } = await supabase
        .from('report_templates')
        .insert({
          ...templateData,
          tenant_id: user!.tenant_id!,
          created_by: user!.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating report template:', error);
        throw error;
      }

      console.log('Report template created successfully:', data);
      return data as ReportTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['report-templates'] });
    }
  });

  // Generate report mutation
  const generateReportMutation = useMutation({
    mutationFn: async (reportData: Omit<GeneratedReportInsert, 'tenant_id' | 'generated_by'>) => {
      console.log('Generating report:', reportData);
      
      const { data, error } = await supabase
        .from('generated_reports')
        .insert({
          ...reportData,
          tenant_id: user!.tenant_id!,
          generated_by: user!.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error generating report:', error);
        throw error;
      }

      console.log('Report generated successfully:', data);
      return data as GeneratedReport;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generated-reports'] });
    }
  });

  return {
    // Report Templates
    reportTemplates,
    isLoadingReportTemplates,
    reportTemplatesError,
    createReportTemplate: createReportTemplateMutation.mutate,
    isCreatingReportTemplate: createReportTemplateMutation.isPending,

    // Generated Reports
    generatedReports,
    isLoadingGeneratedReports,
    generatedReportsError,
    generateReport: generateReportMutation.mutate,
    isGeneratingReport: generateReportMutation.isPending
  };
};
