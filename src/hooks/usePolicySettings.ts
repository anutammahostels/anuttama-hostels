import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import type { Json } from '@/integrations/supabase/types';

export interface PolicySetting {
  id: string;
  property_id: string;
  setting_key: string;
  setting_value: Json;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface PolicySettingInput {
  property_id: string;
  setting_key: string;
  setting_value: Json;
  description?: string;
}

export function usePolicySettings(propertyId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: ['policy_settings', propertyId],
    queryFn: async () => {
      if (!propertyId) return [];
      
      const { data, error } = await supabase
        .from('policy_settings')
        .select('*')
        .eq('property_id', propertyId);
      
      if (error) throw error;
      return data as PolicySetting[];
    },
    enabled: !!user && !!propertyId,
  });

  const savePolicySetting = useMutation({
    mutationFn: async (input: PolicySettingInput) => {
      const { data, error } = await supabase
        .from('policy_settings')
        .upsert({
          property_id: input.property_id,
          setting_key: input.setting_key,
          setting_value: input.setting_value,
          description: input.description || null,
        }, {
          onConflict: 'property_id,setting_key',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as PolicySetting;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policy_settings'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const bulkSavePolicies = useMutation({
    mutationFn: async (inputs: PolicySettingInput[]) => {
      const toUpsert = inputs.map(input => ({
        property_id: input.property_id,
        setting_key: input.setting_key,
        setting_value: input.setting_value,
        description: input.description || null,
      }));

      const { data, error } = await supabase
        .from('policy_settings')
        .upsert(toUpsert, {
          onConflict: 'property_id,setting_key',
        })
        .select();
      
      if (error) throw error;
      return data as PolicySetting[];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['policy_settings'] });
      toast({
        title: 'Policies Saved',
        description: 'Property policies have been saved successfully.',
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

  // Helper to get a specific setting value
  const getSetting = (key: string): Json | undefined => {
    const setting = settingsQuery.data?.find(s => s.setting_key === key);
    return setting?.setting_value;
  };

  return {
    settings: settingsQuery.data || [],
    getSetting,
    isLoading: settingsQuery.isLoading,
    error: settingsQuery.error,
    savePolicySetting,
    bulkSavePolicies,
  };
}
