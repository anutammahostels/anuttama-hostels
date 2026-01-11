import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  QrCode,
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowRightFromLine,
  ArrowLeftFromLine,
  Plus,
} from "lucide-react";

const gatePasses = [
  {
    id: "GP001",
    student: "Rahul Sharma",
    studentId: "STU001",
    type: "Day Out",
    requestDate: "2024-01-15 09:30",
    fromDate: "2024-01-15 10:00",
    toDate: "2024-01-15 18:00",
    reason: "Medical appointment",
    status: "approved",
    wardenApproval: true,
    parentApproval: true,
    checkOut: "10:15",
    checkIn: null,
  },
  {
    id: "GP002",
    student: "Priya Patel",
    studentId: "STU002",
    type: "Weekend Leave",
    requestDate: "2024-01-14 15:00",
    fromDate: "2024-01-18 08:00",
    toDate: "2024-01-20 20:00",
    reason: "Family function",
    status: "pending",
    wardenApproval: true,
    parentApproval: false,
    checkOut: null,
    checkIn: null,
  },
  {
    id: "GP003",
    student: "Amit Kumar",
    studentId: "STU003",
    type: "Emergency",
    requestDate: "2024-01-15 11:00",
    fromDate: "2024-01-15 11:30",
    toDate: "2024-01-16 20:00",
    reason: "Family emergency",
    status: "approved",
    wardenApproval: true,
    parentApproval: true,
    checkOut: "11:45",
    checkIn: "19:30",
  },
  {
    id: "GP004",
    student: "Sneha Reddy",
    studentId: "STU004",
    type: "Day Out",
    requestDate: "2024-01-15 08:00",
    fromDate: "2024-01-15 14:00",
    toDate: "2024-01-15 20:00",
    reason: "Shopping",
    status: "rejected",
    wardenApproval: false,
    parentApproval: false,
    checkOut: null,
    checkIn: null,
  },
  {
    id: "GP005",
    student: "Vikram Singh",
    studentId: "STU005",
    type: "Night Out",
    requestDate: "2024-01-14 16:00",
    fromDate: "2024-01-15 18:00",
    toDate: "2024-01-16 08:00",
    reason: "Friend's birthday party",
    status: "pending",
    wardenApproval: false,
    parentApproval: false,
    checkOut: null,
    checkIn: null,
  },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "approved":
      return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Approved</Badge>;
    case "pending":
      return <Badge className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20">Pending</Badge>;
    case "rejected":
      return <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20">Rejected</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const stats = [
  { label: "Today's Requests", value: "12", icon: Clock, color: "text-blue-500" },
  { label: "Approved", value: "8", icon: CheckCircle, color: "text-green-500" },
  { label: "Pending", value: "3", icon: AlertTriangle, color: "text-yellow-500" },
  { label: "Currently Out", value: "24", icon: ArrowRightFromLine, color: "text-purple-500" },
];

const GatePasses = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gate Passes</h1>
            <p className="text-muted-foreground">
              Digital gate pass management system
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <QrCode className="h-4 w-4 mr-2" />
              Scan QR
            </Button>
            <Button className="gradient-primary text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Pass Request
            </Button>
          </div>
        </div>

        {/* Stats */}
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

        {/* Pass Workflow Info */}
        <Card className="border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">1</div>
                <span>Student Request</span>
              </div>
              <span className="text-muted-foreground">→</span>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">2</div>
                <span>Warden Approval</span>
              </div>
              <span className="text-muted-foreground">→</span>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">3</div>
                <span>Parent OTP (Optional)</span>
              </div>
              <span className="text-muted-foreground">→</span>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">4</div>
                <span>QR Generated</span>
              </div>
              <span className="text-muted-foreground">→</span>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">5</div>
                <span>Guard Scan</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="all">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
            <TabsList>
              <TabsTrigger value="all">All Passes</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="active">Currently Out</TabsTrigger>
              <TabsTrigger value="overdue">Overdue</TabsTrigger>
            </TabsList>
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by student or pass ID..." className="pl-10" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <TabsContent value="all">
            <Card className="border-border/50">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pass ID</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Approvals</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Check In/Out</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {gatePasses.map((pass) => (
                        <TableRow key={pass.id}>
                          <TableCell className="font-medium">{pass.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                  {pass.student.split(" ").map(n => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{pass.student}</p>
                                <p className="text-xs text-muted-foreground">{pass.studentId}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{pass.type}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p>{pass.fromDate.split(" ")[0]}</p>
                              <p className="text-xs text-muted-foreground">to {pass.toDate.split(" ")[0]}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${pass.wardenApproval ? 'bg-green-500/20' : 'bg-muted'}`}>
                                {pass.wardenApproval ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${pass.parentApproval ? 'bg-green-500/20' : 'bg-muted'}`}>
                                {pass.parentApproval ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : (
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(pass.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 text-sm">
                              {pass.checkOut && (
                                <div className="flex items-center gap-1 text-orange-500">
                                  <ArrowRightFromLine className="h-3 w-3" />
                                  {pass.checkOut}
                                </div>
                              )}
                              {pass.checkIn && (
                                <div className="flex items-center gap-1 text-green-500">
                                  <ArrowLeftFromLine className="h-3 w-3" />
                                  {pass.checkIn}
                                </div>
                              )}
                              {!pass.checkOut && !pass.checkIn && (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending">
            <Card className="border-border/50">
              <CardContent className="p-6">
                <div className="text-center text-muted-foreground py-8">
                  Showing pending gate passes for approval
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="active">
            <Card className="border-border/50">
              <CardContent className="p-6">
                <div className="text-center text-muted-foreground py-8">
                  Showing students currently outside the hostel
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overdue">
            <Card className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-center gap-2 text-yellow-600 py-8">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Students who haven't returned by curfew time</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default GatePasses;
