import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Wrench,
  Plus,
  Search,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowUpCircle,
  Droplets,
  Zap,
  Wind,
  Hammer,
  Image,
} from "lucide-react";

const tickets = [
  {
    id: "TKT-001",
    title: "Leaking Tap in Bathroom",
    description: "The tap in the bathroom is leaking continuously and wasting water",
    room: "Block A - 101",
    student: "Rahul Sharma",
    category: "Plumbing",
    priority: "medium",
    status: "in-progress",
    assignedTo: "Ramesh Kumar",
    createdAt: "2024-01-14 10:30",
    updatedAt: "2024-01-15 09:00",
    hasImage: true,
  },
  {
    id: "TKT-002",
    title: "AC Not Working",
    description: "Air conditioner is not cooling properly, making strange noises",
    room: "Block B - 205",
    student: "Priya Patel",
    category: "Electrical",
    priority: "high",
    status: "open",
    assignedTo: null,
    createdAt: "2024-01-15 08:00",
    updatedAt: "2024-01-15 08:00",
    hasImage: true,
  },
  {
    id: "TKT-003",
    title: "Broken Window Latch",
    description: "Window latch is broken, window won't close properly",
    room: "Block A - 302",
    student: "Amit Kumar",
    category: "Carpentry",
    priority: "low",
    status: "resolved",
    assignedTo: "Suresh Singh",
    createdAt: "2024-01-12 14:00",
    updatedAt: "2024-01-14 16:00",
    hasImage: false,
  },
  {
    id: "TKT-004",
    title: "Ceiling Fan Making Noise",
    description: "Ceiling fan is wobbling and making loud noise",
    room: "Block C - 108",
    student: "Sneha Reddy",
    category: "Electrical",
    priority: "medium",
    status: "escalated",
    assignedTo: "Vijay Electricals",
    createdAt: "2024-01-13 11:00",
    updatedAt: "2024-01-15 10:00",
    hasImage: false,
  },
  {
    id: "TKT-005",
    title: "Blocked Drain",
    description: "Bathroom drain is completely blocked",
    room: "Block A - 401",
    student: "Vikram Singh",
    category: "Plumbing",
    priority: "high",
    status: "in-progress",
    assignedTo: "Ramesh Kumar",
    createdAt: "2024-01-15 07:00",
    updatedAt: "2024-01-15 11:00",
    hasImage: true,
  },
];

const stats = [
  { label: "Open Tickets", value: "12", icon: AlertTriangle, color: "text-yellow-500" },
  { label: "In Progress", value: "8", icon: Clock, color: "text-blue-500" },
  { label: "Resolved Today", value: "5", icon: CheckCircle, color: "text-green-500" },
  { label: "Escalated", value: "2", icon: ArrowUpCircle, color: "text-red-500" },
];

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "Plumbing":
      return <Droplets className="h-4 w-4 text-blue-500" />;
    case "Electrical":
      return <Zap className="h-4 w-4 text-yellow-500" />;
    case "HVAC":
      return <Wind className="h-4 w-4 text-cyan-500" />;
    case "Carpentry":
      return <Hammer className="h-4 w-4 text-orange-500" />;
    default:
      return <Wrench className="h-4 w-4 text-gray-500" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "open":
      return <Badge className="bg-yellow-500/10 text-yellow-600">Open</Badge>;
    case "in-progress":
      return <Badge className="bg-blue-500/10 text-blue-600">In Progress</Badge>;
    case "resolved":
      return <Badge className="bg-green-500/10 text-green-600">Resolved</Badge>;
    case "escalated":
      return <Badge className="bg-red-500/10 text-red-600">Escalated</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case "high":
      return <Badge variant="destructive">High</Badge>;
    case "medium":
      return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">Medium</Badge>;
    case "low":
      return <Badge variant="outline">Low</Badge>;
    default:
      return <Badge variant="secondary">{priority}</Badge>;
  }
};

const Maintenance = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Maintenance</h1>
            <p className="text-muted-foreground">
              Manage maintenance tickets and work orders
            </p>
          </div>
          <Button className="gradient-primary text-white">
            <Plus className="h-4 w-4 mr-2" />
            New Ticket
          </Button>
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

        {/* Escalation Info */}
        <Card className="border-border/50 bg-gradient-to-r from-orange-500/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <ArrowUpCircle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="font-medium">Auto-Escalation Rule</p>
                <p className="text-sm text-muted-foreground">
                  Tickets not closed within 48 hours are automatically escalated to the Warden
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="border-border/50">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search tickets..." className="pl-10" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="plumbing">Plumbing</SelectItem>
                  <SelectItem value="electrical">Electrical</SelectItem>
                  <SelectItem value="hvac">HVAC</SelectItem>
                  <SelectItem value="carpentry">Carpentry</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="escalated">Escalated</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tickets */}
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Tickets</TabsTrigger>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="my-assigned">Assigned to Staff</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <Card key={ticket.id} className="border-border/50 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Main Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-mono text-muted-foreground">{ticket.id}</span>
                          {getCategoryIcon(ticket.category)}
                          <Badge variant="outline">{ticket.category}</Badge>
                          {ticket.hasImage && (
                            <Image className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <h3 className="font-semibold text-lg mb-1">{ticket.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">{ticket.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>{ticket.room}</span>
                          <span>•</span>
                          <span>Reported by {ticket.student}</span>
                          <span>•</span>
                          <span>{ticket.createdAt}</span>
                        </div>
                      </div>

                      {/* Status & Assignment */}
                      <div className="flex flex-wrap items-center gap-3 lg:flex-col lg:items-end">
                        <div className="flex items-center gap-2">
                          {getPriorityBadge(ticket.priority)}
                          {getStatusBadge(ticket.status)}
                        </div>
                        {ticket.assignedTo ? (
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                {ticket.assignedTo.split(" ").map(n => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{ticket.assignedTo}</span>
                          </div>
                        ) : (
                          <Button size="sm" variant="outline">
                            Assign Staff
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="open" className="mt-6">
            <div className="space-y-4">
              {tickets.filter(t => t.status === "open").map((ticket) => (
                <Card key={ticket.id} className="border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{ticket.title}</h3>
                        <p className="text-sm text-muted-foreground">{ticket.room}</p>
                      </div>
                      <Button size="sm">Assign</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="my-assigned" className="mt-6">
            <Card className="border-border/50">
              <CardContent className="p-6">
                <div className="text-center text-muted-foreground py-8">
                  Staff-specific assigned tickets will be shown here
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Maintenance;
