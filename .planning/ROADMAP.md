# Roadmap: Druip Web App

**Milestone:** v2.0 — Real Platform
**Target:** Fully working Next.js web app wired to real Supabase data
**Phases:** 7

| # | Phase | Goal | Requirements | Success Criteria |
|---|-------|------|--------------|-----------------|
| 1 | real-dashboard | 1/2 | In Progress|  |
| 2 | tutor-onboarding | Tutor signup + create classroom | TUTOR-01–04 | Tutor can sign up, create classroom, see it in their dashboard |
| 3 | classroom-builder | Tutor builds sections + content cards | TUTOR-05–06 | Tutor can add sections and cards; content appears in DB |
| 4 | student-discovery | Browse classrooms + subscribe | STUD-01–05 | Student can browse, view detail, subscribe; locked/unlocked states work |
| 5 | study-content | View all card types in classroom | CONT-01–04 | Student can read notes, view PDFs, images, flip flashcards |
| 6 | messaging | Student ↔ tutor DM | MSG-01–03 | Student can send message; tutor can reply; inbox shows threads |
| 7 | profile | Profile edit + sign out | PROF-01–02 | Student can edit profile; sign out works and redirects to landing |

---

## Phase Details

### Phase 1: real-dashboard
**Goal:** Replace all placeholder data on the home dashboard with real Supabase queries and proper empty states.
**Requirements:** DASH-01, DASH-02, DASH-03, DASH-04
**Stitch screen:** `home_dashboard/code.html`
**Plans:** 1/2 plans executed
Plans:
- [x] 01-01-PLAN.md — Wire Supabase queries and replace hardcoded data with real data + empty states
- [ ] 01-02-PLAN.md — Human verification of dashboard visual and functional correctness
**Success criteria:**
1. New user sees empty state (no classrooms, no streak, no tutors) — not fake data
2. Greeting shows real first name from auth
3. Streak shows real `profiles.streak_count` (0 by default)
4. "Tutors of the Week" queries real tutors table; shows empty state if none
5. "Continue Learning" queries real subscriptions; shows empty state if none

### Phase 2: tutor-onboarding
**Goal:** Tutor can sign up, complete profile, and create their first classroom.
**Requirements:** TUTOR-01, TUTOR-02, TUTOR-03, TUTOR-04
**Stitch screens:** `become_a_tutor/`, `tutor_onboarding_personal/`, `tutor_onboarding_classroom_setup/`, `tutor_dashboard/`
**Success criteria:**
1. Sign-up page has "I want to teach" toggle
2. Selecting tutor role routes to tutor onboarding flow
3. Tutor profile saved to `tutors` table in Supabase
4. Classroom created in `classrooms` table with name, description, price
5. Tutor dashboard shows their classroom and 0 subscribers

### Phase 3: classroom-builder
**Goal:** Tutor can build out their classroom with sections and content cards.
**Requirements:** TUTOR-05, TUTOR-06
**Stitch screens:** `classroom_builder/`, `section_detail/`, `add_content_picker/`, `add_flashcard/`
**Success criteria:**
1. Tutor can add/reorder/delete sections
2. Tutor can add text note, PDF, image, link, flashcard cards to a section
3. Cards persist in `classroom_cards` table
4. Tutor sees their content immediately after adding

### Phase 4: student-discovery
**Goal:** Student can browse classrooms, view details, and subscribe.
**Requirements:** STUD-01, STUD-02, STUD-03, STUD-04, STUD-05
**Stitch screens:** `browse_classrooms/`, `classroom_detail/`, `subscribe_confirmation/`, `subscription_success/`
**Success criteria:**
1. Browse page lists all classrooms from DB
2. Classroom detail shows tutor info, section list, price
3. Subscribe button creates row in `subscriptions` table
4. Non-subscriber sees locked content overlay
5. Subscriber sees full content

### Phase 5: study-content
**Goal:** Subscribed student can consume all content card types.
**Requirements:** CONT-01, CONT-02, CONT-03, CONT-04
**Stitch screens:** `study_session_flashcards/`, `pdf_viewer/`, `past_paper_viewer/`
**Success criteria:**
1. Text notes render with formatting
2. PDFs open in-browser viewer
3. Images display full-size
4. Flashcards flip on tap/click

### Phase 6: messaging
**Goal:** Students and tutors can DM each other inside a classroom.
**Requirements:** MSG-01, MSG-02, MSG-03
**Stitch screens:** `dm_with_tutor/`, `messages/`, `tutor_inbox/`
**Success criteria:**
1. Student can send message from classroom detail page
2. Tutor sees message in their inbox
3. Both can reply; messages persist in `messages` table
4. Inbox shows all conversations with last message preview

### Phase 7: profile
**Goal:** Users can view/edit their profile and sign out.
**Requirements:** PROF-01, PROF-02
**Stitch screens:** `profile/`, `student_settings/`
**Success criteria:**
1. Profile shows name, university, degree, year from `student_profiles`
2. User can edit and save profile fields
3. Sign out clears session and redirects to landing page

---
*Roadmap created: 2026-04-09*
*Milestone: v2.0 Real Platform*
