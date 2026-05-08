'use client';
import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { useAuth } from '@/store/auth.store';
import { reviewService } from '@/services';
import { Review } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { getInitials, timeAgo } from '@/lib/utils';

export default function ReviewsPage() {
  const user = useAuth((s) => s.user);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'FREELANCER') return;
    reviewService.forFreelancer(user.profileId).then(setReviews).finally(() => setLoading(false));
  }, [user]);

  if (user?.role !== 'FREELANCER') return <div>For freelancers only.</div>;

  const avg = reviews.length === 0 ? 0 : reviews.reduce((acc, r) => acc + r.clientRating, 0) / reviews.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reviews & Ratings</h1>
        <p className="text-sm text-muted-foreground">Feedback from clients you've worked with.</p>
      </div>

      <Card>
        <CardContent className="flex items-center justify-between p-6">
          <div>
            <div className="text-xs text-muted-foreground">Average rating</div>
            <div className="mt-1 flex items-center gap-3">
              <span className="text-4xl font-bold">{avg.toFixed(1)}</span>
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map((n) => (
                  <Star key={n} className={`h-5 w-5 ${n <= Math.round(avg) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />
                ))}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Total reviews</div>
            <div className="mt-1 text-3xl font-bold">{reviews.length}</div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32" />)
        ) : reviews.length === 0 ? (
          <Card><CardContent className="p-10 text-center text-muted-foreground">No reviews yet.</CardContent></Card>
        ) : reviews.map((r) => (
          <Card key={r.id}>
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <Avatar><AvatarFallback>{getInitials(`${r.client?.firstName} ${r.client?.lastName}`)}</AvatarFallback></Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{r.client?.firstName} {r.client?.lastName}</div>
                      <div className="text-xs text-muted-foreground">{r.contract?.project?.title} · {timeAgo(r.createdAt)}</div>
                    </div>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map((n) => (
                        <Star key={n} className={`h-4 w-4 ${n <= r.clientRating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />
                      ))}
                    </div>
                  </div>
                  {r.clientText && <p className="mt-3 text-sm leading-relaxed">{r.clientText}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
