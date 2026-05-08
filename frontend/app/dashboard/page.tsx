'use client';
import { useAuth } from '@/store/auth.store';
import { ClientDashboardHome } from './_views/client-home';
import { FreelancerDashboardHome } from './_views/freelancer-home';

export default function DashboardHomePage() {
  const user = useAuth((s) => s.user);
  if (!user) return null;
  return user.role === 'CLIENT' ? <ClientDashboardHome /> : <FreelancerDashboardHome />;
}
