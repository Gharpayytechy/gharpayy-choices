// @ts-nocheck
/**
 * SUPER ADMIN — everything in one screen.
 * Aggregates supply, demand, owners, missions, trust, accounts, conversations
 * and the raw event log so one person can run the whole city without hopping tabs.
 */
import { useEffect, useState } from "react";
import { Link } from "wouter";
import { AdminShell, Panel, Kpi, Tag } from "./AdminShell";
import {
  repo, useFM, cityKpis, markets, missionBoard, money, healthScore, alerts,
  funnel, bottleneck, trustBoard, opsLog, supplyDesk, demandDesk, ownerBoard,
} from "@/flatmates/backend";
import { Rooms, Flats, People, Threads, Interests, Meetings, Events, Groups } from "@/flatmates/backend/store/store";
import { listAccounts, ROLE_META } from "@/flatmates/backend/store/accounts";
import { ACTORS } from "@/flatmates/backend/store/actors";
import { Activity, AlertTriangle, ArrowUpRight } from "lucide-react";

const TABS = ["Overview", "Supply", "Demand", "People", "Conversations", "Activity"];

export default function AdminSuper() {
  useEffect(() => { repo.ensureSeed(); }, []);
  const [tab, setTab] = useState("Overview");

  const k = useFM(() => cityKpis());
  const health = useFM(() => healthScore());
  const al = useFM(() => alerts());
  const fn = useFM(() => funnel());
  const bn = useFM(() => bottleneck());
  const mk = useFM(() => markets());
  const ms = useFM(() => missionBoard());
  const trust = useFM(() => trustBoard());
  const log = useFM(() => opsLog(20));
  const supply = useFM(() => supplyDesk());
  const demand = useFM(() => demandDesk());
  const owners = useFM(() => ownerBoard());

  const rooms = useFM(() => Rooms.all());
  const flats = useFM(() => Flats.all());
  const people = useFM(() => People.all());
  const threads = useFM(() => Threads.all());
  const interests = useFM(() => Interests.all());
  const meetings = useFM(() => Meetings.all());
  const groups = useFM(() => Groups.all());
  const events = useFM(() => Events.all());
  const accounts = useFM(() => listAccounts());

  const openMissions = (ms || []).filter((x: any) => x.status !== "done");
  const liveRooms = rooms.filter((r: any) => r.status === "LIVE");
  const pending = interests.filter((i: any) => i.status === "pending" || i.status === "sent");

  return (
    <AdminShell
      title="Super admin"
      sub="Every listing, person, request, chat and event across the platform — one place."
      action={
        <Link href="/flatmates/admin/missions" className="px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold">
          {openMissions.length} open missions
        </Link>
      }
    >
      {/* Top line */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-5">
        <Kpi label="Live rooms" value={liveRooms.length} />
        <Kpi label="Whole flats" value={flats.length} />
        <Kpi label="Seekers" value={people.length} />
        <Kpi label="Accounts" value={accounts.length + ACTORS.length} />
        <Kpi label="Open requests" value={pending.length} />
        <Kpi label="Health" value={`${health.score}/100`} />
      </div>

      <div className="flex gap-1.5 overflow-x-auto mb-4">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 h-9 rounded-xl text-xs font-semibold whitespace-nowrap border transition-colors ${
              tab === t ? "bg-foreground text-background border-foreground" : "bg-card border-border hover:bg-muted"}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="grid lg:grid-cols-2 gap-4">
          <Panel title="Where the market is stuck" sub="The single biggest constraint right now.">
            <div className="p-4">
              <p className="font-display text-lg font-semibold">{bn?.label || "No blocking constraint"}</p>
              <p className="text-sm text-muted-foreground mt-1">{bn?.detail || bn?.why || "Supply and demand are broadly balanced."}</p>
              <div className="mt-3 space-y-1.5">
                {(fn || []).map((s: any) => (
                  <div key={s.label} className="flex items-center justify-between text-xs">
                    <span className="font-medium">{s.label}</span>
                    <b className="tabular-nums text-muted-foreground">{s.value ?? s.count}</b>
                  </div>
                ))}
              </div>
            </div>
          </Panel>

          <Panel title="Alerts" sub="Things that need a human today.">
            <div className="p-4 space-y-2">
              {(al || []).length === 0 && <p className="text-sm text-muted-foreground">Nothing on fire.</p>}
              {(al || []).map((a: any, i: number) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <AlertTriangle className="w-4 h-4 mt-0.5 text-amber-500 shrink-0" />
                  <span><b className="font-semibold">{a.title || a.label}</b> <span className="text-muted-foreground">{a.detail || a.body || ""}</span></span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Markets" sub="Area-level supply and demand.">
            <div className="p-4 space-y-2">
              {(mk || []).slice(0, 8).map((m: any) => (
                <div key={m.area} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{m.area}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {m.supply ?? m.rooms ?? 0} supply · {m.demand ?? m.seekers ?? 0} demand · {money(m.median || m.medianRent || 0)}
                  </span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Trust" sub="Verification and behaviour across the base.">
            <div className="p-4 space-y-2">
              {(trust || []).slice(0, 8).map((t: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{t.label || t.name}</span>
                  <Tag>{t.value ?? t.score ?? t.tier}</Tag>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}

      {tab === "Supply" && (
        <Panel title="Every listing" sub={`${rooms.length} rooms · ${flats.length} flats`}>
          <Table
            head={["Listing", "Area", "Rent", "Status", ""]}
            rows={[...rooms, ...flats].map((r: any) => [
              r.title || r.name || r.id,
              r.area,
              money(r.rent || 0),
              <Tag key="s">{r.status || "LIVE"}</Tag>,
              <Link key="l" href={`/flatmates/${r.kind === "flat" ? "flat" : "room"}/${r.id}`} className="text-primary text-xs font-semibold inline-flex items-center gap-1">
                Open <ArrowUpRight className="w-3 h-3" />
              </Link>,
            ])}
          />
          <div className="p-3 border-t border-border flex gap-2">
            <Link href="/flatmates/admin/supply" className="text-xs font-semibold text-primary">Supply desk →</Link>
            <Link href="/flatmates/post" className="text-xs font-semibold text-primary">Add a listing →</Link>
          </div>
        </Panel>
      )}

      {tab === "Demand" && (
        <Panel title="Every seeker" sub={`${people.length} published requirements · ${groups.length} groups`}>
          <Table
            head={["Person", "Areas", "Budget", "Move-in", ""]}
            rows={people.map((p: any) => [
              p.name || p.id,
              (p.areas || []).join(", ") || "—",
              money(p.budgetMax || p.budget || 0),
              p.moveIn || p.moveInBand || "flexible",
              <Link key="l" href={`/flatmates/person/${p.id}`} className="text-primary text-xs font-semibold">Open</Link>,
            ])}
          />
          <div className="p-3 border-t border-border">
            <Link href="/flatmates/admin/demand" className="text-xs font-semibold text-primary">Demand desk →</Link>
          </div>
        </Panel>
      )}

      {tab === "People" && (
        <Panel title="Accounts & personas" sub="Signed-up accounts on this device plus built-in roles.">
          <Table
            head={["Name", "Role", "Identifier", "Type"]}
            rows={[
              ...accounts.map((a: any) => [a.name, ROLE_META[a.role]?.tagline || a.role, a.email, <Tag key="t">Account</Tag>]),
              ...ACTORS.map((a: any) => [a.label, a.role, a.id, <Tag key="t">Built-in</Tag>]),
            ]}
          />
          <div className="p-3 border-t border-border">
            <Link href="/flatmates/admin/owners" className="text-xs font-semibold text-primary">Owner board ({(owners || []).length}) →</Link>
          </div>
        </Panel>
      )}

      {tab === "Conversations" && (
        <Panel title="Requests & chats" sub={`${interests.length} requests · ${threads.length} threads · ${meetings.length} meetings`}>
          <Table
            head={["Thread", "With", "Messages", ""]}
            rows={threads.map((t: any) => [
              t.title || t.subjectTitle || t.id,
              t.withName || t.peerName || "—",
              (t.messages || []).length,
              <Link key="l" href={`/flatmates/chat/${t.id}`} className="text-primary text-xs font-semibold">Open chat</Link>,
            ])}
          />
        </Panel>
      )}

      {tab === "Activity" && (
        <Panel title="Event log" sub={`${events.length} tracked events`}>
          <div className="p-4 space-y-2 max-h-[520px] overflow-auto">
            {[...events].reverse().slice(0, 120).map((e: any) => (
              <div key={e.id} className="flex items-start gap-2 text-xs">
                <Activity className="w-3.5 h-3.5 mt-0.5 text-muted-foreground shrink-0" />
                <span className="font-semibold">{e.name}</span>
                <span className="text-muted-foreground truncate flex-1">{JSON.stringify(e.props || {})}</span>
                <span className="text-muted-foreground tabular-nums shrink-0">{new Date(e.at).toLocaleTimeString()}</span>
              </div>
            ))}
            {!events.length && <p className="text-sm text-muted-foreground">No activity yet.</p>}
          </div>
          <div className="p-3 border-t border-border space-y-1">
            {(log || []).slice(0, 6).map((l: any, i: number) => (
              <p key={i} className="text-xs text-muted-foreground">{l.label || l.text || JSON.stringify(l)}</p>
            ))}
          </div>
        </Panel>
      )}
    </AdminShell>
  );
}

function Table({ head, rows }: any) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
            {head.map((h: string, i: number) => <th key={i} className="font-semibold px-4 py-2.5 whitespace-nowrap">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r: any[], i: number) => (
            <tr key={i} className="border-b border-border/60 last:border-0">
              {r.map((c: any, j: number) => <td key={j} className="px-4 py-2.5 align-middle whitespace-nowrap">{c}</td>)}
            </tr>
          ))}
          {!rows.length && <tr><td className="px-4 py-6 text-muted-foreground" colSpan={head.length}>Nothing here yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
