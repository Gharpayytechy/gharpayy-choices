import { createServerFn } from "@tanstack/react-start";
import { fetchInsights } from "./insights.server";

export const getCityStats = createServerFn({ method: "GET" }).handler(async () => {
  const { data, source, freshAt } = await fetchInsights();
  return {
    stats: data.stats,
    bhk_summary: (data as any).bhk_summary ?? [],
    ranking: (data as any).ranking ?? [],
    source,
    freshAt,
  };
});

export const refreshInsights = createServerFn({ method: "POST" }).handler(async () => {
  const r = await fetchInsights(true);
  return { ok: true, source: r.source, freshAt: r.freshAt };
});
