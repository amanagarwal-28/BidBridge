'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { projectService } from '@/services';

const schema = z.object({
  proposal: z.string().min(20, 'Proposal must be at least 20 characters'),
  bidAmount: z.coerce.number().positive('Bid amount required'),
  deliveryDays: z.coerce.number().int().positive('Delivery days required'),
});

type FormValues = z.infer<typeof schema>;

export function BidForm({ projectId, onSuccess }: { projectId: string; onSuccess?: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      await projectService.placeBid(projectId, {
        proposal: values.proposal,
        bidAmount: Number(values.bidAmount),
        deliveryDays: Number(values.deliveryDays),
      });
      toast.success('Bid placed successfully');
      reset();
      onSuccess?.();
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message ?? 'Failed to place bid');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="proposal">Proposal</Label>
        <Textarea id="proposal" rows={5} placeholder="Why are you the right fit? Outline your approach, experience, and timeline." {...register('proposal')} />
        {errors.proposal && <p className="mt-1 text-xs text-destructive">{errors.proposal.message}</p>}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="bidAmount">Bid amount (USD)</Label>
          <Input id="bidAmount" type="number" min="1" placeholder="1500" {...register('bidAmount')} />
          {errors.bidAmount && <p className="mt-1 text-xs text-destructive">{errors.bidAmount.message}</p>}
        </div>
        <div>
          <Label htmlFor="deliveryDays">Delivery time (days)</Label>
          <Input id="deliveryDays" type="number" min="1" placeholder="30" {...register('deliveryDays')} />
          {errors.deliveryDays && <p className="mt-1 text-xs text-destructive">{errors.deliveryDays.message}</p>}
        </div>
      </div>
      <Button type="submit" disabled={submitting}>
        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Place bid
      </Button>
    </form>
  );
}
