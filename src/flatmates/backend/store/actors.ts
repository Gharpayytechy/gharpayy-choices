// @ts-nocheck
/**
 * Flatmates MULTI-USER — the account catalogue.
 * No auth for now: one switcher decides which account you are acting as.
 * Every account has its own requirement, saved items, requests, chats,
 * notifications and daily quota (scoped inside the store by actor id).
 */
import { registerActorSeeds, getActorId, setActorId, useFM } from "./store";
import { listAccounts, accountToActor, hydrateAccounts } from "./accounts";

export type FMRole = "seeker" | "poster" | "owner" | "group" | "admin";

export const ACTORS = [
  {
    id: "seeker_aarav", role: "seeker", emoji: "🧑‍💻", label: "Aarav Menon",
    tagline: "Seeker · needs a room in HSR",
    home: "/flatmates",
    blurb: "The classic demand side: budget ₹18K, wants a private room near HSR from next month.",
    seed: { name: "Aarav Menon", age: 25, gender: "Male", occupation: "Software Engineer", company: "Microsoft", intent: "need_room", areas: ["HSR Layout", "Koramangala"], budgetIdeal: 18000, budgetMax: 22000, roomType: "Private room", onboarded: true, published: true, verified: { phone: true, email: true, work: true, id: false } },
  },
  {
    id: "seeker_aditi", role: "seeker", emoji: "🎨", label: "Aditi Rao",
    tagline: "Seeker · wants a flatmate, not a landlord",
    home: "/flatmates",
    blurb: "Already has a place in mind — looking for the right person to share it with.",
    seed: { name: "Aditi Rao", age: 24, gender: "Female", occupation: "Product Designer", company: "Swiggy", intent: "need_flatmate", areas: ["Koramangala", "Indiranagar"], budgetIdeal: 20000, budgetMax: 24000, roomType: "Private room", onboarded: true, published: true, verified: { phone: true, email: true, work: true, id: true } },
  },
  {
    id: "seeker_rohit", role: "seeker", emoji: "🎓", label: "Rohit Bansal",
    tagline: "Student seeker · tight budget, forming a group",
    home: "/flatmates",
    blurb: "₹11K budget. Can only afford a flat by teaming up — the form-a-flat journey.",
    seed: { name: "Rohit Bansal", age: 23, gender: "Male", occupation: "Student", company: "Christ University", intent: "form_group", areas: ["BTM Layout", "Bellandur"], budgetIdeal: 11000, budgetMax: 13000, roomType: "Shared room", onboarded: true, published: true, verified: { phone: true, email: false, work: false, id: false } },
  },
  {
    id: "host_neha", role: "poster", emoji: "🛏️", label: "Neha Sharma",
    tagline: "Flatmate poster · one room free in her 3BHK",
    home: "/flatmates/owner",
    blurb: "Lives in the flat. Screens every request herself — the household side of supply.",
    seed: { name: "Neha Sharma", age: 27, gender: "Female", occupation: "Marketing Lead", company: "Nykaa", intent: "need_flatmate", areas: ["HSR Layout"], onboarded: true, published: true, verified: { phone: true, email: true, work: true, id: true } },
  },
  {
    id: "owner_rakesh", role: "owner", emoji: "🏢", label: "Rakesh Gowda",
    tagline: "Owner · lists whole flats",
    home: "/flatmates/owner",
    blurb: "Landlord with multiple flats. Cares about days-on-market and qualified visits.",
    seed: { name: "Rakesh Gowda", age: 46, gender: "Male", occupation: "Property Owner", company: "Self", intent: "need_flat", areas: ["Koramangala", "Bellandur"], onboarded: true, published: true, verified: { phone: true, email: true, work: false, id: true } },
  },
  {
    id: "owner_meera", role: "owner", emoji: "🔑", label: "Meera Nair",
    tagline: "Owner · managed rooms portfolio",
    home: "/flatmates/owner",
    blurb: "Runs several rooms across the city — the multi-listing supply operator.",
    seed: { name: "Meera Nair", age: 38, gender: "Female", occupation: "Owner-Operator", company: "Nair Homes", intent: "need_flatmate", areas: ["Indiranagar", "Whitefield"], onboarded: true, published: true, verified: { phone: true, email: true, work: true, id: true } },
  },
  {
    id: "group_kunal", role: "group", emoji: "👥", label: "Kunal Shetty",
    tagline: "Group lead · building the HSR 3BHK crew",
    home: "/flatmates/groups",
    blurb: "Runs a forming household: shortlist, checklist, budget split, then a flat together.",
    seed: { name: "Kunal Shetty", age: 27, gender: "Male", occupation: "Consultant", company: "Deloitte", intent: "form_group", areas: ["HSR Layout", "Sarjapur Road"], budgetIdeal: 22000, budgetMax: 26000, onboarded: true, published: true, verified: { phone: true, email: true, work: true, id: true } },
  },
  {
    id: "ops_admin", role: "admin", emoji: "🛠️", label: "Ops Admin",
    tagline: "Platform admin · supply × demand control tower",
    home: "/flatmates/admin",
    blurb: "Sees the whole marketplace: funnel, bottlenecks, trust, owners and missions.",
    seed: { name: "Ops Admin", occupation: "Marketplace Ops", company: "Gharpayy", intent: "need_room", areas: ["HSR Layout"], onboarded: true },
  },
] as const;

export const ROLE_LABEL: Record<FMRole, string> = {
  seeker: "Seekers",
  poster: "Flatmate posters",
  owner: "Owners / landlords",
  group: "Group leads",
  admin: "Platform admin",
};

registerActorSeeds(Object.fromEntries(ACTORS.map((a) => [a.id, a.seed])));
hydrateAccounts();

/** Signed-up accounts on this device first, then the built-in demo personas. */
export const allActors = () => [...listAccounts().map(accountToActor), ...ACTORS];
export const actorById = (id: string) => allActors().find((a: any) => a.id === id) || ACTORS[0];
export const currentActor = () => actorById(getActorId());
export const switchActor = (id: string) => setActorId(id);
export const useActor = () => useFM(() => currentActor());
export const isAdmin = () => currentActor().role === "admin";
export const isSupplySide = () => ["poster", "owner"].includes(currentActor().role);
