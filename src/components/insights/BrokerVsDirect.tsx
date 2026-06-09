import { useState } from "react";
import { inr, inrFull } from "@/lib/format";

export function BrokerVsDirect({ med = 30000 }: { med?: number }) {
  const [rent, setRent] = useState(med);
  const [stay, setStay] = useState(18);

  // 12+ month TCO of finding-the-place per channel
  const channels = [
    {
      k: "🤵 Broker",
      tone: "bad" as const,
      finder: rent * 1.18,        // 1 month + GST
      hidden: 8000,                // re-paint, security top-up, surprise charges
      note: "1 month finder fee + GST. Often pushes overpriced inventory.",
    },
    {
      k: "📲 Listings app",
      tone: "ok" as const,
      finder: 2500,                // premium plan
      hidden: 4000,                // wasted commute on dead listings
      note: "Pay-to-call + ghost listings. ~30% leads convert to a tour.",
    },
    {
      k: "🏡 Gharpayy",
      tone: "good" as const,
      finder: 0,
      hidden: 0,
      note: "Direct to owner, expert handles paperwork & police verification.",
    },
  ];
  const max = Math.max(...channels.map((c) => c.finder + c.hidden));

  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-7 w-full">
      <div className="text-[11px] uppercase tracking-widest text-primary font-bold">Broker vs direct ✋</div>
      <h2 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight">What you save by skipping brokers</h2>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label className="text-xs text-muted-foreground">Rent</label>
        <input type="number" value={rent} onChange={(e) => setRent(Number(e.target.value) || 0)} className="px-3 py-2 rounded-xl border bg-background text-sm num font-bold w-28" />
        <label className="text-xs text-muted-foreground">Months you'll stay</label>
        <input type="number" value={stay} onChange={(e) => setStay(Number(e.target.value) || 1)} className="px-3 py-2 rounded-xl border bg-background text-sm num font-bold w-20" />
      </div>

      <div className="mt-4 grid sm:grid-cols-3 gap-3">
        {channels.map((c) => {
          const total = c.finder + c.hidden;
          const perMonth = Math.round(total / stay);
          const cls = c.tone === "good" ? "border-primary/40 bg-primary/5" : c.tone === "bad" ? "border-destructive/30 bg-destructive/5" : "bg-card";
          const num = c.tone === "good" ? "text-success" : c.tone === "bad" ? "text-destructive" : "text-warning";
          return (
            <div key={c.k} className={`rounded-2xl border p-4 ${cls}`}>
              <div className="text-sm font-bold text-ink">{c.k}</div>
              <div className={`mt-2 text-2xl num font-bold ${num}`}>{total === 0 ? "₹0" : `−${inrFull(total)}`}</div>
              <div className="mt-2 h-2 rounded-full bg-secondary overflow-hidden">
                <div className={`h-full ${c.tone === "good" ? "bg-success" : c.tone === "bad" ? "bg-destructive" : "bg-warning"}`} style={{ width: `${(total / Math.max(max, 1)) * 100}%` }} />
              </div>
              <div className="mt-2 text-[11px] text-muted-foreground">
                Finder fee <span className="num font-bold text-ink">{inrFull(c.finder)}</span><br />
                Hidden / friction <span className="num font-bold text-ink">{inrFull(c.hidden)}</span><br />
                Spread over {stay} mo → <span className="num font-bold text-ink">+{inr(perMonth)}/mo</span>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground leading-snug">{c.note}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-3 rounded-xl border-2 border-success/30 bg-success/5 p-4 text-sm">
        Going via Gharpayy keeps roughly{" "}
        <span className="num font-bold text-success">{inrFull(channels[0].finder + channels[0].hidden)}</span>{" "}
        in your pocket · that's ~{Math.round(((channels[0].finder + channels[0].hidden) / rent) * 10) / 10} months of free rent on a {inr(rent)} flat.
      </div>
    </section>
  );
}
