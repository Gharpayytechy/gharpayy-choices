import { createFileRoute } from "@tanstack/react-router";
import { AREAS } from "@/lib/areas-meta";

const BASE = "https://gsight.lovable.app";

const STATIC_PATHS = [
  "/", "/gharpayy", "/areas", "/listings", "/seekers", "/compare", "/map",
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const urls = [
          ...STATIC_PATHS.map((p) => `<url><loc>${BASE}${p}</loc><changefreq>weekly</changefreq><priority>${p === "/" ? "1.0" : "0.8"}</priority></url>`),
          ...AREAS.flatMap((a) => [
            `<url><loc>${BASE}/area/${a.slug}</loc><changefreq>weekly</changefreq><priority>0.9</priority></url>`,
            `<url><loc>${BASE}/gharpayy/area/${a.slug}</loc><changefreq>weekly</changefreq><priority>0.85</priority></url>`,
          ]),
        ];
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;
        return new Response(xml, { headers: { "Content-Type": "application/xml" } });
      },
    },
  },
});
