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

function makeDB<T extends { id: string }>(name: string) {
  const key = K(name);
  return {
    key,
    all(): T[] { return load(key); },
    get(id: string): T | undefined { return load(key).find((x: any) => x.id === id); },
    create(data: any): T {
      const all = load(key);
      const row = { id: uid(), createdAt: new Date().toISOString(), ...data };
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

export const sendInterest = (kind: string, refId: string, title: string, reasons: string[], note: string) => {
  const i = Interests.create({ kind, refId, title, reasons, note, status: "sent", at: new Date().toISOString() });
  track("interest_sent", { kind, refId });
  // simulate the other side reciprocating for demo liquidity
  const mutual = Math.random() > 0.45;
  const t = Threads.create({
    kind, refId, title, mutual,
    messages: [
      { from: "me", text: note || "Hi! I'm interested — is this still available?", at: new Date().toISOString() },
      ...(mutual ? [{ from: "them", text: "Hey! Yes it is. Want to see it this week?", at: new Date().toISOString() }] : []),
    ],
  });
  pushNotif({
    type: mutual ? "mutual" : "interest",
    title: mutual ? "It's mutual · " + title : "Interest sent · " + title,
    body: mutual ? "You both want to explore this. Start the chat." : "They'll be notified. Most people reply within a day.",
    link: `/flatmates/chat/${t.id}`,
  });
  return { interest: i, thread: t, mutual };
};

export const interestSentTo = (refId: string) => Interests.all().some((i: any) => i.refId === refId);

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
export const createReplacement = (payload: any) => {
  const room = Rooms.create({
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
