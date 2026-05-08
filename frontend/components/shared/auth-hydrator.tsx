'use client';
import { useEffect } from 'react';
import { useAuth } from '@/store/auth.store';

export function AuthHydrator() {
  const hydrate = useAuth((s) => s.hydrate);
  useEffect(() => { hydrate(); }, [hydrate]);
  return null;
}
