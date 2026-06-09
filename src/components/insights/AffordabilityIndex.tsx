import { useMemo, useState } from "react";
import { affordability } from "@/lib/insights-utils";
import { inrFull, inr } from "@/lib/format";
import { Link } from "@tanstack/react-router";

export function AffordabilityIndex() {
  const [salary, setSalary] = useState(80000);
  const all = useMemo(() => affordability(salary), [salary]);
  const comfort = all.filter((a) => a.fits.some((f) => f.zone === "comfort"));
  const stretch = all.filter((a) => !a.fits.some((f) => f.zone === "comfort") && a.fits.some((f) => f.zone === "stretch"));
  const budget25 = Math.round(salary * 0.25);
  const budget35 = Math.round(salary * 0.35);

  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-7 w-full">
      <div className="text-[11px] uppercase tracking-widest text-primary font-bold">Affordability index 📐</div>
      <h2 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight">Where can your salary actually live?</h2>
      <p className="mt-1 text-sm text-muted-foreground">25% of take-home = comfort. 35% = stretch. Above that = financial stress.</p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label className="text-xs text-muted-foreground">Monthly take-home</label>
        <input type="number" value={salary} onChange={(e) => setSalary(Number(e.target.value) || 0)} className="px-3 py-2 rounded-xl border bg-background text-sm num font-bold w-32" />
        <input type="range" min={20000} max={300000} step={5000} value={salary} onChange={(e) => setSalary(Number(e.target.value))} className="flex-1 min-w-[150px] accent-[oklch(0.715_0.185_45)]" />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
        <Zone label="🟢 Comfort" sub={`≤ ${inr(budget25)}`} count={comfort.length} tone="good" />
        <Zone label="🟡 Stretch" sub={`≤ ${inr(budget35)}`} count={stretch.length} tone="warn" />
        <Zone label="🔴 Out of reach" sub={`> ${inr(budget35)}`} count={Math.max(0, 38 - all.length)} tone="bad" />
      </div>

      <Group title="🟢 Live comfortably" areas={comfort.slice(0, 9)} />
      <Group title="🟡 Doable but tight" areas={stretch.slice(0, 6)} />
    </section>
  );
}

function Zone({ label, sub, count, tone }: { label: string; sub: string; count: number; tone: "good" | "warn" | "bad" }) {
  const cls = tone === "good" ? "border-success/40 bg-success/5" : tone === "warn" ? "border-warning/40 bg-warning/5" : "border-destructive/30 bg-destructive/5";
  return (
    <div className={`rounded-xl border p-3 ${cls}`}>
      <div className="font-bold text-ink text-sm">{label}</div>
      <div className="text-[10px] text-muted-foreground num">{sub}</div>
      <div className="mt-1 text-2xl num font-bold text-ink">{count}</div>
      <div className="text-[10px] text-muted-foreground">areas</div>
    </div>
  );
}

function Group({ title, areas }: { title: string; areas: ReturnType<typeof affordability> }) {
  if (!areas.length) return null;
  return (
    <div className="mt-4">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{title}</div>
      <div className="mt-2 grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {areas.map((a) => (
          <Link key={a.slug} to="/area/$slug" params={{ slug: a.slug }} className="rounded-2xl border bg-card hover:border-primary/40 transition p-3">
            <div className="flex justify-between items-start gap-2">
              <div className="font-bold text-sm text-ink">{a.name}</div>
              <div className="text-[11px] text-muted-foreground num">med {inr(a.med)}</div>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {a.fits.map((f) => (
                <span key={f.bhk} className={`text-[10px] font-bold px-1.5 py-0.5 rounded num ${f.zone === "comfort" ? "bg-success/15 text-success" : f.zone === "stretch" ? "bg-warning/15 text-warning" : "bg-destructive/10 text-destructive"}`}>
                  {f.bhk}BHK · {inr(f.med)}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
