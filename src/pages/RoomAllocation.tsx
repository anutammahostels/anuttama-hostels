import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BedDouble, Search, Users, Loader2, Eye, Plus, UserPlus } from "lucide-react";
import { useRooms, type RoomWithDetails } from "@/hooks/useRooms";
import { useStudents, type StudentWithProfile } from "@/hooks/useStudents";

const getBedStatusColor = (status: string | null) => {
  switch (status) {
    case "occupied": return "bg-green-500";
    case "available": return "bg-blue-500";
    case "reserved": return "bg-yellow-500";
    case "maintenance": return "bg-red-500";
    default: return "bg-gray-500";
  }
};

const getBedStatusBg = (status: string | null, hasStudent: boolean) => {
  if (hasStudent) return "bg-green-500/10 border-green-500/30";
  switch (status) {
    case "occupied": return "bg-green-500/10 border-green-500/30";
    case "available": return "bg-blue-500/10 border-blue-500/30 cursor-pointer hover:bg-blue-500/20";
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

  const { rooms, blocks, stats, isLoading, assignBed, vacateBed } = useRooms();
  const { students } = useStudents();

  // Get unique floors from rooms
  const uniqueFloors = [...new Set(rooms.map(r => r.floor?.floor_number).filter(Boolean))].sort((a, b) => (a || 0) - (b || 0));

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

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Room Allocation</h1>
            <p className="text-muted-foreground">Visual room and bed management</p>
          </div>
          <Button className="gradient-primary text-white">
            <Users className="h-4 w-4 mr-2" />
            Quick Allocate
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
              <Button className="gradient-primary text-white">
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
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
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
                            if (!bed.student_id && bed.status === 'available') {
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
                          ) : bed.status === 'available' && (
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
      </div>
    </DashboardLayout>
  );
};

export default RoomAllocation;
