import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/features/auth/useAuthStore';

export function useMessages(classroomId: string | undefined, otherUserId: string | undefined) {
  const session = useAuthStore((s) => s.session);
  const currentUserId = session?.user?.id;

  return useQuery({
    queryKey: ['messages', classroomId, otherUserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('classroom_id', classroomId!)
        .in('sender_id', [currentUserId!, otherUserId!])
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!classroomId && !!otherUserId && !!currentUserId,
  });
}
