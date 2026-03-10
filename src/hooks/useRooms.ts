import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Room = Tables<'rooms'>;
export type RoomInsert = TablesInsert<'rooms'>;
export type RoomUpdate = TablesUpdate<'rooms'>;

export type Bed = Tables<'beds'>;
export type BedInsert = TablesInsert<'beds'>;
export type BedUpdate = TablesUpdate<'beds'>;

export type Block = Tables<'blocks'>;
export type Floor = Tables<'floors'>;

export interface RoomWithDetails extends Room {
  floor?: Floor & {
    block?: Block;
  };
  beds?: Bed[];
}

export function useRooms(propertyId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all blocks for a property
  const blocksQuery = useQuery({
    queryKey: ['blocks', propertyId],
    queryFn: async () => {
      if (!propertyId) return [];
      
      const { data, error } = await supabase
        .from('blocks')
        .select('*')
        .eq('property_id', propertyId)
        .order('name');
      
      if (error) throw error;
      return data as Block[];
    },
    enabled: !!user && !!propertyId,
  });

  // Fetch all floors for a property (via blocks)
  const floorsQuery = useQuery({
    queryKey: ['floors', propertyId],
    queryFn: async () => {
      if (!propertyId) return [];
      
      const { data, error } = await supabase
        .from('floors')
        .select(`
          *,
          block:blocks!inner(id, name, property_id)
        `)
        .eq('block.property_id', propertyId)
        .order('floor_number');
      
      if (error) throw error;
      return data;
    },
    enabled: !!user && !!propertyId,
  });

  // Fetch all rooms with their beds
  const roomsQuery = useQuery({
    queryKey: ['rooms', propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rooms')
        .select(`
          *,
          floor:floors(
            id,
            floor_number,
            name,
            block:blocks(
              id,
              name,
              property_id
            )
          ),
          beds(*)
        `)
        .order('room_number');
      
      if (error) throw error;
      
      // Filter by property if needed
      let filtered = data;
      if (propertyId) {
        filtered = data?.filter(room => 
          room.floor?.block?.property_id === propertyId
        );
      }
      
      return filtered as RoomWithDetails[];
    },
    enabled: !!user,
  });

  const createBlock = useMutation({
    mutationFn: async (input: { name: string; property_id: string; floor_count?: number }) => {
      const { data, error } = await supabase
        .from('blocks')
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data as Block;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blocks'] });
      toast({ title: 'Block Created', description: 'New block has been added.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const createFloor = useMutation({
    mutationFn: async (input: { block_id: string; floor_number: number; name?: string }) => {
      const { data, error } = await supabase
        .from('floors')
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data as Floor;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['floors'] });
      toast({ title: 'Floor Created', description: 'New floor has been added.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const createRoom = useMutation({
    mutationFn: async (input: RoomInsert) => {
      const { data, error } = await supabase
        .from('rooms')
        .insert(input)
        .select()
        .single();
      
      if (error) throw error;
      return data as Room;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast({
        title: 'Room Created',
        description: 'New room has been added successfully.',
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

  const createBed = useMutation({
    mutationFn: async (input: { room_id: string; bed_number: string; status?: string }) => {
      const { data, error } = await supabase
        .from('beds')
        .insert({ ...input, status: input.status || 'available' })
        .select()
        .single();
      if (error) throw error;
      return data as Bed;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast({ title: 'Bed Created', description: 'New bed has been added.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateRoom = useMutation({
    mutationFn: async ({ id, ...updates }: RoomUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('rooms')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Room;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      toast({
        title: 'Room Updated',
        description: 'Room has been updated successfully.',
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

  // Bed operations
  const assignBed = useMutation({
    mutationFn: async ({ bedId, studentId }: { bedId: string; studentId: string }) => {
      const { data, error } = await supabase
        .from('beds')
        .update({ student_id: studentId, status: 'occupied' })
        .eq('id', bedId)
        .select()
        .single();
      
      if (error) throw error;
      return data as Bed;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast({
        title: 'Bed Assigned',
        description: 'Student has been assigned to the bed.',
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

  const vacateBed = useMutation({
    mutationFn: async (bedId: string) => {
      const { data, error } = await supabase
        .from('beds')
        .update({ student_id: null, status: 'available' })
        .eq('id', bedId)
        .select()
        .single();
      
      if (error) throw error;
      return data as Bed;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast({
        title: 'Bed Vacated',
        description: 'Bed is now available.',
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
    totalRooms: roomsQuery.data?.length || 0,
    totalBeds: roomsQuery.data?.reduce((acc, room) => acc + (room.beds?.length || 0), 0) || 0,
    occupiedBeds: roomsQuery.data?.reduce((acc, room) => 
      acc + (room.beds?.filter(bed => bed.student_id)?.length || 0), 0
    ) || 0,
    availableBeds: roomsQuery.data?.reduce((acc, room) => 
      acc + (room.beds?.filter(bed => !bed.student_id && bed.status === 'available')?.length || 0), 0
    ) || 0,
  };

  return {
    rooms: roomsQuery.data || [],
    blocks: blocksQuery.data || [],
    floors: floorsQuery.data || [],
    stats,
    isLoading: roomsQuery.isLoading || blocksQuery.isLoading || floorsQuery.isLoading,
    error: roomsQuery.error || blocksQuery.error || floorsQuery.error,
    refetch: roomsQuery.refetch,
    createBlock,
    createFloor,
    createRoom,
    createBed,
    updateRoom,
    assignBed,
    vacateBed,
  };
}
