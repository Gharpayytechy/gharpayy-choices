// @ts-nocheck
/**
 * Flatmates BACKEND — ops service.
 * Everything the admin console needs beyond raw market maths: funnel,
 * alerts, cohorts, trust, forecasting and the write-side action log.
 */
import { repo } from "../repository";
import { markets, supplyDesk, demandDesk, missions, cityKpis } from "./market";

const hoursSince = (iso?: string) =>
  iso ? (Date.now() - new Date(iso).getTime()) / 3.6e6 : 9999;

/* ── Funnel ─────────────────────────────────────────── */
export function funnel() {
  const people = repo.people.all();
  const interests = repo.interests.all();
  const meetings = repo.meetings.all();
  const mutuals = interests.filter((i: any) => i.state === "mutual" || i.mutual).length;
  const moved = people.filter((p: any) => p.household).length;
  const steps = [
    { key: "seekers", label: "Seekers", value: people.length },
    { key: "interest", label: "Interest sent", value: interests.length },
    { key: "mutual", label: "Mutual match", value: mutuals },
    { key: "visit", label: "Visit booked", value: meetings.length },
    { key: "moved", label: "Moved in", value: moved },
  ];
  const top = steps[0].value || 1;
  return steps.map((s, i) => ({
    ...s,
    pctOfTop: Math.round((s.value / top) * 100),
    stepConv: i === 0 ? 100 : steps[i - 1].value ? Math.round((s.value / steps[i - 1].value) * 100) : 0,
    drop: i === 0 ? 0 : Math.max(0, steps[i - 1].value - s.value),
  }));
}

/** The single weakest funnel step, with the fix. */
export function bottleneck() {
  const f = funnel().slice(1);
  if (!f.length) return null;
  const worst = f.reduce((a, b) => (b.stepConv < a.stepConv ? b : a));
  const fix: Record<string, string> = {
    interest: "Discover feed is not converting — tighten match ranking and surface fresh beds first.",
    mutual: "Owners/flatmates are slow to respond — nudge every pending interest older than 24h.",
    visit: "Mutuals stall before visiting — auto-send 3 visit slots the moment a match goes mutual.",
    moved: "Visits are not closing — pre-fill agreement + deposit plan before the visit.",
  };
  return { ...worst, fix: fix[worst.key] || "Investigate this step." };
}

/* ── Health score ───────────────────────────────────── */
export function healthScore() {
  const k = cityKpis();
  const m = markets();
  const liquidity = Math.max(0, 100 - Math.abs(k.ratio - 1) * 40);
  const freshness = k.liveSupply ? Math.round(((k.liveSupply - k.stale) / k.liveSupply) * 100) : 0;
  const trust = k.verifiedPct;
  const conversion = Math.min(100, k.conversion * 2);
  const balance = m.length ? Math.round((m.filter((x) => x.state === "balanced").length / m.length) * 100) : 0;
  const score = Math.round(liquidity * 0.3 + freshness * 0.2 + trust * 0.2 + conversion * 0.2 + balance * 0.1);
  return {
    score,
    grade: score >= 80 ? "A" : score >= 65 ? "B" : score >= 50 ? "C" : "D",
    parts: [
      { label: "Liquidity", value: Math.round(liquidity) },
      { label: "Freshness", value: freshness },
      { label: "Trust", value: trust },
      { label: "Conversion", value: Math.round(conversion) },
      { label: "Balance", value: balance },
    ],
  };
}

/* ── Alerts ─────────────────────────────────────────── */
export function alerts() {
  const out: any[] = [];
  const k = cityKpis();
  const m = markets();
  const sup = supplyDesk();
  const dem = demandDesk();

  m.filter((x) => x.state === "starved").forEach((x) =>
    out.push({ id: `a-starve-${x.area}`, level: "critical", title: `${x.area} is supply starved`, detail: `${x.demand} seekers chasing ${x.supplyRooms + x.readyBeds} beds (${x.ratio}×).`, cta: "Open supply desk", href: "/flatmates/admin/supply" }),
  );
  const blocked = dem.filter((d: any) => d.severity === "blocked").length;
  if (blocked) out.push({ id: "a-blocked", level: "critical", title: `${blocked} seekers have zero options`, detail: "Budget or area constraints leave them nothing to see.", cta: "Unblock demand", href: "/flatmates/admin/demand" });
  if (k.stale) out.push({ id: "a-stale", level: "warn", title: `${k.stale} listings are stale`, detail: "Not re-verified in over 7 days — trust and ranking drop.", cta: "Re-verify", href: "/flatmates/admin/supply" });
  const zero = sup.filter((s: any) => s.status === "LIVE" && s.matchableSeekers === 0);
  if (zero.length) out.push({ id: "a-zero", level: "warn", title: `${zero.length} live beds have no matchable seeker`, detail: `₹${zero.reduce((a: number, s: any) => a + s.rent, 0).toLocaleString("en-IN")}/mo of revenue idle.`, cta: "Fix pricing", href: "/flatmates/admin/owners" });
  if (k.conversion < 25) out.push({ id: "a-conv", level: "warn", title: `Interest → mutual is only ${k.conversion}%`, detail: "Response times are killing matches.", cta: "See missions", href: "/flatmates/admin/missions" });
  if (!out.length) out.push({ id: "a-ok", level: "good", title: "Market is stable", detail: "No starved areas, no blocked seekers, listings fresh.", cta: "Review missions", href: "/flatmates/admin/missions" });
  return out;
}

/* ── Demand cohorts ─────────────────────────────────── */
export function demandCohorts() {
  const rows = demandDesk();
  const band = (b: number) => (b < 12000 ? "Under ₹12k" : b < 18000 ? "₹12k–18k" : b < 25000 ? "₹18k–25k" : "₹25k+");
  const map: Record<string, any> = {};
  rows.forEach((r: any) => {
    const key = band(r.budgetMax || 0);
    map[key] ||= { band: key, seekers: 0, blocked: 0, options: 0 };
    map[key].seekers++;
    map[key].options += r.options;
    if (r.severity === "blocked") map[key].blocked++;
  });
  return Object.values(map)
    .map((c: any) => ({
      ...c,
      avgOptions: c.seekers ? Number((c.options / c.seekers).toFixed(1)) : 0,
      blockedPct: c.seekers ? Math.round((c.blocked / c.seekers) * 100) : 0,
    }))
    .sort((a: any, b: any) => b.seekers - a.seekers);
}

/* ── Trust board ────────────────────────────────────── */
export function trustBoard() {
  const rooms = repo.rooms.all();
  const people = repo.people.all();
  return {
    roomsVerified: rooms.filter((r: any) => r.verified?.room).length,
    roomsTotal: rooms.length,
    phoneVerified: people.filter((p: any) => p.verified?.phone).length,
    idVerified: people.filter((p: any) => p.verified?.id).length,
    workVerified: people.filter((p: any) => p.verified?.work).length,
    peopleTotal: people.length,
    reports: repo.reports?.all?.().length || 0,
    staleRooms: rooms.filter((r: any) => hoursSince(r.verifiedAt) > 168).length,
  };
}

/* ── Owner portfolio roll-up ────────────────────────── */
export function ownerPortfolios() {
  const rows = repo.rooms.all();
  const map: Record<string, any> = {};
  const desk = supplyDesk();
  const byId = Object.fromEntries(desk.map((d: any) => [d.id, d]));
  const m = Object.fromEntries(markets().map((x: any) => [x.area, x]));
  rows.forEach((r: any) => {
    const owner = r.ownerName || r.postedBy || r.host?.name || `${r.area} household`;
    map[owner] ||= { owner, area: r.area, beds: 0, live: 0, stale: 0, rent: 0, risk: 0, rooms: [] as any[] };
    const d = byId[r.id] || {};
    map[owner].beds++;
    if (r.status === "LIVE") map[owner].live++;
    if (d.health === "stale") map[owner].stale++;
    map[owner].rent += r.rent || 0;
    if (d.matchableSeekers === 0 && r.status === "LIVE") map[owner].risk += r.rent || 0;
    map[owner].rooms.push({ ...r, ...d, marketRent: m[r.area]?.medianRent || r.rent });
  });
  return Object.values(map)
    .map((o: any) => ({
      ...o,
      occupancy: o.beds ? Math.round(((o.beds - o.live) / o.beds) * 100) : 0,
      score: Math.max(
        0,
        100 - o.stale * 15 - Math.round((o.risk / Math.max(1, o.rent)) * 60),
      ),
    }))
    .sort((a: any, b: any) => b.risk - a.risk);
}

/* ── Mission lifecycle ──────────────────────────────── */
export function missionBoard() {
  const state = repo.missionState.all();
  const byId = Object.fromEntries(state.map((s: any) => [s.missionId, s]));
  return missions().map((m: any) => ({
    ...m,
    status: byId[m.id]?.status || "open",
    owner: byId[m.id]?.owner || "",
    note: byId[m.id]?.note || "",
  }));
}

export const opsActions = {
  setMission(missionId: string, patch: any) {
    const existing = repo.missionState.all().find((s: any) => s.missionId === missionId);
    if (existing) repo.missionState.update(existing.id, patch);
    else repo.missionState.create({ missionId, status: "open", ...patch });
    opsActions.log("mission", `${missionId} → ${patch.status || "updated"}`);
  },
  reverify(roomId: string) {
    repo.rooms.update(roomId, { verifiedAt: new Date().toISOString(), verified: { ...(repo.rooms.get(roomId)?.verified || {}), room: true } });
    opsActions.log("trust", `Re-verified room ${roomId}`);
  },
  reprice(roomId: string, rent: number) {
    repo.rooms.update(roomId, { rent: Math.max(3000, Math.round(rent)) });
    opsActions.log("pricing", `Repriced room ${roomId} to ₹${rent}`);
  },
  toggleLive(roomId: string) {
    const r = repo.rooms.get(roomId);
    if (!r) return;
    repo.rooms.update(roomId, { status: r.status === "LIVE" ? "PAUSED" : "LIVE" });
    opsActions.log("supply", `${r.title} → ${r.status === "LIVE" ? "paused" : "live"}`);
  },
  nudgeSeeker(personId: string, message: string) {
    repo.notifs.create({ kind: "ops", personId, text: message, read: false, at: new Date().toISOString() });
    opsActions.log("demand", `Nudged seeker ${personId}`);
  },
  raiseBudget(personId: string, delta: number) {
    const p = repo.people.get(personId);
    if (!p) return;
    repo.people.update(personId, { budgetMax: (p.budgetMax || 0) + delta });
    opsActions.log("demand", `${p.name}: budget ${delta > 0 ? "+" : ""}₹${delta}`);
  },
  log(lane: string, text: string) {
    repo.opsLog.create({ lane, text, at: new Date().toISOString() });
  },
};

export function opsLog(limit = 25) {
  return repo.opsLog.all().slice(0, limit);
}
