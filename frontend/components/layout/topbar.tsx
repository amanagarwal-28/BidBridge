'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Bell, LogOut, ChevronDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/store/auth.store';
import { notificationService } from '@/services';
import { Notification } from '@/types';
import { getInitials, timeAgo } from '@/lib/utils';

export function Topbar() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const unread = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    if (!user) return;
    notificationService.list().then(setNotifications).catch(() => {});
  }, [user]);

  const onLogout = () => { logout(); router.push('/login'); };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-white px-6">
      <div />
      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unread > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-primary" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80">
            <div className="flex items-center justify-between px-3 py-2 text-sm font-semibold">
              <span>Notifications</span>
              {unread > 0 && <Badge variant="default">{unread} new</Badge>}
            </div>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-3 py-6 text-center text-sm text-muted-foreground">No notifications yet</div>
              ) : (
                notifications.slice(0, 10).map((n) => (
                  <div key={n.id} className="border-b px-3 py-3 text-xs hover:bg-accent">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-medium">{n.title}</div>
                      <span className="shrink-0 text-[10px] text-muted-foreground">{timeAgo(n.createdAt)}</span>
                    </div>
                    <p className="mt-1 text-muted-foreground line-clamp-2">{n.message}</p>
                  </div>
                ))
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{user ? getInitials(user.email) : '?'}</AvatarFallback>
              </Avatar>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <div className="px-3 py-2">
              <div className="text-sm font-medium">{user?.email}</div>
              <div className="text-xs text-muted-foreground">{user?.role}</div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link href="/dashboard/profile">Profile</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
