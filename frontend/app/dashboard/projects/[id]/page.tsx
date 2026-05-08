'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Calendar, MapPin, DollarSign, Users, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/shared/status-badge';
import { BidForm } from '@/components/shared/bid-form';
import { projectService, bidService } from '@/services';
import { Project, Bid, Freelancer } from '@/types';
import { useAuth } from '@/store/auth.store';
import { formatCurrency, getInitials, timeAgo } from '@/lib/utils';

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const user = useAuth((s) => s.user);

  const [project, setProject] = useState<Project | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [recommended, setRecommended] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);

  const isOwnerClient = user?.role === 'CLIENT' && project && (project as unknown as { client?: { id?: string } }).client?.id === user.profileId;
  const isFreelancer = user?.role === 'FREELANCER';

  const refetch = () => {
    projectService.get(id).then(setProject);
    if (user?.role === 'CLIENT') {
      projectService.bids(id).then(setBids).catch(() => {});
      projectService.recommended(id).then(setRecommended).catch(() => {});
    }
  };

  useEffect(() => {
    if (!id) return;
    Promise.all([projectService.get(id)]).then(([p]) => {
      setProject(p);
    }).finally(() => setLoading(false));
    if (user?.role === 'CLIENT') {
      projectService.bids(id).then(setBids).catch(() => {});
      projectService.recommended(id).then(setRecommended).catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  const onAccept = async (bidId: string) => {
    try {
      await bidService.accept(bidId);
      toast.success('Bid accepted — contract created');
      refetch();
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message ?? 'Failed to accept bid');
    }
  };

  const onReject = async (bidId: string) => {
    try { await bidService.reject(bidId); toast.success('Bid rejected'); refetch(); }
    catch (err) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message ?? 'Failed to reject bid');
    }
  };

  const onClose = async () => {
    try { await projectService.close(id); toast.success('Project closed'); refetch(); }
    catch { toast.error('Failed to close project'); }
  };

  const onDelete = async () => {
    if (!confirm('Delete this project? This action cannot be undone.')) return;
    try { await projectService.delete(id); toast.success('Project deleted'); router.push('/dashboard/projects'); }
    catch { toast.error('Failed to delete'); }
  };

  if (loading) return <Skeleton className="h-96" />;
  if (!project) return <div>Project not found.</div>;

  const skillsList = (project.skills ?? []).map((s) => s.skill?.name ?? '').filter(Boolean);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{project.title}</h1>
            <StatusBadge status={project.status} />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />Posted {timeAgo(project.createdAt)}</span>
            <span className="flex items-center gap-1.5"><Users className="h-4 w-4" />{project.totalBids} bids</span>
            <Badge variant="secondary">{project.category}</Badge>
          </div>
        </div>
        {user?.role === 'CLIENT' && (
          <div className="flex gap-2">
            {project.status === 'OPEN' && <Button variant="outline" size="sm" onClick={onClose}>Close project</Button>}
            <Button variant="destructive" size="sm" onClick={onDelete}>Delete</Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Description</CardTitle></CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{project.description}</p>
            {skillsList.length > 0 && (
              <div className="mt-6">
                <div className="text-sm font-medium">Required skills</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {skillsList.map((s) => <Badge key={s} variant="secondary">{s}</Badge>)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Project details</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground"><DollarSign className="h-4 w-4" />Budget</span>
              <span className="font-medium">{formatCurrency(Number(project.budgetMin))} – {formatCurrency(Number(project.budgetMax))}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4" />Deadline</span>
              <span className="font-medium">{new Date(project.deadline).toLocaleDateString()}</span>
            </div>
            {project.client && (
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" />Client</span>
                <span className="font-medium">{project.client.firstName} {project.client.lastName}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Freelancer: bid form */}
      {isFreelancer && project.status === 'OPEN' && (
        <Card>
          <CardHeader><CardTitle>Place a bid</CardTitle></CardHeader>
          <CardContent>
            <BidForm projectId={project.id} onSuccess={refetch} />
          </CardContent>
        </Card>
      )}

      {/* Client: bids tab */}
      {user?.role === 'CLIENT' && (
        <Tabs defaultValue="bids">
          <TabsList>
            <TabsTrigger value="bids">Bids ({bids.length})</TabsTrigger>
            <TabsTrigger value="recommended">Recommended</TabsTrigger>
          </TabsList>

          <TabsContent value="bids" className="space-y-3">
            {bids.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-muted-foreground">No bids received yet.</CardContent></Card>
            ) : (
              bids.map((bid) => (
                <Card key={bid.id}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <Avatar><AvatarFallback>{getInitials(`${bid.freelancer?.firstName} ${bid.freelancer?.lastName}`)}</AvatarFallback></Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{bid.freelancer?.firstName} {bid.freelancer?.lastName}</span>
                              <StatusBadge status={bid.status} />
                            </div>
                            <div className="mt-0.5 text-xs text-muted-foreground">
                              ⭐ {Number(bid.freelancer?.avgRating ?? 0).toFixed(1)} · {bid.freelancer?.completedJobs ?? 0} completed jobs
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold">{formatCurrency(Number(bid.bidAmount))}</div>
                            <div className="text-xs text-muted-foreground">in {bid.deliveryDays} days</div>
                          </div>
                        </div>
                        <p className="mt-3 text-sm leading-relaxed">{bid.proposal}</p>
                        {bid.status === 'PENDING' && project.status === 'OPEN' && (
                          <div className="mt-4 flex gap-2">
                            <Button size="sm" onClick={() => onAccept(bid.id)}>Accept bid</Button>
                            <Button size="sm" variant="outline" onClick={() => onReject(bid.id)}>Reject</Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="recommended" className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              Smart matches based on skill overlap, ratings, and completed jobs.
            </div>
            {recommended.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-muted-foreground">No recommendations available.</CardContent></Card>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {recommended.map((f) => (
                  <Card key={f.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar><AvatarFallback>{getInitials(`${f.firstName} ${f.lastName}`)}</AvatarFallback></Avatar>
                        <div className="flex-1">
                          <div className="font-semibold">{f.firstName} {f.lastName}</div>
                          <div className="text-xs text-muted-foreground">⭐ {Number(f.avgRating).toFixed(1)} · {f.completedJobs} jobs · ${Number(f.hourlyRate)}/hr</div>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {(f.skills ?? []).slice(0, 3).map((s) => (
                              <Badge key={s.skill.id} variant="secondary" className="text-[10px]">{s.skill.name}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
