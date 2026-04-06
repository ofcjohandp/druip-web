import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FeedbackPanel } from '@/features/study/FeedbackPanel';

const baseProps = {
  isVisible: true,
  isCorrect: true,
  correctOptionText: 'Paris',
  explanation: 'Paris is the capital of France.',
  onContinue: jest.fn(),
};

// STUDY-06: no auto-advance
describe('FeedbackPanel', () => {
  test('panel shows "Correct!" text for correct answers', () => {
    const { getByText } = render(<FeedbackPanel {...baseProps} isCorrect={true} />);
    expect(getByText('Correct!')).toBeTruthy();
  });

  test('panel shows "Correct answer:" + explanation for wrong answers', () => {
    const { getByText } = render(
      <FeedbackPanel
        {...baseProps}
        isCorrect={false}
        correctOptionText="Paris"
        explanation="Because Paris is the capital."
      />
    );
    expect(getByText('Correct answer: Paris')).toBeTruthy();
    expect(getByText('Because Paris is the capital.')).toBeTruthy();
  });

  test('Continue button is present and tappable', () => {
    const { getByText } = render(<FeedbackPanel {...baseProps} />);
    expect(getByText('Continue')).toBeTruthy();
  });

  test('tapping Continue calls onContinue callback (no auto-advance)', () => {
    const onContinue = jest.fn();
    const { getByText } = render(<FeedbackPanel {...baseProps} onContinue={onContinue} />);
    fireEvent.press(getByText('Continue'));
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  test('panel is not rendered when isVisible is false', () => {
    const { toJSON } = render(<FeedbackPanel {...baseProps} isVisible={false} />);
    expect(toJSON()).toBeNull();
  });
});
