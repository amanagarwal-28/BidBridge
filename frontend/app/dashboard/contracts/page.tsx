'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/store/auth.store';
import { contractService } from '@/services';
import { Contract } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusBadge } from '@/components/shared/status-badge';
import { formatCurrency } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';

export default function ContractsPage() {
  const user = useAuth((s) => s.user);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetcher = user.role === 'CLIENT' ? contractService.myClient : contractService.myFreelancer;
    fetcher().then(setContracts).finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{user?.role === 'CLIENT' ? 'My contracts' : 'Active work'}</h1>
        <p className="text-sm text-muted-foreground">All active and completed contracts.</p>
      </div>

      {loading ? (
        <div className="grid gap-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28" />)}</div>
      ) : contracts.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-muted-foreground">No contracts yet.</CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {contracts.map((c) => {
            const counterparty = user?.role === 'CLIENT' ? c.freelancer : c.project?.client;
            const cpName = counterparty ? `${(counterparty as { firstName: string }).firstName} ${(counterparty as { lastName: string }).lastName}` : '';
            return (
              <Link key={c.id} href={`/dashboard/contracts/${c.id}`}>
                <Card className="transition hover:border-primary/40">
                  <CardContent className="flex items-center gap-4 p-5">
                    <Avatar><AvatarFallback>{getInitials(cpName || 'BB')}</AvatarFallback></Avatar>
                    <div className="flex-1">
                      <div className="font-semibold">{c.project?.title}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {user?.role === 'CLIENT' ? 'Freelancer' : 'Client'}: {cpName}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatCurrency(Number(c.agreedAmount))}</div>
                      <div className="mt-1"><StatusBadge status={c.status} /></div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
