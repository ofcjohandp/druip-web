import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthState {
  session: Session | null;
  isLoading: boolean;
  isOnline: boolean;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setOnline: (online: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isLoading: true,
  isOnline: true,
  setSession: (session) => set({ session }),
  setLoading: (isLoading) => set({ isLoading }),
  setOnline: (isOnline) => set({ isOnline }),
}));

export function initializeAuthListener() {
  // AUTH-04/RESEARCH.md: Use getUser() not getSession() to avoid AuthSessionMissingError on multi-device logout.
  // getUser() validates the token server-side; getSession() reads from storage and can return stale data.
  supabase.auth
    .getUser()
    .then(({ data: { user }, error }) => {
      if (error || !user) {
        // AUTH-05 / D-19: On offline launch or invalid token, user is null.
        // Set session to null — Stack.Protected will route to login screen.
        useAuthStore.getState().setSession(null);
      } else {
        // Valid user — fetch the full session for the JWT token needed by RLS.
        return supabase.auth.getSession().then(({ data: { session } }) => {
          useAuthStore.getState().setSession(session);
        });
      }
    })
    .catch(() => {
      useAuthStore.getState().setSession(null);
    })
    .finally(() => {
      useAuthStore.getState().setLoading(false);
    });

  supabase.auth.onAuthStateChange((_event, session) => {
    useAuthStore.getState().setSession(session);
    useAuthStore.getState().setLoading(false);
  });
}
