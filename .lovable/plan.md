# Flatmates launch rescue plan

## Goal

Make `/gharpayy/flatmates` a coherent, end-to-end multi-account marketplace that can be launched today without dead actions or missing pages. Every role—seeker, flatmate poster, owner, group lead, admin, and super admin—must have a clear starting point, working profile/onboarding, requests, and conversations.

## Launch-critical work

### 1. Make the first five minutes obvious
- Replace the ambiguous start with a role-first welcome: **Find a room**, **Find a flatmate**, **List a property**, or **Build a group**.
- Route each choice into one short, role-appropriate signup/onboarding flow and then its dashboard.
- Keep `/flatmates/start` and `/flatmates/onboard` valid; add safe recovery redirects for legacy Flatmates links instead of showing “page doesn’t exist.”
- Keep the home “What’s ready” banner and guide, but rewrite them as actionable launch guidance rather than demo instructions.

### 2. Real accounts and durable marketplace data
- Use Lovable Cloud for email/password and Google sign-in, profiles, account roles, requirements, listings, requests, chat threads/messages, and notifications.
- Retain the floating account switcher for users who legitimately hold multiple account modes; demo persona switching becomes an admin-only preview tool rather than public impersonation.
- Add secure role rules, with admin and super-admin roles stored separately from profiles and validated by the backend.
- Preserve current demo data as launch-safe examples/fallbacks while real user data is introduced.

### 3. Fix the broken core actions
- **What I’m looking for:** save and edit a seeker requirement, publish it, and immediately show matching rooms/people/groups.
- **Add a property:** support owner/flatmate-poster listing in-app; validate the form, save the listing, and show success plus the new listing in the supply desk.
- **WhatsApp:** repair the owner/property handoff using the canonical pre-filled WhatsApp URL and provide an in-app listing alternative so it is never a dead end.
- **Requests:** interest/accept/decline actions update both sides and create/open a conversation when appropriate.
- **Chat:** persist messages, show thread ownership/unread state, support send/retry/empty/error states, and update in real time.

### 4. Owner supply desk and role workspaces
- Seeker: requirement, matches, saved items, requests, chats.
- Flatmate poster: room listing, incoming applicants, household fit, chats.
- Owner: portfolio/listing creation, qualified leads, visits, chats, listing health.
- Group lead: group roster, invitations, shared shortlist, budget/readiness, group chat.
- Each workspace gets a clear “next best action” and no dead controls.

### 5. 100x connected control tower
- Expand admin into a unified marketplace view: supply, demand, matches, owners, groups, requests, chats, trust/reports, and conversion bottlenecks.
- Add a protected super-admin overview with platform-wide KPIs, recent activity, user/account search, moderation queues, role management, and drill-through links.
- Admin access is backend-enforced; no client-side or hardcoded admin checks.

### 6. Route and QA hardening
- Inventory every Flatmates CTA/link and ensure the destination exists.
- Give Flatmates leaf screens route-appropriate metadata where supported by the current catch-all shell.
- Add friendly recovery for unknown nested Flatmates URLs.
- Verify desktop and mobile paths for all six roles: signup/login, onboarding, profile, create/edit requirement or listing, request lifecycle, chat send/receive, role switching, guide, WhatsApp, admin, and super admin.
- Run route smoke tests, interaction tests, console/network checks, and production build checks before handoff.

## Technical details

- Keep the existing TanStack catch-all mount and internal Wouter Flatmates router to avoid a risky same-day rewrite.
- Introduce focused Cloud-backed repositories/hooks behind the existing `src/flatmates/backend` boundary, replacing local-only writes incrementally.
- Add database tables with explicit grants and row-level access rules. User roles live in a separate role table; chat access is limited to thread participants; marketplace listings expose only intended public fields.
- Use Cloud realtime subscriptions for messages and request updates, with teardown on unmount.
- Maintain compatibility aliases for all currently linked `/gharpayy/flatmates/*` paths.

## Acceptance criteria

- No Flatmates navigation or CTA lands on a missing-page screen.
- A new user can choose a role, create an account, finish onboarding, and reach a useful dashboard.
- Seekers can publish what they need; posters/owners can publish supply in-app or open the correct WhatsApp handoff.
- Two valid participants can exchange persistent messages and see request state changes.
- Admin can see the complete marketplace; only super admin can manage roles/platform-wide controls.
- Critical flows pass automated browser verification on mobile and desktop with no console errors or failed app requests.
