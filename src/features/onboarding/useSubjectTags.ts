import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useSubjectTags() {
  return useQuery({
    queryKey: ['subject_tags'],
    queryFn: async () => {
      const { data } = await supabase
        .from('subject_tags')
        .select('id, name, slug')
        .order('name')
        .throwOnError();
      return data ?? [];
    },
  });
}
