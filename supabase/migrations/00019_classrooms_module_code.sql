-- Add module_code to classrooms so tutors can specify the university module
-- (e.g. "FISI 111 — Human Physiology") or high school subject code.
-- Optional field — not all classrooms will have a formal module code.

ALTER TABLE classrooms ADD COLUMN module_code TEXT;
