import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/features/auth/useAuthStore';

export function useStudentSubjectTags() {
  const session = useAuthStore((s) => s.session);
  const userId = session?.user?.id;

  return useQuery({
    queryKey: ['student_subject_tags', userId],
    queryFn: async () => {
      const { data } = await supabase
        .from('student_subject_tags')
        .select('tag_id')
        .eq('student_id', userId!)
        .throwOnError();
      return (data ?? []).map((row) => row.tag_id);
    },
    enabled: !!userId,
  });
}

export function useSaveStudentSubjectTags() {
  const queryClient = useQueryClient();
  const session = useAuthStore((s) => s.session);
  const userId = session?.user?.id;

  return useMutation({
    mutationFn: async (tagIds: string[]) => {
      if (!userId) throw new Error('Not authenticated');
      // Delete all existing tags, then insert new selections
      await supabase
        .from('student_subject_tags')
        .delete()
        .eq('student_id', userId)
        .throwOnError();

      if (tagIds.length > 0) {
        await supabase
          .from('student_subject_tags')
          .insert(tagIds.map((tag_id) => ({ student_id: userId, tag_id })))
          .throwOnError();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student_subject_tags', userId] });
    },
  });
}
