import { useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProperties } from "@/hooks/useProperties";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { createNotification, getAdminUserIds } from "@/lib/notifications";

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case "plumbing":
      return <Droplets className="h-4 w-4 text-blue-500" />;
    case "electrical":
      return <Zap className="h-4 w-4 text-yellow-500" />;
    case "hvac":
      return <Wind className="h-4 w-4 text-cyan-500" />;
    case "carpentry":
      return <Hammer className="h-4 w-4 text-orange-500" />;
    default:
      return <Wrench className="h-4 w-4 text-muted-foreground" />;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "open":
      return <Badge className="bg-yellow-500/10 text-yellow-600">Open</Badge>;
    case "in_progress":
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
  const { user } = useAuth();
  const { properties } = useProperties();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("plumbing");
  const [priority, setPriority] = useState("medium");
  const [propertyId, setPropertyId] = useState("");

  const ticketsQuery = useQuery({
    queryKey: ["maintenance_tickets", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance_tickets")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createTicket = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("maintenance_tickets").insert({
        title,
        description,
        category,
        priority,
        property_id: propertyId,
        reported_by: user!.id,
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance_tickets"] });
      toast({ title: "Ticket Created", description: "Maintenance ticket has been submitted." });
      // Notify admins
      const adminIds = await getAdminUserIds();
      adminIds.forEach((adminId) =>
        createNotification(adminId, "New Maintenance Ticket", `New maintenance ticket: ${title}`, "maintenance", "/dashboard/maintenance")
      );
      setDialogOpen(false);
      setTitle("");
      setDescription("");
      setCategory("plumbing");
      setPriority("medium");
      setPropertyId("");
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const tickets = ticketsQuery.data || [];
  const openCount = tickets.filter((t) => t.status === "open").length;
  const inProgressCount = tickets.filter((t) => t.status === "in_progress").length;
  const resolvedTodayCount = tickets.filter((t) => {
    if (t.status !== "resolved" || !t.resolved_at) return false;
    return new Date(t.resolved_at).toDateString() === new Date().toDateString();
  }).length;
  const escalatedCount = tickets.filter((t) => t.status === "escalated").length;

  const stats = [
    { label: "Open Tickets", value: String(openCount), icon: AlertTriangle, color: "text-yellow-500" },
    { label: "In Progress", value: String(inProgressCount), icon: Clock, color: "text-blue-500" },
    { label: "Resolved Today", value: String(resolvedTodayCount), icon: CheckCircle, color: "text-green-500" },
    { label: "Escalated", value: String(escalatedCount), icon: ArrowUpCircle, color: "text-red-500" },
  ];

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Maintenance</h1>
            <p className="text-muted-foreground">Manage maintenance tickets and work orders</p>
          </div>
          <Button className="gradient-primary text-white" onClick={() => setDialogOpen(true)}>
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
        <Card className="border-border/50 bg-[#29926A]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <ArrowUpCircle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="font-medium">Auto-Escalation Rule</p>
                <p className="text-sm text-muted-foreground">
                  Tickets not closed within 48 hours are automatically escalated to the Admin
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tickets List */}
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Tickets</TabsTrigger>
            <TabsTrigger value="open">Open</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {ticketsQuery.isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : tickets.length === 0 ? (
              <Card className="border-border/50">
                <CardContent className="p-6 text-center text-muted-foreground">
                  No maintenance tickets yet. Click "New Ticket" to create one.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <Card key={ticket.id} className="border-border/50 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            {getCategoryIcon(ticket.category)}
                            <Badge variant="outline">{ticket.category}</Badge>
                          </div>
                          <h3 className="font-semibold text-lg mb-1">{ticket.title}</h3>
                          {ticket.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">{ticket.description}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(ticket.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          {getPriorityBadge(ticket.priority || "medium")}
                          {getStatusBadge(ticket.status || "open")}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="open" className="mt-6">
            <div className="space-y-4">
              {tickets.filter((t) => t.status === "open").length === 0 ? (
                <Card className="border-border/50">
                  <CardContent className="p-6 text-center text-muted-foreground">
                    No open tickets.
                  </CardContent>
                </Card>
              ) : (
                tickets
                  .filter((t) => t.status === "open")
                  .map((ticket) => (
                    <Card key={ticket.id} className="border-border/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{ticket.title}</h3>
                            <p className="text-sm text-muted-foreground">{ticket.category}</p>
                          </div>
                          {getPriorityBadge(ticket.priority || "medium")}
                        </div>
                      </CardContent>
                    </Card>
                  ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* New Ticket Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Maintenance Ticket</DialogTitle>
            <DialogDescription>Submit a new maintenance request.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Property</Label>
              <Select value={propertyId} onValueChange={setPropertyId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Leaking tap in bathroom" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the issue..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plumbing">Plumbing</SelectItem>
                    <SelectItem value="electrical">Electrical</SelectItem>
                    <SelectItem value="hvac">HVAC</SelectItem>
                    <SelectItem value="carpentry">Carpentry</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="gradient-primary text-white"
              onClick={() => createTicket.mutate()}
              disabled={!title || !propertyId || createTicket.isPending}
            >
              {createTicket.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Maintenance;
