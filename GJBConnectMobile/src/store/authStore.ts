import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  setSession: (session: Session | null) => void;
  setUser: (user: User | null) => void;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      user: null,
      isLoading: true,
      setSession: (session) => set({ session, user: session?.user ?? null }),
      setUser: (user) => set({ user }),
      signOut: async () => {
        await supabase.auth.signOut();
        set({ session: null, user: null });
      },
      initialize: async () => {
        const { data } = await supabase.auth.getSession();
        set({ session: data.session, user: data.session?.user ?? null, isLoading: false });

        // Listen for auth changes
        supabase.auth.onAuthStateChange((_event, session) => {
          set({ session, user: session?.user ?? null });
        });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
