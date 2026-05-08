'use client';
import { useEffect, useState } from 'react';
import { CreditCard, Clock, DollarSign } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/shared/stat-card';
import { StatusBadge } from '@/components/shared/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { paymentService } from '@/services';
import { Payment } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/store/auth.store';

export default function PaymentsPage() {
  const user = useAuth((s) => s.user);
  const [data, setData] = useState<{ payments: Payment[]; totalSpent: number; pendingAmount: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'CLIENT') return;
    paymentService.clientSummary().then(setData).finally(() => setLoading(false));
  }, [user]);

  if (user?.role !== 'CLIENT') return <div className="text-sm text-muted-foreground">For clients only.</div>;
  if (loading) return <Skeleton className="h-96" />;
  if (!data) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total spent" value={formatCurrency(data.totalSpent)} icon={DollarSign} accent="emerald" />
        <StatCard label="Pending" value={formatCurrency(data.pendingAmount)} icon={Clock} accent="amber" />
        <StatCard label="Total transactions" value={data.payments.length} icon={CreditCard} accent="primary" />
      </div>

      <Card>
        <CardHeader><CardTitle>Payment history</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground">
                <tr className="border-b">
                  <th className="py-3 font-medium">Tx Reference</th>
                  <th className="py-3 font-medium">Project</th>
                  <th className="py-3 font-medium">Freelancer</th>
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
                    <td className="py-3 text-muted-foreground">{p.contract?.freelancer ? `${(p.contract.freelancer as { firstName?: string }).firstName ?? ''} ${(p.contract.freelancer as { lastName?: string }).lastName ?? ''}` : '—'}</td>
                    <td className="py-3 font-medium">{formatCurrency(Number(p.amount))}</td>
                    <td className="py-3"><StatusBadge status={p.status} /></td>
                    <td className="py-3 text-muted-foreground">{new Date(p.paidAt || p.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {data.payments.length === 0 && (
                  <tr><td colSpan={6} className="py-6 text-center text-muted-foreground">No payments yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
