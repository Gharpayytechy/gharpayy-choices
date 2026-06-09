import { useMemo, useState } from "react";
import { AREAS, AREA_BY_SLUG } from "@/lib/areas-meta";
import { waArea } from "@/lib/wa";
import data from "@/data/insights.json";
import { inr, inrFull } from "@/lib/format";
import { WhatsAppIcon } from "./Header";

// "Am I overpaying?" · interactive verdict tool. Pure frontend; reads
// medians from insights.json and routes the lead to the expert who owns
// the area.
type Bhk = "1" | "2" | "3" | "4";

function pctRank(value: number, area: string, bhk: Bhk): { pct: number; med: number; n: number } | null {
  const a = (data as any).areas[area];
  const bk = a?.by_bhk?.[bhk];
  if (!bk || !bk.med) return null;
  const med = bk.med;
  const p25 = bk.p25;
  const p75 = bk.p75;
  // Linear approx: 25 → p25, 50 → med, 75 → p75; clamp outside.
  let pct = 50;
  if (value <= p25) pct = Math.max(2, 25 * (value / Math.max(1, p25)));
  else if (value >= p75) pct = Math.min(98, 75 + 25 * Math.min(1, (value - p75) / Math.max(1, p75)));
  else if (value <= med) pct = 25 + 25 * ((value - p25) / Math.max(1, med - p25));
  else pct = 50 + 25 * ((value - med) / Math.max(1, p75 - med));
  return { pct: Math.round(pct), med, n: bk.n };
}

export function RentVerdict() {
  const sorted = useMemo(() => [...AREAS].sort((a, b) => a.name.localeCompare(b.name)), []);
  const [area, setArea] = useState(sorted[0]?.slug ?? "");
  const [bhk, setBhk] = useState<Bhk>("2");
  const [rent, setRent] = useState<number | "">("");

  const verdict = typeof rent === "number" && area ? pctRank(rent, area, bhk) : null;
  const a = AREA_BY_SLUG[area];

  // Compute 3 nearby cheaper alternatives within 8km on the same BHK.
  const alts = useMemo(() => {
    if (!a || !verdict) return [];
    return AREAS
      .filter((x) => x.slug !== a.slug)
      .map((x) => {
        const bk = (data as any).areas[x.slug]?.by_bhk?.[bhk];
        if (!bk) return null;
        const dx = (x.lat - a.lat) * 111;
        const dy = (x.lng - a.lng) * 111 * Math.cos((a.lat * Math.PI) / 180);
        const km = Math.sqrt(dx * dx + dy * dy);
        return { ...x, km, altMed: bk.med as number, altN: bk.n as number };
      })
      .filter((x): x is NonNullable<typeof x> => !!x && x.km <= 8 && x.altMed < (verdict.med ?? 0))
      .sort((a, b) => a.altMed - b.altMed)
      .slice(0, 3);
  }, [a, bhk, verdict]);

  const tone =
    !verdict ? "neutral" :
    verdict.pct >= 75 ? "high" :
    verdict.pct <= 35 ? "low" : "fair";
  const toneLabel = { high: "Likely overpaying", fair: "Fair-market rent", low: "Great deal", neutral: "" }[tone];
  const toneColor = { high: "oklch(0.585 0.22 27)", fair: "oklch(0.78 0.16 75)", low: "oklch(0.62 0.14 155)", neutral: "var(--primary)" }[tone];

  return (
    <div className="rounded-3xl border-2 border-primary/20 bg-card overflow-hidden shadow-[var(--shadow-card)]">
      <div className="px-6 md:px-8 pt-7 pb-5 border-b" style={{ background: "linear-gradient(135deg, oklch(0.985 0.005 70) 0%, oklch(0.97 0.02 45) 100%)" }}>
        <div className="text-[11px] font-bold uppercase tracking-widest text-primary">Reality check · 30 sec</div>
        <h2 className="mt-1.5 text-2xl md:text-3xl font-bold tracking-tight text-ink">
          Am I <span className="text-primary">overpaying</span>?
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground max-w-2xl">
          Type your rent and we'll tell you exactly where you sit on the {a?.name ?? "area"} curve, plus three nearby alternatives that cost less.
        </p>
      </div>

      <div className="grid md:grid-cols-[1fr_1.1fr]">
        {/* Inputs */}
        <div className="p-6 md:p-8 space-y-4 border-b md:border-b-0 md:border-r">
          <Field label="Area">
            <select value={area} onChange={(e) => setArea(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border bg-card focus:ring-2 focus:ring-primary/30 outline-none">
              {sorted.map((x) => <option key={x.slug} value={x.slug}>{x.name}</option>)}
            </select>
          </Field>
          <Field label="BHK">
            <div className="flex gap-1 rounded-full bg-secondary p-1">
              {(["1", "2", "3", "4"] as const).map((b) => (
                <button key={b} type="button" onClick={() => setBhk(b)} className={`flex-1 px-2 py-1.5 text-sm rounded-full transition ${bhk === b ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground"}`}>
                  {b} BHK
                </button>
              ))}
            </div>
          </Field>
          <Field label="Your monthly rent (₹)">
            <input
              type="number" inputMode="numeric"
              value={rent} onChange={(e) => setRent(e.target.value === "" ? "" : Math.max(0, +e.target.value))}
              placeholder="e.g. 38000"
              className="w-full px-3 py-3 rounded-lg border bg-card num text-lg focus:ring-2 focus:ring-primary/30 outline-none"
            />
          </Field>
          <div className="text-[11px] text-muted-foreground">
            Based on <span className="num font-semibold text-foreground">{(data as any).stats.pins.toLocaleString()}</span> verified rents pinned by neighbours.
          </div>
        </div>

        {/* Verdict */}
        <div className="p-6 md:p-8 bg-background/40">
          {!verdict && (
            <div className="h-full flex items-center justify-center text-center text-sm text-muted-foreground">
              Pick area, BHK and type your rent →<br />the verdict shows up here.
            </div>
          )}
          {verdict && (
            <>
              <div className="flex items-center gap-3">
                <div className="text-3xl">
                  {tone === "high" ? "🚩" : tone === "low" ? "🎉" : "⚖️"}
                </div>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: toneColor }}>{toneLabel}</div>
                  <div className="text-lg font-bold text-ink">
                    You sit at the <span className="num" style={{ color: toneColor }}>{verdict.pct}<sup className="text-xs">th</sup></span> percentile in {a?.name}
                  </div>
                </div>
              </div>

              {/* Curve bar */}
              <div className="mt-5 relative h-3 rounded-full bg-secondary overflow-hidden">
                <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: "100%", background: "linear-gradient(90deg, oklch(0.62 0.14 155) 0%, oklch(0.78 0.16 75) 50%, oklch(0.585 0.22 27) 100%)", opacity: 0.55 }} />
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-card border-2" style={{ left: `${verdict.pct}%`, borderColor: toneColor }} />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground num mt-1">
                <span>cheap</span><span>median {inr(verdict.med)}</span><span>premium</span>
              </div>

              {typeof rent === "number" && (
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <Mini label="Median in area" value={inr(verdict.med)} sub={`${verdict.n} ${bhk} BHK rents`} />
                  <Mini
                    label={rent > verdict.med ? "Above median by" : "Below median by"}
                    value={inrFull(Math.abs(rent - verdict.med))}
                    sub={rent > verdict.med ? "save with a switch" : "you're winning"}
                    accent={rent > verdict.med}
                  />
                </div>
              )}

              {alts.length > 0 && (
                <div className="mt-5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Cheaper within 8 km</div>
                  <div className="space-y-1.5">
                    {alts.map((x) => (
                      <div key={x.slug} className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border bg-card">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold truncate">{x.name}</div>
                          <div className="text-[11px] text-muted-foreground">{x.km.toFixed(1)} km · {x.altN} pins</div>
                        </div>
                        <div className="text-right">
                          <div className="num text-sm font-bold text-[oklch(0.62_0.14_155)]">{inr(x.altMed)}</div>
                          <div className="text-[10px] num text-muted-foreground">save ~{inr(Math.max(0, verdict.med - x.altMed))}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {a && (
                <a
                  href={waArea(a.name, verdict.med, undefined, a.slug)}
                  target="_blank" rel="noreferrer"
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 px-4 py-3 rounded-full font-bold text-white shadow-[var(--shadow-glow)]"
                  style={{ background: "var(--gradient-orange)" }}
                >
                  <WhatsAppIcon className="w-4 h-4" /> Send me cheaper Gharpayy options
                </a>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{label}</div>
      {children}
    </label>
  );
}

function Mini({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className={`px-3 py-2.5 rounded-xl border ${accent ? "bg-primary/5 border-primary/30" : "bg-card"}`}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
      <div className={`num font-bold text-base mt-0.5 ${accent ? "text-primary" : "text-ink"}`}>{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}
