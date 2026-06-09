import { useState } from "react";
import { depositLadder, fdOpportunityCost } from "@/lib/insights-utils";
import { inr, inrFull } from "@/lib/format";

export function DepositCalc({ defaultMed = 30000 }: { defaultMed?: number }) {
  const [rent, setRent] = useState(defaultMed);
  const [stay, setStay] = useState(18); // months expected stay
  const ladder = depositLadder(rent);
  const max = Math.max(...ladder.map((r) => r.total));

  // additional one-off move-in line items
  const moveIn = [
    { k: "Token / advance", v: 5000 },
    { k: "Painting / cleaning", v: Math.round(rent * 0.5) },
    { k: "Police verification", v: 500 },
    { k: "Movers (1 BHK)", v: 4500 },
  ];
  const moveInTotal = moveIn.reduce((s, x) => s + x.v, 0);

  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-7 w-full">
      <div className="text-[11px] uppercase tracking-widest text-primary font-bold">Deposit reality 💰</div>
      <h2 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight">How much will the deposit hurt?</h2>
      <p className="mt-1 text-sm text-muted-foreground">Standalone owners ask 6–10 months. Gharpayy caps at 2. We also show the FD income you forgo while it sits idle.</p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label className="text-xs text-muted-foreground">Monthly rent</label>
        <input type="number" value={rent} onChange={(e) => setRent(Number(e.target.value) || 0)} className="px-3 py-2 rounded-xl border bg-background text-sm num font-bold w-28" />
        <label className="text-xs text-muted-foreground">Stay (months)</label>
        <input type="number" value={stay} onChange={(e) => setStay(Number(e.target.value) || 1)} className="px-3 py-2 rounded-xl border bg-background text-sm num font-bold w-20" />
      </div>

      <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {ladder.map((r) => {
          const fd = fdOpportunityCost(r.total, stay);
          const effRent = Math.round(((rent * stay) + fd) / stay);
          const isGp = r.label.includes("Gharpayy");
          return (
            <div key={r.label} className={`rounded-2xl border p-4 ${isGp ? "border-primary/40 bg-primary/5" : "bg-card"}`}>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{r.label}</div>
              <div className="mt-1 text-xl num font-bold text-ink">{inrFull(r.total)}</div>
              <div className="text-[11px] text-muted-foreground">{r.months} months · {r.note}</div>
              <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
                <div className={`h-full ${isGp ? "bg-primary" : "bg-warning"}`} style={{ width: `${(r.total / max) * 100}%` }} />
              </div>
              <div className="mt-2 text-[11px] text-muted-foreground">
                FD income forgone <span className="num font-bold text-warning">{inrFull(fd)}</span><br />
                Effective rent <span className="num font-bold text-ink">{inr(effRent)}/mo</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid sm:grid-cols-2 gap-3">
        <div className="rounded-2xl border bg-card p-4">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Other one-off move-in costs</div>
          <ul className="mt-2 space-y-1 text-sm">
            {moveIn.map((m) => (
              <li key={m.k} className="flex justify-between"><span className="text-muted-foreground">{m.k}</span><span className="num font-bold text-ink">{inrFull(m.v)}</span></li>
            ))}
            <li className="flex justify-between border-t pt-2 mt-2"><span className="font-bold">Total</span><span className="num font-bold text-primary">{inrFull(moveInTotal)}</span></li>
          </ul>
        </div>
        <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-4">
          <div className="text-[10px] uppercase tracking-wider text-primary font-bold">Day-1 cash needed (society norm)</div>
          <div className="mt-1 text-3xl num font-bold text-ink">{inrFull(rent + rent * 4 + moveInTotal)}</div>
          <div className="text-xs text-muted-foreground">1 month rent + 4 months deposit + move-in costs</div>
          <div className="mt-3 text-[10px] uppercase tracking-wider text-success font-bold">With Gharpayy Home</div>
          <div className="mt-1 text-3xl num font-bold text-ink">{inrFull(rent + rent * 2 + 5000)}</div>
          <div className="text-xs text-muted-foreground">1 month rent + 2 months deposit + token</div>
          <div className="mt-2 text-sm font-bold text-success num">You free up ~{inrFull(rent * 2 + moveInTotal - 5000)} of working capital</div>
        </div>
      </div>
    </section>
  );
}
