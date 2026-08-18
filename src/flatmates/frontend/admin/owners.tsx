// @ts-nocheck
import { useEffect, useState } from "react";
import { toast } from "@/referral-app/hooks/use-toast";
import { AdminShell, Panel, Kpi, Tag } from "./AdminShell";
import { repo, useFM, ownerBoard, ownerPortfolios, money, opsActions } from "@/flatmates/backend";

const PRICING: any = { overpriced: "bad", underpriced: "warn", market: "good" };

export default function AdminOwners() {
  useEffect(() => { repo.ensureSeed(); }, []);
  const board = useFM(() => ownerBoard());
  const portfolios = useFM(() => ownerPortfolios());
  const [open, setOpen] = useState<string | null>(null);

  const revenueAtRisk = board.reduce((a: number, r: any) => a + (r.revenueAtRisk || 0), 0);
  const overpriced = board.filter((r: any) => r.pricing === "overpriced");

  return (
    <AdminShell
      title="Owner board"
      sub="Landlord-side truth: what each household earns, what it risks, and the exact recommendation to send."
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-4">
        <Kpi label="Households" value={portfolios.length} tone="primary" />
        <Kpi label="Listings" value={board.length} />
        <Kpi label="Revenue at risk" value={money(revenueAtRisk)} hint="live beds with zero demand" tone={revenueAtRisk ? "bad" : "good"} />
        <Kpi label="Overpriced" value={overpriced.length} hint="12%+ above market median" tone={overpriced.length ? "warn" : "good"} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Panel title="Portfolios" sub="Grouped by household — click to expand the beds.">
          <div className="divide-y divide-border">
            {portfolios.map((o: any) => (
              <div key={o.owner}>
                <button
                  onClick={() => setOpen(open === o.owner ? null : o.owner)}
                  className="w-full text-left p-4 flex items-center gap-3 hover:bg-muted/40 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{o.owner}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {o.area} · {o.beds} beds · {o.live} live · {o.stale} stale
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-semibold tabular-nums text-sm">{money(o.rent)}</p>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">monthly</p>
                  </div>
                  <Tag tone={o.score >= 80 ? "good" : o.score >= 55 ? "warn" : "bad"}>{o.score}</Tag>
                </button>
                {open === o.owner && (
                  <div className="bg-muted/30 px-4 pb-3 divide-y divide-border/60">
                    {o.rooms.map((r: any) => (
                      <div key={r.id} className="py-2.5 flex items-center gap-2 flex-wrap">
                        <p className="text-xs font-semibold flex-1 min-w-[150px]">{r.title}</p>
                        <span className="text-[11px] text-muted-foreground tabular-nums">
                          {money(r.rent)} vs mkt {money(r.marketRent)}
                        </span>
                        <button onClick={() => { opsActions.reprice(r.id, r.marketRent); toast(`${r.title} priced to market`); }} className="px-2 py-1 rounded-md border border-border text-[11px] font-semibold">Match market</button>
                        <button onClick={() => { opsActions.reverify(r.id); toast(`${r.title} re-verified`); }} className="px-2 py-1 rounded-md bg-primary/10 text-primary text-[11px] font-semibold">Re-verify</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {!portfolios.length && <p className="p-6 text-sm text-muted-foreground">No owner supply yet.</p>}
          </div>
        </Panel>

        <Panel title="Listing recommendations" sub="Ready-to-send advice, sorted by money left on the table.">
          <div className="divide-y divide-border">
            {[...board]
              .sort((a: any, b: any) => b.revenueAtRisk - a.revenueAtRisk)
              .map((r: any) => (
                <div key={r.id} className="p-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag tone={PRICING[r.pricing]}>{r.pricing}</Tag>
                    <Tag tone={r.health === "stale" ? "bad" : r.health === "aging" ? "warn" : "good"}>{r.health}</Tag>
                    <span className="text-[11px] text-muted-foreground">{r.area} · {r.demandRatio}× demand</span>
                  </div>
                  <p className="font-semibold text-sm mt-1">{r.title}</p>
                  <p className="text-[11px] text-muted-foreground tabular-nums">
                    {money(r.rent)} · market {money(r.marketRent)} · {r.matchableSeekers} matchable · {r.daysVacant}d since verify
                  </p>
                  <p className="text-[12px] text-primary font-medium mt-1.5">{r.recommendation}</p>
                  <div className="flex gap-1.5 mt-2">
                    <button onClick={() => { opsActions.reprice(r.id, r.marketRent); toast(`${r.title} priced to market`); }} className="px-2.5 py-1.5 rounded-lg border border-border text-xs font-semibold">Apply price</button>
                    <button onClick={() => { opsActions.reverify(r.id); toast(`${r.title} re-verified`); }} className="px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold">Re-verify</button>
                    <button onClick={() => { opsActions.log("owner", `Sent recommendation for ${r.title}`); toast(`Recommendation sent to the owner of ${r.title}`); }} className="px-2.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold">Send to owner</button>
                  </div>
                </div>
              ))}
            {!board.length && <p className="p-6 text-sm text-muted-foreground">Nothing to recommend yet.</p>}
          </div>
        </Panel>
      </div>
    </AdminShell>
  );
}
