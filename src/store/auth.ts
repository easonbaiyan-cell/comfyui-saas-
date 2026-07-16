import { create } from 'zustand';

interface AuthState {
  user: any | null;
  setUser: (user: any | null) => void;
  积分余额: number;
  set积分余额: (balance: number) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  积分余额: 0,
  set积分余额: (balance) => set({ 积分余额: balance }),
}));
