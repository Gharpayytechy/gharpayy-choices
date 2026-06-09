import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileBottomBar } from "@/components/MobileBottomBar";
import { AreaCard } from "@/components/AreaCard";
import data from "@/data/insights.json";
import { GHARPAYY_ZONES } from "@/lib/gharpayy-zones";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/areas")({
  head: () => ({
    meta: [
      { title: "All Bengaluru neighborhoods · Gharpayy Insights" },
      { name: "description", content: "Browse rental insights for 38 Bengaluru neighborhoods. Median rents, demand index, price per sqft." },
    ],
  }),
  component: Areas,
});

function Areas() {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"count" | "med" | "demand">("count");

  const areas = useMemo(() => {
    const list = Object.entries(data.areas as Record<string, any>).map(([slug, a]) => ({ slug, ...a }));
    const filtered = q ? list.filter((a) => a.name.toLowerCase().includes(q.toLowerCase())) : list;
    return filtered.sort((a, b) => {
      if (sort === "med") return a.overall.med - b.overall.med;
      if (sort === "demand") return b.demand_score - a.demand_score;
      return b.count - a.count;
    });
  }, [q, sort]);

  return (
    <div className="min-h-screen flex flex-col pb-24 md:pb-0">
      <Header />
      <section className="max-w-7xl mx-auto px-4 md:px-5 py-6 md:py-12 w-full flex-1">
        <div className="mb-6">
          <div className="text-[10px] uppercase tracking-widest font-bold text-primary">5 Hero Zones · gharpayy.com</div>
          <h2 className="text-lg md:text-2xl font-bold mt-1">Start with Gharpayy's verified zones</h2>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {GHARPAYY_ZONES.map((z) => (
              <Link
                key={z.slug}
                to="/gharpayy/area/$slug"
                params={{ slug: z.slug }}
                className="group rounded-xl border bg-card hover:border-primary/50 hover:shadow-[var(--shadow-card)] transition p-3"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: z.color }} />
                  <span className="text-xs font-bold uppercase tracking-wide">{z.display}</span>
                </div>
                <p className="mt-1.5 text-[11px] text-muted-foreground leading-snug line-clamp-2">{z.tagline}</p>
              </Link>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-3 md:gap-4 mb-5 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight">All neighborhoods</h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">{Object.keys(data.areas).length} hubs · {data.stats.pins.toLocaleString()} verified rents · PG + flat per hub</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search area..."
              className="px-4 py-2 rounded-lg border bg-card text-sm w-56 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <div className="flex gap-1 rounded-lg bg-secondary p-1">
              {([["count", "Popular"], ["med", "Cheapest"], ["demand", "Hottest"]] as const).map(([k, l]) => (
                <button key={k} onClick={() => setSort(k)} className={`px-3 py-1.5 text-xs rounded-md font-medium transition ${sort === k ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {areas.map((a) => (
            <AreaCard
              key={a.slug}
              slug={a.slug}
              name={a.name}
              count={a.count}
              seekers={a.seekers}
              med={a.overall.med}
              demand={a.demand_score}
              per_sqft={a.rent_per_sqft}
            />
          ))}
        </div>
      </section>
      <Footer />
      <MobileBottomBar variant="dual" context="I'm browsing all hubs" />
    </div>
  );
}
