import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/features/auth/useAuthStore';
import type { Database } from '@/types/database';

type ClassroomRow = Database['public']['Tables']['classrooms']['Row'];

export type ClassroomWithTutor = ClassroomRow & {
  tutors: { user_id: string; profiles: { email: string } };
};

export function useAllClassrooms(tagIds?: string[]) {
  const session = useAuthStore((s) => s.session);
  const userId = session?.user?.id;
  const hasTagFilter = tagIds && tagIds.length > 0;

  return useQuery({
    queryKey: ['classrooms', tagIds ?? []],
    queryFn: async (): Promise<ClassroomWithTutor[]> => {
      let query = supabase
        .from('classrooms')
        .select('*, tutors!inner(user_id, profiles!inner(email))')
        .eq('is_published', true);

      if (hasTagFilter) {
        // Two-step query: fetch matching classroom IDs via classroom_subject_tags junction,
        // then filter classrooms by those IDs. Avoids ambiguous nested !inner joins.
        const { data: taggedClassrooms } = await supabase
          .from('classroom_subject_tags')
          .select('classroom_id')
          .in('tag_id', tagIds)
          .throwOnError();

        const classroomIds = [...new Set((taggedClassrooms ?? []).map((r) => r.classroom_id))];
        if (classroomIds.length === 0) return [];
        query = query.in('id', classroomIds);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as ClassroomWithTutor[];
    },
    enabled: !!userId,
  });
}
