'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, Briefcase, User } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useAuth } from '@/store/auth.store';
import * as authService from '@/services/auth.service';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
});

type FormValues = z.infer<typeof schema>;

function SignupContent() {
  const router = useRouter();
  const sp = useSearchParams();
  const initialRole = sp.get('role') === 'FREELANCER' ? 'FREELANCER' : 'CLIENT';
  const [role, setRole] = useState<'CLIENT' | 'FREELANCER'>(initialRole);
  const [loading, setLoading] = useState(false);
  const login = useAuth((s) => s.login);
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const { user, token } = await authService.signup({ ...values, role });
      login(user, token);
      toast.success('Account created! Welcome to BidBridge.');
      router.push('/dashboard');
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } } };
      toast.error(e.response?.data?.message ?? 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/40 p-4">
      <div className="w-full max-w-md animate-fade-in">
        <Link href="/" className="mb-6 flex items-center justify-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">B</div>
          <span className="text-lg font-semibold">BidBridge</span>
        </Link>
        <Card>
          <CardHeader>
            <CardTitle>Create your account</CardTitle>
            <CardDescription>Start hiring or freelancing in under a minute.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Role selection */}
            <div className="mb-5 grid grid-cols-2 gap-3">
              {[
                { val: 'CLIENT' as const, label: 'I want to hire', icon: Briefcase },
                { val: 'FREELANCER' as const, label: 'I want to work', icon: User },
              ].map((r) => (
                <button
                  key={r.val}
                  type="button"
                  onClick={() => setRole(r.val)}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-lg border p-4 text-sm font-medium transition',
                    role === r.val ? 'border-primary bg-primary/5 text-primary ring-2 ring-primary/20' : 'border-input hover:bg-accent'
                  )}
                >
                  <r.icon className="h-5 w-5" />
                  {r.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="firstName">First name</Label>
                  <Input id="firstName" placeholder="Jane" {...register('firstName')} />
                  {errors.firstName && <p className="mt-1 text-xs text-destructive">{errors.firstName.message}</p>}
                </div>
                <div>
                  <Label htmlFor="lastName">Last name</Label>
                  <Input id="lastName" placeholder="Doe" {...register('lastName')} />
                  {errors.lastName && <p className="mt-1 text-xs text-destructive">{errors.lastName.message}</p>}
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
                {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="At least 8 characters" {...register('password')} />
                {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create account
              </Button>
            </form>
            <p className="mt-5 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-primary hover:underline">Sign in</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupContent />
    </Suspense>
  );
}
