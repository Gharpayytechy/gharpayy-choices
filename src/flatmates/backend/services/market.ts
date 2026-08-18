// @ts-nocheck
/**
 * Flatmates BACKEND — market intelligence service.
 * Pure functions over the repository. No React, no JSX, no styling.
 */
import { repo } from "../repository";

export type Market = {
  area: string;
  supplyRooms: number;
  supplyFlats: number;
  readyBeds: number;
  demand: number;
  ratio: number; // seekers per available room
  medianRent: number;
  demandMedianBudget: number;
  gap: number; // budget - rent (negative = affordability gap)
  verifiedPct: number;
  freshPct: number; // re-verified in last 7 days
  state: "starved" | "tight" | "balanced" | "surplus";
  action: string;
};

const median = (xs: number[]) => {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
};

const hoursSince = (iso?: string) =>
  iso ? (Date.now() - new Date(iso).getTime()) / 3.6e6 : 9999;

export function markets(): Market[] {
  const rooms = repo.rooms.all().filter((r: any) => r.status !== "PAUSED");
  const flats = repo.flats.all();
  const people = repo.people.all();
  const ready = repo.ready();
  const areas = Array.from(
    new Set([
      ...repo.areas(),
      ...rooms.map((r: any) => r.area),
      ...people.map((p: any) => p.area),
    ]),
  ).filter(Boolean);

  return areas
    .map((area) => {
      const ar = rooms.filter((r: any) => r.area === area);
      const af = flats.filter((f: any) => f.area === area);
      const ap = people.filter((p: any) => p.area === area);
      const ard = ready.filter((s: any) => s.area === area);
      const supply = ar.length + ard.length;
      const demand = ap.length;
      const ratio = supply ? demand / supply : demand ? 99 : 0;
      const medianRent = median(ar.map((r: any) => r.rent));
      const demandMedianBudget = median(ap.map((p: any) => p.budgetMax || p.rent || 0));
      const verified = ar.filter((r: any) => r.verified?.room || r.verified?.phone).length;
      const fresh = ar.filter((r: any) => hoursSince(r.verifiedAt) < 168).length;
      const state: Market["state"] =
        ratio >= 3 ? "starved" : ratio >= 1.5 ? "tight" : ratio >= 0.8 ? "balanced" : "surplus";
      const action =
        state === "starved"
          ? `Source ${Math.max(2, Math.ceil(demand / 2) - supply)} rooms in ${area} this week`
          : state === "tight"
            ? `Re-verify stale ${area} rooms and unlock 2 replacements`
            : state === "balanced"
              ? `Hold. Push visit conversion in ${area}`
              : `Pull demand into ${area} — run offers + refer campaign`;
      return {
        area,
        supplyRooms: ar.length,
        supplyFlats: af.length,
        readyBeds: ard.length,
        demand,
        ratio: Number(ratio.toFixed(2)),
        medianRent,
        demandMedianBudget,
        gap: demandMedianBudget - medianRent,
        verifiedPct: ar.length ? Math.round((verified / ar.length) * 100) : 0,
        freshPct: ar.length ? Math.round((fresh / ar.length) * 100) : 0,
        state,
        action,
      };
    })
    .sort((a, b) => b.ratio - a.ratio);
}

export function cityKpis() {
  const m = markets();
  const rooms = repo.rooms.all();
  const people = repo.people.all();
  const interests = repo.interests.all();
  const meetings = repo.meetings.all();
  const live = rooms.filter((r: any) => r.status === "LIVE");
  const stale = live.filter((r: any) => hoursSince(r.verifiedAt) > 168);
  const converted = interests.filter((i: any) => i.state === "mutual" || i.mutual).length;
  return {
    liveSupply: live.length,
    totalSupply: rooms.length + repo.flats.all().length + repo.ready().length,
    demand: people.length,
    ratio: live.length ? Number((people.length / live.length).toFixed(2)) : 0,
    starved: m.filter((x) => x.state === "starved").length,
    surplus: m.filter((x) => x.state === "surplus").length,
    stale: stale.length,
    medianRent: median(live.map((r: any) => r.rent)),
    interests: interests.length,
    mutuals: converted,
    visits: meetings.length,
    conversion: interests.length ? Math.round((converted / interests.length) * 100) : 0,
    verifiedPct: live.length
      ? Math.round((live.filter((r: any) => r.verified?.room).length / live.length) * 100)
      : 0,
  };
}

/** Supply-side rows for the admin supply desk. */
export function supplyDesk() {
  return repo.rooms.all().map((r: any) => {
    const h = hoursSince(r.verifiedAt);
    const seekers = repo.people.all().filter(
      (p: any) => p.area === r.area && (p.budgetMax || 0) >= r.rent,
    ).length;
    return {
      ...r,
      ageHours: Math.round(h),
      health: h > 168 ? "stale" : h > 72 ? "aging" : "fresh",
      matchableSeekers: seekers,
      risk: r.status !== "LIVE" ? "paused" : seekers === 0 ? "no-demand" : h > 168 ? "unverified" : "ok",
    };
  });
}

/** Demand-side rows for the admin demand desk. */
export function demandDesk() {
  const rooms = repo.rooms.all().filter((r: any) => r.status === "LIVE");
  return repo.people.all().map((p: any) => {
    const inBudget = rooms.filter(
      (r: any) => r.rent <= (p.budgetMax || 0) && (r.area === p.area || (p.nearby || []).includes(r.area)),
    );
    return {
      ...p,
      options: inBudget.length,
      cheapest: inBudget.length ? Math.min(...inBudget.map((r: any) => r.rent)) : 0,
      severity: inBudget.length === 0 ? "blocked" : inBudget.length < 2 ? "at-risk" : "healthy",
      unblock:
        inBudget.length === 0
          ? `Raise budget by ₹${Math.max(1000, Math.round(((median(rooms.map((r: any) => r.rent)) - (p.budgetMax || 0)) || 1500) / 500) * 500)} or add a nearby area`
          : inBudget.length < 2
            ? "Offer a Gharpayy ready bed as fallback"
            : "Push to visit booking",
    };
  });
}

/** Owner-facing supply + demand view: what each owner household should do. */
export function ownerBoard() {
  const m = markets();
  const byArea = Object.fromEntries(m.map((x) => [x.area, x]));
  return supplyDesk().map((r: any) => {
    const mk = byArea[r.area];
    const pricing =
      mk && mk.medianRent && r.rent > mk.medianRent * 1.12
        ? "overpriced"
        : mk && mk.medianRent && r.rent < mk.medianRent * 0.9
          ? "underpriced"
          : "market";
    return {
      id: r.id,
      title: r.title,
      area: r.area,
      rent: r.rent,
      marketRent: mk?.medianRent || r.rent,
      pricing,
      demandRatio: mk?.ratio || 0,
      matchableSeekers: r.matchableSeekers,
      health: r.health,
      daysVacant: Math.round(r.ageHours / 24),
      revenueAtRisk: r.status === "LIVE" && r.matchableSeekers === 0 ? r.rent : 0,
      recommendation:
        pricing === "overpriced"
          ? `Drop to ₹${(mk?.medianRent || r.rent).toLocaleString("en-IN")} to unlock ${Math.max(1, r.matchableSeekers + 2)} seekers`
          : r.health === "stale"
            ? "Re-verify photos & availability today"
            : r.matchableSeekers === 0
              ? "Widen gender/roomtype preference or list as replacement"
              : `Convert ${r.matchableSeekers} seekers — send visit slots`,
    };
  });
}

/** Daily liquidity mission board: the exact moves for the ops team. */
export function missions() {
  const m = markets();
  const supply = supplyDesk();
  const demand = demandDesk();
  const out: any[] = [];
  m.filter((x) => x.state === "starved" || x.state === "tight").forEach((x) =>
    out.push({
      id: `sup-${x.area}`,
      lane: "supply",
      priority: x.state === "starved" ? 1 : 2,
      title: x.action,
      why: `${x.demand} seekers vs ${x.supplyRooms + x.readyBeds} live beds (${x.ratio}×)`,
      area: x.area,
    }),
  );
  demand
    .filter((d: any) => d.severity === "blocked")
    .slice(0, 8)
    .forEach((d: any) =>
      out.push({
        id: `dem-${d.id}`,
        lane: "demand",
        priority: 1,
        title: `Unblock ${d.name}`,
        why: d.unblock,
        area: d.area,
      }),
    );
  supply
    .filter((s: any) => s.health === "stale")
    .slice(0, 8)
    .forEach((s: any) =>
      out.push({
        id: `ver-${s.id}`,
        lane: "trust",
        priority: 2,
        title: `Re-verify ${s.title}`,
        why: `Last verified ${Math.round(s.ageHours / 24)} days ago`,
        area: s.area,
      }),
    );
  m.filter((x) => x.state === "surplus" && x.supplyRooms > 0).forEach((x) =>
    out.push({
      id: `mkt-${x.area}`,
      lane: "growth",
      priority: 3,
      title: x.action,
      why: `Only ${x.demand} seekers for ${x.supplyRooms} rooms`,
      area: x.area,
    }),
  );
  return out.sort((a, b) => a.priority - b.priority);
}

export const money = (n: number) =>
  `₹${Math.round(n || 0).toLocaleString("en-IN")}`;
