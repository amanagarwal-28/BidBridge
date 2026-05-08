import Link from 'next/link';
import { ArrowRight, Briefcase, ShieldCheck, Sparkles, TrendingUp, Users, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const stats = [
  { label: 'Active Freelancers', value: '12,500+' },
  { label: 'Projects Completed', value: '47,800+' },
  { label: 'Total Paid Out', value: '$28M+' },
  { label: 'Client Retention', value: '94%' },
];

const features = [
  { icon: Briefcase, title: 'Post a Project in Minutes', desc: 'Describe what you need, set a budget, and get matched with vetted freelancers instantly.' },
  { icon: Sparkles, title: 'Smart Recommendations', desc: 'Our matching engine ranks freelancers by skill overlap, ratings, and proven delivery.' },
  { icon: ShieldCheck, title: 'Milestone Payments', desc: 'Funds release as work is approved. Both sides protected with full audit trails.' },
  { icon: TrendingUp, title: 'Real-time Analytics', desc: 'Track spending, deadlines, bids, and contract progress from a single dashboard.' },
];

const steps = [
  { n: '01', title: 'Post your project', desc: 'Define scope, deadline, and budget.' },
  { n: '02', title: 'Compare bids', desc: 'Review freelancer profiles, ratings, and proposals.' },
  { n: '03', title: 'Hire & collaborate', desc: 'Award the bid; a contract is auto-generated.' },
  { n: '04', title: 'Pay on milestones', desc: 'Release payments as work is approved.' },
];

const testimonials = [
  { name: 'Sarah J.', role: 'Founder, TechCorp', text: 'BidBridge cut our hiring time in half. The recommendation engine is uncanny.' },
  { name: 'Alex G.', role: 'Senior Developer', text: 'The contract and milestone system actually works. I get paid on time, every time.' },
  { name: 'Lina M.', role: 'Product Designer', text: 'Clean dashboard, fast bidding, fair platform. My go-to for client work.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* NAV */}
      <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">B</div>
            <span className="text-lg font-semibold tracking-tight">BidBridge</span>
          </Link>
          <nav className="hidden items-center gap-7 md:flex">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground">Features</a>
            <a href="#how" className="text-sm text-muted-foreground hover:text-foreground">How it works</a>
            <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground">Reviews</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost"><Link href="/login">Login</Link></Button>
            <Button asChild><Link href="/signup">Get started</Link></Button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="container py-20 md:py-28">
        <div className="mx-auto max-w-3xl text-center animate-fade-in">
          <div className="mb-5 inline-flex items-center rounded-full border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
            <Sparkles className="mr-1.5 h-3 w-3" /> Smart matching, fair contracts, milestone payments
          </div>
          <h1 className="text-balance text-4xl font-bold tracking-tight md:text-6xl">
            The bridge between great <span className="text-primary">clients</span> and great <span className="text-primary">freelancers</span>.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Post a project, compare bids, sign contracts, and release milestone payments — all from one beautifully simple workspace.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" asChild className="gap-2"><Link href="/signup?role=CLIENT">Hire a freelancer <ArrowRight className="h-4 w-4" /></Link></Button>
            <Button size="lg" variant="outline" asChild><Link href="/signup?role=FREELANCER">Start freelancing</Link></Button>
          </div>
        </div>

        {/* STATS */}
        <div className="mx-auto mt-16 grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((s) => (
            <Card key={s.label} className="animate-fade-in">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold tracking-tight">{s.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{s.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="border-t bg-secondary/40 py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">How it works</h2>
            <p className="mt-3 text-muted-foreground">Four simple steps from project to payment.</p>
          </div>
          <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-4">
            {steps.map((s) => (
              <div key={s.n} className="rounded-xl border bg-white p-6">
                <div className="text-sm font-semibold text-primary">{s.n}</div>
                <div className="mt-3 text-lg font-semibold">{s.title}</div>
                <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="container py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Everything you need to get work done</h2>
          <p className="mt-3 text-muted-foreground">Smart bidding, secure contracts, and milestone payments — built in.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <Card key={f.title}>
              <CardContent className="p-6">
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <div className="text-base font-semibold">{f.title}</div>
                <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="border-t bg-secondary/40 py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Trusted by people who ship</h2>
            <p className="mt-3 text-muted-foreground">From solo founders to creative studios.</p>
          </div>
          <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <Card key={t.name}>
                <CardContent className="p-6">
                  <div className="flex gap-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed">"{t.text}"</p>
                  <div className="mt-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                      {t.name[0]}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t py-20">
        <div className="container">
          <Card className="mx-auto max-w-4xl bg-primary text-primary-foreground">
            <CardContent className="flex flex-col items-center gap-6 p-12 text-center md:flex-row md:justify-between md:text-left">
              <div>
                <Users className="mb-3 h-8 w-8" />
                <h3 className="text-2xl font-bold tracking-tight md:text-3xl">Ready to bridge your next project?</h3>
                <p className="mt-2 text-white/90">Join thousands of clients and freelancers building together.</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button size="lg" variant="secondary" asChild><Link href="/signup">Create an account</Link></Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary" asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t py-10">
        <div className="container flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground md:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-xs text-primary-foreground font-bold">B</div>
            BidBridge © {new Date().getFullYear()}
          </div>
          <div className="flex gap-5">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
