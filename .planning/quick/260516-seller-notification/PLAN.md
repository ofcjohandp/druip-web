---
slug: seller-notification
date: 2026-05-16
status: in-progress
goal: Email sellers when admin approves or denies their application
---

# Quick Task: Seller Approval Notification

## Approach
Use Resend (free tier, 3k emails/month, simple REST API — no SDK needed).
Email is fire-and-forget: approval/denial still succeeds if email fails.

## Tasks

- [ ] Update /api/admin/applications/[id]/route.ts — fetch applicant email + send via Resend after status update
- [ ] Approved email: warm welcome, link to /sell
- [ ] Denied email: kind explanation, include reviewer_notes if present, link to /apply-to-sell
- [ ] Env var: RESEND_API_KEY (document for user to add in Vercel)
- [ ] Commit and update STATE.md
