# Druip

## What This Is

Druip is a tutor marketplace for South African university students. Tutors create classrooms with structured sections and study materials (notes, PDFs, images, links). Students subscribe for monthly access and can DM the tutor directly. Think Skool — but purpose-built for SA university students.

## Core Value

A student opens Druip, finds their tutor's classroom, and has everything they need to pass their test in one place.

## Current Milestone: v1.0 Tutor Marketplace

**Goal:** Build a Skool-like platform where tutors create structured classrooms and students subscribe for monthly access.

**Target features:**
- Tutor signup via "I want to teach" toggle on existing auth flow
- Tutor creates classroom: name, subjects, bio, price (default R180/month)
- Tutor builds classroom sections (e.g. "Chapter 1", "Upcoming Tests", "Past Papers")
- Tutor adds material cards per section: text notes, PDFs, images, links
- Student discovery: browse classrooms, view detail page, subscribe CTA (UI placeholder)
- Subscriber gets full classroom access; non-subscriber sees locked preview
- 1-on-1 DM between student and tutor (inside the classroom)

## Requirements

### Validated

- ✓ Auth (email/password sign-up, session persistence, offline handling) — Phase 1
- ✓ Navigation shell (5-tab bottom navigator, Expo Router) — Phase 1
- ✓ Supabase schema + RLS — Phase 1

### Active

See REQUIREMENTS.md for full v1.0 requirements with REQ-IDs.

### Out of Scope

- Real payment processing — deferred to v1.1 (subscribe button is UI placeholder in v1.0)
- Community/group posts — future; v1.0 is 1-on-1 DM only
- Live sessions / video calls — high complexity, deferred
- Gamification / quiz engine — pivoted away from Duolingo model
- Leaderboards, XP, streaks — deferred; not core to marketplace
- Multi-tutor classroom / co-teaching — single tutor per classroom for v1.0
- Push notifications — not needed to validate core marketplace
- Creator analytics dashboard — deferred to post-validation
- OAuth / social login — email/password sufficient

## Context

- **Target market**: South African university students; first tutor is Sharone at NWU Potchefstroom
- **Platform**: React Native / Expo SDK 54 + Supabase — unchanged
- **Model**: Tutor creates classroom → students subscribe (R180/month default) → Druip takes platform %
- **Stage**: Foundation built (Phase 1 complete); pivot from Duolingo quiz engine to tutor marketplace
- **Build approach**: UI-first — screens and navigation before backend wiring; payments in v1.1
- **Brand feel**: Soft, calm, slightly playful, distinctly South African — not corporate edu-tech

## Constraints

- **Stack**: React Native / Expo + Supabase — decided, not up for debate
- **Scope**: Single-tutor classrooms, UI-only subscriptions for v1.0
- **Brand**: Must NOT feel like a typical "edu-tech" product
- **Validation first**: Prove tutors and students use it before adding payments

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| React Native / Expo over web-first | Students are mobile-first; SA university students primarily use phones | ✓ Good |
| Supabase over Firebase | Postgres gives better relational model; auth + realtime included | ✓ Good |
| expo-sqlite for session storage | Avoids documented AsyncStorage offline session-loss bug | ✓ Good |
| Pivot from Duolingo quiz to tutor marketplace | Faster path to revenue; tutors create own content; easier demand validation | — Pending |
| UI-first build for v1.0 | Validate UX and flow before investing in payment integration | — Pending |
| Payments deferred to v1.1 | Reduces scope; subscribe button as UI placeholder validates intent | — Pending |
| Phase 2 quiz engine deprioritized | Marketplace pivot makes the quiz flow secondary; can re-add later | — Pending |

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
*Last updated: 2026-04-06 after pivot to tutor marketplace (v1.0 milestone start)*
