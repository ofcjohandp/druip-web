# Domain Pitfalls: Gamified Study App (Edu-Tech MVP)

**Domain:** Gamified study app for university students (South African market)
**Stack:** React Native / Expo + Supabase
**Researched:** 2026-04-06
**Overall confidence:** HIGH (most claims verified against official docs, peer-reviewed research, and primary sources)

---

## Critical Pitfalls

Mistakes that cause rewrites, user churn, or security incidents.

---

### Pitfall 1: Shipping AI-Generated Content Without a Validation Layer

**What goes wrong:** AI (GPT, Claude, etc.) generates flashcards, quiz questions, or summaries that are factually wrong, oversimplified, or confidently incorrect. Students study the wrong information. For South African university curricula specifically, AI outputs default to western-centric, US/UK syllabus framing. A question on constitutional law will reflect US law. A question on economic development will cite European models. This is not a fringe case — it is the default output of any LLM without explicit grounding.

**Why it happens:** LLMs optimise for plausible-sounding text, not factual accuracy. They have no awareness of a specific university's course structure, prescribed textbook, or local regulatory/legal context. Developers trust the output because it looks correct and generating content is fast.

**Consequences:** Students fail exams because they studied wrong content. The app loses all credibility in the first cohort. Word spreads fast in university peer networks — one bad experience shared in a WhatsApp group destroys trust for the entire class.

**Prevention:**
- Never display raw AI-generated content without a review step, even in MVP.
- Build a simple "flag this card" mechanism from day one. Students will self-correct your content for you if you give them the tool.
- Where possible, require human-authored seed content for the first subjects. Use AI to assist creation, not replace it.
- Add a confidence indicator or source citation field to every piece of content. If you cannot cite where the answer comes from, do not ship it.
- Explicitly prompt the AI with the South African context, course name, and textbook edition when generating. This raises accuracy meaningfully without engineering overhead.

**Detection:** Review sessions where students consistently rate cards as wrong. High "I don't know" rates on cards that should be easy. Direct complaints in feedback channels.

---

### Pitfall 2: RLS Disabled on Even One Table

**What goes wrong:** Supabase's anon key is public — it is in your app bundle, visible to anyone. If Row Level Security is disabled on any table, every user (and every attacker) can read, write, or delete all rows in that table. This includes other users' progress data, scores, and personal information.

**Why it happens:** RLS is not enforced by default when you create a new table via the Supabase dashboard. Developers create a table quickly during prototyping and forget to add policies. When they come back, the table works (because there are no restrictions) and they assume it is fine.

**Consequences:** Data breach. All user progress data is readable by anyone who discovers the Supabase project URL (which is in the app bundle). On the free tier, there is no audit log to even know this happened.

**Prevention:**
- Enable RLS on every table before writing a single row of real user data.
- If RLS is enabled but no policy exists, the table returns zero rows to authenticated users. This is silent data loss, not an error. Always add at least a read policy after enabling RLS.
- Use Supabase's production checklist before onboarding any real user: https://supabase.com/docs/guides/deployment/going-into-prod
- Specifically: enable RLS, enable SSL enforcement, set OTP expiry to 3600 seconds or less, and configure a custom SMTP provider (the built-in sender has rate limits and lands in spam).

**Detection:** Run `SELECT tablename FROM pg_tables WHERE schemaname = 'public'` and cross-reference with `SELECT tablename FROM pg_tables WHERE rowsecurity = false`. Any table in the public schema without RLS is a vulnerability.

---

### Pitfall 3: Free Tier Project Pausing in Production

**What goes wrong:** Supabase free tier projects are automatically paused after 7 days of inactivity. If the first student opens the app a week after you last tested it, the database is paused and every request fails with a cold start delay or connection error. This can take 30–60 seconds to wake up.

**Why it happens:** Developers build, push the link to a few friends, and then take a break. The database pauses. The first real user opens the app and gets a broken experience.

**Consequences:** The student assumes the app is broken and never opens it again. First impressions are permanent for early adopters.

**Prevention:**
- Upgrade to the Pro plan before handing the app to any real student. It costs $25/month and removes project pausing entirely.
- Alternatively: set up a cron job (a free service like cron-job.org) that pings your Supabase REST endpoint every 3 days to keep the project alive if you must stay on the free tier during development.
- The free tier micro compute also has a 60 direct connection limit and 200 connection pooler client limit. This is adequate for early MVP but will become a problem at scale. Use the pooler (port 6543) for application connections from day one, not direct connections (port 5432).

**Detection:** Check Supabase dashboard for project status before any demo or handoff to users.

---

### Pitfall 4: Streak Systems That Punish Instead of Motivate

**What goes wrong:** You add a daily study streak counter because it is a standard gamification pattern. Students maintain streaks for weeks, then miss one day due to exams (ironic), load-shedding, or illness. They lose 60 days. They feel the app has punished them for having a life. They delete it.

**Why it happens:** Streak mechanics work by exploiting loss aversion — the psychological principle that losing something feels twice as bad as gaining the equivalent. This is effective at driving engagement but creates anxiety, not learning. Research on Duolingo's streak system specifically documents users who continue studying despite exhaustion and burnout purely to avoid losing their streak number.

**Consequences:** Students with high engagement but high anxiety. High-achieving, perfectionist students — exactly your target users at university level — are the most susceptible. Streaks can shift motivation from intrinsic ("I want to understand this") to extrinsic ("I cannot lose this number"). When extrinsic motivation disappears (streak broken), engagement drops entirely.

**Prevention:**
- Build "streak shields" or "grace days" from day one. A student who misses one day due to load-shedding should not lose a 45-day streak.
- Frame streaks as cumulative study sessions, not consecutive days. "You've studied 45 days this month" is motivating. "Day 45 — don't break it" is anxious.
- Do not make streak count the most visually prominent element on the home screen.
- Consider replacing streaks with a "study intensity" heat map (GitHub-style contribution graph) — it shows consistency without the cliff-edge loss mechanic.
- For South Africa specifically: load-shedding is a structural reality. A streak system that does not account for scheduled power outages is broken by design.

**Detection:** User complaints about unfair streak resets. High uninstall rates on the day after a streak break. Engagement that looks high (users opening app daily) but learning metrics (cards mastered, quiz scores) plateau.

---

### Pitfall 5: Building for Wi-Fi When Your Users Are on Mobile Data

**What goes wrong:** The app is developed and tested on Wi-Fi. Content loads instantly. Images render. Animations play smoothly. The first South African university student opens it on their phone using 3G or congested campus Wi-Fi during peak hours and the app feels broken. Initial bundle download is slow. Content images load late. The experience feels like a 2010 web app.

**Why it happens:** South Africa has expensive mobile data relative to average income. Mobile internet speeds at universities are inconsistent — campus Wi-Fi degrades heavily during lecture hours. Students on prepaid data are managing every megabyte. No developer building in a home or office environment naturally thinks about this.

**Consequences:** High bounce rate on first open. Students stop trusting that the app will load when they need it — specifically, in the hour before an exam.

**Prevention:**
- Target a cold start time under 3 seconds on a mid-range Android device (e.g. Samsung Galaxy A series) on a 3G connection. Measure this. Do not assume.
- Compress all images aggressively. Use WebP format. Keep card content text-first, image-optional.
- Implement offline-first for core study functionality. Cards that have been opened before should be accessible without a network connection. Use Expo SQLite or MMKV for local caching, not just in-memory state.
- Lazy load heavy assets. The home screen should render with text only if assets are not cached.
- Profile actual bundle size. Expo apps with many dependencies ship large JS bundles. Use `npx expo-bundle-analyzer` to inspect. Every KB matters on prepaid data.
- Avoid animations that require continuous network polling or websocket connections during active study sessions.

**Detection:** Test the app manually on a real Android device throttled to "Slow 3G" using developer options. If it feels bad to you, it will feel worse to users.

---

## Moderate Pitfalls

---

### Pitfall 6: Leaderboards Without Understanding the Social Context

**What goes wrong:** You add a leaderboard to create social competition. In practice, one student studies 8 hours a day (usually because they have nothing else going on, or are anxious about results) and permanently dominates the top slot. The bottom 80% of students stop looking at the leaderboard within a week because it is demotivating to see they are ranked 47th.

**Why it happens:** Leaderboards work in games where skill is the primary differentiator and everyone has equal available time. University students have wildly different workloads, part-time jobs, family responsibilities, and course loads. A leaderboard that measures raw volume rewards free time, not effort or growth.

**Prevention:**
- If you build a leaderboard at all, scope it to "most improved this week" or relative performance within a study group, not absolute score globally.
- A class-scoped leaderboard among 8 friends is motivating. An app-wide leaderboard of 500 strangers is not.
- Defer leaderboards entirely for MVP. Add them in a later phase after you have data on how students actually engage.

---

### Pitfall 7: The Social Feature Trap

**What goes wrong:** In week 3 of building, you add "study groups," "friend requests," "share a deck," and "challenge a friend." Each feature is small individually but collectively they triple the scope, double the edge cases (what happens when a user who shared a deck deletes their account?), and delay the core study experience by weeks.

**Why it happens:** Social features are exciting to design and pitch. They also feel necessary because every successful consumer app has them. The trap is that you are building social infrastructure before you have validated whether the core study loop is useful.

**Consequences:** MVP never ships because there is always one more social feature to add. Or it ships with broken social features that damage trust more than not having them at all.

**Prevention:**
- Lock the MVP scope to: create account, study cards, see your own progress. Nothing else.
- Do not build any feature that requires another user to be on the platform to be useful. These features have zero value until you have a critical mass of users, and you do not have that yet.
- Social features that are safe to add early: share a deck via link (no account needed to receive it). Everything else waits.

---

### Pitfall 8: FlatList Rendering Long Card Queues Without Optimisation

**What goes wrong:** A student has 200 cards queued for review. You render them in a FlatList without configuration. On a low-end Android device (a Samsung Galaxy A14, which is common in the South African mass market), the list renders slowly, scrolling stutters, and the app may crash with an out-of-memory error if the user scrolls quickly.

**Why it happens:** React Native's default FlatList configuration renders too many items simultaneously. The default `windowSize` is 21 (meaning 10.5 screen lengths above and below the viewport). On a 512MB RAM device, this is too much.

**Prevention:**
- Always configure FlatList for study card lists:
  ```javascript
  initialNumToRender={5}
  maxToRenderPerBatch={5}
  windowSize={5}
  removeClippedSubviews={true}
  getItemLayout={...} // define this if all items are the same height
  ```
- Use `keyExtractor` that returns a stable string ID, not an index.
- For the actual study session (one card at a time), do not use FlatList at all. Render a single card component and swap it on answer. This eliminates the rendering problem entirely for the core study loop.
- Avoid putting images directly in FlatList items without `react-native-fast-image` or equivalent caching.

---

### Pitfall 9: Progress Bars That Show How Much Work Is Left

**What goes wrong:** You show a progress bar during a study session that counts from 0 to 100%. The student opens a session with 80 cards due. They see "0/80" and close the app. The progress bar that was meant to motivate instead quantified the workload and made it feel overwhelming.

**Why it happens:** Progress bars work when the task is short and completion is achievable in one sitting. An 80-card review queue is not short.

**Prevention:**
- Limit visible study session size. Show the student a fixed session of 10–20 cards. After completion, show a summary. If more cards remain, let them choose to continue.
- Frame progress as "completed today" not "remaining." "You've done 12 cards" is better than "68 to go."
- Never show total queue size as the primary metric. It is demotivating for large queues and only mildly motivating for small ones.

---

### Pitfall 10: Keyboard Handling Broken on Android

**What goes wrong:** Study sessions or onboarding flows have text input fields. On Android, the software keyboard covers the input field and the user cannot see what they are typing. Or pressing the keyboard dismiss button navigates back instead of dismissing the keyboard. These bugs feel amateur and erode trust in the app's quality.

**Why it happens:** iOS and Android handle keyboard layout differently. React Native's `KeyboardAvoidingView` behaves differently depending on the screen structure (native headers, modals, nested navigators). With Expo SDK 53+, edge-to-edge display is enabled by default on Android, which changed how keyboard insets are calculated.

**Prevention:**
- For Expo SDK 53+, use `behavior="height"` not `behavior="padding"` on Android.
- Add `"softwareKeyboardLayoutMode": "resize"` to `app.json` under the Android section.
- Wrap all screens with `SafeAreaProvider` from `react-native-safe-area-context`.
- Test every screen that has a text input on a physical Android device, not just an emulator. Keyboard behaviour on emulators is unreliable.
- Consider `react-native-keyboard-controller` for complex keyboard interaction scenarios. It provides more reliable, event-driven keyboard handling than the built-in `KeyboardAvoidingView`.

---

### Pitfall 11: OTA Updates Breaking the App for Users Who Have Older Builds

**What goes wrong:** You push an Expo OTA (over-the-air) update via EAS Update. Some users have not updated their native binary since the last App Store / Play Store release. The JS bundle you pushed references a new native module that the older binary does not contain. The app crashes on launch for those users.

**Why it happens:** EAS Update sends JS bundle updates. If the new JS code calls into a native module that was added in a subsequent EAS Build but not yet distributed via stores, users on older binaries get a crash. There is no automatic version check unless you configure `runtimeVersion`.

**Consequences:** Silent crashes for a subset of users. No error message — the app simply does not open. On Android specifically, there was a documented bug in Expo SDK 54 where `runtimeVersion` was not being applied correctly to AAB builds (the format required for Play Store), meaning OTA updates silently failed to install.

**Prevention:**
- Always configure `runtimeVersion` in `app.config.js` using the `"fingerprint"` policy. Expo will calculate a fingerprint of your native code surface. OTA updates are only sent to binaries with a matching fingerprint.
- Use separate channels: `preview`, `staging`, `production`. Never push an OTA directly to production without testing it on staging first.
- Before any OTA push, check if you changed any native code (added a new Expo SDK module, changed `app.json` permissions, added a native dependency). If yes, you need a new EAS Build, not just an OTA update.

---

### Pitfall 12: Spaced Repetition Implemented as a Fixed Interval Schedule

**What goes wrong:** You implement "spaced repetition" by showing each card every 1, 3, 7, and 30 days on a fixed schedule regardless of whether the student got it right or wrong. This is not spaced repetition — it is a reminder schedule. Cards the student knows well keep appearing. Cards they consistently get wrong get shown on the same cadence as easy cards.

**Why it happens:** Implementing a true adaptive algorithm (SM-2, FSRS) looks complex. The developer picks fixed intervals as "good enough for MVP."

**Consequences:** Students study easy cards too often (wasting time) and hard cards not often enough (not learning them). The algorithm provides no learning advantage over just re-reading notes. Students do not feel the app is helping them and stop using it.

**Prevention:**
- Implement SM-2 from day one. It is not complex: three fields per card (`easiness`, `interval`, `repetitions`), an update function on each answer, and a query that selects cards where `next_review_date <= now()`. The algorithm is fully documented and open source.
- If SM-2 feels too complex for MVP, use a simple 4-bucket Leitner system. Cards start in bucket 1 (review daily), correct answers move the card up a bucket (less frequent), wrong answers return it to bucket 1. This is a real spaced repetition algorithm and takes under 2 hours to implement.
- Do not use a fixed schedule and call it spaced repetition. The framing will mislead students about the learning value.

---

## Minor Pitfalls

---

### Pitfall 13: Touch Targets Smaller Than 44x44 Points

**What goes wrong:** Action buttons on card review screens (Know it / Don't know, Star, Flag) are designed visually to look small and clean. On a physical device, users miss them constantly. They tap the wrong button and a card is incorrectly marked as mastered.

**Prevention:** Every tappable element must be at least 44x44 points (iOS) or 48x48dp (Android). Use `hitSlop` in React Native to extend the tappable area beyond the visual bounds of a small icon without changing the layout.

---

### Pitfall 14: No Empty State for New Users

**What goes wrong:** A student signs up, reaches the home screen, and sees a blank page because they have no decks yet. There is no instruction, no call to action, no example content. They do not know what to do and close the app.

**Prevention:** Design every screen's empty state before you design the populated state. For MVP, seed every new account with one example deck relevant to a common South African university subject (e.g. Introduction to Business Law, Principles of Accounting). This also gives you something to demo.

---

### Pitfall 15: Registering for Push Notifications on First Open

**What goes wrong:** The app asks for push notification permission on the first screen after sign-up. The user has not experienced any value yet. They tap "Don't Allow." On iOS, this decision is permanent — you cannot ask again without directing the user to Settings manually.

**Prevention:** Never ask for notification permission until the user has completed at least one study session and understands why notifications would be useful ("remind me when my cards are due"). On iOS, you get one prompt. Make it count.

---

### Pitfall 16: Onboarding That Asks for Too Much Up Front

**What goes wrong:** Sign-up form asks for name, university, faculty, year of study, modules, preferred study time, and goals. The student abandons the form on step 3.

**Prevention:** Collect only email and password (or phone number for OTP) on sign-up. Collect everything else progressively, after the student has experienced value. University and module selection can wait until they create their first deck.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|---|---|---|
| Core study loop | Fixed-interval spaced repetition | Implement SM-2 or Leitner from the start |
| Content seeding | Raw AI-generated content | Human review before any content goes live |
| Gamification layer | Streak system with no grace period | Build streak shields before launch |
| Supabase setup | RLS not enabled on progress/user tables | Audit all tables before first real user |
| Android build | OTA + AAB fingerprint mismatch | Configure `runtimeVersion: "fingerprint"` |
| First student handoff | Project paused on free tier | Upgrade to Pro or keep-alive cron before sharing |
| Performance | FlatList on large card queues | Configure windowing props, test on low-end Android |
| Keyboard flows | Input obscured by Android keyboard | Use `behavior="height"`, test on physical device |
| Launch | Notification permission prompt too early | Gate behind first completed session |
| Social features | Study groups added before core loop is validated | Hard cut — no social features in Phase 1 |

---

## Sources

- Supabase Production Checklist: https://supabase.com/docs/guides/deployment/going-into-prod
- Supabase RLS documentation: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase compute and connection limits: https://supabase.com/docs/guides/platform/compute-and-disk
- Supabase security misconfiguration analysis: https://www.stingrai.io/blog/supabase-powerful-but-one-misconfiguration-away-from-disaster
- Expo EAS OTA best practices: https://expo.dev/blog/5-ota-update-best-practices-every-mobile-team-should-know
- Expo EAS production OTA playbook: https://expo.dev/blog/the-production-playbook-for-ota-updates
- React Native FlatList optimisation: https://reactnative.dev/docs/optimizing-flatlist-configuration
- Expo performance best practices: https://expo.dev/blog/best-practices-for-reducing-lag-in-expo-apps
- Expo keyboard handling documentation: https://docs.expo.dev/guides/keyboard-handling/
- Gamification dark patterns research (ACM): https://dl.acm.org/doi/fullHtml/10.1145/3313831.3376600
- Gamification and streak anxiety (UX Magazine): https://uxmag.com/articles/the-psychology-of-hot-streak-game-design-how-to-keep-players-coming-back-every-day-without-shame
- Duolingo gamification negative effects (arxiv): https://arxiv.org/pdf/2203.16175
- AI-generated educational content quality: https://connectedclassroom.org/perspectives/ai-generated-teaching-materials-problems
- EdTech startup failure analysis: https://www.failory.com/startups/edtech-failures
- South Africa low bandwidth education: https://vigilearn.com/low-bandwidth-lms-africa/
- Mobile UX anti-patterns (SitePoint): https://www.sitepoint.com/examples-mobile-design-anti-patterns/
- React Native memory leak debugging: https://instamobile.io/blog/react-native-memory-leak-fixes/
