import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, Search, Filter, MoreVertical, Download, Users, UserCheck, UserX, Clock } from "lucide-react";

const students = [
  {
    id: "STU001",
    name: "Rahul Sharma",
    email: "rahul.sharma@email.com",
    phone: "+91 98765 43210",
    room: "Block A - 101 - Bed A",
    course: "B.Tech CSE",
    year: "3rd Year",
    status: "active",
    joinDate: "2023-08-15",
    dueAmount: 0,
  },
  {
    id: "STU002",
    name: "Priya Patel",
    email: "priya.patel@email.com",
    phone: "+91 98765 43211",
    room: "Block B - 205 - Bed B",
    course: "B.Tech ECE",
    year: "2nd Year",
    status: "active",
    joinDate: "2024-01-10",
    dueAmount: 5000,
  },
  {
    id: "STU003",
    name: "Amit Kumar",
    email: "amit.kumar@email.com",
    phone: "+91 98765 43212",
    room: "Block A - 302 - Bed A",
    course: "MBA",
    year: "1st Year",
    status: "on-leave",
    joinDate: "2024-07-01",
    dueAmount: 0,
  },
  {
    id: "STU004",
    name: "Sneha Reddy",
    email: "sneha.reddy@email.com",
    phone: "+91 98765 43213",
    room: "Block C - 108 - Bed C",
    course: "B.Tech IT",
    year: "4th Year",
    status: "active",
    joinDate: "2022-08-20",
    dueAmount: 15000,
  },
  {
    id: "STU005",
    name: "Vikram Singh",
    email: "vikram.singh@email.com",
    phone: "+91 98765 43214",
    room: "Block A - 401 - Bed B",
    course: "B.Sc Physics",
    year: "2nd Year",
    status: "inactive",
    joinDate: "2023-08-15",
    dueAmount: 25000,
  },
];

const stats = [
  { label: "Total Students", value: "1,247", icon: Users, color: "text-primary" },
  { label: "Active", value: "1,180", icon: UserCheck, color: "text-green-500" },
  { label: "On Leave", value: "42", icon: Clock, color: "text-yellow-500" },
  { label: "Checked Out", value: "25", icon: UserX, color: "text-red-500" },
];

const Students = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Students</h1>
            <p className="text-muted-foreground">
              Manage student profiles and allocations
            </p>
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
          {stats.map((stat) => (
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
                  placeholder="Search by name, ID, or room..."
                  className="pl-10"
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
              A list of all registered students with their details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due Amount</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {student.name.split(" ").map(n => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-muted-foreground">{student.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{student.room}</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm">{student.course}</p>
                        <p className="text-xs text-muted-foreground">{student.year}</p>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            student.status === "active"
                              ? "bg-green-500/10 text-green-600"
                              : student.status === "on-leave"
                              ? "bg-yellow-500/10 text-yellow-600"
                              : "bg-red-500/10 text-red-600"
                          }
                        >
                          {student.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={student.dueAmount > 0 ? "text-red-500 font-medium" : "text-green-500"}>
                          ₹{student.dueAmount.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Profile</DropdownMenuItem>
                            <DropdownMenuItem>Edit Details</DropdownMenuItem>
                            <DropdownMenuItem>View Payments</DropdownMenuItem>
                            <DropdownMenuItem>Generate Gate Pass</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              Check Out
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Students;
