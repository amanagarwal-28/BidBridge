'use client';
import { useEffect, useState } from 'react';
import { Users, Briefcase, FolderKanban, AlertTriangle, DollarSign, FileText } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

import { StatCard } from '@/components/shared/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { adminService } from '@/services';
import { formatCurrency } from '@/lib/utils';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [analytics, setAnalytics] = useState<{ categoryStats?: { category: string; _count: { id: number } }[]; topFreelancers?: { id: string; firstName: string; lastName: string; avgRating: number; completedJobs: number; totalEarned: number }[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminService.stats(), adminService.analytics()])
      .then(([s, a]) => {
        setStats(s as unknown as Record<string, number>);
        setAnalytics(a as never);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton className="h-96" />;
  if (!stats) return null;

  const categoryData = (analytics?.categoryStats ?? []).map((c) => ({ name: c.category, value: c._count.id }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Overview</h1>
        <p className="text-sm text-muted-foreground">Platform-wide stats, growth, and health.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total users" value={stats.totalUsers} icon={Users} accent="primary" hint={`${stats.totalClients} clients · ${stats.totalFreelancers} freelancers`} />
        <StatCard label="Active projects" value={(stats.openProjects ?? 0) + (stats.inProgressProjects ?? 0)} icon={Briefcase} accent="emerald" />
        <StatCard label="Completed projects" value={stats.completedProjects} icon={FolderKanban} accent="amber" />
        <StatCard label="Platform revenue" value={formatCurrency(Number(stats.totalRevenue))} icon={DollarSign} accent="rose" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total contracts" value={stats.totalContracts} icon={FileText} accent="primary" />
        <StatCard label="Open fraud reports" value={stats.pendingFraudReports} icon={AlertTriangle} accent="rose" />
        <StatCard label="Open projects" value={stats.openProjects} icon={Briefcase} accent="amber" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Projects by category</CardTitle></CardHeader>
          <CardContent>
            {categoryData.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data.</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                    {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Top freelancers</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(analytics?.topFreelancers ?? []).slice(0, 5).map((f, i) => (
                <div key={f.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-muted-foreground">#{i + 1}</span>
                    <div>
                      <div className="font-medium">{f.firstName} {f.lastName}</div>
                      <div className="text-xs text-muted-foreground">⭐ {Number(f.avgRating).toFixed(1)} · {f.completedJobs} jobs</div>
                    </div>
                  </div>
                  <div className="font-medium">{formatCurrency(Number(f.totalEarned))}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
