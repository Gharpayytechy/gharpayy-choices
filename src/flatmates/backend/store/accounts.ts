// @ts-nocheck
/**
 * Flatmates ACCOUNTS — lightweight local sign-up / log-in.
 * No server auth: accounts live in localStorage so the whole marketplace can
 * be used immediately. A logged-in account behaves exactly like a built-in
 * demo persona (its own profile, requests, chats, notifications).
 */
import { uid, notify, setActorId, addActorSeed, getActorId } from "./store";

const KEY = "fm_accounts_v1";
const SESSION = "fm_session_v1";

export const ROLE_META: Record<string, any> = {
  seeker: { emoji: "🧑‍💻", label: "Find a room / flatmate", home: "/flatmates", tagline: "Seeker", intent: "need_room" },
  poster: { emoji: "🛏️", label: "I have a spare room", home: "/flatmates/owner", tagline: "Flatmate poster", intent: "need_flatmate" },
  owner: { emoji: "🏢", label: "I own property to rent", home: "/flatmates/owner", tagline: "Owner", intent: "need_flat" },
  group: { emoji: "👥", label: "Build a group & split a flat", home: "/flatmates/groups", tagline: "Group lead", intent: "form_group" },
};

const read = (): any[] => {
  if (typeof localStorage === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
};
const write = (rows: any[]) => {
  if (typeof localStorage === "undefined") return;
  try { localStorage.setItem(KEY, JSON.stringify(rows)); } catch {}
};

export const listAccounts = () => read();
export const accountById = (id: string) => read().find((a) => a.id === id) || null;
export const normalizeEmail = (e: string) => String(e || "").trim().toLowerCase();

/** Actor-shaped view of an account, so the rest of the app treats it identically. */
export const accountToActor = (a: any) => ({
  id: a.id,
  role: a.role,
  emoji: ROLE_META[a.role]?.emoji || "🙂",
  label: a.name,
  tagline: `${ROLE_META[a.role]?.tagline || "Member"} · ${a.email}`,
  home: ROLE_META[a.role]?.home || "/flatmates",
  blurb: "Your account on this device.",
  isAccount: true,
  seed: a.seed,
});

/** Re-register every stored account so profiles resolve after a refresh. */
export const hydrateAccounts = () => {
  read().forEach((a) => addActorSeed(a.id, a.seed));
};

export const signUp = ({ name, email, password, role, areas = [], budgetMax = 22000, phone = "" }: any) => {
  const mail = normalizeEmail(email);
  if (!name?.trim()) return { ok: false, error: "Enter your name." };
  if (!/^\S+@\S+\.\S+$/.test(mail)) return { ok: false, error: "Enter a valid email address." };
  if (!password || password.length < 6) return { ok: false, error: "Password needs at least 6 characters." };
  if (!ROLE_META[role]) return { ok: false, error: "Choose what you're here to do." };
  const rows = read();
  if (rows.some((a) => normalizeEmail(a.email) === mail)) return { ok: false, error: "That email already has an account. Log in instead." };

  const meta = ROLE_META[role];
  const account = {
    id: "user_" + uid(),
    name: name.trim(),
    email: mail,
    phone,
    password,
    role,
    createdAt: new Date().toISOString(),
    seed: {
      name: name.trim(),
      intent: meta.intent,
      areas,
      budgetMax,
      budgetIdeal: Math.max(6000, Math.round(budgetMax * 0.85)),
      onboarded: false,
      published: false,
      verified: { phone: !!phone, email: true, work: false, id: false },
    },
  };
  write([account, ...rows]);
  addActorSeed(account.id, account.seed);
  startSession(account.id);
  return { ok: true, account };
};

export const logIn = ({ email, password }: any) => {
  const mail = normalizeEmail(email);
  const account = read().find((a) => normalizeEmail(a.email) === mail);
  if (!account) return { ok: false, error: "No account with that email yet. Create one first." };
  if (account.password !== password) return { ok: false, error: "Wrong password. Try again." };
  addActorSeed(account.id, account.seed);
  startSession(account.id);
  return { ok: true, account };
};

export const startSession = (id: string) => {
  if (typeof localStorage !== "undefined") { try { localStorage.setItem(SESSION, id); } catch {} }
  setActorId(id);
  return id;
};

export const logOut = () => {
  if (typeof localStorage !== "undefined") { try { localStorage.removeItem(SESSION); } catch {} }
  setActorId("seeker_aarav");
  notify();
};

export const sessionAccountId = (): string | null => {
  if (typeof localStorage === "undefined") return null;
  try { return localStorage.getItem(SESSION); } catch { return null; }
};

export const currentAccount = () => {
  const id = sessionAccountId();
  return id ? accountById(id) : null;
};

/** True when the visitor is acting as their own signed-up account. */
export const isSignedIn = () => {
  const id = sessionAccountId();
  return !!id && id === getActorId() && !!accountById(id);
};
