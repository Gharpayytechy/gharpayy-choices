import { inr } from "@/lib/format";
import { positiveQuotes, bestValueListings, safetyScore, rps, valueScore } from "@/lib/insights-utils";

export function AreaSnapshot({ area }: { area: any }) {
  const o = area.overall;
  const furnishedPremium = area.furnished && area.unfurnished
    ? Math.round(((area.furnished.med - area.unfurnished.med) / area.unfurnished.med) * 100)
    : 0;
  const gatedPct = Math.round(((area.gated?.n ?? 0) / Math.max(area.count, 1)) * 100);
  const cells = [
    { k: "Median", v: inr(o.med), s: "p50" },
    { k: "Range", v: `${inr(o.p25)}–${inr(o.p75)}`, s: "p25–p75" },
    { k: "₹/sqft", v: rps(area).toString(), s: "rent per sqft" },
    { k: "Demand", v: `${(area.demand_score ?? 0).toFixed(2)}×`, s: "vs city avg" },
    { k: "Gated %", v: `${gatedPct}%`, s: "society stock" },
    { k: "Furnished+", v: `+${furnishedPremium}%`, s: "premium" },
    { k: "Safety", v: `${safetyScore(area)}/100`, s: "derived" },
    { k: "Value score", v: valueScore(area).toString(), s: "rent vs demand" },
    { k: "Pins", v: area.count.toString(), s: "verified rents" },
    { k: "Seekers", v: (area.seekers ?? 0).toString(), s: "active hunters" },
    { k: "Top BHK", v: topBhk(area), s: "most asked" },
    { k: "Societies", v: (area.top_societies?.length ?? 0).toString(), s: "tracked" },
  ];
  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-6 w-full">
      <div className="text-[11px] uppercase tracking-widest text-primary font-bold">Area snapshot 🎯</div>
      <h2 className="mt-1 text-xl md:text-2xl font-bold tracking-tight">{area.name} · 12 metrics at a glance</h2>
      <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-1.5">
        {cells.map((c) => (
          <div key={c.k} className="rounded-xl border bg-card p-2.5">
            <div className="text-[9px] uppercase tracking-wider text-muted-foreground font-bold">{c.k}</div>
            <div className="mt-0.5 text-sm num font-bold text-ink truncate">{c.v}</div>
            <div className="text-[9px] text-muted-foreground truncate">{c.s}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function topBhk(area: any): string {
  const bhks = area.by_bhk ?? {};
  let top = "-", n = 0;
  Object.entries(bhks).forEach(([b, v]: any) => { if (v.n > n) { n = v.n; top = b; } });
  return `${top} BHK`;
}

export function BestValueInArea({ area }: { area: any }) {
  const items = bestValueListings(area, 4);
  if (!items.length) return null;
  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-6 w-full">
      <div className="text-[11px] uppercase tracking-widest text-primary font-bold">Best value here 💎</div>
      <h2 className="mt-1 text-xl md:text-2xl font-bold tracking-tight">Below-market gems</h2>
      <p className="mt-1 text-sm text-muted-foreground">Verified rents under the bottom 25% · these get gone fast.</p>
      <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {items.map((l: any, i: number) => (
          <div key={i} className="rounded-2xl border-2 border-success/30 bg-success/5 p-3">
            <div className="flex items-center justify-between">
              <div className="text-[10px] uppercase tracking-wider text-success font-bold">{l.b} BHK</div>
              <div className="text-[10px] text-success font-bold">STEAL</div>
            </div>
            <div className="mt-1 text-xl num font-bold text-ink">{inr(l.r)}</div>
            <div className="text-[11px] text-muted-foreground truncate">{l.s || "Standalone"}</div>
            {l.fb && <div className="mt-1 text-[10px] text-muted-foreground italic line-clamp-2">"{l.fb.slice(0, 80)}"</div>}
          </div>
        ))}
      </div>
    </section>
  );
}

export function TenantQuotes({ area }: { area: any }) {
  const quotes = positiveQuotes(area, 3);
  if (!quotes.length) return null;
  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-6 w-full">
      <div className="text-[11px] uppercase tracking-widest text-primary font-bold">From real tenants 💬</div>
      <h2 className="mt-1 text-xl md:text-2xl font-bold tracking-tight">What people who live in {area.name} say</h2>
      <div className="mt-3 grid sm:grid-cols-3 gap-2">
        {quotes.map((q, i) => (
          <blockquote key={i} className="rounded-2xl border bg-card p-4 text-sm text-ink leading-snug italic">
            "{q.slice(0, 220)}"
          </blockquote>
        ))}
      </div>
    </section>
  );
}
