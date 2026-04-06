import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/features/auth/useAuthStore';

export function useSendMessage(classroomId: string, otherUserId: string) {
  const queryClient = useQueryClient();
  const session = useAuthStore((s) => s.session);
  const senderId = session?.user?.id;

  return useMutation({
    mutationFn: async (content: string) => {
      const { error } = await supabase
        .from('messages')
        .insert({ classroom_id: classroomId, sender_id: senderId!, content });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', classroomId, otherUserId] });
    },
  });
}
