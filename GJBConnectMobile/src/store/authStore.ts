import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  avatar_url?: string;
  business_name?: string;
  business_type?: string;
  market_area?: string;
  location?: string;
  bio?: string;
  user_status?: 'verified' | 'member';
  role?: string;
  created_at?: string;
  updated_at?: string;
  phone?: string;
  address?: string;
  contact_info?: string;
  profile_header_url?: string;
  header_image_url?: string;
  last_seen?: string;
  connections_count?: number;
}

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  setSession: (session: Session | null) => Promise<void>;
  setUser: (user: User | null) => void;
  signOut: () => Promise<void>;
  initialize: () => Promise<void>;
  fetchProfile: (userId: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      user: null,
      profile: null,
      isLoading: true,
      setSession: async (session) => {
        set({ session, user: session?.user ?? null });
        if (session?.user) {
          await get().fetchProfile(session.user.id);
        } else {
          set({ profile: null });
        }
      },
      setUser: (user) => set({ user }),
      signOut: async () => {
        await supabase.auth.signOut();
        set({ session: null, user: null, profile: null });
      },
      initialize: async () => {
        const { data } = await supabase.auth.getSession();
        const session = data.session;
        set({ session, user: session?.user ?? null, isLoading: false });
        if (session?.user) {
          await get().fetchProfile(session.user.id);
        }

        // Listen for auth changes
        supabase.auth.onAuthStateChange(async (_event, session) => {
          set({ session, user: session?.user ?? null });
          if (session?.user) {
            await get().fetchProfile(session.user.id);
          } else {
            set({ profile: null });
          }
        });
      },
      fetchProfile: async (userId: string) => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
          if (error) {
            console.error('Error fetching profile:', error);
            return;
          }
          set({ profile: data as Profile });
        } catch (error) {
          console.error('Error in fetchProfile:', error);
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Optionally omit profile from persistence if you want fresh on each load
      partialize: (state) => ({
        session: state.session,
        user: state.user,
        // profile is not persisted, will be re-fetched
      }),
    }
  )
);