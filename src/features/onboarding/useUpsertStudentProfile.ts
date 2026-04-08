import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/features/auth/useAuthStore';
import type { Database } from '@/types/database';

type StudentProfileInsert = Database['public']['Tables']['student_profiles']['Insert'];

export function useUpsertStudentProfile() {
  const queryClient = useQueryClient();
  const session = useAuthStore((s) => s.session);
  const userId = session?.user?.id;

  return useMutation({
    mutationFn: async (fields: Partial<Omit<StudentProfileInsert, 'id'>>) => {
      if (!userId) throw new Error('Not authenticated');
      const { data } = await supabase
        .from('student_profiles')
        .upsert(
          { id: userId, ...fields, updated_at: new Date().toISOString() },
          { onConflict: 'id' }
        )
        .select()
        .single()
        .throwOnError();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student_profile', userId] });
    },
  });
}
