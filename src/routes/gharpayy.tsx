import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Header, WhatsAppIcon } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileBottomBar } from "@/components/MobileBottomBar";
import { AREAS, AVAIL_META } from "@/lib/areas-meta";
import {
  GHARPAYY_BOOK_URL,
  GHARPAYY_EMAIL,
  GHARPAYY_OFFICE_PHONE,
  waConcierge,
  waArea,
  waHomes,
  waPersona,
  waStudent,
  waListMyProperty,
} from "@/lib/wa";
import data from "@/data/insights.json";
import { inr } from "@/lib/format";
import { RentVerdict2 } from "@/components/insights/RentVerdict2";
import { PgVsFlatTable } from "@/components/insights/PgVsFlatTable";
import { UpgradePathCalc } from "@/components/insights/UpgradePathCalc";
import { TourSlots } from "@/components/insights/TourSlots";
import { BrokerVsDirect } from "@/components/insights/BrokerVsDirect";
import { HiddenCosts } from "@/components/insights/HiddenCosts";
import { DepositCalc } from "@/components/insights/DepositCalc";
import { ReferAFriend } from "@/components/insights/ReferAFriend";
import { LiveDataBadge } from "@/components/insights/LiveDataBadge";
import { StoriesStrip } from "@/components/insights/StoriesStrip";
import { CityHeatStrip } from "@/components/insights/CityHeatStrip";
import { WhyYoullLove } from "@/components/insights/WhyYoullLove";
import { ZoneSpine } from "@/components/ZoneSpine";

function WhyYoullLoveGharpayy() {
  return (
    <WhyYoullLove
      reasons={[
        { icon: "🤝", title: "Direct to verified owners", sub: "No middlemen, no inflated rents. The expert is paid by us, never by you." },
        { icon: "🚀", title: "Move in this week, not this month", sub: "Average 7-day move-in. Tour today, sign tomorrow, keys in hand by weekend." },
        { icon: "🪜", title: "PG today, flat tomorrow · same expert", sub: "Start in a ₹6.5k PG. Upgrade to a ₹25k flat. Your deposit travels with you." },
      ]}
    />
  );
}

export const Route = createFileRoute("/gharpayy")({
  head: () => ({
    meta: [
      { title: "Gharpayy · Move in this week. Upgrade when you're ready." },
      {
        name: "description",
        content:
          "Verified PGs from ₹6,500 and managed 1/2 BHK homes from ₹25,000 across Bengaluru. Start in a PG today, upgrade to a flat with the same expert. Direct to owner.",
      },
      { property: "og:title", content: "Gharpayy · PGs & Homes in Bengaluru, direct to owner" },
      {
        property: "og:description",
        content: "Move in this week to a verified PG, upgrade to a managed flat tomorrow. Same expert, same trust.",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: "Gharpayy",
          url: "https://gharpayy.com",
          email: GHARPAYY_EMAIL,
          telephone: GHARPAYY_OFFICE_PHONE,
          areaServed: "Bengaluru",
          aggregateRating: { "@type": "AggregateRating", ratingValue: "4.7", reviewCount: "1280" },
        }),
      },
    ],
  }),
  component: GharpayyLanding,
});

function GharpayyLanding() {
  return (
    <div className="min-h-screen flex flex-col pb-28 md:pb-0">
      <Header />
      <Hero />
      <ZoneSpine />
      <TrustStrip />
      <WhyYoullLoveGharpayy />
      <StoriesStrip />
      <DualSwitcher />
      <PgVsFlatTable />
      <UpgradeLadder />
      <UpgradePathCalc />
      <RentVerdict2 />
      <CityHeatStrip />
      <IntentChips />
      <AvailabilityStrip />
      <TourSlots />
      <BrokerVsDirect />
      <DepositCalc />
      <HiddenCosts />
      <CaptainBand />
      <ReferAFriend />
      <DeepLinks />
      <Footer />
      <MobileBottomBar variant="dual" context="I'm exploring Gharpayy" />
    </div>
  );
}

/* ───────────── Hero ───────────── */

function Hero() {
  const pins = (data as any).stats.pins as number;
  return (
    <section className="relative overflow-hidden border-b" style={{ background: "var(--gradient-hero)" }}>
      <div className="absolute inset-0 bg-grid pointer-events-none opacity-50" />
      <div className="relative max-w-6xl mx-auto px-4 md:px-6 pt-8 md:pt-16 pb-8 md:pb-14">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] text-primary font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Backed by {pins.toLocaleString()}+ verified rents · 38 hubs
        </div>
        <h1 className="mt-4 text-[34px] md:text-7xl font-bold leading-[1.04] tracking-tight text-ink max-w-3xl">
          Move in this week.<br />
          <span className="text-primary">Upgrade when you're ready.</span>
        </h1>
        <p className="mt-3 md:mt-5 text-[15px] md:text-lg text-muted-foreground max-w-2xl leading-snug">
          Start in a verified PG today from <span className="font-bold text-ink num">₹6,500</span>. Shift to a managed
          1/2 BHK home tomorrow from <span className="font-bold text-ink num">₹25,000</span>. Same expert,
          direct to owner.
        </p>

        <div className="mt-5 md:mt-7 flex flex-wrap gap-2.5">
          <a
            href={waConcierge("from the Gharpayy landing")}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full font-bold text-white shadow-[var(--shadow-glow)] text-sm"
            style={{ background: "oklch(0.62 0.14 155)" }}
          >
            <WhatsAppIcon className="w-4 h-4" /> WhatsApp expert
          </a>
          <a
            href={GHARPAYY_BOOK_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center px-5 py-3 rounded-full font-bold text-white text-sm"
            style={{ background: "var(--gradient-orange)" }}
          >
            📅 Book a tour
          </a>
        </div>

        <div className="mt-7 md:mt-10 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          <Kpi v="Direct" l="To owner" />
          <Kpi v="7 days" l="Avg move-in" />
          <Kpi v="4.7★" l="Google rating" />
          <Kpi v="38" l="Hubs covered" />
        </div>
      </div>
    </section>
  );
}

function Kpi({ v, l }: { v: string; l: string }) {
  return (
    <div className="rounded-2xl border bg-card px-3.5 py-2.5 md:px-4 md:py-3 shadow-[var(--shadow-card)]">
      <div className="text-lg md:text-2xl font-bold num text-ink">{v}</div>
      <div className="text-[10px] md:text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mt-0.5">
        {l}
      </div>
    </div>
  );
}

function TrustStrip() {
  return (
    <section className="bg-card/40 border-b">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[10px] md:text-xs text-muted-foreground font-medium uppercase tracking-wider">
        <span>✓ KYC owners</span>
        <span>✓ 5,000+ tenants</span>
        <span>✓ Couples-friendly</span>
        <span>✓ Girls-only PGs</span>
        <span>✓ 24×7 expert</span>
      </div>
    </section>
  );
}

/* ───────────── 50/50 PG vs Flat switcher ───────────── */

function DualSwitcher() {
  const [tab, setTab] = useState<"pg" | "flat">("pg");
  const pg = [
    { kind: "Shared PG", from: 6500, who: "Students, freshers", icon: "🛋️" },
    { kind: "Private PG", from: 9500, who: "Working pros", icon: "🛏️" },
    { kind: "Premium PG + meals", from: 14500, who: "Senior pros", icon: "🍽️" },
  ];
  const flat = [
    { kind: "Studio / 1RK", from: 16000, who: "Solo, couples", icon: "🪟" },
    { kind: "1 BHK Home", from: 25000, who: "Couples, working pros", icon: "🏡" },
    { kind: "2 BHK Home", from: 32000, who: "Friends, families", icon: "🏘️" },
  ];
  const items = tab === "pg" ? pg : flat;
  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-7 md:py-12 w-full">
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-primary font-bold">Two ways to live</div>
          <h2 className="mt-1 text-2xl md:text-4xl font-bold tracking-tight">Pick your stay</h2>
        </div>
      </div>
      <div className="mt-4 inline-flex p-1 rounded-full border bg-card shadow-[var(--shadow-card)]">
        <button
          onClick={() => setTab("pg")}
          className={`px-4 md:px-5 py-2 rounded-full text-sm font-bold transition ${
            tab === "pg" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
          }`}
        >
          🛏️ PG · move this week
        </button>
        <button
          onClick={() => setTab("flat")}
          className={`px-4 md:px-5 py-2 rounded-full text-sm font-bold transition ${
            tab === "flat" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
          }`}
        >
          🏡 Flat · in 7 days
        </button>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
        {items.map((c) => (
          <div
            key={c.kind}
            className="rounded-2xl border-2 border-border hover:border-primary/40 bg-card p-5 transition shadow-[var(--shadow-card)] flex flex-col"
          >
            <div className="text-3xl">{c.icon}</div>
            <div className="mt-3 font-bold text-ink">{c.kind}</div>
            <div className="text-xs text-muted-foreground mt-0.5 flex-1">{c.who}</div>
            <div className="mt-3 text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Starts at</div>
            <div className="text-2xl num font-bold text-primary">
              {inr(c.from)}
              <span className="text-xs text-muted-foreground font-normal">/mo</span>
            </div>
            <a
              href={tab === "flat" ? waHomes() : waConcierge(`looking for ${c.kind.toLowerCase()}`)}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold text-white"
              style={{ background: "var(--gradient-orange)" }}
            >
              WhatsApp →
            </a>
          </div>
        ))}
      </div>

      <p className="mt-3 text-[11px] text-muted-foreground text-center">
        Same expert handles your PG today and your flat tomorrow.
      </p>
    </section>
  );
}

/* ───────────── Upgrade ladder ───────────── */

function UpgradeLadder() {
  const rungs = [
    { label: "Shared PG", from: 6500, sub: "Twin sharing" },
    { label: "Private PG", from: 9500, sub: "Single room" },
    { label: "Studio", from: 16000, sub: "Self-contained" },
    { label: "1 BHK", from: 25000, sub: "Managed home" },
    { label: "2 BHK", from: 32000, sub: "Spacious home" },
  ];
  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-7 md:py-10 w-full">
      <div className="rounded-3xl border-2 border-primary/20 p-5 md:p-7" style={{ background: "var(--gradient-hero)" }}>
        <div className="text-[11px] uppercase tracking-widest text-primary font-bold">The Gharpayy ladder</div>
        <h3 className="mt-1 text-xl md:text-3xl font-bold tracking-tight text-ink leading-tight">
          Start small. Upgrade when life upgrades.
        </h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-xl">
          Move from a ₹6.5k shared PG to a ₹32k 2 BHK without changing expert, paperwork, or KYC.
        </p>
        <div className="mt-5 -mx-2 px-2 overflow-x-auto">
          <div className="flex items-end gap-2 min-w-max">
            {rungs.map((r, i) => (
              <div key={r.label} className="flex items-end gap-2">
                <a
                  href={waConcierge(`I want a ${r.label}`)}
                  target="_blank"
                  rel="noreferrer"
                  className="block min-w-[120px] rounded-2xl border bg-card/90 backdrop-blur p-3 shadow-[var(--shadow-card)] hover:border-primary/40 transition"
                >
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                    Step {i + 1}
                  </div>
                  <div className="mt-1 font-bold text-sm text-ink">{r.label}</div>
                  <div className="text-[11px] text-muted-foreground">{r.sub}</div>
                  <div className="mt-1.5 text-base num font-bold text-primary">{inr(r.from)}</div>
                </a>
                {i < rungs.length - 1 && <span className="pb-6 text-primary text-lg">→</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ───────────── Intent chips ───────────── */

function IntentChips() {
  const intents = [
    { label: "Girls-only PG", emoji: "👩", q: "I'm looking for a girls-only PG" },
    { label: "Couples-friendly flat", emoji: "💑", q: "I want a couples-friendly flat" },
    { label: "Near Manyata", emoji: "🏢", q: "Near Manyata Tech Park" },
    { label: "Near EGL / ORR", emoji: "🛣️", q: "Near Embassy GoldenLink / ORR" },
    { label: "Near Whitefield", emoji: "🏗️", q: "Near Whitefield ITPL" },
    { label: "Christ student", emoji: "🎓", q: "Student at Christ University" },
    { label: "Under ₹10k PG", emoji: "💸", q: "Need a PG under ₹10,000/month" },
    { label: "Under ₹25k flat", emoji: "🏠", q: "Need a flat under ₹25,000/month" },
    { label: "Working professional", emoji: "💼", q: "Working professional" },
    { label: "Pet-friendly home", emoji: "🐶", q: "Pet-friendly flat" },
  ];
  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-7 md:py-10 w-full">
      <div className="text-[11px] uppercase tracking-widest text-primary font-bold">Right option for you</div>
      <h2 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight">Tell us who you are</h2>
      <p className="mt-1 text-sm text-muted-foreground">Tap one · expert replies on WhatsApp with 3 verified options.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {intents.map((i) => (
          <a
            key={i.label}
            href={i.label.toLowerCase().includes("student") ? waStudent() : waPersona(i.q)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold border-2 border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition"
          >
            <span>{i.emoji}</span> {i.label}
          </a>
        ))}
      </div>
    </section>
  );
}

/* ───────────── Live availability strip ───────────── */

function AvailabilityStrip() {
  const groups = (["high", "medium", "low"] as const).map((k) => ({
    k,
    meta: AVAIL_META[k],
    areas: AREAS.filter((a) => a.avail === k).slice(0, 8),
  }));
  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-7 md:py-10 w-full">
      <div className="text-[11px] uppercase tracking-widest text-primary font-bold">Live availability</div>
      <h2 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight">Where can you tour today?</h2>
      <div className="mt-4 space-y-3">
        {groups.map((g) => (
          <div key={g.k} className="rounded-2xl border bg-card p-4">
            <div className="flex items-center gap-2 text-sm font-bold mb-2.5" style={{ color: g.meta.color }}>
              <span>{g.meta.dot}</span> {g.meta.label}
              <span className="text-xs font-normal text-muted-foreground">· {g.meta.desc}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {g.areas.map((a) => (
                <a
                  key={a.slug}
                  href={waArea(a.name, a.med, g.meta.label, a.slug)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border bg-background hover:border-primary/40 hover:bg-primary/5 transition"
                >
                  {a.name}
                  <span className="text-muted-foreground num">· {inr(a.med)}</span>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ───────────── Expert band ───────────── */

function CaptainBand() {
  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-7 md:py-10 w-full">
      <div className="rounded-3xl border bg-card p-5 md:p-8 grid md:grid-cols-[1fr_auto] gap-4 items-center">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-primary font-bold">A real human, not a call center</div>
          <h3 className="mt-1 text-xl md:text-2xl font-bold leading-tight text-ink">
            Every hub has a expert who knows the buildings, the water, the rules.
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            They reply in minutes on WhatsApp. They tour you in person. They follow up after move-in.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={waConcierge("I want to talk to my hub expert")}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-bold text-white text-sm"
            style={{ background: "oklch(0.62 0.14 155)" }}
          >
            <WhatsAppIcon className="w-4 h-4" /> WhatsApp
          </a>
          <a
            href={`tel:${GHARPAYY_OFFICE_PHONE.replace(/\s/g, "")}`}
            className="inline-flex items-center px-4 py-2.5 rounded-full font-bold text-sm border-2 border-primary/30 bg-primary/5 text-primary"
          >
            📞 Call HQ
          </a>
        </div>
      </div>
    </section>
  );
}

/* ───────────── Deep links ───────────── */

function DeepLinks() {
  const links = [
    { to: "/areas", label: "Browse all 38 hubs", icon: "📍", sub: "Median rent + expert per hub" },
    { to: "/compare", label: "Compare areas", icon: "⚖️", sub: "Side-by-side, 12 dimensions" },
    { to: "/", label: "Insights map", icon: "🗺️", sub: "4,200+ verified rents" },
    { to: "/listings", label: "Verified rents", icon: "📋", sub: "Recent pins from neighbours" },
  ];
  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12 w-full">
      <div className="text-[11px] uppercase tracking-widest text-primary font-bold">Go deeper</div>
      <h2 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight">By hub or by topic</h2>
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to as any}
            className="group p-4 rounded-2xl border-2 border-border hover:border-primary/40 hover:bg-primary/5 bg-card transition shadow-[var(--shadow-card)]"
          >
            <div className="text-2xl">{l.icon}</div>
            <div className="mt-2 font-bold text-sm text-ink group-hover:text-primary leading-tight">{l.label}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">{l.sub}</div>
          </Link>
        ))}
      </div>
      <div className="mt-6 text-center">
        <a
          href={waListMyProperty()}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-primary font-semibold hover:underline"
        >
          Own a property? List it -fee →
        </a>
      </div>
    </section>
  );
}
