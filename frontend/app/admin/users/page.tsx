'use client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Search } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { adminService } from '@/services';

interface AdminUser {
  id: string;
  email: string;
  role: string;
  isBlocked: boolean;
  isActive: boolean;
  createdAt: string;
  client?: { firstName: string; lastName: string };
  freelancer?: { firstName: string; lastName: string; avgRating: number; completedJobs: number };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const fetch = () => {
    setLoading(true);
    const params: Record<string, string> = { limit: '50' };
    if (search) params.search = search;
    if (roleFilter !== 'all') params.role = roleFilter;
    adminService.users(params).then((r) => setUsers(r.data as never)).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [search, roleFilter]); // eslint-disable-line

  const onBlock = async (id: string) => {
    try { await adminService.blockUser(id); toast.success('User blocked'); fetch(); }
    catch { toast.error('Failed'); }
  };
  const onUnblock = async (id: string) => {
    try { await adminService.unblockUser(id); toast.success('User unblocked'); fetch(); }
    catch { toast.error('Failed'); }
  };
  const onDelete = async (id: string) => {
    if (!confirm('Permanently delete this user?')) return;
    try { await adminService.deleteUser(id); toast.success('User deleted'); fetch(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <p className="text-sm text-muted-foreground">Manage all users on the platform.</p>
      </div>

      <Card>
        <CardContent className="flex gap-3 p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search email..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="CLIENT">Clients</SelectItem>
              <SelectItem value="FREELANCER">Freelancers</SelectItem>
              <SelectItem value="ADMIN">Admins</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6"><Skeleton className="h-32" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-muted-foreground">
                  <tr className="border-b">
                    <th className="px-6 py-3 font-medium">Name</th>
                    <th className="py-3 font-medium">Email</th>
                    <th className="py-3 font-medium">Role</th>
                    <th className="py-3 font-medium">Status</th>
                    <th className="py-3 font-medium">Joined</th>
                    <th className="py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const name = u.client ? `${u.client.firstName} ${u.client.lastName}` : u.freelancer ? `${u.freelancer.firstName} ${u.freelancer.lastName}` : '—';
                    return (
                      <tr key={u.id} className="border-b last:border-0">
                        <td className="px-6 py-3 font-medium">{name}</td>
                        <td className="py-3 text-muted-foreground">{u.email}</td>
                        <td className="py-3"><Badge variant="secondary">{u.role}</Badge></td>
                        <td className="py-3">
                          {u.isBlocked
                            ? <Badge variant="destructive">Blocked</Badge>
                            : <Badge variant="success">Active</Badge>}
                        </td>
                        <td className="py-3 text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="py-3">
                          <div className="flex gap-2">
                            {u.isBlocked
                              ? <Button size="sm" variant="outline" onClick={() => onUnblock(u.id)}>Unblock</Button>
                              : <Button size="sm" variant="outline" onClick={() => onBlock(u.id)}>Block</Button>}
                            <Button size="sm" variant="destructive" onClick={() => onDelete(u.id)}>Delete</Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {users.length === 0 && (
                    <tr><td colSpan={6} className="py-10 text-center text-muted-foreground">No users.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
