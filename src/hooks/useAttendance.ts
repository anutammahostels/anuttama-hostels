import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Attendance {
  id: string;
  student_id: string;
  property_id: string;
  date: string;
  status: 'present' | 'absent' | 'leave' | 'late';
  marked_by: string | null;
  notes: string | null;
  created_at: string;
}

export interface AttendanceWithStudent extends Attendance {
  student?: {
    id: string;
    roll_number: string | null;
    user_id: string;
    profile?: {
      full_name: string | null;
    } | null;
  } | null;
}

export interface MarkAttendanceInput {
  student_id: string;
  property_id: string;
  date?: string;
  status: 'present' | 'absent' | 'leave' | 'late';
  notes?: string;
}

export function useAttendance(propertyId?: string, date?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const today = date || new Date().toISOString().split('T')[0];

  const attendanceQuery = useQuery({
    queryKey: ['attendance', propertyId, today],
    queryFn: async () => {
      let query = supabase
        .from('attendance')
        .select(`
          *,
          student:students(id, roll_number, user_id)
        `)
        .eq('date', today)
        .order('created_at', { ascending: false });
      
      if (propertyId) {
        query = query.eq('property_id', propertyId);
      }
      
      const { data: attendanceData, error: attendanceError } = await query;
      if (attendanceError) throw attendanceError;
      if (!attendanceData || attendanceData.length === 0) return [] as AttendanceWithStudent[];

      // Get profiles for students
      const userIds = attendanceData
        .map(a => a.student?.user_id)
        .filter((id): id is string => !!id);

      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);

      const result = attendanceData.map(att => ({
        ...att,
        student: att.student ? {
          ...att.student,
          profile: profilesMap.get(att.student.user_id) || null,
        } : null,
      }));

      return result as AttendanceWithStudent[];
    },
    enabled: !!user,
  });

  const markAttendance = useMutation({
    mutationFn: async (input: MarkAttendanceInput) => {
      const { data, error } = await supabase
        .from('attendance')
        .upsert({
          student_id: input.student_id,
          property_id: input.property_id,
          date: input.date || today,
          status: input.status,
          marked_by: user?.id,
          notes: input.notes || null,
        }, {
          onConflict: 'student_id,date',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as Attendance;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const bulkMarkAttendance = useMutation({
    mutationFn: async (records: MarkAttendanceInput[]) => {
      const toInsert = records.map(r => ({
        student_id: r.student_id,
        property_id: r.property_id,
        date: r.date || today,
        status: r.status,
        marked_by: user?.id,
        notes: r.notes || null,
      }));

      const { data, error } = await supabase
        .from('attendance')
        .upsert(toInsert, {
          onConflict: 'student_id,date',
        })
        .select();
      
      if (error) throw error;
      return data as Attendance[];
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast({
        title: 'Attendance Marked',
        description: `Attendance marked for ${data.length} students.`,
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
    total: attendanceQuery.data?.length || 0,
    present: attendanceQuery.data?.filter(a => a.status === 'present').length || 0,
    absent: attendanceQuery.data?.filter(a => a.status === 'absent').length || 0,
    leave: attendanceQuery.data?.filter(a => a.status === 'leave').length || 0,
    late: attendanceQuery.data?.filter(a => a.status === 'late').length || 0,
  };

  return {
    attendance: attendanceQuery.data || [],
    stats,
    isLoading: attendanceQuery.isLoading,
    error: attendanceQuery.error,
    refetch: attendanceQuery.refetch,
    markAttendance,
    bulkMarkAttendance,
  };
}
