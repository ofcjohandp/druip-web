import { useStudySessionStore } from '@/features/study/useStudySessionStore';

const mockQuestions = [
  { id: '1', section_id: 's1', question_text: 'Q1', options: ['A','B','C','D'], correct_option_index: 0, explanation: 'Because A', order: 1, is_published: true, created_at: '', updated_at: '' },
  { id: '2', section_id: 's1', question_text: 'Q2', options: ['A','B','C','D'], correct_option_index: 1, explanation: 'Because B', order: 2, is_published: true, created_at: '', updated_at: '' },
  { id: '3', section_id: 's1', question_text: 'Q3', options: ['A','B','C','D'], correct_option_index: 2, explanation: 'Because C', order: 3, is_published: true, created_at: '', updated_at: '' },
];

beforeEach(() => { useStudySessionStore.getState().clearSession(); });

describe('useStudySessionStore', () => {
  // STUDY-01: initSession sets questions and resets state
  test('initSession sets lessonId, questions, and resets index/score', () => {
    useStudySessionStore.getState().initSession('lesson-1', mockQuestions);
    const state = useStudySessionStore.getState();
    expect(state.lessonId).toBe('lesson-1');
    expect(state.questions).toHaveLength(3);
    expect(state.currentIndex).toBe(0);
    expect(state.score).toBe(0);
    expect(state.isLocked).toBe(false);
    expect(state.answers).toEqual([null, null, null]);
  });

  // STUDY-02: progress fraction is monotonically increasing
  test('progress fraction never decreases across lock+advance cycles', () => {
    useStudySessionStore.getState().initSession('lesson-1', mockQuestions);
    let prevProgress = 0;
    for (let i = 0; i < mockQuestions.length; i++) {
      const s1 = useStudySessionStore.getState();
      const p1 = (s1.currentIndex + (s1.isLocked ? 1 : 0)) / s1.questions.length;
      expect(p1).toBeGreaterThanOrEqual(prevProgress);
      useStudySessionStore.getState().lockAnswer(0, true);
      const s2 = useStudySessionStore.getState();
      const p2 = (s2.currentIndex + (s2.isLocked ? 1 : 0)) / s2.questions.length;
      expect(p2).toBeGreaterThanOrEqual(p1);
      prevProgress = p2;
      if (i < mockQuestions.length - 1) useStudySessionStore.getState().advance();
    }
  });

  // STUDY-04: lockAnswer is synchronous and sets isLocked=true
  test('lockAnswer sets isLocked to true and records selected answer', () => {
    useStudySessionStore.getState().initSession('lesson-1', mockQuestions);
    useStudySessionStore.getState().lockAnswer(2, false);
    const state = useStudySessionStore.getState();
    expect(state.isLocked).toBe(true);
    expect(state.answers[0]).toBe(2);
  });

  // STUDY-04: idempotent guard — double lock does not mutate
  test('lockAnswer is idempotent when already locked', () => {
    useStudySessionStore.getState().initSession('lesson-1', mockQuestions);
    useStudySessionStore.getState().lockAnswer(0, true);
    const stateAfterFirst = { ...useStudySessionStore.getState() };
    useStudySessionStore.getState().lockAnswer(1, false);
    const stateAfterSecond = useStudySessionStore.getState();
    expect(stateAfterSecond.answers[0]).toBe(stateAfterFirst.answers[0]);
    expect(stateAfterSecond.score).toBe(stateAfterFirst.score);
  });

  // STUDY-05: score increments only on correct answer
  test('lockAnswer increments score when isCorrect=true', () => {
    useStudySessionStore.getState().initSession('lesson-1', mockQuestions);
    useStudySessionStore.getState().lockAnswer(0, true);
    expect(useStudySessionStore.getState().score).toBe(1);
  });

  test('lockAnswer does not increment score when isCorrect=false', () => {
    useStudySessionStore.getState().initSession('lesson-1', mockQuestions);
    useStudySessionStore.getState().lockAnswer(1, false);
    expect(useStudySessionStore.getState().score).toBe(0);
  });

  test('advance increments currentIndex and sets isLocked=false', () => {
    useStudySessionStore.getState().initSession('lesson-1', mockQuestions);
    useStudySessionStore.getState().lockAnswer(0, true);
    useStudySessionStore.getState().advance();
    const state = useStudySessionStore.getState();
    expect(state.currentIndex).toBe(1);
    expect(state.isLocked).toBe(false);
  });

  test('clearSession resets all fields to initial values', () => {
    useStudySessionStore.getState().initSession('lesson-1', mockQuestions);
    useStudySessionStore.getState().lockAnswer(0, true);
    useStudySessionStore.getState().clearSession();
    const state = useStudySessionStore.getState();
    expect(state.lessonId).toBeNull();
    expect(state.questions).toEqual([]);
    expect(state.currentIndex).toBe(0);
    expect(state.score).toBe(0);
    expect(state.isLocked).toBe(false);
  });
});
