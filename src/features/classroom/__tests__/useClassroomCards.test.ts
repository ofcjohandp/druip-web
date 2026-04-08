import { renderHook, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useCreateFlashcard } from '../useClassroomCards';

// Minimal mock for supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

// Minimal mock for uploadClassroomFile (not used by flashcard hook but imported by module)
jest.mock('../uploadClassroomFile', () => ({
  uploadClassroomFile: jest.fn(),
  getSignedUrl: jest.fn(),
}));

import { supabase } from '@/lib/supabase';

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('useClassroomCards', () => {
  it.todo('CARD-01: useCreateTextCard inserts card with card_type text and content');
  it.todo('CARD-04: useCreateLinkCard inserts card with card_type link, content URL, and title');
  it.todo('CARD-02: useCreateFileCard uploads file then inserts card with storage_path');
  it.todo('CARD-03: useCreateFileCard handles image upload with correct mimeType');
  it.todo('CARD-05: useDeleteCard removes card with optimistic rollback');
  it.todo('CARD-05: useDeleteCard removes storage file before deleting DB row');

  describe('FLASH-01: useCreateFlashcard', () => {
    it('inserts a row with card_type flashcard, content=front, title=back', async () => {
      const mockInsert = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: {
              id: 'card-uuid',
              section_id: 'section-1',
              card_type: 'flashcard',
              content: 'What is ATP?',
              title: 'Adenosine triphosphate',
              storage_path: null,
              sort_order: 1000,
            },
            error: null,
          }),
        }),
      });

      (supabase.from as jest.Mock).mockReturnValue({ insert: mockInsert });

      const { result } = renderHook(() => useCreateFlashcard('section-1'), {
        wrapper: makeWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({ front: 'What is ATP?', back: 'Adenosine triphosphate' });
      });

      expect(supabase.from).toHaveBeenCalledWith('classroom_cards');
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          card_type: 'flashcard',
          content: 'What is ATP?',
          title: 'Adenosine triphosphate',
          storage_path: null,
        })
      );
    });

    it('throws if front is empty', async () => {
      const { result } = renderHook(() => useCreateFlashcard('section-1'), {
        wrapper: makeWrapper(),
      });

      await expect(
        act(async () => {
          await result.current.mutateAsync({ front: '', back: 'Some answer' });
        })
      ).rejects.toThrow('front and back are required');
    });

    it('throws if back is empty', async () => {
      const { result } = renderHook(() => useCreateFlashcard('section-1'), {
        wrapper: makeWrapper(),
      });

      await expect(
        act(async () => {
          await result.current.mutateAsync({ front: 'Some question', back: '' });
        })
      ).rejects.toThrow('front and back are required');
    });
  });
});
