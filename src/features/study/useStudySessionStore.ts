import { create } from 'zustand';
import { Database } from '@/types/database';

type Question = Database['public']['Tables']['questions']['Row'];

interface StudySessionState {
  lessonId: string | null;
  questions: Question[];
  currentIndex: number;
  answers: (number | null)[];
  score: number;
  isLocked: boolean;
  initSession: (lessonId: string, questions: Question[]) => void;
  lockAnswer: (selectedIndex: number, isCorrect: boolean) => void;
  advance: () => void;
  clearSession: () => void;
}

export const useStudySessionStore = create<StudySessionState>((set, get) => ({
  lessonId: null,
  questions: [],
  currentIndex: 0,
  answers: [],
  score: 0,
  isLocked: false,

  initSession: (lessonId, questions) =>
    set({
      lessonId,
      questions,
      currentIndex: 0,
      answers: questions.map(() => null),
      score: 0,
      isLocked: false,
    }),

  lockAnswer: (selectedIndex, isCorrect) => {
    // Idempotent guard: double-tap does not mutate state (STUDY-04)
    if (get().isLocked) return;
    set((state) => {
      const newAnswers = [...state.answers];
      newAnswers[state.currentIndex] = selectedIndex;
      return {
        isLocked: true,
        answers: newAnswers,
        score: isCorrect ? state.score + 1 : state.score,
      };
    });
  },

  advance: () =>
    set((state) => ({
      currentIndex: state.currentIndex + 1,
      isLocked: false,
    })),

  clearSession: () =>
    set({
      lessonId: null,
      questions: [],
      currentIndex: 0,
      answers: [],
      score: 0,
      isLocked: false,
    }),
}));
