'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/store/auth.store';
import { bidService } from '@/services';
import { Bid } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/shared/status-badge';
import { formatCurrency, timeAgo } from '@/lib/utils';

export default function MyBidsPage() {
  const user = useAuth((s) => s.user);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBids = () =>
    bidService.myBids({ limit: '50' }).then((r) => setBids(r.data)).finally(() => setLoading(false));

  useEffect(() => { if (user?.role === 'FREELANCER') fetchBids(); }, [user]);

  if (user?.role !== 'FREELANCER') return <div>For freelancers only.</div>;

  const onWithdraw = async (id: string) => {
    try { await bidService.withdraw(id); toast.success('Bid withdrawn'); fetchBids(); }
    catch (err) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message ?? 'Failed');
    }
  };

  const filterByStatus = (status: string | 'all') =>
    status === 'all' ? bids : bids.filter((b) => b.status === status);

  const renderList = (list: Bid[]) => list.length === 0
    ? <Card><CardContent className="p-10 text-center text-muted-foreground">No bids in this category.</CardContent></Card>
    : <div className="grid gap-3">{list.map((b) => (
        <Card key={b.id}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <Link href={`/dashboard/projects/${b.projectId}`} className="font-semibold hover:underline">
                  {b.project?.title}
                </Link>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{b.proposal}</p>
                <div className="mt-2 text-xs text-muted-foreground">
                  Placed {timeAgo(b.createdAt)} · Deliver in {b.deliveryDays} days
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold">{formatCurrency(Number(b.bidAmount))}</div>
                <div className="mt-1"><StatusBadge status={b.status} /></div>
                {b.status === 'PENDING' && (
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => onWithdraw(b.id)}>Withdraw</Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My bids</h1>
        <p className="text-sm text-muted-foreground">Track all your proposals.</p>
      </div>
      {loading ? (
        <div className="grid gap-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28" />)}</div>
      ) : (
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All ({bids.length})</TabsTrigger>
            <TabsTrigger value="PENDING">Pending ({filterByStatus('PENDING').length})</TabsTrigger>
            <TabsTrigger value="ACCEPTED">Accepted ({filterByStatus('ACCEPTED').length})</TabsTrigger>
            <TabsTrigger value="REJECTED">Rejected ({filterByStatus('REJECTED').length})</TabsTrigger>
          </TabsList>
          <TabsContent value="all">{renderList(bids)}</TabsContent>
          <TabsContent value="PENDING">{renderList(filterByStatus('PENDING'))}</TabsContent>
          <TabsContent value="ACCEPTED">{renderList(filterByStatus('ACCEPTED'))}</TabsContent>
          <TabsContent value="REJECTED">{renderList(filterByStatus('REJECTED'))}</TabsContent>
        </Tabs>
      )}
    </div>
  );
}
