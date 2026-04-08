describe('useStudentProfile', () => {
  it.todo('returns null for a new user with no student_profiles row');
  it.todo('returns the student profile when it exists');
  it.todo('pendingStudentOnboarding is true when profile is null');
  it.todo('pendingStudentOnboarding is true when onboarding_complete is false');
  it.todo('pendingStudentOnboarding is false when onboarding_complete is true');
});

describe('useUpsertStudentProfile', () => {
  it.todo('creates a new student_profiles row on first save');
  it.todo('updates existing row on subsequent saves');
  it.todo('sets onboarding_complete to true on final step');
});
