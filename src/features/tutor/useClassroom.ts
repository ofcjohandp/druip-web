import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/features/auth/useAuthStore';
import type { Database } from '@/types/database';

type ClassroomRow = Database['public']['Tables']['classrooms']['Row'];

export function useClassroom() {
  const session = useAuthStore((s) => s.session);
  const userId = session?.user?.id;

  return useQuery({
    queryKey: ['classroom', userId],
    queryFn: async (): Promise<ClassroomRow> => {
      const { data, error } = await supabase
        .from('classrooms')
        .select('*, tutors!inner(user_id)')
        .eq('tutors.user_id', userId!)
        .single();
      if (error) throw error;
      return data as ClassroomRow;
    },
    enabled: !!userId,
  });
}
