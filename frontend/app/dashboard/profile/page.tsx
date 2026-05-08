'use client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/store/auth.store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { userService } from '@/services';
import { Skill } from '@/types';

export default function ProfilePage() {
  const user = useAuth((s) => s.user);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const [form, setForm] = useState({
    firstName: '', lastName: '', bio: '', country: '', phone: '',
    company: '', hourlyRate: 0, availableForWork: true,
  });

  useEffect(() => {
    if (!user) return;
    if (user.role === 'CLIENT') {
      userService.getClient(user.profileId).then((c) => {
        setForm({
          firstName: c.firstName ?? '', lastName: c.lastName ?? '',
          bio: (c as { bio?: string }).bio ?? '', country: c.country ?? '',
          phone: (c as { phone?: string }).phone ?? '', company: c.company ?? '',
          hourlyRate: 0, availableForWork: true,
        });
      }).finally(() => setLoading(false));
    } else if (user.role === 'FREELANCER') {
      Promise.all([userService.getFreelancer(user.profileId), userService.skills()])
        .then(([f, s]) => {
          setForm({
            firstName: f.firstName, lastName: f.lastName,
            bio: f.bio ?? '', country: f.country ?? '',
            phone: (f as { phone?: string }).phone ?? '', company: '',
            hourlyRate: Number(f.hourlyRate), availableForWork: f.availableForWork ?? true,
          });
          setAllSkills(s);
          setSelectedSkills(((f.skills ?? []).map((sk) => sk.skill?.id || (sk as { skillId?: string }).skillId).filter(Boolean) as string[]));
        }).finally(() => setLoading(false));
    }
  }, [user]);

  const onSave = async () => {
    setSubmitting(true);
    try {
      if (user?.role === 'CLIENT') {
        await userService.updateMyClient({
          firstName: form.firstName, lastName: form.lastName, bio: form.bio,
          country: form.country, phone: form.phone, company: form.company,
        });
      } else {
        await userService.updateMyFreelancer({
          firstName: form.firstName, lastName: form.lastName, bio: form.bio,
          country: form.country, phone: form.phone, hourlyRate: Number(form.hourlyRate),
          availableForWork: form.availableForWork,
        });
        await userService.updateMySkills(selectedSkills.map((id) => ({ skillId: id, proficiency: 4 })));
      }
      toast.success('Profile saved');
    } catch { toast.error('Failed to save'); }
    finally { setSubmitting(false); }
  };

  if (loading) return <Skeleton className="h-96" />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">Keep your profile up-to-date for better matches.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Personal information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div><Label>First name</Label><Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></div>
            <div><Label>Last name</Label><Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div><Label>Country</Label><Input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} /></div>
            <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          </div>
          {user?.role === 'CLIENT' ? (
            <div><Label>Company</Label><Input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} /></div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              <div><Label>Hourly rate (USD)</Label><Input type="number" min="0" value={form.hourlyRate} onChange={(e) => setForm({ ...form, hourlyRate: Number(e.target.value) })} /></div>
              <div className="flex items-end gap-2">
                <input type="checkbox" id="avail" checked={form.availableForWork} onChange={(e) => setForm({ ...form, availableForWork: e.target.checked })} className="h-4 w-4" />
                <Label htmlFor="avail">Available for work</Label>
              </div>
            </div>
          )}
          <div><Label>Bio</Label><Textarea rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></div>
        </CardContent>
      </Card>

      {user?.role === 'FREELANCER' && (
        <Card>
          <CardHeader><CardTitle>Skills</CardTitle></CardHeader>
          <CardContent>
            <div className="flex max-h-72 flex-wrap gap-2 overflow-y-auto rounded-md border p-3">
              {allSkills.map((s) => {
                const sel = selectedSkills.includes(s.id);
                return (
                  <button
                    key={s.id} type="button"
                    onClick={() => setSelectedSkills(sel ? selectedSkills.filter((id) => id !== s.id) : [...selectedSkills, s.id])}
                    className={`rounded-full border px-3 py-1 text-xs transition ${sel ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                  >
                    {s.name}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{selectedSkills.length} selected</p>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button onClick={onSave} disabled={submitting}>{submitting ? 'Saving...' : 'Save changes'}</Button>
      </div>
    </div>
  );
}
