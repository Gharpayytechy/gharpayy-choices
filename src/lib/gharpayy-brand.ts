// Gharpayy.com · single source of truth for brand voice.
// Imported by every public page, the admin cockpit, and the earn flows.

export const BRAND = {
  name: "Gharpayy",
  domain: "gharpayy.com",
  tagline: "Move in this week. Upgrade when you're ready.",
  pitch: "Direct to owner. Expert-led. Best rent guaranteed.",
  expertLabel: "Gharpayy Expert",
  expertDeskLabel: "Expert Desk · 24×7",
} as const;

export const CHIPS = {
  poweredBy: "Powered by real Bengaluru rents",
  expertDesk: "Expert Desk · 24×7",
  verifiedZones: "5 Verified Hero Zones",
  moveIn: "Move in this week",
  liveOpenHouses: "Live open houses",
  picks: "Gharpayy Picks",
  trending: "Trending Zones",
  bestRent: "Best Rent Guaranteed",
} as const;

export const EYEBROW = {
  trendingZones: "Trending zones",
  picks: "Gharpayy Picks",
  tools: "Tools that pay for themselves",
  stories: "Stories from movers",
  earn: "Make money with Gharpayy",
  experts: "Meet your expert",
} as const;

// Public-facing 1 BHK headline anchor · never reads cheap.
export const ANCHOR_1BHK = 25000;
export const ANCHOR_2BHK = 32000;
export const ANCHOR_PG = 6500;
export const ANCHOR_STUDIO = 16000;

export const TRUST_STRIP = [
  "KYC owners",
  "5,000+ tenants",
  "5 Hero Zones",
  "38 hubs",
  "4.7★ rated",
  "Expert Desk 24×7",
] as const;

// Pitch frame reused on every tool/calculator and admin module.
export type Pitch = { why: string; how: string; next: string };
