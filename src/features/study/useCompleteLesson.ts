import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useCompleteLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      lessonId,
      userId,
      score,
      total,
    }: {
      lessonId: string;
      userId: string;
      score: number;
      total: number;
    }) => {
      // Record the attempt in lesson_attempts (D-12)
      await supabase
        .from('lesson_attempts')
        .insert({
          user_id: userId,
          lesson_id: lessonId,
          score,
          total_questions: total,
          status: 'completed',
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
        })
        .throwOnError();

      // Upsert user_lesson_progress so the lesson shows as completed in lists
      await supabase
        .from('user_lesson_progress')
        .upsert(
          {
            user_id: userId,
            lesson_id: lessonId,
            completed: true,
            score,
            completed_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,lesson_id' }
        )
        .throwOnError();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-lesson-progress'] });
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
    },
  });
}
