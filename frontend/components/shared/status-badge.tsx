import { Badge } from '@/components/ui/badge';

const STATUS_VARIANTS: Record<string, 'default' | 'success' | 'warning' | 'destructive' | 'secondary'> = {
  OPEN: 'default',
  IN_PROGRESS: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'destructive',
  CLOSED: 'secondary',
  PENDING: 'warning',
  ACCEPTED: 'success',
  REJECTED: 'destructive',
  WITHDRAWN: 'secondary',
  ACTIVE: 'warning',
  DISPUTED: 'destructive',
  FAILED: 'destructive',
  REFUNDED: 'secondary',
  SUBMITTED: 'default',
  APPROVED: 'success',
};

export function StatusBadge({ status }: { status: string }) {
  return <Badge variant={STATUS_VARIANTS[status] ?? 'default'}>{status.replace('_', ' ')}</Badge>;
}
