// Referral feature · constants, math and mock data.
// Mirrors the Replit Referral-Quest schema but runs fully client-side
// so the existing TanStack Start build stays static-friendly.

export type ReferralPersona = "STUDENT" | "EARNER" | "GUARD" | "BROKER";

export const PERSONAS: { id: ReferralPersona; label: string; vibe: string; emoji: string; color: string }[] = [
  { id: "STUDENT",  label: "Student",          vibe: "Refer your hostel-mates & juniors",  emoji: "🎓", color: "from-orange-400 to-orange-600" },
  { id: "EARNER",   label: "Working pro",      vibe: "Refer office colleagues & friends",  emoji: "💼", color: "from-amber-400 to-orange-500" },
  { id: "GUARD",    label: "Guard / staff",    vibe: "Building staff · paisa kamao easy",  emoji: "🛡️", color: "from-orange-500 to-rose-500" },
  { id: "BROKER",   label: "Broker / partner", vibe: "Bulk leads, monthly settlement",     emoji: "🤝", color: "from-orange-300 to-amber-500" },
];

export const PROPERTY_TYPES = [
  { value: "PG",      label: "🏠 PG / Hostel" },
  { value: "1BHK",    label: "🏢 1 BHK" },
  { value: "2BHK",    label: "🏘️ 2 BHK" },
  { value: "3BHK",    label: "🏗️ 3 BHK+" },
  { value: "HOUSE",   label: "🏡 House" },
  { value: "STUDIO",  label: "🛏️ Studio / 1RK" },
];

export const TIMELINES = [
  { value: "IMMEDIATE",    label: "Immediate (this week)" },
  { value: "WITHIN_WEEK",  label: "Within a week" },
  { value: "WITHIN_MONTH", label: "Within a month" },
  { value: "EXPLORING",    label: "Just exploring" },
];

// Per-conversion payouts (₹). Tweak in one place.
export const PAYOUT = {
  verified: 50,    // Lead verified by phone
  visit:    250,   // Visit done
  booked:   500,   // Move-in booked
};

export const LEVELS = [
  { id: "BEGINNER", label: "Rookie",    min: 0,    color: "bg-secondary text-foreground" },
  { id: "EXPLORER", label: "Explorer",  min: 100,  color: "bg-blue-100 text-blue-700" },
  { id: "HUSTLER",  label: "Hustler",   min: 300,  color: "bg-orange-100 text-orange-700" },
  { id: "PRO",      label: "Pro",       min: 700,  color: "bg-purple-100 text-purple-700" },
  { id: "LEGEND",   label: "Legend",    min: 1500, color: "bg-yellow-100 text-yellow-800" },
];

export function levelFor(xp: number) {
  return [...LEVELS].reverse().find((l) => xp >= l.min) ?? LEVELS[0];
}

export function nextLevel(xp: number) {
  return LEVELS.find((l) => l.min > xp);
}

export function calcEarnings(referralsPerMonth: number, verifyPct: number, bookPct: number) {
  const verified = Math.round(referralsPerMonth * (verifyPct / 100));
  const booked   = Math.round(verified * (bookPct / 100));
  const visits   = Math.max(0, verified - booked);
  const earnings =
    verified * PAYOUT.verified +
    visits   * PAYOUT.visit * 0.4 + // assume 40% of verified actually visit
    booked   * PAYOUT.booked;
  const xp = verified * 10 + booked * 50;
  return {
    monthly:  Math.round(earnings),
    annual:   Math.round(earnings * 12),
    verified,
    booked,
    xp,
    level:    levelFor(xp),
  };
}

export function makeReferralCode(name: string) {
  const tag = (name || "GHAR").replace(/[^A-Z0-9]/gi, "").slice(0, 4).toUpperCase().padEnd(4, "X");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${tag}-${rand}`;
}

// Static mock leaderboard · ranked, deterministic so SSR matches client.
export const MOCK_LEADERBOARD: Array<{
  rank: number; name: string; persona: ReferralPersona; level: string; xp: number;
  booked: number; streak: number; area: string;
}> = [
  { rank: 1,  name: "Aarav S.",     persona: "STUDENT", level: "Legend",   xp: 2840, booked: 42, streak: 12, area: "Koramangala" },
  { rank: 2,  name: "Pooja R.",     persona: "EARNER",  level: "Legend",   xp: 2310, booked: 36, streak: 9,  area: "HSR Layout" },
  { rank: 3,  name: "Shankar (Guard)", persona: "GUARD",   level: "Pro",   xp: 1640, booked: 28, streak: 14, area: "Bellandur" },
  { rank: 4,  name: "Ravi K.",      persona: "BROKER",  level: "Pro",      xp: 1320, booked: 22, streak: 4,  area: "Marathahalli" },
  { rank: 5,  name: "Megha T.",     persona: "EARNER",  level: "Pro",      xp: 1180, booked: 19, streak: 6,  area: "Whitefield" },
  { rank: 6,  name: "Vikram J.",    persona: "STUDENT", level: "Hustler",  xp: 920,  booked: 14, streak: 3,  area: "Indiranagar" },
  { rank: 7,  name: "Lokesh (Guard)", persona: "GUARD",  level: "Hustler", xp: 780,  booked: 11, streak: 8,  area: "Hebbal" },
  { rank: 8,  name: "Sneha P.",     persona: "STUDENT", level: "Hustler",  xp: 640,  booked: 9,  streak: 2,  area: "BTM Layout" },
  { rank: 9,  name: "Karthik N.",   persona: "EARNER",  level: "Explorer", xp: 420,  booked: 5,  streak: 0,  area: "Electronic City" },
  { rank: 10, name: "Anita G.",     persona: "BROKER",  level: "Explorer", xp: 310,  booked: 4,  streak: 1,  area: "Jayanagar" },
];

export const REWARDS = [
  { tier: "₹50",     when: "Lead verified",  detail: "We call within 24h. If valid, ₹50 lands in your wallet." },
  { tier: "₹250",    when: "Visit done",     detail: "Expert takes them to a property · even if they don't book." },
  { tier: "₹500",    when: "Move-in",        detail: "When they pay token + sign agreement. Paid within 7 days." },
  { tier: "Bonus 2×", when: "Streak ≥ 5",     detail: "Refer 5 verified leads in a month → next payout doubles." },
];
