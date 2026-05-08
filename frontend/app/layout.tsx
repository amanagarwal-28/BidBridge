import './globals.css';
import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import { AuthHydrator } from '@/components/shared/auth-hydrator';

export const metadata: Metadata = {
  title: 'BidBridge — Smart Freelancer Marketplace',
  description: 'Hire top freelancers, track contracts, manage payments — all in one platform.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground">
        <AuthHydrator />
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
