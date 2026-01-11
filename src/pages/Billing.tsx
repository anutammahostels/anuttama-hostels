import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Receipt,
  Plus,
  Search,
  Download,
  IndianRupee,
  TrendingUp,
  Clock,
  AlertTriangle,
  MoreVertical,
  Zap,
  FileText,
  Send,
} from "lucide-react";

const invoices = [
  {
    id: "INV-2024-001",
    student: "Rahul Sharma",
    room: "Block A - 101",
    amount: 15000,
    rent: 12000,
    electricity: 850,
    mess: 3000,
    lateFee: 0,
    dueDate: "2024-01-15",
    status: "paid",
    paidDate: "2024-01-12",
  },
  {
    id: "INV-2024-002",
    student: "Priya Patel",
    room: "Block B - 205",
    amount: 16500,
    rent: 12000,
    electricity: 1200,
    mess: 3000,
    lateFee: 300,
    dueDate: "2024-01-15",
    status: "overdue",
    paidDate: null,
  },
  {
    id: "INV-2024-003",
    student: "Amit Kumar",
    room: "Block A - 302",
    amount: 14800,
    rent: 12000,
    electricity: 650,
    mess: 2150,
    lateFee: 0,
    dueDate: "2024-01-20",
    status: "pending",
    paidDate: null,
  },
  {
    id: "INV-2024-004",
    student: "Sneha Reddy",
    room: "Block C - 108",
    amount: 15200,
    rent: 12000,
    electricity: 950,
    mess: 2250,
    lateFee: 0,
    dueDate: "2024-01-20",
    status: "pending",
    paidDate: null,
  },
  {
    id: "INV-2024-005",
    student: "Vikram Singh",
    room: "Block A - 401",
    amount: 18000,
    rent: 12000,
    electricity: 1800,
    mess: 3000,
    lateFee: 1200,
    dueDate: "2024-01-10",
    status: "overdue",
    paidDate: null,
  },
];

const meterReadings = [
  { room: "101", previous: 4520, current: 4685, units: 165, rate: 8, amount: 1320 },
  { room: "102", previous: 3210, current: 3380, units: 170, rate: 8, amount: 1360 },
  { room: "103", previous: 5680, current: 5820, units: 140, rate: 8, amount: 1120 },
  { room: "201", previous: 2890, current: 3050, units: 160, rate: 8, amount: 1280 },
  { room: "202", previous: 4100, current: 4290, units: 190, rate: 8, amount: 1520 },
];

const stats = [
  { label: "Total Revenue", value: "₹18.5L", icon: IndianRupee, color: "text-green-500", change: "+12%" },
  { label: "Pending Dues", value: "₹2.4L", icon: Clock, color: "text-yellow-500", change: "32 students" },
  { label: "Overdue", value: "₹85K", icon: AlertTriangle, color: "text-red-500", change: "8 students" },
  { label: "This Month", value: "₹4.2L", icon: TrendingUp, color: "text-primary", change: "+8%" },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "paid":
      return <Badge className="bg-green-500/10 text-green-600">Paid</Badge>;
    case "pending":
      return <Badge className="bg-yellow-500/10 text-yellow-600">Pending</Badge>;
    case "overdue":
      return <Badge className="bg-red-500/10 text-red-600">Overdue</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const Billing = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Billing & Invoices</h1>
            <p className="text-muted-foreground">
              Manage invoices, electricity billing, and payments
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button className="gradient-primary text-white">
              <Plus className="h-4 w-4 mr-2" />
              Generate Invoices
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                      <stat.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{stat.change}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Late Fee Rule Info */}
        <Card className="border-border/50 bg-gradient-to-r from-yellow-500/5 to-transparent">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="font-medium">Late Fee Policy</p>
                <p className="text-sm text-muted-foreground">
                  Invoices unpaid 5 days past due date incur a daily penalty of ₹50
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="invoices">
          <TabsList>
            <TabsTrigger value="invoices">All Invoices</TabsTrigger>
            <TabsTrigger value="electricity">Electricity Sub-metering</TabsTrigger>
            <TabsTrigger value="payments">Payment History</TabsTrigger>
          </TabsList>

          <TabsContent value="invoices" className="mt-6">
            {/* Search */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search invoices..." className="pl-10" />
              </div>
              <Button variant="outline">
                <Send className="h-4 w-4 mr-2" />
                Send Reminders
              </Button>
            </div>

            <Card className="border-border/50">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Breakdown</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">{invoice.id}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{invoice.student}</p>
                              <p className="text-sm text-muted-foreground">{invoice.room}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm space-y-1">
                              <div className="flex justify-between w-32">
                                <span className="text-muted-foreground">Rent:</span>
                                <span>₹{invoice.rent.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between w-32">
                                <span className="text-muted-foreground">Electricity:</span>
                                <span>₹{invoice.electricity.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between w-32">
                                <span className="text-muted-foreground">Mess:</span>
                                <span>₹{invoice.mess.toLocaleString()}</span>
                              </div>
                              {invoice.lateFee > 0 && (
                                <div className="flex justify-between w-32 text-red-500">
                                  <span>Late Fee:</span>
                                  <span>₹{invoice.lateFee.toLocaleString()}</span>
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-bold text-lg">₹{invoice.amount.toLocaleString()}</span>
                          </TableCell>
                          <TableCell>{invoice.dueDate}</TableCell>
                          <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <FileText className="h-4 w-4 mr-2" />
                                  View Invoice
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="h-4 w-4 mr-2" />
                                  Download PDF
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Send className="h-4 w-4 mr-2" />
                                  Send Reminder
                                </DropdownMenuItem>
                                <DropdownMenuItem>Mark as Paid</DropdownMenuItem>
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
          </TabsContent>

          <TabsContent value="electricity" className="mt-6">
            <Card className="border-border/50 mb-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-yellow-500" />
                      Sub-meter Readings
                    </CardTitle>
                    <CardDescription>
                      Formula: (Current - Previous Reading) × Unit Rate = Amount
                    </CardDescription>
                  </div>
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Enter Readings
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Room</TableHead>
                      <TableHead>Previous Reading</TableHead>
                      <TableHead>Current Reading</TableHead>
                      <TableHead>Units Consumed</TableHead>
                      <TableHead>Rate/Unit</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {meterReadings.map((reading) => (
                      <TableRow key={reading.room}>
                        <TableCell className="font-medium">Room {reading.room}</TableCell>
                        <TableCell>{reading.previous}</TableCell>
                        <TableCell>{reading.current}</TableCell>
                        <TableCell>{reading.units} kWh</TableCell>
                        <TableCell>₹{reading.rate}/kWh</TableCell>
                        <TableCell className="font-bold">₹{reading.amount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="mt-6">
            <Card className="border-border/50">
              <CardContent className="p-6">
                <div className="text-center text-muted-foreground py-8">
                  Payment transaction history will be shown here
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Billing;
