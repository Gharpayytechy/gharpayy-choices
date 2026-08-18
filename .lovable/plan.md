# Four personas + a spam-proof approval system

## Answer to your question first: hybrid approval, not either/or

Pure manual review does not scale and pure auto-approval invites spam. The right model is a **trust gate**:

1. **Every listing and every profile gets a completeness + trust score** before it can go live (photos, exact room details, real money breakdown, verified phone, authority to rent, duplicate check).
2. **Score >= threshold AND poster already has a clean track record → auto-approved instantly.**
3. **Score >= threshold but first-time poster → auto-approved into a "limited visibility" state** (visible, but flagged for team spot-check within 24h; delisted instantly if the check fails).
4. **Anything below threshold, or that trips a spam signal → queued for the team** with the exact reasons shown to the poster so they can fix it.

Nothing ever goes live "raw". Result: fast for genuine users, impossible for spammers.

## Spam-proof data layer (Lovable Cloud)

New tables, all with row-level security and grants:

- `profiles` — canonical Person record (one identity, many modes).
- `person_modes` — seeker / replacement_host / owner / managed_owner, many per person.
- `verifications` — phone, email, work email, ID, ownership authority; each with state and timestamp.
- `properties`, `units`, `rooms`, `vacancies` — canonical supply graph, never duplicated per listing.
- `listings` — points at a vacancy; carries `status` (draft / pending / limited / live / rejected / filled), `quality_score`, `auto_decision`, `reviewed_by`, `reject_reasons[]`.
- `moderation_events` — full audit trail of every decision, human or automatic.
- `spam_signals` — duplicate phone/photo hash, repeated text, rent far outside area band, burst posting, blocklist hits.
- `rate_limits` — posts per person per day, contacts per day.

Enforcement lives in the database and in server functions, not in the UI: a listing is only readable by the public when `status in ('limited','live')`, enforced by policy. Client code cannot flip its own status.

## Quality scoring (what "+++ format" means in practice)

A listing cannot reach the threshold without:
- 5+ real photos including the actual room and bathroom, no stock/duplicate images
- exact rent, deposit, maintenance, utilities and total move-in figure
- exact availability date, room type, furnishing, bathroom
- household reality (schedules, food, smoking, guests, pets) for shared rooms
- authority declaration (I am the tenant / owner / authorised)
- verified phone + one more verification

A person profile cannot request or be shown without: verified phone, real name, occupation/company or college, budget band, move date, and a completed requirement.

Scores and missing items are shown live while filling the form, so users know exactly why they are not live yet.

## Persona architecture

`/flatmates` asks **"What are you trying to do?"**, never "owner or tenant":

1. I have a room and need a flatmate → **Replacement Host**
2. I need a room / shared flat → **Room Seeker**
3. I own a property and want occupants → **Property Owner**
4. I want Gharpayy to manage my property → **Managed Property Owner**

Each gets its own home, onboarding, navigation, discovery surface, money view and success metric, exactly as specified. One person can hold several modes and switch without a second account.

Shared underneath: Person → Requirement / Household → Property → Room → Vacancy → Match → Mutual → Visit → Selection → Transaction → Move-in → Tenancy.

## Build order

**Phase 1 (this step)**
- Cloud database: full schema above, RLS, grants, moderation and spam tables.
- Quality-scoring + auto-approval engine as server functions.
- Public `/flatmates` home rebuilt around the four "what are you trying to do" doors, with city selector, search, live counts and trust signals.
- Admin moderation queue: pending listings with score breakdown, spam signals, approve / reject with reasons.

**Phase 2** — Replacement Host PRD: onboarding, live-demand home ("147 people searching, 22 hard-fit"), seeker marketplace, household approval workspace, deposit/money screen.

**Phase 3** — Room Seeker PRD: 60–90s requirement capture from workplace + commute, five-section results, room detail with fit explanation, My Move tracker, move-in cost breakdown.

**Phase 4** — Property Owner PRD: demand-first acquisition screen, property onboarding with digital twin, portfolio home, decision inbox, pricing intelligence.

**Phase 5** — Managed Property PRD: mandate onboarding, asset dashboard, notice → marketplace automation, Money OS, approval matrix, timeline.

**Phase 6** — Admin operations across all four, KPIs per PRD, and end-to-end route verification.

## Notes

- Existing local/demo Flatmates data keeps working during migration; the Cloud tables become the source of truth for anything that must be moderated.
- Sign-in is required to post or contact — that alone removes most spam.
- No fake inventory: cities without supply show honest "be first here" paths.
