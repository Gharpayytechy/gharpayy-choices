import { useMemo, useState } from "react";
import { ALL_AREA_LIST, projectionSeries } from "@/lib/insights-utils";
import { inr, inrFull } from "@/lib/format";
import { waConcierge } from "@/lib/wa";
import { Link } from "@tanstack/react-router";

export function UpgradePathCalc() {
  const [pgRent, setPgRent] = useState(8500);
  const [savings, setSavings] = useState(15000);
  const [months, setMonths] = useState(8);

  const series = useMemo(() => projectionSeries(pgRent, savings, months), [pgRent, savings, months]);
  const totalSaved = series.at(-1)?.total ?? 0;
  const flatBudget = Math.round((pgRent + savings) / 1000) * 1000;
  const deposit = flatBudget * 2;
  const max = Math.max(...series.map((s) => s.total));

  const reachable = useMemo(() => {
    return ALL_AREA_LIST
      .map((a: any) => ({ slug: a.slug, name: a.name, med1: a.by_bhk?.["1"]?.med, med2: a.by_bhk?.["2"]?.med, demand: a.demand_score }))
      .map((a) => ({ ...a, fits: a.med1 && a.med1 <= flatBudget ? "1" : a.med2 && a.med2 <= flatBudget ? "2" : null, m: a.med1 ?? a.med2 }))
      .filter((a) => a.fits)
      .sort((a, b) => (b.demand ?? 0) - (a.demand ?? 0))
      .slice(0, 8);
  }, [flatBudget]);

  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-7 w-full">
      <div className="rounded-3xl border-2 border-primary/30 p-5 md:p-7" style={{ background: "var(--gradient-hero)" }}>
        <div className="text-[11px] uppercase tracking-widest text-primary font-bold">Upgrade path calculator 🪜</div>
        <h2 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight">PG today → flat tomorrow</h2>
        <p className="mt-1 text-sm text-muted-foreground">See how a few months in a Gharpayy PG funds your future flat · and which areas you can actually move into.</p>

        <div className="mt-4 grid sm:grid-cols-3 gap-3">
          <Field label="PG rent / month" v={pgRent} set={setPgRent} />
          <Field label="Saved / month" v={savings} set={setSavings} />
          <Field label="Months in PG" v={months} set={setMonths} max={36} />
        </div>

        {/* Savings projection chart */}
        <div className="mt-5 rounded-2xl border bg-card p-4">
          <div className="flex items-baseline justify-between mb-1">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Cumulative savings</div>
            <div className="text-sm num font-bold text-primary">{inrFull(totalSaved)} by month {months}</div>
          </div>
          <div className="h-24 flex items-end gap-1">
            {series.map((s, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1">
                <div className="w-full rounded-t-sm bg-primary/70 transition-all" style={{ height: `${(s.total / max) * 100}%` }} title={`Month ${s.m}: ${inrFull(s.total)}`} />
                {months <= 18 && <span className="text-[9px] text-muted-foreground num">{s.m}</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 grid sm:grid-cols-3 gap-3">
          <Stat k="Total saved" v={inrFull(totalSaved)} />
          <Stat k="Comfortable flat budget" v={inrFull(flatBudget)} accent />
          <Stat k="Deposit (Gharpayy 2mo)" v={inrFull(deposit)} />
        </div>

        {/* Reachable areas */}
        {reachable.length > 0 && (
          <div className="mt-5">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Areas you can move into at {inr(flatBudget)}</div>
            <div className="mt-2 flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x">
              {reachable.map((a) => (
                <Link key={a.slug} to="/area/$slug" params={{ slug: a.slug }} className="snap-start shrink-0 w-44 rounded-xl border bg-card hover:border-primary/40 p-3">
                  <div className="font-bold text-sm text-ink truncate">{a.name}</div>
                  <div className="text-[11px] text-muted-foreground num">{a.fits} BHK · median {inr(a.m!)}</div>
                  <div className="mt-1 text-[10px] text-success font-bold">High demand</div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <a href={waConcierge(`Plan: ${months} months in a ${inr(pgRent)} PG, then upgrade to a ${inr(flatBudget)} flat`)} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center px-5 py-3 rounded-full text-sm font-bold text-white" style={{ background: "var(--gradient-orange)" }}>
          Lock my upgrade plan with expert →
        </a>
      </div>
    </section>
  );
}

function Field({ label, v, set, max = 100000 }: { label: string; v: number; set: (n: number) => void; max?: number }) {
  return (
    <div>
      <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{label}</label>
      <input type="number" value={v} max={max} onChange={(e) => set(Number(e.target.value) || 0)} className="mt-1 w-full px-3 py-2.5 rounded-xl border bg-background text-sm num font-bold" />
    </div>
  );
}
function Stat({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-3 ${accent ? "border-primary/40 bg-primary/5" : "bg-card"}`}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{k}</div>
      <div className="mt-1 text-xl num font-bold text-ink">{v}</div>
    </div>
  );
}
