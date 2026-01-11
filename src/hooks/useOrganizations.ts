import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import type { Json } from '@/integrations/supabase/types';

export interface Organization {
  id: string;
  name: string;
  type: string;
  owner_id: string | null;
  logo_url: string | null;
  settings: Json;
  created_at: string;
  updated_at: string;
}

export interface CreateOrganizationInput {
  name: string;
  type: string;
  settings?: Json;
}

export function useOrganizations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const organizationsQuery = useQuery({
    queryKey: ['organizations', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Organization[];
    },
    enabled: !!user,
  });

  const createOrganization = useMutation({
    mutationFn: async (input: CreateOrganizationInput) => {
      const { data, error } = await supabase
        .from('organizations')
        .insert({
          name: input.name,
          type: input.type,
          owner_id: user?.id,
          settings: input.settings || {},
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as Organization;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast({
        title: 'Organization Created',
        description: 'Your organization has been created successfully.',
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

  const updateOrganization = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Organization> & { id: string }) => {
      const { data, error } = await supabase
        .from('organizations')
        .update({
          name: updates.name,
          type: updates.type,
          logo_url: updates.logo_url,
          settings: updates.settings,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Organization;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast({
        title: 'Organization Updated',
        description: 'Your organization has been updated successfully.',
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
    organizations: organizationsQuery.data || [],
    isLoading: organizationsQuery.isLoading,
    error: organizationsQuery.error,
    createOrganization,
    updateOrganization,
  };
}
