import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

type SectionRow = Database['public']['Tables']['classroom_sections']['Row'];

export function useClassroomSections(classroomId: string | undefined) {
  return useQuery<SectionRow[]>({
    queryKey: ['classroom-sections', classroomId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classroom_sections')
        .select('*')
        .eq('classroom_id', classroomId!)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!classroomId,
  });
}

export function useCreateSection(classroomId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ name, sort_order }: { name: string; sort_order: number }) => {
      const { data, error } = await supabase
        .from('classroom_sections')
        .insert({ classroom_id: classroomId, name, sort_order })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classroom-sections', classroomId] });
    },
  });
}

export function useRenameSection(classroomId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ sectionId, name }: { sectionId: string; name: string }) => {
      const { error } = await supabase
        .from('classroom_sections')
        .update({ name })
        .eq('id', sectionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classroom-sections', classroomId] });
    },
  });
}

export function useDeleteSection(classroomId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sectionId: string) => {
      const { error } = await supabase
        .from('classroom_sections')
        .delete()
        .eq('id', sectionId);
      if (error) throw error;
    },
    onMutate: async (sectionId: string) => {
      await queryClient.cancelQueries({ queryKey: ['classroom-sections', classroomId] });
      const previous = queryClient.getQueryData<SectionRow[]>(['classroom-sections', classroomId]);
      queryClient.setQueryData<SectionRow[]>(
        ['classroom-sections', classroomId],
        (old) => (old ?? []).filter((s) => s.id !== sectionId)
      );
      return { previous };
    },
    onError: (_err, _sectionId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['classroom-sections', classroomId], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['classroom-sections', classroomId] });
    },
  });
}

export function useReorderSections(classroomId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      sectionAId,
      sectionBId,
      sortOrderA,
      sortOrderB,
    }: {
      sectionAId: string;
      sectionBId: string;
      sortOrderA: number;
      sortOrderB: number;
    }) => {
      const { error: errorA } = await supabase
        .from('classroom_sections')
        .update({ sort_order: sortOrderB })
        .eq('id', sectionAId);
      if (errorA) throw errorA;
      const { error: errorB } = await supabase
        .from('classroom_sections')
        .update({ sort_order: sortOrderA })
        .eq('id', sectionBId);
      if (errorB) throw errorB;
    },
    onMutate: async ({
      sectionAId,
      sectionBId,
    }: {
      sectionAId: string;
      sectionBId: string;
      sortOrderA: number;
      sortOrderB: number;
    }) => {
      await queryClient.cancelQueries({ queryKey: ['classroom-sections', classroomId] });
      const previous = queryClient.getQueryData<SectionRow[]>(['classroom-sections', classroomId]);
      queryClient.setQueryData<SectionRow[]>(
        ['classroom-sections', classroomId],
        (old) => {
          if (!old) return old;
          const sections = [...old];
          const idxA = sections.findIndex((s) => s.id === sectionAId);
          const idxB = sections.findIndex((s) => s.id === sectionBId);
          if (idxA === -1 || idxB === -1) return old;
          const tempOrder = sections[idxA].sort_order;
          sections[idxA] = { ...sections[idxA], sort_order: sections[idxB].sort_order };
          sections[idxB] = { ...sections[idxB], sort_order: tempOrder };
          return sections.sort((a, b) => a.sort_order - b.sort_order);
        }
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['classroom-sections', classroomId], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['classroom-sections', classroomId] });
    },
  });
}
