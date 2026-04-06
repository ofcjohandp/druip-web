# Requirements: Druip

**Defined:** 2026-04-06
**Milestone:** v1.0 Tutor Marketplace
**Core Value:** A student opens Druip, finds their tutor's classroom, and has everything they need to pass their test in one place.

## v1.0 Requirements

### Tutor Onboarding

- [ ] **TUTR-01**: User can toggle "I want to teach" during sign-up to register as a tutor
- [ ] **TUTR-02**: Tutor can create a classroom with name, subject(s), bio, and monthly price
- [ ] **TUTR-03**: Tutor can set a subscription price (default R180/month)
- [ ] **TUTR-04**: Tutor can edit classroom details (name, bio, price, subjects) after creation

### Classroom Sections

- [x] **CLASS-01**: Tutor can create named sections within their classroom (e.g. "Chapter 1", "Upcoming Tests")
- [x] **CLASS-02**: Tutor can rename and delete sections
- [x] **CLASS-03**: Tutor can reorder sections within their classroom

### Material Cards

- [x] **CARD-01**: Tutor can add a text note card to a section
- [x] **CARD-02**: Tutor can upload a PDF or file as a card in a section
- [x] **CARD-03**: Tutor can upload an image (e.g. handwritten notes, diagrams) as a card
- [x] **CARD-04**: Tutor can add an external link card (YouTube, articles, resources)
- [x] **CARD-05**: Tutor can delete any card from a section

### Student Discovery

- [x] **DISC-01**: Student can browse all available tutor classrooms on a discovery screen
- [x] **DISC-02**: Student can view a classroom detail page (tutor name, subjects, bio, price, section preview)
- [x] **DISC-03**: Non-subscriber sees a locked preview of classroom content with subscribe CTA
- [x] **DISC-04**: Subscribe button displays the monthly price (e.g. "Subscribe · R180/month")

### Subscriptions (UI)

- [x] **SUB-01**: Student can tap subscribe and see a confirmation screen (UI placeholder — no real payment in v1.0)
- [x] **SUB-02**: Subscribed student gets full access to all sections and cards in the classroom
- [x] **SUB-03**: Student can view a list of all their subscribed classrooms

### Direct Messaging

- [x] **MSG-01**: Subscribed student can send a direct message to the tutor
- [x] **MSG-02**: Tutor can reply to student messages
- [x] **MSG-03**: Both parties can view full message history in a chat-style screen

### Student Onboarding

- [ ] **ONBD-01**: After sign-up, student is directed to a multi-step onboarding flow before accessing the marketplace
- [ ] **ONBD-02**: Student enters first name, surname, and optionally uploads a profile photo on Screen 1
- [ ] **ONBD-03**: Student selects their university and campus on Screen 2
- [ ] **ONBD-04**: Student selects their degree/programme and year of study on Screen 3
- [ ] **ONBD-05**: Student selects subject tags (multi-select) from a shared tag library on Screen 4 — tags are populated from active tutor classrooms
- [ ] **ONBD-06**: Student selects type of help needed (multi-select: understanding, test prep, assignments, etc.) on Screen 5
- [ ] **ONBD-07**: Student can optionally add an upcoming test date on Screen 6 (skippable)
- [ ] **ONBD-08**: After completing onboarding, marketplace shows tutors filtered by the student's selected subject tags

## v2 Requirements

### Payments

- **PAY-01**: Real subscription payment processing via PayFast or Stripe
- **PAY-02**: Tutor receives monthly payout minus Druip platform fee
- **PAY-03**: Student receives receipt/confirmation email after successful payment
- **PAY-04**: Student can cancel subscription

### Growth

- **GROW-01**: Tutor can share a classroom invite link
- **GROW-02**: Student can leave a review/rating on a classroom
- **GROW-03**: Tutor can see subscriber count and basic analytics

### Notifications

- **NOTF-01**: Student notified when tutor adds new material
- **NOTF-02**: Student notified of new DM reply

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real payment processing | Deferred to v1.1 — validate UX before payment integration |
| Group/community posts | v1.0 is 1-on-1 DM only; group chat adds moderation complexity |
| Live sessions / video calls | High complexity and bandwidth cost |
| Quiz / gamification engine | Pivoted away from Duolingo model for v1.0 |
| Multi-tutor classroom | Single tutor per classroom for v1.0 |
| Push notifications | Not needed to validate core marketplace |
| Creator analytics dashboard | Deferred post-validation |
| OAuth / social login | Email/password sufficient |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| TUTR-01 | Phase 3 | Pending |
| TUTR-02 | Phase 3 | Pending |
| TUTR-03 | Phase 3 | Pending |
| TUTR-04 | Phase 3 | Pending |
| CLASS-01 | Phase 4 | Complete |
| CLASS-02 | Phase 4 | Complete |
| CLASS-03 | Phase 4 | Complete |
| CARD-01 | Phase 4 | Complete |
| CARD-02 | Phase 4 | Complete |
| CARD-03 | Phase 4 | Complete |
| CARD-04 | Phase 4 | Complete |
| CARD-05 | Phase 4 | Complete |
| DISC-01 | Phase 5 | Complete |
| DISC-02 | Phase 5 | Complete |
| DISC-03 | Phase 5 | Complete |
| DISC-04 | Phase 5 | Complete |
| SUB-01 | Phase 5 | Complete |
| SUB-02 | Phase 5 | Complete |
| SUB-03 | Phase 5 | Complete |
| MSG-01 | Phase 6 | Complete |
| MSG-02 | Phase 6 | Complete |
| MSG-03 | Phase 6 | Complete |

**Coverage:**
- v1.0 requirements: 22 total
- Mapped to phases: 22
- Unmapped: 0

---
*Requirements defined: 2026-04-06*
*Last updated: 2026-04-06 — traceability populated by roadmapper*
