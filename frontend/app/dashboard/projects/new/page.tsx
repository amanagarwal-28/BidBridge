'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { projectService, userService } from '@/services';
import { Skill } from '@/types';

const CATEGORIES = ['Web Development', 'Mobile Development', 'Design', 'Writing', 'Marketing', 'DevOps', 'Data Science'];

const schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(255),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category: z.string().min(1, 'Select a category'),
  budgetMin: z.coerce.number().positive('Min budget required'),
  budgetMax: z.coerce.number().positive('Max budget required'),
  deadline: z.string().min(1, 'Deadline required'),
}).refine((d) => d.budgetMax >= d.budgetMin, { path: ['budgetMax'], message: 'Max must be ≥ min' });

type FormValues = z.infer<typeof schema>;

export default function NewProjectPage() {
  const router = useRouter();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [category, setCategory] = useState('');

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => { userService.skills().then(setSkills); }, []);

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const project = await projectService.create({
        ...values,
        budgetMin: Number(values.budgetMin),
        budgetMax: Number(values.budgetMax),
        deadline: new Date(values.deadline).toISOString(),
        skillIds: selectedSkills,
      });
      toast.success('Project posted successfully');
      router.push(`/dashboard/projects/${project.id}`);
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message ?? 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSkill = (id: string) => {
    setSelectedSkills((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Post a new project</h1>
        <p className="text-sm text-muted-foreground">Describe what you need and get bids from top freelancers.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Project details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" placeholder="Build a modern e-commerce website" {...register('title')} />
              {errors.title && <p className="mt-1 text-xs text-destructive">{errors.title.message}</p>}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={6} placeholder="Detailed description of the work, deliverables, expectations..." {...register('description')} />
              {errors.description && <p className="mt-1 text-xs text-destructive">{errors.description.message}</p>}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Category</Label>
                <Select value={category} onValueChange={(v) => { setCategory(v); setValue('category', v); }}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
                {errors.category && <p className="mt-1 text-xs text-destructive">{errors.category.message}</p>}
              </div>

              <div>
                <Label htmlFor="deadline">Deadline</Label>
                <Input id="deadline" type="date" {...register('deadline')} />
                {errors.deadline && <p className="mt-1 text-xs text-destructive">{errors.deadline.message}</p>}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="budgetMin">Min budget (USD)</Label>
                <Input id="budgetMin" type="number" min="1" placeholder="500" {...register('budgetMin')} />
                {errors.budgetMin && <p className="mt-1 text-xs text-destructive">{errors.budgetMin.message}</p>}
              </div>
              <div>
                <Label htmlFor="budgetMax">Max budget (USD)</Label>
                <Input id="budgetMax" type="number" min="1" placeholder="2000" {...register('budgetMax')} />
                {errors.budgetMax && <p className="mt-1 text-xs text-destructive">{errors.budgetMax.message}</p>}
              </div>
            </div>

            <div>
              <Label>Required skills</Label>
              <div className="mt-2 flex max-h-44 flex-wrap gap-2 overflow-y-auto rounded-md border p-3">
                {skills.map((s) => {
                  const sel = selectedSkills.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => toggleSkill(s.id)}
                      className={`rounded-full border px-3 py-1 text-xs transition ${
                        sel ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-accent'
                      }`}
                    >
                      {s.name}
                    </button>
                  );
                })}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{selectedSkills.length} selected</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Post project
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
