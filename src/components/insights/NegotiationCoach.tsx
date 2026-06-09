import { useMemo, useState } from "react";
import { ALL_AREAS, nearestComparables } from "@/lib/insights-utils";
import { inr, inrFull } from "@/lib/format";
import { waArea } from "@/lib/wa";
import { toast } from "sonner";

export function NegotiationCoach({ defaultArea = "hsr-layout" }: { defaultArea?: string }) {
  const [areaSlug, setAreaSlug] = useState(defaultArea);
  const [bhk, setBhk] = useState("2");
  const area = (ALL_AREAS as any)[areaSlug];
  const bucket = area?.by_bhk?.[bhk];
  const [asking, setAsking] = useState<number>(bucket?.med ?? 35000);

  if (!bucket) return null;
  const aggressive = Math.round(bucket.p25 / 500) * 500;
  const fair = Math.round(((bucket.p25 + bucket.med) / 2) / 500) * 500;
  const safe = Math.round((bucket.med * 0.95) / 500) * 500;
  const comps = useMemo(() => nearestComparables(area, bhk, fair, 3), [area, bhk, fair]);

  const script = useMemo(() => {
    return [
      `Hi · I checked Gharpayy Insights for ${bhk} BHK in ${area.name}.`,
      `The median across ${bucket.n} verified rents is ₹${bucket.med.toLocaleString("en-IN")}; bottom-quartile is ₹${bucket.p25.toLocaleString("en-IN")}.`,
      comps.length ? `For example, ${comps.slice(0, 2).map((c: any) => `${c.s || "a similar flat"} at ₹${c.r.toLocaleString("en-IN")}`).join(" and ")}.` : "",
      `Your ask is ₹${asking.toLocaleString("en-IN")}. I can commit ₹${fair.toLocaleString("en-IN")} on a 12-month lock with auto-debit and no late payments. Deal?`,
    ].filter(Boolean).join(" ");
  }, [area, bhk, bucket, asking, fair, comps]);

  const copy = () => {
    navigator.clipboard?.writeText(script);
    toast.success("Script copied · paste into WhatsApp");
  };

  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-7 w-full">
      <div className="rounded-3xl border-2 border-primary/30 p-5 md:p-7" style={{ background: "var(--gradient-hero)" }}>
        <div className="text-[11px] uppercase tracking-widest text-primary font-bold">Negotiation coach 🥋</div>
        <h2 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight">Three offers, ranked by gut</h2>

        <div className="mt-4 grid sm:grid-cols-3 gap-2">
          <select value={areaSlug} onChange={(e) => setAreaSlug(e.target.value)} className="px-3 py-2.5 rounded-xl border bg-background text-sm font-semibold">
            {Object.entries(ALL_AREAS).map(([s, a]: any) => <option key={s} value={s}>{a.name}</option>)}
          </select>
          <select value={bhk} onChange={(e) => setBhk(e.target.value)} className="px-3 py-2.5 rounded-xl border bg-background text-sm font-semibold">
            {["1", "2", "3", "4"].map((b) => <option key={b} value={b}>{b} BHK</option>)}
          </select>
          <input type="number" value={asking} onChange={(e) => setAsking(Number(e.target.value) || 0)} className="px-3 py-2.5 rounded-xl border bg-background text-sm num font-bold" placeholder="Owner asking ₹" />
        </div>

        <div className="mt-5 grid sm:grid-cols-3 gap-3">
          <Offer tone="bold" label="🔥 Aggressive" rent={aggressive} asking={asking} note="At p25. Use if 2+ red flags (no parking, distant, broker)." />
          <Offer tone="best" label="🎯 Fair" rent={fair} asking={asking} note="Halfway between p25 & median. Highest accept rate." />
          <Offer tone="safe" label="🤝 Safe" rent={safe} asking={asking} note="Just under median. Use for premium / hot listings." />
        </div>

        <div className="mt-5 rounded-2xl border bg-card p-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Copy-paste script (data-backed)</div>
            <button onClick={copy} className="text-[11px] font-bold text-primary hover:underline">Copy ⧉</button>
          </div>
          <p className="text-sm text-ink leading-relaxed">{script}</p>
        </div>

        {comps.length > 0 && (
          <div className="mt-4">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Real comparables to cite</div>
            <div className="mt-2 grid sm:grid-cols-3 gap-2">
              {comps.map((c: any, i: number) => (
                <div key={i} className="rounded-xl border bg-card p-3 text-xs">
                  <div className="font-bold text-sm text-ink num">{inrFull(c.r)}</div>
                  <div className="text-muted-foreground truncate">{c.s || "-"}</div>
                  <div className="text-[10px] text-muted-foreground">{c.sq || "-"} sqft · {c.f ? "furnished" : "unfurn"}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <a href={waArea(area.name, fair, undefined, areaSlug)} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center px-5 py-2.5 rounded-full text-sm font-bold text-white" style={{ background: "var(--gradient-orange)" }}>
          Skip the haggling · Gharpayy at {inr(fair)} →
        </a>
      </div>
    </section>
  );
}

function Offer({ tone, label, rent, asking, note }: { tone: "bold" | "best" | "safe"; label: string; rent: number; asking: number; note: string }) {
  const save = Math.max(0, asking - rent);
  const cls =
    tone === "best"
      ? "border-primary/50 bg-primary/5 ring-2 ring-primary/20"
      : tone === "bold"
      ? "border-success/40 bg-success/5"
      : "bg-card";
  return (
    <div className={`rounded-2xl border p-4 ${cls}`}>
      <div className="text-[10px] uppercase tracking-wider font-bold">{label}</div>
      <div className="mt-1 text-2xl num font-bold text-ink">{inrFull(rent)}</div>
      <div className="text-[11px] text-muted-foreground">vs ask {inr(asking)}</div>
      {save > 0 && <div className="mt-1 text-[11px] font-bold text-success num">Save {inrFull(save * 12)}/yr</div>}
      <p className="mt-2 text-[11px] text-muted-foreground leading-snug">{note}</p>
    </div>
  );
}
