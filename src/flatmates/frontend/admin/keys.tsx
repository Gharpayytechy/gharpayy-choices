// @ts-nocheck
import { AdminShell, Panel } from "@/flatmates/frontend/admin/AdminShell";
import { accessKeys, keyRisk, ROLES, SCOPE_LEGEND, VISIBILITY, LADDER } from "@/flatmates/backend/services/trust";
import { KeyRound, ShieldAlert, RotateCcw, Lock } from "lucide-react";

const riskClass = (r: string) =>
  r === "critical" ? "bg-destructive/15 text-destructive" : r === "high" ? "bg-warning/15 text-warning" : "bg-success/15 text-success";

export default function AdminKeys() {
  const keys = accessKeys();
  const expiring = keys.filter((k) => k.status === "expiring");

  return (
    <AdminShell title="Access keys & permissions" sub="Every key, scope, purpose and expiry the platform holds — in one place">
      <div className="grid sm:grid-cols-4 gap-3 mb-4">
        {[
          ["Active keys", keys.length, KeyRound],
          ["Critical scope keys", keys.filter((k) => keyRisk(k.scopes) === "critical").length, ShieldAlert],
          ["Expiring ≤7 days", expiring.length, RotateCcw],
          ["MFA enforced", keys.filter((k) => k.mfa).length + "/" + keys.length, Lock],
        ].map(([label, val, Icon]: any) => (
          <div key={label} className="rounded-2xl border border-border bg-card p-4">
            <Icon className="w-4 h-4 text-primary mb-2" />
            <p className="font-display text-2xl font-semibold leading-none">{val}</p>
            <p className="text-[11px] text-muted-foreground mt-1">{label}</p>
          </div>
        ))}
      </div>

      <Panel title="Key inventory" sub="Raw secrets are shown once at issue and stored only as an Argon2id hash + last 4">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="text-left text-muted-foreground">
              {["Key", "Role", "Risk", "Scopes", "Purpose", "Last used", "Expires", "Status"].map((h) => <th key={h} className="py-2 pr-3 font-semibold">{h}</th>)}
            </tr></thead>
            <tbody>
              {keys.map((k) => {
                const risk = keyRisk(k.scopes);
                return (
                  <tr key={k.id} className="border-t border-border/60 align-top">
                    <td className="py-2 pr-3 font-mono font-semibold">••••{k.last4}{k.mfa && <span className="ml-1 text-[10px] text-muted-foreground">MFA</span>}</td>
                    <td className="py-2 pr-3 font-medium">{k.label}</td>
                    <td className="py-2 pr-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${riskClass(risk)}`}>{risk}</span></td>
                    <td className="py-2 pr-3 font-mono text-[10px] text-muted-foreground max-w-[220px]">{k.scopes.join(", ")}</td>
                    <td className="py-2 pr-3 text-muted-foreground max-w-[200px]">{k.purpose}</td>
                    <td className="py-2 pr-3 text-muted-foreground">{new Date(k.lastUsedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                    <td className="py-2 pr-3">{k.daysLeft}d</td>
                    <td className="py-2"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${k.status === "expiring" ? "bg-warning/15 text-warning" : "bg-success/15 text-success"}`}>{k.status}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      <div className="grid lg:grid-cols-2 gap-3 mt-3">
        <Panel title="Roles" sub="Who holds what, and why they need it">
          <div className="space-y-2">
            {ROLES.map((r) => (
              <div key={r.role} className="rounded-xl border border-border p-3">
                <p className="text-sm font-semibold">{r.label} <span className="font-mono text-[10px] text-muted-foreground">{r.role}</span></p>
                <p className="text-xs text-muted-foreground mt-0.5">{r.people} · rotate every {r.expiryDays} days{r.mfa ? " · MFA required" : ""}</p>
                <p className="text-xs mt-1">{r.purpose}</p>
                <p className="font-mono text-[10px] text-muted-foreground mt-1">{r.scopes.join(" · ")}</p>
              </div>
            ))}
          </div>
        </Panel>

        <div className="space-y-3">
          <Panel title="Scope legend" sub="What each scope actually exposes">
            <div className="space-y-1.5">
              {SCOPE_LEGEND.map((s) => (
                <div key={s.scope} className="flex gap-2 items-start">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0 ${riskClass(s.risk)}`}>{s.risk}</span>
                  <div>
                    <p className="font-mono text-[11px] font-semibold">{s.scope}</p>
                    <p className="text-xs text-muted-foreground">{s.meaning}</p>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Trust ladder gating" sub="What each verification level unlocks">
            <div className="space-y-1.5">
              {LADDER.map((l) => (
                <div key={l.level} className="text-xs">
                  <p className="font-semibold">{l.level} · {l.name}</p>
                  <p className="text-muted-foreground">{l.unlocks}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      <Panel title="Data visibility matrix" sub="Progressive disclosure — enforced in product, not policy text" className="mt-3">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="text-left text-muted-foreground">
              {["Field", "Public", "Mutual intent", "Confirmed visit", "Tenancy", "Gharpayy internal"].map((h) => <th key={h} className="py-2 pr-3 font-semibold">{h}</th>)}
            </tr></thead>
            <tbody>
              {VISIBILITY.map((v) => (
                <tr key={v.field} className="border-t border-border/60">
                  <td className="py-2 pr-3 font-medium">{v.field}</td>
                  <td className="py-2 pr-3">{v.public}</td><td className="py-2 pr-3">{v.mutual}</td>
                  <td className="py-2 pr-3">{v.visit}</td><td className="py-2 pr-3">{v.tenancy}</td>
                  <td className="py-2">{v.gharpayy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </AdminShell>
  );
}
