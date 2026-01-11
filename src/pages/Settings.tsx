import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Settings as SettingsIcon,
  Building2,
  Shield,
  Bell,
  Users,
  Smartphone,
  Clock,
  AlertTriangle,
  Wifi,
  Save,
} from "lucide-react";

const Settings = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">
              Configure your hostel policies and system preferences
            </p>
          </div>
          <Button className="gradient-primary text-white">
            <Save className="h-4 w-4 mr-2" />
            Save All Changes
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="policies" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto p-1">
            <TabsTrigger value="policies" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Policy Engine</span>
              <span className="sm:hidden">Policies</span>
            </TabsTrigger>
            <TabsTrigger value="property" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Property</span>
              <span className="sm:hidden">Property</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
              <span className="sm:hidden">Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="roles" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">User Roles</span>
              <span className="sm:hidden">Roles</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Billing Rules</span>
              <span className="sm:hidden">Billing</span>
            </TabsTrigger>
          </TabsList>

          {/* Policy Engine Tab */}
          <TabsContent value="policies" className="space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle>Policy Configuration Engine</CardTitle>
                </div>
                <CardDescription>
                  Configure rules that control UI and logic based on your facility type.
                  These settings apply globally to all students.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Mobile Policy */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Smartphone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <Label className="text-base font-medium">Mobile Phones Allowed</Label>
                      <p className="text-sm text-muted-foreground">
                        If disabled, enables "Gadget Surrender Log" module. If enabled, shows "Wi-Fi MAC Registration"
                      </p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                {/* Curfew Mode */}
                <div className="p-4 rounded-lg bg-muted/50 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <Label className="text-base font-medium">Curfew Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Determines actions when students arrive late
                      </p>
                    </div>
                  </div>
                  <Select defaultValue="grace">
                    <SelectTrigger className="w-full sm:w-[300px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="strict">
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive">Strict</Badge>
                          <span>Auto SMS to parents + Log entry</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="grace">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-yellow-500/20 text-yellow-600">Grace</Badge>
                          <span>15 min grace period, then SMS</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="open">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Open</Badge>
                          <span>Log entry only, no alerts</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-4">
                    <Label>Curfew Time</Label>
                    <Input type="time" defaultValue="22:00" className="w-32" />
                  </div>
                </div>

                {/* Visitor Gender Restriction */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <Label className="text-base font-medium">Visitor Gender Restriction</Label>
                      <p className="text-sm text-muted-foreground">
                        Prevents booking male visitors into female blocks and vice versa
                      </p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                {/* Parent Approval for Gate Pass */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <AlertTriangle className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <Label className="text-base font-medium">Require Parent Approval for Gate Pass</Label>
                      <p className="text-sm text-muted-foreground">
                        Students must receive OTP approval from parents for gate passes
                      </p>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>

                {/* Wi-Fi MAC Registration */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Wifi className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <Label className="text-base font-medium">Wi-Fi MAC Registration</Label>
                      <p className="text-sm text-muted-foreground">
                        Require students to register device MAC addresses for Wi-Fi access
                      </p>
                    </div>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Property Tab */}
          <TabsContent value="property" className="space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Property Information</CardTitle>
                <CardDescription>Basic details about your hostel property</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Property Name</Label>
                    <Input defaultValue="Sunrise Student Hostel" />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Email</Label>
                    <Input type="email" defaultValue="admin@sunrisehostel.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Phone</Label>
                    <Input defaultValue="+91 98765 43210" />
                  </div>
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select defaultValue="asia-kolkata">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asia-kolkata">Asia/Kolkata (IST)</SelectItem>
                        <SelectItem value="asia-dubai">Asia/Dubai (GST)</SelectItem>
                        <SelectItem value="europe-london">Europe/London (GMT)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input defaultValue="123 University Road, Campus Area, City - 500001" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Configure when and how notifications are sent</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-3">
                  <div>
                    <Label>Late Entry SMS to Parents</Label>
                    <p className="text-sm text-muted-foreground">Send SMS when student enters after curfew</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between py-3">
                  <div>
                    <Label>Gate Pass Approval Notification</Label>
                    <p className="text-sm text-muted-foreground">Notify parents when gate pass is requested</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between py-3">
                  <div>
                    <Label>Payment Due Reminders</Label>
                    <p className="text-sm text-muted-foreground">Send reminders before due date</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between py-3">
                  <div>
                    <Label>Maintenance Ticket Updates</Label>
                    <p className="text-sm text-muted-foreground">Notify students on ticket status changes</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Roles Tab */}
          <TabsContent value="roles" className="space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>User Roles & Permissions</CardTitle>
                <CardDescription>Define access levels for different user types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { role: "Super Admin", desc: "Full SaaS provider access", badge: "System" },
                    { role: "Tenant Admin", desc: "Full hostel access, settings, reports", badge: "Admin" },
                    { role: "Warden", desc: "Attendance, room inspections, approvals", badge: "Staff" },
                    { role: "Security Guard", desc: "QR scanning, visitor logging only", badge: "Staff" },
                    { role: "Student", desc: "Self-service portal access", badge: "User" },
                    { role: "Parent", desc: "Read-only + approve actions", badge: "User" },
                  ].map((item) => (
                    <div key={item.role} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.role}</span>
                          <Badge variant="outline">{item.badge}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                      <Button variant="outline" size="sm">Configure</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Rules Tab */}
          <TabsContent value="billing" className="space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Billing Configuration</CardTitle>
                <CardDescription>Set up billing rules and fee structures</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Late Payment Grace Period (Days)</Label>
                    <Input type="number" defaultValue="5" />
                  </div>
                  <div className="space-y-2">
                    <Label>Daily Late Fee (₹)</Label>
                    <Input type="number" defaultValue="50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Electricity Rate (₹/kWh)</Label>
                    <Input type="number" defaultValue="8" />
                  </div>
                  <div className="space-y-2">
                    <Label>Mess Rebate per Meal (₹)</Label>
                    <Input type="number" defaultValue="50" />
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between py-3">
                  <div>
                    <Label>Auto-generate Monthly Invoices</Label>
                    <p className="text-sm text-muted-foreground">Generate invoices on 1st of each month</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <Label>Include Electricity in Invoice</Label>
                    <p className="text-sm text-muted-foreground">Auto-calculate from meter readings</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
