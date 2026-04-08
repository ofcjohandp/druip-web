# Roadmap: Druip

**Milestone:** v1.0 — Tutor Marketplace
**Target:** Tutors can create classrooms; students can discover, subscribe (UI), and message tutors
**Phases:** 7 (1 complete, 2 deprioritized, 3-7 active)

---

## Phases

- [x] **Phase 1: Foundation** — Auth, navigation shell, Supabase schema, 5-tab navigator (COMPLETE)
- [-] **Phase 2: Study Flow** — Quiz engine (DEPRIORITIZED — marketplace pivot)
- [ ] **Phase 3: Tutor Onboarding** — "I want to teach" toggle, tutor profile, classroom creation and editing
- [ ] **Phase 4: Classroom Builder** — Sections management, material cards (text, PDF, image, link)
- [ ] **Phase 5: Student Discovery and Subscriptions** — Browse classrooms, detail page, locked preview, subscribe CTA, subscribed classroom list
- [ ] **Phase 6: Direct Messaging** — 1-on-1 DM between subscribed student and tutor
- [ ] **Phase 7: Student Onboarding** — Post-signup profile setup: details, university, degree, subject tags, help type, upcoming test

---

## Phase Details

### Phase 1: Foundation

**Goal:** A new or returning user can open the app, create an account, and land on a functional 5-tab navigation shell — with the entire Supabase schema and RLS policies in place.

**Depends on:** Nothing (first phase)

**Requirements:** AUTH (Phase 1 scope — see original roadmap)

**Success Criteria** (what must be TRUE):
  1. User can register with email and password; re-opening the app restores their session
  2. Authenticated user lands on home tab; unauthenticated user sees onboarding
  3. App shows login screen (not crash) when launched offline with no session
  4. 5-tab bottom navigator is present and navigable; RLS is enabled on every public table

**Plans**: 4/4 plans executed (COMPLETE)

**Status**: COMPLETE

---

### Phase 2: Study Flow

**Goal:** (DEPRIORITIZED — marketplace pivot supersedes this work)

**Depends on:** Phase 1

**Requirements:** STUDY, PROG scope from original milestone

**Success Criteria**: N/A — deprioritized

**Plans**: 3/4 plans partially executed (DEPRIORITIZED)

**Status**: DEPRIORITIZED

---

### Phase 3: Tutor Onboarding

**Goal:** A user can register as a tutor and create a published classroom that is ready to receive sections and students.

**Depends on:** Phase 1

**Requirements:** TUTR-01, TUTR-02, TUTR-03, TUTR-04

**Success Criteria** (what must be TRUE):
  1. A user can toggle "I want to teach" during sign-up and land in a tutor-specific flow rather than the student home screen
  2. A tutor can create a classroom by entering a name, subject(s), bio, and monthly price — the classroom appears in the system after creation
  3. Subscription price defaults to R180/month and is visible and editable before the tutor saves
  4. A tutor can return to classroom settings and change the name, bio, subjects, or price; changes are reflected immediately

**Plans**: 4 plans

Plans:
- [x] 03-01-PLAN.md — Schema migration (is_tutor, tutors, classrooms tables + RLS), TypeScript types, Wave 0 test stubs
- [x] 03-02-PLAN.md — Sign-up toggle, create-classroom screen, tutor hooks, root guard fix
- [x] 03-03-PLAN.md — Profile tab conditional tutor view, classroom settings screen, edit hooks
- [x] 03-04-PLAN.md — End-to-end verification checkpoint (all TUTR requirements)

**UI hint**: yes

---

### Phase 4: Classroom Builder

**Goal:** A tutor can build the full content structure of their classroom — named sections in any order, with text, PDF, image, and link cards inside each section.

**Depends on:** Phase 3

**Requirements:** CLASS-01, CLASS-02, CLASS-03, CARD-01, CARD-02, CARD-03, CARD-04, CARD-05

**Success Criteria** (what must be TRUE):
  1. A tutor can create multiple named sections (e.g. "Chapter 1", "Past Papers") within their classroom
  2. A tutor can rename, delete, and reorder sections — the updated order persists after the tutor leaves and returns
  3. A tutor can add a text note, PDF/file, image, or external link as a card inside any section
  4. A tutor can delete any card; the section updates immediately without requiring a page reload
  5. A classroom with at least one section and one card is fully browsable from the tutor's management view

**Plans**: 3 plans

Plans:
- [x] 04-01-PLAN.md — Schema migration (classroom_sections + classroom_cards tables, RLS, Storage bucket), TypeScript types, Expo package install
- [x] 04-02-PLAN.md — Section management hooks, SectionRow component, ManageClassroom screen, profile.tsx route update
- [x] 04-03-PLAN.md — Card hooks, upload utility, CardListItem, AddCardBottomSheet, wire cards into ManageClassroom, end-to-end checkpoint

**UI hint**: yes

---

### Phase 5: Student Discovery and Subscriptions

**Goal:** A student can find a tutor's classroom, see what is inside it, and subscribe (UI placeholder) to unlock full access — and can view all their subscribed classrooms in one place.

**Depends on:** Phase 4

**Requirements:** DISC-01, DISC-02, DISC-03, DISC-04, SUB-01, SUB-02, SUB-03

**Success Criteria** (what must be TRUE):
  1. A student can browse a discovery screen listing all available classrooms with tutor name, subject, and price visible
  2. A student can tap any classroom and see a detail page with tutor bio, subjects, price, and a preview of section names
  3. A non-subscriber sees section content locked with a visual indicator and a subscribe CTA showing the price (e.g. "Subscribe · R180/month")
  4. A student can tap subscribe, see a confirmation screen, and gain full access to all sections and cards without a real payment
  5. A student can navigate to a screen listing all their subscribed classrooms

**Plans**: 5 plans

Plans:
- [x] 05-P00-PLAN.md — Schema migration (subscriptions table + RLS, classrooms public SELECT policy), TypeScript types, Wave 0 test stubs
- [x] 05-P01-PLAN.md — TanStack Query hooks: useAllClassrooms, useClassroomDetail, useMySubscriptions, useSubscribe
- [x] 05-P02-PLAN.md — UI components: ClassroomCard, LockedContentOverlay; register classroom-detail + subscribe-confirm in _layout.tsx
- [x] 05-P03-PLAN.md — Screens: Home/Discovery (index.tsx), classroom-detail.tsx, subscribe-confirm.tsx
- [ ] 05-P04-PLAN.md — End-to-end verification checkpoint (all DISC + SUB requirements)

**UI hint**: yes

---

### Phase 6: Direct Messaging

**Goal:** A subscribed student can send messages to their tutor and read replies in a chat-style thread — and the tutor can respond from their side.

**Depends on:** Phase 5

**Requirements:** MSG-01, MSG-02, MSG-03

**Success Criteria** (what must be TRUE):
  1. A subscribed student can open a DM screen from inside a classroom and send a text message to the tutor
  2. A tutor can see incoming messages from each subscribed student and send a reply
  3. Both student and tutor can scroll through the full message history in chronological order in a chat-style UI

**Plans**: 3 plans

Plans:
- [x] 06-01-PLAN.md — Schema migration (messages table + RLS), TypeScript types, Wave 0 test stubs, schema push
- [x] 06-02-PLAN.md — TanStack Query hooks (useMessages, useSendMessage, useClassroomSubscribers, useTutorUserId) + UI components (MessageBubble, ChatInput, SubscriberRow)
- [x] 06-03-PLAN.md — dm-chat screen, route registration, classroom-detail "Message tutor" button, manage-classroom Messages section

**UI hint**: yes

---

### Phase 7: Student Onboarding

**Goal:** After sign-up, a student completes a 6-step profile flow — collecting their name/photo, university/campus, degree/year, subject tags, help type, and an optional upcoming test date — before landing on a personalized tutor marketplace filtered by their subject tags.

**Depends on:** Phase 5

**Requirements:** ONBD-01, ONBD-02, ONBD-03, ONBD-04, ONBD-05, ONBD-06, ONBD-07, ONBD-08

**Success Criteria** (what must be TRUE):
  1. A newly signed-up student sees the onboarding flow (not the marketplace) until all required steps are complete
  2. Student can enter first name, surname, and optionally upload a profile photo
  3. Student can select university and campus from a pre-populated list
  4. Student can select degree/programme and year of study
  5. Student can pick subject tags (multi-select) drawn from the live subject_tags table — the same tags tutors use when creating classrooms
  6. Student can select what kind of help they need (multi-select) and optionally add a test date
  7. After completing onboarding, the marketplace shows only tutors whose classroom tags match the student's subject tags
  8. Returning students who completed onboarding bypass the flow and land directly on the marketplace

**Plans**: 4 plans

Plans:
- [x] 07-P00-PLAN.md — Schema migration (subject_tags, classroom_subject_tags, student_profiles, student_subject_tags + RLS + data migration), TypeScript types, Wave 0 test stubs
- [x] 07-P01-PLAN.md — TanStack Query hooks (useSubjectTags, useStudentProfile, useUpsertStudentProfile, useStudentSubjectTags), useAuthStore pendingStudentOnboarding flag, useAllClassrooms tag filtering
- [ ] 07-P02-PLAN.md — 6 onboarding UI screens, shared components (TagBubbleSelect, OnboardingProgress), auth layout + sign-up redirect + root guard updates
- [ ] 07-P03-PLAN.md — End-to-end verification checkpoint (all ONBD requirements)

**UI hint**: yes

---

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 4/4 | Complete | 2026-04-06 |
| 2. Study Flow | 3/4 | Deprioritized | - |
| 3. Tutor Onboarding | 0/4 | Planned | - |
| 4. Classroom Builder | 4/4 | Complete | 2026-04-06 |
| 5. Student Discovery and Subscriptions | 3/5 | In Progress|  |
| 6. Direct Messaging | 0/3 | Planned | - |
| 7. Student Onboarding | 0/4 | Planned | - |

---

## Traceability

All 30 v1.0 requirements are mapped to phases 3-7.

| Requirement | Phase | Status |
|-------------|-------|--------|
| TUTR-01 | Phase 3 | Pending |
| TUTR-02 | Phase 3 | Pending |
| TUTR-03 | Phase 3 | Pending |
| TUTR-04 | Phase 3 | Pending |
| CLASS-01 | Phase 4 | Pending |
| CLASS-02 | Phase 4 | Pending |
| CLASS-03 | Phase 4 | Pending |
| CARD-01 | Phase 4 | Pending |
| CARD-02 | Phase 4 | Pending |
| CARD-03 | Phase 4 | Pending |
| CARD-04 | Phase 4 | Pending |
| CARD-05 | Phase 4 | Pending |
| DISC-01 | Phase 5 | Pending |
| DISC-02 | Phase 5 | Pending |
| DISC-03 | Phase 5 | Pending |
| DISC-04 | Phase 5 | Pending |
| SUB-01 | Phase 5 | Pending |
| SUB-02 | Phase 5 | Pending |
| SUB-03 | Phase 5 | Pending |
| MSG-01 | Phase 6 | Pending |
| MSG-02 | Phase 6 | Pending |
| MSG-03 | Phase 6 | Pending |
| ONBD-01 | Phase 7 | Pending |
| ONBD-02 | Phase 7 | Pending |
| ONBD-03 | Phase 7 | Pending |
| ONBD-04 | Phase 7 | Pending |
| ONBD-05 | Phase 7 | Pending |
| ONBD-06 | Phase 7 | Pending |
| ONBD-07 | Phase 7 | Pending |
| ONBD-08 | Phase 7 | Pending |

**Coverage:** 30/30 v1.0 requirements mapped. No orphans.
