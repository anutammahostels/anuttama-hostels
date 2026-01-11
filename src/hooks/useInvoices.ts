import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Invoice = Tables<'invoices'>;
export type InvoiceInsert = TablesInsert<'invoices'>;
export type InvoiceUpdate = TablesUpdate<'invoices'>;

export interface InvoiceWithStudent extends Invoice {
  student?: {
    id: string;
    roll_number: string | null;
    user_id: string;
    profile?: {
      full_name: string | null;
      email: string | null;
      phone: string | null;
    } | null;
  } | null;
}

export function useInvoices(studentId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const invoicesQuery = useQuery({
    queryKey: ['invoices', user?.id, studentId],
    queryFn: async () => {
      let query = supabase
        .from('invoices')
        .select(`
          *,
          student:students(id, roll_number, user_id)
        `)
        .order('created_at', { ascending: false });
      
      if (studentId) {
        query = query.eq('student_id', studentId);
      }
      
      const { data: invoicesData, error: invoicesError } = await query;
      if (invoicesError) throw invoicesError;
      if (!invoicesData || invoicesData.length === 0) return [] as InvoiceWithStudent[];

      // Get profiles for students
      const userIds = invoicesData
        .map(inv => inv.student?.user_id)
        .filter((id): id is string => !!id);

      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, email, phone')
        .in('id', userIds);

      const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);

      const result = invoicesData.map(invoice => ({
        ...invoice,
        student: invoice.student ? {
          ...invoice.student,
          profile: profilesMap.get(invoice.student.user_id) || null,
        } : null,
      }));

      return result as InvoiceWithStudent[];
    },
    enabled: !!user,
  });

  const createInvoice = useMutation({
    mutationFn: async (input: InvoiceInsert) => {
      const { data, error } = await supabase
        .from('invoices')
        .insert(input)
        .select()
        .single();
      
      if (error) throw error;
      return data as Invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({
        title: 'Invoice Created',
        description: 'New invoice has been generated.',
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

  const updateInvoice = useMutation({
    mutationFn: async ({ id, ...updates }: InvoiceUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('invoices')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({
        title: 'Invoice Updated',
        description: 'Invoice has been updated.',
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

  const recordPayment = useMutation({
    mutationFn: async ({ 
      id, 
      amount, 
      method 
    }: { 
      id: string; 
      amount: number; 
      method: string;
    }) => {
      // First get current invoice
      const { data: current, error: fetchError } = await supabase
        .from('invoices')
        .select('paid_amount, total_amount')
        .eq('id', id)
        .single();
      
      if (fetchError) throw fetchError;

      const newPaidAmount = (current.paid_amount || 0) + amount;
      const newStatus = newPaidAmount >= current.total_amount ? 'paid' : 'partial';

      const { data, error } = await supabase
        .from('invoices')
        .update({
          paid_amount: newPaidAmount,
          payment_method: method,
          payment_date: new Date().toISOString(),
          status: newStatus,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({
        title: 'Payment Recorded',
        description: 'Payment has been recorded successfully.',
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
    totalInvoices: invoicesQuery.data?.length || 0,
    totalAmount: invoicesQuery.data?.reduce((acc, inv) => acc + inv.total_amount, 0) || 0,
    paidAmount: invoicesQuery.data?.reduce((acc, inv) => acc + (inv.paid_amount || 0), 0) || 0,
    pendingAmount: invoicesQuery.data?.reduce((acc, inv) => 
      acc + (inv.total_amount - (inv.paid_amount || 0)), 0
    ) || 0,
    overdueCount: invoicesQuery.data?.filter(inv => 
      inv.status !== 'paid' && new Date(inv.due_date) < new Date()
    ).length || 0,
  };

  return {
    invoices: invoicesQuery.data || [],
    stats,
    isLoading: invoicesQuery.isLoading,
    error: invoicesQuery.error,
    refetch: invoicesQuery.refetch,
    createInvoice,
    updateInvoice,
    recordPayment,
  };
}
