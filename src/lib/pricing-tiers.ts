// Gharpayy PG pricing tiers · pulled from gharpayy.com pricing section.
// Used by admin (tier mix), public site (pricing card), and lead routing.

export type PricingTier = {
  id: "BASIC" | "CLASSICS" | "PRIVE" | "LUXE" | "HOMES";
  name: string;
  range: string;
  min: number;
  max: number;
  tagline: string;
  blurb: string;
  includes: string[];
  color: string;
  emoji: string;
};

export const PRICING_TIERS: PricingTier[] = [
  {
    id: "BASIC",
    name: "Basic",
    range: "₹7k – ₹11k",
    min: 7000,
    max: 11000,
    tagline: "Smart. Simple. Reliable.",
    blurb: "Shared rooms, essentials, food, Wi-Fi.",
    includes: ["Shared room", "3 meals", "Wi-Fi", "Housekeeping", "Laundry"],
    color: "#10B981",
    emoji: "🟢",
  },
  {
    id: "CLASSICS",
    name: "Classics",
    range: "₹12k – ₹17k",
    min: 12000,
    max: 17000,
    tagline: "Comfort that feels natural.",
    blurb: "Larger layouts, interiors, ventilation.",
    includes: ["Twin sharing", "3 meals", "Wi-Fi", "AC option", "Power backup"],
    color: "#06B6D4",
    emoji: "🔵",
  },
  {
    id: "PRIVE",
    name: "Prive",
    range: "₹17k – ₹26k",
    min: 17000,
    max: 26000,
    tagline: "Your room. Your space. Your peace.",
    blurb: "Private rooms, premium finishes, best food.",
    includes: ["Private room", "Premium meals", "AC", "Geyser", "Daily housekeeping"],
    color: "#F59E0B",
    emoji: "🟠",
  },
  {
    id: "LUXE",
    name: "Luxe Max",
    range: "₹25k – ₹45k",
    min: 25000,
    max: 45000,
    tagline: "The flagship. The benchmark.",
    blurb: "Larger layouts, premium interiors, full concierge.",
    includes: ["Suite room", "Chef meals", "AC + heater", "Concierge", "Gym + lounge"],
    color: "#8B5CF6",
    emoji: "🟣",
  },
  {
    id: "HOMES",
    name: "Gharpayy Homes",
    range: "₹21k+",
    min: 21000,
    max: 80000,
    tagline: "Super furnished 1BHK & 2BHK.",
    blurb: "Managed living for couples, families, NRIs.",
    includes: ["Full 1/2 BHK", "Furnished kitchen", "7-day move-in", "Society amenities", "Owner-direct"],
    color: "#EC4899",
    emoji: "💗",
  },
];

export const TIER_BY_ID = Object.fromEntries(PRICING_TIERS.map((t) => [t.id, t]));

export function tierForRent(monthlyRent?: number | null): PricingTier {
  const r = monthlyRent || 0;
  if (r >= 25000 && r <= 50000) return TIER_BY_ID.LUXE;
  if (r >= 17000) return TIER_BY_ID.PRIVE;
  if (r >= 12000) return TIER_BY_ID.CLASSICS;
  if (r >= 21000) return TIER_BY_ID.HOMES;
  return TIER_BY_ID.BASIC;
}

export function tierForBudget(budget?: [number, number]): PricingTier["id"] {
  if (!budget) return "CLASSICS";
  const mid = (budget[0] + budget[1]) / 2;
  return tierForRent(mid).id;
}
