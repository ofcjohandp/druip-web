# Druip Web App — Next Steps

## Where We Are

All 55 screens designed in Stitch. Exported to `stitch_druip_tutor_app_redesign/`. Design is complete and production-ready.

## What To Build

A Next.js 14 web app that takes all the Stitch HTML screens and turns them into a fully working product connected to Supabase.

## Stack

- **Framework:** Next.js 14 (App Router, TypeScript)
- **Styling:** Tailwind CSS with Stitch design tokens
- **Backend:** Supabase (existing project — ref: `ciwjpxqqqvbaapsjfypj`)
- **Payments:** PayFast
- **Hosting:** Vercel

## Credentials Needed

Before building, get these from Supabase dashboard → Settings → API:

- `NEXT_PUBLIC_SUPABASE_URL` → `https://ciwjpxqqqvbaapsjfypj.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → anon public key (long JWT string)

## Build Order

### Session 1 — Foundation (do this next)
- Scaffold `druip-web/` Next.js app
- Tailwind config with all Stitch color tokens (primary #0058bb, surfaces, etc)
- Google Fonts: Plus Jakarta Sans + Be Vietnam Pro
- Supabase client setup (browser + server)
- Landing page → matching `onboarding/code.html`
- Sign up → matching `almost_in_sign_up/code.html` — wired to Supabase auth
- Sign in → matching `sign_in/code.html` — wired to Supabase auth
- Home dashboard → matching `home_dashboard/code.html` — protected route
- Auth middleware
- Deploy to Vercel — get live URL

### Session 2 — Student Flow
- Onboarding flow (your_path → set_focus → meet_your_tutors)
- Browse classrooms
- Classroom detail
- Subscribe confirmation → payment → success

### Session 3 — Study Engine
- Flashcards
- PDF viewer
- Past paper viewer
- Session recordings + player
- Study timer

### Session 4 — Tutor Side
- Tutor onboarding (all 5 steps)
- Tutor dashboard
- Classroom builder + section detail
- Student roster + individual progress view
- Quiz builder + test roster

### Session 5 — Messaging + Notifications
- Student inbox + DM
- Tutor inbox + broadcast composer
- Notifications screen

### Session 6 — Gamification + Polish
- Study planner (add test → generated plan)
- Leaderboard
- Achievement wall + unlocked celebration
- Weekly study report
- Profile + settings

## Design Source

All screens are in: `stitch_druip_tutor_app_redesign/`

Each folder has:
- `screen.png` — visual reference
- `code.html` — exact HTML/Tailwind to replicate

Design system: `stitch_druip_tutor_app_redesign/druip_solar_energy/DESIGN.md`

## Key Design Tokens (from Stitch HTML)

```js
colors: {
  "primary": "#0058bb",
  "primary-container": "#6c9fff",
  "background": "#f5f6f7",
  "surface-container-lowest": "#ffffff",
  "surface-container-low": "#eff1f2",
  "surface-container": "#e6e8ea",
  "surface-container-high": "#e0e3e4",
  "secondary-container": "#ffca4d",
  "tertiary-container": "#ff9475",
}
```

Fonts: `Plus Jakarta Sans` (display/headings) + `Be Vietnam Pro` (body)

## Supabase Schema (already built)

Tables already exist from the React Native app:
- `profiles` (id, email, full_name, is_tutor, streak_count, total_xp)
- `classrooms` (id, tutor_id, name, description, price_cents)
- `classroom_sections` (id, classroom_id, title, sort_order)
- `classroom_cards` (id, section_id, card_type, content, title)
- `subscriptions` (id, student_id, classroom_id, status)
- `messages` (id, classroom_id, sender_id, content)
- `student_profiles` (id, university, degree, year, subject_tags)

Migrations already pushed: 00016, 00017, 00018

## To Resume

1. Open Claude Code in `/Users/johanduplessis/Desktop/Claude Code/Druip`
2. Run `/prime` to load context
3. Provide Supabase anon key
4. Say "Build Session 1 of druip-web"
