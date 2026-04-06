import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useTutorUserId(tutorId: string | undefined) {
  return useQuery({
    queryKey: ['tutor-user-id', tutorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tutors')
        .select('user_id')
        .eq('id', tutorId!)
        .single();
      if (error) throw error;
      return data.user_id;
    },
    enabled: !!tutorId,
  });
}
