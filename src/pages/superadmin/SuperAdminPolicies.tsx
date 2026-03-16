import { SuperAdminLayout } from "@/components/superadmin/SuperAdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { KeyRound, Plus, Trash2, Search, Edit } from "lucide-react";
import { useState } from "react";

const SuperAdminPolicies = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [settingKey, setSettingKey] = useState("");
  const [settingValue, setSettingValue] = useState("");
  const [description, setDescription] = useState("");
  const [propertyId, setPropertyId] = useState("");

  const { data: properties } = useQuery({
    queryKey: ['sa-pol-properties'],
    queryFn: async () => {
      const { data } = await supabase.from('properties').select('id, name');
      return data || [];
    },
  });

  const { data: policies, isLoading } = useQuery({
    queryKey: ['sa-policies'],
    queryFn: async () => {
      const { data } = await supabase
        .from('policy_settings')
        .select('*, properties(name)')
        .order('created_at', { ascending: false });
      return data || [];
    },
  });

  const createPolicy = useMutation({
    mutationFn: async () => {
      let parsedValue: any;
      try {
        parsedValue = JSON.parse(settingValue);
      } catch {
        parsedValue = settingValue;
      }
      const { error } = await supabase.from('policy_settings').insert({
        setting_key: settingKey,
        setting_value: parsedValue,
        description,
        property_id: propertyId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sa-policies'] });
      toast({ title: "Policy Created" });
      setOpen(false);
      setSettingKey(""); setSettingValue(""); setDescription(""); setPropertyId("");
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deletePolicy = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('policy_settings').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sa-policies'] });
      toast({ title: "Policy Deleted" });
    },
  });

  const filtered = policies?.filter(p =>
    p.setting_key.toLowerCase().includes(search.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <SuperAdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <KeyRound className="h-6 w-6 text-red-500" />
              Policy Engine
            </h1>
            <p className="text-sm text-muted-foreground">Manage property-specific rules and configurations</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-red-600 to-orange-500 text-white">
                <Plus className="h-4 w-4 mr-1" /> Add Policy
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Policy Setting</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Property</Label>
                  <Select value={propertyId} onValueChange={setPropertyId}>
                    <SelectTrigger><SelectValue placeholder="Select property" /></SelectTrigger>
                    <SelectContent>{properties?.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Setting Key</Label><Input value={settingKey} onChange={e => setSettingKey(e.target.value)} placeholder="e.g. curfew_time, max_gate_passes" /></div>
                <div><Label>Value (JSON or text)</Label><Textarea value={settingValue} onChange={e => setSettingValue(e.target.value)} placeholder='e.g. "22:00" or {"enabled": true, "limit": 5}' rows={3} /></div>
                <div><Label>Description</Label><Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe what this policy controls" /></div>
                <Button onClick={() => createPolicy.mutate()} disabled={!settingKey || !settingValue || !propertyId} className="w-full">Create Policy</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search policies..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div> : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Setting Key</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(policy => (
                    <TableRow key={policy.id}>
                      <TableCell>{(policy.properties as any)?.name || '—'}</TableCell>
                      <TableCell className="font-mono text-sm">{policy.setting_key}</TableCell>
                      <TableCell className="max-w-[200px] truncate font-mono text-xs">{JSON.stringify(policy.setting_value)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{policy.description || '—'}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(policy.updated_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => deletePolicy.mutate(policy.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No policies found</TableCell></TableRow>}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminPolicies;
