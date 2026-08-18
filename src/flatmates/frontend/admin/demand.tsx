// @ts-nocheck
import { useEffect, useMemo, useState } from "react";
import { AdminShell, Panel, Kpi, Tag } from "./AdminShell";
import { repo, useFM, demandDesk, demandCohorts, money, opsActions } from "@/flatmates/backend";
import { toast } from "@/referral-app/hooks/use-toast";

const SEV: any = { blocked: "bad", "at-risk": "warn", healthy: "good" };

export default function AdminDemand() {
  useEffect(() => { repo.ensureSeed(); }, []);
  const rows = useFM(() => demandDesk());
  const cohorts = useFM(() => demandCohorts());
  const [sev, setSev] = useState("all");
  const [q, setQ] = useState("");
  const [area, setArea] = useState("all");

  const areas = useMemo(() => Array.from(new Set(rows.map((r: any) => r.area).filter(Boolean))), [rows]);

  const list = rows.filter((r: any) => {
    if (sev !== "all" && r.severity !== sev) return false;
    if (area !== "all" && r.area !== area) return false;
    if (q && !`${r.name} ${r.area} ${r.occupation || ""}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const blocked = rows.filter((r: any) => r.severity === "blocked").length;

  return (
    <AdminShell
      title="Demand desk"
      sub="Every seeker, how many beds they can actually afford, and the one move that unblocks them."
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-4">
        <Kpi label="Seekers" value={rows.length} tone="primary" />
        <Kpi label="Blocked" value={blocked} hint="zero options in budget" tone={blocked ? "bad" : "good"} />
        <Kpi label="At risk" value={rows.filter((r: any) => r.severity === "at-risk").length} tone="warn" />
        <Kpi
          label="Avg options"
          value={rows.length ? (rows.reduce((a: number, r: any) => a + r.options, 0) / rows.length).toFixed(1) : 0}
          hint="live beds per seeker"
        />
      </div>

      <Panel className="mb-4" title="Budget cohorts" sub="Where demand piles up and where it suffocates.">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border">
          {cohorts.map((c: any) => (
            <div key={c.band} className="p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{c.band}</p>
              <p className="font-display text-2xl font-semibold tabular-nums mt-1">{c.seekers}</p>
              <p className="text-[11px] text-muted-foreground">{c.avgOptions} avg options</p>
              <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-destructive" style={{ width: `${c.blockedPct}%` }} />
              </div>
              <p className="text-[11px] mt-1 text-muted-foreground">{c.blockedPct}% blocked</p>
            </div>
          ))}
        </div>
      </Panel>

      <div className="flex flex-wrap gap-2 mb-3">
        {["all", "blocked", "at-risk", "healthy"].map((f) => (
          <button
            key={f}
            onClick={() => setSev(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${sev === f ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"}`}
          >
            {f}
          </button>
        ))}
        <select
          value={area}
          onChange={(e) => setArea(e.target.value)}
          className="h-9 px-3 rounded-full border border-border bg-card text-xs"
        >
          <option value="all">All areas</option>
          {areas.map((a: any) => <option key={a} value={a}>{a}</option>)}
        </select>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search seeker"
          className="ml-auto h-9 px-3 rounded-full border border-border bg-card text-xs min-w-[200px]"
        />
      </div>

      <Panel>
        <div className="divide-y divide-border">
          {list.map((p: any) => (
            <div key={p.id} className="p-4 flex flex-wrap items-center gap-3">
              <div className="min-w-[240px] flex-1">
                <div className="flex items-center gap-2">
                  <Tag tone={SEV[p.severity]}>{p.severity}</Tag>
                  {p.verified?.phone && <Tag tone="good">phone</Tag>}
                  {p.household && <Tag tone="primary">housed</Tag>}
                </div>
                <p className="font-semibold text-sm mt-1">{p.name || "Unnamed seeker"}</p>
                <p className="text-[11px] text-muted-foreground">
                  {p.area || "no area"} · {p.occupation || "—"} · budget {money(p.budgetMax || 0)} · {p.roomType || "any room"}
                </p>
                <p className="text-[11px] text-primary font-medium mt-1">{p.unblock}</p>
              </div>
              <div className="text-center px-3">
                <p className="font-display font-semibold tabular-nums">{p.options}</p>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">options</p>
              </div>
              <div className="text-right px-3">
                <p className="font-display font-semibold tabular-nums">{p.cheapest ? money(p.cheapest) : "—"}</p>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">cheapest</p>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => { opsActions.raiseBudget(p.id, 1500); toast(`${p.name || "Seeker"} budget raised by ₹1,500`); }} className="px-2.5 py-1.5 rounded-lg border border-border text-xs font-semibold">+₹1.5k budget</button>
                <button onClick={() => { opsActions.nudgeSeeker(p.id, p.unblock); toast(`Nudge sent to ${p.name || "seeker"}`); }} className="px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold">Nudge</button>
                <button onClick={() => { opsActions.log("demand", `Called ${p.name}`); toast(`Call logged for ${p.name || "seeker"}`); }} className="px-2.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold">Log call</button>
              </div>
            </div>
          ))}
          {!list.length && <p className="p-6 text-sm text-muted-foreground">No seekers match this filter.</p>}
        </div>
      </Panel>
    </AdminShell>
  );
}
