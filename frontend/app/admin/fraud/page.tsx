'use client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { adminService } from '@/services';

interface FraudReport {
  id: string;
  reportType: string;
  description: string;
  isResolved: boolean;
  createdAt: string;
  reported: { email: string; role: string };
}

export default function AdminFraudPage() {
  const [reports, setReports] = useState<FraudReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResolved, setShowResolved] = useState(false);

  const fetch = () => {
    setLoading(true);
    adminService.fraudReports({ isResolved: showResolved ? 'true' : 'false', limit: '50' })
      .then((r) => setReports(r.data as never)).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [showResolved]); // eslint-disable-line

  const onResolve = async (id: string) => {
    try { await adminService.resolveReport(id); toast.success('Report resolved'); fetch(); }
    catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Fraud reports</h1>
        <p className="text-sm text-muted-foreground">Suspicious activity flagged by the system.</p>
      </div>

      <Tabs value={showResolved ? 'resolved' : 'open'} onValueChange={(v) => setShowResolved(v === 'resolved')}>
        <TabsList>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
        </TabsList>

        <TabsContent value="open" className="mt-4 space-y-3">
          {loading ? <Skeleton className="h-40" /> : reports.length === 0 ? (
            <Card><CardContent className="p-10 text-center text-muted-foreground">No open reports — looking clean!</CardContent></Card>
          ) : (
            reports.map((r) => (
              <Card key={r.id}>
                <CardContent className="flex items-start justify-between gap-4 p-5">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <Badge variant="warning">{r.reportType.replace('_', ' ')}</Badge>
                      <span className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="mt-2 text-sm">{r.description}</p>
                    <p className="mt-2 text-xs text-muted-foreground">Reported user: <span className="font-mono">{r.reported.email}</span> ({r.reported.role})</p>
                  </div>
                  <Button size="sm" onClick={() => onResolve(r.id)}>Mark resolved</Button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="resolved" className="mt-4 space-y-3">
          {loading ? <Skeleton className="h-40" /> : reports.length === 0 ? (
            <Card><CardContent className="p-10 text-center text-muted-foreground">No resolved reports yet.</CardContent></Card>
          ) : (
            reports.map((r) => (
              <Card key={r.id}>
                <CardContent className="p-5">
                  <Badge variant="success">Resolved</Badge>
                  <p className="mt-2 text-sm">{r.description}</p>
                  <p className="mt-2 text-xs text-muted-foreground">User: {r.reported.email}</p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
