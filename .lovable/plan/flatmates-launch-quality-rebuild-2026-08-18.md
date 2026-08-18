# Flatmates launch-quality rebuild

## Goal
Turn `/flatmates` into the single canonical Flatmates app: one entry link, one connected experience, and no competing Flatmates homes. Make its landing and guided welcome exceptional, repair discovery/search and map behavior, connect every workflow to Gharpayy WhatsApp support, and ensure every module works from the same app shell without dead ends.

## What is broken now
- `/flatmates` opens an internal seeker dashboard, not a public Flatmates homepage. New users land inside a demo persona with no clear choice of city or housing setup.
- The welcome screen is a plain list and only supports four broad roles; it does not cover common setups such as finding a room, finding a replacement, finding flatmates before a flat, renting a whole flat, listing one room, or listing an entire property.
- Discovery links to `/flatmates/map`, but no map route or Flatmates map page exists, so it falls into the app's not-found screen.
- Search is a raw JSON substring match. Location filters require an exact area match, group results ignore search/filtering, ready stays are unfiltered, and there is no city/nearby-area model.
- Marketplace data and location choices are Bengaluru-only, with just eight areas and no honest way to select another Indian city.
- Direct navigation to several child routes can remain on the loading fallback; routing and lazy-load behavior need to be validated independently, not only through in-app clicks.

## Build

### 1. A real Flatmates homepage
- Replace the current `/flatmates` first screen with a polished public marketplace home.
- First viewport: clear Flatmates identity, city selector, one prominent “What do you need?” setup selector, search by area/landmark/office/college, and direct actions for Sign up / Log in.
- Add setup cards for:
  - Find a room
  - Find a flatmate for my room
  - Form a group, then find a flat
  - Rent a whole flat
  - List a spare room / replacement
  - List an owner property
- Show real marketplace previews, city availability, trust signals, and a concise “how it works” path. Fold the existing personalized seeker dashboard into the same home as a signed-in/personalized state rather than maintaining another Flatmates home.
- Use `/flatmates` as the only promoted and canonical Flatmates link. Existing legacy entry URLs will redirect into the correct state inside `/flatmates`; they will not present parallel homes or separate apps.
- Ensure the unified app navigation exposes Discover, Map, Post/List, Inbox, Guide, Owner desk, account flows, and admin tools by role, while always retaining a clear route back to the one Flatmates home.
- Add a persistent but unobtrusive “Get help on WhatsApp” action in the app shell so any user can recover from a blocked workflow without searching for support.

### 2. More interesting welcome and onboarding
- Integrate the welcome journey into `/flatmates` as a guided setup mode instead of treating `/flatmates/welcome` as a second destination. The guided picker will provide visual role/setup choices, city and locality selection, and a live summary of the path the user chose.
- Support major launch cities (Bengaluru, Mumbai, Delhi NCR, Hyderabad, Pune, Chennai, Kolkata) plus “Other city”.
- Be honest about inventory: Bengaluru shows live demo matches; other cities offer locality selection and a useful “join/list first” empty-market path rather than fake listings.
- Carry role, setup, city, and locality selections into signup, requirement, post, or owner flows through query parameters/local state.
- Every setup path gets a contextual WhatsApp alternative carrying a prefilled summary of the selected role, city, locality, budget, and current step so the Gharpayy team can immediately understand and fix the blocker.

### 3. Discovery/search overhaul
- Build a normalized search index across title, area, nearby areas, address, company, occupation, college, amenities, room type, and city instead of serializing whole objects.
- Add city, multi-area, setup/type, budget, move-in, gender preference, furnishing, verification, and freshness filters with removable active-filter chips and a reliable reset.
- Apply the same query and compatible filters to rooms, people, groups, whole flats, and ready stays.
- Add result counts by category, clear empty states, suggested nearby areas, and preserve filters when switching between list and map.
- Make search state URL-backed so links can be shared and browser back/forward works.

### 4. Working map
- Add the missing `/flatmates/map` route and a dedicated client-only Leaflet map page.
- Give seeded Bengaluru rooms/flats/ready stays stable coordinates, render differentiated markers and a synchronized result list, and fit the map to filtered results.
- Marker selection opens a useful preview with rent, type, area, verification, and a link to the correct detail route.
- Reuse discovery query/filter state on the map and provide a list/map toggle on mobile.
- Handle tile/network/geolocation failure with a visible retry/list fallback; the core search must remain usable without map tiles.

### 5. One interconnected app and WhatsApp recovery layer
- Consolidate Flatmates chrome, route entry, setup state, role state, filters, saved items, requests, chats, supply desk, and admin oversight so modules behave as parts of one product rather than isolated pages.
- Add one shared WhatsApp helper that uses the official Gharpayy number and produces context-specific messages for: finding a room, finding a flatmate, forming a group, listing a room, listing a whole property, requesting a visit, a failed request, chat help, agreement help, payment/deal help, report/safety help, and technical support.
- Place the relevant WhatsApp action at genuine recovery or handoff points across Home, Discover, Map, listing details, Post, Requirement, Owner desk, Inbox/Chat, Groups, Schedule, Deals, Agreement, Safety, Guide, and empty/error states—not as noisy duplicate buttons on every card.
- Include non-sensitive diagnostic context in support messages: current module, listing/request/thread reference, selected city/locality, role, and the action that failed. Never include passwords or private chat contents.
- Make WhatsApp links work on mobile and desktop (`wa.me` with encoded text), with a copy-message fallback if WhatsApp cannot open.
- Surface all support handoffs in the super-admin activity view so the team can see where users become blocked and follow up.

### 6. Module efficiency and route verification
- Audit every existing Flatmates module and remove duplicate entry points, redundant controls, disconnected actions, and links that do not preserve the user's role/context.
- Make primary tasks reachable in at most two taps from the unified home, keep filter/post forms concise, and retain user input when moving between related modules.
- Fix child-route loading/deep-link issues and register every linked route, including the map, under the canonical Flatmates app. Legacy `/gharpayy/flatmates/*` links will redirect to their matching `/flatmates/*` destination for compatibility, but only `/flatmates` is promoted.
- Verify homepage → setup → signup/login, homepage → discovery → filters → detail, discovery ↔ map, listing/post, requirement, owner/WhatsApp, inbox/chat, guide, and super-admin.
- Verify every WhatsApp handoff generates the correct destination and useful prefilled context, including failure fallbacks.
- Run fresh-browser deep-link checks (not only client navigation) for all Flatmates routes.
- Test at the current 393×529 mobile viewport and desktop, checking overlays, fixed bottom navigation/account switcher, map sizing, no clipped text, no loading deadlocks, no “Page not found”, and no console/runtime errors.

## Technical details
- Keep the requested local/demo account model; do not introduce gated authentication.
- Use existing semantic Flatmates tokens and components, while removing raw one-off colors from touched screens.
- Extend the seed/location model with `city`, normalized searchable fields, and coordinates without destroying existing local user-created listings.
- Add a dedicated client-only map component so Leaflet never breaks server rendering.
- Introduce a single canonical route policy: `/flatmates` is the product entry and metadata URL; compatibility paths redirect rather than render alternative Flatmates roots.
- Centralize WhatsApp URL/message creation so the number, encoding, attribution, and context format remain consistent across all modules.
- Preserve the existing admin, owner, chat, request, and role-switching behavior while changing the public entry architecture.
