import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

type ClassroomRow = Database['public']['Tables']['classrooms']['Row'];
type SectionRow = Database['public']['Tables']['classroom_sections']['Row'];

export type ClassroomDetail = ClassroomRow & {
  classroom_sections: SectionRow[];
};

export function useClassroomDetail(classroomId: string | undefined) {
  return useQuery({
    queryKey: ['classroom-detail', classroomId],
    queryFn: async (): Promise<ClassroomDetail> => {
      const { data, error } = await supabase
        .from('classrooms')
        .select('*, classroom_sections(*)')
        .eq('id', classroomId!)
        .order('sort_order', { referencedTable: 'classroom_sections', ascending: true })
        .single();
      if (error) throw error;
      return data as ClassroomDetail;
    },
    enabled: !!classroomId,
  });
}
