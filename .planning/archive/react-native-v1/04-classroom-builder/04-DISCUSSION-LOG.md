# Phase 4: Classroom Builder - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions captured in CONTEXT.md — this log preserves the analysis.

**Date:** 2026-04-06
**Phase:** 04-classroom-builder
**Mode:** discuss
**Areas analyzed:** Classroom manager screen, Section reordering, Add card flow, File & image uploads

## Assumptions Presented

No pre-formed assumptions — all areas were gray and discussed interactively.

## Discussion

### Classroom Manager Screen
- **Question:** Where/how does the tutor see and manage their sections?
- **Options:** Separate screen | Add to classroom-settings | Profile tab with tabs
- **Decision:** Separate "Manage Classroom" screen. 'My Classroom' tap → manage-classroom. Settings icon in header → classroom-settings.

### Section Reordering
- **Question:** How does the tutor reorder sections?
- **Options:** Up/down arrows | Drag-and-drop | Edit mode with drag handles
- **Decision:** Up/down arrow buttons. Simple, no extra library dependencies.

### Add Card Flow
- **Question:** How does the tutor choose the card type when adding a card?
- **Options:** Bottom sheet picker | Inline action row | Card type selection screen
- **Decision:** Bottom sheet picker with '+' button per section. Uses RADII.modal = 24 styling.

### File & Image Uploads
- **Question:** PDF and image cards — link-only or real uploads?
- **Options:** Link-only | Supabase Storage with signed URLs | Hybrid
- **Initial concern:** Johan raised content piracy — tutors' notes being shared around or screenshotted.
- **Follow-up clarification:** Screenshots can't be prevented (platform limitation). But signed URLs prevent link-sharing — links expire and only work for the authenticated subscriber.
- **Decision:** Supabase Storage with signed URLs. expo-document-picker for PDFs, expo-image-picker for images. Bucket: `classroom-assets` (private). Signed URL generated at read time.

## Corrections Made

No corrections — all recommended options were selected by the user, plus one decision required additional clarification (file uploads) which resolved to the more secure option.

## Deferred During Discussion

- Screenshot prevention / DRM — not buildable on mobile for MVP
- Card reordering within sections — out of Phase 4 scope
- Rich text for text notes — deferred to v1.1
- Video cards — high complexity, deferred
