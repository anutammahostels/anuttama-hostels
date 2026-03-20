import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { BedDouble, Search, Users, Loader2, Eye, Plus, UserPlus, Trash2 } from "lucide-react";
import { useRooms, type RoomWithDetails } from "@/hooks/useRooms";
import { useStudents, type StudentWithProfile } from "@/hooks/useStudents";
import { useDashboard } from "@/hooks/useDashboard";
import { useToast } from "@/hooks/use-toast";

const getBedStatusColor = (status: string | null) => {
  switch (status) {
    case "occupied": return "bg-green-500";
    case "vacant": return "bg-blue-500";
    case "reserved": return "bg-yellow-500";
    case "maintenance": return "bg-red-500";
    default: return "bg-gray-500";
  }
};

const getBedStatusBg = (status: string | null, hasStudent: boolean) => {
  if (hasStudent) return "bg-green-500/10 border-green-500/30";
  switch (status) {
    case "occupied": return "bg-green-500/10 border-green-500/30";
    case "vacant": return "bg-blue-500/10 border-blue-500/30 cursor-pointer hover:bg-blue-500/20";
    case "reserved": return "bg-yellow-500/10 border-yellow-500/30";
    case "maintenance": return "bg-red-500/10 border-red-500/30";
    default: return "bg-gray-500/10";
  }
};

const RoomAllocation = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBlock, setSelectedBlock] = useState<string>("all");
  const [selectedFloor, setSelectedFloor] = useState<string>("all");
  const [allocationDialog, setAllocationDialog] = useState<{ open: boolean; bedId: string | null; roomNumber: string }>({ open: false, bedId: null, roomNumber: "" });
  const [selectedStudent, setSelectedStudent] = useState<string>("");

  // Add Room dialog state
  const [addRoomDialog, setAddRoomDialog] = useState(false);
  const [addRoomStep, setAddRoomStep] = useState<'select' | 'new_block' | 'new_floor' | 'room_details'>('select');
  const [newBlockName, setNewBlockName] = useState("");
  const [newFloorNumber, setNewFloorNumber] = useState("");
  const [selectedBlockId, setSelectedBlockId] = useState("");
  const [selectedFloorId, setSelectedFloorId] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [roomCapacity, setRoomCapacity] = useState("1");
  const [roomType, setRoomType] = useState("shared");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [bedCount, setBedCount] = useState("1");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { property } = useDashboard();
  const { rooms, blocks, floors, stats, isLoading, assignBed, vacateBed, createBlock, createFloor, createRoom, createBed, deleteRoom } = useRooms(property?.id);
  const { students } = useStudents();
  const { toast } = useToast();

  // Get unique floors from rooms
  const uniqueFloors = [...new Set(rooms.map(r => r.floor?.floor_number).filter(Boolean))].sort((a, b) => (a || 0) - (b || 0));

  // Get floors for selected block in dialog
  const floorsForBlock = floors?.filter((f: any) => f.block_id === selectedBlockId || f.block?.id === selectedBlockId) || [];

  // Filter rooms
  const filteredRooms = rooms.filter(room => {
    const matchesBlock = selectedBlock === "all" || room.floor?.block?.id === selectedBlock;
    const matchesFloor = selectedFloor === "all" || room.floor?.floor_number?.toString() === selectedFloor;
    const matchesSearch = searchQuery === "" || 
      room.room_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.beds?.some(bed => bed.student_id);
    return matchesBlock && matchesFloor && matchesSearch;
  });

  // Get unassigned students for allocation
  const unassignedStudents = students.filter(s => !s.bed);

  const handleAllocateBed = async () => {
    if (!allocationDialog.bedId || !selectedStudent) return;
    await assignBed.mutateAsync({ bedId: allocationDialog.bedId, studentId: selectedStudent });
    setAllocationDialog({ open: false, bedId: null, roomNumber: "" });
    setSelectedStudent("");
  };

  const handleVacateBed = async (bedId: string) => {
    await vacateBed.mutateAsync(bedId);
  };

  const getStudentName = (studentId: string | null) => {
    if (!studentId) return null;
    const student = students.find(s => s.id === studentId);
    return student?.profile?.full_name || "Unknown";
  };

  const resetAddRoomDialog = () => {
    setAddRoomDialog(false);
    setAddRoomStep('select');
    setNewBlockName("");
    setNewFloorNumber("");
    setSelectedBlockId("");
    setSelectedFloorId("");
    setRoomNumber("");
    setRoomCapacity("1");
    setRoomType("shared");
    setMonthlyRent("");
    setBedCount("1");
    setIsSubmitting(false);
  };

  const handleCreateBlock = async () => {
    if (!newBlockName || !property?.id) return;
    setIsSubmitting(true);
    try {
      const block = await createBlock.mutateAsync({ name: newBlockName, property_id: property.id });
      setSelectedBlockId(block.id);
      setNewBlockName("");
      setAddRoomStep('select');
      toast({ title: "Block created", description: `Block "${block.name}" created successfully.` });
    } catch {
      // error handled by hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateFloor = async () => {
    if (!newFloorNumber || !selectedBlockId) return;
    setIsSubmitting(true);
    try {
      const floor = await createFloor.mutateAsync({ 
        block_id: selectedBlockId, 
        floor_number: parseInt(newFloorNumber),
        name: `Floor ${newFloorNumber}`,
      });
      setSelectedFloorId(floor.id);
      setNewFloorNumber("");
      setAddRoomStep('room_details');
      toast({ title: "Floor created", description: `Floor ${newFloorNumber} created successfully.` });
    } catch {
      // error handled by hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateRoom = async () => {
    if (!roomNumber || !selectedFloorId) return;
    setIsSubmitting(true);
    try {
      const room = await createRoom.mutateAsync({
        floor_id: selectedFloorId,
        room_number: roomNumber,
        capacity: parseInt(roomCapacity),
        room_type: roomType,
        monthly_rent: monthlyRent ? parseFloat(monthlyRent) : null,
        status: 'available',
      });

      // Create beds
      const numBeds = parseInt(bedCount);
      for (let i = 1; i <= numBeds; i++) {
        await createBed.mutateAsync({
          room_id: room.id,
          bed_number: i.toString(),
          status: 'vacant',
        });
      }

      toast({ title: "Room created", description: `Room ${roomNumber} with ${numBeds} bed(s) created.` });
      resetAddRoomDialog();
    } catch {
      // error handled by hook
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Room Allocation</h1>
            <p className="text-muted-foreground">Visual room and bed management</p>
          </div>
          <Button className="gradient-primary text-white" onClick={() => setAddRoomDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Room
          </Button>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <div>
                <p className="text-2xl font-bold">{stats.occupiedBeds}</p>
                <p className="text-sm text-muted-foreground">Occupied Beds</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <div>
                <p className="text-2xl font-bold">{stats.availableBeds}</p>
                <p className="text-sm text-muted-foreground">Available Beds</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <div>
                <p className="text-2xl font-bold">{stats.totalRooms}</p>
                <p className="text-sm text-muted-foreground">Total Rooms</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <div>
                <p className="text-2xl font-bold">{stats.totalBeds}</p>
                <p className="text-sm text-muted-foreground">Total Beds</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={selectedBlock} onValueChange={setSelectedBlock}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Select Block" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">All Blocks</SelectItem>
                  {blocks.map(block => (
                    <SelectItem key={block.id} value={block.id}>{block.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedFloor} onValueChange={setSelectedFloor}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Floor" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">All Floors</SelectItem>
                  {uniqueFloors.map(floor => (
                    <SelectItem key={floor} value={floor?.toString() || ""}>Floor {floor}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search room..." 
                  className="pl-10" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500"></div>
            <span>Occupied</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500"></div>
            <span>Reserved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500"></div>
            <span>Maintenance</span>
          </div>
        </div>

        {/* Room Grid */}
        {filteredRooms.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="p-12 text-center">
              <BedDouble className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Rooms Found</h3>
              <p className="text-muted-foreground mb-4">
                {rooms.length === 0 ? "Add rooms to your property to get started" : "Try adjusting your filters"}
              </p>
              <Button className="gradient-primary text-white" onClick={() => setAddRoomDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Room
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRooms.map((room) => (
              <Card key={room.id} className="border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BedDouble className="h-5 w-5 text-primary" />
                      Room {room.room_number}
                    </CardTitle>
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-xs">
                        {room.floor?.block?.name || "Block"} - F{room.floor?.floor_number}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {room.beds && room.beds.length > 0 ? (
                      room.beds.map((bed) => (
                        <div
                          key={bed.id}
                          className={`p-3 rounded-lg border ${getBedStatusBg(bed.status, !!bed.student_id)} transition-colors`}
                          onClick={() => {
                            if (!bed.student_id && bed.status === 'vacant') {
                              setAllocationDialog({ open: true, bedId: bed.id, roomNumber: room.room_number });
                            }
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${getBedStatusColor(bed.student_id ? 'occupied' : bed.status)}`}></div>
                              <span className="font-medium">Bed {bed.bed_number}</span>
                            </div>
                            {bed.student_id && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-6 text-xs text-red-500 hover:text-red-600"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleVacateBed(bed.id);
                                }}
                              >
                                Vacate
                              </Button>
                            )}
                          </div>
                          {bed.student_id ? (
                            <p className="text-sm text-muted-foreground mt-1 ml-4">
                              {getStudentName(bed.student_id)}
                            </p>
                          ) : bed.status === 'vacant' && (
                            <p className="text-sm text-blue-500 mt-1 ml-4 flex items-center gap-1">
                              <UserPlus className="h-3 w-3" />
                              Click to assign
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">No beds configured</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Allocation Dialog */}
        <Dialog open={allocationDialog.open} onOpenChange={(open) => setAllocationDialog({ ...allocationDialog, open })}>
          <DialogContent className="bg-background">
            <DialogHeader>
              <DialogTitle>Assign Student to Bed</DialogTitle>
              <DialogDescription>
                Select a student to assign to Room {allocationDialog.roomNumber}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger>
                  <SelectValue placeholder="Select student..." />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {unassignedStudents.length === 0 ? (
                    <SelectItem value="none" disabled>No unassigned students</SelectItem>
                  ) : (
                    unassignedStudents.map(student => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.profile?.full_name || "Unknown"} ({student.roll_number || "No Roll #"})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAllocationDialog({ open: false, bedId: null, roomNumber: "" })}>
                Cancel
              </Button>
              <Button 
                onClick={handleAllocateBed} 
                disabled={!selectedStudent || assignBed.isPending}
                className="gradient-primary text-white"
              >
                {assignBed.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Assign"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Room Dialog */}
        <Dialog open={addRoomDialog} onOpenChange={(open) => { if (!open) resetAddRoomDialog(); }}>
          <DialogContent className="bg-background sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {addRoomStep === 'new_block' ? 'Create New Block' : 
                 addRoomStep === 'new_floor' ? 'Create New Floor' : 
                 addRoomStep === 'room_details' ? 'Room Details' : 'Add Room'}
              </DialogTitle>
              <DialogDescription>
                {addRoomStep === 'select' ? 'Select or create a block and floor, then add room details.' :
                 addRoomStep === 'new_block' ? 'Create a new block for your property.' :
                 addRoomStep === 'new_floor' ? 'Add a floor to the selected block.' :
                 'Enter room and bed details.'}
              </DialogDescription>
            </DialogHeader>

            {addRoomStep === 'select' && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Block</Label>
                  <div className="flex gap-2">
                    <Select value={selectedBlockId} onValueChange={(v) => { setSelectedBlockId(v); setSelectedFloorId(""); }}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select block..." />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {blocks.map(block => (
                          <SelectItem key={block.id} value={block.id}>{block.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="icon" onClick={() => setAddRoomStep('new_block')}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {selectedBlockId && (
                  <div className="space-y-2">
                    <Label>Floor</Label>
                    <div className="flex gap-2">
                      <Select value={selectedFloorId} onValueChange={setSelectedFloorId}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select floor..." />
                        </SelectTrigger>
                        <SelectContent className="bg-popover">
                          {floorsForBlock.map((floor: any) => (
                            <SelectItem key={floor.id} value={floor.id}>Floor {floor.floor_number}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="icon" onClick={() => setAddRoomStep('new_floor')}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <DialogFooter>
                  <Button variant="outline" onClick={resetAddRoomDialog}>Cancel</Button>
                  <Button 
                    disabled={!selectedBlockId || !selectedFloorId}
                    className="gradient-primary text-white"
                    onClick={() => setAddRoomStep('room_details')}
                  >
                    Next
                  </Button>
                </DialogFooter>
              </div>
            )}

            {addRoomStep === 'new_block' && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Block Name</Label>
                  <Input placeholder="e.g. Block A, Boys Hostel" value={newBlockName} onChange={(e) => setNewBlockName(e.target.value)} />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddRoomStep('select')}>Back</Button>
                  <Button disabled={!newBlockName || isSubmitting} className="gradient-primary text-white" onClick={handleCreateBlock}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Block"}
                  </Button>
                </DialogFooter>
              </div>
            )}

            {addRoomStep === 'new_floor' && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Floor Number</Label>
                  <Input type="number" placeholder="e.g. 1, 2, 3" value={newFloorNumber} onChange={(e) => setNewFloorNumber(e.target.value)} />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddRoomStep('select')}>Back</Button>
                  <Button disabled={!newFloorNumber || isSubmitting} className="gradient-primary text-white" onClick={handleCreateFloor}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Floor"}
                  </Button>
                </DialogFooter>
              </div>
            )}

            {addRoomStep === 'room_details' && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Room Number *</Label>
                    <Input placeholder="e.g. 101" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Room Type</Label>
                    <Select value={roomType} onValueChange={setRoomType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="shared">Shared</SelectItem>
                        <SelectItem value="suite">Suite</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Number of Beds *</Label>
                    <Input type="number" min="1" max="10" value={bedCount} onChange={(e) => setBedCount(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Monthly Rent (₹)</Label>
                    <Input type="number" placeholder="Optional" value={monthlyRent} onChange={(e) => setMonthlyRent(e.target.value)} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddRoomStep('select')}>Back</Button>
                  <Button disabled={!roomNumber || isSubmitting} className="gradient-primary text-white" onClick={handleCreateRoom}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Room"}
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default RoomAllocation;
