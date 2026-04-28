# Phase 9: UI Overhaul - Discussion Log (Assumptions Mode)

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions captured in CONTEXT.md — this log preserves the analysis.

**Date:** 2026-04-08
**Phase:** 09-ui-overhaul
**Mode:** assumptions
**Areas analyzed:** Design System, Component Architecture, Screen Layout Patterns, Navigation & Visual Identity, Interaction & Animation

## Assumptions Presented

### Design System (Typography & Color)
| Assumption | Confidence | Evidence |
|------------|-----------|----------|
| Custom font via expo-font + new color palette, all in theme.ts | Confident | theme.ts comment: "No custom font import for MVP" — lifts in Phase 9 |
| Coral accent replaced with multi-token bolder palette | Likely | Entire visual identity on one token; screens like subscribe-confirm nearly monochrome |

### Component Architecture
| Assumption | Confidence | Evidence |
|------------|-----------|----------|
| All shared components in src/features/ui/, inline implementations migrated | Confident | sign-in.tsx, sign-up.tsx, ClassroomCard.tsx all define own inline styles |
| Button gains loading prop + icon slot | Likely | subscribe-confirm.tsx disables button with no visible spinner |

### Screen Layout Patterns
| Assumption | Confidence | Evidence |
|------------|-----------|----------|
| Auth screens get branded header/logo zone | Likely | sign-in/sign-up start with plain fontSize: 28 text |
| Onboarding layout preserved; only visual upgrades | Confident | step-2-university.tsx has strongest structure; functional and validated |

### Navigation & Visual Identity
| Assumption | Confidence | Evidence |
|------------|-----------|----------|
| Tab bar stays as Expo Router Tabs + Ionicons | Likely | _layout.tsx uses standard screenOptions only; custom tabBarComponent is non-trivial |

### Interaction & Animation
| Assumption | Confidence | Evidence |
|------------|-----------|----------|
| Press feedback upgraded to Reanimated scale transforms | Likely | Every screen uses activeOpacity 0.7-0.8; Reanimated already installed |

## Corrections Made

None — all assumptions confirmed by user.

## User Design Direction

- **SA visual identity:** Yoco/Superbalist energy confirmed
  - Deep warm amber or terracotta primary
  - Electric coral accent
  - Off-white/cream surfaces
  - Near-black text
  - Feel: bold, premium, African warmth
