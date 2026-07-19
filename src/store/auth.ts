import { create } from 'zustand';
import type { User } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
  积分余额: number;
  set积分余额: (balance: number) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  积分余额: 0,
  set积分余额: (balance) => set({ 积分余额: balance }),
}));
