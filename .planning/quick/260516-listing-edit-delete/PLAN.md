---
slug: listing-edit-delete
date: 2026-05-16
status: in-progress
goal: Sellers can edit and delete their own published listings from the profile page
---

# Quick Task: Listing Edit and Delete

## Tasks

- [ ] PATCH /api/listings/[id] — update title, code, price, description, cover_url (verify owner)
- [ ] DELETE /api/listings/[id] — hard delete if no purchases; block with message if purchased
- [ ] profile-client.tsx — edit/delete buttons on listing cards, edit modal, delete confirmation
- [ ] Commit and update STATE.md
