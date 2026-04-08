import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/features/auth/useAuthStore';

export function useStudentProfile() {
  const session = useAuthStore((s) => s.session);
  const userId = session?.user?.id;

  return useQuery({
    queryKey: ['student_profile', userId],
    queryFn: async () => {
      const { data } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('id', userId!)
        .maybeSingle()
        .throwOnError();
      return data; // null if no row exists (new user)
    },
    enabled: !!userId,
  });
}
