import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

// FlashCard is not yet created — this will fail (RED phase)
import { FlashCard } from '../FlashCard';

describe('FlashCard', () => {
  it('FLASH-02a: renders front face text on initial mount', () => {
    const { getByText } = render(<FlashCard front="What is osmosis?" back="Movement of water across a membrane" />);
    expect(getByText('What is osmosis?')).toBeTruthy();
  });

  it('FLASH-02b: renders back face text after user taps the card', () => {
    const { getByText, getByRole } = render(
      <FlashCard front="What is osmosis?" back="Movement of water across a membrane" />
    );
    // Initially front is shown
    expect(getByText('What is osmosis?')).toBeTruthy();
    // Tap the card (button role via accessibilityRole)
    fireEvent.press(getByRole('button'));
    // After tap, back text should be in the tree
    expect(getByText('Movement of water across a membrane')).toBeTruthy();
  });

  it('FLASH-02c: does not throw when front or back is an empty string', () => {
    expect(() => render(<FlashCard front="" back="" />)).not.toThrow();
  });
});
