'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/shared/status-badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { adminService } from '@/services';
import { formatCurrency } from '@/lib/utils';

interface AdminProject {
  id: string;
  title: string;
  category: string;
  status: string;
  budgetMin: number;
  budgetMax: number;
  totalBids: number;
  client: { firstName: string; lastName: string };
  _count: { bids: number };
  createdAt: string;
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>('all');

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = { limit: '50' };
    if (status !== 'all') params.status = status;
    adminService.projects(params).then((r) => setProjects(r.data as never)).finally(() => setLoading(false));
  }, [status]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">All projects</h1>
          <p className="text-sm text-muted-foreground">Monitor every project posted on the platform.</p>
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="OPEN">Open</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
            <SelectItem value="CLOSED">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card><CardContent className="p-0">
        {loading ? <div className="p-6"><Skeleton className="h-40" /></div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground">
                <tr className="border-b">
                  <th className="px-6 py-3 font-medium">Title</th>
                  <th className="py-3 font-medium">Client</th>
                  <th className="py-3 font-medium">Category</th>
                  <th className="py-3 font-medium">Budget</th>
                  <th className="py-3 font-medium">Bids</th>
                  <th className="py-3 font-medium">Status</th>
                  <th className="py-3 font-medium">Posted</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="px-6 py-3 font-medium">{p.title}</td>
                    <td className="py-3">{p.client.firstName} {p.client.lastName}</td>
                    <td className="py-3 text-muted-foreground">{p.category}</td>
                    <td className="py-3">{formatCurrency(Number(p.budgetMin))}–{formatCurrency(Number(p.budgetMax))}</td>
                    <td className="py-3">{p._count.bids}</td>
                    <td className="py-3"><StatusBadge status={p.status} /></td>
                    <td className="py-3 text-muted-foreground">{new Date(p.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {projects.length === 0 && (
                  <tr><td colSpan={7} className="py-10 text-center text-muted-foreground">No projects.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </CardContent></Card>
    </div>
  );
}
