'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Calendar, DollarSign, Star, Plus, Check } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/shared/status-badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';

import { contractService, paymentService, reviewService } from '@/services';
import { Contract } from '@/types';
import { useAuth } from '@/store/auth.store';
import { formatCurrency } from '@/lib/utils';

export default function ContractDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const user = useAuth((s) => s.user);

  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);

  const isClient = user?.role === 'CLIENT';

  const refetch = () => contractService.get(id).then(setContract);

  useEffect(() => { if (id) contractService.get(id).then(setContract).finally(() => setLoading(false)); }, [id]);

  if (loading) return <Skeleton className="h-96" />;
  if (!contract) return <div>Contract not found.</div>;

  const onCompleteContract = async () => {
    if (!confirm('Mark this contract as complete?')) return;
    try { await contractService.complete(id); toast.success('Contract marked complete'); refetch(); }
    catch { toast.error('Failed to complete'); }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{contract.project?.title}</h1>
          <div className="mt-1 flex items-center gap-2">
            <StatusBadge status={contract.status} />
            <Badge variant="secondary">Contract #{contract.id.slice(0, 8)}</Badge>
          </div>
        </div>
        {isClient && contract.status === 'ACTIVE' && (
          <Button onClick={onCompleteContract}><Check className="mr-2 h-4 w-4" />Mark complete</Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="p-5">
          <div className="text-xs text-muted-foreground">Agreed amount</div>
          <div className="mt-1 text-2xl font-bold">{formatCurrency(Number(contract.agreedAmount))}</div>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <div className="text-xs text-muted-foreground">Start date</div>
          <div className="mt-1 text-2xl font-bold">{new Date(contract.startDate).toLocaleDateString()}</div>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <div className="text-xs text-muted-foreground">End date</div>
          <div className="mt-1 text-2xl font-bold">{new Date(contract.endDate).toLocaleDateString()}</div>
        </CardContent></Card>
      </div>

      <MilestonesSection contract={contract} isClient={isClient} onUpdate={refetch} />

      <PaymentsSection contract={contract} isClient={isClient} onUpdate={refetch} />

      {contract.status === 'COMPLETED' && (
        <ReviewSection contractId={contract.id} isClient={isClient} freelancerId={contract.freelancerId} clientId={contract.project?.client?.id ?? ''} onUpdate={refetch} />
      )}
    </div>
  );
}

function MilestonesSection({ contract, isClient, onUpdate }: { contract: Contract; isClient: boolean; onUpdate: () => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await contractService.createMilestone(contract.id, { title, amount: Number(amount), dueDate: new Date(dueDate).toISOString() });
      toast.success('Milestone added');
      setOpen(false); setTitle(''); setAmount(''); setDueDate('');
      onUpdate();
    } catch { toast.error('Failed to add milestone'); }
    finally { setSubmitting(false); }
  };

  const onMilestoneStatus = async (milestoneId: string, status: string) => {
    try { await contractService.updateMilestone(milestoneId, status); toast.success('Milestone updated'); onUpdate(); }
    catch (err) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message ?? 'Failed');
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Milestones</CardTitle>
        {isClient && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm" className="gap-2"><Plus className="h-4 w-4" />Add milestone</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add milestone</DialogTitle></DialogHeader>
              <form onSubmit={onCreate} className="space-y-3">
                <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
                <div><Label>Amount (USD)</Label><Input type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} required /></div>
                <div><Label>Due date</Label><Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required /></div>
                <Button type="submit" disabled={submitting} className="w-full">Create milestone</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </CardHeader>
      <CardContent>
        {(contract.milestones ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No milestones yet.</p>
        ) : (
          <div className="space-y-2">
            {(contract.milestones ?? []).map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <div className="font-medium">{m.title}</div>
                  <div className="text-xs text-muted-foreground">Due {new Date(m.dueDate).toLocaleDateString()} · {formatCurrency(Number(m.amount))}</div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={m.status} />
                  {!isClient && m.status === 'PENDING' && (
                    <Button size="sm" variant="outline" onClick={() => onMilestoneStatus(m.id, 'IN_PROGRESS')}>Start</Button>
                  )}
                  {!isClient && (m.status === 'IN_PROGRESS' || m.status === 'PENDING') && (
                    <Button size="sm" onClick={() => onMilestoneStatus(m.id, 'SUBMITTED')}>Submit</Button>
                  )}
                  {isClient && m.status === 'SUBMITTED' && (
                    <Button size="sm" onClick={() => onMilestoneStatus(m.id, 'APPROVED')}>Approve</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PaymentsSection({ contract, isClient, onUpdate }: { contract: Contract; isClient: boolean; onUpdate: () => void }) {
  const [submitting, setSubmitting] = useState<string | null>(null);

  const onInitiate = async (milestoneId?: string) => {
    setSubmitting(milestoneId || 'all');
    try {
      await paymentService.initiate(contract.id, milestoneId);
      toast.success('Payment initiated');
      onUpdate();
    } catch { toast.error('Failed to initiate payment'); }
    finally { setSubmitting(null); }
  };

  const onComplete = async (paymentId: string) => {
    try { await paymentService.complete(paymentId); toast.success('Payment released'); onUpdate(); }
    catch { toast.error('Failed to release payment'); }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Payments</CardTitle>
        {isClient && (
          <Button size="sm" onClick={() => onInitiate()} disabled={submitting !== null}>
            <DollarSign className="mr-2 h-4 w-4" />Pay full amount
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {(contract.payments ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No payments recorded.</p>
        ) : (
          <div className="space-y-2">
            {(contract.payments ?? []).map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <div className="font-medium">{formatCurrency(Number(p.amount))}</div>
                  <div className="text-xs text-muted-foreground">{p.txRef ?? 'Pending'} · {new Date(p.createdAt).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={p.status} />
                  {isClient && p.status === 'PENDING' && (
                    <Button size="sm" onClick={() => onComplete(p.id)}>Release</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ReviewSection({ contractId, isClient, freelancerId, clientId, onUpdate }: { contractId: string; isClient: boolean; freelancerId: string; clientId: string; onUpdate: () => void }) {
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = isClient
        ? { clientRating: rating, clientText: text }
        : { freelancerRating: rating, freelancerText: text };
      await reviewService.create(contractId, data);
      toast.success('Review submitted');
      setText(''); setRating(5); onUpdate();
    } catch { toast.error('Failed to submit review'); }
    finally { setSubmitting(false); }
  };

  return (
    <Card>
      <CardHeader><CardTitle>Leave a review</CardTitle></CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label>Rating</Label>
            <div className="mt-1 flex gap-1">
              {[1,2,3,4,5].map((n) => (
                <button key={n} type="button" onClick={() => setRating(n)}>
                  <Star className={`h-7 w-7 ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40'}`} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>Comment</Label>
            <Textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="Share your experience..." />
          </div>
          <Button type="submit" disabled={submitting}>Submit review</Button>
        </form>
      </CardContent>
    </Card>
  );
}
