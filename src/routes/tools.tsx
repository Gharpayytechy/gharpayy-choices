import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileBottomBar } from "@/components/MobileBottomBar";
import { RentVerdict2 } from "@/components/insights/RentVerdict2";
import { NegotiationCoach } from "@/components/insights/NegotiationCoach";
import { UpgradePathCalc } from "@/components/insights/UpgradePathCalc";
import { DepositCalc } from "@/components/insights/DepositCalc";
import { HiddenCosts } from "@/components/insights/HiddenCosts";
import { BrokerVsDirect } from "@/components/insights/BrokerVsDirect";
import { AffordabilityIndex } from "@/components/insights/AffordabilityIndex";
import { PgVsFlatTable } from "@/components/insights/PgVsFlatTable";
import { WhyYoullLove } from "@/components/insights/WhyYoullLove";

export const Route = createFileRoute("/tools")({
  head: () => ({
    meta: [
      { title: "Rent tools · Verdict, negotiation, upgrade path · Gharpayy" },
      { name: "description", content: "Free Bengaluru rent tools: rent verdict, negotiation script, deposit calculator, upgrade path, hidden cost breakdown, affordability index." },
    ],
  }),
  component: ToolsPage,
});

function ToolsPage() {
  return (
    <div className="min-h-screen flex flex-col pb-28 md:pb-0">
      <Header />
      <section className="border-b" style={{ background: "var(--gradient-hero)" }}>
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
          <div className="text-[11px] uppercase tracking-widest text-primary font-bold">Renter toolbox 🛠️</div>
          <h1 className="mt-1 text-3xl md:text-5xl font-bold tracking-tight">Tools that pay for themselves</h1>
          <p className="mt-2 text-sm md:text-base text-muted-foreground max-w-2xl">8 calculators built on 4,200+ verified rents. Free. No login.</p>
        </div>
      </section>
      <WhyYoullLove
        reasons={[
          { icon: "🎯", title: "Built on 4,200+ real rents", sub: "Every number you see comes from a verified Bengaluru tenant · not a brochure." },
          { icon: "⚡", title: "Free, no login, no email", sub: "Use any tool in 10 seconds. We don't gate insights behind a sign-up wall." },
          { icon: "📲", title: "Each tool ends with a expert", sub: "Get a verdict, then 1-tap WhatsApp the right Gharpayy expert for your hub." },
        ]}
      />
      <RentVerdict2 />
      <NegotiationCoach />
      <UpgradePathCalc />
      <AffordabilityIndex />
      <DepositCalc />
      <HiddenCosts />
      <BrokerVsDirect />
      <PgVsFlatTable />
      <Footer />
      <MobileBottomBar variant="dual" context="from the Tools page" />
    </div>
  );
}
