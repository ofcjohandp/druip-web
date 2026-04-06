import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useLessonQuestions(lessonId: string) {
  return useQuery({
    queryKey: ['lesson-questions', lessonId],
    queryFn: async () => {
      const { data } = await supabase
        .from('questions')
        .select('*, sections!inner(lesson_id)')
        .eq('sections.lesson_id', lessonId)
        .eq('is_published', true)
        .order('order', { ascending: true })
        .limit(20) // Safety cap: max 20 questions per lesson (RESEARCH.md Open Question 1)
        .throwOnError();
      return data ?? [];
    },
    enabled: !!lessonId,
    staleTime: 5 * 60 * 1000,
  });
}
