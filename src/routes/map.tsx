import { createFileRoute, Link, ClientOnly } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileBottomBar } from "@/components/MobileBottomBar";
import { LiveDataBadge } from "@/components/insights/LiveDataBadge";
import { CityHeatStrip } from "@/components/insights/CityHeatStrip";
import { CityKpis } from "@/components/insights/CityKpis";
import { DemandLeaderboard } from "@/components/insights/DemandLeaderboard";
import { PriceLeaders } from "@/components/insights/PriceLeaders";
import { CommuteMatrixCity } from "@/components/insights/CommuteMatrixCity";
import { SupplyDemand } from "@/components/insights/SupplyDemand";
import { NewListingsTicker } from "@/components/insights/NewListingsTicker";
import { RentVerdict2 } from "@/components/insights/RentVerdict2";
import { ZoneSpine } from "@/components/ZoneSpine";

const InsightsMap = lazy(() => import("@/components/InsightsMap").then((m) => ({ default: m.InsightsMap })));

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Live rent map of Bengaluru · Gharpayy Insights" },
      { name: "description", content: "Full-screen map of 4,200+ verified rents across Bengaluru. Filter by area, BHK, furnishing · and chat the local Gharpayy expert in one tap." },
      { property: "og:title", content: "Live rent map of Bengaluru · Gharpayy" },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  return (
    <div className="min-h-screen flex flex-col pb-28 md:pb-0">
      <Header />
      <ZoneSpine />
      <div className="border-b bg-card/40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="text-[11px] uppercase tracking-widest text-primary font-bold">Live map</div>
              <LiveDataBadge />
            </div>
            <h1 className="text-lg md:text-xl font-bold tracking-tight">Every verified Bengaluru rent</h1>
          </div>
          <Link to="/" className="text-xs font-semibold text-muted-foreground hover:text-primary">← Back</Link>
        </div>
      </div>

      {/* Map · hero product, mobile-first 60vh */}
      <div className="relative h-[60vh] md:h-[70vh] border-b">
        <ClientOnly fallback={<div className="absolute inset-0 bg-card animate-pulse" />}>
          <Suspense fallback={<div className="absolute inset-0 bg-card animate-pulse" />}>
            <div className="absolute inset-0">
              <InsightsMap />
            </div>
          </Suspense>
        </ClientOnly>
      </div>

      {/* Insights below the map */}
      <CityKpis />
      <RentVerdict2 />
      <CityHeatStrip />
      <DemandLeaderboard />
      <PriceLeaders />
      <SupplyDemand />
      <CommuteMatrixCity />
      <NewListingsTicker />

      <Footer />
      <MobileBottomBar variant="insights" />
    </div>
  );
}
