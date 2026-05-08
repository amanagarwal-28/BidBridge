'use client';
import { useEffect, useState } from 'react';
import { CreditCard, Clock, TrendingUp } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/shared/stat-card';
import { StatusBadge } from '@/components/shared/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { paymentService } from '@/services';
import { Payment } from '@/types';
import { formatCurrency } from '@/lib/utils';

export default function EarningsPage() {
  const [data, setData] = useState<{ payments: Payment[]; totalEarned: number; pendingAmount: number; pendingPayments: Payment[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paymentService.freelancerEarnings().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton className="h-96" />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Earnings</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total earned" value={formatCurrency(data.totalEarned)} icon={TrendingUp} accent="emerald" />
        <StatCard label="Pending payouts" value={formatCurrency(data.pendingAmount)} icon={Clock} accent="amber" />
        <StatCard label="Total transactions" value={data.payments.length} icon={CreditCard} accent="primary" />
      </div>

      <Card>
        <CardHeader><CardTitle>Payment history</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground">
                <tr className="border-b">
                  <th className="py-3 font-medium">Reference</th>
                  <th className="py-3 font-medium">Project</th>
                  <th className="py-3 font-medium">Amount</th>
                  <th className="py-3 font-medium">Status</th>
                  <th className="py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.payments.map((p) => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="py-3 font-mono text-xs">{p.txRef ?? '—'}</td>
                    <td className="py-3">{p.contract?.project?.title}</td>
                    <td className="py-3 font-medium text-emerald-700">+{formatCurrency(Number(p.amount))}</td>
                    <td className="py-3"><StatusBadge status={p.status} /></td>
                    <td className="py-3 text-muted-foreground">{new Date(p.paidAt || p.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {data.payments.length === 0 && (
                  <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">No completed earnings yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {data.pendingPayments.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Pending payments</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.pendingPayments.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
                  <span>{p.contract?.project?.title}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{formatCurrency(Number(p.amount))}</span>
                    <StatusBadge status={p.status} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
