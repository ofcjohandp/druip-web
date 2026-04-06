import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useLessons(topicId: string) {
  return useQuery({
    queryKey: ['lessons', topicId],
    queryFn: async () => {
      const { data } = await supabase
        .from('lessons')
        .select('*')
        .eq('topic_id', topicId)
        .eq('is_published', true)
        .order('order', { ascending: true })
        .throwOnError();
      return data ?? [];
    },
    enabled: !!topicId,
    staleTime: 5 * 60 * 1000,
  });
}
