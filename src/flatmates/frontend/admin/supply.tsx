// @ts-nocheck
import { useEffect, useState } from "react";
import { AdminShell, Panel, Kpi, Tag } from "./AdminShell";
import { repo, useFM, supplyDesk, money } from "@/flatmates/backend";
import { toast } from "@/referral-app/hooks/use-toast";

const HEALTH: any = { fresh: "good", aging: "warn", stale: "bad" };

export default function AdminSupply() {
  useEffect(() => { repo.ensureSeed(); }, []);
  const rows = useFM(() => supplyDesk());
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");

  const list = rows.filter((r: any) => {
    if (filter === "stale" && r.health !== "stale") return false;
    if (filter === "no-demand" && r.matchableSeekers > 0) return false;
    if (filter === "live" && r.status !== "LIVE") return false;
    if (q && !`${r.title} ${r.area}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const toggle = (r: any) => {
    const next = r.status === "LIVE" ? "PAUSED" : "LIVE";
    repo.rooms.update(r.id, { status: next });
    toast(next === "LIVE" ? `${r.title} is live again` : `${r.title} paused — hidden from seekers`);
  };
  const reverify = (r: any) => {
    repo.rooms.update(r.id, { verifiedAt: new Date().toISOString() });
    toast(`${r.title} re-verified just now`);
  };
  const reprice = (r: any, d: number) => {
    const rent = Math.max(3000, r.rent + d);
    repo.rooms.update(r.id, { rent });
    toast(`${r.title} repriced to ${money(rent)}`);
  };

  return (
    <AdminShell title="Supply desk" sub="Every bed, its freshness, its matchable demand, and the one lever to pull.">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-4">
        <Kpi label="Total beds" value={rows.length} tone="primary" />
        <Kpi label="Live" value={rows.filter((r: any) => r.status === "LIVE").length} tone="good" />
        <Kpi label="Stale" value={rows.filter((r: any) => r.health === "stale").length} tone="warn" />
        <Kpi label="Zero-demand" value={rows.filter((r: any) => r.matchableSeekers === 0).length} tone="bad" />
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {["all", "live", "stale", "no-demand"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${filter === f ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"}`}>
            {f}
          </button>
        ))}
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title or area"
          className="ml-auto h-9 px-3 rounded-full border border-border bg-card text-xs min-w-[200px]" />
      </div>

      <Panel>
        <div className="divide-y divide-border">
          {list.map((r: any) => (
            <div key={r.id} className="p-4 flex flex-wrap items-center gap-3">
              <div className="min-w-[220px] flex-1">
                <div className="flex items-center gap-2">
                  <Tag tone={HEALTH[r.health]}>{r.health}</Tag>
                  {r.status !== "LIVE" && <Tag tone="muted">paused</Tag>}
                  {r.type === "ROOM_REPLACEMENT" && <Tag tone="primary">replacement</Tag>}
                </div>
                <p className="font-semibold text-sm mt-1">{r.title}</p>
                <p className="text-[11px] text-muted-foreground">{r.area} · {r.roomType} · {r.genderPref} · verified {Math.round(r.ageHours / 24)}d ago</p>
              </div>
              <div className="text-right">
                <p className="font-display font-semibold tabular-nums">{money(r.rent)}</p>
                <p className="text-[11px] text-muted-foreground">dep {money(r.deposit)}</p>
              </div>
              <div className="text-center px-3">
                <p className="font-display font-semibold tabular-nums">{r.matchableSeekers}</p>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">seekers</p>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => reprice(r, -500)} className="px-2.5 py-1.5 rounded-lg border border-border text-xs font-semibold">−₹500</button>
                <button onClick={() => reprice(r, 500)} className="px-2.5 py-1.5 rounded-lg border border-border text-xs font-semibold">+₹500</button>
                <button onClick={() => reverify(r)} className="px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold">Re-verify</button>
                <button onClick={() => toggle(r)} className="px-2.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold">
                  {r.status === "LIVE" ? "Pause" : "Go live"}
                </button>
              </div>
            </div>
          ))}
          {!list.length && <p className="p-6 text-sm text-muted-foreground">No beds match this filter.</p>}
        </div>
      </Panel>
    </AdminShell>
  );
}
