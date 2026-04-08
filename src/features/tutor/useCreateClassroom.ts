import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/features/auth/useAuthStore';

interface CreateClassroomInput {
  name: string;
  subjects: string[];
  bio: string;
  price_cents: number;
}

export function useCreateClassroom() {
  return useMutation({
    mutationFn: async (data: CreateClassroomInput) => {
      const userId =
        useAuthStore.getState().session?.user?.id ||
        useAuthStore.getState().pendingUserId ||
        (await supabase.auth.getUser()).data.user?.id;
      if (!userId) throw new Error('Not authenticated');

      // Step 1: mark profile as tutor
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ is_tutor: true })
        .eq('id', userId);
      if (profileError) throw profileError;

      // Step 2: get or create tutor record
      let tutorId: string;
      const { data: existingTutor } = await supabase
        .from('tutors')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingTutor) {
        tutorId = existingTutor.id;
      } else {
        const { data: newTutor, error: tutorError } = await supabase
          .from('tutors')
          .insert({ user_id: userId })
          .select('id')
          .single();
        if (tutorError) throw tutorError;
        tutorId = newTutor.id;
      }

      // Step 3: insert classroom (or update if one already exists for this tutor)
      const { data: existingClassroom } = await supabase
        .from('classrooms')
        .select('id')
        .eq('tutor_id', tutorId)
        .maybeSingle();

      let classroom;
      if (existingClassroom) {
        const { data: updated, error } = await supabase
          .from('classrooms')
          .update({ name: data.name, subjects: data.subjects, bio: data.bio, price_cents: data.price_cents })
          .eq('id', existingClassroom.id)
          .select('id')
          .single();
        if (error) throw error;
        classroom = updated;
      } else {
        const { data: inserted, error: classroomError } = await supabase
          .from('classrooms')
          .insert({
            tutor_id: tutorId,
            name: data.name,
            subjects: data.subjects,
            bio: data.bio,
            price_cents: data.price_cents,
            is_published: true,
          })
          .select('id')
          .single();
        if (classroomError) throw classroomError;
        classroom = inserted;
      }

      return classroom;
    },
  });
}
