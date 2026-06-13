import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";


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
  Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProperties } from "@/hooks/useProperties";
import { usePolicySettings } from "@/hooks/usePolicySettings";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation } from "@tanstack/react-query";

const Settings = () => {
  const { user } = useAuth();
  const { properties, updateProperty } = useProperties();
  const { toast } = useToast();

  // Use first property as default
  const property = properties[0];
  const propertyId = property?.id;

  const { settings, getSetting, bulkSavePolicies, isLoading: policiesLoading } = usePolicySettings(propertyId);

  // Policy state
  const [mobileAllowed, setMobileAllowed] = useState(true);
  const [curfewMode, setCurfewMode] = useState("grace");
  const [curfewTime, setCurfewTime] = useState("22:00");
  const [visitorGenderRestriction, setVisitorGenderRestriction] = useState(true);
  const [parentApprovalGatePass, setParentApprovalGatePass] = useState(true);
  const [wifiMacRegistration, setWifiMacRegistration] = useState(false);

  // Property state
  const [propertyName, setPropertyName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [timezone, setTimezone] = useState("asia-kolkata");
  const [address, setAddress] = useState("");

  // Notification state
  const [lateEntrySms, setLateEntrySms] = useState(true);
  const [gatePassNotif, setGatePassNotif] = useState(true);
  const [paymentReminders, setPaymentReminders] = useState(true);
  const [maintenanceUpdates, setMaintenanceUpdates] = useState(true);

  // Billing state
  const [latePaymentGrace, setLatePaymentGrace] = useState("5");
  const [dailyLateFee, setDailyLateFee] = useState("50");
  const [electricityRate, setElectricityRate] = useState("8");
  const [messRebate, setMessRebate] = useState("50");
  const [autoGenerateInvoices, setAutoGenerateInvoices] = useState(true);
  const [includeElectricity, setIncludeElectricity] = useState(true);

  // Load existing settings
  useEffect(() => {
    if (settings.length > 0) {
      const get = (key: string, fallback: any) => {
        const val = getSetting(key);
        return val !== undefined ? val : fallback;
      };
      setMobileAllowed(get("mobile_allowed", true) as boolean);
      setCurfewMode(get("curfew_mode", "grace") as string);
      setCurfewTime(get("curfew_time", "22:00") as string);
      setVisitorGenderRestriction(get("visitor_gender_restriction", true) as boolean);
      setParentApprovalGatePass(get("parent_approval_gate_pass", true) as boolean);
      setWifiMacRegistration(get("wifi_mac_registration", false) as boolean);
      setLateEntrySms(get("late_entry_sms", true) as boolean);
      setGatePassNotif(get("gate_pass_notification", true) as boolean);
      setPaymentReminders(get("payment_reminders", true) as boolean);
      setMaintenanceUpdates(get("maintenance_updates", true) as boolean);
      setLatePaymentGrace(String(get("late_payment_grace_days", 5)));
      setDailyLateFee(String(get("daily_late_fee", 50)));
      setElectricityRate(String(get("electricity_rate", 8)));
      setMessRebate(String(get("mess_rebate_per_meal", 50)));
      setAutoGenerateInvoices(get("auto_generate_invoices", true) as boolean);
      setIncludeElectricity(get("include_electricity", true) as boolean);
    }
  }, [settings]);

  // Load property info
  useEffect(() => {
    if (property) {
      setPropertyName(property.name || "");
      setAddress(property.address || "");
    }
  }, [property]);

  const [saving, setSaving] = useState(false);

  const handleSaveAll = async () => {
    if (!propertyId) {
      toast({ title: "No Property", description: "Please create a property first.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      // Save property info
      await updateProperty.mutateAsync({
        id: propertyId,
        name: propertyName,
        address,
      });

      // Save all policy settings
      const allSettings = [
        { property_id: propertyId, setting_key: "mobile_allowed", setting_value: mobileAllowed },
        { property_id: propertyId, setting_key: "curfew_mode", setting_value: curfewMode },
        { property_id: propertyId, setting_key: "curfew_time", setting_value: curfewTime },
        { property_id: propertyId, setting_key: "visitor_gender_restriction", setting_value: visitorGenderRestriction },
        { property_id: propertyId, setting_key: "parent_approval_gate_pass", setting_value: parentApprovalGatePass },
        { property_id: propertyId, setting_key: "wifi_mac_registration", setting_value: wifiMacRegistration },
        { property_id: propertyId, setting_key: "late_entry_sms", setting_value: lateEntrySms },
        { property_id: propertyId, setting_key: "gate_pass_notification", setting_value: gatePassNotif },
        { property_id: propertyId, setting_key: "payment_reminders", setting_value: paymentReminders },
        { property_id: propertyId, setting_key: "maintenance_updates", setting_value: maintenanceUpdates },
        { property_id: propertyId, setting_key: "late_payment_grace_days", setting_value: Number(latePaymentGrace) },
        { property_id: propertyId, setting_key: "daily_late_fee", setting_value: Number(dailyLateFee) },
        { property_id: propertyId, setting_key: "electricity_rate", setting_value: Number(electricityRate) },
        { property_id: propertyId, setting_key: "mess_rebate_per_meal", setting_value: Number(messRebate) },
        { property_id: propertyId, setting_key: "auto_generate_invoices", setting_value: autoGenerateInvoices },
        { property_id: propertyId, setting_key: "include_electricity", setting_value: includeElectricity },
      ];

      await bulkSavePolicies.mutateAsync(allSettings);
      toast({ title: "Settings Saved", description: "All changes have been saved successfully." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">
              Configure your hostel policies and system preferences
            </p>
          </div>
          <Button className="gradient-primary text-white" onClick={handleSaveAll} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save All Changes
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="policies" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto p-1">
            <TabsTrigger value="policies" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Policy Engine</span>
              <span className="sm:hidden">Policies</span>
            </TabsTrigger>
            <TabsTrigger value="property" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Property
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
              <span className="sm:hidden">Alerts</span>
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
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Smartphone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <Label className="text-base font-medium">Mobile Phones Allowed</Label>
                      <p className="text-sm text-muted-foreground">
                        If disabled, enables "Gadget Surrender Log" module
                      </p>
                    </div>
                  </div>
                  <Switch checked={mobileAllowed} onCheckedChange={setMobileAllowed} />
                </div>

                <div className="p-4 rounded-lg bg-muted/50 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <Label className="text-base font-medium">Curfew Mode</Label>
                      <p className="text-sm text-muted-foreground">Determines actions when students arrive late</p>
                    </div>
                  </div>
                  <Select value={curfewMode} onValueChange={setCurfewMode}>
                    <SelectTrigger className="w-full sm:w-[300px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="strict">Strict — Auto SMS + Log entry</SelectItem>
                      <SelectItem value="grace">Grace — 15 min grace, then SMS</SelectItem>
                      <SelectItem value="open">Open — Log entry only</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-4">
                    <Label>Curfew Time</Label>
                    <Input type="time" value={curfewTime} onChange={(e) => setCurfewTime(e.target.value)} className="w-32" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <Label className="text-base font-medium">Visitor Gender Restriction</Label>
                      <p className="text-sm text-muted-foreground">Prevents booking male visitors into female blocks</p>
                    </div>
                  </div>
                  <Switch checked={visitorGenderRestriction} onCheckedChange={setVisitorGenderRestriction} />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <AlertTriangle className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <Label className="text-base font-medium">Require Parent Approval for Gate Pass</Label>
                      <p className="text-sm text-muted-foreground">Students must receive approval from parents</p>
                    </div>
                  </div>
                  <Switch checked={parentApprovalGatePass} onCheckedChange={setParentApprovalGatePass} />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Wifi className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <Label className="text-base font-medium">Wi-Fi MAC Registration</Label>
                      <p className="text-sm text-muted-foreground">Require students to register device MAC addresses</p>
                    </div>
                  </div>
                  <Switch checked={wifiMacRegistration} onCheckedChange={setWifiMacRegistration} />
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
                    <Input value={propertyName} onChange={(e) => setPropertyName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select value={timezone} onValueChange={setTimezone}>
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
                  <Input value={address} onChange={(e) => setAddress(e.target.value)} />
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
                  <Switch checked={lateEntrySms} onCheckedChange={setLateEntrySms} />
                </div>
                <Separator />
                <div className="flex items-center justify-between py-3">
                  <div>
                    <Label>Gate Pass Approval Notification</Label>
                    <p className="text-sm text-muted-foreground">Notify parents when gate pass is requested</p>
                  </div>
                  <Switch checked={gatePassNotif} onCheckedChange={setGatePassNotif} />
                </div>
                <Separator />
                <div className="flex items-center justify-between py-3">
                  <div>
                    <Label>Payment Due Reminders</Label>
                    <p className="text-sm text-muted-foreground">Send reminders before due date</p>
                  </div>
                  <Switch checked={paymentReminders} onCheckedChange={setPaymentReminders} />
                </div>
                <Separator />
                <div className="flex items-center justify-between py-3">
                  <div>
                    <Label>Maintenance Ticket Updates</Label>
                    <p className="text-sm text-muted-foreground">Notify students on ticket status changes</p>
                  </div>
                  <Switch checked={maintenanceUpdates} onCheckedChange={setMaintenanceUpdates} />
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
                    <Input type="number" value={latePaymentGrace} onChange={(e) => setLatePaymentGrace(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Daily Late Fee (₹)</Label>
                    <Input type="number" value={dailyLateFee} onChange={(e) => setDailyLateFee(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Electricity Rate (₹/kWh)</Label>
                    <Input type="number" value={electricityRate} onChange={(e) => setElectricityRate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Mess Rebate per Meal (₹)</Label>
                    <Input type="number" value={messRebate} onChange={(e) => setMessRebate(e.target.value)} />
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between py-3">
                  <div>
                    <Label>Auto-generate Monthly Invoices</Label>
                    <p className="text-sm text-muted-foreground">Generate invoices on 1st of each month</p>
                  </div>
                  <Switch checked={autoGenerateInvoices} onCheckedChange={setAutoGenerateInvoices} />
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <Label>Include Electricity in Invoice</Label>
                    <p className="text-sm text-muted-foreground">Auto-calculate from meter readings</p>
                  </div>
                  <Switch checked={includeElectricity} onCheckedChange={setIncludeElectricity} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/50">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <CardTitle className="text-destructive">Danger Zone</CardTitle>
                </div>
                <CardDescription>
                  Permanently delete all student and billing records. Property, blocks, rooms, beds, and staff are preserved.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-lg border border-destructive/30 bg-destructive/5">
                  <div>
                    <p className="font-medium">Wipe Students & Billing Data</p>
                    <p className="text-sm text-muted-foreground">
                      Removes students, invoices, payments, refunds, gate passes, complaints, tickets, attendance, mess, notices, admissions, notifications and resets beds to vacant.
                    </p>
                  </div>
                  <WipeDataButton />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </>
  );
};

export default Settings;

function WipeDataButton() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const handleWipe = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("wipe-student-billing");
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({
        title: "Data wiped",
        description: `Removed all students and billing records. Auth users deleted: ${data?.deletedUsers ?? 0}.`,
      });
      setConfirmText("");
    } catch (e: any) {
      toast({ title: "Wipe failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          Wipe Data
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Permanently wipe student & billing data?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. All student records, invoices, payments, refunds, gate passes, complaints, tickets, attendance, mess, notices, admissions and notifications will be permanently deleted. Beds will be reset to vacant.
            <br /><br />
            Type <strong>WIPE</strong> below to confirm.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Input
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="Type WIPE to confirm"
          autoFocus
        />
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setConfirmText("")}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={confirmText !== "WIPE" || loading}
            onClick={(e) => { e.preventDefault(); handleWipe(); }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? "Wiping..." : "Yes, wipe everything"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

