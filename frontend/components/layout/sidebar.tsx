'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Briefcase, FolderKanban, Gavel, FileText,
  CreditCard, Star, User, Settings, Search, Bell,
} from 'lucide-react';
import { Role } from '@/types';

const CLIENT_NAV = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/projects', label: 'My Projects', icon: FolderKanban },
  { href: '/dashboard/projects/new', label: 'Post Project', icon: Briefcase },
  { href: '/dashboard/contracts', label: 'Contracts', icon: FileText },
  { href: '/dashboard/payments', label: 'Payments', icon: CreditCard },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
];

const FREELANCER_NAV = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/browse', label: 'Browse Projects', icon: Search },
  { href: '/dashboard/bids', label: 'My Bids', icon: Gavel },
  { href: '/dashboard/contracts', label: 'Active Work', icon: FileText },
  { href: '/dashboard/earnings', label: 'Earnings', icon: CreditCard },
  { href: '/dashboard/reviews', label: 'Reviews', icon: Star },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
];

const ADMIN_NAV = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: User },
  { href: '/admin/projects', label: 'Projects', icon: FolderKanban },
  { href: '/admin/fraud', label: 'Fraud Reports', icon: Bell },
  { href: '/admin/analytics', label: 'Analytics', icon: Settings },
];

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const items = role === 'CLIENT' ? CLIENT_NAV : role === 'FREELANCER' ? FREELANCER_NAV : ADMIN_NAV;

  return (
    <aside className="hidden w-60 shrink-0 border-r bg-white md:block">
      <div className="sticky top-0 flex h-screen flex-col">
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">B</div>
            <span className="text-base font-semibold">BidBridge</span>
          </Link>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {items.map((item) => {
            const active = pathname === item.href || (item.href !== '/dashboard' && item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-4 text-xs text-muted-foreground">
          <div className="font-semibold uppercase tracking-wide text-[10px]">{role}</div>
          <div className="mt-1">v1.0 — DBMS Demo</div>
        </div>
      </div>
    </aside>
  );
}
