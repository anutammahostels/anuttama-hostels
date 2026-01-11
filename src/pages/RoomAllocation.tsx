import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BedDouble, Search, Users, CheckCircle, XCircle, Wrench, Eye } from "lucide-react";

const rooms = [
  { id: "101", floor: 1, beds: [
    { id: "A", status: "occupied", student: "Rahul Sharma", type: "Window" },
    { id: "B", status: "occupied", student: "Amit Kumar", type: "Middle" },
    { id: "C", status: "available", student: null, type: "Door" },
  ]},
  { id: "102", floor: 1, beds: [
    { id: "A", status: "occupied", student: "Vikram Singh", type: "Window" },
    { id: "B", status: "available", student: null, type: "Middle" },
    { id: "C", status: "maintenance", student: null, type: "Door" },
  ]},
  { id: "103", floor: 1, beds: [
    { id: "A", status: "occupied", student: "Rohan Gupta", type: "Window" },
    { id: "B", status: "occupied", student: "Arjun Nair", type: "Middle" },
    { id: "C", status: "occupied", student: "Karan Mehta", type: "Door" },
  ]},
  { id: "201", floor: 2, beds: [
    { id: "A", status: "available", student: null, type: "Window" },
    { id: "B", status: "available", student: null, type: "Middle" },
    { id: "C", status: "available", student: null, type: "Door" },
  ]},
  { id: "202", floor: 2, beds: [
    { id: "A", status: "reserved", student: "Pending Check-in", type: "Window" },
    { id: "B", status: "occupied", student: "Priya Patel", type: "Middle" },
    { id: "C", status: "occupied", student: "Sneha Reddy", type: "Door" },
  ]},
  { id: "203", floor: 2, beds: [
    { id: "A", status: "occupied", student: "Neha Sharma", type: "Window" },
    { id: "B", status: "maintenance", student: null, type: "Middle" },
    { id: "C", status: "available", student: null, type: "Door" },
  ]},
];

const getBedStatusColor = (status: string) => {
  switch (status) {
    case "occupied":
      return "bg-green-500";
    case "available":
      return "bg-blue-500";
    case "reserved":
      return "bg-yellow-500";
    case "maintenance":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};

const getBedStatusBg = (status: string) => {
  switch (status) {
    case "occupied":
      return "bg-green-500/10 border-green-500/30";
    case "available":
      return "bg-blue-500/10 border-blue-500/30 cursor-pointer hover:bg-blue-500/20";
    case "reserved":
      return "bg-yellow-500/10 border-yellow-500/30";
    case "maintenance":
      return "bg-red-500/10 border-red-500/30";
    default:
      return "bg-gray-500/10";
  }
};

const RoomAllocation = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Room Allocation</h1>
            <p className="text-muted-foreground">
              Visual room and bed management
            </p>
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
                <p className="text-2xl font-bold">342</p>
                <p className="text-sm text-muted-foreground">Occupied Beds</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <div>
                <p className="text-2xl font-bold">58</p>
                <p className="text-sm text-muted-foreground">Available Beds</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-muted-foreground">Reserved</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div>
                <p className="text-2xl font-bold">8</p>
                <p className="text-sm text-muted-foreground">Under Maintenance</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <Select defaultValue="block-a">
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Select Block" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="block-a">Block A</SelectItem>
                  <SelectItem value="block-b">Block B</SelectItem>
                  <SelectItem value="block-c">Block C</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Floor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Floors</SelectItem>
                  <SelectItem value="1">Floor 1</SelectItem>
                  <SelectItem value="2">Floor 2</SelectItem>
                  <SelectItem value="3">Floor 3</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search room or student..." className="pl-10" />
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
        <Tabs defaultValue="floor-1">
          <TabsList>
            <TabsTrigger value="floor-1">Floor 1</TabsTrigger>
            <TabsTrigger value="floor-2">Floor 2</TabsTrigger>
            <TabsTrigger value="floor-3">Floor 3</TabsTrigger>
          </TabsList>
          
          <TabsContent value="floor-1" className="mt-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms.filter(r => r.floor === 1).map((room) => (
                <Card key={room.id} className="border-border/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BedDouble className="h-5 w-5 text-primary" />
                        Room {room.id}
                      </CardTitle>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {room.beds.map((bed) => (
                        <div
                          key={bed.id}
                          className={`p-3 rounded-lg border ${getBedStatusBg(bed.status)} transition-colors`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${getBedStatusColor(bed.status)}`}></div>
                              <span className="font-medium">Bed {bed.id}</span>
                              <Badge variant="outline" className="text-xs">
                                {bed.type}
                              </Badge>
                            </div>
                          </div>
                          {bed.student && (
                            <p className="text-sm text-muted-foreground mt-1 ml-4">
                              {bed.student}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="floor-2" className="mt-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms.filter(r => r.floor === 2).map((room) => (
                <Card key={room.id} className="border-border/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BedDouble className="h-5 w-5 text-primary" />
                        Room {room.id}
                      </CardTitle>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {room.beds.map((bed) => (
                        <div
                          key={bed.id}
                          className={`p-3 rounded-lg border ${getBedStatusBg(bed.status)} transition-colors`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${getBedStatusColor(bed.status)}`}></div>
                              <span className="font-medium">Bed {bed.id}</span>
                              <Badge variant="outline" className="text-xs">
                                {bed.type}
                              </Badge>
                            </div>
                          </div>
                          {bed.student && (
                            <p className="text-sm text-muted-foreground mt-1 ml-4">
                              {bed.student}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="floor-3" className="mt-6">
            <div className="flex items-center justify-center h-48 text-muted-foreground">
              No rooms configured for Floor 3
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default RoomAllocation;
