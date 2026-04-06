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

- [ ] **CLASS-01**: Tutor can create named sections within their classroom (e.g. "Chapter 1", "Upcoming Tests")
- [ ] **CLASS-02**: Tutor can rename and delete sections
- [ ] **CLASS-03**: Tutor can reorder sections within their classroom

### Material Cards

- [ ] **CARD-01**: Tutor can add a text note card to a section
- [ ] **CARD-02**: Tutor can upload a PDF or file as a card in a section
- [ ] **CARD-03**: Tutor can upload an image (e.g. handwritten notes, diagrams) as a card
- [ ] **CARD-04**: Tutor can add an external link card (YouTube, articles, resources)
- [ ] **CARD-05**: Tutor can delete any card from a section

### Student Discovery

- [ ] **DISC-01**: Student can browse all available tutor classrooms on a discovery screen
- [ ] **DISC-02**: Student can view a classroom detail page (tutor name, subjects, bio, price, section preview)
- [ ] **DISC-03**: Non-subscriber sees a locked preview of classroom content with subscribe CTA
- [ ] **DISC-04**: Subscribe button displays the monthly price (e.g. "Subscribe · R180/month")

### Subscriptions (UI)

- [ ] **SUB-01**: Student can tap subscribe and see a confirmation screen (UI placeholder — no real payment in v1.0)
- [ ] **SUB-02**: Subscribed student gets full access to all sections and cards in the classroom
- [ ] **SUB-03**: Student can view a list of all their subscribed classrooms

### Direct Messaging

- [ ] **MSG-01**: Subscribed student can send a direct message to the tutor
- [ ] **MSG-02**: Tutor can reply to student messages
- [ ] **MSG-03**: Both parties can view full message history in a chat-style screen

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

Populated by roadmapper.

| Requirement | Phase | Status |
|-------------|-------|--------|
| TUTR-01 | — | Pending |
| TUTR-02 | — | Pending |
| TUTR-03 | — | Pending |
| TUTR-04 | — | Pending |
| CLASS-01 | — | Pending |
| CLASS-02 | — | Pending |
| CLASS-03 | — | Pending |
| CARD-01 | — | Pending |
| CARD-02 | — | Pending |
| CARD-03 | — | Pending |
| CARD-04 | — | Pending |
| CARD-05 | — | Pending |
| DISC-01 | — | Pending |
| DISC-02 | — | Pending |
| DISC-03 | — | Pending |
| DISC-04 | — | Pending |
| SUB-01 | — | Pending |
| SUB-02 | — | Pending |
| SUB-03 | — | Pending |
| MSG-01 | — | Pending |
| MSG-02 | — | Pending |
| MSG-03 | — | Pending |

**Coverage:**
- v1.0 requirements: 22 total
- Mapped to phases: 0 (roadmapper pending)
- Unmapped: 22 ⚠️

---
*Requirements defined: 2026-04-06*
*Last updated: 2026-04-06 after v1.0 milestone start*
