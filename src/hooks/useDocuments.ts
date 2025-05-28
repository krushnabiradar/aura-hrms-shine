
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import type { Database } from '@/integrations/supabase/types';

type Document = Database['public']['Tables']['documents']['Row'];
type DocumentInsert = Database['public']['Tables']['documents']['Insert'];
type DocumentUpdate = Database['public']['Tables']['documents']['Update'];

type DocumentCategory = Database['public']['Tables']['document_categories']['Row'];
type DocumentCategoryInsert = Database['public']['Tables']['document_categories']['Insert'];

export const useDocuments = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Documents
  const {
    data: documents,
    isLoading: isLoadingDocuments,
    error: documentsError
  } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      console.log('Fetching documents...');
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          document_categories (
            name
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching documents:', error);
        throw error;
      }

      console.log('Documents fetched successfully:', data);
      return data;
    },
    enabled: !!user
  });

  // Document Categories
  const {
    data: documentCategories,
    isLoading: isLoadingDocumentCategories,
    error: documentCategoriesError
  } = useQuery({
    queryKey: ['document-categories'],
    queryFn: async () => {
      console.log('Fetching document categories...');
      const { data, error } = await supabase
        .from('document_categories')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching document categories:', error);
        throw error;
      }

      console.log('Document categories fetched successfully:', data);
      return data as DocumentCategory[];
    },
    enabled: !!user
  });

  // Create document mutation
  const createDocumentMutation = useMutation({
    mutationFn: async (documentData: Omit<DocumentInsert, 'tenant_id' | 'uploaded_by'>) => {
      console.log('Creating document:', documentData);
      
      const { data, error } = await supabase
        .from('documents')
        .insert({
          ...documentData,
          tenant_id: user!.tenant_id!,
          uploaded_by: user!.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating document:', error);
        throw error;
      }

      console.log('Document created successfully:', data);
      return data as Document;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    }
  });

  // Update document mutation
  const updateDocumentMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: DocumentUpdate }) => {
      console.log('Updating document:', id, updates);
      const { data, error } = await supabase
        .from('documents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating document:', error);
        throw error;
      }

      console.log('Document updated successfully:', data);
      return data as Document;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    }
  });

  // Create document category mutation
  const createDocumentCategoryMutation = useMutation({
    mutationFn: async (categoryData: Omit<DocumentCategoryInsert, 'tenant_id'>) => {
      console.log('Creating document category:', categoryData);
      
      const { data, error } = await supabase
        .from('document_categories')
        .insert({
          ...categoryData,
          tenant_id: user!.tenant_id!
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating document category:', error);
        throw error;
      }

      console.log('Document category created successfully:', data);
      return data as DocumentCategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['document-categories'] });
    }
  });

  return {
    // Documents
    documents,
    isLoadingDocuments,
    documentsError,
    createDocument: createDocumentMutation.mutate,
    isCreatingDocument: createDocumentMutation.isPending,
    updateDocument: updateDocumentMutation.mutate,
    isUpdatingDocument: updateDocumentMutation.isPending,

    // Document Categories
    documentCategories,
    isLoadingDocumentCategories,
    documentCategoriesError,
    createDocumentCategory: createDocumentCategoryMutation.mutate,
    isCreatingDocumentCategory: createDocumentCategoryMutation.isPending
  };
};
