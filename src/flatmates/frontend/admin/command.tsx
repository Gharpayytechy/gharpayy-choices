// @ts-nocheck
import { useEffect } from "react";
import { Link } from "wouter";
import { AdminShell, Panel, Kpi, Tag, stateTone } from "./AdminShell";
import {
  repo,
  useFM,
  cityKpis,
  markets,
  missionBoard,
  money,
  healthScore,
  alerts,
  funnel,
  bottleneck,
  trustBoard,
  opsLog,
} from "@/flatmates/backend";

const LEVEL: any = { critical: "bad", warn: "warn", good: "good" };

export default function AdminCommand() {
  useEffect(() => { repo.ensureSeed(); }, []);
  const k = useFM(() => cityKpis());
  const m = useFM(() => markets());
  const ms = useFM(() => missionBoard());
  const health = useFM(() => healthScore());
  const al = useFM(() => alerts());
  const fn = useFM(() => funnel());
  const bn = useFM(() => bottleneck());
  const trust = useFM(() => trustBoard());
  const log = useFM(() => opsLog(8));

  const openMissions = ms.filter((x: any) => x.status !== "done");

  return (
    <AdminShell
      title="City command centre"
      sub="One board for both sides of the market — beds on one side, seekers on the other."
      action={
        <Link href="/flatmates/admin/missions" className="px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold">
          Today's missions ({openMissions.length})
        </Link>
      }
    >
      {/* Health + alerts */}
      <div className="grid lg:grid-cols-3 gap-4 mb-5">
        <Panel title="Marketplace health" sub="Weighted across liquidity, freshness, trust, conversion and balance.">
          <div className="p-4 flex items-center gap-4">
            <div className="relative w-20 h-20 shrink-0">
              <div
                className="w-20 h-20 rounded-full"
                style={{ background: `conic-gradient(var(--primary, currentColor) ${health.score * 3.6}deg, hsl(var(--muted)) 0deg)` }}
              />
              <div className="absolute inset-[6px] rounded-full bg-card grid place-items-center">
                <span className="font-display text-xl font-semibold tabular-nums">{health.score}</span>
              </div>
            </div>
            <div className="flex-1 space-y-1.5">
              {health.parts.map((p: any) => (
                <div key={p.label} className="flex items-center gap-2">
                  <span className="text-[11px] w-20 text-muted-foreground">{p.label}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${Math.min(100, p.value)}%` }} />
                  </div>
                  <span className="text-[11px] tabular-nums w-8 text-right">{p.value}</span>
                </div>
              ))}
            </div>
            <Tag tone={health.score >= 80 ? "good" : health.score >= 65 ? "primary" : health.score >= 50 ? "warn" : "bad"}>
              grade {health.grade}
            </Tag>
          </div>
        </Panel>

        <Panel className="lg:col-span-2" title="Live alerts" sub="Ranked by damage to the market right now.">
          <div className="divide-y divide-border max-h-[240px] overflow-y-auto">
            {al.map((a: any) => (
              <div key={a.id} className="px-4 py-3 flex items-center gap-3">
                <Tag tone={LEVEL[a.level]}>{a.level}</Tag>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold leading-snug">{a.title}</p>
                  <p className="text-[11px] text-muted-foreground">{a.detail}</p>
                </div>
                <Link href={a.href} className="px-2.5 py-1.5 rounded-lg border border-border text-[11px] font-semibold whitespace-nowrap">
                  {a.cta}
                </Link>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-2.5 mb-5">
        <Kpi label="Live beds" value={k.liveSupply} hint={`${k.totalSupply} total inventory`} tone="primary" />
        <Kpi label="Active seekers" value={k.demand} hint="verified demand" />
        <Kpi label="Seekers / bed" value={`${k.ratio}×`} hint={k.ratio >= 1.5 ? "supply starved" : "healthy"} tone={k.ratio >= 1.5 ? "bad" : "good"} />
        <Kpi label="Median rent" value={money(k.medianRent)} hint="live rooms" />
        <Kpi label="Mutuals" value={k.mutuals} hint={`${k.conversion}% of interests`} tone="good" />
        <Kpi label="Stale listings" value={k.stale} hint="need re-verification" tone={k.stale ? "warn" : "good"} />
      </div>

      {/* Funnel */}
      <Panel className="mb-5" title="Match funnel" sub={bn ? `Weakest step: ${bn.label} at ${bn.stepConv}% — ${bn.fix}` : "Seeker → moved in."}>
        <div className="p-4 grid sm:grid-cols-5 gap-3">
          {fn.map((s: any) => (
            <div key={s.key} className="rounded-xl border border-border p-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{s.label}</p>
              <p className="font-display text-xl font-semibold tabular-nums mt-1">{s.value}</p>
              <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${s.pctOfTop}%` }} />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                {s.stepConv}% step{s.drop ? ` · −${s.drop}` : ""}
              </p>
            </div>
          ))}
        </div>
      </Panel>

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

        <div className="space-y-4">
          <Panel title="Top moves right now" sub="Auto-generated from live supply/demand imbalance">
            <div className="divide-y divide-border">
              {openMissions.slice(0, 6).map((t: any) => (
                <div key={t.id} className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Tag tone={t.lane === "supply" ? "bad" : t.lane === "demand" ? "warn" : t.lane === "trust" ? "primary" : "good"}>{t.lane}</Tag>
                    <span className="text-[11px] text-muted-foreground">{t.area}</span>
                  </div>
                  <p className="text-sm font-semibold mt-1 leading-snug">{t.title}</p>
                  <p className="text-[11px] text-muted-foreground">{t.why}</p>
                </div>
              ))}
              {!openMissions.length && <p className="p-6 text-sm text-muted-foreground">Board is clear.</p>}
            </div>
          </Panel>

          <Panel title="Trust" sub="Verification coverage across both sides.">
            <div className="p-4 grid grid-cols-2 gap-2.5 text-sm">
              <div><p className="text-[10px] uppercase tracking-wide text-muted-foreground">Rooms verified</p><p className="font-display font-semibold tabular-nums">{trust.roomsVerified}/{trust.roomsTotal}</p></div>
              <div><p className="text-[10px] uppercase tracking-wide text-muted-foreground">Phone verified</p><p className="font-display font-semibold tabular-nums">{trust.phoneVerified}/{trust.peopleTotal}</p></div>
              <div><p className="text-[10px] uppercase tracking-wide text-muted-foreground">ID verified</p><p className="font-display font-semibold tabular-nums">{trust.idVerified}</p></div>
              <div><p className="text-[10px] uppercase tracking-wide text-muted-foreground">Stale rooms</p><p className="font-display font-semibold tabular-nums">{trust.staleRooms}</p></div>
            </div>
          </Panel>

          <Panel title="Recent ops activity">
            <div className="divide-y divide-border">
              {log.map((l: any) => (
                <div key={l.id} className="px-4 py-2 flex items-center gap-2">
                  <Tag tone="muted">{l.lane}</Tag>
                  <p className="text-[12px] flex-1 truncate">{l.text}</p>
                </div>
              ))}
              {!log.length && <p className="px-4 py-5 text-sm text-muted-foreground">No actions yet.</p>}
            </div>
          </Panel>
        </div>
      </div>
    </AdminShell>
  );
}
