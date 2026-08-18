// @ts-nocheck
import { useEffect } from "react";
import { Link } from "wouter";
import { AdminShell, Panel, Kpi, Tag, stateTone } from "./AdminShell";
import { repo, useFM, cityKpis, markets, missions, money } from "@/flatmates/backend";

export default function AdminCommand() {
  useEffect(() => { repo.ensureSeed(); }, []);
  const k = useFM(() => cityKpis());
  const m = useFM(() => markets());
  const ms = useFM(() => missions());

  return (
    <AdminShell
      title="City command centre"
      sub="One board for both sides of the market — beds on one side, seekers on the other."
      action={<Link href="/flatmates/admin/missions" className="px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold">Today's missions ({ms.length})</Link>}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-2.5 mb-5">
        <Kpi label="Live beds" value={k.liveSupply} hint={`${k.totalSupply} total inventory`} tone="primary" />
        <Kpi label="Active seekers" value={k.demand} hint="verified demand" />
        <Kpi label="Seekers / bed" value={`${k.ratio}×`} hint={k.ratio >= 1.5 ? "supply starved" : "healthy"} tone={k.ratio >= 1.5 ? "bad" : "good"} />
        <Kpi label="Median rent" value={money(k.medianRent)} hint="live rooms" />
        <Kpi label="Mutuals" value={k.mutuals} hint={`${k.conversion}% of interests`} tone="good" />
        <Kpi label="Stale listings" value={k.stale} hint="need re-verification" tone={k.stale ? "warn" : "good"} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Panel className="lg:col-span-2" title="Micro-market liquidity" sub="Ratio = seekers per available bed. Red means we are losing demand.">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/60 text-[10px] uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-2 font-bold">Area</th>
                  <th className="text-right px-3 py-2 font-bold">Beds</th>
                  <th className="text-right px-3 py-2 font-bold">Seekers</th>
                  <th className="text-right px-3 py-2 font-bold">Ratio</th>
                  <th className="text-right px-3 py-2 font-bold">Median</th>
                  <th className="text-right px-3 py-2 font-bold">Budget gap</th>
                  <th className="text-left px-3 py-2 font-bold">State</th>
                </tr>
              </thead>
              <tbody>
                {m.map((x: any) => (
                  <tr key={x.area} className="border-t border-border">
                    <td className="px-4 py-2.5 font-semibold">{x.area}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{x.supplyRooms + x.readyBeds}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{x.demand}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums font-semibold">{x.ratio}×</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{money(x.medianRent)}</td>
                    <td className={`px-3 py-2.5 text-right tabular-nums ${x.gap < 0 ? "text-destructive" : "text-emerald-600"}`}>
                      {x.gap >= 0 ? "+" : "−"}{money(Math.abs(x.gap))}
                    </td>
                    <td className="px-3 py-2.5"><Tag tone={stateTone[x.state]}>{x.state}</Tag></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Top moves right now" sub="Auto-generated from live supply/demand imbalance">
          <div className="divide-y divide-border">
            {ms.slice(0, 8).map((t: any) => (
              <div key={t.id} className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Tag tone={t.lane === "supply" ? "bad" : t.lane === "demand" ? "warn" : t.lane === "trust" ? "primary" : "good"}>{t.lane}</Tag>
                  <span className="text-[11px] text-muted-foreground">{t.area}</span>
                </div>
                <p className="text-sm font-semibold mt-1 leading-snug">{t.title}</p>
                <p className="text-[11px] text-muted-foreground">{t.why}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </AdminShell>
  );
}
