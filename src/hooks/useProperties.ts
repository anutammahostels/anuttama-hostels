import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Property = Tables<'properties'>;
export type PropertyInsert = TablesInsert<'properties'>;
export type PropertyUpdate = TablesUpdate<'properties'>;

export function useProperties(organizationId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const propertiesQuery = useQuery({
    queryKey: ['properties', user?.id, organizationId],
    queryFn: async () => {
      let query = supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (organizationId) {
        query = query.eq('organization_id', organizationId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Property[];
    },
    enabled: !!user,
  });

  const createProperty = useMutation({
    mutationFn: async (input: PropertyInsert) => {
      const { data, error } = await supabase
        .from('properties')
        .insert({
          ...input,
          owner_id: user?.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as Property;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast({
        title: 'Property Created',
        description: 'Your property has been added successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateProperty = useMutation({
    mutationFn: async ({ id, ...updates }: PropertyUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('properties')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Property;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast({
        title: 'Property Updated',
        description: 'Property has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteProperty = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast({
        title: 'Property Deleted',
        description: 'Property has been removed.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    properties: propertiesQuery.data || [],
    isLoading: propertiesQuery.isLoading,
    error: propertiesQuery.error,
    createProperty,
    updateProperty,
    deleteProperty,
  };
}
