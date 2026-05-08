'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Search, Filter } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { projectService } from '@/services';
import { Project } from '@/types';
import { formatCurrency, timeAgo } from '@/lib/utils';

const CATEGORIES = ['Web Development', 'Mobile Development', 'Design', 'Writing', 'Marketing', 'DevOps', 'Data Science'];

export default function BrowseProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = { status: 'OPEN', limit: '30' };
    if (search) params.search = search;
    if (category && category !== 'all') params.category = category;
    projectService.list(params).then((r) => setProjects(r.data)).finally(() => setLoading(false));
  }, [search, category]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Browse projects</h1>
        <p className="text-sm text-muted-foreground">Find work that matches your skills.</p>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 p-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search projects..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full md:w-56"><Filter className="mr-2 h-4 w-4" /><SelectValue placeholder="All categories" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />)}</div>
      ) : projects.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-muted-foreground">No projects found.</CardContent></Card>
      ) : (
        <div className="grid gap-4">
          {projects.map((p) => (
            <Link key={p.id} href={`/dashboard/projects/${p.id}`}>
              <Card className="transition hover:border-primary/40">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{p.title}</span>
                        <Badge variant="secondary">{p.category}</Badge>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(p.skills ?? []).slice(0, 5).map((s) => (
                          <Badge key={s.skill.id} variant="outline" className="text-[10px]">{s.skill.name}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatCurrency(Number(p.budgetMin))}–{formatCurrency(Number(p.budgetMax))}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{p._count?.bids ?? p.totalBids ?? 0} bids · {timeAgo(p.createdAt)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
