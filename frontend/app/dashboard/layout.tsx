'use client';
import { ProtectedRoute } from '@/components/shared/protected-route';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { useAuth } from '@/store/auth.store';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = useAuth((s) => s.user);
  return (
    <ProtectedRoute allowedRoles={['CLIENT', 'FREELANCER']}>
      <div className="flex min-h-screen bg-secondary/30">
        {user && <Sidebar role={user.role} />}
        <div className="flex flex-1 flex-col">
          <Topbar />
          <main className="flex-1 p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
