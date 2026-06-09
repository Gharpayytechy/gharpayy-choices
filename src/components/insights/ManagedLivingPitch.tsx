// Managed Living by Gharpayy · explains what "managed" really means.
// Drop-in section for the homepage and Gharpayy landing.

import { Link } from "@tanstack/react-router";
import { WhatsAppIcon } from "@/components/Header";
import { waConcierge, GHARPAYY_BOOK_URL } from "@/lib/wa";
import { BRAND, ANCHOR_PG, ANCHOR_1BHK, ANCHOR_2BHK } from "@/lib/gharpayy-brand";

const PILLARS = [
  {
    icon: "🔑",
    title: "Direct to owner",
    body: "No broker. No middle layer. Your rent agreement is with the owner; Gharpayy runs the experience.",
    chip: "0% brokerage",
  },
  {
    icon: "🧑‍🔧",
    title: "On-ground Expert",
    body: "One Gharpayy Expert per zone · Koramangala, Bellandur, HSR, Whitefield, Indiranagar · owns your move and your stay.",
    chip: "Expert Desk · 24×7",
  },
  {
    icon: "🛏️",
    title: "Move-in ready",
    body: "Furniture, Wi-Fi, daily housekeeping, hot water, RO, security · switched on the day you walk in.",
    chip: "Day-1 ready",
  },
  {
    icon: "🍳",
    title: "Meals that feel home",
    body: "Hot breakfast and dinner in PG kitchens. Tiffin add-on for 1BHK/2BHK movers who don't want to cook.",
    chip: "Veg + non-veg",
  },
  {
    icon: "🧺",
    title: "Daily ops, handled",
    body: "Laundry pickup, cylinder swap, plumber, electrician, pest control · one WhatsApp ping, fixed inside SLA.",
    chip: "SLA: same-day",
  },
  {
    icon: "🛡️",
    title: "Best Rent Guaranteed",
    body: "We re-quote your rent if a verified owner on the same lane goes lower in the next 14 days. In writing.",
    chip: "14-day price-lock",
  },
];

const TIERS = [
  { tag: "PG", from: ANCHOR_PG, sub: "Single / twin · meals included", to: "/areas" as const },
  { tag: "Studio", from: 16000, sub: "Self-contained · fully furnished", to: "/gharpayy" as const },
  { tag: "1 BHK", from: ANCHOR_1BHK, sub: "Couples / solo pros · move in 7 days", to: "/gharpayy" as const },
  { tag: "2 BHK", from: ANCHOR_2BHK, sub: "Sharers / families · zoned hubs", to: "/gharpayy" as const },
];

export function ManagedLivingPitch() {
  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-14 w-full">
      <div className="rounded-3xl border-2 border-primary/20 bg-card shadow-[var(--shadow-card)] overflow-hidden">
        {/* Header band */}
        <div
          className="px-5 md:px-10 py-6 md:py-8 text-white relative"
          style={{ background: "var(--gradient-orange)" }}
        >
          <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 text-[10px] md:text-[11px] uppercase tracking-widest font-bold bg-white/15 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Managed Living by {BRAND.name}
            </div>
            <h2 className="mt-3 text-2xl md:text-4xl font-extrabold leading-tight max-w-2xl">
              Renting in Bengaluru, but everything's already taken care of.
            </h2>
            <p className="mt-2 text-sm md:text-base opacity-95 max-w-2xl">
              {BRAND.pitch} One Expert per zone. Move in this week · upgrade when you're ready.
            </p>
          </div>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 p-4 md:p-6">
          {PILLARS.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border bg-background p-4 md:p-5 hover:border-primary/40 transition"
            >
              <div className="text-2xl md:text-3xl">{p.icon}</div>
              <div className="mt-2 font-bold text-sm md:text-base text-ink leading-tight">{p.title}</div>
              <p className="mt-1 text-xs md:text-sm text-muted-foreground leading-relaxed">{p.body}</p>
              <div className="mt-3 inline-block text-[10px] md:text-[11px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-primary/10 text-primary">
                {p.chip}
              </div>
            </div>
          ))}
        </div>

        {/* Tier ladder */}
        <div className="border-t bg-secondary/40 px-4 md:px-6 py-5 md:py-7">
          <div className="text-[11px] uppercase tracking-widest text-primary font-bold">Pick your tier</div>
          <div className="mt-1 text-base md:text-lg font-bold">PG today → flat in 7 days. Same Expert.</div>
          <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
            {TIERS.map((t) => (
              <Link
                key={t.tag}
                to={t.to}
                className="rounded-2xl border-2 border-border bg-background p-3 md:p-4 hover:border-primary/50 hover:bg-primary/5 transition"
              >
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{t.tag}</div>
                <div className="mt-1 text-base md:text-xl font-extrabold text-ink">
                  ₹{t.from.toLocaleString("en-IN")}
                  <span className="text-[10px] md:text-xs font-bold text-muted-foreground">/mo</span>
                </div>
                <div className="text-[10px] md:text-xs text-muted-foreground leading-tight">{t.sub}</div>
              </Link>
            ))}
          </div>

          {/* CTAs */}
          <div className="mt-5 flex flex-wrap gap-2">
            <a
              href={GHARPAYY_BOOK_URL}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-full text-white font-bold text-sm shadow-[var(--shadow-glow)]"
              style={{ background: "var(--gradient-orange)" }}
            >
              📅 Book a tour
            </a>
            <a
              href={waConcierge("Tell me more about Managed Living by Gharpayy")}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-full text-white font-bold text-sm inline-flex items-center gap-2"
              style={{ background: "oklch(0.62 0.14 155)" }}
            >
              <WhatsAppIcon className="w-4 h-4" /> Talk to Expert
            </a>
            <Link
              to="/gharpayy"
              className="px-4 py-2.5 rounded-full font-bold text-sm border-2 border-primary/30 text-primary bg-primary/5"
            >
              See all homes →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
