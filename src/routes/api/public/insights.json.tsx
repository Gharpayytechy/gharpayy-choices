import { createFileRoute } from "@tanstack/react-router";
import { fetchInsights } from "@/lib/insights.server";

export const Route = createFileRoute("/api/public/insights/json")({
  server: {
    handlers: {
      GET: async () => {
        const { data, source, freshAt } = await fetchInsights();
        return new Response(
          JSON.stringify({
            source,
            freshAt,
            stats: data.stats,
            bhk_summary: (data as any).bhk_summary ?? [],
            ranking: (data as any).ranking ?? [],
            areas: Object.fromEntries(
              Object.entries(data.areas).map(([slug, a]: any) => [
                slug,
                { name: a.name, count: a.count, med: a.overall.med, demand: a.demand_score },
              ]),
            ),
          }),
          {
            status: 200,
            headers: {
              "content-type": "application/json",
              "cache-control": "public, max-age=60, s-maxage=300",
              "access-control-allow-origin": "*",
            },
          },
        );
      },
    },
  },
});
