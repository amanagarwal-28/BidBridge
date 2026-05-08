'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Briefcase, FolderKanban, CreditCard, FileText, Plus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';

import { StatCard } from '@/components/shared/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { projectService, paymentService, contractService } from '@/services';
import { Project, Contract } from '@/types';
import { formatCurrency } from '@/lib/utils';

export function ClientDashboardHome() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [paySummary, setPaySummary] = useState<{ totalSpent: number; pendingAmount: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      projectService.myProjects({ limit: '10' }),
      contractService.myClient(),
      paymentService.clientSummary(),
    ]).then(([p, c, pay]) => {
      setProjects(p.data); setContracts(c); setPaySummary({ totalSpent: pay.totalSpent, pendingAmount: pay.pendingAmount });
    }).finally(() => setLoading(false));
  }, []);

  const active = projects.filter((p) => p.status === 'IN_PROGRESS' || p.status === 'OPEN').length;
  const completed = projects.filter((p) => p.status === 'COMPLETED').length;
  const totalBids = projects.reduce((acc, p) => acc + (p._count?.bids ?? p.totalBids ?? 0), 0);

  const chartData = projects.slice(0, 6).reverse().map((p) => ({
    name: p.title.length > 18 ? p.title.slice(0, 18) + '…' : p.title,
    bids: p._count?.bids ?? p.totalBids ?? 0,
  }));

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />)}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Here's an overview of your projects and spending.</p>
        </div>
        <Button asChild className="gap-2"><Link href="/dashboard/projects/new"><Plus className="h-4 w-4" />Post a project</Link></Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Projects" value={active} icon={Briefcase} accent="primary" />
        <StatCard label="Completed" value={completed} icon={FolderKanban} accent="emerald" />
        <StatCard label="Bids Received" value={totalBids} icon={FileText} accent="amber" />
        <StatCard label="Total Spent" value={formatCurrency(paySummary?.totalSpent ?? 0)} icon={CreditCard} accent="rose" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Bids per project</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data yet — post a project to see analytics.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="name" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="bids" fill="hsl(217, 91%, 55%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Active contracts</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {contracts.filter((c) => c.status === 'ACTIVE').length === 0 ? (
              <p className="text-sm text-muted-foreground">No active contracts.</p>
            ) : (
              contracts.filter((c) => c.status === 'ACTIVE').slice(0, 4).map((c) => (
                <Link key={c.id} href={`/dashboard/contracts/${c.id}`} className="block rounded-lg border p-3 hover:bg-accent">
                  <div className="text-sm font-medium">{c.project?.title}</div>
                  <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{c.freelancer?.firstName} {c.freelancer?.lastName}</span>
                    <span className="font-medium text-foreground">{formatCurrency(Number(c.agreedAmount))}</span>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent projects</CardTitle>
          <Button asChild variant="ghost" size="sm"><Link href="/dashboard/projects">View all</Link></Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground">
                <tr className="border-b">
                  <th className="py-3 font-medium">Project</th>
                  <th className="py-3 font-medium">Category</th>
                  <th className="py-3 font-medium">Bids</th>
                  <th className="py-3 font-medium">Budget</th>
                  <th className="py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {projects.slice(0, 5).map((p) => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-accent/50">
                    <td className="py-3">
                      <Link href={`/dashboard/projects/${p.id}`} className="font-medium hover:underline">{p.title}</Link>
                    </td>
                    <td className="py-3 text-muted-foreground">{p.category}</td>
                    <td className="py-3">{p._count?.bids ?? p.totalBids ?? 0}</td>
                    <td className="py-3">{formatCurrency(Number(p.budgetMin))} – {formatCurrency(Number(p.budgetMax))}</td>
                    <td className="py-3"><StatusBadge status={p.status} /></td>
                  </tr>
                ))}
                {projects.length === 0 && (
                  <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">No projects yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
