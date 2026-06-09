import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { z } from "zod";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileBottomBar } from "@/components/MobileBottomBar";
import data from "@/data/insights.json";
import { inr } from "@/lib/format";

const search = z.object({ a: z.string().optional(), b: z.string().optional(), c: z.string().optional() });

export const Route = createFileRoute("/compare")({
  validateSearch: search,
  head: () => ({
    meta: [
      { title: "Compare Bengaluru neighborhoods · Gharpayy Insights" },
      { name: "description", content: "Side-by-side comparison of rent, demand, BHK pricing across Bengaluru neighborhoods." },
    ],
  }),
  component: Compare,
});

function Compare() {
  const sp = Route.useSearch();
  const areaList = useMemo(() => Object.entries(data.areas as Record<string, any>).map(([slug, a]) => ({ slug, name: a.name })).sort((a, b) => a.name.localeCompare(b.name)), []);
  const [picks, setPicks] = useState<string[]>([sp.a || "koramangala", sp.b || "hsr-layout", sp.c || "indiranagar"]);

  const cards = picks.map((slug) => ({ slug, ...(data.areas as any)[slug] })).filter((c) => c.name);

  return (
    <div className="min-h-screen flex flex-col pb-24 md:pb-0">
      <Header />
      <section className="max-w-7xl mx-auto px-4 md:px-5 py-6 md:py-12 w-full flex-1">
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight">Compare neighborhoods</h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-1">Pick up to three areas to compare side-by-side.</p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <select
              key={i}
              value={picks[i]}
              onChange={(e) => setPicks((p) => p.map((v, idx) => (idx === i ? e.target.value : v)))}
              className="px-4 py-2.5 rounded-lg border bg-card text-sm font-medium"
            >
              {areaList.map((a) => <option key={a.slug} value={a.slug}>{a.name}</option>)}
            </select>
          ))}
        </div>

        <div className="mt-8 grid md:grid-cols-3 gap-4">
          {cards.map((c) => (
            <div key={c.slug} className="rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)]">
              <Link to="/area/$slug" params={{ slug: c.slug }} className="font-semibold text-lg hover:text-primary">{c.name}</Link>
              <div className="text-xs text-muted-foreground mb-4 num">{c.count} listings · {c.seekers} seekers</div>

              <Row label="Median rent" value={inr(c.overall.med)} highlight />
              <Row label="Average rent" value={inr(c.overall.avg)} />
              <Row label="Per sqft" value={c.rent_per_sqft ? `₹${c.rent_per_sqft}` : "-"} />
              <Row label="Demand index" value={`${c.demand_score.toFixed(2)}×`} />
              <Row label="Pet-friendly" value={`${c.pet_friendly_pct}%`} />

              <div className="mt-4 pt-4 border-t">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">By BHK</div>
                {(["1","2","3","4"] as const).map((b) => (
                  <Row key={b} label={`${b} BHK`} value={c.by_bhk[b] ? inr(c.by_bhk[b].med) : "-"} small />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
      <Footer />
      <MobileBottomBar variant="dual" context="I'm comparing areas" />
    </div>
  );
}

function Row({ label, value, highlight, small }: { label: string; value: string; highlight?: boolean; small?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between ${small ? "py-1.5" : "py-2"} border-b border-border/40 last:border-0`}>
      <span className={`${small ? "text-xs" : "text-sm"} text-muted-foreground`}>{label}</span>
      <span className={`num font-semibold ${highlight ? "text-primary text-lg" : small ? "text-xs" : "text-sm"}`}>{value}</span>
    </div>
  );
}
