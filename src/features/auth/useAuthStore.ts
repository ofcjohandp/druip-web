import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthState {
  session: Session | null;
  isLoading: boolean;
  isOnline: boolean;
  pendingTutorOnboarding: boolean;
  pendingStudentOnboarding: boolean;
  pendingUserId: string | null;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  setOnline: (online: boolean) => void;
  setPendingTutorOnboarding: (pending: boolean) => void;
  setPendingStudentOnboarding: (pending: boolean) => void;
  setPendingUserId: (userId: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isLoading: true,
  isOnline: true,
  pendingTutorOnboarding: false,
  pendingStudentOnboarding: false,
  pendingUserId: null,
  setSession: (session) => set({ session }),
  setLoading: (isLoading) => set({ isLoading }),
  setOnline: (isOnline) => set({ isOnline }),
  setPendingTutorOnboarding: (pendingTutorOnboarding) => set({ pendingTutorOnboarding }),
  setPendingStudentOnboarding: (pendingStudentOnboarding) => set({ pendingStudentOnboarding }),
  setPendingUserId: (pendingUserId) => set({ pendingUserId }),
}));

async function checkStudentOnboarding(userId: string): Promise<void> {
  // Check if user is a tutor — tutors bypass student onboarding
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_tutor')
    .eq('id', userId)
    .single();

  if (profile?.is_tutor) return;

  // Check student onboarding completion
  const { data: studentProfile } = await supabase
    .from('student_profiles')
    .select('onboarding_complete')
    .eq('id', userId)
    .maybeSingle();

  // null (no row) or onboarding_complete = false means onboarding pending
  if (!studentProfile || !studentProfile.onboarding_complete) {
    useAuthStore.getState().setPendingStudentOnboarding(true);
  }
}

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
          // ONBD-08: Check student onboarding status BEFORE releasing isLoading.
          // This prevents root guard flashing home screen before the check resolves.
          if (session?.user?.id) {
            return checkStudentOnboarding(session.user.id);
          }
        });
      }
    })
    .catch(() => {
      useAuthStore.getState().setSession(null);
    })
    .finally(() => {
      // isLoading stays true until here — onboarding check is complete by this point.
      useAuthStore.getState().setLoading(false);
    });

  supabase.auth.onAuthStateChange((_event, session) => {
    useAuthStore.getState().setSession(session);
    if (session?.user?.id) {
      // Run the same onboarding check for SIGNED_IN events (returning user cold-start path).
      // Keep isLoading true until check resolves to avoid race condition in root guard.
      checkStudentOnboarding(session.user.id).finally(() => {
        useAuthStore.getState().setLoading(false);
      });
    } else {
      useAuthStore.getState().setLoading(false);
    }
  });
}
