import React from 'react';
import { render } from '@testing-library/react-native';

// STUDY-03: max 4 options rendered
describe('QuestionCard', () => {
  test.todo('renders at most 4 answer options even if question has 5+');

  // STUDY-08: minHeight 48 on options
  test.todo('answer options have minHeight of 48');

  test.todo('correct option shows checkmark-circle icon when locked');
  test.todo('wrong selected option shows close-circle icon when locked');
  test.todo('unselected wrong options remain in default state when locked');
});
