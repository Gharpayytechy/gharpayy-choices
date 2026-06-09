// Lightweight client analytics · console + localStorage ring buffer (last 200).
// Drop-in for a real provider later (PostHog / Plausible / GA4).
//
// Also exports pure helpers used by the admin dashboard:
//   getRecentActivity, getSlaBreaches, getFunnelStages, getDailyCounts
// All side-effect free and safe with empty inputs.

export type AnalyticsEvent = {
  ts: number;
  event: string;
  props?: Record<string, unknown>;
};

const KEY = "gharpayy.events.v1";
const MAX = 200;

function read(): AnalyticsEvent[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function write(events: AnalyticsEvent[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(events.slice(-MAX)));
  } catch {}
}

export function track(event: string, props?: Record<string, unknown>) {
  const entry: AnalyticsEvent = { ts: Date.now(), event, props };
  if (typeof window !== "undefined") {
    // eslint-disable-next-line no-console
    console.debug("[track]", event, props ?? {});
    const next = [...read(), entry];
    write(next);
    try {
      window.dispatchEvent(new CustomEvent("gharpayy:event", { detail: entry }));
    } catch {}
  }
}

export function recentEvents(limit = 50): AnalyticsEvent[] {
  return read().slice(-limit).reverse();
}

export function clearEvents() {
  write([]);
}

// ───────────────── Lead-derived analytics (pure) ─────────────────

export type LeadLike = {
  id: number;
  referralId?: string;
  leadName?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  captainId?: string;
  captainName?: string;
  assignedAgentName?: string | null;
  sourceContext?: string;
  source?: string;
  area?: string | null;
  notes?: Array<{ id: number; note: string; type?: string; createdByName?: string; createdAt: string }>;
};

const STAGE_ORDER = ["NEW", "CONTACTED", "VERIFIED", "VISIT", "BOOKED"] as const;
const CLOSED_STATES = new Set(["BOOKED", "CLOSED", "LOST"]);

const safeTime = (s?: string) => {
  if (!s) return 0;
  const t = new Date(s).getTime();
  return Number.isFinite(t) ? t : 0;
};

export function getFunnelStages(leads: LeadLike[]) {
  if (!leads?.length) {
    return STAGE_ORDER.map((s) => ({ stage: s, count: 0, dropPct: 0, isLeak: false }));
  }
  // For each stage, count leads that reached *at least* this stage.
  // We treat the recorded status as the furthest stage reached.
  const reachedIndex = (status?: string) => {
    if (!status) return -1;
    if (status === "MATCHED") return STAGE_ORDER.indexOf("VERIFIED");
    if (status === "CLOSED") return STAGE_ORDER.indexOf("BOOKED");
    if (status === "LOST") return -1;
    return STAGE_ORDER.indexOf(status as any);
  };
  const counts = STAGE_ORDER.map((_, i) => leads.filter((l) => reachedIndex(l.status) >= i).length);
  let leakIdx = 0;
  let leakPct = 0;
  const stages = STAGE_ORDER.map((stage, i) => {
    const prev = i === 0 ? counts[0] : counts[i - 1];
    const dropPct = i === 0 || prev === 0 ? 0 : Math.round(((prev - counts[i]) / prev) * 100);
    if (i > 0 && dropPct > leakPct) {
      leakPct = dropPct;
      leakIdx = i;
    }
    return { stage, count: counts[i], dropPct, isLeak: false };
  });
  if (leakPct > 0) stages[leakIdx].isLeak = true;
  return stages;
}

export function getSlaBreaches(leads: LeadLike[], hours = 24): LeadLike[] {
  if (!leads?.length) return [];
  const cutoff = Date.now() - hours * 3600 * 1000;
  return leads.filter((l) => {
    if (!l.status || CLOSED_STATES.has(l.status)) return false;
    if (!["NEW", "CONTACTED"].includes(l.status)) return false;
    if (safeTime(l.createdAt) > cutoff) return false;
    const newestNote = (l.notes || []).reduce((m, n) => Math.max(m, safeTime(n.createdAt)), 0);
    return newestNote < cutoff;
  });
}

export type ActivityRow = {
  ts: number;
  leadId: number;
  leadName: string;
  kind: "created" | "status" | "note" | "assign";
  text: string;
};

export function getRecentActivity(leads: LeadLike[], limit = 25): ActivityRow[] {
  const rows: ActivityRow[] = [];
  for (const l of leads || []) {
    rows.push({
      ts: safeTime(l.createdAt),
      leadId: l.id,
      leadName: l.leadName || `Lead #${l.id}`,
      kind: "created",
      text: `New lead from ${l.area || "(no area)"}`,
    });
    for (const n of l.notes || []) {
      const kind = n.type === "STATUS_CHANGE" ? "status" : "note";
      rows.push({
        ts: safeTime(n.createdAt),
        leadId: l.id,
        leadName: l.leadName || `Lead #${l.id}`,
        kind,
        text: n.note,
      });
    }
  }
  return rows.filter((r) => r.ts > 0).sort((a, b) => b.ts - a.ts).slice(0, limit);
}

export function getDailyCounts(leads: LeadLike[], days = 7): { day: string; count: number }[] {
  const now = new Date();
  const buckets: { day: string; count: number; t0: number; t1: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const t0 = d.getTime();
    const t1 = t0 + 24 * 3600 * 1000;
    buckets.push({
      day: d.toLocaleDateString(undefined, { weekday: "short" }),
      count: 0,
      t0,
      t1,
    });
  }
  for (const l of leads || []) {
    const t = safeTime(l.createdAt);
    const b = buckets.find((b) => t >= b.t0 && t < b.t1);
    if (b) b.count++;
  }
  return buckets.map(({ day, count }) => ({ day, count }));
}

export function getAvgFirstResponseHours(leads: LeadLike[]): number | null {
  const samples: number[] = [];
  for (const l of leads || []) {
    const created = safeTime(l.createdAt);
    if (!created) continue;
    const firstNote = (l.notes || [])
      .map((n) => safeTime(n.createdAt))
      .filter((t) => t > created)
      .sort((a, b) => a - b)[0];
    if (firstNote) samples.push((firstNote - created) / 3600000);
  }
  if (!samples.length) return null;
  return Math.round((samples.reduce((s, v) => s + v, 0) / samples.length) * 10) / 10;
}

// ───────────────── Zone / Tier / Channel rollups ─────────────────

import { GHARPAYY_ZONES, zoneForLead } from "@/lib/gharpayy-zones";
import { PRICING_TIERS } from "@/lib/pricing-tiers";
import { EARN_RULES } from "@/lib/earn-rules";

export type ZoneStat = {
  slug: string;
  name: string;
  display: string;
  heroImage: string;
  tagline: string;
  captainId: string;
  open: number;
  booked: number;
  total: number;
  conversion: number;     // %
  avgFirstReplyH: number | null;
  occupancy: number;      // % (mocked from booked/total)
};

export function getZoneStats(leads: LeadLike[]): ZoneStat[] {
  return GHARPAYY_ZONES.map((z) => {
    const matched = (leads || []).filter((l) => zoneForLead(l)?.slug === z.slug);
    const open = matched.filter((l) => !["BOOKED", "CLOSED", "LOST"].includes(l.status || "")).length;
    const booked = matched.filter((l) => ["BOOKED", "CLOSED"].includes(l.status || "")).length;
    const total = matched.length;
    const conversion = total > 0 ? Math.round((booked / total) * 100) : 0;
    const avgFirstReplyH = getAvgFirstResponseHours(matched);
    const occupancy = Math.min(100, 60 + booked * 3);
    return {
      slug: z.slug,
      name: z.name,
      display: z.display,
      heroImage: z.heroImage,
      tagline: z.tagline,
      captainId: z.captainId,
      open,
      booked,
      total,
      conversion,
      avgFirstReplyH,
      occupancy,
    };
  });
}

export function getTierMix(leads: LeadLike[]): { id: string; name: string; color: string; count: number; pct: number }[] {
  const counts = new Map<string, number>();
  for (const l of leads || []) {
    const t = (l as any).tier || "CLASSICS";
    counts.set(t, (counts.get(t) || 0) + 1);
  }
  const total = (leads || []).length || 1;
  return PRICING_TIERS.map((t) => {
    const count = counts.get(t.id) || 0;
    return { id: t.id, name: t.name, color: t.color, count, pct: Math.round((count / total) * 100) };
  });
}

export function getChannelROI(leads: LeadLike[]): { id: string; name: string; emoji: string; leads: number; bookings: number; conversion: number; revenue: number }[] {
  const groups = new Map<string, LeadLike[]>();
  for (const l of leads || []) {
    const c = (l as any).channel || "wa-share";
    if (!groups.has(c)) groups.set(c, []);
    groups.get(c)!.push(l);
  }
  return EARN_RULES.map((r) => {
    const group = groups.get(r.id) || [];
    const bookings = group.filter((l) => ["BOOKED", "CLOSED"].includes(l.status || "")).length;
    const conversion = group.length ? Math.round((bookings / group.length) * 100) : 0;
    const revenue = bookings * r.payoutOnBooking;
    return { id: r.id, name: r.title, emoji: r.emoji, leads: group.length, bookings, conversion, revenue };
  });
}

export function getEarnerStats(leads: LeadLike[]): { code: string; name: string; leads: number; bookings: number; earned: number }[] {
  const groups = new Map<string, { name: string; leads: LeadLike[] }>();
  for (const l of leads || []) {
    const code = (l as any).referrerCode || "GHAR-YOU1";
    const name = (l as any).referrerName || "Anonymous";
    if (!groups.has(code)) groups.set(code, { name, leads: [] });
    groups.get(code)!.leads.push(l);
  }
  return Array.from(groups.entries())
    .map(([code, g]) => {
      const bookings = g.leads.filter((l) => ["BOOKED", "CLOSED"].includes(l.status || "")).length;
      const earned = bookings * 2000 + g.leads.length * 50;
      return { code, name: g.name, leads: g.leads.length, bookings, earned };
    })
    .sort((a, b) => b.earned - a.earned);
}
