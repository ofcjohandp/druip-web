# Druip

## What This Is

Druip is a tutor marketplace web app for South African university students. Tutors create classrooms with structured study materials. Students subscribe for monthly access and DM their tutor directly. Built as a Next.js 14 web app with all screens designed in Stitch.

## Core Value

A student opens Druip, finds their tutor's classroom, and has everything they need to pass their test in one place.

## Current Milestone: v2.0 druip-web Real Platform

**Goal:** Build a fully working Next.js web app from the 55 Stitch screens, wired to real Supabase data end-to-end — no placeholder data anywhere.

**Target features:**
- Home dashboard wired to real Supabase data with proper empty states
- Tutor onboarding flow (creates real classroom in DB)
- Student browse classrooms + subscribe flow
- Classroom detail + study content (cards, PDFs, notes)
- Direct messaging (student ↔ tutor)
- Profile + settings screens

## Requirements

### Validated

- ✓ Auth (email/password sign-up, sign-in, session persistence) — Phase 1 / Session 1
- ✓ Landing page, sign-up, sign-in, home dashboard shell — Session 1
- ✓ Supabase schema (profiles, classrooms, sections, cards, subscriptions, messages) — RN app

### Active

See REQUIREMENTS.md for full v2.0 requirements with REQ-IDs.

### Out of Scope

- Real payment processing — deferred to v2.1
- Mobile app — web-first, React Native shelved
- OAuth / social login — email/password sufficient for v2.0
- Push notifications — deferred
- Leaderboards, XP, streaks — deferred
- Live video sessions — high complexity, deferred
- Quiz/test engine — not core to marketplace v2.0

## Context

- **Platform**: Next.js 14 App Router + Tailwind CSS + Supabase
- **Design**: 55 screens in `stitch_druip_tutor_app_redesign/` — pixel-perfect source of truth
- **Supabase project**: `vpmrgidheamgerimkaox` — schema already exists from RN app
- **Deployed**: https://druip-web.vercel.app
- **Target market**: SA university students; first tutor Sharone at NWU Potchefstroom
- **Brand**: "The Academic Catalyst" — electric blue #0058bb, playful, high-energy, distinctly SA

## Constraints

- **Stack**: Next.js 14 + Tailwind + Supabase — not up for debate
- **Design**: All screens must match Stitch HTML exactly — no creative deviation
- **Data**: No hardcoded/placeholder data — every screen shows real DB data or a proper empty state
- **Payments**: Deferred to v2.1 — subscribe flow is UI-complete but payment not wired

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js 14 App Router | SEO, SSR, server components for auth-gated pages | ✓ Good |
| Stitch HTML as pixel-perfect source | 55 screens already designed, no redesign needed | ✓ Good |
| Supabase SSR (@supabase/ssr) | Cookie-based auth for Next.js server components | ✓ Good |
| Vercel deployment | Zero-config Next.js hosting | ✓ Good |
| Real data from day one | No mockups — empty states instead of fake data | ✓ Good |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition:**
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone:**
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-09 after v2.0 milestone start*
