
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { ClipboardList, Search } from "lucide-react";
import { useState } from "react";

const SuperAdminAttendance = () => {
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [propertyFilter, setPropertyFilter] = useState("all");

  const { data: properties } = useQuery({
    queryKey: ['sa-att-properties'],
    queryFn: async () => {
      const { data } = await supabase.from('properties').select('id, name');
      return data || [];
    },
  });

  const { data: attendance, isLoading } = useQuery({
    queryKey: ['sa-attendance', dateFilter, propertyFilter],
    queryFn: async () => {
      let query = supabase
        .from('attendance')
        .select('*, students(id, roll_number, user_id, profiles:user_id(full_name)), properties(name)')
        .eq('date', dateFilter)
        .order('created_at', { ascending: false });

      if (propertyFilter !== "all") {
        query = query.eq('property_id', propertyFilter);
      }

      const { data } = await query;
      return data || [];
    },
  });

  const filtered = attendance?.filter(a => {
    const studentName = (a.students as any)?.profiles?.full_name || '';
    const rollNumber = (a.students as any)?.roll_number || '';
    return studentName.toLowerCase().includes(search.toLowerCase()) || rollNumber.toLowerCase().includes(search.toLowerCase());
  }) || [];

  const statusColors: Record<string, string> = {
    present: "bg-emerald-100 text-emerald-700",
    absent: "bg-red-100 text-red-700",
    late: "bg-amber-100 text-amber-700",
    leave: "bg-blue-100 text-blue-700",
  };

  return (
    <>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-red-500" />
            Attendance Management
          </h1>
          <p className="text-sm text-muted-foreground">View attendance records across all properties</p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by student name or roll number..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
              </div>
              <Input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="w-auto" />
              <Select value={propertyFilter} onValueChange={setPropertyFilter}>
                <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Properties" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Properties</SelectItem>
                  {properties?.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}</div> : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Roll No.</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(record => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{(record.students as any)?.profiles?.full_name || '—'}</TableCell>
                      <TableCell>{(record.students as any)?.roll_number || '—'}</TableCell>
                      <TableCell>{(record.properties as any)?.name || '—'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusColors[record.status] || ''}>{record.status}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{record.notes || '—'}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{record.date}</TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No attendance records found</TableCell></TableRow>}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminAttendance;
