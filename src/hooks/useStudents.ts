import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Student = Tables<'students'>;
export type StudentInsert = TablesInsert<'students'>;
export type StudentUpdate = TablesUpdate<'students'>;

export interface StudentWithProfile extends Student {
  profile?: {
    id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
    avatar_url: string | null;
  } | null;
  bed?: {
    id: string;
    bed_number: string;
    room?: {
      id: string;
      room_number: string;
      floor?: {
        id: string;
        floor_number: number;
        block?: {
          id: string;
          name: string;
        } | null;
      } | null;
    } | null;
  } | null;
  finance?: {
    totalPaid: number;
    pending: number;
    lastPaymentMode: string | null;
    lastTransactionDetails: string | null;
    lastUtr: string | null;
    lastPaymentDate: string | null;
    payments: Array<{
      amount: number;
      mode: string | null;
      txn: string | null;
      utr: string | null;
      label: string | null;
      paid_at: string | null;
    }>;
  };
}

export function useStudents(propertyId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const studentsQuery = useQuery({
    queryKey: ['students', user?.id, propertyId],
    queryFn: async () => {
      // Get students
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (studentsError) throw studentsError;
      if (!studentsData || studentsData.length === 0) return [] as StudentWithProfile[];

      // Helper: chunk arrays to keep PostgREST URL length under limits
      const chunk = <T,>(arr: T[], size: number): T[][] => {
        const out: T[][] = [];
        for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
        return out;
      };

      // Get profiles for these students (batched)
      const userIds = studentsData.map(s => s.user_id).filter(Boolean);
      const profileChunks = await Promise.all(
        chunk(userIds, 200).map(ids =>
          supabase.from('profiles').select('*').in('id', ids).then(r => r.data || [])
        )
      );
      const profilesData = profileChunks.flat();

      // Get bed assignments (batched)
      const studentIds = studentsData.map(s => s.id);
      const bedChunks = await Promise.all(
        chunk(studentIds, 200).map(ids =>
          supabase
            .from('beds')
            .select(`
              id,
              bed_number,
              student_id,
              room:rooms(
                id,
                room_number,
                floor:floors(
                  id,
                  floor_number,
                  block:blocks(id, name)
                )
              )
            `)
            .in('student_id', ids)
            .then(r => r.data || [])
        )
      );
      const bedsData = bedChunks.flat();

      // Get payments + invoices for finance summary (batched)
      const paymentChunks = await Promise.all(
        chunk(studentIds, 200).map(ids =>
          supabase
            .from('payments')
            .select('student_id, amount, payment_mode_label, payment_method, transaction_id, transaction_reference, payment_label, paid_at')
            .in('student_id', ids)
            .order('paid_at', { ascending: false })
            .then(r => r.data || [])
        )
      );
      const paymentsData = paymentChunks.flat();

      const invoiceChunks = await Promise.all(
        chunk(studentIds, 200).map(ids =>
          supabase
            .from('invoices')
            .select('student_id, total_amount, paid_amount, status')
            .in('student_id', ids)
            .then(r => r.data || [])
        )
      );
      const invoicesData = invoiceChunks.flat();

      // Map profiles and beds to students
      const profilesMap = new Map(profilesData.map(p => [p.id, p]));
      const bedsMap = new Map(bedsData.map(b => [b.student_id, b]));

      const paymentsByStudent = new Map<string, typeof paymentsData>();
      paymentsData.forEach(p => {
        if (!p.student_id) return;
        const list = paymentsByStudent.get(p.student_id) || [];
        list.push(p);
        paymentsByStudent.set(p.student_id, list);
      });
      const invoicesByStudent = new Map<string, typeof invoicesData>();
      invoicesData.forEach(i => {
        if (!i.student_id) return;
        const list = invoicesByStudent.get(i.student_id) || [];
        list.push(i);
        invoicesByStudent.set(i.student_id, list);
      });

      const result = studentsData.map(student => {
        const pays = paymentsByStudent.get(student.id) || [];
        const invs = invoicesByStudent.get(student.id) || [];
        const totalPaid = pays.reduce((s, p) => s + Number(p.amount || 0), 0);
        const invoiceTotal = invs.reduce((s, i) => s + Number(i.total_amount || 0), 0);
        const finalFee = Number((student as any).final_fee || 0);
        const totalDue = Math.max(invoiceTotal, finalFee);
        const pending = Math.max(totalDue - totalPaid, 0);
        const last = pays[0];
        return {
          ...student,
          profile: profilesMap.get(student.user_id) || null,
          bed: bedsMap.get(student.id) || null,
          finance: {
            totalPaid,
            pending,
            lastPaymentMode: last?.payment_mode_label || last?.payment_method || null,
            lastTransactionDetails: last?.transaction_id || null,
            lastUtr: last?.transaction_reference || null,
            lastPaymentDate: last?.paid_at || null,
            payments: pays.map(p => ({
              amount: Number(p.amount || 0),
              mode: p.payment_mode_label || p.payment_method || null,
              txn: p.transaction_id || null,
              utr: p.transaction_reference || null,
              label: p.payment_label || null,
              paid_at: p.paid_at || null,
            })),
          },
        };
      });

      return result as StudentWithProfile[];
    },
    enabled: !!user,
  });

  const createStudent = useMutation({
    mutationFn: async (input: StudentInsert & { full_name: string; email: string; phone?: string }) => {
      // First create auth user and profile
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: input.email,
        password: Math.random().toString(36).slice(-8) + 'A1!', // Temp password
        options: {
          data: { full_name: input.full_name },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');

      // Create student record
      const { data, error } = await supabase
        .from('students')
        .insert({
          user_id: authData.user.id,
          roll_number: input.roll_number,
          course: input.course,
          department: input.department,
          year: input.year,
          date_of_birth: input.date_of_birth,
          blood_group: input.blood_group,
          emergency_contact: input.emergency_contact,
          admission_date: input.admission_date || new Date().toISOString().split('T')[0],
          status: 'active',
        })
        .select()
        .single();
      
      if (error) throw error;

      // Add student role
      await supabase
        .from('user_roles')
        .insert({ user_id: authData.user.id, role: 'student' });

      return data as Student;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast({
        title: 'Student Added',
        description: 'New student has been registered successfully.',
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

  const updateStudent = useMutation({
    mutationFn: async ({ id, ...updates }: StudentUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('students')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Student;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast({
        title: 'Student Updated',
        description: 'Student details have been updated.',
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

  const deleteStudent = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.functions.invoke('delete-student', {
        body: { student_id: id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast({
        title: 'Student Removed',
        description: 'Student has been removed from the system.',
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
    total: studentsQuery.data?.length || 0,
    active: studentsQuery.data?.filter(s => s.status === 'active').length || 0,
    onLeave: studentsQuery.data?.filter(s => s.status === 'on_leave').length || 0,
    inactive: studentsQuery.data?.filter(s => s.status === 'inactive').length || 0,
  };

  return {
    students: studentsQuery.data || [],
    stats,
    isLoading: studentsQuery.isLoading,
    error: studentsQuery.error,
    refetch: studentsQuery.refetch,
    createStudent,
    updateStudent,
    deleteStudent,
  };
}
