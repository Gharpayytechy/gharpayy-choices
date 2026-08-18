# Flatmates launch-quality rebuild

## Goal
Make `/flatmates` a real, high-confidence entry point, make `/flatmates/welcome` engaging and role-aware, repair discovery/search, and ship a working map with no dead routes on either `/flatmates/*` or `/gharpayy/flatmates/*`.

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
- Show real marketplace previews, city availability, trust signals, and a concise “how it works” path. Keep the existing personalized seeker dashboard reachable as “My home” after choosing an account rather than using it as the public landing page.
- Ensure navigation exposes Discover, Map, Post/List, Inbox, Guide, Owner desk, account flows, and admin access where appropriate.

### 2. More interesting welcome and onboarding
- Rework `/flatmates/welcome` into a guided setup picker with visual role/setup choices, city and locality selection, and a live summary of the path the user chose.
- Support major launch cities (Bengaluru, Mumbai, Delhi NCR, Hyderabad, Pune, Chennai, Kolkata) plus “Other city”.
- Be honest about inventory: Bengaluru shows live demo matches; other cities offer locality selection and a useful “join/list first” empty-market path rather than fake listings.
- Carry role, setup, city, and locality selections into signup, requirement, post, or owner flows through query parameters/local state.

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

### 5. Route and mobile launch verification
- Fix child-route loading/deep-link issues and register every linked route, including the map, under both supported mount paths.
- Verify homepage → setup → signup/login, homepage → discovery → filters → detail, discovery ↔ map, listing/post, requirement, owner/WhatsApp, inbox/chat, guide, and super-admin.
- Run fresh-browser deep-link checks (not only client navigation) for all Flatmates routes.
- Test at the current 393×529 mobile viewport and desktop, checking overlays, fixed bottom navigation/account switcher, map sizing, no clipped text, no loading deadlocks, no “Page not found”, and no console/runtime errors.

## Technical details
- Keep the requested local/demo account model; do not introduce gated authentication.
- Use existing semantic Flatmates tokens and components, while removing raw one-off colors from touched screens.
- Extend the seed/location model with `city`, normalized searchable fields, and coordinates without destroying existing local user-created listings.
- Add a dedicated client-only map component so Leaflet never breaks server rendering.
- Preserve the existing admin, owner, chat, request, and role-switching behavior while changing the public entry architecture.
