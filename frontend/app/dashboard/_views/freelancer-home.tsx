'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Gavel, FileText, CreditCard, Star } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { StatCard } from '@/components/shared/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { bidService, contractService, paymentService } from '@/services';
import { Bid, Contract, Payment } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/store/auth.store';

export function FreelancerDashboardHome() {
  const user = useAuth((s) => s.user);
  const [bids, setBids] = useState<Bid[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [totalEarned, setTotalEarned] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      bidService.myBids({ limit: '20' }),
      contractService.myFreelancer(),
      paymentService.freelancerEarnings(),
    ]).then(([b, c, e]) => {
      setBids(b.data); setContracts(c); setPayments(e.payments);
      setTotalEarned(e.totalEarned); setPendingAmount(e.pendingAmount);
    }).finally(() => setLoading(false));
  }, []);

  const activeContracts = contracts.filter((c) => c.status === 'ACTIVE').length;
  const acceptedBids = bids.filter((b) => b.status === 'ACCEPTED').length;
  const pendingBids = bids.filter((b) => b.status === 'PENDING').length;

  const chartData = payments.slice(0, 8).reverse().map((p) => ({
    name: new Date(p.paidAt || p.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    earnings: Number(p.amount),
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Track your bids, contracts, and earnings.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Contracts" value={activeContracts} icon={FileText} accent="primary" />
        <StatCard label="Pending Bids" value={pendingBids} icon={Gavel} accent="amber" />
        <StatCard label="Total Earned" value={formatCurrency(totalEarned)} icon={CreditCard} accent="emerald" />
        <StatCard label="Pending Payments" value={formatCurrency(pendingAmount)} icon={Star} accent="rose" hint={`${acceptedBids} accepted`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Earnings over time</CardTitle></CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <p className="text-sm text-muted-foreground">No earnings yet — accept bids to start working.</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="name" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Line type="monotone" dataKey="earnings" stroke="hsl(217, 91%, 55%)" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Active work</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {contracts.filter((c) => c.status === 'ACTIVE').length === 0 ? (
              <p className="text-sm text-muted-foreground">No active contracts.</p>
            ) : (
              contracts.filter((c) => c.status === 'ACTIVE').slice(0, 4).map((c) => (
                <Link key={c.id} href={`/dashboard/contracts/${c.id}`} className="block rounded-lg border p-3 hover:bg-accent">
                  <div className="text-sm font-medium">{c.project?.title}</div>
                  <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Due {new Date(c.endDate).toLocaleDateString()}</span>
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
          <CardTitle>Recent bids</CardTitle>
          <Link href="/dashboard/bids" className="text-sm text-primary hover:underline">View all</Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground">
                <tr className="border-b">
                  <th className="py-3 font-medium">Project</th>
                  <th className="py-3 font-medium">Bid</th>
                  <th className="py-3 font-medium">Delivery</th>
                  <th className="py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {bids.slice(0, 5).map((b) => (
                  <tr key={b.id} className="border-b last:border-0 hover:bg-accent/50">
                    <td className="py-3">
                      <Link href={`/projects/${b.projectId}`} className="font-medium hover:underline">{b.project?.title}</Link>
                    </td>
                    <td className="py-3">{formatCurrency(Number(b.bidAmount))}</td>
                    <td className="py-3 text-muted-foreground">{b.deliveryDays}d</td>
                    <td className="py-3"><StatusBadge status={b.status} /></td>
                  </tr>
                ))}
                {bids.length === 0 && (
                  <tr><td colSpan={4} className="py-6 text-center text-muted-foreground">No bids yet — browse projects to start.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">Logged in as {user?.email}</p>
    </div>
  );
}
