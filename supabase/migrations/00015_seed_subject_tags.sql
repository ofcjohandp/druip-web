-- Phase 7: Seed subject_tags with common SA university subjects
-- These are displayed on the student onboarding "Which subjects?" screen

INSERT INTO subject_tags (name, slug) VALUES
  -- Health Sciences
  ('Anatomy', 'anatomy'),
  ('Physiology', 'physiology'),
  ('Biochemistry', 'biochemistry'),
  ('Pharmacology', 'pharmacology'),
  ('Pathology', 'pathology'),
  ('Microbiology', 'microbiology'),
  ('Immunology', 'immunology'),
  ('Neuroscience', 'neuroscience'),
  ('Biomechanics', 'biomechanics'),
  ('Clinical Practice', 'clinical-practice'),
  ('Rehabilitation', 'rehabilitation'),
  ('Nutrition', 'nutrition'),
  -- Natural Sciences
  ('Biology', 'biology'),
  ('Chemistry', 'chemistry'),
  ('Physics', 'physics'),
  ('Mathematics', 'mathematics'),
  ('Statistics', 'statistics'),
  ('Genetics', 'genetics'),
  ('Ecology', 'ecology'),
  -- Commerce
  ('Accounting', 'accounting'),
  ('Economics', 'economics'),
  ('Finance', 'finance'),
  ('Business Management', 'business-management'),
  ('Marketing', 'marketing'),
  ('Business Law', 'business-law'),
  -- Engineering
  ('Engineering Mathematics', 'engineering-mathematics'),
  ('Thermodynamics', 'thermodynamics'),
  ('Fluid Mechanics', 'fluid-mechanics'),
  ('Structural Engineering', 'structural-engineering'),
  ('Electronics', 'electronics'),
  -- Humanities
  ('Psychology', 'psychology'),
  ('Sociology', 'sociology'),
  ('Philosophy', 'philosophy'),
  ('History', 'history'),
  ('Political Science', 'political-science'),
  -- IT
  ('Computer Science', 'computer-science'),
  ('Programming', 'programming'),
  ('Data Science', 'data-science'),
  ('Databases', 'databases'),
  ('Networking', 'networking'),
  -- Law
  ('Law', 'law'),
  ('Constitutional Law', 'constitutional-law'),
  ('Contract Law', 'contract-law')
ON CONFLICT (slug) DO NOTHING;
