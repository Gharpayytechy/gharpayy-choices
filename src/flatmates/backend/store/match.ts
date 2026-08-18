// @ts-nocheck
// Match engine — hard gates, weighted score, explainability
const num = (v: any) => Number(String(v).replace(/[^\d]/g, "")) || 0;

const overlap = (a: string[] = [], b: string[] = []) =>
  a.filter((x) => b.map((y) => y.toLowerCase()).includes(String(x).toLowerCase()));

const daysBetween = (a?: string, b?: string) => {
  if (!a || !b) return 30;
  return Math.abs(+new Date(a) - +new Date(b)) / 86400000;
};

const WEIGHTS = {
  location: 20, budget: 15, moveIn: 15, room: 15, household: 15, lifestyle: 10, trust: 5, response: 5,
};

export function hardGates(me: any, item: any) {
  const fails: string[] = [];
  if (item.genderPref && me.gender && item.genderPref !== "Any" && item.genderPref !== me.gender)
    fails.push(`Household is ${item.genderPref.toLowerCase()} only`);
  if (item.rent && me.budgetMax && item.rent > me.budgetMax * 1.25)
    fails.push("Well above your maximum budget");
  if (item.status === "FILLED") fails.push("Already filled");
  return fails;
}

export function scoreMatch(me: any, item: any) {
  const parts: any[] = [];
  const areas = me.areas?.length ? me.areas : [];
  const loc = item.area
    ? (overlap(areas, [item.area]).length ? 100 : (item.nearby || []).some((n: string) => areas.includes(n)) ? 78 : 52)
    : 60;
  parts.push({ label: "Location", score: loc, weight: WEIGHTS.location });

  const rent = item.rent || item.budgetIdeal || 0;
  const bud = !rent ? 70
    : rent <= me.budgetIdeal ? 100
    : rent <= me.budgetMax ? 88
    : rent <= me.budgetMax * 1.15 ? 62 : 30;
  parts.push({ label: "Budget", score: bud, weight: WEIGHTS.budget });

  const d = daysBetween(me.moveIn, item.availableFrom || item.moveIn);
  const mv = d <= 3 ? 100 : d <= 7 ? 92 : d <= 14 ? 80 : d <= 30 ? 66 : 45;
  parts.push({ label: "Move-in", score: mv, weight: WEIGHTS.moveIn });

  const rt = !item.roomType ? 75 : item.roomType === me.roomType ? 100 : me.roomType === "Any" ? 90 : 60;
  parts.push({ label: "Room & property", score: rt, weight: WEIGHTS.room });

  const dna = me.dna || {};
  const idna = item.dna || {};
  const keys = ["cleanliness", "social", "smoking", "food", "guests", "sleep", "cooking", "pets"];
  const hits = keys.filter((k) => idna[k] && dna[k] && idna[k] === dna[k]).length;
  const known = keys.filter((k) => idna[k]).length || 1;
  const hh = Math.round(55 + (hits / known) * 45);
  parts.push({ label: "Household fit", score: hh, weight: WEIGHTS.household });
  parts.push({ label: "Lifestyle", score: Math.min(100, hh + (idna.smoking === dna.smoking ? 8 : -6)), weight: WEIGHTS.lifestyle });

  const v = item.verified || {};
  const trust = 40 + (v.phone ? 20 : 0) + (v.work ? 20 : 0) + (v.id ? 20 : 0);
  parts.push({ label: "Trust", score: trust, weight: WEIGHTS.trust });
  parts.push({ label: "Responsiveness", score: item.responseScore ?? 75, weight: WEIGHTS.response });

  const total = Math.round(parts.reduce((s, p) => s + p.score * p.weight, 0) / 100);
  const gates = hardGates(me, item);
  return { score: gates.length ? Math.min(total, 62) : total, parts, gates };
}

export function explain(me: any, item: any) {
  const { score, parts, gates } = scoreMatch(me, item);
  const good = parts.filter((p) => p.score >= 85).map((p) => positiveCopy(p.label, me, item));
  const discuss = parts.filter((p) => p.score < 70).map((p) => discussCopy(p.label, me, item));
  return { score, parts, gates, good: good.filter(Boolean).slice(0, 4), discuss: discuss.filter(Boolean).slice(0, 3) };
}

function positiveCopy(label: string, me: any, item: any) {
  switch (label) {
    case "Location": return `${item.area} is on your shortlist`;
    case "Budget": return `₹${(item.rent || 0).toLocaleString("en-IN")} sits inside your budget`;
    case "Move-in": return "Move-in dates line up";
    case "Room & property": return `${item.roomType || "Room"} is exactly what you asked for`;
    case "Household fit": return "Cleanliness and routine expectations align";
    case "Lifestyle": return `Both ${String(item.dna?.smoking || "").toLowerCase() === "no" ? "non-smoking" : "flexible on smoking"}`;
    case "Trust": return "Phone and workplace verified";
    case "Responsiveness": return "Usually replies fast";
    default: return null;
  }
}
function discussCopy(label: string, me: any, item: any) {
  switch (label) {
    case "Location": return `${item.area} is outside your preferred areas — check the commute`;
    case "Budget": return "Rent is above your ideal — ask what's included";
    case "Move-in": return "Dates differ by a couple of weeks — ask about flexibility";
    case "Room & property": return `They offer ${item.roomType} — you wanted ${me.roomType}`;
    case "Household fit": return "Different daily routines — worth talking through";
    case "Lifestyle": return "They're more social than you";
    case "Trust": return "Verification incomplete — meet in a public place first";
    case "Responsiveness": return "Replies can be slow";
    default: return null;
  }
}

export const matchBadge = (s: number) =>
  s >= 90 ? { label: "Strong match", cls: "bg-emerald-100 text-emerald-800 border-emerald-200" }
  : s >= 75 ? { label: "Good match", cls: "bg-amber-100 text-amber-800 border-amber-200" }
  : { label: "Worth a look", cls: "bg-slate-100 text-slate-700 border-slate-200" };

/* Resolution engine — never a dead end */
export function resolutionRoutes(me: any, counts: any) {
  const routes: any[] = [];
  if (counts.rooms === 0) {
    routes.push({
      title: "Meet people and take a flat together",
      body: `${counts.people} compatible people are looking in your areas right now.`,
      cta: "Meet People", to: "/flatmates/discover?tab=people",
    });
    routes.push({
      title: "Expand your search by 2km",
      body: "Adjacent areas usually add 40–70% more supply.",
      cta: "Expand Search", to: "/flatmates/you/requirement",
    });
    routes.push({
      title: `${counts.ready} ready-to-move stays available now`,
      body: "Gharpayy managed rooms you can move into this week.",
      cta: "See Ready Stays", to: "/flatmates/ready",
    });
  }
  return routes;
}

/* Constraint diagnosis */
export function constraintImpact(me: any, pool: any[]) {
  const total = pool.length || 1;
  const tests = [
    { label: "Attached bathroom", pass: (r: any) => me.bathroom !== "Attached required" || r.bathroom === "Attached" },
    { label: `${me.roomType}`, pass: (r: any) => me.roomType === "Any" || r.roomType === me.roomType },
    { label: `Budget ₹${me.budgetMax?.toLocaleString("en-IN")}`, pass: (r: any) => r.rent <= me.budgetMax },
    { label: "Your areas", pass: (r: any) => !me.areas.length || me.areas.includes(r.area) },
  ];
  return tests.map((t) => {
    const removed = pool.filter((r) => !t.pass(r)).length;
    return { label: t.label, removedPct: Math.round((removed / total) * 100) };
  }).sort((a, b) => b.removedPct - a.removedPct);
}
