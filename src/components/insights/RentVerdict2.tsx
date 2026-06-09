import { useMemo, useState } from "react";
import { CITY_BHK, ALL_AREAS, rentVerdict, nearestComparables, cheaperAlternatives, bhkBins } from "@/lib/insights-utils";
import { inr, inrFull } from "@/lib/format";
import { waArea } from "@/lib/wa";
import { Link } from "@tanstack/react-router";

export function RentVerdict2({ defaultArea = "koramangala" }: { defaultArea?: string }) {
  const [bhk, setBhk] = useState("2");
  const [areaSlug, setAreaSlug] = useState(defaultArea);
  const area = (ALL_AREAS as any)[areaSlug];
  const [asking, setAsking] = useState<number>(area?.by_bhk?.[bhk]?.med ?? 35000);
  const v = rentVerdict(area, bhk, asking);
  const cityFallback = CITY_BHK.find((b) => b.bhk === bhk);
  const bins = useMemo(() => bhkBins(area, bhk), [area, bhk]);
  const comps = useMemo(() => nearestComparables(area, bhk, asking, 5), [area, bhk, asking]);
  const med = (v as any)?.p50 ?? cityFallback?.med ?? asking;
  const overpayMonth = Math.max(0, asking - med);
  const cheaper = useMemo(() => cheaperAlternatives(bhk, med, 6), [bhk, med]);
  const max = bins ? Math.max(...bins.counts) : 0;
  const askIdx = bins ? Math.min(bins.counts.length - 1, Math.max(0, Math.floor((asking - bins.start) / bins.step))) : -1;

  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-7 w-full">
      <div className="rounded-3xl border-2 border-primary/30 bg-card shadow-[var(--shadow-card)] p-5 md:p-7">
        <div className="text-[11px] uppercase tracking-widest text-primary font-bold">Rent verdict ⚖️</div>
        <h2 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight">Is your rent fair?</h2>
        <p className="mt-1 text-sm text-muted-foreground">Slide your rent · see exactly where it sits in {area?.count ?? "-"} verified pins, plus the cheapest comparables nearby.</p>

        <div className="mt-5 grid sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Area</label>
            <select value={areaSlug} onChange={(e) => setAreaSlug(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-xl border bg-background text-sm font-semibold">
              {Object.entries(ALL_AREAS).map(([slug, a]: any) => <option key={slug} value={slug}>{a.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">BHK</label>
            <div className="mt-1 flex gap-1">
              {["1", "2", "3", "4"].map((b) => (
                <button key={b} onClick={() => setBhk(b)} className={`flex-1 px-3 py-2.5 rounded-xl border text-sm font-bold transition ${bhk === b ? "bg-primary text-primary-foreground border-primary" : "bg-background"}`}>{b}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Asking rent</label>
            <input type="number" value={asking} onChange={(e) => setAsking(Number(e.target.value) || 0)} className="mt-1 w-full px-3 py-2.5 rounded-xl border bg-background text-sm font-bold num" />
          </div>
        </div>

        <input type="range" min={5000} max={150000} step={500} value={asking} onChange={(e) => setAsking(Number(e.target.value))} className="mt-4 w-full accent-[oklch(0.715_0.185_45)]" />
        <div className="flex justify-between text-[10px] text-muted-foreground num mt-1">
          <span>₹5k</span><span>₹50k</span><span>₹100k</span><span>₹150k</span>
        </div>

        {/* Distribution histogram with marker */}
        {bins && (
          <div className="mt-6">
            <div className="flex items-end justify-between text-[10px] text-muted-foreground mb-1">
              <span>Distribution of {bins.n} verified {bhk} BHK rents in {area.name}</span>
              <span className="num">{inr(bins.min)} – {inr(bins.max)}</span>
            </div>
            <div className="h-20 flex items-end gap-[2px] rounded-lg bg-secondary/30 p-1.5 relative">
              {bins.counts.map((c, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end">
                  <div
                    className={`w-full rounded-sm transition-all ${i === askIdx ? "bg-primary" : "bg-primary/25"}`}
                    style={{ height: `${(c / max) * 100}%` }}
                    title={`${inr(bins.start + i * bins.step)} – ${inr(bins.start + (i + 1) * bins.step)} · ${c} rents`}
                  />
                </div>
              ))}
            </div>
            <div className="mt-1 text-[10px] text-muted-foreground flex justify-between num">
              <span>{inr(bins.start)}</span>
              <span className="text-primary font-bold">↑ Your ask · {inr(asking)}</span>
              <span>{inr(bins.start + bins.counts.length * bins.step)}</span>
            </div>
          </div>
        )}

        {v && (
          <div className="mt-6 grid lg:grid-cols-[1fr_auto] gap-4 items-start">
            <div>
              <div className="text-2xl md:text-3xl font-bold">{v.verdict.label}</div>
              <p className="mt-1 text-sm text-muted-foreground">{v.verdict.msg}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {v.source === "area" ? (
                  <>
                    <Pill k="p25" v={inr(v.p25)} />
                    <Pill k="median" v={inr(v.p50)} accent />
                    <Pill k="p75" v={inr(v.p75)} />
                    <Pill k="sample" v={`${(v as any).n} pins`} />
                  </>
                ) : (
                  <Pill k="city median" v={cityFallback ? inr(cityFallback.med) : "-"} accent />
                )}
              </div>
              {overpayMonth > 0 && (
                <div className="mt-3 rounded-xl border border-warning/40 bg-warning/5 p-3 text-sm">
                  Paying <span className="num font-bold text-ink">{inrFull(overpayMonth)}</span>/month above median →{" "}
                  <span className="num font-bold text-warning">{inrFull(overpayMonth * 12)}</span> a year. That's a long weekend in Goa.
                </div>
              )}
            </div>
            <a href={waArea(area?.name ?? "Bengaluru", asking, undefined, areaSlug)} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center px-5 py-3 rounded-full text-sm font-bold text-white whitespace-nowrap" style={{ background: "var(--gradient-orange)" }}>
              Get a fair option · {inrFull(asking)}
            </a>
          </div>
        )}

        {/* Nearest comparables */}
        {comps.length > 0 && (
          <div className="mt-6">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">5 closest verified {bhk} BHK in {area.name}</div>
            <div className="mt-2 grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {comps.map((c: any, i: number) => (
                <div key={i} className="rounded-xl border bg-card p-3 text-xs">
                  <div className="flex justify-between items-start gap-2">
                    <div className="font-bold text-sm text-ink num">{inrFull(c.r)}</div>
                    <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${c.r <= asking ? "bg-success/15 text-success" : "bg-warning/15 text-warning"}`}>
                      {c.r <= asking ? "−" : "+"}{inr(Math.abs(c.r - asking))}
                    </div>
                  </div>
                  <div className="mt-0.5 text-muted-foreground truncate">{c.s || "-"} · {c.sq || "-"} sqft</div>
                  <div className="mt-1 flex gap-1 flex-wrap">
                    {c.f && <Tag>furnished</Tag>}
                    {c.g && <Tag>gated</Tag>}
                    {c.pet && <Tag>pet</Tag>}
                    {c.lf && <Tag>girls</Tag>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cheaper alternative areas */}
        {cheaper.length > 0 && asking > med && (
          <div className="mt-6">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Cheaper {bhk} BHK areas with healthy demand</div>
            <div className="mt-2 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x">
              {cheaper.map((c) => (
                <Link key={c.slug} to="/area/$slug" params={{ slug: c.slug }} className="snap-start shrink-0 w-40 rounded-xl border bg-card hover:border-primary/40 p-3">
                  <div className="font-bold text-sm text-ink truncate">{c.name}</div>
                  <div className="text-[11px] text-muted-foreground num">Median {inr(c.med!)}</div>
                  <div className="mt-1 text-[10px] text-success font-bold num">Save ~{inr(med - c.med!)}/mo</div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function Pill({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return (
    <div className={`px-3 py-1.5 rounded-lg border ${accent ? "border-primary/40 bg-primary/5" : "bg-secondary/50"}`}>
      <span className="text-muted-foreground">{k}</span>{" "}
      <span className="num font-bold text-ink">{v}</span>
    </div>
  );
}
function Tag({ children }: { children: React.ReactNode }) {
  return <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-secondary/60 text-muted-foreground">{children}</span>;
}
