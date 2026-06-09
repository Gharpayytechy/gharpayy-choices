import data from "@/data/insights.json";

export type AreaData = any;
export const ALL_AREAS: Record<string, AreaData> = (data as any).areas;
export const ALL_AREA_LIST = Object.entries(ALL_AREAS).map(([slug, a]: any) => ({ slug, ...a }));
export const CITY_BHK = (data as any).bhk_summary as Array<{
  bhk: string;
  count: number;
  med: number;
  avg: number;
  min: number;
  max: number;
}>;
export const CITY_STATS = (data as any).stats as { pins: number; seekers: number; value: number; areas: number };
export const CITY_HIST = (data as any).hist as { buckets: number[]; counts: number[] };

export function percentile(values: number[], target: number): number {
  if (!values.length) return 50;
  const sorted = [...values].sort((a, b) => a - b);
  let idx = sorted.findIndex((v) => v >= target);
  if (idx < 0) idx = sorted.length;
  return Math.round((idx / sorted.length) * 100);
}

export function rentVerdict(area: AreaData, bhk: string, asking: number) {
  const bucket = area?.by_bhk?.[bhk];
  if (!bucket) {
    const city = CITY_BHK.find((b) => b.bhk === bhk);
    if (!city) return null;
    return { p25: 0, p50: city.med, p75: 0, source: "city" as const, verdict: classify(asking, city.med) };
  }
  return {
    p25: bucket.p25,
    p50: bucket.med,
    p75: bucket.p75,
    n: bucket.n,
    source: "area" as const,
    verdict: classify(asking, bucket.med, bucket.p25, bucket.p75),
  };
}

function classify(asking: number, med: number, p25?: number, p75?: number) {
  if (p25 && asking <= p25) return { label: "🟢 Steal", tone: "good", msg: "Below the bottom 25% · grab it." };
  if (asking <= med * 0.95) return { label: "🟢 Fair", tone: "good", msg: "Below median · solid value." };
  if (p75 && asking <= p75) return { label: "🟡 Market", tone: "ok", msg: "Within typical range · negotiate ₹1–3k." };
  if (asking <= med * 1.25) return { label: "🟠 Stretched", tone: "warn", msg: "Above the 75th percentile · counter hard." };
  return { label: "🔴 Overpriced", tone: "bad", msg: "Way above market · walk away or negotiate steep." };
}

export function valueScore(area: AreaData) {
  // Lower rent + higher demand = better value
  const med = area.overall.med;
  const demand = area.demand_score ?? 1;
  return Math.round(((demand * 50000) / Math.max(med, 5000)) * 10) / 10;
}

export function rps(area: AreaData) {
  return area.rent_per_sqft ?? 0;
}

export function depositLadder(med: number) {
  return [
    { label: "Standalone owner", months: 6, total: med * 6, note: "Old market norm" },
    { label: "Society flat", months: 4, total: med * 4, note: "Most common today" },
    { label: "Gharpayy Home", months: 2, total: med * 2, note: "Capped at 2 months" },
    { label: "Gharpayy PG", months: 1, total: Math.round(med * 0.3), note: "1 month refundable" },
  ];
}

const POSITIVE = /good|great|love|peace|clean|safe|spacious|nice|amazing|premium|excellent|top|fantastic/i;
const NEGATIVE = /bad|noise|dirty|unsafe|leak|cheat|annoying|smell|tiny|overprice|issue|problem|worst|cramped/i;

export function positiveQuotes(area: AreaData, n = 3): string[] {
  return (area.listings ?? [])
    .map((l: any) => (l.fb || "").trim())
    .filter((q: string) => q.length > 30 && POSITIVE.test(q) && !NEGATIVE.test(q))
    .slice(0, n);
}

export function bestValueListings(area: AreaData, n = 4) {
  const p25 = area.overall.p25;
  return (area.listings ?? [])
    .filter((l: any) => l.r && l.r <= p25)
    .sort((a: any, b: any) => a.r - b.r)
    .slice(0, n);
}

export function outliers(area: AreaData, n = 3) {
  const p75 = area.overall.p75;
  return (area.listings ?? [])
    .filter((l: any) => l.r && l.r >= p75 * 1.4)
    .slice(0, n);
}

export function topSocietyData(area: AreaData) {
  const counts: Record<string, { n: number; total: number; min: number; max: number }> = {};
  (area.listings ?? []).forEach((l: any) => {
    if (!l.s) return;
    const key = l.s.trim();
    if (!key) return;
    if (!counts[key]) counts[key] = { n: 0, total: 0, min: Infinity, max: 0 };
    counts[key].n++;
    counts[key].total += l.r;
    counts[key].min = Math.min(counts[key].min, l.r);
    counts[key].max = Math.max(counts[key].max, l.r);
  });
  return Object.entries(counts)
    .map(([s, v]) => ({ s, n: v.n, avg: Math.round(v.total / v.n), min: v.min, max: v.max }))
    .sort((a, b) => b.n - a.n);
}

export function safetyScore(area: AreaData): number {
  const gatedShare = (area.gated?.n ?? 0) / Math.max(area.count, 1);
  return Math.min(100, Math.round(gatedShare * 100 + 30));
}

export function cityRanking() {
  return ALL_AREA_LIST
    .map((a) => ({ slug: a.slug, name: a.name, med: a.overall.med, demand: a.demand_score, count: a.count }))
    .sort((a, b) => a.med - b.med);
}

export function newListings(n = 8) {
  // pseudo-recent: take last N listings across areas
  const all: Array<{ area: string; r: number; b: string; fb: string; s: string }> = [];
  ALL_AREA_LIST.forEach((a: any) => {
    (a.listings ?? []).slice(0, 2).forEach((l: any) => {
      all.push({ area: a.name, r: l.r, b: l.b, fb: l.fb, s: l.s });
    });
  });
  return all.sort(() => Math.random() - 0.5).slice(0, n);
}

export function affordability(salary: number) {
  const comfort = salary * 0.25; // ≤25% = comfort
  const stretch = salary * 0.35; // ≤35% = stretch
  return ALL_AREA_LIST
    .map((a: any) => {
      const fits = ["1", "2", "3"]
        .map((k) => {
          const m = a.by_bhk?.[k]?.med;
          if (!m) return null;
          const zone = m <= comfort ? "comfort" : m <= stretch ? "stretch" : "out";
          return { bhk: k, med: m, zone };
        })
        .filter(Boolean) as Array<{ bhk: string; med: number; zone: string }>;
      return {
        slug: a.slug,
        name: a.name,
        med: a.overall.med,
        fits,
        bestZone: fits.find((f) => f.zone === "comfort")?.zone ?? fits.find((f) => f.zone === "stretch")?.zone ?? "out",
      };
    })
    .filter((a) => a.fits.some((f) => f.zone !== "out"))
    .sort((a, b) => (a.bestZone === b.bestZone ? a.med - b.med : a.bestZone === "comfort" ? -1 : 1));
}

export function nearestComparables(area: AreaData, bhk: string, asking: number, n = 5) {
  const list = (area?.listings ?? []).filter((l: any) => l.b === bhk && l.r);
  return list
    .map((l: any) => ({ ...l, diff: Math.abs(l.r - asking) }))
    .sort((a: any, b: any) => a.diff - b.diff)
    .slice(0, n);
}

export function cheaperAlternatives(bhk: string, askingMed: number, n = 6) {
  return ALL_AREA_LIST
    .map((a: any) => ({ slug: a.slug, name: a.name, med: a.by_bhk?.[bhk]?.med, demand: a.demand_score }))
    .filter((a) => a.med && a.med < askingMed)
    .sort((a, b) => (b.demand ?? 0) - (a.demand ?? 0))
    .slice(0, n);
}

export function bhkBins(area: AreaData, bhk: string, nBins = 14) {
  const rents = (area?.listings ?? []).filter((l: any) => l.b === bhk && l.r).map((l: any) => l.r as number);
  if (!rents.length) return null;
  const min = Math.min(...rents);
  const max = Math.max(...rents);
  const step = Math.max(1000, Math.ceil((max - min) / nBins / 1000) * 1000);
  const start = Math.floor(min / step) * step;
  const counts = Array(nBins).fill(0);
  rents.forEach((r: number) => {
    const i = Math.min(nBins - 1, Math.floor((r - start) / step));
    if (i >= 0) counts[i]++;
  });
  return { start, step, counts, n: rents.length, min, max };
}

export function fdOpportunityCost(deposit: number, months = 12, rate = 0.07) {
  // Simple interest equivalent forgone if you parked deposit in FD instead
  return Math.round((deposit * rate * months) / 12);
}

export function projectionSeries(pgRent: number, save: number, months: number) {
  const arr: { m: number; total: number }[] = [];
  let total = 0;
  for (let i = 1; i <= months; i++) {
    total += save;
    arr.push({ m: i, total });
  }
  return arr;
}
