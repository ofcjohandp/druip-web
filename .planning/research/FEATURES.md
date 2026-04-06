# Feature Landscape: Druip — Duolingo-Style Study Platform

**Domain:** Gamified study / spaced-repetition learning app for South African university students
**Researched:** 2026-04-06
**Confidence:** HIGH (Duolingo mechanics, Khan Academy mastery, onboarding patterns) / MEDIUM (notes, dashboard)

---

## 1. Study Flow: Lesson → Question → Feedback Loop

### How it works in top apps

Duolingo, Khan Academy, and Quizlet all share a three-phase lesson structure, but they implement it differently. Understanding the pattern matters more than copying any single app.

**Phase 1 — Lesson container**

A lesson is a fixed-length session of 10–20 questions around a single topic or skill. Duolingo defaults to roughly 15 questions per lesson. The session has a clear start and end — the learner knows "I am in a lesson" and "I finished a lesson." This container is important: it gives the session a sense of shape. Open-ended study without an endpoint is fatiguing.

**Phase 2 — Question presentation**

Questions appear one at a time. There is no scrolling list of 20 questions on a single screen. Each question occupies the full viewport. The question type (multiple choice, fill-in, matching) may vary within a lesson to reduce monotony. Duolingo uses 5–7 question types across a lesson. The question counter ("3 of 15") or a progress bar at the top tells the learner where they are in the session.

**Phase 3 — The feedback loop**

This is the most important phase and the most commonly botched one.

The pattern that works:

1. Learner selects an answer.
2. The interface locks immediately — no further changes allowed.
3. Color change + sound fires within 100–200ms (green for correct, red for incorrect).
4. A feedback panel slides up from the bottom (or replaces the answer area):
   - Correct: show a brief reinforcing phrase ("Correct!" or "Nice one!") + the correct answer if it wasn't obvious.
   - Incorrect: show "Correct answer:" with the right option highlighted, plus 1–2 sentences of explanation.
5. The learner manually taps "Continue" to advance. Auto-advance should NOT happen on wrong answers — the learner needs a moment to process the explanation.
6. On the final question, transition to a lesson-complete screen.

**What goes wrong when developers skip steps:**

- Auto-advance after wrong answers: learners never read the explanation, the feedback loop breaks, retention drops.
- Showing all answer options as red/green simultaneously: cognitive overload — learners don't know where to look first.
- Delaying color feedback by more than 500ms: the action-feedback link feels disconnected.

**The lesson-complete screen**

This screen is worth building carefully. It should:
- Display XP or points earned in a large, satisfying number
- Show the streak status (maintained or extended)
- Offer a single clear next action ("Continue" to next lesson, or "Return home")
- Optionally show a fun stat like "You got 12/15 correct" or "You're 40% through this module"

Duolingo adds confetti animation on this screen. The emotional payoff of completing a lesson is a retention driver — do not skip it.

---

## 2. Multiple Choice Question UX

### What works

**Option layout:** 2–4 options maximum on mobile. Four is the practical ceiling. More than four options requires scrolling or tiny tap targets, both of which break flow. For mobile-first (which Druip is, given South African students' device distribution), four large tap-target options stacked vertically is the correct layout.

**Option rendering before selection:**
- All options are identical in visual weight — same background, same font size, same border
- No option should look "more correct" than another before the learner answers
- Avoid alphabetical ordering if one order is consistently the correct answer

**What to show immediately after tap:**
- Lock all other options (prevent accidental double-tap)
- Highlight the selected option only — not all options
- Within 150ms: change selected option background (green if correct, red if incorrect)
- If incorrect: also highlight the correct option in green so the learner can see it alongside their wrong choice
- Do NOT show red on all wrong options — only the one the learner chose

**Color accessibility note:** Red/green alone fails for colorblind users. Pair color with an icon — a checkmark for correct, an X for incorrect — on the option itself. Research confirms that relying solely on red/green causes misinterpretation in 52% of users in some studies.

**Explanation display:**
- Show explanation text in the feedback panel below the question, not overlaid on the options
- Explanation should be 1–3 sentences. Longer explanations are skipped.
- Use plain language, not academic phrasing
- For university-level content, a brief "Why?" is more useful than a full re-explanation

**Progress indication within a lesson:**
- A linear progress bar at the top of the screen, not a step indicator (1 of 15 text alone is less motivating than a visible fill)
- The bar should advance on every question regardless of correct/incorrect — rewarding participation, not just correctness
- Do NOT shrink the bar on wrong answers (Duolingo's hearts system is controversial and users dislike it)

---

## 3. Readiness / Mastery Scores

### How top apps calculate and display them

**Khan Academy's system (HIGH confidence — official docs)**

Khan Academy uses four named mastery levels per skill:
- **Not Started** → 0 points
- **Familiar** → 50/100 points (achieved by scoring 70–85% in an exercise)
- **Proficient** → 80/100 points (requires 100% on a full exercise from Familiar level)
- **Mastered** → 100/100 points (requires 100% on a Unit Test or Course Challenge from Proficient)

Critically, learners can be *demoted*: scoring below 70% on a Proficient skill drops them back to Familiar. This demotion is important — it prevents learners from gaming the system by doing exercises once and claiming mastery forever. Mastery decays to enforce actual retention.

**Druip recommendation for "Readiness Score"**

For a university exam-prep context, "readiness" is more resonant than "mastery" because it frames the score as "am I ready for the exam?" rather than "have I completed the content?"

Suggested four-tier system:
| Level | Name | Score | Display color |
|-------|------|-------|---------------|
| 0 | Not started | 0% | Gray |
| 1 | Learning | 1–49% | Orange |
| 2 | Practicing | 50–79% | Yellow |
| 3 | Ready | 80–100% | Green |

**How to calculate the score:**
- Start at 0% when a topic is first encountered
- Increase by answering questions correctly (weight recent answers more heavily than old ones — this is the core of spaced repetition)
- Decrease over time if the topic hasn't been reviewed (decay function — a topic practiced 3 weeks ago should not show 100% readiness)
- On wrong answers, reduce score but do not reset to zero

**How to display it:**
- Show the score as a named tier, not just a percentage — "You're Practicing" is more actionable than "67%"
- Show percentage as secondary information if shown at all
- Use a filled ring or arc indicator per topic, not a global progress percentage
- On the dashboard, show readiness per topic (e.g., "Cell Biology: Practicing") rather than one aggregate score
- Aggregate scores hide which topics need attention

**Anti-pattern:** A single "Overall Readiness: 72%" is useless. A student at 72% overall could be at 95% in half the topics and 0% in the other half. The display must be per-topic.

---

## 4. Streak Mechanics

### What works and what makes streaks feel punishing

**The core mechanic (what Duolingo proved):**
A streak tracks consecutive days of at least one completed session. The count increments when any lesson is finished on a given calendar day. Missing one full day resets the count.

**What makes streaks motivating:**
- The streak number becomes an identity marker — "I have a 47-day streak" is something learners tell people
- Loss aversion (fear of losing the streak) is a stronger motivator than desire for gain — but only up to a threshold
- Visual representation matters: a flame icon with a number is universally understood and emotionally warm
- Separating the streak requirement from the daily goal requirement: the streak only requires ONE lesson, even if the learner's daily goal is three lessons

**What makes streaks feel punishing:**
- No recovery mechanism — missing one day permanently destroys a long streak with no recourse
- Time zone issues — users who study at 11:30pm and are interrupted cannot complete their session
- Shame-based notifications ("You're about to lose your 30-day streak!") work short-term but erode intrinsic motivation over time
- Streaks that require a specific amount of work (e.g., 3 lessons) rather than any engagement

**Required safety nets (do not ship streaks without these):**

1. **Streak freeze** — a consumable item that preserves the streak through one missed day. Duolingo gives 2 for free at onboarding. Can be earned or purchased. The existence of freezes makes the streak feel less fragile.

2. **Streak repair window** — if a streak breaks, offer a short window (same day, until midnight) to recover it by completing lessons. This is not just a paid mechanic — the free path should be available.

3. **Weekend mode / break scheduling** — allow learners to schedule planned breaks (exam week, public holidays) that do not count against the streak. University students have irregular schedules; a rigid 365-day streak will inevitably fail.

4. **Gentle notifications, not shame** — preferred framing: "Your 15-day streak is waiting for you" not "You're about to lose your 15-day streak." The difference is approach motivation vs. avoidance motivation. Avoidance motivation produces anxiety.

**Context for South African students:**

Load-shedding (power outages), unreliable data connectivity, and exam period crunch mean streaks will break for reasons entirely outside the student's control. A streak system without generous recovery will feel punitive and unfair in this context. Build the safety nets first.

**Streak display:**
- Flame icon + number on the home screen, always visible
- Subtle animation when the streak increments (the number should "pop")
- Gray/cold color state when the streak is at risk (same day, no lesson yet)
- Do not make the broken streak state a large, prominent UI element — a quiet reset is less discouraging than a prominent "STREAK LOST" screen

---

## 5. Progress Bar Patterns

### What feels encouraging, not overwhelming

**The core rule:** One progress bar per context. A lesson has one bar. A module has one bar. Never show multiple nested progress bars simultaneously.

**Within a lesson (session-level bar):**
- Position at the top of the screen, thin (8–12px height), always visible during the question
- Fills left to right as questions are completed
- Advances on every question, regardless of correct/incorrect — the learner is making progress simply by engaging
- Do NOT penalize wrong answers by shrinking the bar (this causes anxiety and feels punishing)
- Color: a single accent color, not a gradient that changes as the bar fills

**Within a module/topic (topic-level progress):**
- Show as a labeled section on the topic detail screen, not on the home screen
- Include a count: "8 of 20 questions completed"
- Pair with the mastery/readiness level — progress and mastery are different things (you can complete all questions at a low mastery level)

**At course/curriculum level:**
- Use a card-based layout per topic, each card showing the topic name and a readiness badge (the named tier, not a percentage bar)
- Avoid a single "Course progress: 34%" bar — it obscures which topics are weak

**Psychological principles that work:**
- The "goal gradient effect": progress feels faster as the bar approaches completion — a bar that starts at 20% feels more motivating than one that starts at 0%
- Consider starting every lesson bar at a small pre-filled amount (10–15%) to trigger this effect
- Show what the learner has done, not what remains — "8 questions done" is more encouraging than "12 remaining"

**What to avoid:**
- Animated "loading" progress bars that are decorative and do not reflect real progress — learners learn to ignore them
- Red progress bars or bars that change to warning colors — a progress bar should never look like a warning indicator
- Multiple completion percentages on the same screen (e.g., "34% of module" and "67% of today's goal" and "12% of course" simultaneously)

---

## 6. Notes System

### How to make notes feel structured yet personal

**The structural challenge:**

Study app notes fail in one of two ways: (1) they are too rigid — a predefined template that doesn't fit what the student actually needs to write, or (2) they are too open — a blank text field that feels no different from the Notes app already on the student's phone. The goal is structured enough to provide scaffolding, personal enough to feel owned.

**What works: contextual anchoring**

Notes in a study app should be anchored to content. A note created while studying "Cell Membrane Structure" should be tagged to that topic automatically. This contextual linking transforms notes from a general scratchpad into a structured knowledge base.

Implementation pattern:
- "Add note" button visible during any lesson or after any question
- Note is pre-populated with: topic name + question context (optional, learner can delete)
- Free-text entry with basic Markdown support (bold, bullets, code for programming topics)
- Notes are viewable from two places: the topic detail screen (contextual) and a global notes list (searchable)

**What works: lightweight structure**

Rather than forcing a template, offer optional structure that learners can use or ignore:
- A tag system (learner-defined, not predefined categories)
- A "key concept" toggle that marks a note as a summary-level note vs. a detailed note
- Pin/bookmark to surface important notes during review sessions

**What does not work:**
- Requiring learners to categorize every note before saving — friction kills note-taking
- Rich text editors with toolbars — mobile keyboards with a WYSIWYG toolbar are painful. Markdown with a small formatting shortcut bar (Bold, Bullet, Heading) is sufficient.
- Notes stored only globally, not anchored to topics — learners can't find what they wrote when they need it

**Integration with the review flow:**

When a learner answers a question incorrectly, show a subtle "Add a note about this" prompt in the feedback panel. This is the highest-value moment for note creation — the learner just identified a gap.

When reviewing a topic with low mastery, surface related notes the learner created previously. This closes the loop between note-taking and active review.

**South African student context:**

Notes may need to work offline or with minimal data usage. Notes should be stored locally first and synced when connectivity is available. Avoid rich media attachments in the MVP — they increase data and storage load.

---

## 7. Dashboard Patterns

### What to show vs. hide on a home screen

**The core tension:**

A dashboard for a study app must answer: "What should I do right now?" without overwhelming the learner with metrics, pending tasks, and progress indicators all competing for attention. Research from dashboard design shows that 5–6 information cards is the maximum for a usable first view.

**Primary home screen elements (always show):**

1. **Today's streak status** — the flame icon and count, with a visual indicator of whether today's lesson is done. Positioned top-right or in the header. One glance should answer: "Did I study today?"

2. **Primary CTA: "Continue" or "Start today's lesson"** — one large, unambiguous action button. This button should be the most visually dominant element on the screen. The learner should not have to hunt for what to do next. Duolingo's home screen is almost entirely occupied by this single action.

3. **Daily goal progress** — a small indicator (e.g., "2 of 3 lessons done today") near the CTA. Not a full progress bar — just a count. Simple enough to read in one second.

4. **Topic cards** — a horizontally scrollable or vertically stacked list of the learner's active topics, each showing:
   - Topic name
   - Readiness level (the named tier, not a percentage)
   - A visual indicator of whether this topic has pending review questions

**What to hide from the home screen (show only on drill-down):**

- Cumulative statistics (total XP, total questions answered, all-time streaks)
- Detailed mastery breakdowns per sub-topic
- Historical progress charts
- Leaderboards or social comparisons
- Notes

These are important features — they should exist — but they do not belong on the home screen. Put them behind a "Stats" or "Progress" tab.

**Navigation structure recommendation:**

| Tab | Content |
|-----|---------|
| Home | Streak, CTA, topic cards |
| Study | Module/topic browser, start specific lessons |
| Progress | Per-topic mastery breakdown, historical charts |
| Notes | Global notes list, searchable |
| Profile | Settings, streak freezes, account |

Five tabs maximum. A bottom tab bar on mobile (not a hamburger menu — hamburger menus are invisible to learners).

**What makes home screens fail:**

- Showing all metrics at once ("You have 47 XP, a 12-day streak, 34% course completion, 3 topics at risk, and 12 notes") — this is analysis paralysis, not motivation
- No clear next action — the learner lands on the home screen and has to decide where to go
- A "personalized plan" that requires configuration before use — home screen should work immediately

---

## 8. Onboarding Patterns

### Getting a student from sign-up to first lesson as fast as possible

**The single most important principle: value before commitment**

Duolingo's highest-impact onboarding change was moving lesson completion *before* account creation. The sequence is: choose what to study → do one lesson → prompted to create account to save progress. This "play first, profile second" pattern means the learner has already experienced value before they're asked to give up an email address.

For Druip, the equivalent: let the student choose a topic → complete a short sample lesson (5 questions) → prompt account creation to save their progress and unlock full content.

**Recommended onboarding flow for Druip:**

Step 1: **Welcome screen** — one sentence describing the app, one CTA ("Start studying"). No feature lists. No screenshots. One action.

Step 2: **Choose your course/module** — select from a list of South African university subjects (e.g., "BIOL 1011 - Cell Biology", "ECON 101 - Microeconomics"). This can be institution-specific later; for MVP, a curated list of popular subjects.

Step 3: **Set a daily goal** — three options presented as selectable cards:
- "Casual: 1 lesson per day"
- "Regular: 2 lessons per day"
- "Intense: 3 lessons per day"

Do not show a slider or input field — three choices is enough. Letting users choose their own goal increases commitment (ownership effect).

Step 4: **First lesson** — drop them directly into a 5-question sample lesson. No tutorial overlay. No feature tooltips. The lesson interaction teaches itself.

Step 5: **Lesson complete screen** — celebrate the completion, show XP earned, explain the streak mechanic briefly (one sentence: "Study every day to build your streak").

Step 6: **Account creation prompt** — "Save your progress" with email/Google sign-up. At this point, the learner has something to save. Conversion will be significantly higher than if sign-up is Step 1.

Step 7: **Notification permission** — after account creation, prompt for push notifications with an honest explanation: "We'll remind you if you're about to lose your streak." Do not ask for notifications before the learner understands what a streak is.

**What to skip in onboarding:**

- Feature tours ("Here is the Notes tab... here is the Progress tab...") — learners do not read these and skip them immediately
- Long intake forms (name, university, student number, year of study) — collect progressively, not all at once
- Placement tests for MVP — useful eventually, but friction in onboarding. Start everyone at the same level.
- Showing the full lesson catalogue immediately — this overwhelms new users. Surface 2–3 recommended topics first.

**Timing benchmark:**

Duolingo reaches a completed lesson in under 90 seconds from first app open. Druip should target under 2 minutes from landing to first lesson complete. Any friction that extends this window increases drop-off.

**South African context:**

Many students will use mobile data, not Wi-Fi. The onboarding flow must be lightweight: no video, no animations that require data to load, no image-heavy screens. Each screen should feel fast on a 3G connection. This is not optional — it directly affects accessibility for the target user.

---

## Table Stakes

Features users expect. Missing = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Multiple choice questions with immediate color feedback | Core Duolingo-style interaction — any study app without this feels broken | Low | Green/correct icon + red/X icon, not color alone |
| Wrong answer explanation panel | Without it, wrong answers teach nothing | Low | 1–3 sentences, appears in slide-up panel |
| Session progress bar | Learners need to know how far through a lesson they are | Low | Top of screen, fills left to right |
| Streak counter | Expected from Duolingo familiarity | Medium | Requires streak freeze safety net at launch |
| Lesson-complete celebration screen | Closure for a session, motivational reinforcement | Low | XP earned + continue CTA |
| Per-topic readiness levels | "How ready am I?" is the core student question | Medium | Four named tiers, not percentages |
| Daily goal setting | Learner agency over study intensity | Low | Three preset options at onboarding |
| Notes anchored to topics | Generic notes apps already exist — value is the contextual link | Medium | Created from within lessons |
| Home screen with one clear CTA | Learner should never wonder what to do next | Low | Continue/Start lesson button dominant |
| Streak freeze mechanic | Without it, streaks feel brittle and punishing | Medium | 2 free at onboarding, earnback mechanism |

---

## Differentiators

Features that set Druip apart from generic flashcard apps for SA university students.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| SA university module mapping | Questions mapped to actual UNISA, UCT, Wits, UP curricula | High | Requires content partnerships or curation |
| Exam date countdown integration | "Your BIOL exam is in 14 days. 3 topics still at low readiness." | Medium | Calendar integration or manual date input |
| Load-shedding-aware offline mode | Questions cached locally, progress synced when connection returns | High | Critical for SA context |
| Peer comparison within same institution | "You're in the top 40% of UCT BIOL students" | High | Requires sufficient user density |
| Spaced repetition scheduling | Surfacing low-readiness topics automatically before exam dates | High | Ties exam dates to study scheduling |

---

## Anti-Features

Features to explicitly NOT build in the MVP.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Social feed / activity sharing | Study apps that gamify social comparison create anxiety. University students are already grade-anxious. | Optional friend system with streak sharing only |
| Leaderboards against strangers | Creates shame for low performers, who are the learners who most need help | If leaderboards, make them opt-in and institution-scoped |
| Open-ended free text questions | Grading is unsolved, feedback loop breaks, learner expectations for instant grading | Multiple choice and fill-in-the-blank only for MVP |
| Video content | Data cost, infrastructure cost, delivery complexity | Text + image questions only for MVP |
| Duolingo-style "hearts" (lives system) | Research and user feedback shows hearts are the most disliked Duolingo mechanic. They interrupt learning and feel punitive. | No lives system. Wrong answers cost nothing except mastery score |
| Feature onboarding tours | Learners skip them universally. They delay the first lesson. | Self-evident UI + contextual tooltips only |
| Daily lesson notifications that use shame language | "You're going to lose your streak!" causes anxiety, not motivation | Positive framing: "Your streak is waiting for you" |

---

## Feature Dependencies

```
Streak mechanic → Requires: Streak freeze + notification system
Readiness score → Requires: Question history + decay calculation
Spaced repetition scheduling → Requires: Readiness score + exam date input
Notes → Requires: Topic tagging system + full-text search
Offline mode → Requires: Local storage + sync conflict resolution
Peer comparison → Requires: Institution selection + sufficient user volume (not MVP)
```

---

## MVP Recommendation

**Build first (Week 1–4):**
1. Onboarding flow: topic selection → goal setting → first lesson → account creation
2. Multiple choice question engine with immediate feedback and explanation panel
3. Lesson session container with progress bar and completion screen
4. Per-topic readiness score (four tiers, history-based)
5. Home screen with streak counter, daily goal indicator, topic cards, and single CTA

**Build second (Week 5–8):**
6. Streak freeze mechanic
7. Notes system (contextual, anchored to topics)
8. Push notifications with positive framing

**Defer:**
- Social/peer features — requires user density
- Offline mode — build architecture for it early, ship later
- Exam date countdown — useful but not core to the learning loop
- Spaced repetition scheduling — build readiness score first, then layer scheduling on top

---

## Sources

- [Duolingo UX Design Breakdown: 12 Patterns That Make It Addictive](https://www.925studios.co/blog/duolingo-design-breakdown)
- [Duolingo Onboarding UX Breakdown — UserGuiding](https://userguiding.com/blog/duolingo-onboarding-ux)
- [The Psychology Behind Duolingo's Streak Feature — JustAnotherPM](https://www.justanotherpm.com/blog/the-psychology-behind-duolingos-streak-feature)
- [Duolingo Streak System Detailed Breakdown — Premjit Singha, Medium](https://medium.com/@salamprem49/duolingo-streak-system-detailed-breakdown-design-flow-886f591c953f)
- [The Psychology of Hot Streak Game Design — UX Magazine](https://uxmag.com/articles/the-psychology-of-hot-streak-game-design-how-to-keep-players-coming-back-every-day-without-shame)
- [How Duolingo Streak Builds Habit — Duolingo Blog](https://blog.duolingo.com/how-duolingo-streak-builds-habit/)
- [Khan Academy: How Mastery Levels Work](https://support.khanacademy.org/hc/en-us/articles/5548760867853--How-do-Khan-Academy-s-Mastery-levels-work)
- [Finding the Best Pattern for Quiz Feedback — Max Maier, Medium](https://medium.com/@maxmaier/finding-the-best-pattern-for-quiz-feedback-9e174b8fd6b8)
- [Progress Bar Design Best Practices — UX Planet](https://uxplanet.org/progress-bar-design-best-practices-526f4d0a3c30)
- [Duolingo's Gamification Secrets: Streaks and XP — Orizon](https://www.orizon.co/blog/duolingos-gamification-secrets)
- [I Studied 200 Onboarding Flows — DesignerUp](https://designerup.co/blog/i-studied-the-ux-ui-of-over-200-onboarding-flows-heres-everything-i-learned/)
- [Digital Note-Taking UX Research Case Study — Garima Mour, Medium](https://medium.com/@garimamour10/digital-note-taking-a-ux-research-case-study-c5cee728dc8d)
- [Dashboard Design Best Practices — Justinmind](https://www.justinmind.com/ui-design/dashboard-design-best-practices-ux)
- [Duolingo's Delightful Onboarding — Appcues](https://goodux.appcues.com/blog/duolingo-user-onboarding)
- [University Students' Engagement in Mobile Learning — PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC9857874/)
- [Improve Quizzes with Immediate Feedback — Articulate Community](https://community.articulate.com/articles/improve-your-quizzes-with-immediate-feedback)
- [Streaks and Milestones for Gamification — Plotline](https://www.plotline.so/blog/streaks-for-gamification-in-mobile-apps/)
