import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

/**
 * Fetch all lessons for a module and return a map of topicId -> total lesson count.
 * Avoids N+1 queries by loading all lessons in one request.
 */
export function useModuleLessonCounts(moduleId: string) {
  return useQuery({
    queryKey: ['module-lesson-counts', moduleId],
    queryFn: async () => {
      const { data } = await supabase
        .from('lessons')
        .select('id, topic_id')
        .eq('is_published', true)
        .throwOnError();
      const lessons = data ?? [];
      const counts: Record<string, string[]> = {};
      for (const lesson of lessons) {
        if (!counts[lesson.topic_id]) counts[lesson.topic_id] = [];
        counts[lesson.topic_id].push(lesson.id);
      }
      return counts;
    },
    enabled: !!moduleId,
    staleTime: 5 * 60 * 1000,
  });
}
