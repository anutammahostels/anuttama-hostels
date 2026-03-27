import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { createNotification, getAdminUserIds, getStudentUserId } from '@/lib/notifications';

export type GatePass = Tables<'gate_passes'>;
export type GatePassInsert = TablesInsert<'gate_passes'>;
export type GatePassUpdate = TablesUpdate<'gate_passes'>;

export interface GatePassWithStudent extends GatePass {
  student?: {
    id: string;
    roll_number: string | null;
    user_id: string;
    profile?: {
      full_name: string | null;
      phone: string | null;
    } | null;
  } | null;
}

export function useGatePasses(propertyId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const gatePassesQuery = useQuery({
    queryKey: ['gate_passes', user?.id, propertyId],
    queryFn: async () => {
      // Get gate passes with students
      const { data: passesData, error: passesError } = await supabase
        .from('gate_passes')
        .select(`
          *,
          student:students(id, roll_number, user_id)
        `)
        .order('created_at', { ascending: false });
      
      if (passesError) throw passesError;
      if (!passesData || passesData.length === 0) return [] as GatePassWithStudent[];

      // Get profiles for students
      const userIds = passesData
        .map(p => p.student?.user_id)
        .filter((id): id is string => !!id);

      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, phone')
        .in('id', userIds);

      const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);

      const result = passesData.map(pass => ({
        ...pass,
        student: pass.student ? {
          ...pass.student,
          profile: profilesMap.get(pass.student.user_id) || null,
        } : null,
      }));

      return result as GatePassWithStudent[];
    },
    enabled: !!user,
  });

  const createGatePass = useMutation({
    mutationFn: async (input: GatePassInsert) => {
      // Generate a unique QR code
      const qrCode = `GP-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      
      const { data, error } = await supabase
        .from('gate_passes')
        .insert({
          ...input,
          qr_code: qrCode,
          status: 'pending',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as GatePass;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['gate_passes'] });
      toast({
        title: 'Gate Pass Requested',
        description: 'Your gate pass request has been submitted.',
      });
      // Notify admins about new gate pass request
      const adminIds = await getAdminUserIds();
      adminIds.forEach((adminId) =>
        createNotification(adminId, "New Gate Pass Request", `A new gate pass request has been submitted.`, "gate_pass", "/dashboard/gate-passes")
      );
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const approveGatePass = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('gate_passes')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: user?.id,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as GatePass;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['gate_passes'] });
      toast({
        title: 'Gate Pass Approved',
        description: 'The gate pass has been approved.',
      });
      // Notify the student
      const userId = await getStudentUserId(data.student_id);
      if (userId) {
        createNotification(userId, "Gate Pass Approved", "Your gate pass request has been approved.", "gate_pass", "/student/gate-passes");
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const rejectGatePass = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      const { data, error } = await supabase
        .from('gate_passes')
        .update({
          status: 'rejected',
          notes: notes || null,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as GatePass;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['gate_passes'] });
      toast({
        title: 'Gate Pass Rejected',
        description: 'The gate pass has been rejected.',
      });
      // Notify the student
      const userId = await getStudentUserId(data.student_id);
      if (userId) {
        createNotification(userId, "Gate Pass Rejected", `Your gate pass request has been rejected.${data.notes ? ` Reason: ${data.notes}` : ""}`, "gate_pass", "/student/gate-passes");
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const checkOut = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('gate_passes')
        .update({
          checked_out_at: new Date().toISOString(),
          checked_out_by: user?.id,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as GatePass;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gate_passes'] });
      toast({
        title: 'Checked Out',
        description: 'Student has been checked out.',
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

  const checkIn = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('gate_passes')
        .update({
          checked_in_at: new Date().toISOString(),
          checked_in_by: user?.id,
          actual_return: new Date().toISOString(),
          status: 'completed',
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as GatePass;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gate_passes'] });
      toast({
        title: 'Checked In',
        description: 'Student has been checked in.',
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

  // Calculate stats
  const stats = {
    total: gatePassesQuery.data?.length || 0,
    pending: gatePassesQuery.data?.filter(p => p.status === 'pending').length || 0,
    approved: gatePassesQuery.data?.filter(p => p.status === 'approved').length || 0,
    active: gatePassesQuery.data?.filter(p => p.checked_out_at && !p.checked_in_at).length || 0,
    completed: gatePassesQuery.data?.filter(p => p.status === 'completed').length || 0,
  };

  return {
    gatePasses: gatePassesQuery.data || [],
    stats,
    isLoading: gatePassesQuery.isLoading,
    error: gatePassesQuery.error,
    refetch: gatePassesQuery.refetch,
    createGatePass,
    approveGatePass,
    rejectGatePass,
    checkOut,
    checkIn,
  };
}
