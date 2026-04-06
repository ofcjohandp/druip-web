# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## What This Is

This is a **Claude Workspace Template** — a structured environment designed for working with Claude Code as a powerful agent assistant across sessions. The user will spin up fresh Claude Code sessions repeatedly, using `/prime` at the start of each to load essential context without bloat.

**This file (CLAUDE.md) is the foundation.** It is automatically loaded at the start of every session. Keep it current — it is the single source of truth for how Claude should understand and operate within this workspace.

---

## The Claude-User Relationship

Claude operates as an **agent assistant** with access to the workspace folders, context files, commands, and outputs. The relationship is:

- **User**: Defines goals, provides context about their role/function, and directs work through commands
- **Claude**: Reads context, understands the user's objectives, executes commands, produces outputs, and maintains workspace consistency

Claude should always orient itself through `/prime` at session start, then act with full awareness of who the user is, what they're trying to achieve, and how this workspace supports that.

---

## Workspace Structure

```
.
├── CLAUDE.md              # This file — core context, always loaded
├── .claude/
│   └── commands/          # Slash commands Claude can execute
│       ├── prime.md       # /prime — session initialization
│       ├── create-plan.md  # /create-plan — create implementation plans
│       └── implement.md   # /implement — execute plans
├── context/               # Background context about the user and project
│                          # (User should populate with role, goals, strategies)
├── plans/                 # Implementation plans created by /create-plan
├── outputs/               # Work products and deliverables
├── reference/             # Templates, examples, reusable patterns
└── scripts/               # Automation scripts (if applicable)
```

**Key directories:**

| Directory    | Purpose                                                                             |
| ------------ | ----------------------------------------------------------------------------------- |
| `context/`   | Who the user is, their role, current priorities, strategies. Read by `/prime`.      |
| `plans/`     | Detailed implementation plans. Created by `/create-plan`, executed by `/implement`. |
| `outputs/`   | Deliverables, analyses, reports, and work products.                                 |
| `reference/` | Helpful docs, templates and patterns to assist in various workflows.                |
| `scripts/`   | Any automation or tooling scripts.                                                  |

---

## Commands

### /prime

**Purpose:** Initialize a new session with full context awareness.

Run this at the start of every session. Claude will:

1. Read CLAUDE.md and context files
2. Summarize understanding of the user, workspace, and goals
3. Confirm readiness to assist

### /create-plan [request]

**Purpose:** Create a detailed implementation plan before making changes.

Use when adding new functionality, commands, scripts, or making structural changes. Produces a thorough plan document in `plans/` that captures context, rationale, and step-by-step tasks.

Example: `/create-plan add a competitor analysis command`

### /implement [plan-path]

**Purpose:** Execute a plan created by /create-plan.

Reads the plan, executes each step in order, validates the work, and updates the plan status.

Example: `/implement plans/2026-01-28-competitor-analysis-command.md`

---

## Critical Instruction: Maintain This File

**Whenever Claude makes changes to the workspace, Claude MUST consider whether CLAUDE.md needs updating.**

After any change — adding commands, scripts, workflows, or modifying structure — ask:

1. Does this change add new functionality users need to know about?
2. Does it modify the workspace structure documented above?
3. Should a new command be listed?
4. Does context/ need new files to capture this?

If yes to any, update the relevant sections. This file must always reflect the current state of the workspace so future sessions have accurate context.

**Examples of changes requiring CLAUDE.md updates:**

- Adding a new slash command → add to Commands section
- Creating a new output type → document in Workspace Structure or create a section
- Adding a script → document its purpose and usage
- Changing workflow patterns → update relevant documentation

---

## For Users Downloading This Template

To customize this workspace to your own needs, fill in your context documents in `context/` and modify as needed. Then use `/create-plan` to plan out and `/implement` to execute any structural changes. This ensures everything stays in sync — especially CLAUDE.md, which must always reflect the current state of the workspace.

---

## Session Workflow

1. **Start**: Run `/prime` to load context
2. **Work**: Use commands or direct Claude with tasks
3. **Plan changes**: Use `/create-plan` before significant additions
4. **Execute**: Use `/implement` to execute plans
5. **Maintain**: Claude updates CLAUDE.md and context/ as the workspace evolves

---

## Notes

- Keep context minimal but sufficient — avoid bloat
- Plans live in `plans/` with dated filenames for history
- Outputs are organized by type/purpose in `outputs/`
- Reference materials go in `reference/` for reuse

<!-- GSD:project-start source:PROJECT.md -->
## Project

**Druip**

Druip is a gamified study system for South African university students that turns overwhelming, scattered academic material into a structured, clear, and motivating learning experience. The MVP targets NWU Potchefstroom physiotherapy students, covering one module, with a Duolingo-style study flow built on React Native / Expo and Supabase.

**Core Value:** A student opens Druip and feels calmer, clearer, and more in control — not confused, overloaded, or lost.

### Constraints

- **Scope**: Single university, single course, single module for MVP — no scope creep before validation
- **Stack**: React Native / Expo + Supabase — decided, not up for debate during MVP phase
- **Brand**: Must NOT feel like a typical "edu-tech" product — no heavy dark UI, no graph-heavy dashboards, no corporate tone
- **Content**: All module content must be ready before first student uses the app — can't onboard to empty shell
- **Validation first**: Do not build v2 features (payments, social, multi-course) before proving students return daily
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## 1. Expo SDK Version
### Managed Workflow vs. Bare Workflow
### Setup
## 2. Supabase Client Setup in React Native
### Current Recommended Approach (SDK 55 / supabase-js v2.49.9+)
### Environment Variables
### Known Gotchas
## 3. Navigation: Expo Router
## 4. State Management
| Concern | Library | Why |
|---------|---------|-----|
| Server data (questions, progress, leaderboards) | TanStack Query v5 | Caching, background refetch, loading/error states, stale-while-revalidate — eliminates 80% of data-fetching boilerplate |
| Client-only state (active quiz session, streak counter in memory, modal visibility, theme) | Zustand | Minimal API, no boilerplate, works well with React Native's component tree |
| Auth state | Supabase's own `onAuthStateChange` + Zustand to expose to the component tree | Keeps auth logic co-located with Supabase |
## 5. Offline Support
### The Reality for South African University Students
### Recommended Approach: TanStack Query + MMKV persister
### When to Use WatermelonDB Instead
- The student must submit quiz answers offline and sync later
- Offline write conflicts need resolution
- The dataset grows to tens of thousands of records
### What Will Not Work Offline
- Auth (session refresh requires network — see gotcha #2 above)
- Submitting quiz answers (requires network to persist to Supabase)
- Realtime leaderboard updates
## 6. Supabase + React Native Known Issues Summary
| Issue | Status | Action |
|-------|--------|--------|
| `ws`/`stream` module crash | Fixed in supabase-js v2.49.9 | Pin to v2.49.9+ in `package.json` |
| Session lost on offline launch | Open bug, no official fix | Handle `SIGNED_OUT` event defensively; show login screen rather than crashing |
| `AuthSessionMissingError` on multi-device logout | Workaround exists | Use `getUser()` over `getSession()` for session checks |
| Parameter-less RPC PGRST202 | Workaround exists | Pass `{}` explicitly to `rpc()` calls |
| URL polyfill not applied | Developer error | Import `react-native-url-polyfill/auto` before supabase initializes |
| `react-native-safe-area-context` version conflict | Intermittent | Use `npx expo install` (not `npm install`) for all Expo-ecosystem packages — it resolves to the correct peer-compatible version |
| Realtime in New Architecture (SDK 55) | No confirmed breakage as of April 2026 | Test Realtime subscriptions early in development; do not assume it works until verified |
## 7. Project Structure
- `src/app/` contains only route files. No business logic. Screen files are thin — they import from `features/`.
- `src/features/` groups everything belonging to a feature: query hooks, Zustand slices, and feature-specific components. This prevents a sprawling flat `components/` folder as the app grows.
- `src/lib/supabase.ts` is the single point of Supabase client initialization. Nothing else creates a client.
- Supabase-generated TypeScript types live in `src/types/database.ts` (generate with `supabase gen types typescript --project-id <id> > src/types/database.ts`). Use these everywhere — they eliminate an entire class of runtime type errors.
- Route groups use parentheses `(auth)`, `(tabs)` — these are Expo Router conventions, not folder name choices.
## Recommended Package List
# Core
# Navigation (included with Expo Router in SDK 55)
# expo-router is bundled — no separate install needed
# State management
# Offline persistence
# Network awareness (for offline detection)
## Alternatives Considered
| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Navigation | Expo Router | React Navigation directly | Expo Router is a superset; adds deep linking, auth guards, no downside for this project |
| Session storage | expo-sqlite localStorage | @react-native-async-storage/async-storage | AsyncStorage has the offline session-loss bug; expo-sqlite is the current official recommendation |
| Client state | Zustand | Redux Toolkit | Redux is overbuilt for this scope; Zustand has no boilerplate cost |
| Server state | TanStack Query | SWR | TanStack Query has better offline + persistence story; larger ecosystem |
| Local DB (offline writes) | WatermelonDB (deferred) | Realm, SQLite directly | WatermelonDB has native Supabase sync guide; defer until write-offline is confirmed requirement |
| Key-value storage | MMKV | AsyncStorage | MMKV is 20x faster; synchronous API required by TanStack Query persister |
## Sources
- [Expo SDK 55 Changelog](https://expo.dev/changelog/sdk-55)
- [Using Supabase — Expo Docs](https://docs.expo.dev/guides/using-supabase/)
- [Supabase Auth with React Native — Supabase Docs](https://supabase.com/docs/guides/auth/quickstarts/react-native)
- [Supabase Expo Quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/expo-react-native)
- [supabase-js ws issue — Fixed in v2.49.9](https://github.com/supabase/supabase-js/issues/1434)
- [Supabase auth session lost offline — Open discussion](https://github.com/orgs/supabase/discussions/36906)
- [Expo app folder structure best practices — Expo Blog](https://expo.dev/blog/expo-app-folder-structure-best-practices)
- [Expo Router protected routes](https://docs.expo.dev/router/advanced/protected/)
- [TanStack Query persistQueryClient](https://tanstack.com/query/latest/docs/framework/react/plugins/persistQueryClient)
- [Offline-first React Native with TanStack Query — DEV Community](https://dev.to/fedorish/react-native-offline-first-with-tanstack-query-1pe5)
- [Offline-first with WatermelonDB + Supabase — Supabase Blog](https://supabase.com/blog/react-native-offline-first-watermelon-db)
- [StorageBenchmark: MMKV vs AsyncStorage vs WatermelonDB](https://github.com/mrousavy/StorageBenchmark)
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

| Skill | Description | Path |
|-------|-------------|------|
| MCP Integration | This skill should be used when the user asks to "add MCP server", "integrate MCP", "configure MCP in plugin", "use .mcp.json", "set up Model Context Protocol", "connect external service", mentions "${CLAUDE_PLUGIN_ROOT} with MCP", or discusses MCP server types (SSE, stdio, HTTP, WebSocket). Provides comprehensive guidance for integrating Model Context Protocol servers into Claude Code plugins for external tool and service integration. | `.claude/skills/mcp-integration/SKILL.md` |
| skill-creator | Create or update AgentSkills. Use when designing, structuring, or packaging skills with scripts, references, and assets. | `.claude/skills/skill-creator/SKILL.md` |
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
