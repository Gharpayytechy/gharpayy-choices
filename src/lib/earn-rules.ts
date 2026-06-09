// The 10 ways a Gharpayy referrer can actually make money.
// This is the spine of the public-side "earn money" app.

export type EarnChannel =
  | "wa-share"     // 1:1 WhatsApp share
  | "poster"       // printed A4 with QR
  | "group"        // society / RWA WhatsApp group
  | "office"       // office Slack / Teams share
  | "owner"        // refer a property owner
  | "society-cap"  // recurring society expert
  | "tour-day"     // weekend open-house
  | "creator"      // Instagram / YouTube reels
  | "campus"       // college / hostel ambassador
  | "corp-hr";     // corporate HR partner

export type EarnRule = {
  id: EarnChannel;
  title: string;
  emoji: string;
  payoutOnLead: number;
  payoutOnTour: number;
  payoutOnBooking: number;
  recurring?: number;
  timePerWeek: string;
  proof: string;
  bestFor: string[];
  bestZone?: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topEarner?: { name: string; monthly: number };
  blurb: string;
  howTo: string[];
};

export const EARN_RULES: EarnRule[] = [
  {
    id: "wa-share",
    title: "Share a WhatsApp link",
    emoji: "💬",
    payoutOnLead: 50, payoutOnTour: 250, payoutOnBooking: 2000,
    timePerWeek: "10 min", difficulty: "Easy", bestZone: "Koramangala",
    proof: "Your code is baked into the link.",
    bestFor: ["Anyone with friends moving cities", "College WhatsApp groups"],
    topEarner: { name: "Sneha · HSR", monthly: 18400 },
    blurb: "Send 1 friend per week. The link prefills the right Expert, zone and persona.",
    howTo: [
      "Pick a persona (techie, student, founder, couple)",
      "Tap 'Share on WhatsApp' · message is prefilled with your code",
      "Expert picks up the chat. You get credit the moment they tap.",
    ],
  },
  {
    id: "poster",
    title: "Drop a printed Gharpayy poster",
    emoji: "🪧",
    payoutOnLead: 75, payoutOnTour: 300, payoutOnBooking: 2500,
    timePerWeek: "30 min", difficulty: "Easy", bestZone: "Bellandur",
    proof: "Geo-tagged QR · every scan attributed to your code + location.",
    bestFor: ["People near cafés, hostels, tech parks", "Society notice boards"],
    topEarner: { name: "Rohit · Bellandur", monthly: 24800 },
    blurb: "Print our A4 PDF (your QR baked in). Drop in 5 cafés. Get paid per scan + per booking.",
    howTo: [
      "Pick zone + tier (e.g. Koramangala Prive)",
      "Download A4 PDF",
      "Drop in 5 spots near the zone. Log location for analytics.",
    ],
  },
  {
    id: "group",
    title: "Post in a society / RWA group",
    emoji: "🏘️",
    payoutOnLead: 100, payoutOnTour: 350, payoutOnBooking: 2500,
    recurring: 500,
    timePerWeek: "15 min", difficulty: "Medium", bestZone: "Whitefield",
    proof: "Group name + screenshot.",
    bestFor: ["RWA admins", "Apartment WhatsApp group leads"],
    topEarner: { name: "Priya · Manyata", monthly: 31200 },
    blurb: "We give you long-form copy that doesn't feel like spam. Drop it once a week.",
    howTo: [
      "Pick the society / tower",
      "Copy the persona-aware long message",
      "Post + screenshot. Every reply that converts pays you.",
    ],
  },
  {
    id: "office",
    title: "Share in office Slack / Teams",
    emoji: "💼",
    payoutOnLead: 100, payoutOnTour: 400, payoutOnBooking: 2500,
    timePerWeek: "20 min", difficulty: "Medium", bestZone: "Mahadevapura",
    proof: "Channel name + screenshot.",
    bestFor: ["Tech park employees", "HR-friendly teams"],
    topEarner: { name: "Vikram · Embassy Tech", monthly: 22600 },
    blurb: "Drop the relocation pack in your office #bangalore-newbies channel. Earn per joiner.",
    howTo: [
      "Download the office relocation pack (PDF + WA link)",
      "Pin it in your team channel",
      "₹2,500 every time a colleague books.",
    ],
  },
  {
    id: "owner",
    title: "Refer a property owner",
    emoji: "🏠",
    payoutOnLead: 200, payoutOnTour: 0, payoutOnBooking: 1000,
    timePerWeek: "20 min", difficulty: "Medium", bestZone: "Whitefield",
    proof: "Owner accepts the listing.",
    bestFor: ["People with neighbours renting out", "Brokers switching sides"],
    topEarner: { name: "Lokesh · Whitefield", monthly: 9800 },
    blurb: "Know an owner with an empty flat? Refer them · get paid on first booking.",
    howTo: [
      "Send the owner a 1-page pitch (we give it to you)",
      "Owner does a 5-min onboarding call with our Expert",
      "₹200 on listing live. ₹1,000 on first booking.",
    ],
  },
  {
    id: "society-cap",
    title: "Be a Society Expert",
    emoji: "🎖️",
    payoutOnLead: 100, payoutOnTour: 300, payoutOnBooking: 2000,
    recurring: 3000,
    timePerWeek: "2 hrs", difficulty: "Hard", bestZone: "Bellandur",
    proof: "Verified resident in one society/tower.",
    bestFor: ["Long-time residents", "RWA committee members"],
    topEarner: { name: "Anita · Sobha Dream Acres", monthly: 42500 },
    blurb: "Be the go-to person in one society. Recurring monthly retainer + per-booking bonus.",
    howTo: [
      "Apply with society proof (electricity bill / RWA letter)",
      "Sign the 90-day pilot",
      "₹3,000/mo retainer + per-booking bonus. Renew on performance.",
    ],
  },
  {
    id: "tour-day",
    title: "Run a Saturday tour day",
    emoji: "🚗",
    payoutOnLead: 50, payoutOnTour: 500, payoutOnBooking: 2000,
    timePerWeek: "4 hrs (Sat)", difficulty: "Medium", bestZone: "Koramangala",
    proof: "Tour list signed by visitor.",
    bestFor: ["People who love showing properties", "Aspiring Experts"],
    topEarner: { name: "Manish · Koramangala", monthly: 28600 },
    blurb: "Host a Saturday open-house at one PG. We send leads. You walk them through.",
    howTo: [
      "Pick a PG + Saturday slot",
      "We send 4–6 pre-qualified leads to you",
      "₹500/tour + ₹2,000/booking. Lunch on Gharpayy.",
    ],
  },
  {
    id: "creator",
    title: "Instagram / Reels creator",
    emoji: "📸",
    payoutOnLead: 30, payoutOnTour: 200, payoutOnBooking: 2000,
    recurring: 2000,
    timePerWeek: "1 hr", difficulty: "Medium", bestZone: "Manyata Tech Park",
    proof: "Reel link + your unique QR.",
    bestFor: ["Bengaluru lifestyle / relocation creators", "Vlog-style YouTubers"],
    topEarner: { name: "Karthik · Christ", monthly: 32200 },
    blurb: "Tour 2 PGs on a reel. Add your QR. Every booking from your audience pays you.",
    howTo: [
      "Pick a zone + persona (e.g. 'Manyata techies')",
      "Shoot a 30-sec walkthrough · we share the script",
      "Drop your QR in bio. ₹2k creator base + per booking.",
    ],
  },
  {
    id: "campus",
    title: "College / hostel ambassador",
    emoji: "🎓",
    payoutOnLead: 50, payoutOnTour: 200, payoutOnBooking: 1500,
    recurring: 1000,
    timePerWeek: "3 hrs", difficulty: "Easy", bestZone: "Koramangala",
    proof: "Campus ID + 1 confirmed booking in 14 days.",
    bestFor: ["Christ / IIM-B / IISc / PES students", "Hostel reps"],
    topEarner: { name: "Aditi · Christ", monthly: 14800 },
    blurb: "Be the Gharpayy face on your campus. ₹1,000 base + per friend who books.",
    howTo: [
      "Sign up with college ID",
      "Get a campus poster pack + WhatsApp script",
      "₹1k/mo base + ₹1.5k per booking. Pay your fees with this.",
    ],
  },
  {
    id: "corp-hr",
    title: "Corporate HR partner",
    emoji: "🏢",
    payoutOnLead: 200, payoutOnTour: 500, payoutOnBooking: 5000,
    recurring: 5000,
    timePerWeek: "2 hrs", difficulty: "Hard", bestZone: "Mahadevapura",
    proof: "HR-issued LOI + 5 employee bookings/quarter.",
    bestFor: ["HR / People-Ops at Bengaluru offices", "Relocation agencies"],
    topEarner: { name: "Sandeep · HR Lead", monthly: 64000 },
    blurb: "Bring your company on as a relocation partner. ₹5k/booking + monthly retainer.",
    howTo: [
      "Intro your HR head to our partnerships Expert",
      "Sign a 1-page MoU (we draft it)",
      "₹5k/mo retainer + ₹5k per employee booking.",
    ],
  },
];

export const EARN_BY_ID = Object.fromEntries(EARN_RULES.map((r) => [r.id, r]));

export function expectedMonthlyEarning(rule: EarnRule, leadsPerMonth: number, conversionPct = 25, tourPct = 40): number {
  const tours = Math.round(leadsPerMonth * (tourPct / 100));
  const bookings = Math.round(tours * (conversionPct / 100));
  const recurring = rule.recurring || 0;
  return (
    leadsPerMonth * rule.payoutOnLead +
    tours * rule.payoutOnTour +
    bookings * rule.payoutOnBooking +
    recurring
  );
}

export function payoutForLeadEvent(channel: EarnChannel, event: "created" | "tour" | "booked"): number {
  const r = EARN_BY_ID[channel];
  if (!r) return 0;
  if (event === "created") return r.payoutOnLead;
  if (event === "tour") return r.payoutOnTour;
  return r.payoutOnBooking;
}
