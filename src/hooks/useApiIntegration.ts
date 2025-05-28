
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type ApiKey = Database['public']['Tables']['api_keys']['Row'];
type ApiKeyInsert = Database['public']['Tables']['api_keys']['Insert'];

type ApiUsageLog = Database['public']['Tables']['api_usage_logs']['Row'];

export const useApiIntegration = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // API Keys
  const {
    data: apiKeys,
    isLoading: isLoadingApiKeys,
    error: apiKeysError
  } = useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => {
      console.log('Fetching API keys...');
      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching API keys:', error);
        throw error;
      }

      console.log('API keys fetched successfully:', data);
      return data as ApiKey[];
    },
    enabled: !!user && (user.role === 'system_admin' || user.role === 'tenant_admin')
  });

  // API Usage Logs
  const {
    data: apiUsageLogs,
    isLoading: isLoadingUsageLogs,
    error: usageLogsError
  } = useQuery({
    queryKey: ['api-usage-logs'],
    queryFn: async () => {
      console.log('Fetching API usage logs...');
      const { data, error } = await supabase
        .from('api_usage_logs')
        .select(`
          *,
          api_keys (
            name,
            key_prefix
          )
        `)
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) {
        console.error('Error fetching API usage logs:', error);
        throw error;
      }

      console.log('API usage logs fetched successfully:', data);
      return data;
    },
    enabled: !!user && (user.role === 'system_admin' || user.role === 'tenant_admin')
  });

  // Create API key mutation
  const createApiKeyMutation = useMutation({
    mutationFn: async (keyData: Omit<ApiKeyInsert, 'tenant_id' | 'created_by' | 'key_hash' | 'key_prefix'>) => {
      console.log('Creating API key:', keyData);
      
      // Generate a random key
      const keyValue = crypto.randomUUID() + crypto.randomUUID().replace(/-/g, '');
      const keyPrefix = keyValue.substring(0, 8);
      
      // Hash the key for storage (in a real app, use proper hashing)
      const keyHash = btoa(keyValue);
      
      const { data, error } = await supabase
        .from('api_keys')
        .insert({
          ...keyData,
          tenant_id: user!.tenant_id!,
          created_by: user!.id,
          key_hash: keyHash,
          key_prefix: keyPrefix
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating API key:', error);
        throw error;
      }

      console.log('API key created successfully:', data);
      return { ...data, key_value: keyValue } as ApiKey & { key_value: string };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
    }
  });

  // Revoke API key mutation
  const revokeApiKeyMutation = useMutation({
    mutationFn: async (keyId: string) => {
      console.log('Revoking API key:', keyId);
      
      const { data, error } = await supabase
        .from('api_keys')
        .update({ is_active: false })
        .eq('id', keyId)
        .select()
        .single();

      if (error) {
        console.error('Error revoking API key:', error);
        throw error;
      }

      console.log('API key revoked successfully:', data);
      return data as ApiKey;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys'] });
    }
  });

  return {
    // API Keys
    apiKeys,
    isLoadingApiKeys,
    apiKeysError,
    createApiKey: createApiKeyMutation.mutate,
    isCreatingApiKey: createApiKeyMutation.isPending,
    revokeApiKey: revokeApiKeyMutation.mutate,
    isRevokingApiKey: revokeApiKeyMutation.isPending,

    // Usage Logs
    apiUsageLogs,
    isLoadingUsageLogs,
    usageLogsError
  };
};
