import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { formatDistanceToNow } from 'date-fns';

export interface DashboardStats {
  totalStudents: number;
  studentsChange: number;
  occupancyRate: number;
  occupancyChange: number;
  pendingDues: number;
  duesChange: number;
  openTickets: number;
  ticketsChange: number;
}

export interface PendingApproval {
  id: string;
  type: 'Gate Pass' | 'Leave Request';
  studentName: string;
  room: string;
  details: string;
  time: string;
  createdAt: string;
  studentId: string;
}

export interface RecentActivityItem {
  id: string;
  type: 'gate_pass' | 'payment' | 'ticket' | 'check_in' | 'late_entry';
  title: string;
  description: string;
  time: string;
  createdAt: string;
}

export interface OccupancyData {
  month: string;
  occupancy: number;
}

export interface UserProperty {
  id: string;
  name: string;
  organizationId: string | null;
  organizationName?: string;
}

export function useDashboard() {
  const { user } = useAuth();

  // Fetch user's property context
  const propertyQuery = useQuery({
    queryKey: ['user-property', user?.id],
    queryFn: async () => {
      // First try to get property owned by user
      const { data: ownedProperty, error: ownedError } = await supabase
        .from('properties')
        .select(`
          id,
          name,
          organization_id,
          organization:organizations(name)
        `)
        .eq('owner_id', user!.id)
        .limit(1)
        .maybeSingle();
      
      if (ownedProperty) {
        return {
          id: ownedProperty.id,
          name: ownedProperty.name,
          organizationId: ownedProperty.organization_id,
          organizationName: (ownedProperty.organization as any)?.name || null,
        } as UserProperty;
      }

      // If no owned property, try to get organization's first property
      const { data: orgData } = await supabase
        .from('organizations')
        .select('id, name')
        .eq('owner_id', user!.id)
        .limit(1)
        .maybeSingle();

      if (orgData) {
        const { data: orgProperty } = await supabase
          .from('properties')
          .select('id, name, organization_id')
          .eq('organization_id', orgData.id)
          .limit(1)
          .maybeSingle();
        
        if (orgProperty) {
          return {
            id: orgProperty.id,
            name: orgProperty.name,
            organizationId: orgProperty.organization_id,
            organizationName: orgData.name,
          } as UserProperty;
        }
      }

      return null;
    },
    enabled: !!user,
  });

  // Fetch dashboard statistics
  const statsQuery = useQuery({
    queryKey: ['dashboard-stats', user?.id, propertyQuery.data?.id],
    queryFn: async () => {
      const propertyId = propertyQuery.data?.id;

      // Get total students
      const { count: totalStudents } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true });

      // Get occupancy data
      const { count: totalBeds } = await supabase
        .from('beds')
        .select('*', { count: 'exact', head: true });

      const { count: occupiedBeds } = await supabase
        .from('beds')
        .select('*', { count: 'exact', head: true })
        .not('student_id', 'is', null);

      const occupancyRate = totalBeds && totalBeds > 0 
        ? Math.round((occupiedBeds || 0) / totalBeds * 100 * 10) / 10
        : 0;

      // Get pending dues
      const { data: invoicesData } = await supabase
        .from('invoices')
        .select('total_amount, paid_amount')
        .neq('status', 'paid');

      const pendingDues = invoicesData?.reduce((sum, inv) => {
        return sum + (inv.total_amount - (inv.paid_amount || 0));
      }, 0) || 0;

      // Get open tickets
      const { count: openTickets } = await supabase
        .from('maintenance_tickets')
        .select('*', { count: 'exact', head: true })
        .in('status', ['open', 'in_progress']);

      return {
        totalStudents: totalStudents || 0,
        studentsChange: 0, // Could calculate from last month
        occupancyRate,
        occupancyChange: 0,
        pendingDues,
        duesChange: 0,
        openTickets: openTickets || 0,
        ticketsChange: 0,
      } as DashboardStats;
    },
    enabled: !!user,
  });

  // Fetch pending approvals (gate passes)
  const approvalsQuery = useQuery({
    queryKey: ['pending-approvals', user?.id],
    queryFn: async () => {
      const { data: passes, error } = await supabase
        .from('gate_passes')
        .select(`
          id,
          pass_type,
          reason,
          out_date,
          expected_return,
          created_at,
          student:students(
            id,
            roll_number,
            user_id
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error || !passes) return [];

      // Get student profiles
      const userIds = passes.map(p => (p.student as any)?.user_id).filter(Boolean);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      const profilesMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);

      // Get bed/room info for students
      const studentIds = passes.map(p => (p.student as any)?.id).filter(Boolean);
      const { data: beds } = await supabase
        .from('beds')
        .select(`
          student_id,
          bed_number,
          room:rooms(room_number)
        `)
        .in('student_id', studentIds);

      const bedsMap = new Map(beds?.map(b => [b.student_id, b]) || []);

      return passes.map(pass => {
        const student = pass.student as any;
        const bed = bedsMap.get(student?.id);
        const roomDisplay = bed ? `Room ${(bed.room as any)?.room_number}` : 'N/A';

        return {
          id: pass.id,
          type: 'Gate Pass' as const,
          studentName: profilesMap.get(student?.user_id) || 'Unknown',
          room: roomDisplay,
          details: pass.reason || `${pass.pass_type} leave`,
          time: formatDistanceToNow(new Date(pass.created_at), { addSuffix: true }),
          createdAt: pass.created_at,
          studentId: student?.id,
        } as PendingApproval;
      });
    },
    enabled: !!user,
  });

  // Fetch recent activity
  const activityQuery = useQuery({
    queryKey: ['recent-activity', user?.id],
    queryFn: async () => {
      const activities: RecentActivityItem[] = [];

      // Get recent gate passes (approved)
      const { data: recentPasses } = await supabase
        .from('gate_passes')
        .select(`
          id,
          status,
          reason,
          created_at,
          student:students(
            user_id
          )
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(3);

      if (recentPasses) {
        const userIds = recentPasses.map(p => (p.student as any)?.user_id).filter(Boolean);
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', userIds);
        
        const profilesMap = new Map(profiles?.map(p => [p.id, p.full_name]) || []);

        recentPasses.forEach(pass => {
          const student = pass.student as any;
          activities.push({
            id: `pass-${pass.id}`,
            type: 'gate_pass',
            title: 'Gate pass approved',
            description: `${profilesMap.get(student?.user_id) || 'Student'} - ${pass.reason || 'Leave'}`,
            time: formatDistanceToNow(new Date(pass.created_at), { addSuffix: true }),
            createdAt: pass.created_at,
          });
        });
      }

      // Get recent payments
      const { data: recentPayments } = await supabase
        .from('invoices')
        .select(`
          id,
          paid_amount,
          payment_date,
          student:students(
            user_id
          )
        `)
        .eq('status', 'paid')
        .order('payment_date', { ascending: false })
        .limit(2);

      if (recentPayments) {
        recentPayments.forEach(payment => {
          if (payment.payment_date) {
            activities.push({
              id: `payment-${payment.id}`,
              type: 'payment',
              title: 'Payment received',
              description: `₹${(payment.paid_amount || 0).toLocaleString()}`,
              time: formatDistanceToNow(new Date(payment.payment_date), { addSuffix: true }),
              createdAt: payment.payment_date,
            });
          }
        });
      }

      // Get recent resolved tickets
      const { data: recentTickets } = await supabase
        .from('maintenance_tickets')
        .select('id, title, resolved_at, category')
        .eq('status', 'resolved')
        .order('resolved_at', { ascending: false })
        .limit(2);

      if (recentTickets) {
        recentTickets.forEach(ticket => {
          if (ticket.resolved_at) {
            activities.push({
              id: `ticket-${ticket.id}`,
              type: 'ticket',
              title: 'Ticket resolved',
              description: `${ticket.category} - ${ticket.title}`,
              time: formatDistanceToNow(new Date(ticket.resolved_at), { addSuffix: true }),
              createdAt: ticket.resolved_at,
            });
          }
        });
      }

      // Sort by date
      return activities.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ).slice(0, 5);
    },
    enabled: !!user,
  });

  // Occupancy chart data (mock for now - could be calculated from historical data)
  const occupancyChartData: OccupancyData[] = [
    { month: 'Jan', occupancy: statsQuery.data?.occupancyRate || 0 },
    { month: 'Feb', occupancy: statsQuery.data?.occupancyRate || 0 },
    { month: 'Mar', occupancy: statsQuery.data?.occupancyRate || 0 },
    { month: 'Apr', occupancy: statsQuery.data?.occupancyRate || 0 },
    { month: 'May', occupancy: statsQuery.data?.occupancyRate || 0 },
    { month: 'Jun', occupancy: statsQuery.data?.occupancyRate || 0 },
    { month: 'Jul', occupancy: statsQuery.data?.occupancyRate || 0 },
    { month: 'Aug', occupancy: statsQuery.data?.occupancyRate || 0 },
    { month: 'Sep', occupancy: statsQuery.data?.occupancyRate || 0 },
    { month: 'Oct', occupancy: statsQuery.data?.occupancyRate || 0 },
    { month: 'Nov', occupancy: statsQuery.data?.occupancyRate || 0 },
    { month: 'Dec', occupancy: statsQuery.data?.occupancyRate || 0 },
  ];

  const refetchAll = async () => {
    await Promise.all([
      propertyQuery.refetch(),
      statsQuery.refetch(),
      approvalsQuery.refetch(),
      activityQuery.refetch(),
    ]);
  };

  return {
    property: propertyQuery.data,
    stats: statsQuery.data || {
      totalStudents: 0,
      studentsChange: 0,
      occupancyRate: 0,
      occupancyChange: 0,
      pendingDues: 0,
      duesChange: 0,
      openTickets: 0,
      ticketsChange: 0,
    },
    pendingApprovals: approvalsQuery.data || [],
    recentActivity: activityQuery.data || [],
    occupancyChartData,
    isLoading: statsQuery.isLoading || propertyQuery.isLoading,
    refetchAll,
  };
}