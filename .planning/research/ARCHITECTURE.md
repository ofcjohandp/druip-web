# Architecture: Database Design for Druip

**Project:** Druip — Gamified Study Platform
**Stack:** Supabase (PostgreSQL)
**Researched:** 2026-04-06
**Confidence:** HIGH (schema patterns from official Supabase docs + verified PostgreSQL patterns)

---

## Overview

Druip organises content in a four-level hierarchy: Module → Topics → Lessons → Sections. Students move through lessons answering questions, accumulate scores, build streaks, and attach notes. The schema below is designed for:

- A mobile-first client querying via Supabase's PostgREST API
- RLS-enforced multi-user isolation from day one
- Efficient reads via targeted indexes and materialized views
- Extensibility (adding new question types, media, gamification layers)

---

## 1. Content Hierarchy Schema

### 1.1 Modules

The top-level grouping (e.g., "Physiotherapy Year 2 — Anatomy").

```sql
create table modules (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,          -- url-safe identifier, e.g. "anatomy-y2"
  title       text not null,
  description text,
  cover_image text,                          -- storage path or CDN URL
  is_published boolean not null default false,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
```

### 1.2 Topics

A module contains many topics (e.g., "Upper Limb", "Spinal Column").

```sql
create table topics (
  id          uuid primary key default gen_random_uuid(),
  module_id   uuid not null references modules(id) on delete cascade,
  slug        text not null,
  title       text not null,
  description text,
  icon        text,                          -- emoji or icon key
  sort_order  int not null default 0,
  is_published boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique(module_id, slug)
);

create index idx_topics_module_id on topics(module_id);
```

### 1.3 Lessons

A topic contains many lessons. A lesson is a discrete study unit with an unlock condition.

```sql
create table lessons (
  id             uuid primary key default gen_random_uuid(),
  topic_id       uuid not null references topics(id) on delete cascade,
  slug           text not null,
  title          text not null,
  description    text,
  lesson_type    text not null default 'standard', -- 'standard' | 'practice' | 'challenge'
  xp_reward      int not null default 10,
  sort_order     int not null default 0,
  is_published   boolean not null default false,
  -- unlock logic: null means always unlocked; otherwise previous lesson must be complete
  unlocked_after uuid references lessons(id),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique(topic_id, slug)
);

create index idx_lessons_topic_id on lessons(topic_id);
create index idx_lessons_unlocked_after on lessons(unlocked_after)
  where unlocked_after is not null;
```

### 1.4 Sections

A lesson is broken into sections (e.g., "Introduction", "Key Concepts", "Practice Questions"). Each section has a type that drives the UI.

```sql
create type section_type as enum (
  'text',         -- rich-text reading content
  'video',        -- embedded video
  'quiz',         -- questions embedded in lesson flow
  'flashcard',    -- flashcard set
  'summary'       -- end-of-lesson recap
);

create table sections (
  id           uuid primary key default gen_random_uuid(),
  lesson_id    uuid not null references lessons(id) on delete cascade,
  title        text,
  content_type section_type not null default 'text',
  content      jsonb,        -- flexible: text body, video URL, flashcard data
  sort_order   int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index idx_sections_lesson_id on sections(lesson_id);
```

**`content` JSONB examples by type:**

```json
-- text section
{ "body": "<p>The brachial plexus originates from C5–T1...</p>" }

-- video section
{ "url": "https://...", "provider": "youtube", "duration_seconds": 480 }

-- flashcard section
{ "cards": [{ "front": "Deltoid origin?", "back": "Clavicle, acromion, spine of scapula" }] }
```

### 1.5 Questions

Questions are associated with a section (quiz type) or a lesson directly (for practice modes). Separating questions from sections allows reuse across practice and challenge lessons.

```sql
create type question_type as enum (
  'multiple_choice',
  'true_false',
  'short_answer',  -- manually graded or AI-checked
  'ordering'       -- drag-to-order items
);

create table questions (
  id              uuid primary key default gen_random_uuid(),
  section_id      uuid references sections(id) on delete cascade,
  lesson_id       uuid references lessons(id) on delete set null, -- direct lesson link
  question_type   question_type not null default 'multiple_choice',
  stem            text not null,                     -- the question text
  explanation     text,                              -- shown after answering
  difficulty      int not null default 2 check (difficulty between 1 and 5),
  tags            text[] default '{}',               -- e.g. {"anatomy","upper-limb"}
  sort_order      int not null default 0,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_questions_section_id on questions(section_id)
  where section_id is not null;
create index idx_questions_lesson_id on questions(lesson_id)
  where lesson_id is not null;
create index idx_questions_tags on questions using gin(tags);
```

### 1.6 Answer Options

```sql
create table answer_options (
  id          uuid primary key default gen_random_uuid(),
  question_id uuid not null references questions(id) on delete cascade,
  text        text not null,
  is_correct  boolean not null default false,
  sort_order  int not null default 0,
  -- for ordering questions: the correct position
  correct_position int
);

create index idx_answer_options_question_id on answer_options(question_id);
```

---

## 2. User Progress Tracking

### 2.1 Lesson Attempts

Each time a user starts a lesson, create an attempt. On completion, update it.

```sql
create type attempt_status as enum (
  'in_progress',
  'completed',
  'abandoned'
);

create table lesson_attempts (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  lesson_id      uuid not null references lessons(id) on delete cascade,
  status         attempt_status not null default 'in_progress',
  score_pct      numeric(5,2),          -- 0.00–100.00, null until completed
  xp_earned      int not null default 0,
  started_at     timestamptz not null default now(),
  completed_at   timestamptz,
  time_spent_sec int not null default 0  -- updated on completion
);

-- Most queries: "what has this user done for this lesson?"
create index idx_lesson_attempts_user_lesson
  on lesson_attempts(user_id, lesson_id);

-- For streak + activity queries
create index idx_lesson_attempts_user_completed
  on lesson_attempts(user_id, completed_at)
  where status = 'completed';
```

### 2.2 Question Responses

Every answer submitted, keyed to an attempt.

```sql
create table question_responses (
  id              uuid primary key default gen_random_uuid(),
  attempt_id      uuid not null references lesson_attempts(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  question_id     uuid not null references questions(id) on delete cascade,
  selected_option uuid references answer_options(id), -- null for short_answer
  response_text   text,                               -- for short_answer type
  is_correct      boolean not null,
  time_taken_sec  int,                                -- per-question timing
  answered_at     timestamptz not null default now()
);

-- Fast lookup: "all responses for this user on this question"
create index idx_question_responses_user_question
  on question_responses(user_id, question_id);

-- For weak area queries: filter to wrong answers efficiently
create index idx_question_responses_user_incorrect
  on question_responses(user_id, question_id)
  where is_correct = false;

create index idx_question_responses_attempt
  on question_responses(attempt_id);
```

### 2.3 Lesson Progress Summary

A denormalized summary per user per lesson — the source of truth for "is this lesson unlocked/completed?" Recalculated after each completed attempt.

```sql
create table user_lesson_progress (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references auth.users(id) on delete cascade,
  lesson_id            uuid not null references lessons(id) on delete cascade,
  is_completed         boolean not null default false,
  best_score_pct       numeric(5,2),
  last_score_pct       numeric(5,2),
  total_attempts       int not null default 0,
  total_xp_earned      int not null default 0,
  first_completed_at   timestamptz,
  last_attempted_at    timestamptz,
  updated_at           timestamptz not null default now(),
  unique(user_id, lesson_id)
);

create index idx_user_lesson_progress_user
  on user_lesson_progress(user_id);
create index idx_user_lesson_progress_lesson
  on user_lesson_progress(lesson_id);
```

**Update trigger after each attempt completes:**

```sql
create or replace function update_lesson_progress()
returns trigger language plpgsql security definer as $$
begin
  -- Only act on completion
  if NEW.status = 'completed' then
    insert into user_lesson_progress (
      user_id, lesson_id, is_completed, best_score_pct,
      last_score_pct, total_attempts, total_xp_earned,
      first_completed_at, last_attempted_at, updated_at
    )
    values (
      NEW.user_id, NEW.lesson_id, true, NEW.score_pct,
      NEW.score_pct, 1, NEW.xp_earned,
      NEW.completed_at, NEW.completed_at, now()
    )
    on conflict (user_id, lesson_id) do update set
      is_completed       = true,
      best_score_pct     = greatest(user_lesson_progress.best_score_pct, EXCLUDED.best_score_pct),
      last_score_pct     = EXCLUDED.last_score_pct,
      total_attempts     = user_lesson_progress.total_attempts + 1,
      total_xp_earned    = user_lesson_progress.total_xp_earned + NEW.xp_earned,
      first_completed_at = coalesce(user_lesson_progress.first_completed_at, EXCLUDED.first_completed_at),
      last_attempted_at  = EXCLUDED.last_attempted_at,
      updated_at         = now();
  end if;
  return NEW;
end;
$$;

create trigger trg_update_lesson_progress
  after update on lesson_attempts
  for each row execute function update_lesson_progress();
```

---

## 3. Readiness Score

### 3.1 What is It

A single percentage (0–100) that answers "how ready are you to sit the test for this topic or module?". It combines:

| Input | Weight | Rationale |
|-------|--------|-----------|
| Lesson completion rate | 30% | Have you worked through all the content? |
| Average quiz score across completed lessons | 35% | How well did you perform? |
| Recency decay factor | 20% | Recent study counts more — exponential decay |
| Consistency factor (streak) | 15% | Regular study strengthens readiness |

**Recency decay** uses a simple exponential function adapted from the Ebbinghaus forgetting curve: the more days since last study of a topic, the lower the contribution of older scores to readiness.

### 3.2 Readiness Score Table

```sql
create table user_readiness_scores (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  -- scope: topic OR module level (one of these is populated)
  topic_id        uuid references topics(id) on delete cascade,
  module_id       uuid references modules(id) on delete cascade,
  readiness_pct   numeric(5,2) not null default 0,
  -- component breakdown for transparency
  completion_pct  numeric(5,2) not null default 0,
  avg_score_pct   numeric(5,2) not null default 0,
  recency_factor  numeric(5,2) not null default 1.0,
  streak_factor   numeric(5,2) not null default 1.0,
  lesson_count    int not null default 0,
  lessons_done    int not null default 0,
  last_calculated timestamptz not null default now(),
  check (
    (topic_id is not null and module_id is null) or
    (topic_id is null and module_id is not null)
  ),
  unique(user_id, topic_id),
  unique(user_id, module_id)
);

create index idx_readiness_user_topic
  on user_readiness_scores(user_id, topic_id)
  where topic_id is not null;
create index idx_readiness_user_module
  on user_readiness_scores(user_id, module_id)
  where module_id is not null;
```

### 3.3 Calculation Function

Called after each completed lesson attempt and on a scheduled basis for decay.

```sql
create or replace function recalculate_readiness(
  p_user_id  uuid,
  p_topic_id uuid
) returns void language plpgsql security definer as $$
declare
  v_total_lessons   int;
  v_done_lessons    int;
  v_avg_score       numeric;
  v_days_since_last numeric;
  v_recency         numeric;
  v_streak_factor   numeric;
  v_readiness       numeric;
  v_completion      numeric;
begin
  -- 1. How many lessons exist and how many done
  select count(*), count(ulp.lesson_id)
  into v_total_lessons, v_done_lessons
  from lessons l
  join topics t on l.topic_id = t.id
  left join user_lesson_progress ulp
    on ulp.lesson_id = l.id and ulp.user_id = p_user_id and ulp.is_completed = true
  where t.id = p_topic_id and l.is_published = true;

  if v_total_lessons = 0 then return; end if;

  v_completion := (v_done_lessons::numeric / v_total_lessons) * 100;

  -- 2. Average score across completed lessons
  select coalesce(avg(ulp.best_score_pct), 0)
  into v_avg_score
  from user_lesson_progress ulp
  join lessons l on ulp.lesson_id = l.id
  where l.topic_id = p_topic_id
    and ulp.user_id = p_user_id
    and ulp.is_completed = true;

  -- 3. Recency decay: days since last activity in this topic
  select coalesce(
    extract(epoch from (now() - max(ulp.last_attempted_at))) / 86400,
    30  -- default 30 days if no activity
  )
  into v_days_since_last
  from user_lesson_progress ulp
  join lessons l on ulp.lesson_id = l.id
  where l.topic_id = p_topic_id and ulp.user_id = p_user_id;

  -- Ebbinghaus-inspired decay: full credit within 2 days, decays over 14 days
  -- r = exp(-days / stability) clamped to [0.5, 1.0]
  v_recency := greatest(0.5, least(1.0, exp(-v_days_since_last / 14.0)));

  -- 4. Streak factor: current streak as a bonus multiplier (capped)
  select least(1.2, 1.0 + (current_streak::numeric * 0.01))
  into v_streak_factor
  from user_streaks
  where user_id = p_user_id;

  v_streak_factor := coalesce(v_streak_factor, 1.0);

  -- 5. Combine
  v_readiness := least(100.0, (
    (v_completion     * 0.30) +
    (v_avg_score      * 0.35) +
    (v_avg_score * v_recency * 0.20) +
    (v_avg_score * v_streak_factor * 0.15)
  ));

  -- 6. Upsert
  insert into user_readiness_scores (
    user_id, topic_id, readiness_pct, completion_pct,
    avg_score_pct, recency_factor, streak_factor,
    lesson_count, lessons_done, last_calculated
  ) values (
    p_user_id, p_topic_id, v_readiness, v_completion,
    v_avg_score, v_recency, v_streak_factor,
    v_total_lessons, v_done_lessons, now()
  )
  on conflict (user_id, topic_id) do update set
    readiness_pct    = excluded.readiness_pct,
    completion_pct   = excluded.completion_pct,
    avg_score_pct    = excluded.avg_score_pct,
    recency_factor   = excluded.recency_factor,
    streak_factor    = excluded.streak_factor,
    lesson_count     = excluded.lesson_count,
    lessons_done     = excluded.lessons_done,
    last_calculated  = excluded.last_calculated;
end;
$$;
```

**When to recalculate:**
- Immediately after each `lesson_attempts` row transitions to `completed` (via trigger)
- Nightly via Supabase Cron (`pg_cron`) to apply recency decay for inactive users

```sql
-- pg_cron: recalculate decay for anyone who studied in last 30 days
-- runs at 02:00 UTC daily
select cron.schedule(
  'decay-readiness-scores',
  '0 2 * * *',
  $$
    select recalculate_readiness(user_id, topic_id)
    from user_readiness_scores
    where last_calculated > now() - interval '30 days';
  $$
);
```

---

## 4. Weak Area Detection

### 4.1 What Counts as "Weak"

A topic or question tag is a weak area when the user's error rate exceeds a threshold. Two levels:

- **Tag-level weak area:** > 40% incorrect on questions tagged with that concept
- **Lesson-level weak area:** best score < 60% after at least 2 attempts

### 4.2 Aggregated Performance View

```sql
create materialized view mv_user_tag_performance as
select
  qr.user_id,
  unnest(q.tags) as tag,
  count(*) as total_responses,
  sum(case when qr.is_correct then 1 else 0 end) as correct_count,
  round(
    100.0 * sum(case when qr.is_correct then 1 else 0 end) / count(*),
    2
  ) as accuracy_pct
from question_responses qr
join questions q on qr.question_id = q.id
group by qr.user_id, tag;

create unique index on mv_user_tag_performance(user_id, tag);
```

Refresh on a schedule or after batch attempts:

```sql
refresh materialized view concurrently mv_user_tag_performance;
```

### 4.3 Weak Areas Query

The app calls this function to get a student's weak areas for a given module:

```sql
create or replace function get_weak_areas(
  p_user_id  uuid,
  p_module_id uuid
) returns table (
  tag           text,
  accuracy_pct  numeric,
  total_responses int,
  severity      text    -- 'critical' | 'moderate' | 'watch'
) language sql security definer as $$
  select
    p.tag,
    p.accuracy_pct,
    p.total_responses,
    case
      when p.accuracy_pct < 40 then 'critical'
      when p.accuracy_pct < 60 then 'moderate'
      else 'watch'
    end as severity
  from mv_user_tag_performance p
  where p.user_id = p_user_id
    -- only tags that belong to questions in this module
    and exists (
      select 1
      from questions q
      join sections s on q.section_id = s.id
      join lessons l  on s.lesson_id = l.id
      join topics t   on l.topic_id = t.id
      where t.module_id = p_module_id
        and p.tag = any(q.tags)
    )
    and p.accuracy_pct < 70
    and p.total_responses >= 3   -- at least 3 attempts before flagging
  order by p.accuracy_pct asc
  limit 10;
$$;
```

### 4.4 Weak Lesson Summary (stored)

For fast mobile display, maintain a dedicated table updated by trigger:

```sql
create table user_weak_lessons (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  lesson_id     uuid not null references lessons(id) on delete cascade,
  best_score    numeric(5,2),
  attempt_count int not null default 0,
  flagged_at    timestamptz not null default now(),
  unique(user_id, lesson_id)
);

create index idx_weak_lessons_user on user_weak_lessons(user_id);
```

---

## 5. Streak Tracking

### 5.1 Schema

```sql
create table user_streaks (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null unique references auth.users(id) on delete cascade,
  current_streak      int not null default 0,
  longest_streak      int not null default 0,
  last_activity_date  date,           -- date (not timestamp) in user's timezone
  streak_frozen_until date,           -- if set and today <= this date, no break
  freeze_count_used   int not null default 0,
  freeze_count_limit  int not null default 2,  -- Duolingo model: max 2 freezes active
  updated_at          timestamptz not null default now()
);
```

### 5.2 Activity Log (source of truth)

```sql
create table user_activity_log (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  activity_date date not null,
  xp_earned   int not null default 0,
  lessons_done int not null default 0,
  created_at  timestamptz not null default now(),
  unique(user_id, activity_date)
);

create index idx_activity_log_user_date
  on user_activity_log(user_id, activity_date desc);
```

### 5.3 Streak Update Function

Called after each completed lesson. Uses the `date_trunc` + `ROW_NUMBER` technique to recalculate current streak from the activity log.

```sql
create or replace function update_streak(p_user_id uuid)
returns void language plpgsql security definer as $$
declare
  v_today          date := current_date;
  v_last_activity  date;
  v_current_streak int;
  v_frozen_until   date;
  v_streak_broken  boolean := false;
begin
  select last_activity_date, streak_frozen_until
  into v_last_activity, v_frozen_until
  from user_streaks
  where user_id = p_user_id;

  -- If first ever activity
  if v_last_activity is null then
    insert into user_streaks (user_id, current_streak, longest_streak, last_activity_date)
    values (p_user_id, 1, 1, v_today)
    on conflict (user_id) do update set
      current_streak     = 1,
      last_activity_date = v_today,
      updated_at         = now();
    return;
  end if;

  -- Already logged today — no-op
  if v_last_activity = v_today then return; end if;

  -- Check if streak is broken (yesterday was missed and no active freeze)
  if v_last_activity < (v_today - 1) then
    -- Was there an active freeze that covered the gap?
    if v_frozen_until is null or v_frozen_until < (v_today - 1) then
      v_streak_broken := true;
    end if;
  end if;

  -- Recalculate current streak from activity log using the gaps-and-islands technique
  with groups as (
    select
      activity_date,
      activity_date - (row_number() over (order by activity_date))::int as grp
    from user_activity_log
    where user_id = p_user_id
  ),
  streaks as (
    select
      min(activity_date) as start_date,
      max(activity_date) as end_date,
      count(*) as days_count
    from groups
    group by grp
  )
  select days_count + 1  -- +1 for today (about to be logged)
  into v_current_streak
  from streaks
  where end_date = v_today - 1
  order by end_date desc
  limit 1;

  v_current_streak := coalesce(v_current_streak, 1);

  if v_streak_broken then
    v_current_streak := 1;  -- restart
  end if;

  update user_streaks set
    current_streak     = v_current_streak,
    longest_streak     = greatest(longest_streak, v_current_streak),
    last_activity_date = v_today,
    updated_at         = now()
  where user_id = p_user_id;
end;
$$;
```

### 5.4 Streak Freeze

A freeze is purchased or earned in-app. Equipping a freeze sets `streak_frozen_until = today + 1`.

```sql
create or replace function equip_streak_freeze(p_user_id uuid)
returns jsonb language plpgsql security definer as $$
declare
  v_streak user_streaks;
begin
  select * into v_streak from user_streaks where user_id = p_user_id for update;

  if v_streak.freeze_count_used >= v_streak.freeze_count_limit then
    return jsonb_build_object('success', false, 'reason', 'freeze_limit_reached');
  end if;

  update user_streaks set
    streak_frozen_until = current_date + 1,
    freeze_count_used   = freeze_count_used + 1,
    updated_at          = now()
  where user_id = p_user_id;

  return jsonb_build_object('success', true, 'frozen_until', current_date + 1);
end;
$$;
```

---

## 6. Notes System

### 6.1 Schema

Notes attach to a lesson, topic, or section. They support structured blocks (like Notion) or plain rich text.

```sql
create type note_visibility as enum ('private', 'shared');  -- future: shared with classmates

create table notes (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  -- anchor: exactly one of these is set
  lesson_id    uuid references lessons(id) on delete cascade,
  topic_id     uuid references topics(id) on delete cascade,
  section_id   uuid references sections(id) on delete cascade,
  title        text,
  content      jsonb not null default '{"blocks": []}',  -- block-based content
  visibility   note_visibility not null default 'private',
  tags         text[] default '{}',
  is_pinned    boolean not null default false,
  color        text,           -- hex colour for card UI, e.g. "#fef9c3"
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  check (
    (lesson_id is not null)::int +
    (topic_id is not null)::int +
    (section_id is not null)::int = 1
  )
);

create index idx_notes_user_id       on notes(user_id);
create index idx_notes_lesson_id     on notes(lesson_id) where lesson_id is not null;
create index idx_notes_topic_id      on notes(topic_id)  where topic_id is not null;
create index idx_notes_tags          on notes using gin(tags);
-- Full-text search on note content (title + text in blocks)
create index idx_notes_fts on notes
  using gin(to_tsvector('english', coalesce(title, '') || ' ' ||
    coalesce(content->>'blocks', '')));
```

**Content JSONB block format** (compatible with TipTap/ProseMirror):

```json
{
  "blocks": [
    { "type": "heading", "attrs": { "level": 2 }, "content": "Key Muscles" },
    { "type": "paragraph", "content": "The deltoid is the primary abductor..." },
    { "type": "callout", "attrs": { "style": "warning" }, "content": "Remember: C5/C6 innervation" },
    { "type": "image", "attrs": { "src": "storage://notes/diagram.png" } }
  ]
}
```

### 6.2 Full-text Note Search

```sql
create or replace function search_notes(p_user_id uuid, p_query text)
returns setof notes language sql security definer as $$
  select * from notes
  where user_id = p_user_id
    and to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content->>'blocks', ''))
        @@ plainto_tsquery('english', p_query)
  order by is_pinned desc, updated_at desc;
$$;
```

---

## 7. Supabase Row Level Security Patterns

### 7.1 Principles

- Enable RLS on every table. No exceptions.
- Use `(select auth.uid())` — not bare `auth.uid()` — to cache the value per statement, not per row. This is the single biggest RLS performance win.
- Add explicit `to authenticated` on every policy so the `anon` role skips evaluation entirely.
- Index every column referenced in an RLS policy.

### 7.2 Content Tables (read-only for students)

```sql
-- Modules: anyone authenticated can read published modules
alter table modules enable row level security;

create policy "authenticated can read published modules"
  on modules for select to authenticated
  using (is_published = true);

-- Same pattern for topics, lessons, sections, questions, answer_options
alter table topics enable row level security;
create policy "authenticated can read published topics"
  on topics for select to authenticated
  using (is_published = true);

alter table lessons enable row level security;
create policy "authenticated can read published lessons"
  on lessons for select to authenticated
  using (is_published = true);

alter table sections enable row level security;
create policy "authenticated can read sections of published lessons"
  on sections for select to authenticated
  using (
    exists (
      select 1 from lessons l
      where l.id = sections.lesson_id and l.is_published = true
    )
  );

alter table questions enable row level security;
create policy "authenticated can read active questions"
  on questions for select to authenticated
  using (is_active = true);

alter table answer_options enable row level security;
create policy "authenticated can read answer options"
  on answer_options for select to authenticated
  using (true);
```

### 7.3 User Progress Tables (strict user isolation)

```sql
-- lesson_attempts
alter table lesson_attempts enable row level security;

create policy "users can read own attempts"
  on lesson_attempts for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "users can insert own attempts"
  on lesson_attempts for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "users can update own attempts"
  on lesson_attempts for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- question_responses (insert only — no editing answers after submission)
alter table question_responses enable row level security;

create policy "users can read own responses"
  on question_responses for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "users can insert own responses"
  on question_responses for insert to authenticated
  with check ((select auth.uid()) = user_id);

-- user_lesson_progress (managed by server-side trigger, no client writes)
alter table user_lesson_progress enable row level security;

create policy "users can read own progress"
  on user_lesson_progress for select to authenticated
  using ((select auth.uid()) = user_id);

-- user_readiness_scores
alter table user_readiness_scores enable row level security;

create policy "users can read own readiness"
  on user_readiness_scores for select to authenticated
  using ((select auth.uid()) = user_id);

-- user_streaks
alter table user_streaks enable row level security;

create policy "users can read own streak"
  on user_streaks for select to authenticated
  using ((select auth.uid()) = user_id);

-- notes
alter table notes enable row level security;

create policy "users can manage own notes"
  on notes for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
```

### 7.4 Admin Role Pattern

Use a custom claim in the JWT to identify admin users. Set it via a Supabase Auth hook or manually in `auth.users.raw_app_meta_data`.

```sql
-- Example: admins can manage all content
create policy "admins can manage modules"
  on modules for all to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
```

### 7.5 Materialized View Security

Materialized views do not inherit table RLS automatically. Use `security_invoker` views or expose them only via `security definer` functions.

```sql
-- Safe pattern: expose via a function that re-checks user_id
create or replace function get_my_tag_performance(p_module_id uuid)
returns table (tag text, accuracy_pct numeric, total_responses int)
language sql security definer as $$
  select tag, accuracy_pct, total_responses
  from mv_user_tag_performance
  where user_id = (select auth.uid())
  -- further filter to module tags if needed
$$;
```

---

## 8. Performance Considerations for Mobile

### 8.1 Index Summary

All indexes referenced above, consolidated:

```sql
-- Content navigation (very frequent)
create index idx_topics_module_id         on topics(module_id);
create index idx_lessons_topic_id         on lessons(topic_id);
create index idx_sections_lesson_id       on sections(lesson_id);
create index idx_questions_section_id     on questions(section_id) where section_id is not null;
create index idx_answer_options_question_id on answer_options(question_id);

-- Progress and streak queries
create index idx_lesson_attempts_user_lesson      on lesson_attempts(user_id, lesson_id);
create index idx_lesson_attempts_user_completed   on lesson_attempts(user_id, completed_at) where status = 'completed';
create index idx_question_responses_user_question on question_responses(user_id, question_id);
create index idx_question_responses_user_incorrect on question_responses(user_id, question_id) where is_correct = false;
create index idx_user_lesson_progress_user        on user_lesson_progress(user_id);
create index idx_activity_log_user_date           on user_activity_log(user_id, activity_date desc);

-- Readiness and weak areas
create index idx_readiness_user_topic   on user_readiness_scores(user_id, topic_id) where topic_id is not null;
create unique index on mv_user_tag_performance(user_id, tag);

-- Notes search
create index idx_notes_user_id on notes(user_id);
create index idx_notes_tags    on notes using gin(tags);
create index idx_notes_fts     on notes using gin(to_tsvector('english', coalesce(title,'') || ' ' || coalesce(content->>'blocks','')));
```

### 8.2 Home Screen Dashboard Query

The most common query. Instead of multiple round-trips, expose a single RPC function that returns everything the dashboard needs in one hit:

```sql
create or replace function get_dashboard(p_user_id uuid)
returns jsonb language plpgsql security definer as $$
declare
  v_result jsonb;
begin
  select jsonb_build_object(
    'streak',       row_to_json(s.*),
    'today_xp',     coalesce((
                      select sum(xp_earned)
                      from user_activity_log
                      where user_id = p_user_id and activity_date = current_date
                    ), 0),
    'weak_count',   (select count(*) from user_weak_lessons where user_id = p_user_id),
    'recent_lessons', (
                      select jsonb_agg(row_to_json(r.*))
                      from (
                        select l.title, ulp.last_score_pct, ulp.last_attempted_at
                        from user_lesson_progress ulp
                        join lessons l on ulp.lesson_id = l.id
                        where ulp.user_id = p_user_id
                        order by ulp.last_attempted_at desc
                        limit 5
                      ) r
                    )
  ) into v_result
  from user_streaks s
  where s.user_id = p_user_id;

  return v_result;
end;
$$;
```

### 8.3 Caching Strategy

| Data | Staleness Tolerance | Strategy |
|------|--------------------|----|
| Module/topic/lesson content | Hours | Supabase CDN cache headers via storage; client-side cache in React Query / Zustand |
| User progress summary | Seconds | Always fresh; update optimistically on client |
| Readiness score | Minutes | Recalculate after lesson completion; nightly decay job for the rest |
| Streak | Seconds | Always fresh — emotionally loaded, must be accurate |
| Weak areas (materialized view) | Minutes | Refresh after lesson completion; Supabase Realtime not needed |
| Dashboard data | 30 seconds | Cache in client with stale-while-revalidate |

### 8.4 Mobile Query Patterns

- **Paginate lesson lists** with `LIMIT 20 OFFSET ?` — never load all lessons in a topic at once
- **Select only needed columns** — never `select *` in production queries from the mobile client
- **Use Supabase's `.select('col1, col2, nested_table(col1)')`** to collapse multiple queries into one PostgREST call with foreign-key embedding
- **Avoid deep joins in RLS policies** — use `exists` subqueries or pre-computed columns instead of multi-table joins in `using` clauses

### 8.5 Supabase Realtime

Use Realtime sparingly — it has overhead. Enable it only for:
- `user_streaks` — streak displayed on every screen, must update live
- `lesson_attempts` — so a completion event triggers UI state change

Do not enable Realtime for: content tables, question_responses, readiness scores.

---

## Component Diagram

```
┌─────────────────────────────────────────────────────┐
│                    CONTENT (admin-managed)            │
│  modules → topics → lessons → sections               │
│                               └── questions          │
│                                     └── answer_options│
└──────────────────────┬──────────────────────────────┘
                       │ user studies
┌──────────────────────▼──────────────────────────────┐
│                  ACTIVITY (per-user)                  │
│  lesson_attempts ──→ question_responses              │
│       │                    │                         │
│       ▼                    ▼                         │
│  user_lesson_progress   user_activity_log            │
│       │                    │                         │
│       ▼                    ▼                         │
│  user_readiness_scores  user_streaks                 │
│  user_weak_lessons      (mv_user_tag_performance)    │
└──────────────────────────────────────────────────────┘
                       │ user writes
┌──────────────────────▼──────────────────────────────┐
│                    NOTES (per-user)                   │
│  notes (anchored to lesson | topic | section)        │
└─────────────────────────────────────────────────────┘
```

---

## Sources

- [Supabase Row Level Security Docs](https://supabase.com/docs/guides/database/postgres/row-level-security) — HIGH confidence
- [Supabase Index Management Docs](https://supabase.com/docs/guides/database/postgres/indexes) — HIGH confidence
- [Optimize Read Performance with Materialized Views in Supabase](https://dev.to/kovidr/optimize-read-performance-in-supabase-with-postgres-materialized-views-12k5) — MEDIUM confidence
- [SQL Streak Calculation with Window Functions](https://www.morgenstern-digital.de/postgresql/2023/04/23/streak-calculation-in-postgresql.html) — MEDIUM confidence
- [SQL Story of Unbroken Chains (Streaks)](https://dev.to/keyridan/sql-story-of-unbroken-chains-of-events-streaks-3lh3) — MEDIUM confidence
- [Anki SM-2 SRS Algorithm](https://juliensobczak.com/inspect/2022/05/30/anki-srs/) — MEDIUM confidence (readiness decay logic)
- [LMS Structure and Schema Diagram](https://databasesample.com/database/lms) — LOW confidence (general reference)
- [Supabase RLS Deep Dive — DEV Community](https://dev.to/blackie360/-enforcing-row-level-security-in-supabase-a-deep-dive-into-lockins-multi-tenant-architecture-4hd2) — MEDIUM confidence
