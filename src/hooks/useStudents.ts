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

      // Get profiles for these students
      const userIds = studentsData.map(s => s.user_id);
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);

      // Get bed assignments
      const studentIds = studentsData.map(s => s.id);
      const { data: bedsData } = await supabase
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
        .in('student_id', studentIds);

      // Map profiles and beds to students
      const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
      const bedsMap = new Map(bedsData?.map(b => [b.student_id, b]) || []);

      const result = studentsData.map(student => ({
        ...student,
        profile: profilesMap.get(student.user_id) || null,
        bed: bedsMap.get(student.id) || null,
      }));

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
      // Vacate any assigned bed first
      const { data: beds } = await supabase
        .from('beds')
        .select('id')
        .eq('student_id', id);
      
      if (beds && beds.length > 0) {
        const { error: bedError } = await supabase
          .from('beds')
          .update({ student_id: null, status: 'vacant' })
          .eq('student_id', id);
        if (bedError) throw bedError;
      }

      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
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
