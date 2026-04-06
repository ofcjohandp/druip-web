# Druip

## What This Is

Druip is a gamified study system for South African university students that turns overwhelming, scattered academic material into a structured, clear, and motivating learning experience. The MVP targets NWU Potchefstroom physiotherapy students, covering one module, with a Duolingo-style study flow built on React Native / Expo and Supabase.

## Core Value

A student opens Druip and feels calmer, clearer, and more in control — not confused, overloaded, or lost.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Students can sign up and log in with email/password, with sessions persisting across app restarts
- [ ] Module content is structured into Topics → Lessons → Sections with clean, simple summaries
- [ ] Students move through a Duolingo-style study flow: read summary → answer questions → get instant feedback → see explanations → progress forward
- [ ] Questions are primarily multiple choice with immediate correct/incorrect feedback and explanation
- [ ] Dashboard shows: today's study focus, streak, average score, weak areas, and module progress
- [ ] Readiness system tracks performance per topic and shows "You're X% ready for this test" with weak area highlights
- [ ] Students can create structured notes inside the app (key concepts, summaries, important points)
- [ ] Streaks and progress bars provide momentum and encouragement without feeling like pressure
- [ ] UI feels soft, clean, rounded, and calming — breathing space, not a dashboard of graphs
- [ ] All content for NWU Potchefstroom physiotherapy module is seeded and ready before first student onboards
- [ ] AI-assisted content creation pipeline (Claude generates lesson content, summaries, and questions for review)

### Out of Scope

- Multi-university / multi-course support — focus on NWU Potchefstroom physiotherapy only for MVP
- Video lessons — high bandwidth, high complexity, deferred to post-validation
- Tutor-led content — future expansion after core product is validated
- Social features (leaderboards, sharing) — adds complexity, not core to calm/structured feel
- Native Android / iOS separate codebases — Expo handles cross-platform
- OAuth / social login — email/password sufficient for MVP
- In-app payments / subscriptions — validate engagement before monetizing
- Flashcard mode — notes-to-flashcards connection is a v2 feature
- Push notifications — not needed to validate core study flow

## Context

- **Target market**: South African university students, starting with NWU Potchefstroom physiotherapy students as the initial narrow focus
- **Platform**: React Native / Expo for cross-platform mobile (iOS + Android)
- **Backend**: Supabase (PostgreSQL + Auth + Realtime) — low ops overhead, fast to build against
- **Content creation**: AI-assisted (Claude drafts lessons, summaries, questions; Johan reviews and approves)
- **Go-to-market**: Build-in-public approach via TikTok and Instagram to validate demand and build community before launch
- **Brand feel**: Soft, calm, slightly playful, distinctly South African — "journaling meets studying" not "enterprise dashboard"
- **Stage**: Greenfield — pre-build, concept validated through product thinking, no code written yet

## Constraints

- **Scope**: Single university, single course, single module for MVP — no scope creep before validation
- **Stack**: React Native / Expo + Supabase — decided, not up for debate during MVP phase
- **Brand**: Must NOT feel like a typical "edu-tech" product — no heavy dark UI, no graph-heavy dashboards, no corporate tone
- **Content**: All module content must be ready before first student uses the app — can't onboard to empty shell
- **Validation first**: Do not build v2 features (payments, social, multi-course) before proving students return daily

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| React Native / Expo over web-first | Students are mobile-first; SA university students primarily use phones | — Pending |
| Supabase over Firebase | Postgres gives better relational data model for structured content hierarchy; auth + realtime included | — Pending |
| NWU Potchefstroom physiotherapy as first module | Narrow focus ensures depth and quality; easier to get feedback from a specific group | — Pending |
| AI-assisted content creation | Speed without sacrificing quality — Claude drafts, Johan approves | — Pending |
| Build-in-public strategy | Validates demand, builds community, attracts early users before launch | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-06 after initialization*
