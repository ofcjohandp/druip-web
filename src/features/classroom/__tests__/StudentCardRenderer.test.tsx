import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Linking } from 'react-native';

jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));

import { StudentCardRenderer } from '../StudentCardRenderer';

// Minimal CardRowWithSignedUrl factory
function makeCard(overrides: Partial<Record<string, unknown>>) {
  return {
    id: 'card-1',
    section_id: 'section-1',
    card_type: 'text',
    content: 'Default content',
    title: null,
    storage_path: null,
    sort_order: 1000,
    signedUrl: undefined,
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  } as Parameters<typeof StudentCardRenderer>[0]['card'];
}

describe('StudentCardRenderer', () => {
  it('TEXT-01: text card renders card content as plain text', () => {
    const card = makeCard({ card_type: 'text', content: 'Hello world' });
    const { getByText } = render(<StudentCardRenderer card={card} />);
    expect(getByText('Hello world')).toBeTruthy();
  });

  it('LINK-01: link card calls Linking.openURL with card content', () => {
    const openURLSpy = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    const card = makeCard({ card_type: 'link', content: 'https://example.com', title: 'Example' });
    const { getByText } = render(<StudentCardRenderer card={card} />);
    fireEvent.press(getByText('Example'));
    expect(openURLSpy).toHaveBeenCalledWith('https://example.com');
    openURLSpy.mockRestore();
  });

  it('PDF-01: pdf card with signedUrl navigates to /(tabs)/pdf-viewer with encoded url param', () => {
    const { router } = require('expo-router');
    (router.push as jest.Mock).mockClear();
    const card = makeCard({
      card_type: 'pdf',
      title: 'Lecture Notes',
      signedUrl: 'https://storage.supabase.co/object/signed/classroom-assets/test.pdf',
    });
    const { getByText } = render(<StudentCardRenderer card={card} />);
    fireEvent.press(getByText('Tap to open'));
    expect(router.push).toHaveBeenCalledWith(
      expect.stringContaining('/(tabs)/pdf-viewer?url=')
    );
    expect(router.push).toHaveBeenCalledWith(
      expect.stringContaining(encodeURIComponent('https://storage.supabase.co/object/signed/classroom-assets/test.pdf'))
    );
  });

  it('FLASH-03: flashcard card renders FlashCard component with front and back props', () => {
    const card = makeCard({
      card_type: 'flashcard',
      content: 'What is osmosis?',
      title: 'Movement of water across a membrane',
    });
    const { getByText } = render(<StudentCardRenderer card={card} />);
    expect(getByText('What is osmosis?')).toBeTruthy();
  });

  it('UNKNOWN-01: unknown card_type renders null without crashing', () => {
    const card = makeCard({ card_type: 'unknown_type' });
    const { toJSON } = render(<StudentCardRenderer card={card} />);
    expect(toJSON()).toBeNull();
  });
});
