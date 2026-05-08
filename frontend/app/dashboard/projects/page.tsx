'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Plus, Eye } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { projectService } from '@/services';
import { Project } from '@/types';
import { formatCurrency, timeAgo } from '@/lib/utils';
import { useAuth } from '@/store/auth.store';

export default function MyProjectsPage() {
  const user = useAuth((s) => s.user);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'CLIENT') return;
    projectService.myProjects().then((p) => setProjects(p.data)).finally(() => setLoading(false));
  }, [user]);

  if (user?.role !== 'CLIENT') {
    return <div className="text-sm text-muted-foreground">This page is only for clients.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My projects</h1>
          <p className="text-sm text-muted-foreground">Manage all the projects you've posted.</p>
        </div>
        <Button asChild className="gap-2"><Link href="/dashboard/projects/new"><Plus className="h-4 w-4" />New project</Link></Button>
      </div>

      {loading ? (
        <div className="grid gap-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32" />)}</div>
      ) : projects.length === 0 ? (
        <Card><CardContent className="p-10 text-center">
          <p className="text-muted-foreground">You haven't posted any projects yet.</p>
          <Button asChild className="mt-4"><Link href="/dashboard/projects/new">Post your first project</Link></Button>
        </CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {projects.map((p) => (
            <Card key={p.id} className="transition hover:border-primary/40">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Link href={`/dashboard/projects/${p.id}`} className="text-lg font-semibold hover:underline">{p.title}</Link>
                      <StatusBadge status={p.status} />
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span><strong className="text-foreground">{p._count?.bids ?? 0}</strong> bids</span>
                      <span><strong className="text-foreground">{formatCurrency(Number(p.budgetMin))} – {formatCurrency(Number(p.budgetMax))}</strong></span>
                      <span>Deadline: {new Date(p.deadline).toLocaleDateString()}</span>
                      <span>Posted {timeAgo(p.createdAt)}</span>
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm" className="gap-2">
                    <Link href={`/dashboard/projects/${p.id}`}><Eye className="h-4 w-4" />View</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
