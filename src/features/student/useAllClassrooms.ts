import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/features/auth/useAuthStore';
import type { Database } from '@/types/database';

type ClassroomRow = Database['public']['Tables']['classrooms']['Row'];

export type ClassroomWithTutor = ClassroomRow & {
  tutors: { user_id: string; profiles: { email: string } };
};

export function useAllClassrooms() {
  const session = useAuthStore((s) => s.session);
  const userId = session?.user?.id;

  return useQuery({
    queryKey: ['classrooms'],
    queryFn: async (): Promise<ClassroomWithTutor[]> => {
      const { data, error } = await supabase
        .from('classrooms')
        .select('*, tutors!inner(user_id, profiles!inner(email))')
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as ClassroomWithTutor[];
    },
    enabled: !!userId,
  });
}
