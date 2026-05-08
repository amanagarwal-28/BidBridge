'use client';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { adminService } from '@/services';

interface Analytics {
  categoryStats: { category: string; _count: { id: number } }[];
  recentProjects: { createdAt: string; status: string }[];
  recentPayments: { amount: number; paidAt: string }[];
  topFreelancers: { firstName: string; lastName: string; avgRating: number; completedJobs: number; totalEarned: number }[];
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { adminService.analytics().then((d) => setData(d as never)).finally(() => setLoading(false)); }, []);

  if (loading) return <Skeleton className="h-96" />;
  if (!data) return null;

  const categoryData = data.categoryStats.map((c) => ({ category: c.category, count: c._count.id }));

  // Build monthly project trend
  const monthly: Record<string, number> = {};
  data.recentProjects.forEach((p) => {
    const d = new Date(p.createdAt);
    const key = d.toLocaleString('en', { month: 'short' });
    monthly[key] = (monthly[key] ?? 0) + 1;
  });
  const projectTrend = Object.entries(monthly).map(([name, count]) => ({ name, count }));

  // Build payment trend
  const payMonthly: Record<string, number> = {};
  data.recentPayments.forEach((p) => {
    const d = new Date(p.paidAt);
    const key = d.toLocaleString('en', { month: 'short' });
    payMonthly[key] = (payMonthly[key] ?? 0) + Number(p.amount);
  });
  const payTrend = Object.entries(payMonthly).map(([name, total]) => ({ name, total }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">Platform health and trends.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Projects by category</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="category" fontSize={11} angle={-15} textAnchor="end" height={60} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(217, 91%, 55%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Monthly project posts</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={projectTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="name" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="hsl(160, 80%, 40%)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Revenue trend</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={payTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="name" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="hsl(217, 91%, 55%)" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
