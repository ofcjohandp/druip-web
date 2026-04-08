import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/features/auth/useAuthStore';

export function useUpdateClassroom() {
  const queryClient = useQueryClient();
  const session = useAuthStore((s) => s.session);
  const userId = session?.user?.id;

  return useMutation({
    mutationFn: async (data: {
      classroomId: string;
      name: string;
      subjects: string[];
      bio: string;
      price_cents: number;
    }) => {
      const { error } = await supabase
        .from('classrooms')
        .update({
          name: data.name,
          subjects: data.subjects,
          bio: data.bio,
          price_cents: data.price_cents,
        })
        .eq('id', data.classroomId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classroom', userId] });
    },
  });
}
