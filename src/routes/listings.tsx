import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileBottomBar } from "@/components/MobileBottomBar";
import { ListingCard } from "@/components/ListingCard";
import data from "@/data/insights.json";

export const Route = createFileRoute("/listings")({
  head: () => ({
    meta: [
      { title: "Live rental listings · Gharpayy Insights" },
      { name: "description", content: "Browse verified rental listings across Bengaluru with filters by BHK, budget, furnishing, and area." },
    ],
  }),
  component: Listings,
});

function Listings() {
  const all = useMemo(() => {
    const out: any[] = [];
    for (const a of Object.values(data.areas as Record<string, any>)) {
      for (const p of a.listings || []) out.push({ ...p, area: a.name });
    }
    return out;
  }, []);

  const [bhk, setBhk] = useState("all");
  const [maxR, setMaxR] = useState(150000);
  const [furn, setFurn] = useState("any");
  const [area, setArea] = useState("any");

  const areas = useMemo(() => Object.values(data.areas as Record<string, any>).map((a: any) => a.name).sort(), []);

  const filtered = useMemo(() => all.filter((p) =>
    (bhk === "all" || p.b === bhk) &&
    p.r <= maxR &&
    (furn === "any" || (furn === "yes" ? p.f : !p.f)) &&
    (area === "any" || p.area === area)
  ), [all, bhk, maxR, furn, area]);

  return (
    <div className="min-h-screen flex flex-col pb-24 md:pb-0">
      <Header />
      <section className="max-w-7xl mx-auto px-4 md:px-5 py-6 md:py-12 w-full flex-1">
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight">Live listings</h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-1">{all.length.toLocaleString()} verified · {filtered.length.toLocaleString()} match your filters</p>

        <div className="mt-4 md:mt-6 rounded-2xl border bg-card p-3 md:p-4 shadow-[var(--shadow-card)] grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Field label="BHK">
            <select value={bhk} onChange={(e) => setBhk(e.target.value)} className="w-full px-3 py-2 rounded-lg border bg-card text-sm">
              <option value="all">All</option>
              <option value="1">1 BHK</option><option value="2">2 BHK</option><option value="3">3 BHK</option><option value="4">4+ BHK</option>
            </select>
          </Field>
          <Field label="Furnishing">
            <select value={furn} onChange={(e) => setFurn(e.target.value)} className="w-full px-3 py-2 rounded-lg border bg-card text-sm">
              <option value="any">Any</option><option value="yes">Furnished</option><option value="no">Unfurnished</option>
            </select>
          </Field>
          <Field label="Area">
            <select value={area} onChange={(e) => setArea(e.target.value)} className="w-full px-3 py-2 rounded-lg border bg-card text-sm">
              <option value="any">All areas</option>
              {areas.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </Field>
          <Field label={`Max rent · ₹${maxR.toLocaleString("en-IN")}`}>
            <input type="range" min={10000} max={300000} step={5000} value={maxR} onChange={(e) => setMaxR(+e.target.value)} className="w-full accent-[oklch(0.715_0.185_45)]" />
          </Field>
        </div>

        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.slice(0, 60).map((p, i) => <ListingCard key={i} p={p} />)}
        </div>
        {filtered.length > 60 && <div className="mt-6 text-center text-sm text-muted-foreground">Showing 60 of {filtered.length.toLocaleString()}. Refine filters to narrow down.</div>}
      </section>
      <Footer />
      <MobileBottomBar variant="dual" context="I'm browsing live listings" />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
