import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';
import { uploadClassroomFile, getSignedUrl } from './uploadClassroomFile';

type CardRow = Database['public']['Tables']['classroom_cards']['Row'];
// RICH-01, RICH-03: plain literal union (replaces conditional mapped type)
// Update this when supabase gen types is re-run post-migration
type CardType = 'text' | 'pdf' | 'image' | 'link' | 'flashcard';

type CardRowWithSignedUrl = CardRow & { signedUrl?: string };

/**
 * Query hook: fetches all cards for a section ordered by sort_order.
 * For pdf/image cards with a storage_path, attaches a signed URL (1hr expiry).
 */
export function useClassroomCards(sectionId: string | undefined) {
  return useQuery<CardRowWithSignedUrl[]>({
    queryKey: ['classroom-cards', sectionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classroom_cards')
        .select('*')
        .eq('section_id', sectionId!)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      // Attach signed URLs for file-backed cards
      const cards: CardRowWithSignedUrl[] = await Promise.all(
        (data ?? []).map(async (card) => {
          if (
            (card.card_type === 'pdf' || card.card_type === 'image') &&
            card.storage_path
          ) {
            try {
              const signedUrl = await getSignedUrl(card.storage_path);
              return { ...card, signedUrl };
            } catch {
              // Signed URL failure should not block card rendering
              return card;
            }
          }
          return card;
        })
      );

      return cards;
    },
    enabled: !!sectionId,
  });
}

function computeNextSortOrder(cards: CardRow[]): number {
  if (cards.length === 0) return 1000;
  return Math.max(...cards.map((c) => c.sort_order), 0) + 1000;
}

/**
 * Mutation: create a plain text note card.
 */
export function useCreateTextCard(sectionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) => {
      const cards =
        queryClient.getQueryData<CardRow[]>(['classroom-cards', sectionId]) ?? [];
      const sort_order = computeNextSortOrder(cards);

      const { data, error } = await supabase
        .from('classroom_cards')
        .insert({ section_id: sectionId, card_type: 'text', content, sort_order })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classroom-cards', sectionId] });
    },
  });
}

/**
 * Mutation: create an external link card.
 */
export function useCreateLinkCard(sectionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ url, title }: { url: string; title?: string }) => {
      const cards =
        queryClient.getQueryData<CardRow[]>(['classroom-cards', sectionId]) ?? [];
      const sort_order = computeNextSortOrder(cards);

      const { data, error } = await supabase
        .from('classroom_cards')
        .insert({
          section_id: sectionId,
          card_type: 'link',
          content: url,
          title: title ?? null,
          sort_order,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classroom-cards', sectionId] });
    },
  });
}

/**
 * Mutation: upload a PDF or image file to Supabase Storage then create a card row.
 * mutationFn calls uploadClassroomFile before inserting the DB row.
 */
export function useCreateFileCard(sectionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      fileUri,
      fileName,
      mimeType,
      cardType,
      classroomId,
    }: {
      fileUri: string;
      fileName: string;
      mimeType: string;
      cardType: 'pdf' | 'image';
      classroomId: string;
    }) => {
      const cards =
        queryClient.getQueryData<CardRow[]>(['classroom-cards', sectionId]) ?? [];
      const sort_order = computeNextSortOrder(cards);

      // Upload to Storage first, then insert DB row
      const storagePath = await uploadClassroomFile(classroomId, fileUri, fileName, mimeType);

      const { data, error } = await supabase
        .from('classroom_cards')
        .insert({
          section_id: sectionId,
          card_type: cardType,
          title: fileName,
          storage_path: storagePath,
          sort_order,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classroom-cards', sectionId] });
    },
  });
}

/**
 * Mutation: delete a card with optimistic removal from cache.
 * If card has a storage_path, removes the file from Storage before deleting the DB row.
 */
export function useDeleteCard(sectionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      cardId,
      storagePath,
    }: {
      cardId: string;
      storagePath: string | null;
    }) => {
      // Remove from Storage first if the card has a file
      if (storagePath) {
        await supabase.storage.from('classroom-assets').remove([storagePath]);
      }

      const { error } = await supabase
        .from('classroom_cards')
        .delete()
        .eq('id', cardId);
      if (error) throw error;
    },
    onMutate: async ({ cardId }) => {
      await queryClient.cancelQueries({ queryKey: ['classroom-cards', sectionId] });
      const previous = queryClient.getQueryData<CardRowWithSignedUrl[]>([
        'classroom-cards',
        sectionId,
      ]);
      queryClient.setQueryData<CardRowWithSignedUrl[]>(
        ['classroom-cards', sectionId],
        (old) => (old ?? []).filter((c) => c.id !== cardId)
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['classroom-cards', sectionId], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['classroom-cards', sectionId] });
    },
  });
}
