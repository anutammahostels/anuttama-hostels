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
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Megaphone, Plus, Trash2, Search } from "lucide-react";
import { useState } from "react";

const SuperAdminNotices = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState("normal");
  const [propertyId, setPropertyId] = useState("");

  const { data: properties } = useQuery({
    queryKey: ['sa-properties'],
    queryFn: async () => {
      const { data } = await supabase.from('properties').select('id, name');
      return data || [];
    },
  });

  const { data: notices, isLoading } = useQuery({
    queryKey: ['sa-notices'],
    queryFn: async () => {
      const { data } = await supabase
        .from('notices')
        .select('*, properties(name)')
        .order('created_at', { ascending: false });
      return data || [];
    },
  });

  const createNotice = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('notices').insert({
        title,
        content,
        priority,
        property_id: propertyId,
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sa-notices'] });
      toast({ title: "Notice Created" });
      setOpen(false);
      setTitle(""); setContent(""); setPriority("normal"); setPropertyId("");
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteNotice = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('notices').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sa-notices'] });
      toast({ title: "Notice Deleted" });
    },
  });

  const filtered = notices?.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const priorityColors: Record<string, string> = {
    high: "bg-red-100 text-red-700",
    normal: "bg-blue-100 text-blue-700",
    low: "bg-slate-100 text-slate-700",
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Megaphone className="h-6 w-6 text-red-500" />
              Notices Management
            </h1>
            <p className="text-sm text-muted-foreground">Create and manage notices across all properties</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-red-600 to-orange-500 text-white">
                <Plus className="h-4 w-4 mr-1" /> Create Notice
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Notice</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Property</Label>
                  <Select value={propertyId} onValueChange={setPropertyId}>
                    <SelectTrigger><SelectValue placeholder="Select property" /></SelectTrigger>
                    <SelectContent>{properties?.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Title</Label><Input value={title} onChange={e => setTitle(e.target.value)} /></div>
                <div><Label>Content</Label><Textarea value={content} onChange={e => setContent(e.target.value)} rows={4} /></div>
                <div><Label>Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={() => createNotice.mutate()} disabled={!title || !content || !propertyId} className="w-full">Create Notice</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search notices..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div> : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(notice => (
                    <TableRow key={notice.id}>
                      <TableCell className="font-medium">{notice.title}</TableCell>
                      <TableCell>{(notice.properties as any)?.name || '—'}</TableCell>
                      <TableCell><Badge variant="outline" className={priorityColors[notice.priority] || ''}>{notice.priority}</Badge></TableCell>
                      <TableCell><Badge variant={notice.is_active ? "default" : "secondary"}>{notice.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(notice.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => deleteNotice.mutate(notice.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No notices found</TableCell></TableRow>}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminNotices;
