// Gharpayy's 5 hero zones · single source of truth used by both
// the public site (hero cards, area pages, admin filters) and the
// admin cockpit (zone grid, expert workload, map polygons).
//
// Copy is taken verbatim from gharpayy.com hero cards so end-users
// and admins read the same words.

import { CAPTAINS } from "@/lib/captains";

export type GharpayyZone = {
  slug: string;
  name: string;             // "KORAMANGALA" · uppercase like gharpayy.com
  display: string;          // "Koramangala"
  tagline: string;          // hero one-liner
  landmarks: string[];      // 3 landmarks
  amenity: string;          // "Party Zone | Food Street"
  heroImage: string;        // gharpayy.com asset
  offer: string;            // "PREBOOK BEFORE LANDING IN BLR"
  captainId: string;        // primary expert owner
  areaSlugs: string[];      // micro-markets that roll into this zone
  tiers: ("BASIC" | "CLASSICS" | "PRIVE" | "LUXE")[];
  color: string;            // map polygon + chip color
  lat: number;
  lng: number;
};

export const GHARPAYY_ZONES: GharpayyZone[] = [
  {
    slug: "koramangala",
    name: "KORAMANGALA",
    display: "Koramangala",
    tagline: "A 5-minute tour saves your day.",
    landmarks: ["Forum Mall", "Christ University", "Jyoti Nivas"],
    amenity: "Party Zone | Food Street",
    heroImage: "https://gharpayy.com/xAssets/heroCards/koramangala.jpg",
    offer: "PREBOOK BEFORE LANDING IN BLR",
    captainId: "aditi-hsr",
    areaSlugs: ["koramangala", "btm-layout", "jayanagar", "jp-nagar", "hsr-layout"],
    tiers: ["BASIC", "CLASSICS", "PRIVE", "LUXE"],
    color: "#FF6B35",
    lat: 12.9352,
    lng: 77.6245,
  },
  {
    slug: "bellandur",
    name: "BELLANDUR",
    display: "Bellandur",
    tagline: "Rooms change daily. Tour now.",
    landmarks: ["RMZ Ecoworld", "Embassy Tech", "ORR"],
    amenity: "Lake View | Gym Access",
    heroImage: "https://gharpayy.com/xAssets/heroCards/bellandur.jpeg",
    offer: "GET EXTRA ₹2K OFF ON PREBOOKING",
    captainId: "rahul-orr",
    areaSlugs: ["bellandur", "sarjapur-road", "kasavanahalli", "varthur"],
    tiers: ["CLASSICS", "PRIVE", "LUXE"],
    color: "#06B6D4",
    lat: 12.9259,
    lng: 77.6760,
  },
  {
    slug: "mahadevapura",
    name: "MAHADEVAPURA",
    display: "Mahadevapura",
    tagline: "Quiet places. Shown live.",
    landmarks: ["RMZ Ecoworld", "Sarjapur", "ITPL feeder"],
    amenity: "Well Connected | Spacious",
    heroImage: "https://gharpayy.com/xAssets/heroCards/mahadevapura.jpeg",
    offer: "PREBOOK BEFORE LANDING IN BLR",
    captainId: "rahul-orr",
    areaSlugs: ["mahadevapura", "marathahalli", "brookefield", "hoodi"],
    tiers: ["BASIC", "CLASSICS", "PRIVE"],
    color: "#10B981",
    lat: 12.9914,
    lng: 77.6993,
  },
  {
    slug: "manyata",
    name: "MANYATA TECH PARK",
    display: "Manyata Tech Park",
    tagline: "See it once. Lock it fast.",
    landmarks: ["IBM Manyata", "Elements Mall", "Hebbal"],
    amenity: "Walk to Office | Meals",
    heroImage: "https://gharpayy.com/xAssets/heroCards/manyatatechpark.jpeg",
    offer: "GET EXTRA ₹2K OFF ON PREBOOKING",
    captainId: "meera-manyata",
    areaSlugs: ["hebbal", "thanisandra", "hennur", "kalyan-nagar", "nagawara"],
    tiers: ["CLASSICS", "PRIVE", "LUXE"],
    color: "#8B5CF6",
    lat: 13.0451,
    lng: 77.6207,
  },
  {
    slug: "whitefield",
    name: "WHITEFIELD",
    display: "Whitefield",
    tagline: "Shortlist online. Visit once.",
    landmarks: ["ITPL", "EPIP Zone", "Phoenix"],
    amenity: "Metro Access | Power Backup",
    heroImage: "https://gharpayy.com/xAssets/heroCards/whitefield.jpg",
    offer: "PREBOOK BEFORE LANDING IN BLR",
    captainId: "rahul-orr",
    areaSlugs: ["whitefield", "kadugodi", "brookefield", "hoodi"],
    tiers: ["CLASSICS", "PRIVE", "LUXE"],
    color: "#F59E0B",
    lat: 12.9698,
    lng: 77.7500,
  },
];

export const ZONE_BY_SLUG = Object.fromEntries(GHARPAYY_ZONES.map((z) => [z.slug, z]));

export function zoneForArea(areaSlug?: string | null): GharpayyZone | null {
  if (!areaSlug) return null;
  const a = areaSlug.toLowerCase();
  return GHARPAYY_ZONES.find((z) => z.areaSlugs.includes(a)) || null;
}

export function zoneForLead(lead: { area?: string | null; zoneId?: string | null }): GharpayyZone | null {
  if (lead.zoneId && ZONE_BY_SLUG[lead.zoneId]) return ZONE_BY_SLUG[lead.zoneId];
  if (!lead.area) return null;
  // area can be a slug or a display name · try both
  const slug = String(lead.area).toLowerCase().replace(/\s+/g, "-");
  return zoneForArea(slug);
}

export function captainForZone(zoneSlug: string) {
  const z = ZONE_BY_SLUG[zoneSlug];
  if (!z) return CAPTAINS[0];
  return CAPTAINS.find((c) => c.id === z.captainId) || CAPTAINS[0];
}
