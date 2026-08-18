// @ts-nocheck
/**
 * RANKING ENGINE — playbook §8 "Matching and ranking".
 *
 * Strict sequence, never a single blended score:
 *   1. Eligibility gate   (lawful occupancy constraints only — hard fail)
 *   2. Feasibility gate   (budget TOTAL, date overlap, room type, zone, duration — hard fail)
 *   3. Freshness score    (stale supply loses distribution)
 *   4. Compatibility      (weighted by the seeker's own must/strong/nice weights)
 *   5. Conversion readiness (verification, response SLA, decision clarity, tourability)
 *   6. Explanation        (3 fit reasons + the single most important conflict)
 *   7. Recovery           (never an empty page — always the next best action)
 */
import { canonicalGraph } from "./canonical";

export const WEIGHTS = { must: 5, strong: 3, nice: 1, ignore: 0 } as const;

const overlaps = (aFrom: number, aTo: number, bFrom: number, bTo: number) => aFrom <= bTo && bFrom <= aTo;
const norm = (s: any) => String(s || "").toLowerCase();

export function defaultRequirement(me: any = {}) {
  const from = Date.now();
  return {
    setup: me.intent || "find_room",
    city: me.city || "Bengaluru",
    areas: me.areas?.length ? me.areas : ["HSR Layout", "Koramangala"],
    budgetIdeal: me.budgetIdeal || 18000,
    budgetMaxTotal: me.budgetMax || 24000,
    depositCeiling: (me.budgetMax || 24000) * 2.5,
    moveInFrom: from,
    moveInTo: from + 45 * 86400000,
    durationMonths: 11,
    roomTypes: [me.roomType || "Private room"],
    nonNegotiables: me.nonNegotiables || [],
    gender: me.gender,
    importance: me.importance || { cleanliness: "must", smoking: "must", food: "nice", social: "strong", guests: "nice", pets: "nice", sleep: "strong" },
    dna: me.dna || {},
  };
}

/* 1 — eligibility: only narrow lawful constraints. Never caste/religion/ethnicity. */
function eligibility(req: any, vac: any, household: any) {
  const failures: string[] = [];
  const pref = norm(vac.genderPref);
  if (pref && pref !== "any" && req.gender && !pref.includes(norm(req.gender))) {
    failures.push(`Shared-home privacy constraint: ${vac.genderPref} household`);
  }
  if (vac.status === "frozen") failures.push("Listing frozen pending a safety review");
  return { pass: failures.length === 0, failures };
}

/* 2 — feasibility: gated on TOTAL monthly cost, never headline rent. */
function feasibility(req: any, vac: any) {
  const failures: string[] = [];
  const total = vac.totalMonthly ?? vac.rent;
  if (total > req.budgetMaxTotal) failures.push(`Total ₹${total.toLocaleString("en-IN")}/mo is above your ₹${req.budgetMaxTotal.toLocaleString("en-IN")} ceiling`);
  if (req.depositCeiling && vac.depositAmount > req.depositCeiling) failures.push("Deposit above your ceiling");
  const avail = Date.parse(vac.availableFrom);
  if (!overlaps(req.moveInFrom, req.moveInTo, avail, avail + 60 * 86400000)) failures.push("Available date is outside your move-in window");
  if (req.city && norm(vac.city) !== norm(req.city)) failures.push("Different city");
  if (req.areas?.length && !req.areas.some((a: string) => norm(a) === norm(vac.area))) failures.push(`${vac.area} is outside your chosen zones`);
  if (req.roomTypes?.length && vac.roomType && !req.roomTypes.some((t: string) => norm(vac.roomType).includes(norm(t).split(" ")[0]))) failures.push(`Room type is ${vac.roomType}`);
  return { pass: failures.length === 0, failures, total };
}

/* 3 — freshness */
function freshness(vac: any) {
  return vac.freshness?.score ?? (vac.status === "stale" ? 20 : 80);
}

/* 4 — compatibility, weighted by the seeker's own importance settings */
const DIMENSIONS = [
  { key: "cleanliness", label: "Cleanliness", get: (h: any) => h?.homeCare?.cleaningStandard },
  { key: "smoking", label: "Smoking", get: (h: any) => h?.lifestyle?.smoking },
  { key: "food", label: "Food", get: (h: any) => h?.kitchen?.vegPolicy },
  { key: "social", label: "Social energy", get: (h: any) => h?.rhythm?.socialLevel },
  { key: "guests", label: "Guests", get: (h: any) => h?.lifestyle?.guests },
  { key: "pets", label: "Pets", get: (h: any) => h?.lifestyle?.pets },
  { key: "sleep", label: "Sleep & quiet hours", get: (h: any) => h?.rhythm?.quietHours },
];

function compatibility(req: any, household: any) {
  let got = 0, max = 0;
  const reasons: string[] = [], discuss: string[] = [], missing: string[] = [];
  for (const d of DIMENSIONS) {
    const w = WEIGHTS[req.importance?.[d.key] || "nice"];
    if (!w) continue;
    max += w;
    const theirs = d.get(household);
    const mine = req.dna?.[d.key];
    if (!theirs) { missing.push(d.label); continue; }
    if (!mine) { got += w * 0.6; continue; }
    const same = norm(theirs) === norm(mine) || norm(theirs).includes(norm(mine)) || norm(mine).includes(norm(theirs));
    if (same) { got += w; reasons.push(`${d.label} matches (${theirs})`); }
    else {
      got += w * 0.25;
      if (req.importance?.[d.key] === "must") discuss.unshift(`${d.label}: you said ${mine}, the household says ${theirs}`);
      else discuss.push(`${d.label}: ${theirs} vs your ${mine}`);
    }
  }
  return { score: max ? Math.round((got / max) * 100) : 65, reasons, discuss, missing };
}

/* 5 — conversion readiness */
function conversionReadiness(vac: any, household: any, unit: any) {
  let s = 40;
  if (vac.tourable) s += 20;
  if (unit?.authority?.verifiedAt) s += 15;
  if (household?.decision?.votingRule) s += 8;
  if (household?.consentComplete) s += 7;
  if (vac.certainty === "confirmed") s += 10;
  return Math.min(100, s);
}

export function rankVacancies(req: any, graph = canonicalGraph()) {
  const results = graph.vacancies.map((vac: any) => {
    const unit = graph.units.find((u: any) => u.id === vac.unitId);
    const household = graph.households.find((h: any) => h.id === vac.householdId);
    const e = eligibility(req, vac, household);
    const f = feasibility(req, vac);
    const fr = freshness(vac);
    const c = e.pass && f.pass ? compatibility(req, household) : { score: 0, reasons: [], discuss: [], missing: [] };
    const cr = conversionReadiness(vac, household, unit);
    const score = e.pass && f.pass ? Math.round(c.score * 0.55 + fr * 0.15 + cr * 0.3) : 0;
    const confidence = fr < 40 ? "needs_confirmation" : c.missing.length > 2 ? "needs_confirmation" : "high";
    return {
      vacancy: vac, unit, household,
      eligibility: e, feasibility: f, freshnessScore: fr,
      compatibility: c.score, conversionReadiness: cr, score, confidence,
      reasons: c.reasons.slice(0, 3),
      discussPoints: c.discuss.slice(0, 2),
      missingData: c.missing,
      blocked: !e.pass || !f.pass,
      blockReasons: [...e.failures, ...f.failures],
    };
  });
  const passing = results.filter((r: any) => !r.blocked).sort((a: any, b: any) => b.score - a.score);
  const blocked = results.filter((r: any) => r.blocked);
  return { passing, blocked, all: results };
}

/**
 * 7 — NO-RESULTS RESOLUTION ENGINE (playbook §8).
 * Diagnoses the single binding constraint and returns concrete recoveries.
 * The product never shows an empty page.
 */
export function resolveNoResults(req: any, ranked: ReturnType<typeof rankVacancies>, graph = canonicalGraph()) {
  const tally: Record<string, number> = {};
  for (const b of ranked.blocked) for (const r of b.blockReasons) {
    const k = /budget|ceiling|Deposit/i.test(r) ? "price" : /date|window/i.test(r) ? "date" : /zone|city/i.test(r) ? "location" : /Room type/i.test(r) ? "roomType" : "eligibility";
    tally[k] = (tally[k] || 0) + 1;
  }
  const binding = Object.entries(tally).sort((a, b) => b[1] - a[1])[0]?.[0] || "supply";

  const near = graph.vacancies
    .filter((v: any) => v.status === "live")
    .map((v: any) => ({ v, gap: (v.totalMonthly ?? v.rent) - req.budgetMaxTotal }))
    .sort((a, b) => Math.abs(a.gap) - Math.abs(b.gap))
    .slice(0, 3);

  const cheapestArea = [...new Set(graph.vacancies.map((v: any) => v.area))]
    .map((a) => ({ area: a, min: Math.min(...graph.vacancies.filter((v: any) => v.area === a).map((v: any) => v.totalMonthly ?? v.rent)) }))
    .sort((a, b) => a.min - b.min)[0];

  const options = [
    binding === "price" && {
      key: "raise_or_shift",
      title: (near[0]?.gap ?? 0) > 0
        ? `₹${Math.round(near[0].gap).toLocaleString("en-IN")} more on your total ceiling unlocks ${near.length} homes`
        : `${near.length} homes already sit inside your budget — the block is your zone or date filter`,
      body: `Price is the binding constraint. Either lift your total ceiling slightly, or switch to ${cheapestArea?.area} where totals start at ₹${(cheapestArea?.min || 0).toLocaleString("en-IN")}.`,
      href: "/flatmates/requirement",
      cta: "Adjust budget or zone",
    },
    binding === "date" && {
      key: "widen_dates",
      title: "Widen your move-in window by 2 weeks",
      body: "Your window is narrower than the notice cycle in this micro-market. Most replacement rooms open on a 30-day notice.",
      href: "/flatmates/requirement",
      cta: "Widen dates",
    },
    binding === "location" && {
      key: "adjacent_zone",
      title: "Add one adjacent micro-market",
      body: "Adjacent zones usually keep your commute under the same limit while doubling supply.",
      href: "/flatmates/discover",
      cta: "See adjacent zones",
    },
    binding === "roomType" && {
      key: "room_type",
      title: "Twin sharing opens more inventory at your budget",
      body: "Same buildings, same households — different room configuration.",
      href: "/flatmates/discover?type=twin",
      cta: "Include twin sharing",
    },
    {
      key: "form_group",
      title: "Form a group and take a whole flat",
      body: "Pooling with 2 seekers in the same zone and date window converts a blocked room search into a whole-flat tenancy.",
      href: "/flatmates/groups",
      cta: "Join or form a group",
    },
    {
      key: "ready_stay",
      title: "Move into a ready stay while you keep searching",
      body: "Managed inventory with immediate availability — you never end up without a bed on the move date.",
      href: "/flatmates/ready",
      cta: "See ready stays",
    },
    {
      key: "supply_mission",
      title: "Get matched by a supply mission",
      body: "We register your zone-budget-date-room gap as an operator mission and source inventory for it. You are notified the moment a canonical vacancy appears.",
      href: "/flatmates/requirement",
      cta: "Register my gap",
    },
    {
      key: "human",
      title: "Talk to the Gharpayy team",
      body: "A human closes the gap when the marketplace cannot — with your zone, budget and date already attached.",
      href: null,
      cta: "WhatsApp help",
    },
  ].filter(Boolean);

  return { binding, tally, options, nearMisses: near.map((n) => n.v) };
}

/** Supply missions derived from blocked demand — the no-dead-end guarantee. */
export function supplyMissions(graph = canonicalGraph(), requirements: any[] = []) {
  const map: Record<string, any> = {};
  for (const req of requirements) {
    for (const area of req.areas || []) {
      const key = `${area}|${Math.round((req.budgetMaxTotal || 0) / 5000) * 5000}|${req.roomTypes?.[0] || "Private room"}`;
      map[key] = map[key] || { area, budgetBand: `≤₹${(Math.round((req.budgetMaxTotal || 0) / 5000) * 5000).toLocaleString("en-IN")}`, roomType: req.roomTypes?.[0] || "Private room", demandCount: 0, supplyCount: 0 };
      map[key].demandCount++;
    }
  }
  for (const k of Object.keys(map)) {
    const m = map[k];
    m.supplyCount = graph.vacancies.filter((v: any) => v.area === m.area && v.status === "live").length;
    m.gap = Math.max(0, m.demandCount - m.supplyCount);
    m.status = m.gap > 0 ? "open" : "filled";
    m.id = "mis_" + k.replace(/\W+/g, "_").toLowerCase();
  }
  return Object.values(map).sort((a: any, b: any) => b.gap - a.gap);
}
