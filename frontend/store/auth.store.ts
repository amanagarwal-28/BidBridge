'use client';
import { create } from 'zustand';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  hydrate: () => void;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  hydrate: () => {
    if (typeof window === 'undefined') return;
    const t = localStorage.getItem('bidbridge_token');
    const u = localStorage.getItem('bidbridge_user');
    if (t && u) set({ user: JSON.parse(u), token: t, isAuthenticated: true });
  },
  login: (user, token) => {
    localStorage.setItem('bidbridge_token', token);
    localStorage.setItem('bidbridge_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('bidbridge_token');
    localStorage.removeItem('bidbridge_user');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
