import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useClassroomSubscribers(classroomId: string | undefined) {
  return useQuery({
    queryKey: ['subscribers', classroomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*, profiles!student_id(id, email)')
        .eq('classroom_id', classroomId!)
        .eq('status', 'active');
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!classroomId,
  });
}
