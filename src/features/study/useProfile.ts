import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('streak_count, total_xp')
        .eq('id', userId!)
        .single()
        .throwOnError();
      return data;
    },
    enabled: !!userId,
  });
}
