# Requirements: Druip Web App

**Defined:** 2026-04-09
**Core Value:** A student opens Druip, finds their tutor's classroom, and has everything they need to pass their test in one place.

## v2.0 Requirements

### Dashboard

- [x] **DASH-01**: Home dashboard shows real subscribed classrooms (empty state if none)
- [x] **DASH-02**: Home dashboard shows real streak count from user profile
- [x] **DASH-03**: Home dashboard shows real tutors from DB (empty state if none)
- [x] **DASH-04**: Dashboard greeting uses real user name from auth

### Tutor Onboarding

- [ ] **TUTOR-01**: Tutor can toggle "I want to teach" on sign-up to become a tutor
- [ ] **TUTOR-02**: Tutor can complete profile (name, bio, subjects, photo)
- [ ] **TUTOR-03**: Tutor can create a classroom (name, description, price in ZAR)
- [ ] **TUTOR-04**: Tutor dashboard shows their classroom and subscriber count
- [ ] **TUTOR-05**: Tutor can add sections to classroom (e.g. "Chapter 1", "Past Papers")
- [ ] **TUTOR-06**: Tutor can add content cards to sections (text notes, PDF, image, link)

### Student Discovery

- [ ] **STUD-01**: Student can browse all available classrooms
- [ ] **STUD-02**: Student can view classroom detail page (tutor info, sections preview, price)
- [ ] **STUD-03**: Student can subscribe to a classroom (UI flow, no payment processing)
- [ ] **STUD-04**: Student sees locked preview for non-subscribed classrooms
- [ ] **STUD-05**: Student sees full content for subscribed classrooms

### Study Content

- [ ] **CONT-01**: Student can view text note cards in a classroom section
- [ ] **CONT-02**: Student can view PDF cards (rendered in-browser)
- [ ] **CONT-03**: Student can view image cards
- [ ] **CONT-04**: Student can view flashcard cards (flip interaction)

### Messaging

- [ ] **MSG-01**: Student can send DM to tutor within a classroom
- [ ] **MSG-02**: Tutor can reply to student DMs
- [ ] **MSG-03**: Message inbox shows all conversations

### Profile

- [ ] **PROF-01**: Student can view and edit their profile (name, university, degree, year)
- [ ] **PROF-02**: User can sign out

## v2.1 Requirements (Deferred)

### Payments
- **PAY-01**: Student pays R180/month via PayFast to subscribe
- **PAY-02**: Tutor receives payout minus platform %
- **PAY-03**: Subscription cancellation flow

### Notifications
- **NOTF-01**: Student notified when tutor adds new content
- **NOTF-02**: Tutor notified of new subscriber

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real payment processing | Deferred to v2.1 — validate demand first |
| OAuth / social login | Email/password sufficient |
| Live video sessions | High complexity, deferred |
| Push notifications | Not needed to validate core value |
| Leaderboards / XP / streaks | Not core to marketplace |
| Mobile app | Web-first; RN app shelved |
| Multi-tutor classrooms | Single tutor per classroom for v2.0 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DASH-01 | Phase 1 | Complete |
| DASH-02 | Phase 1 | Complete |
| DASH-03 | Phase 1 | Complete |
| DASH-04 | Phase 1 | Complete |
| TUTOR-01 | Phase 2 | Pending |
| TUTOR-02 | Phase 2 | Pending |
| TUTOR-03 | Phase 2 | Pending |
| TUTOR-04 | Phase 2 | Pending |
| TUTOR-05 | Phase 3 | Pending |
| TUTOR-06 | Phase 3 | Pending |
| STUD-01 | Phase 4 | Pending |
| STUD-02 | Phase 4 | Pending |
| STUD-03 | Phase 4 | Pending |
| STUD-04 | Phase 4 | Pending |
| STUD-05 | Phase 4 | Pending |
| CONT-01 | Phase 5 | Pending |
| CONT-02 | Phase 5 | Pending |
| CONT-03 | Phase 5 | Pending |
| CONT-04 | Phase 5 | Pending |
| MSG-01 | Phase 6 | Pending |
| MSG-02 | Phase 6 | Pending |
| MSG-03 | Phase 6 | Pending |
| PROF-01 | Phase 7 | Pending |
| PROF-02 | Phase 7 | Pending |

**Coverage:**
- v2.0 requirements: 24 total
- Mapped to phases: 24
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-09*
*Last updated: 2026-04-09 after v2.0 milestone start*
