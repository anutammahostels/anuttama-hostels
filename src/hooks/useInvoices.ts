import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { createNotification, getStudentUserId } from '@/lib/notifications';

export type Invoice = Tables<'invoices'>;
export type InvoiceInsert = TablesInsert<'invoices'>;
export type InvoiceUpdate = TablesUpdate<'invoices'>;

export interface InvoiceWithStudent extends Invoice {
  student?: {
    id: string;
    roll_number: string | null;
    user_id: string;
    property_id?: string | null;
    father_name?: string | null;
    mother_name?: string | null;
    gender?: string | null;
    course?: string | null;
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
      // Paginate through all invoices to bypass Supabase's default 1000-row cap
      const PAGE = 1000;
      const invoicesData: any[] = [];
      let from = 0;
      while (true) {
        let query = supabase
          .from('invoices')
          .select(`
            *,
            student:students(id, roll_number, user_id, property_id, father_name, mother_name, gender, course)
          `)
          .order('created_at', { ascending: false })
          .range(from, from + PAGE - 1);

        if (studentId) {
          query = query.eq('student_id', studentId);
        }

        const { data, error } = await query;
        if (error) throw error;
        if (!data || data.length === 0) break;
        invoicesData.push(...data);
        if (data.length < PAGE) break;
        from += PAGE;
      }
      if (invoicesData.length === 0) return [] as InvoiceWithStudent[];

      const userIds = Array.from(new Set(
        invoicesData
          .map(inv => inv.student?.user_id)
          .filter((id): id is string => !!id)
      ));

      // Chunk profiles fetch in batches of 500 to bypass Supabase's 1000-row cap
      const profilesMap = new Map<string, any>();
      for (let i = 0; i < userIds.length; i += 500) {
        const chunk = userIds.slice(i, i + 500);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, email, phone')
          .in('id', chunk);
        profilesData?.forEach(p => profilesMap.set(p.id, p));
      }

      const result = invoicesData.map(invoice => ({
        ...invoice,
        student: invoice.student ? {
          ...invoice.student,
          profile: profilesMap.get(invoice.student.user_id) || null,
        } : (invoice.student_id === null ? {
          id: '',
          roll_number: '-',
          user_id: '',
          profile: { full_name: 'Deleted Student', email: null, phone: null },
        } : null),
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
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['invoices-paginated'] });
      queryClient.invalidateQueries({ queryKey: ['student-all-invoices'] });
      toast({ title: 'Invoice Created', description: 'New invoice has been generated.' });
      // Notify student
      const userId = await getStudentUserId(data.student_id);
      if (userId) {
        createNotification(userId, "New Invoice", `A new invoice (₹${data.total_amount.toLocaleString('en-IN')}) has been generated for you.`, "billing", "/student/invoices");
      }
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
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
      toast({ title: 'Invoice Updated', description: 'Invoice has been updated.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const recordPayment = useMutation({
    mutationFn: async ({
      id,
      amount,
      method,
      studentId: payStudentId,
      propertyId,
      reference,
      modeLabel,
      paidAt,
    }: {
      id: string;
      amount: number;
      method: string;
      studentId?: string;
      propertyId?: string;
      reference?: string;
      modeLabel?: string;
      paidAt?: string;
    }) => {
      // Resolve student & property if not supplied. The DB trigger will
      // recompute invoice.paid_amount / status from this payments row, and
      // enforce the 3-partial-payments-per-invoice rule.
      const { data: current, error: fetchError } = await supabase
        .from('invoices')
        .select('student_id, total_amount, paid_amount')
        .eq('id', id)
        .single();
      if (fetchError) throw fetchError;

      const sId = payStudentId || current.student_id;
      if (!sId) throw new Error('Invoice has no associated student');

      let pId = propertyId;
      if (!pId) {
        const { data: bedData } = await supabase
          .from('beds')
          .select('room_id, rooms(floor_id, floors(block_id, blocks(property_id)))')
          .eq('student_id', sId)
          .limit(1)
          .maybeSingle();
        pId = (bedData as any)?.rooms?.floors?.blocks?.property_id;
      }
      if (!pId) {
        const { data: stu } = await supabase
          .from('students')
          .select('property_id')
          .eq('id', sId)
          .maybeSingle();
        pId = (stu as any)?.property_id || undefined;
      }
      if (!pId) throw new Error('Could not resolve a property for this student');

      const { error: payErr } = await supabase.from('payments').insert({
        invoice_id: id,
        student_id: sId,
        property_id: pId,
        amount,
        payment_method: method,
        payment_mode_label: modeLabel || method,
        transaction_reference: reference || null,
        status: 'completed',
        recorded_by: user?.id || null,
        paid_at: paidAt || new Date().toISOString(),
      } as any);
      if (payErr) throw payErr;

      // Return the freshly-reconciled invoice
      const { data: updated } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', id)
        .single();
      return updated as Invoice;
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      toast({ title: 'Payment Recorded', description: 'Payment has been recorded successfully.' });
      const userId = await getStudentUserId(data.student_id);
      if (userId) {
        createNotification(userId, "Payment Received", `Your payment has been recorded. Thank you!`, "billing", "/student/invoices");
      }
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const processRefund = useMutation({
    mutationFn: async ({
      invoiceId,
      studentId: refundStudentId,
      propertyId: refundPropertyId,
      amount,
      reason,
      refundMethod,
    }: {
      invoiceId: string;
      studentId: string;
      propertyId: string;
      amount: number;
      reason: string;
      refundMethod: string;
    }) => {
      // Insert refund record. The DB trigger will recompute invoice.paid_amount/status.
      const { error: refundError } = await supabase.from('refunds').insert({
        invoice_id: invoiceId,
        student_id: refundStudentId,
        property_id: refundPropertyId,
        amount,
        reason,
        refund_method: refundMethod,
        status: 'processed',
        processed_by: user?.id || null,
      });
      if (refundError) throw refundError;
    },
    onSuccess: async (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['refunds'] });
      toast({ title: 'Refund Processed', description: 'Refund has been processed successfully.' });
      // Notify student
      const userId = await getStudentUserId(variables.studentId);
      if (userId) {
        createNotification(userId, "Refund Processed", `A refund of ₹${variables.amount.toLocaleString('en-IN')} has been processed.`, "billing", "/student/invoices");
      }
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteInvoice = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('payments').delete().eq('invoice_id', id);
      await supabase.from('refunds').delete().eq('invoice_id', id);
      await supabase.from('payment_transactions').delete().eq('invoice_id', id);
      const { error } = await supabase.from('invoices').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['refunds'] });
      toast({ title: 'Invoice Deleted', description: 'The invoice and related payment records have been removed.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

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
    processRefund,
    deleteInvoice,
  };
}
