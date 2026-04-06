import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useTopics(moduleId: string) {
  return useQuery({
    queryKey: ['topics', moduleId],
    queryFn: async () => {
      const { data } = await supabase
        .from('topics')
        .select('*')
        .eq('module_id', moduleId)
        .eq('is_published', true)
        .order('order', { ascending: true })
        .throwOnError();
      return data ?? [];
    },
    enabled: !!moduleId,
    staleTime: 5 * 60 * 1000,
  });
}
