// Curated context per micro-market: nearest metro, commute minutes to top
// employer hubs, and a one-line vibe. All values are realistic ballparks
// from public Google Maps drive times in non-peak traffic.

export type AreaCtx = {
  metro: string;
  metroKm: number;
  vibe: string;
  blurb: string;
  commute: Partial<Record<"manyata" | "egl" | "orr" | "whitefield" | "ecity" | "mg-road", number>>;
  faqs: { q: string; a: string }[];
  nearby: string[]; // slugs of neighboring areas
  personas: ("techie" | "student" | "founder" | "couple" | "family" | "girls")[];
};

const base = (overrides: Partial<AreaCtx>): AreaCtx => ({
  metro: "Nearest metro 3 km",
  metroKm: 3,
  vibe: "Mixed residential",
  blurb: "A popular Bengaluru micro-market with good rental supply.",
  commute: {},
  faqs: [],
  nearby: [],
  personas: ["techie", "couple"],
  ...overrides,
});

const COMMON_FAQS = (name: string) => [
  { q: `Is ${name} safe for women living alone?`, a: `${name} has a mix of gated societies and standalone buildings. We recommend gated societies with 24×7 security · Gharpayy filters for these by default.` },
  { q: `What's the average deposit in ${name}?`, a: `Most owners ask 5–10 months as security deposit. Gharpayy stays in this hub cap deposit at 2 months.` },
  { q: `Are couples allowed in ${name}?`, a: `Yes · most independent buildings allow couples with marriage proof. Ask the expert for a verified couples-friendly shortlist.` },
  { q: `Is water supply reliable in ${name}?`, a: `Cauvery + borewell mix. Most gated societies have 24×7 supply; older standalone buildings rely on tankers in summer.` },
  { q: `What's the food and grocery scene like in ${name}?`, a: `Strong · multiple supermarkets, 10-min delivery, and a dense restaurant cluster within 2 km.` },
];

export const AREA_CTX: Record<string, AreaCtx> = {
  koramangala: base({
    metro: "MG Road / Indiranagar (Purple Line)", metroKm: 4,
    vibe: "Startup capital · cafés · founders",
    blurb: "Bengaluru's startup HQ · Razorpay, Zomato, Ola, Swiggy and CRED all walking distance from each other.",
    commute: { manyata: 55, egl: 40, orr: 35, whitefield: 70, ecity: 50, "mg-road": 25 },
    nearby: ["hsr-layout", "btm-layout", "indiranagar", "domlur", "jayanagar"],
    personas: ["founder", "techie", "couple", "girls"],
  }),
  "hsr-layout": base({
    metro: "Silk Board (Yellow Line, opening)", metroKm: 3,
    vibe: "Young families · techies · cafés",
    blurb: "The grid-planned heart of South-East Bengaluru · clean roads, parks, and a strong startup + tech mix.",
    commute: { manyata: 60, egl: 30, orr: 25, whitefield: 50, ecity: 35, "mg-road": 35 },
    nearby: ["koramangala", "btm-layout", "bommanahalli", "sarjapur-road", "bellandur"],
    personas: ["techie", "founder", "couple", "family", "girls"],
  }),
  indiranagar: base({
    metro: "Indiranagar (Purple Line)", metroKm: 0.5,
    vibe: "Bars, cafés, premium 1 BHKs",
    blurb: "100ft Road, CMH Road and a metro at the doorstep · Bengaluru's most walkable nightlife address.",
    commute: { manyata: 45, egl: 30, orr: 30, whitefield: 50, ecity: 60, "mg-road": 20 },
    nearby: ["domlur", "cv-raman-nagar", "old-airport-road", "frazer-town", "koramangala"],
    personas: ["founder", "couple", "techie"],
  }),
  bellandur: base({
    metro: "Bellandur (Blue Line, upcoming)", metroKm: 1.5,
    vibe: "ORR techies · lake views · big societies",
    blurb: "Walk-to-office for Ecoworld, Embassy Tech Village, RMZ Ecospace · the densest tech corridor in India.",
    commute: { manyata: 70, egl: 5, orr: 5, whitefield: 25, ecity: 35, "mg-road": 50 },
    nearby: ["sarjapur-road", "marathahalli", "kasavanahalli", "varthur", "hsr-layout"],
    personas: ["techie", "couple", "family"],
  }),
  marathahalli: base({
    metro: "Marathahalli (Blue Line, upcoming)", metroKm: 1,
    vibe: "Affordable ORR · shopping · students",
    blurb: "Brand Factory, More Megastore, and easy access to Whitefield, Bellandur and the airport.",
    commute: { manyata: 60, egl: 15, orr: 10, whitefield: 25, ecity: 50, "mg-road": 50 },
    nearby: ["bellandur", "brookefield", "mahadevapura", "varthur", "kr-puram"],
    personas: ["techie", "student", "couple"],
  }),
  whitefield: base({
    metro: "Whitefield (Purple Line)", metroKm: 1,
    vibe: "Tech township · families · big homes",
    blurb: "ITPL, EPIP, Prestige Shantiniketan · Bengaluru's east tech township with a self-contained social scene.",
    commute: { manyata: 75, egl: 30, orr: 30, whitefield: 5, ecity: 70, "mg-road": 60 },
    nearby: ["mahadevapura", "hoodi", "brookefield", "kadugodi", "varthur"],
    personas: ["techie", "family", "couple"],
  }),
  "electronic-city": base({
    metro: "Electronic City (Yellow Line, opening)", metroKm: 2,
    vibe: "Infosys / Wipro / Biocon · freshers",
    blurb: "Bengaluru's south tech hub · affordable shared and PG inventory close to large campuses.",
    commute: { manyata: 90, egl: 60, orr: 50, whitefield: 75, ecity: 5, "mg-road": 60 },
    nearby: ["bommanahalli", "begur", "btm-layout", "bannerghatta-road"],
    personas: ["techie", "student"],
  }),
  "btm-layout": base({
    metro: "RV Road (Green Line) / Silk Board", metroKm: 3,
    vibe: "Students + freshers · food street",
    blurb: "BTM 2nd Stage food street, Christ + Jain student belt, value rents and quick ORR access.",
    commute: { manyata: 60, egl: 30, orr: 20, whitefield: 55, ecity: 25, "mg-road": 30 },
    nearby: ["koramangala", "hsr-layout", "jp-nagar", "bommanahalli", "jayanagar"],
    personas: ["student", "techie", "girls"],
  }),
  hebbal: base({
    metro: "Hebbal (Blue Line, upcoming)", metroKm: 1,
    vibe: "Manyata professionals · airport access",
    blurb: "Manyata Tech Park's home base · IBM, Target, Nokia, Philips, all 5 mins away.",
    commute: { manyata: 8, egl: 70, orr: 60, whitefield: 70, ecity: 90, "mg-road": 30 },
    nearby: ["thanisandra", "kalyan-nagar", "hennur", "yelahanka", "frazer-town"],
    personas: ["techie", "family", "couple"],
  }),
};

export function ctxFor(slug: string, name: string): AreaCtx {
  const c = AREA_CTX[slug] ?? base({});
  return { ...c, faqs: c.faqs.length ? c.faqs : COMMON_FAQS(name) };
}

export const EMPLOYERS = {
  manyata: "Manyata Tech Park",
  egl: "Embassy GoldenLink (EGL)",
  orr: "ORR (Bellandur / Sarjapur)",
  whitefield: "Whitefield (ITPL)",
  ecity: "Electronic City",
  "mg-road": "MG Road / CBD",
} as const;
