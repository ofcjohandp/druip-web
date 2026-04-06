import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/features/auth/useAuthStore';

export function useSubscribe() {
  const queryClient = useQueryClient();
  const session = useAuthStore((s) => s.session);
  const userId = session?.user?.id;

  return useMutation({
    mutationFn: async ({ classroomId }: { classroomId: string }) => {
      const { data, error } = await supabase
        .from('subscriptions')
        .insert({ student_id: userId!, classroom_id: classroomId, status: 'active' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, { classroomId }) => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions', userId] });
      queryClient.invalidateQueries({ queryKey: ['classroom-detail', classroomId] });
    },
  });
}
