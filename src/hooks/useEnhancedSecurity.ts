
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type SecurityPolicy = Database['public']['Tables']['security_policies']['Row'];
type SecurityPolicyInsert = Database['public']['Tables']['security_policies']['Insert'];

type SecurityIncident = Database['public']['Tables']['security_incidents']['Row'];
type SecurityIncidentInsert = Database['public']['Tables']['security_incidents']['Insert'];

type AuditTrail = Database['public']['Tables']['audit_trails']['Row'];

export const useEnhancedSecurity = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Security Policies
  const {
    data: securityPolicies,
    isLoading: isLoadingPolicies,
    error: policiesError
  } = useQuery({
    queryKey: ['security-policies'],
    queryFn: async () => {
      console.log('Fetching security policies...');
      const { data, error } = await supabase
        .from('security_policies')
        .select('*')
        .eq('is_active', true)
        .order('policy_type', { ascending: true });

      if (error) {
        console.error('Error fetching security policies:', error);
        throw error;
      }

      console.log('Security policies fetched successfully:', data);
      return data as SecurityPolicy[];
    },
    enabled: !!user && (user.role === 'system_admin' || user.role === 'tenant_admin')
  });

  // Security Incidents
  const {
    data: securityIncidents,
    isLoading: isLoadingIncidents,
    error: incidentsError
  } = useQuery({
    queryKey: ['security-incidents'],
    queryFn: async () => {
      console.log('Fetching security incidents...');
      const { data, error } = await supabase
        .from('security_incidents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching security incidents:', error);
        throw error;
      }

      console.log('Security incidents fetched successfully:', data);
      return data as SecurityIncident[];
    },
    enabled: !!user && (user.role === 'system_admin' || user.role === 'tenant_admin')
  });

  // Audit Trails
  const {
    data: auditTrails,
    isLoading: isLoadingAuditTrails,
    error: auditTrailsError
  } = useQuery({
    queryKey: ['audit-trails'],
    queryFn: async () => {
      console.log('Fetching audit trails...');
      const { data, error } = await supabase
        .from('audit_trails')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) {
        console.error('Error fetching audit trails:', error);
        throw error;
      }

      console.log('Audit trails fetched successfully:', data);
      return data as AuditTrail[];
    },
    enabled: !!user && (user.role === 'system_admin' || user.role === 'tenant_admin')
  });

  // Create security policy mutation
  const createSecurityPolicyMutation = useMutation({
    mutationFn: async (policyData: Omit<SecurityPolicyInsert, 'tenant_id' | 'created_by'>) => {
      console.log('Creating security policy:', policyData);
      
      const { data, error } = await supabase
        .from('security_policies')
        .insert({
          ...policyData,
          tenant_id: user?.role === 'system_admin' ? null : user!.tenant_id!,
          created_by: user!.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating security policy:', error);
        throw error;
      }

      console.log('Security policy created successfully:', data);
      return data as SecurityPolicy;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-policies'] });
    }
  });

  // Report security incident mutation
  const reportSecurityIncidentMutation = useMutation({
    mutationFn: async (incidentData: Omit<SecurityIncidentInsert, 'tenant_id'>) => {
      console.log('Reporting security incident:', incidentData);
      
      const { data, error } = await supabase
        .from('security_incidents')
        .insert({
          ...incidentData,
          tenant_id: user?.role === 'system_admin' ? null : user!.tenant_id!
        })
        .select()
        .single();

      if (error) {
        console.error('Error reporting security incident:', error);
        throw error;
      }

      console.log('Security incident reported successfully:', data);
      return data as SecurityIncident;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security-incidents'] });
    }
  });

  return {
    // Security Policies
    securityPolicies,
    isLoadingPolicies,
    policiesError,
    createSecurityPolicy: createSecurityPolicyMutation.mutate,
    isCreatingPolicy: createSecurityPolicyMutation.isPending,

    // Security Incidents
    securityIncidents,
    isLoadingIncidents,
    incidentsError,
    reportSecurityIncident: reportSecurityIncidentMutation.mutate,
    isReportingIncident: reportSecurityIncidentMutation.isPending,

    // Audit Trails
    auditTrails,
    isLoadingAuditTrails,
    auditTrailsError
  };
};
