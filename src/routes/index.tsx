import { createFileRoute, Link, ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Header, WhatsAppIcon } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SearchHero } from "@/components/SearchHero";
import { TopHubs } from "@/components/TopHubs";
import { MobileBottomBar } from "@/components/MobileBottomBar";
import { useRentForm } from "@/components/RentFormProvider";
import data from "@/data/insights.json";
import { waConcierge } from "@/lib/wa";
import { LiveDataBadge } from "@/components/insights/LiveDataBadge";
import { CityKpis } from "@/components/insights/CityKpis";
import { CityHeatStrip } from "@/components/insights/CityHeatStrip";
import { DemandLeaderboard } from "@/components/insights/DemandLeaderboard";
import { PriceLeaders } from "@/components/insights/PriceLeaders";
import { NewListingsTicker } from "@/components/insights/NewListingsTicker";
import { StoriesStrip } from "@/components/insights/StoriesStrip";
import { CommuteMatrixCity } from "@/components/insights/CommuteMatrixCity";
import { SupplyDemand } from "@/components/insights/SupplyDemand";
import { RentVerdict2 } from "@/components/insights/RentVerdict2";
import { ReferAFriend } from "@/components/insights/ReferAFriend";
import { ManagedLivingPitch } from "@/components/insights/ManagedLivingPitch";
import { ZoneSpine } from "@/components/ZoneSpine";

const InsightsMap = lazy(() => import("@/components/InsightsMap").then((m) => ({ default: m.InsightsMap })));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Gharpayy Insights · What Bengaluru really pays for rent" },
      { name: "description", content: `Search ${(data as any).stats.areas} micro-markets across Bengaluru. ${(data as any).stats.pins.toLocaleString()}+ verified rents pinned by neighbours, with a Gharpayy expert one tap away.` },
      { property: "og:title", content: "Gharpayy Insights · Real Bengaluru rents, mapped" },
      { property: "og:description", content: "Median rents, demand, and a expert on WhatsApp for every Bengaluru hub." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen flex flex-col pb-28 md:pb-0">
      <Header />

      {/* 1. Hero search (compact) */}
      <SearchHero />

      {/* Zone spine - 5 Hero Zones, immediately under search */}
      <ZoneSpine sticky={false} />

      {/* 2. Live map - HERO. Big, above the fold. */}
      <section className="max-w-[1400px] mx-auto px-2 md:px-4 pt-3 md:pt-4 pb-6 w-full">
        <div className="flex items-end justify-between mb-2 px-1 gap-3 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="text-[10px] uppercase tracking-widest text-primary font-bold">Live map · 4,200+ pins · PGs + flats</div>
              <LiveDataBadge />
            </div>
            <h2 className="mt-0.5 text-xl md:text-3xl font-extrabold tracking-tight">Every verified Bengaluru rent, plotted</h2>
            <p className="text-[11px] md:text-xs text-muted-foreground">Tap any pin for owner-direct rent. Toggle PG vs flat. One Expert per zone.</p>
          </div>
          <Link to="/map" className="text-xs font-bold text-primary hover:underline whitespace-nowrap">Open full map →</Link>
        </div>
        <div className="relative">
          <ClientOnly fallback={<div className="h-[720px] bg-card animate-pulse rounded-2xl" />}>
            <Suspense fallback={<div className="h-[720px] bg-card animate-pulse rounded-2xl" />}>
              <InsightsMap height={760} />
            </Suspense>
          </ClientOnly>
        </div>
      </section>

      {/* 3. City KPIs (compact) */}
      <CityKpis />

      {/* 4. Managed Living pitch */}
      <ManagedLivingPitch />

      {/* 5. Verdict */}
      <RentVerdict2 />

      {/* 6. City heat + leaders */}
      <CityHeatStrip />
      <DemandLeaderboard />
      <PriceLeaders />

      {/* 7. Supply / demand + commute */}
      <SupplyDemand />
      <CommuteMatrixCity />

      {/* 8. Stories + new listings */}
      <StoriesStrip />
      <NewListingsTicker />

      {/* 9. Top hubs */}
      <TopHubs />

      {/* 10. Tools + Earn */}
      <ToolsRow />
      <ReferAFriend />


      <CommunityCta />

      <Footer />
      <MobileBottomBar variant="insights" />
    </div>
  );
}

function ToolsRow() {
  const { open } = useRentForm();
  const tools = [
    { icon: "🧮", title: "Am I overpaying?", sub: "Verdict in 30 seconds", href: "/rent-verdict", isLink: true as const },
    { icon: "🥋", title: "Negotiation coach", sub: "Counter the owner with data", href: "/rent-verdict", isLink: true as const },
    { icon: "🪜", title: "Upgrade path", sub: "PG today → flat tomorrow", href: "/rent-verdict", isLink: true as const },
    { icon: "⚖️", title: "Compare areas", sub: "Side-by-side, 12 dimensions", href: "/compare", isLink: true as const },
    { icon: "🛠️", title: "All tools", sub: "Deposit · hidden costs · more", href: "/tools", isLink: true as const },
    { icon: "➕", title: "Add your rent", sub: "Help 4,200+ neighbours", action: () => open(), isLink: false as const },
  ];
  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10 w-full">
      <div className="text-[11px] uppercase tracking-widest text-primary font-bold">Tools</div>
      <h2 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight">Make smarter rent decisions</h2>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {tools.map((t) =>
          t.isLink ? (
            <Link key={t.title} to={t.href} className="flex items-center gap-3 p-4 rounded-2xl border-2 border-border hover:border-primary/40 hover:bg-primary/5 bg-card transition shadow-[var(--shadow-card)]">
              <span className="text-3xl">{t.icon}</span>
              <div className="flex-1">
                <div className="font-bold text-sm md:text-base text-ink">{t.title}</div>
                <div className="text-[11px] md:text-xs text-muted-foreground">{t.sub}</div>
              </div>
              <span className="text-primary text-lg">→</span>
            </Link>
          ) : (
            <button key={t.title} onClick={t.action} className="flex items-center gap-3 p-4 rounded-2xl border-2 border-primary/30 bg-primary/5 hover:bg-primary/10 transition shadow-[var(--shadow-card)] text-left">
              <span className="text-3xl">{t.icon}</span>
              <div className="flex-1">
                <div className="font-bold text-sm md:text-base text-primary">{t.title}</div>
                <div className="text-[11px] md:text-xs text-muted-foreground">{t.sub}</div>
              </div>
              <span className="text-primary text-lg">→</span>
            </button>
          ),
        )}
      </div>
    </section>
  );
}

function CommunityCta() {
  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-16 w-full">
      <div className="rounded-3xl border p-6 md:p-12 text-center bg-card shadow-[var(--shadow-card)] relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="relative">
          <div className="text-[11px] uppercase tracking-widest text-primary font-bold">Move in via Gharpayy</div>
          <h2 className="mt-2 text-2xl md:text-4xl font-bold leading-tight max-w-xl mx-auto">
            Found your area? <span className="text-primary">Find your room.</span>
          </h2>
          <p className="mt-3 md:mt-4 text-sm md:text-base text-muted-foreground max-w-lg mx-auto">
            Direct to owner. 7-day move-in. A real expert for your hub · not a call center.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2 md:gap-3">
            <Link to="/gharpayy" className="px-5 py-2.5 rounded-full font-bold text-white shadow-[var(--shadow-glow)] text-sm" style={{ background: "var(--gradient-orange)" }}>
              Explore Gharpayy →
            </Link>
            <a href={waConcierge("from the Insights homepage")} target="_blank" rel="noreferrer" className="px-5 py-2.5 rounded-full font-semibold text-white inline-flex items-center gap-2 text-sm" style={{ background: "oklch(0.62 0.14 155)" }}>
              <WhatsAppIcon className="w-4 h-4" /> WhatsApp concierge
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
