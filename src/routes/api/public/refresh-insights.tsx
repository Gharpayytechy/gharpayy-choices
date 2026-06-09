import { createFileRoute } from "@tanstack/react-router";
import { fetchInsights } from "@/lib/insights.server";

export const Route = createFileRoute("/api/public/refresh-insights")({
  server: {
    handlers: {
      POST: async () => {
        const r = await fetchInsights(true);
        return Response.json({ ok: true, source: r.source, freshAt: r.freshAt });
      },
      GET: async () => {
        const r = await fetchInsights(true);
        return Response.json({ ok: true, source: r.source, freshAt: r.freshAt });
      },
    },
  },
});
