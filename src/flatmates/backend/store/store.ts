// @ts-nocheck
// Gharpayy Flatmates — unified marketplace store (localStorage + pub/sub)
import { useEffect, useState } from "react";

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const K = (n: string) => `fm_${n}_v1`;

const load = (k: string, fb: any = []) => {
  if (typeof localStorage === "undefined") return fb;
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; }
};
const save = (k: string, d: any) => {
  if (typeof localStorage === "undefined") return;
  try { localStorage.setItem(k, JSON.stringify(d)); } catch {}
};

const listeners = new Set<() => void>();
export const subscribe = (fn: () => void) => { listeners.add(fn); return () => { listeners.delete(fn); }; };
export const notify = () => listeners.forEach((f) => f());

/* ── Multi-user: the "acting" account ────────────────────
   No auth for now. A single switch decides whose eyes you see the
   marketplace through: any seeker, any poster/owner, a group lead or ops. */
const ACTOR = K("actor");
export const DEFAULT_ACTOR = "seeker_aarav";
export const getActorId = (): string => {
  if (typeof localStorage === "undefined") return DEFAULT_ACTOR;
  try { return localStorage.getItem(ACTOR) || DEFAULT_ACTOR; } catch { return DEFAULT_ACTOR; }
};
export const setActorId = (id: string) => {
  if (typeof localStorage !== "undefined") { try { localStorage.setItem(ACTOR, id); } catch {} }
  notify();
  return id;
};
/** Actor profile defaults, registered by the actor catalogue (avoids a cycle). */
let ACTOR_SEEDS: Record<string, any> = {};
export const registerActorSeeds = (seeds: Record<string, any>) => { ACTOR_SEEDS = seeds; };

function makeDB<T extends { id: string }>(name: string, scoped = false) {
  const key = K(name);
  const mine = (r: any) => {
    if (!scoped) return true;
    const me = getActorId();
    return !r.actor || r.actor === me || r.to === me;
  };
  return {
    key,
    all(): T[] { return load(key).filter(mine); },
    allRaw(): T[] { return load(key); },
    get(id: string): T | undefined { return load(key).find((x: any) => x.id === id); },
    create(data: any): T {
      const all = load(key);
      const row = { id: uid(), createdAt: new Date().toISOString(), ...(scoped ? { actor: getActorId() } : {}), ...data };
      all.unshift(row); save(key, all); notify(); return row;
    },
    update(id: string, patch: any) {
      const all = load(key);
      const i = all.findIndex((x: any) => x.id === id);
      if (i === -1) return null;
      all[i] = { ...all[i], ...patch, updatedAt: new Date().toISOString() };
      save(key, all); notify(); return all[i];
    },
    del(id: string) { save(key, load(key).filter((x: any) => x.id !== id)); notify(); },
    replace(rows: T[]) { save(key, rows); notify(); },
  };
}

/* ── Entities ───────────────────────────────────────── */
// PERSON = a seeker profile (demand) with lifestyle DNA
export const People = makeDB<any>("people");
// ROOM = supply inside an existing household
export const Rooms = makeDB<any>("rooms");
// FLAT = whole-flat supply
export const Flats = makeDB<any>("flats");
// GROUP = form-a-flat candidate households
export const Groups = makeDB<any>("groups");
export const Threads = makeDB<any>("threads");
export const Interests = makeDB<any>("interests");
export const Meetings = makeDB<any>("meetings");
export const Saves = makeDB<any>("saves");
export const Hides = makeDB<any>("hides");
export const Notifs = makeDB<any>("notifs");
export const Events = makeDB<any>("events");
export const Reports = makeDB<any>("reports");
// Ops layer (admin): action log + mission lifecycle
export const OpsLog = makeDB<any>("opslog");
export const MissionState = makeDB<any>("missionstate");

/* ── Me (the current user's requirement + DNA) ──────── */
const ME = K("me");
export const defaultMe = () => ({
  id: "me",
  name: "",
  age: "",
  gender: "",
  occupation: "",
  company: "",
  workMode: "Hybrid",
  photo: "",
  city: "Bengaluru",
  originCity: "",
  intent: "",           // need_room | need_flatmate | form_group | need_flat | ready_now
  reason: "",
  moveIn: "",           // ISO date
  moveInBand: "",
  duration: "6-12 months",
  areas: [] as string[],
  anchor: "",           // work/college anchor
  commute: "30 min",
  budgetIdeal: 18000,
  budgetMax: 22000,
  depositMonths: "2 months",
  roomType: "Private room",
  bathroom: "Attached preferred",
  furnishing: "Fully furnished",
  dna: {
    cleanliness: "Normal", sleep: "Regular", schedule: "Mostly days", social: "Balanced",
    smoking: "No", alcohol: "Occasionally", food: "No preference", cooking: "Sometimes",
    guests: "Occasionally", partners: "Comfortable", parties: "Occasionally", pets: "Okay",
    cleaning: "Maid",
  },
  priorities: ["Location", "Cleanliness", "Privacy"],
  verified: { phone: false, email: false, work: false, id: false },
  household: null,      // { flatId/roomId, movedInAt }
  onboarded: false,
  published: false,
  createdAt: new Date().toISOString(),
});
export const getMe = () => load(ME, defaultMe());
export const setMe = (patch: any) => { const m = { ...getMe(), ...patch }; save(ME, m); notify(); return m; };
export const resetMe = () => { save(ME, defaultMe()); notify(); };

/* ── Reactive hook ──────────────────────────────────── */
export function useFM<T>(selector: () => T): T {
  const [v, setV] = useState<T>(selector);
  useEffect(() => {
    setV(selector());
    return subscribe(() => setV(selector()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return v;
}

/* ── Event analytics (local) ────────────────────────── */
export const track = (name: string, props: any = {}) => {
  Events.create({ name, props, at: new Date().toISOString() });
};

/* ── Domain actions ─────────────────────────────────── */
export const pushNotif = (n: any) =>
  Notifs.create({ read: false, at: new Date().toISOString(), ...n });

export const toggleSave = (kind: string, refId: string) => {
  const existing = Saves.all().find((s: any) => s.kind === kind && s.refId === refId);
  if (existing) { Saves.del(existing.id); return false; }
  Saves.create({ kind, refId });
  track("match_saved", { kind, refId });
  return true;
};
export const isSaved = (kind: string, refId: string) =>
  Saves.all().some((s: any) => s.kind === kind && s.refId === refId);

export const hideItem = (kind: string, refId: string, reason: string) => {
  Hides.create({ kind, refId, reason });
  track("match_rejected", { kind, refId, reason });
};
export const isHidden = (refId: string) => Hides.all().some((h: any) => h.refId === refId);

/* ── Daily state: top-10 picks + request quota ─────── */
const DAILY = K("daily");
export const todayKey = () => new Date().toISOString().slice(0, 10);
export const DAILY_PICK_LIMIT = 10;
export const DAILY_REQUEST_LIMIT = 5;

const blankDaily = () => ({ date: todayKey(), picks: [] as string[], used: 0 });
export const getDaily = () => {
  const d = load(DAILY, null);
  if (!d || d.date !== todayKey()) return blankDaily();
  return d;
};
const setDaily = (patch: any) => {
  const next = { ...getDaily(), ...patch, date: todayKey() };
  save(DAILY, next);
  notify();
  return next;
};
export const setDailyPicks = (ids: string[]) => setDaily({ picks: ids.slice(0, DAILY_PICK_LIMIT) });

export const quota = () => {
  const d = getDaily();
  return { limit: DAILY_REQUEST_LIMIT, used: d.used, remaining: Math.max(0, DAILY_REQUEST_LIMIT - d.used) };
};

/* ── Requests (accept / reject gating) ─────────────── */
/**
 * Interest is a REQUEST, not a chat. No thread exists until the recipient
 * accepts — this is what stops anyone from texting anyone.
 */
export const sendInterest = (kind: string, refId: string, title: string, reasons: string[], note: string) => {
  const q = quota();
  if (!q.remaining) return { ok: false, reason: "quota", interest: null, thread: null, mutual: false };
  if (Interests.all().some((i: any) => i.refId === refId && i.direction !== "in"))
    return { ok: false, reason: "duplicate", interest: null, thread: null, mutual: false };

  const i = Interests.create({
    kind, refId, title, reasons, note,
    direction: "out",
    status: "pending",
    at: new Date().toISOString(),
  });
  setDaily({ used: getDaily().used + 1 });
  track("interest_sent", { kind, refId });
  pushNotif({
    type: "request",
    title: "Request sent · " + title,
    body: "They decide whether to open the chat. You'll know either way within 48 hours.",
    link: "/flatmates/inbox",
  });
  if (typeof window !== "undefined") {
    setTimeout(() => {
      const still = Interests.get(i.id);
      if (!still || still.status !== "pending") return;
      if (Math.random() > 0.35) acceptInterest(i.id, "them");
      else declineInterest(i.id, "Already filled", "them");
    }, 5000 + Math.random() * 4000);
  }
  return { ok: true, interest: i, thread: null, mutual: false };
};

export const acceptInterest = (id: string, by = "me") => {
  const i = Interests.get(id);
  if (!i || i.status !== "pending") return null;
  const incoming = i.direction === "in";
  const t = Threads.create({
    kind: i.kind,
    refId: i.refId,
    title: i.title,
    mutual: true,
    accepted: true,
    messages: [
      { from: incoming ? "them" : "me", text: i.note || "Hi! I'm interested — is this still available?", at: i.at || new Date().toISOString() },
      { from: incoming ? "me" : "them", text: "Accepted — happy to talk. What would you like to know?", at: new Date().toISOString() },
    ],
  });
  Interests.update(id, { status: "accepted", threadId: t.id, respondedAt: new Date().toISOString(), respondedBy: by });
  track("request_accepted", { id, kind: i.kind, refId: i.refId });
  pushNotif({
    type: "mutual",
    title: "Request accepted · " + i.title,
    body: "The chat is open now. Say hello.",
    link: `/flatmates/chat/${t.id}`,
  });
  return t;
};

export const declineInterest = (id: string, reason = "Not a fit", by = "me") => {
  const i = Interests.get(id);
  if (!i || i.status !== "pending") return null;
  Interests.update(id, { status: "declined", reason, respondedAt: new Date().toISOString(), respondedBy: by });
  track("request_declined", { id, reason });
  pushNotif({
    type: "declined",
    title: "Request declined · " + i.title,
    body: `${reason}. Your daily picks refresh tomorrow with new options.`,
    link: "/flatmates/discover",
  });
  return true;
};

/** Nobody is left hanging: pending requests older than 48h auto-close. */
export const sweepStaleRequests = () => {
  const now = Date.now();
  let closed = 0;
  Interests.all().forEach((i: any) => {
    if (i.status !== "pending") return;
    const age = now - +new Date(i.at || i.createdAt || now);
    if (age > 48 * 3600000) {
      Interests.update(i.id, { status: "expired", reason: "No response in 48h", respondedAt: new Date().toISOString() });
      closed++;
    }
  });
  return closed;
};

export const incomingRequests = () => Interests.all().filter((i: any) => i.direction === "in" && i.status === "pending");
export const outgoingRequests = () => Interests.all().filter((i: any) => i.direction !== "in" && i.status === "pending");

/** Seed a few incoming requests so accept/decline is usable on day one. */
export const ensureIncomingRequests = () => {
  if (Interests.all().some((i: any) => i.direction === "in")) return;
  People.all().slice(0, 3).forEach((p: any, idx: number) => {
    Interests.create({
      kind: "person",
      refId: p.id,
      title: p.name,
      direction: "in",
      status: "pending",
      reasons: ["Same location", "Budget alignment"],
      note: idx === 0 ? "Hi! Saw your requirement — I'm looking in the same area from next month." : "Would love to connect about sharing a place.",
      at: new Date(Date.now() - (idx + 1) * 5 * 3600000).toISOString(),
    });
  });
};

export const interestSentTo = (refId: string) => Interests.all().some((i: any) => i.refId === refId);
export const requestStatusFor = (refId: string) =>
  Interests.all().find((i: any) => i.refId === refId)?.status || null;

export const reply = (threadId: string, text: string, from = "me") => {
  const t = Threads.get(threadId);
  if (!t) return;
  Threads.update(threadId, { messages: [...t.messages, { from, text, at: new Date().toISOString() }] });
  track("message_replied", { threadId });
};

export const scheduleMeeting = (data: any) => {
  const m = Meetings.create({ status: "confirmed", ...data });
  pushNotif({ type: "visit", title: "Meeting confirmed", body: `${data.title} · ${data.date} ${data.time}`, link: "/flatmates/meetings" });
  track("visit_confirmed", { id: m.id });
  return m;
};

/* Someone is moving out → instantly create replacement supply */
export const createReplacement = (payload: any = {}) => {
  const me = getMe();
  const room = Rooms.create({
    title: payload.title || `Room in my ${me.area || 'Bengaluru'} flat`,
    area: payload.area || me.area || 'Koramangala',
    rent: payload.rent || me.budgetIdeal || 18000,
    deposit: payload.deposit || (me.budgetIdeal || 18000) * 2,
    roomType: payload.roomType || 'Private',
    bathroom: payload.bathroom || 'Attached',
    furnishing: payload.furnishing || 'Furnished',
    bhk: payload.bhk || 3,
    residents: payload.residents || 2,
    availableFrom: payload.availableFrom || new Date(Date.now()+15*864e5).toISOString(),
    type: "ROOM_REPLACEMENT",
    status: "LIVE",
    verifiedAt: new Date().toISOString(),
    photos: payload.photos || [],
    ...payload,
  });
  pushNotif({
    type: "supply",
    title: "Replacement listing is live",
    body: `${room.title} · we're already matching candidates.`,
    link: `/flatmates/room/${room.id}`,
  });
  track("replacement_created", { id: room.id });
  return room;
};

export const markMovedIn = (kind: string, refId: string) => {
  if (kind === "room") Rooms.update(refId, { status: "FILLED" });
  setMe({ household: { kind, refId, movedInAt: new Date().toISOString() } });
  pushNotif({ type: "household", title: "Welcome home 🎉", body: "Your household is set up. Manage rent, rules and expenses.", link: "/flatmates/household" });
  track("move_in_confirmed", { kind, refId });
};

// --- convenience aliases used by pages ---
export const Saved = Saves;
export const addMeeting = (data: any) => scheduleMeeting(data);
export const resetFM = () => {
  try {
    Object.keys(localStorage).filter((k) => k.startsWith("fm_")).forEach((k) => localStorage.removeItem(k));
  } catch {}
  notify();
};
