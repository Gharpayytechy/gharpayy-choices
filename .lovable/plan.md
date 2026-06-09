## Goal

Bring the entire uploaded BookOS suite into the existing app module under `/manager/bookos/*` (wouter routes inside `src/referral-app`), keep the current app shell + nav, layer BookOS's gold/glass accents on the new surfaces, and persist everything in `localStorage` so we ship today. Then push every module past the original ("100x") with deeper data, automations, and cross-module wiring the original didn't have.

## Scope

All 15 BookOS modules ported:

1. Overview dashboard
2. Bookings (list + new + detail)
3. Quotations (compose, send, track)
4. Tenants (list + detail)
5. Payments (UPI + records)
6. Rents (collection ledger)
7. Properties
8. Documents
9. Expenses
10. Maintenance
11. Staff
12. Analytics
13. Notifications
14. Admin console
15. Settings

Each lives under `src/referral-app/pages/manager/bookos/*` and is reachable from a new "Booking OS" entry in the manager sidebar.

## What "100x" adds on top of the original

- **Unified store**: one `bookos-store.ts` with Bookings, Rents, Quotations, Tenants, Properties, Payments, Expenses, Maintenance, Staff, Documents, Notifications, ActivityLog — all in localStorage with a pub/sub `useStore` hook so every screen updates live.
- **Cross-module wiring** the original lacked:
  - Quotation → one-click convert to Booking (prefilled)
  - Booking paid → auto-create Tenant + first Rent record + Activity log entry + Notification
  - Rent overdue → auto-create Notification + Maintenance follow-up task
  - Room from existing `manager/rooms.tsx` → "Create booking for this room" deep link, and booking marks the room soft-locked
- **Scarcity engine**: 15-min offer timers with live countdown, auto-expire sweep, one-tap reactivate, WhatsApp deep-link with pre-filled offer + UPI QR.
- **Money math everywhere**: token revenue, collected rent, pending, overdue, projected MRR, occupancy %, conversion %, avg ticket, time-to-pay — surfaced as KPI strips on every relevant page.
- **Analytics 100x**: 30-day sparkline, status donut, channel mix, staff leaderboard, top properties, rent collection trend, overdue heatmap.
- **Command palette** (`Cmd/Ctrl+K`): jump to any module, create booking, search tenant, copy UPI link.
- **Keyboard shortcuts**: `N` new booking, `Q` new quote, `/` search, `G then D` dashboard, etc.
- **Bulk actions**: multi-select bookings to approve/expire/remind; multi-select rents to mark paid.
- **WhatsApp templates library**: editable per-stage messages (offer, reminder, paid receipt, overdue nudge).
- **Activity log** writes from every mutation; admin console replays it live.
- **Seed-on-empty**: realistic demo data appears on first load so empty installs still look alive.
- **Print/Export**: per-booking receipt PDF (print CSS), quotations as shareable HTML, CSV export on every list.

## Design

Hybrid: keep the app's existing top nav, manager sidebar, and color tokens. The new `/manager/bookos/*` pages use a local `BookOSShell` component that wraps content in BookOS's gold gradient hero, glass cards, serif headings, and amber/emerald status chips — scoped so the rest of the app stays untouched.

## Technical Plan

### New files

```text
src/referral-app/pages/manager/bookos/
  layout.tsx              # BookOSShell + sidebar entries
  index.tsx               # Overview dashboard
  bookings/index.tsx
  bookings/new.tsx
  bookings/[id].tsx
  quotations/index.tsx
  quotations/new.tsx
  quotations/[id].tsx
  tenants/index.tsx
  tenants/[id].tsx
  payments.tsx
  rents.tsx
  properties.tsx
  documents.tsx
  expenses.tsx
  maintenance.tsx
  staff.tsx
  analytics.tsx
  notifications.tsx
  admin.tsx
  settings.tsx

src/referral-app/lib/bookos/
  store.ts                # unified pub/sub localStorage store
  seed.ts                 # demo data
  format.ts               # fmt, timeAgo, statusMeta, waLink, upi, qr
  shortcuts.ts            # keyboard + command palette hooks
  templates.ts            # WhatsApp message templates

src/referral-app/components/bookos/
  Shell.tsx               # gold/glass wrapper
  KPI.tsx, StatusChip.tsx, CountdownPill.tsx, EmptyState.tsx
  CommandPalette.tsx, ConfirmDialog.tsx
```

### Modified files

- `src/referral-app/App.tsx` — register 20+ new wouter routes under `/manager/bookos/...`.
- `src/referral-app/pages/manager/dashboard.tsx` — add "Open Booking OS" card linking to `/manager/bookos`.
- `src/referral-app/pages/manager/rooms.tsx` — add "Create booking" CTA per room; on booking paid mark room as `occupied` + soft-lock.

### Routing

Wouter (the app module's existing router), not TanStack file routes. Paths:
`/manager/bookos`, `/manager/bookos/bookings`, `/manager/bookos/bookings/new`,
`/manager/bookos/bookings/:id`, `/manager/bookos/quotations`, … etc.

### Data model (localStorage namespaces, all prefixed `bookos_`)

`bookings`, `rents`, `quotations`, `tenants`, `properties`, `payments`,
`expenses`, `maintenance`, `staff`, `documents`, `notifications`,
`activity`, `templates`, `settings`. One `subscribe()` channel so every
component re-renders on any mutation.

### Out of scope (this turn)

- No Lovable Cloud / Supabase wiring (user chose localStorage).
- No real WhatsApp/UPI integration beyond deep-links and QR images.
- No file uploads — Documents module stores metadata + external URLs only.
- The original BookOS's Supabase-backed admin console becomes a localStorage activity replay (same UX, no auth).

## Deliverable

After this turn the manager has a new "Booking OS" section in the sidebar. Clicking it opens a dashboard with live KPIs and 14 working modules. Creating a booking ripples through tenants, rents, notifications, and the activity log automatically. Everything works offline on a fresh install thanks to seed data.
