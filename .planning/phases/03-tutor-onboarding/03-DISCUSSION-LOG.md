# Phase 3: Tutor Onboarding - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions captured in CONTEXT.md — this log preserves the discussion.

**Date:** 2026-04-06
**Phase:** 03-tutor-onboarding
**Mode:** discuss
**Areas discussed:** Sign-up toggle placement, Tutor post-sign-up flow, Classroom creation form, Tutor navigation

## Assumptions Presented

| Area | Question | Options presented |
|------|----------|-------------------|
| Sign-up toggle | Where does "I want to teach" appear? | On sign-up screen / Separate screen after / Goal-selection screen |
| Tutor flow | Where does tutor land after sign-up? | Straight to classroom creation / Welcome screen first / Main app + setup prompt |
| Create classroom | Single form or multi-step? | Single scrollable form / Two-step / Card-by-card |
| Subjects | How are subjects entered? | Free-text tags / Predefined list / Single text input |
| Tutor nav | Where does tutor manage classroom? | Profile tab → My Classroom / Dedicated Classroom tab / Tutor home screen |

## Decisions Made

### Sign-up toggle placement
- **User selected:** On the sign-up screen (recommended)
- Toggle below email/password fields. No new screen for intent capture.

### Tutor post-sign-up flow
- **User selected:** Straight into classroom creation (recommended)
- Skip goal-selection entirely. Tutors go directly to classroom creation form.

### Classroom creation form
- **User selected:** Single scrollable form (recommended)
- All fields on one screen: name, subjects, bio, price.

### Subjects input
- **User selected:** Free-text tags (recommended)
- Type + Add button or return key. Multiple removable tag chips.

### Tutor navigation
- **User selected:** Profile tab becomes "My Classroom" (recommended)
- Conditional Profile screen content based on tutor status. Same 5-tab nav for everyone.

## Corrections Made

No corrections — all recommended options accepted.
