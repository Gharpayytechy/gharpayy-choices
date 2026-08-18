// @ts-nocheck
import { Link } from "wouter";
import { AdminShell, Panel } from "@/flatmates/frontend/admin/AdminShell";
import { portfolioHealth } from "@/flatmates/backend/services/canonical";
import { rankVacancies, defaultRequirement, resolveNoResults, supplyMissions } from "@/flatmates/backend/services/ranking";
import { repo } from "@/flatmates/backend/repository";
import { AlertTriangle, Activity, TimerReset, IndianRupee, Wrench, Target, ArrowRight } from "lucide-react";

const inr = (n: number) => "₹" + Number(n || 0).toLocaleString("en-IN");

export default function AdminTower() {
  const h = portfolioHealth();
  const g = h.graph;
  const people = repo.people.all();
  const reqs = people.slice(0, 8).map((p: any) => defaultRequirement(p));
  const missions = supplyMissions(g, reqs);
  const sample = rankVacancies(reqs[0] || defaultRequirement(), g);
  const recovery = resolveNoResults(reqs[0] || defaultRequirement(), sample, g);

  const risks = [
    { key: "Stale supply", count: h.staleVacancies, why: "Past its freshness clock — hidden from search until reconfirmed", action: "Ping host to reconfirm", href: "/flatmates/admin/supply", tone: h.staleVacancies ? "bad" : "ok" },
    { key: "Not tourable", count: h.notTourable, why: "Authority (L3) not verified, so visits and payment instructions are blocked", action: "Collect ownership / mandate evidence", href: "/flatmates/admin/owners", tone: h.notTourable ? "warn" : "ok" },
    { key: "Rent overdue", count: h.overdueCount, why: `${inr(h.overdueAmount)} outstanding across managed units`, action: "Trigger collection sequence", href: "/flatmates/admin/owners", tone: h.overdueCount ? "bad" : "ok" },
    { key: "SLA breaches", count: h.slaBreaches, why: "Maintenance tickets past their severity SLA", action: "Reassign vendor", href: "/flatmates/admin/missions", tone: h.slaBreaches ? "bad" : "ok" },
    { key: "Notice period running", count: h.noticeTenancies, why: "Replacement vacancy auto-created — must fill before move-out", action: "Prioritise in distribution", href: "/flatmates/admin/supply", tone: h.noticeTenancies ? "warn" : "ok" },
    { key: "Inspections due", count: h.inspectionsDue, why: "Beyond the quarterly mandate cadence", action: "Schedule field visit", href: "/flatmates/admin/missions", tone: h.inspectionsDue ? "warn" : "ok" },
  ];

  const toneCls = (t: string) => t === "bad" ? "text-destructive" : t === "warn" ? "text-warning" : "text-success";

  return (
    <AdminShell title="Control Tower" sub="Nothing sits unowned — every risk row carries the recovery action">
      <div className="grid sm:grid-cols-4 gap-3 mb-4">
        {[
          ["Canonical units", h.units, `${h.buildings} buildings · ${h.rooms} rooms`, Activity],
          ["Freshness", h.freshnessPct + "%", `${h.liveVacancies} live · ${h.staleVacancies} stale`, TimerReset],
          ["Collections", h.collectionPct + "%", `${h.overdueCount} overdue · ${inr(h.overdueAmount)}`, IndianRupee],
          ["Open tickets", h.openTickets, `${h.slaBreaches} past SLA`, Wrench],
        ].map(([label, val, sub, Icon]: any) => (
          <div key={label} className="rounded-2xl border border-border bg-card p-4">
            <Icon className="w-4 h-4 text-primary mb-2" />
            <p className="font-display text-2xl font-semibold leading-none">{val}</p>
            <p className="text-xs font-medium mt-1">{label}</p>
            <p className="text-[11px] text-muted-foreground">{sub}</p>
          </div>
        ))}
      </div>

      <Panel title="Risk queue" sub="Sorted by what blocks a move-in today">
        <div className="space-y-2">
          {risks.map((r) => (
            <div key={r.key} className="flex items-start gap-3 rounded-xl border border-border p-3">
              <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${toneCls(r.tone)}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{r.key} <span className={toneCls(r.tone)}>· {r.count}</span></p>
                <p className="text-xs text-muted-foreground">{r.why}</p>
              </div>
              <Link href={r.href} className="text-xs font-semibold text-primary whitespace-nowrap inline-flex items-center gap-1">{r.action} <ArrowRight className="w-3 h-3" /></Link>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid lg:grid-cols-2 gap-3 mt-3">
        <Panel title="Supply missions" sub="Demand clusters with no canonical inventory — created automatically, never a dead end">
          <div className="space-y-2">
            {missions.slice(0, 8).map((m: any) => (
              <div key={m.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                <Target className={`w-4 h-4 ${m.gap ? "text-destructive" : "text-success"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{m.area} · {m.roomType}</p>
                  <p className="text-xs text-muted-foreground">{m.budgetBand} · demand {m.demandCount} vs supply {m.supplyCount}</p>
                </div>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${m.gap ? "bg-destructive/15 text-destructive" : "bg-success/15 text-success"}`}>
                  {m.gap ? `gap ${m.gap}` : "covered"}
                </span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Ranking engine — live trace" sub="Sequence: eligibility → feasibility → freshness → compatibility → conversion readiness">
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[["Passing gates", sample.passing.length], ["Blocked", sample.blocked.length], ["Binding constraint", recovery.binding]].map(([k, v]: any) => (
              <div key={k} className="rounded-xl bg-muted p-2.5">
                <p className="font-display text-lg font-semibold leading-none capitalize">{v}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{k}</p>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            {sample.passing.slice(0, 4).map((r: any) => (
              <div key={r.vacancy.id} className="rounded-xl border border-border p-3">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold truncate flex-1">{r.vacancy.title}</p>
                  <span className="text-xs font-bold text-primary">{r.score}</span>
                </div>
                <p className="text-[11px] text-muted-foreground">fit {r.compatibility} · fresh {r.freshnessScore} · ready {r.conversionReadiness} · {r.confidence.replace(/_/g, " ")}</p>
                {r.reasons[0] && <p className="text-[11px] mt-1">✅ {r.reasons.join(" · ")}</p>}
                {r.discussPoints[0] && <p className="text-[11px] text-warning mt-0.5">⚠️ {r.discussPoints[0]}</p>}
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground mt-3">Recovery offered when blocked: {recovery.options.map((o: any) => o.key.replace(/_/g, " ")).join(" · ")}</p>
        </Panel>
      </div>

      <Panel title="Money book" sub="Double-sided ledger across every managed unit" className="mt-3">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="text-left text-muted-foreground">
              {["Due", "Unit", "Purpose", "Payee", "Relationship", "Amount", "Status"].map((x) => <th key={x} className="py-2 pr-3 font-semibold">{x}</th>)}
            </tr></thead>
            <tbody>
              {g.ledger.slice(0, 14).map((l: any) => (
                <tr key={l.id} className="border-t border-border/60">
                  <td className="py-2 pr-3">{new Date(l.dueAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                  <td className="py-2 pr-3 font-mono text-[10px]">{l.unitId}</td>
                  <td className="py-2 pr-3">{l.purpose}</td>
                  <td className="py-2 pr-3">{l.payeeName}</td>
                  <td className="py-2 pr-3 text-muted-foreground">{l.payeeVerifiedRelationship.replace(/_/g, " ")}</td>
                  <td className="py-2 pr-3 font-medium">{inr(l.amount)}</td>
                  <td className="py-2"><span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${l.status === "paid" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>{l.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="flex flex-wrap gap-2 mt-4">
        {[["Access keys", "/flatmates/admin/keys"], ["Data schemas", "/flatmates/admin/schemas"], ["Super admin", "/flatmates/admin/super"], ["Playbook", "/flatmates/playbook"]].map(([l, href]) => (
          <Link key={href} href={href} className="h-10 px-4 rounded-xl border border-border bg-card text-sm font-semibold inline-flex items-center hover:border-primary transition-colors">{l}</Link>
        ))}
      </div>
    </AdminShell>
  );
}
