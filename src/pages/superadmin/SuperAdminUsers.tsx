import { SuperAdminLayout } from "@/components/superadmin/SuperAdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { UserCog, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database['public']['Enums']['app_role'];

const roleBadgeVariants: Record<AppRole, string> = {
  super_admin: "bg-red-100 text-red-700 border-red-200",
  tenant_admin: "bg-blue-100 text-blue-700 border-blue-200",
  warden: "bg-amber-100 text-amber-700 border-amber-200",
  student: "bg-emerald-100 text-emerald-700 border-emerald-200",
  parent: "bg-purple-100 text-purple-700 border-purple-200",
  security_guard: "bg-slate-100 text-slate-700 border-slate-200",
};

const SuperAdminUsers = () => {
  const [search, setSearch] = useState("");

  const { data: users, isLoading } = useQuery({
    queryKey: ['superadmin-users'],
    queryFn: async () => {
      const { data: roles } = await supabase.from('user_roles').select('user_id, role');
      const { data: profiles } = await supabase.from('profiles').select('*');

      return (profiles || []).map(profile => ({
        ...profile,
        role: roles?.find(r => r.user_id === profile.id)?.role || null,
      }));
    },
  });

  const filtered = users?.filter(u =>
    (u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <SuperAdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <UserCog className="h-6 w-6 text-red-500" />
              User Management
            </h1>
            <p className="text-sm text-muted-foreground">Manage all users and their roles</p>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(user => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.full_name || '—'}</TableCell>
                      <TableCell>{user.email || '—'}</TableCell>
                      <TableCell>
                        {user.role ? (
                          <Badge variant="outline" className={roleBadgeVariants[user.role as AppRole] || ''}>
                            {(user.role as string).replace('_', ' ')}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">No role</span>
                        )}
                      </TableCell>
                      <TableCell>{user.phone || '—'}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">No users found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminUsers;
