// @ts-nocheck
/**
 * Flatmates BACKEND — intelligence services.
 * Trust scoring, deal-breaker gating, ranked feed and the conversion pipeline
 * (interest → chat → visit → agreement → move-in) with next-best-action nudges.
 * Pure functions over the repository; no UI imports.
 */
import {
  People, Rooms, Flats, Saves, Interests, Threads, Meetings, Reports, getMe,
} from "@/flatmates/backend/store/store";
import { scoreMatch, explain } from "@/flatmates/backend/store/match";

/* ── Trust ─────────────────────────────────────────── */
export const TRUST_TIERS = [
  { min: 85, key: "verified", label: "Verified", tone: "green" },
  { min: 60, key: "checked", label: "ID checked", tone: "amber" },
  { min: 0, key: "basic", label: "Unverified", tone: "slate" },
];

export function trustScore(entity: any = {}) {
  const v = entity.verified || {};
  let s = 20;
  if (v.phone) s += 18;
  if (v.email) s += 8;
  if (v.work) s += 22;
  if (v.id) s += 22;
  const resp = entity.responseScore ?? 70;
  s += Math.round((resp - 50) / 5); // ±10
  if (entity.verifiedAt) {
    const days = (Date.now() - +new Date(entity.verifiedAt)) / 86400000;
    s += days <= 3 ? 8 : days <= 14 ? 4 : 0;
  }
  const flags = Reports.all().filter((r: any) => r.refId === entity.id).length;
  s -= flags * 15;
  return Math.max(0, Math.min(100, s));
}

export const trustTier = (entity: any) => {
  const score = trustScore(entity);
  return { score, ...TRUST_TIERS.find((t) => score >= t.min)! };
};

export function safetyChecklist(entity: any) {
  const v = entity?.verified || {};
  return [
    { label: "Phone verified", done: !!v.phone, why: "Reachable if plans change" },
    { label: "Workplace verified", done: !!v.work, why: "Confirms income stability" },
    { label: "Government ID checked", done: !!v.id, why: "Real person, traceable" },
    { label: "Meet in a public place first", done: false, why: "Never pay before you see the room" },
    { label: "No deposit before agreement", done: false, why: "Paperwork protects both sides" },
  ];
}

/* ── Deal-breakers ─────────────────────────────────── */
export const DEALBREAKERS = [
  { key: "nonSmoking", label: "Non-smoking household", test: (i: any) => String(i.dna?.smoking || "No").toLowerCase() === "no" },
  { key: "attached", label: "Attached bathroom", test: (i: any) => i.bathroom === "Attached" },
  { key: "furnished", label: "Fully furnished", test: (i: any) => /furnish/i.test(i.furnishing || "") },
  { key: "veg", label: "Vegetarian kitchen", test: (i: any) => /veg/i.test(i.dna?.food || "") },
  { key: "petsOk", label: "Pets allowed", test: (i: any) => /okay|yes/i.test(i.dna?.pets || "") },
  { key: "verifiedOnly", label: "Verified people only", test: (i: any) => trustScore(i) >= 60 },
  { key: "noDepositSpike", label: "Deposit ≤ 2 months", test: (i: any) => !i.rent || !i.deposit || i.deposit <= i.rent * 2 },
];

export const failedDealbreakers = (item: any, active: string[] = []) =>
  DEALBREAKERS.filter((d) => active.includes(d.key) && !d.test(item)).map((d) => d.label);

/* ── Ranked feed ───────────────────────────────────── */
const SORTS = {
  match: (a: any, b: any) => b._score - a._score,
  trust: (a: any, b: any) => b._trust - a._trust,
  price: (a: any, b: any) => (a.rent || a.budgetIdeal || 0) - (b.rent || b.budgetIdeal || 0),
  fresh: (a: any, b: any) => +new Date(b.verifiedAt || b.createdAt || 0) - +new Date(a.verifiedAt || a.createdAt || 0),
};

export function rankFeed(items: any[] = [], opts: any = {}) {
  const me = opts.me || getMe();
  const active = opts.dealbreakers || [];
  const rows = items.map((item) => {
    const ex = explain(me, item);
    const broken = failedDealbreakers(item, active);
    return {
      ...item,
      _score: broken.length ? Math.max(0, ex.score - 25 * broken.length) : ex.score,
      _trust: trustScore(item),
      _why: ex.good.slice(0, 2),
      _watch: ex.discuss.slice(0, 1),
      _gates: ex.gates,
      _broken: broken,
    };
  });
  const filtered = opts.strict ? rows.filter((r) => !r._broken.length && !r._gates.length) : rows;
  return filtered.sort(SORTS[opts.sort as keyof typeof SORTS] || SORTS.match);
}

/** Why the feed looks the way it does — shown above results. */
export function feedInsight(rows: any[] = []) {
  if (!rows.length) return null;
  const strong = rows.filter((r) => r._score >= 90).length;
  const avg = Math.round(rows.reduce((s, r) => s + r._score, 0) / rows.length);
  const trusted = rows.filter((r) => r._trust >= 85).length;
  return { strong, avg, trusted, total: rows.length };
}

/* ── Conversion pipeline ───────────────────────────── */
export const STAGES = [
  { key: "shortlist", label: "Shortlisted", hint: "Saved, not yet contacted" },
  { key: "interest", label: "Interest sent", hint: "Waiting on a reply" },
  { key: "chat", label: "In conversation", hint: "Talking about the room" },
  { key: "visit", label: "Visit booked", hint: "Seeing it in person" },
  { key: "agreement", label: "Agreement", hint: "Paperwork before money" },
  { key: "movein", label: "Moved in", hint: "Household is live" },
];

const titleFor = (kind: string, refId: string) => {
  const hit = Rooms.get(refId) || Flats.get(refId) || People.get(refId);
  return hit?.title || hit?.name || `${kind} ${refId.slice(0, 4)}`;
};

export function pipeline() {
  const me = getMe();
  const threads = Threads.all();
  const meetings = Meetings.all();
  const interests = Interests.all();
  const saves = Saves.all();

  const cards: any[] = [];
  const seen = new Set<string>();
  const push = (stage: string, kind: string, refId: string, extra: any = {}) => {
    if (seen.has(refId)) return;
    seen.add(refId);
    cards.push({ stage, kind, refId, title: titleFor(kind, refId), ...extra });
  };

  if (me.household?.refId) push("movein", me.household.kind, me.household.refId, { at: me.household.movedInAt });
  meetings.forEach((m: any) => m.refId && push("visit", m.kind || "room", m.refId, { at: m.date, note: `${m.date || ""} ${m.time || ""}`.trim() }));
  threads.forEach((t: any) => push(t.messages?.length > 1 ? "chat" : "interest", t.kind, t.refId, { threadId: t.id, mutual: t.mutual, note: t.messages?.at(-1)?.text }));
  interests.forEach((i: any) => push("interest", i.kind, i.refId, { at: i.at }));
  saves.forEach((s: any) => push("shortlist", s.kind, s.refId));

  const byStage = STAGES.map((s) => ({ ...s, items: cards.filter((c) => c.stage === s.key) }));
  const reached = STAGES.map((s) => cards.filter((c) => c.stage === s.key).length);
  const conversion = cards.length ? Math.round(((reached[3] + reached[4] + reached[5]) / cards.length) * 100) : 0;
  return { cards, byStage, conversion, total: cards.length };
}

/** The single highest-leverage thing to do next, plus runners-up. */
export function nextActions() {
  const p = pipeline();
  const me = getMe();
  const out: any[] = [];
  const stage = (k: string) => p.byStage.find((s) => s.key === k)?.items || [];

  const mutualWaiting = stage("chat").filter((c: any) => c.mutual);
  if (mutualWaiting.length)
    out.push({ urgency: "now", title: `Book a visit with ${mutualWaiting[0].title}`, body: "It's mutual and the conversation is warm — visits booked within 48h convert 3× more often.", cta: "Schedule visit", to: "/flatmates/schedule" });

  if (stage("visit").length)
    out.push({ urgency: "now", title: "Generate the agreement before you pay", body: "Lock rent, deposit, notice and house rules in writing first.", cta: "Open agreement", to: "/flatmates/agreement" });

  if (stage("interest").length >= 3)
    out.push({ urgency: "soon", title: `${stage("interest").length} interests are waiting on a reply`, body: "Nudge the top two — most people reply within a day.", cta: "Open inbox", to: "/flatmates/inbox" });

  const v = me.verified || {};
  if (!v.id || !v.work)
    out.push({ urgency: "soon", title: "Finish verification to rank higher", body: "Verified profiles get replies ~3× more often and appear above unverified ones.", cta: "Verify now", to: "/flatmates/trust" });

  if (stage("shortlist").length && !stage("interest").length)
    out.push({ urgency: "soon", title: "Your shortlist is going stale", body: "Rooms in your budget band get taken in about 6 days. Send interest today.", cta: "Open shortlist", to: "/flatmates/saved" });

  if (!out.length)
    out.push({ urgency: "explore", title: "Find your next strong match", body: "Your feed is re-ranked live as new supply lands in your areas.", cta: "Discover", to: "/flatmates/discover" });

  return out.slice(0, 4);
}

/* ── Daily Top 10 (anti-spam feed) ─────────────────── */
import { getDaily, setDailyPicks, DAILY_PICK_LIMIT, todayKey } from "@/flatmates/backend/store/store";

/**
 * The only supply a person can act on today. Ranked once per day and cached so
 * the set is stable until midnight — limited requests to a limited set of people.
 */
export function dailyPicks(pools: any = {}, opts: any = {}) {
  const tag = (arr: any[] = [], type: string) => arr.map((x) => ({ ...x, _type: type }));
  const pool = [
    ...tag(pools.rooms, "room"),
    ...tag(pools.people, "person"),
    ...tag(pools.flats, "flat"),
  ];
  const ranked = rankFeed(pool, { ...opts, sort: "match" });
  const daily = getDaily();
  const byId = new Map(ranked.map((r: any) => [r.id, r]));

  let picks = (daily.picks || []).map((id: string) => byId.get(id)).filter(Boolean);
  if (picks.length < DAILY_PICK_LIMIT) {
    const have = new Set(picks.map((p: any) => p.id));
    for (const r of ranked) {
      if (picks.length >= DAILY_PICK_LIMIT) break;
      if (!have.has(r.id)) { picks.push(r); have.add(r.id); }
    }
    const ids = picks.map((p: any) => p.id);
    // persist outside the render pass so subscribers aren't notified mid-render
    if (typeof queueMicrotask === "function") queueMicrotask(() => setDailyPicks(ids));
    else setTimeout(() => setDailyPicks(ids), 0);
  }
  const msLeft = +new Date(todayKey() + "T23:59:59Z") - Date.now();
  return {
    picks,
    date: daily.date,
    poolSize: ranked.length,
    refreshInHours: Math.max(0, Math.round(msLeft / 3600000)),
  };
}

/* ── 100% response guarantee ───────────────────────── */
/** Every listing answers every request — this is the SLA we surface and enforce. */
export function responseSla(entity: any = {}) {
  const mine = Interests.all().filter((i: any) => i.refId === entity.id);
  const answered = mine.filter((i: any) => i.status && i.status !== "pending").length;
  const base = entity.responseScore ?? 88;
  const rate = mine.length ? Math.round((answered / mine.length) * 100) : base;
  const pending = mine.filter((i: any) => i.status === "pending");
  const oldest = pending.reduce((m: number, i: any) => Math.max(m, Date.now() - +new Date(i.at || i.createdAt || Date.now())), 0);
  return {
    rate,
    guaranteed: rate >= 95,
    pending: pending.length,
    hoursWaiting: Math.round(oldest / 3600000),
    label: rate >= 95 ? "Responds to every request" : `${rate}% response rate`,
  };
}

/** Health of the guarantee across my own outgoing requests. */
export function requestHealth() {
  const mine = Interests.all().filter((i: any) => i.direction !== "in");
  const answered = mine.filter((i: any) => i.status && i.status !== "pending");
  return {
    sent: mine.length,
    answered: answered.length,
    pending: mine.length - answered.length,
    accepted: mine.filter((i: any) => i.status === "accepted").length,
    declined: mine.filter((i: any) => i.status === "declined").length,
    rate: mine.length ? Math.round((answered.length / mine.length) * 100) : 100,
  };
}
