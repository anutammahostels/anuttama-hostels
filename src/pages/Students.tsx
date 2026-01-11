import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, Search, Filter, MoreVertical, Download, Users, UserCheck, UserX, Clock, Loader2 } from "lucide-react";
import { useStudents, type StudentWithProfile } from "@/hooks/useStudents";

const Students = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { students, stats, isLoading, error } = useStudents();

  // Filter students based on search
  const filteredStudents = students.filter(student => {
    const name = student.profile?.full_name?.toLowerCase() || "";
    const rollNumber = student.roll_number?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    return name.includes(query) || rollNumber.includes(query);
  });

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "active": return "bg-green-500/10 text-green-600";
      case "on_leave": return "bg-yellow-500/10 text-yellow-600";
      case "inactive": return "bg-red-500/10 text-red-600";
      default: return "bg-gray-500/10 text-gray-600";
    }
  };

  const getRoomDisplay = (student: StudentWithProfile) => {
    if (!student.bed?.room) return "Not Allocated";
    const room = student.bed.room;
    const floor = room.floor;
    const block = floor?.block;
    return `${block?.name || "Block"} - ${room.room_number} - Bed ${student.bed.bed_number}`;
  };

  const statsData = [
    { label: "Total Students", value: stats.total.toString(), icon: Users, color: "text-primary" },
    { label: "Active", value: stats.active.toString(), icon: UserCheck, color: "text-green-500" },
    { label: "On Leave", value: stats.onLeave.toString(), icon: Clock, color: "text-yellow-500" },
    { label: "Inactive", value: stats.inactive.toString(), icon: UserX, color: "text-red-500" },
  ];

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-destructive">Error loading students: {error.message}</p>
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
            <h1 className="text-2xl font-bold text-foreground">Students</h1>
            <p className="text-muted-foreground">Manage student profiles and allocations</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button className="gradient-primary text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsData.map((stat) => (
            <Card key={stat.label} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search and Filters */}
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or roll number..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>All Students</CardTitle>
            <CardDescription>
              {isLoading ? "Loading..." : `${filteredStudents.length} students found`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No students found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? "Try adjusting your search" : "Add your first student to get started"}
                </p>
                <Button className="gradient-primary text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Student
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={student.profile?.avatar_url || ""} />
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {student.profile?.full_name?.split(" ").map(n => n[0]).join("") || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{student.profile?.full_name || "Unknown"}</p>
                              <p className="text-sm text-muted-foreground">{student.roll_number || "No Roll #"}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{getRoomDisplay(student)}</p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{student.course || "-"}</p>
                          <p className="text-xs text-muted-foreground">{student.year ? `Year ${student.year}` : ""}</p>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={getStatusColor(student.status)}>
                            {student.status || "unknown"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-popover">
                              <DropdownMenuItem>View Profile</DropdownMenuItem>
                              <DropdownMenuItem>Edit Details</DropdownMenuItem>
                              <DropdownMenuItem>View Payments</DropdownMenuItem>
                              <DropdownMenuItem>Generate Gate Pass</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">Check Out</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Students;
