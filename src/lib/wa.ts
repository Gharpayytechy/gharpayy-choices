// Gharpayy WhatsApp deep-link helper.
// Numbers below are the REAL area-specific lines used on gharpayy.com · each
// hub has its own expert so renters land on someone who actually knows
// the building, the rent, and the gate-pass rules.

export const GHARPAYY_URL = "https://gharpayy.com";
export const GHARPAYY_HOMES_URL = "https://gharpayy.com/homes/index.html";
export const GHARPAYY_BOOK_URL = "https://cal.com/gharpayy.com/stay";
export const GHARPAYY_FORM_URL = "https://tally.so/r/m66B1A";
export const GHARPAYY_VIMEO = "https://player.vimeo.com/video/1143176976?h=auto&dnt=1";
export const GHARPAYY_INSTAGRAM = "https://www.instagram.com/gharpayy/";
export const GHARPAYY_YOUTUBE = "https://www.youtube.com/@gharpayy";
export const GHARPAYY_EMAIL = "team@gharpayy.com";
export const GHARPAYY_OFFICE_PHONE = "+91 7988114576";

// Real Gharpayy desk numbers (sourced from gharpayy.com).
export const WA_NUMBERS = {
  concierge: "918307396042",   // Default Bengaluru concierge (Koramangala desk)
  bellandur: "916363607724",   // Bellandur / ORR expert
  manyata:   "918431513647",   // Manyata / Hebbal expert
  homes:     "917404489976",   // Gharpayy Homes (1/2 BHK flats) desk
  allBlr:    "917988114576",   // All Bangalore + students desk (HQ)
  data:      "918307396042",   // Community data / "Add your rent" desk
  owner:     "918307396042",   // List your property
  support:   "917988114576",   // Existing tenant support
} as const;

export type WaDesk = keyof typeof WA_NUMBERS;
export const WA_NUMBER = WA_NUMBERS.concierge;

// Map an area slug → which expert owns it. Pulled from gharpayy.com's
// "Who Stays With Us?" section.
const AREA_DESK: Record<string, WaDesk> = {
  bellandur: "bellandur",
  "sarjapur-road": "bellandur",
  marathahalli: "bellandur",
  "old-airport-road": "bellandur",
  hebbal: "manyata",
  thanisandra: "manyata",
  hennur: "manyata",
  "kr-puram": "manyata",
  yelahanka: "manyata",
  "kalyan-nagar": "manyata",
  "frazer-town": "manyata",
  "cooke-town": "manyata",
};

export function deskFor(slug?: string | null): WaDesk {
  if (!slug) return "concierge";
  return AREA_DESK[slug] ?? "concierge";
}

export function deskLabel(desk: WaDesk) {
  switch (desk) {
    case "bellandur": return "Bellandur / ORR expert";
    case "manyata":   return "Manyata / Hebbal expert";
    case "homes":     return "Gharpayy Homes (1/2 BHK flats)";
    case "allBlr":    return "All-Bangalore HQ desk";
    case "data":      return "Community data desk";
    case "owner":     return "Owner / list-your-property desk";
    case "support":   return "Existing tenant support";
    default:          return "Koramangala concierge";
  }
}

export function waLink(message: string, desk: WaDesk = "concierge") {
  return `https://api.whatsapp.com/send?phone=+${WA_NUMBERS[desk]}&text=${encodeURIComponent(message)}`;
}

const sig = (desk: WaDesk) => `\n\n- sent via Gharpayy Insights · #${desk}`;

export function waListing(opts: { area?: string | null; bhk?: string; rent?: number; society?: string; slug?: string }) {
  const desk = deskFor(opts.slug ?? opts.area?.toLowerCase().replace(/\s+/g, "-"));
  const lines = [
    "Heyy GHARPAYY 👋",
    "Saw a verified rent on the Insights map. Want a Gharpayy stay nearby:",
    opts.area ? `📍 Area: ${opts.area}` : "",
    opts.society ? `🏢 Near: ${opts.society}` : "",
    opts.bhk ? `🏠 ${opts.bhk} BHK / private room` : "",
    opts.rent ? `💰 Budget ~ ₹${opts.rent.toLocaleString("en-IN")}/mo` : "",
    "",
    "Please share matching options I can tour today.",
  ].filter(Boolean);
  return waLink(lines.join("\n") + sig(desk), desk);
}

export function waArea(area: string, median?: number, availability?: string, slug?: string) {
  const desk = deskFor(slug ?? area.toLowerCase().replace(/\s+/g, "-"));
  const lines = [
    "Heyy GHARPAYY 👋",
    `Looking for a Gharpayy stay in *${area}* (Bengaluru).`,
    median ? `Local median rent (Insights): ₹${median.toLocaleString("en-IN")}/mo` : "",
    availability ? `Insights shows Gharpayy availability here: *${availability}*` : "",
    "",
    "Can you share private/shared rooms I can tour today?",
  ].filter(Boolean);
  return waLink(lines.join("\n") + sig(desk), desk);
}

export function waSeeker(note: string, area?: string | null, budget?: number) {
  const desk = deskFor(area?.toLowerCase().replace(/\s+/g, "-"));
  const lines = [
    "Heyy GHARPAYY 👋",
    "A flat-hunter on Insights matches a Gharpayy property · please connect us:",
    `"${note}"`,
    area ? `Area: ${area}` : "",
    budget ? `Budget: ₹${budget.toLocaleString("en-IN")}/mo` : "",
  ].filter(Boolean);
  return waLink(lines.join("\n") + sig(desk), desk);
}

export function waConcierge(context = "I just used your Insights map") {
  return waLink(
    `Heyy GHARPAYY 👋 I'm looking for a flat in Bengaluru. ${context}. Can you help me find a Gharpayy stay?` + sig("concierge"),
    "concierge"
  );
}

export function waPersona(persona: string, area?: string) {
  const desk = deskFor(area?.toLowerCase().replace(/\s+/g, "-"));
  return waLink(
    `Heyy GHARPAYY 👋 I'm a *${persona}*${area ? ` looking around *${area}*` : " in Bengaluru"}. Found you via Insights · can you share Gharpayy options that fit?` + sig(desk),
    desk
  );
}

export function waHomes(opts?: { bhk?: string; area?: string }) {
  return waLink(
    `Heyy GHARPAYY 👋 I want a managed *${opts?.bhk ?? "1/2 BHK"} Gharpayy Home*${opts?.area ? ` in ${opts.area}` : ""}. Saw the 21k starter pricing on your site · please share options.` + sig("homes"),
    "homes"
  );
}

export function waStudent(college?: string, area?: string) {
  return waLink(
    `Heyy GHARPAYY 👋 I'm a *student${college ? " at " + college : ""}*${area ? ` looking near ${area}` : ""}. Need a verified PG with meals + Wi-Fi. Found you via Insights.` + sig("allBlr"),
    "allBlr"
  );
}

// Community data desk · pre-fill payload (used by the in-page form's
// WhatsApp fallback). Kept so existing buttons keep working.
export function waAddRent(prefill?: { area?: string; bhk?: string; rent?: number; society?: string; furnished?: boolean; gated?: boolean; sqft?: number; feedback?: string }) {
  const lines = [
    "Heyy GHARPAYY 👋  I want to add my rent to Insights (anonymously).",
    "",
    `📍 Area: ${prefill?.area ?? ""}`,
    `🏢 Society / building: ${prefill?.society ?? ""}`,
    `🏠 BHK: ${prefill?.bhk ?? ""}`,
    `💰 Rent (₹/month): ${prefill?.rent ?? ""}`,
    `🛋  Furnished: ${prefill?.furnished == null ? "" : prefill.furnished ? "Yes" : "No"}`,
    `🔒 Gated: ${prefill?.gated == null ? "" : prefill.gated ? "Yes" : "No"}`,
    `📐 Sqft: ${prefill?.sqft ?? ""}`,
    `✍️  Feedback: ${prefill?.feedback ?? ""}`,
    "",
    "Thanks for keeping Bengaluru rentals honest 🙏",
  ];
  return waLink(lines.join("\n") + sig("data"), "data");
}

export function waListMyProperty() {
  return waLink(
    "Heyy GHARPAYY 👋  I'm an owner · I want to list my property -fee on Gharpayy.\n\n🏢 Society/area: \n🏠 BHK: \n💰 Expected rent: \n📞 Best time to call: " + sig("owner"),
    "owner"
  );
}

export function waSupport() {
  return waLink("Heyy GHARPAYY 👋  I'm an existing Gharpayy tenant and need help with: " + sig("support"), "support");
}
