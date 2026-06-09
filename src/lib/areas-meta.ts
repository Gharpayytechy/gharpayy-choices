import data from "@/data/insights.json";

// Gharpayy operational availability per area. Curated from internal coverage:
// "high" = many active properties, instant tour;
// "medium" = some availability, waitlist possible;
// "low" = few options, expanding;
// "none" = not yet operational, on roadmap.
const AVAIL: Record<string, "high" | "medium" | "low" | "none"> = {
  koramangala: "high", "hsr-layout": "high", indiranagar: "high",
  bellandur: "high", marathahalli: "high", whitefield: "high",
  "electronic-city": "high", "btm-layout": "high", bommanahalli: "high",
  brookefield: "medium", mahadevapura: "medium", hoodi: "medium",
  "sarjapur-road": "medium", domlur: "medium", "jp-nagar": "medium",
  jayanagar: "medium", kasavanahalli: "medium", hebbal: "medium",
  "bannerghatta-road": "medium", "old-airport-road": "medium",
  varthur: "medium", "cv-raman-nagar": "medium", "kalyan-nagar": "medium",
  "kr-puram": "low", begur: "low", "kanakapura-road": "low",
  yelahanka: "low", thanisandra: "low", hennur: "low", kadugodi: "low",
  malleshwaram: "low", rajajinagar: "low", "frazer-town": "low",
  "cooke-town": "low", banashankari: "low", vijayanagar: "low",
  basaveshwaranagar: "none", "mysore-road": "none",
};

export const AVAIL_META = {
  high: { label: "Tour today", color: "oklch(0.62 0.14 155)", dot: "🟢", desc: "Many Gharpayy options ready" },
  medium: { label: "A few left", color: "oklch(0.78 0.16 75)", dot: "🟡", desc: "Limited inventory, book fast" },
  low: { label: "Waitlist", color: "oklch(0.66 0.14 245)", dot: "🔵", desc: "Few rooms, waitlist available" },
  none: { label: "Coming soon", color: "oklch(0.55 0.01 260)", dot: "⚪", desc: "Not yet operational" },
} as const;

export type Avail = keyof typeof AVAIL_META;

export type AreaMeta = {
  slug: string;
  name: string;
  lat: number;
  lng: number;
  count: number;
  med: number;
  demand: number;
  avail: Avail;
  med1?: number;
  med2?: number;
  med3?: number;
  rps: number;
};

export const AREAS: AreaMeta[] = Object.entries((data as any).areas).map(([slug, a]: any) => ({
  slug,
  name: a.name,
  lat: a.lat,
  lng: a.lng,
  count: a.count,
  med: a.overall.med,
  demand: a.demand_score ?? 0,
  avail: AVAIL[slug] ?? "low",
  med1: a.by_bhk?.["1"]?.med,
  med2: a.by_bhk?.["2"]?.med,
  med3: a.by_bhk?.["3"]?.med,
  rps: a.rent_per_sqft ?? 0,
}));

export const AREA_BY_SLUG = Object.fromEntries(AREAS.map((a) => [a.slug, a]));
