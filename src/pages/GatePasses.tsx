import { useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QrCode, Search, Filter, Clock, CheckCircle, XCircle, AlertTriangle, ArrowRightFromLine, ArrowLeftFromLine, Plus, Loader2, Eye } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useGatePasses, type GatePassWithStudent } from "@/hooks/useGatePasses";
import { format } from "date-fns";

const getStatusBadge = (status: string | null) => {
  switch (status) {
    case "approved":
      return <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Approved</Badge>;
    case "pending":
      return <Badge className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20">Pending</Badge>;
    case "rejected":
      return <Badge className="bg-red-500/10 text-red-600 hover:bg-red-500/20">Rejected</Badge>;
    case "completed":
      return <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20">Completed</Badge>;
    default:
      return <Badge variant="secondary">{status || "Unknown"}</Badge>;
  }
};

const GatePasses = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [qrDialog, setQrDialog] = useState<{ open: boolean; pass: GatePassWithStudent | null }>({ open: false, pass: null });
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; passId: string | null }>({ open: false, passId: null });
  const [rejectReason, setRejectReason] = useState("");

  const { gatePasses, stats, isLoading, approveGatePass, rejectGatePass, checkOut, checkIn } = useGatePasses();

  // Filter passes based on tab and search
  const filteredPasses = gatePasses.filter(pass => {
    const matchesSearch = searchQuery === "" || 
      pass.student?.profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pass.student?.roll_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pass.qr_code?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = activeTab === "all" || 
      (activeTab === "pending" && pass.status === "pending") ||
      (activeTab === "active" && pass.checked_out_at && !pass.checked_in_at) ||
      (activeTab === "overdue" && pass.expected_return && new Date(pass.expected_return) < new Date() && !pass.checked_in_at);
    
    return matchesSearch && matchesTab;
  });

  const handleApprove = async (id: string) => {
    await approveGatePass.mutateAsync(id);
  };

  const handleReject = async () => {
    if (!rejectDialog.passId) return;
    await rejectGatePass.mutateAsync({ id: rejectDialog.passId, notes: rejectReason });
    setRejectDialog({ open: false, passId: null });
    setRejectReason("");
  };

  const handleCheckOut = async (id: string) => {
    await checkOut.mutateAsync(id);
  };

  const handleCheckIn = async (id: string) => {
    await checkIn.mutateAsync(id);
  };

  const statsData = [
    { label: "Total Requests", value: stats.total.toString(), icon: Clock, color: "text-blue-500" },
    { label: "Approved", value: stats.approved.toString(), icon: CheckCircle, color: "text-green-500" },
    { label: "Pending", value: stats.pending.toString(), icon: AlertTriangle, color: "text-yellow-500" },
    { label: "Currently Out", value: stats.active.toString(), icon: ArrowRightFromLine, color: "text-purple-500" },
  ];

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
            <h1 className="text-2xl font-bold text-foreground">Gate Passes</h1>
            <p className="text-muted-foreground">Digital gate pass management system</p>
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
                <span>Admin Approval</span>
              </div>
              <span className="text-muted-foreground">→</span>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">3</div>
                <span>QR Generated</span>
              </div>
              <span className="text-muted-foreground">→</span>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">4</div>
                <span>Guard Scan</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
            <TabsList className="w-full sm:w-auto overflow-x-auto flex-wrap h-auto">
              <TabsTrigger value="all">All Passes</TabsTrigger>
              <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
              <TabsTrigger value="active">Currently Out ({stats.active})</TabsTrigger>
              <TabsTrigger value="overdue">Overdue</TabsTrigger>
            </TabsList>
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by student or pass ID..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <TabsContent value={activeTab}>
            <Card className="border-border/50">
              <CardContent className="p-0">
                {filteredPasses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <QrCode className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Gate Passes Found</h3>
                    <p className="text-muted-foreground">
                      {gatePasses.length === 0 ? "No gate pass requests yet" : "Try adjusting your search"}
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Mobile card view */}
                    <div className="sm:hidden divide-y divide-border">
                      {filteredPasses.map((pass) => (
                        <div key={pass.id} className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                  {pass.student?.profile?.full_name?.split(" ").map(n => n[0]).join("") || "?"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{pass.student?.profile?.full_name || "Unknown"}</p>
                                <p className="text-xs text-muted-foreground">{pass.student?.roll_number || "-"}</p>
                              </div>
                            </div>
                            {getStatusBadge(pass.status)}
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <Badge variant="outline">{pass.pass_type}</Badge>
                            <span className="text-xs text-muted-foreground font-mono">{pass.qr_code?.slice(0, 12) || pass.id.slice(0, 8)}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <p>Out: {format(new Date(pass.out_date), "MMM d, yyyy")}</p>
                            <p>Return: {format(new Date(pass.expected_return), "MMM d, HH:mm")}</p>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            {pass.checked_out_at && (
                              <div className="flex items-center gap-1 text-orange-500">
                                <ArrowRightFromLine className="h-3 w-3" />
                                Out: {format(new Date(pass.checked_out_at), "HH:mm")}
                              </div>
                            )}
                            {pass.checked_in_at && (
                              <div className="flex items-center gap-1 text-green-500">
                                <ArrowLeftFromLine className="h-3 w-3" />
                                In: {format(new Date(pass.checked_in_at), "HH:mm")}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {pass.status === "pending" && (
                              <>
                                <Button size="sm" variant="outline" className="h-7 text-green-600" onClick={() => handleApprove(pass.id)} disabled={approveGatePass.isPending}>
                                  <CheckCircle className="h-4 w-4 mr-1" /> Approve
                                </Button>
                                <Button size="sm" variant="outline" className="h-7 text-red-600" onClick={() => setRejectDialog({ open: true, passId: pass.id })}>
                                  <XCircle className="h-4 w-4 mr-1" /> Reject
                                </Button>
                              </>
                            )}
                            {pass.status === "approved" && !pass.checked_out_at && (
                              <>
                                <Button size="sm" variant="outline" className="h-7" onClick={() => setQrDialog({ open: true, pass })}>
                                  <QrCode className="h-4 w-4 mr-1" /> QR
                                </Button>
                                <Button size="sm" className="h-7 bg-orange-500 hover:bg-orange-600 text-white" onClick={() => handleCheckOut(pass.id)} disabled={checkOut.isPending}>
                                  Check Out
                                </Button>
                              </>
                            )}
                            {pass.checked_out_at && !pass.checked_in_at && (
                              <Button size="sm" className="h-7 bg-green-500 hover:bg-green-600 text-white" onClick={() => handleCheckIn(pass.id)} disabled={checkIn.isPending}>
                                Check In
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Desktop table view */}
                    <div className="hidden sm:block overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Pass ID</TableHead>
                            <TableHead>Student</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Check In/Out</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredPasses.map((pass) => (
                            <TableRow key={pass.id}>
                              <TableCell className="font-medium font-mono text-xs">
                                {pass.qr_code?.slice(0, 12) || pass.id.slice(0, 8)}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                      {pass.student?.profile?.full_name?.split(" ").map(n => n[0]).join("") || "?"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="font-medium text-sm">{pass.student?.profile?.full_name || "Unknown"}</p>
                                    <p className="text-xs text-muted-foreground">{pass.student?.roll_number || "-"}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{pass.pass_type}</Badge>
                              </TableCell>
                              <TableCell>
                                <div className="text-sm">
                                  <p>{format(new Date(pass.out_date), "MMM d, yyyy")}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Return: {format(new Date(pass.expected_return), "MMM d, HH:mm")}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>{getStatusBadge(pass.status)}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2 text-sm">
                                  {pass.checked_out_at && (
                                    <div className="flex items-center gap-1 text-orange-500">
                                      <ArrowRightFromLine className="h-3 w-3" />
                                      {format(new Date(pass.checked_out_at), "HH:mm")}
                                    </div>
                                  )}
                                  {pass.checked_in_at && (
                                    <div className="flex items-center gap-1 text-green-500">
                                      <ArrowLeftFromLine className="h-3 w-3" />
                                      {format(new Date(pass.checked_in_at), "HH:mm")}
                                    </div>
                                  )}
                                  {!pass.checked_out_at && !pass.checked_in_at && (
                                    <span className="text-muted-foreground">—</span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  {pass.status === "pending" && (
                                    <>
                                      <Button size="sm" variant="ghost" className="h-7 text-green-600" onClick={() => handleApprove(pass.id)} disabled={approveGatePass.isPending}>
                                        <CheckCircle className="h-4 w-4" />
                                      </Button>
                                      <Button size="sm" variant="ghost" className="h-7 text-red-600" onClick={() => setRejectDialog({ open: true, passId: pass.id })}>
                                        <XCircle className="h-4 w-4" />
                                      </Button>
                                    </>
                                  )}
                                  {pass.status === "approved" && !pass.checked_out_at && (
                                    <>
                                      <Button size="sm" variant="outline" className="h-7" onClick={() => setQrDialog({ open: true, pass })}>
                                        <QrCode className="h-4 w-4 mr-1" /> QR
                                      </Button>
                                      <Button size="sm" className="h-7 bg-orange-500 hover:bg-orange-600 text-white" onClick={() => handleCheckOut(pass.id)} disabled={checkOut.isPending}>
                                        Check Out
                                      </Button>
                                    </>
                                  )}
                                  {pass.checked_out_at && !pass.checked_in_at && (
                                    <Button size="sm" className="h-7 bg-green-500 hover:bg-green-600 text-white" onClick={() => handleCheckIn(pass.id)} disabled={checkIn.isPending}>
                                      Check In
                                    </Button>
                                  )}
                                  {pass.status === "completed" && (
                                    <Button size="sm" variant="ghost" className="h-7">
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* QR Code Dialog */}
        <Dialog open={qrDialog.open} onOpenChange={(open) => setQrDialog({ open, pass: null })}>
          <DialogContent className="bg-background sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Gate Pass QR Code</DialogTitle>
              <DialogDescription>
                Show this QR code to the security guard for verification
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center py-6">
              {qrDialog.pass?.qr_code && (
                <div className="p-4 bg-white rounded-lg">
                  <QRCodeSVG 
                    value={qrDialog.pass.qr_code} 
                    size={200}
                    level="H"
                    includeMargin
                  />
                </div>
              )}
              <p className="mt-4 font-mono text-sm text-muted-foreground">
                {qrDialog.pass?.qr_code}
              </p>
              <div className="mt-4 text-center">
                <p className="font-medium">{qrDialog.pass?.student?.profile?.full_name}</p>
                <p className="text-sm text-muted-foreground">
                  Valid: {qrDialog.pass?.out_date && format(new Date(qrDialog.pass.out_date), "MMM d")} - {qrDialog.pass?.expected_return && format(new Date(qrDialog.pass.expected_return), "MMM d, HH:mm")}
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog({ open, passId: null })}>
          <DialogContent className="bg-background">
            <DialogHeader>
              <DialogTitle>Reject Gate Pass</DialogTitle>
              <DialogDescription>
                Provide a reason for rejecting this gate pass request
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input 
                placeholder="Reason for rejection (optional)..." 
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectDialog({ open: false, passId: null })}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleReject}
                disabled={rejectGatePass.isPending}
              >
                {rejectGatePass.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Reject"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default GatePasses;
