// The Gharpayy captains · real Bengaluru desk owners who actually pick up leads.
// Source of truth: every persona, every area, every referral routes to one of these.

import { WA_NUMBERS, type WaDesk } from "@/lib/wa";

export type Expert = {
  id: string;
  name: string;
  initial: string;
  title: string;            // "HSR + Koramangala captain"
  desk: WaDesk;             // maps to wa.ts numbers
  hubs: string[];           // area slugs covered
  personas: string[];       // persona ids owned (for routing)
  responseSla: string;      // "Replies in 12 min · 9am–11pm"
  closed: number;           // social proof
  active: number;           // live workload
  quote: string;            // insider one-liner
};

export const CAPTAINS: Expert[] = [
  {
    id: "aditi-hsr",
    name: "Aditi",
    initial: "A",
    title: "HSR + Koramangala captain",
    desk: "concierge",
    hubs: ["hsr-layout", "koramangala", "btm-layout", "jayanagar", "jp-nagar", "bommanahalli", "bannerghatta-road"],
    personas: ["founder-koramangala", "student-christ", "girls-only", "couple-relocating", "single-parent"],
    responseSla: "Replies in 12 min · 9am–11pm",
    closed: 142,
    active: 11,
    quote: "If a HSR landlord quotes you 5% over my median, send me the screenshot. I'll fix it.",
  },
  {
    id: "rahul-orr",
    name: "Rahul",
    initial: "R",
    title: "ORR / Bellandur captain",
    desk: "bellandur",
    hubs: ["bellandur", "marathahalli", "sarjapur-road", "whitefield", "mahadevapura", "brookefield", "kasavanahalli", "varthur", "kadugodi", "hoodi", "old-airport-road"],
    personas: ["techie-orr", "couple-relocating", "nri-returnee", "pet-parent"],
    responseSla: "Replies in 8 min · 8am–11pm",
    closed: 187,
    active: 14,
    quote: "I know which Sarjapur towers actually have water and which ones lie. Ask before you sign.",
  },
  {
    id: "meera-manyata",
    name: "Meera",
    initial: "M",
    title: "Manyata / North captain",
    desk: "manyata",
    hubs: ["hebbal", "thanisandra", "hennur", "kalyan-nagar", "kr-puram", "yelahanka", "frazer-town", "cooke-town", "cv-raman-nagar"],
    personas: ["manyata-pro", "girls-only", "senior-living"],
    responseSla: "Replies in 15 min · 9am–10pm",
    closed: 96,
    active: 7,
    quote: "Hebbal flyover kills 40 minutes a day. Move to Thanisandra and I'll show you the trick.",
  },
  {
    id: "imran-flats",
    name: "Imran",
    initial: "I",
    title: "Gharpayy Homes (1/2 BHK flats)",
    desk: "homes",
    hubs: ["indiranagar", "domlur", "koramangala", "hsr-layout", "whitefield", "jp-nagar", "frazer-town"],
    personas: ["founder-koramangala", "couple-relocating", "nri-returnee", "relocating-family"],
    responseSla: "Replies in 10 min · 10am–9pm",
    closed: 73,
    active: 9,
    quote: "Furnished 1BHK under ₹35k in Indiranagar exists. Only on Tuesdays. Text me Monday night.",
  },
  {
    id: "preeti-students",
    name: "Preeti",
    initial: "P",
    title: "Students + PG desk",
    desk: "allBlr",
    hubs: ["koramangala", "btm-layout", "jayanagar", "bannerghatta-road", "electronic-city", "begur", "bommanahalli", "rajajinagar", "malleshwaram", "vijayanagar"],
    personas: ["student-christ", "ecity-fresher", "iisc-researcher", "intern-summer", "girls-only"],
    responseSla: "Replies in 6 min · 7am–midnight",
    closed: 218,
    active: 16,
    quote: "Parents on the call? Add them. I do the meals, security and rules walkthrough in Hindi.",
  },
  {
    id: "kiran-special",
    name: "Kiran",
    initial: "K",
    title: "Family + senior + pet desk",
    desk: "homes",
    hubs: ["jp-nagar", "jayanagar", "banashankari", "indiranagar", "frazer-town", "malleshwaram"],
    personas: ["relocating-family", "senior-living", "pet-parent", "single-parent"],
    responseSla: "Replies in 20 min · 10am–8pm",
    closed: 41,
    active: 5,
    quote: "Need a ground floor with a lift, pet-okay, near a hospital? That's a 3-tower shortlist. I have it.",
  },
];

export const CAPTAIN_BY_ID = Object.fromEntries(CAPTAINS.map((c) => [c.id, c]));

export function captainForArea(slug?: string | null): Expert {
  if (!slug) return CAPTAINS[0];
  return CAPTAINS.find((c) => c.hubs.includes(slug)) ?? CAPTAINS[0];
}

export function captainForPersona(personaId?: string | null): Expert {
  if (!personaId) return CAPTAINS[0];
  return CAPTAINS.find((c) => c.personas.includes(personaId)) ?? CAPTAINS[0];
}

export function captainPhone(c: Expert) {
  return `+${WA_NUMBERS[c.desk]}`;
}

export function captainWaLink(c: Expert, message: string) {
  return `https://api.whatsapp.com/send?phone=+${WA_NUMBERS[c.desk]}&text=${encodeURIComponent(message)}`;
}
