export interface HelpTypeOption {
  id: string;
  label: string;
}

export const HELP_TYPES: HelpTypeOption[] = [
  { id: 'understanding', label: 'Understanding content' },
  { id: 'test-prep', label: 'Test preparation' },
  { id: 'assignments', label: 'Assignments' },
  { id: 'exam-prep', label: 'Exam preparation' },
  { id: 'practical-skills', label: 'Practical skills' },
];
