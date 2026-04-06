import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useUserLessonProgress(userId: string | undefined, lessonIds: string[]) {
  return useQuery({
    queryKey: ['user-lesson-progress', userId, lessonIds],
    queryFn: async () => {
      const { data } = await supabase
        .from('user_lesson_progress')
        .select('*')
        .eq('user_id', userId!)
        .in('lesson_id', lessonIds)
        .throwOnError();
      return data ?? [];
    },
    enabled: !!userId && lessonIds.length > 0,
    staleTime: 60 * 1000,
  });
}
