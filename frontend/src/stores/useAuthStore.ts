import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,

      setAuth: (token: string, user: User) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('jb_admin_token', token);
        }
        set({ token, user });
      },

      clearAuth: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('jb_admin_token');
        }
        set({ token: null, user: null });
      },

      isAuthenticated: () => {
        return !!get().token;
      },

      isAdmin: () => {
        const user = get().user;
        return !!user && (user.role === 'admin' || user.role === 'warehouse');
      },
    }),
    {
      name: 'jendela_buku_auth',
    }
  )
);
