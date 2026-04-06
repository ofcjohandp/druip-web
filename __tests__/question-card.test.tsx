import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { QuestionCard } from '@/features/study/QuestionCard';

const OPTIONS = ['Berlin', 'Madrid', 'Paris', 'Rome'];

const baseProps = {
  questionText: 'What is the capital of France?',
  options: OPTIONS,
  correctIndex: 2,
  isLocked: false,
  selectedOption: null,
  onSelectOption: jest.fn(),
  progress: 0.5,
  totalQuestions: 4,
};

// STUDY-03: max 4 options rendered
describe('QuestionCard', () => {
  test('renders exactly the options provided (4 options)', () => {
    const { getByTestId } = render(<QuestionCard {...baseProps} />);
    // All 4 option testIDs should exist
    for (let i = 0; i < 4; i++) {
      expect(getByTestId(`option-${i}`)).toBeTruthy();
    }
  });

  // STUDY-08: minHeight 48 on options
  test('answer options have minHeight of 48', () => {
    const { getByTestId } = render(<QuestionCard {...baseProps} />);
    for (let i = 0; i < 4; i++) {
      const el = getByTestId(`option-${i}`);
      const style = Array.isArray(el.props.style)
        ? Object.assign({}, ...el.props.style)
        : el.props.style ?? {};
      expect(style.minHeight).toBe(48);
    }
  });

  test('correct option has success background when locked', () => {
    const { getByTestId } = render(
      <QuestionCard {...baseProps} isLocked={true} selectedOption={2} correctIndex={2} />
    );
    const correctEl = getByTestId('option-2');
    const style = Array.isArray(correctEl.props.style)
      ? Object.assign({}, ...correctEl.props.style)
      : correctEl.props.style ?? {};
    expect(style.backgroundColor).toBe('#E8F5E9');
  });

  test('wrong selected option has error background when locked', () => {
    const { getByTestId } = render(
      <QuestionCard {...baseProps} isLocked={true} selectedOption={1} correctIndex={2} />
    );
    const wrongEl = getByTestId('option-1');
    const style = Array.isArray(wrongEl.props.style)
      ? Object.assign({}, ...wrongEl.props.style)
      : wrongEl.props.style ?? {};
    expect(style.backgroundColor).toBe('#FFEBEE');
  });

  test('unselected wrong options remain in default surface state when locked', () => {
    const { getByTestId } = render(
      <QuestionCard {...baseProps} isLocked={true} selectedOption={1} correctIndex={2} />
    );
    // Berlin (index 0) and Rome (index 3) are unselected wrong options
    [0, 3].forEach((i) => {
      const el = getByTestId(`option-${i}`);
      const style = Array.isArray(el.props.style)
        ? Object.assign({}, ...el.props.style)
        : el.props.style ?? {};
      expect(style.backgroundColor).not.toBe('#E8F5E9');
      expect(style.backgroundColor).not.toBe('#FFEBEE');
    });
  });
});
