// Live data fetcher with multi-source fallback.
// 1) Try bangalore.rent JSON endpoints
// 2) Fallback to bundled snapshot
// Caches in module memory for 5 min (Worker isolate-local).

import bundled from "@/data/insights.json";

type Insights = typeof bundled;

const SOURCES = [
  "https://bangalore.rent/data/insights.json",
  "https://bangalore.rent/insights.json",
  "https://www.bangalore.rent/data/insights.json",
];

let cache: { data: Insights; ts: number; source: string } | null = null;
const TTL = 5 * 60 * 1000;

export async function fetchInsights(force = false): Promise<{
  data: Insights;
  source: string;
  freshAt: number;
}> {
  if (!force && cache && Date.now() - cache.ts < TTL) {
    return { data: cache.data, source: cache.source, freshAt: cache.ts };
  }
  for (const url of SOURCES) {
    try {
      const res = await fetch(url, {
        headers: { "user-agent": "GharpayyInsights/1.0 (+https://gharpayy.com)" },
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) continue;
      const json = (await res.json()) as Insights;
      if (!json?.areas || !json?.stats) continue;
      cache = { data: json, ts: Date.now(), source: url };
      return { data: json, source: url, freshAt: Date.now() };
    } catch {
      // try next
    }
  }
  // fallback
  if (!cache) cache = { data: bundled as Insights, ts: Date.now(), source: "bundled" };
  return { data: cache.data, source: cache.source, freshAt: cache.ts };
}
