import React from 'react';
import { render } from '@testing-library/react-native';

// Mock expo-router
jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(() => ({
    score: '12',
    total: '15',
    lessonId: 'l1',
    topicId: 't1',
    xpReward: '10',
  })),
  useRouter: jest.fn(() => ({ replace: jest.fn() })),
}));

// Mock useProfile
jest.mock('@/features/study/useProfile', () => ({
  useProfile: jest.fn(() => ({ data: { streak_count: 5, total_xp: 100 } })),
}));

// Mock useCompleteLesson
jest.mock('@/features/study/useCompleteLesson', () => ({
  useCompleteLesson: jest.fn(() => ({
    mutate: jest.fn(),
    isSuccess: false,
    isPending: false,
  })),
}));

// Mock useAuthStore
jest.mock('@/features/auth/useAuthStore', () => ({
  useAuthStore: jest.fn((selector: (state: { session: { user: { id: string } } }) => unknown) =>
    selector({ session: { user: { id: 'u1' } } })
  ),
}));

import LessonCompleteScreen from '../src/app/lesson-complete';

// STUDY-07: XP + score + streak display
describe('LessonCompleteScreen', () => {
  test('renders XP value "10" on screen', () => {
    const { getByText } = render(<LessonCompleteScreen />);
    expect(getByText('10')).toBeTruthy();
  });

  test('renders "XP earned" label', () => {
    const { getByText } = render(<LessonCompleteScreen />);
    expect(getByText('XP earned')).toBeTruthy();
  });

  test('renders score summary in "N of M correct" format', () => {
    const { getByText } = render(<LessonCompleteScreen />);
    expect(getByText('12 of 15 correct')).toBeTruthy();
  });

  test('renders streak count', () => {
    const { getByText } = render(<LessonCompleteScreen />);
    expect(getByText('Current streak: 5 days')).toBeTruthy();
  });

  test('renders "Continue" CTA button', () => {
    const { getByText } = render(<LessonCompleteScreen />);
    expect(getByText('Continue')).toBeTruthy();
  });
});
