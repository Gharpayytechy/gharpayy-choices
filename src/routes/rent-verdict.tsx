import { createFileRoute, Link } from "@tanstack/react-router";
import { Header, WhatsAppIcon } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileBottomBar } from "@/components/MobileBottomBar";
import { RentVerdict2 } from "@/components/insights/RentVerdict2";
import { NegotiationCoach } from "@/components/insights/NegotiationCoach";
import { DepositCalc } from "@/components/insights/DepositCalc";
import { HiddenCosts } from "@/components/insights/HiddenCosts";
import { BrokerVsDirect } from "@/components/insights/BrokerVsDirect";
import { UpgradePathCalc } from "@/components/insights/UpgradePathCalc";
import { CityHeatStrip } from "@/components/insights/CityHeatStrip";
import { LiveDataBadge } from "@/components/insights/LiveDataBadge";
import { waConcierge } from "@/lib/wa";

export const Route = createFileRoute("/rent-verdict")({
  head: () => ({
    meta: [
      { title: "Am I overpaying? · Bengaluru rent verdict tool · Gharpayy" },
      { name: "description", content: "Type your rent · get an instant verdict against 4,200+ verified pins. Negotiation script, deposit ladder, hidden costs, and a free upgrade plan included." },
      { property: "og:title", content: "Am I overpaying? · Gharpayy rent verdict" },
      { property: "og:description", content: "Instant rent reality-check for Bengaluru. Free, anonymous, data-backed." },
    ],
  }),
  component: VerdictPage,
});

function VerdictPage() {
  return (
    <div className="min-h-screen flex flex-col pb-28 md:pb-0">
      <Header />

      <section className="border-b" style={{ background: "var(--gradient-hero)" }}>
        <div className="max-w-6xl mx-auto px-4 md:px-6 pt-7 md:pt-12 pb-6 md:pb-10">
          <div className="flex items-center gap-2 flex-wrap">
            <LiveDataBadge />
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">30-second reality check</span>
          </div>
          <h1 className="mt-3 text-[32px] md:text-6xl font-bold leading-[1.05] tracking-tight text-ink max-w-3xl">
            Am I <span className="text-primary">overpaying</span>?
          </h1>
          <p className="mt-3 text-[15px] md:text-lg text-muted-foreground max-w-2xl">
            Slide your rent. We compare it to thousands of verified pins, hand you a counter-offer script,
            then show you exactly how to move into a flat · even if you start in a PG today.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <a
              href="#verdict"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full font-bold text-white text-sm shadow-[var(--shadow-glow)]"
              style={{ background: "var(--gradient-orange)" }}
            >Start the check ↓</a>
            <a
              href={waConcierge("from the rent-verdict page")}
              target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full font-bold text-white text-sm"
              style={{ background: "oklch(0.62 0.14 155)" }}
            ><WhatsAppIcon className="w-4 h-4" /> Ask a expert</a>
          </div>
        </div>
      </section>

      <div id="verdict"><RentVerdict2 /></div>
      <NegotiationCoach />
      <DepositCalc />
      <HiddenCosts />
      <BrokerVsDirect />
      <UpgradePathCalc />
      <CityHeatStrip />

      <section className="max-w-6xl mx-auto px-4 md:px-6 py-8 w-full">
        <div className="rounded-3xl p-6 md:p-10 text-center text-white" style={{ background: "var(--gradient-orange)" }}>
          <div className="text-[11px] uppercase tracking-widest font-bold opacity-90">Now do something with the verdict</div>
          <h3 className="mt-1 text-2xl md:text-3xl font-bold">Want a fair rent without the broker drama?</h3>
          <p className="mt-2 text-sm md:text-base opacity-95 max-w-xl mx-auto">
            Tell our expert your budget and target area. You'll get 3 verified options on WhatsApp in under an hour.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <a
              href={waConcierge("I just used the rent-verdict tool, send me 3 options")}
              target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-ink font-bold text-sm"
            ><WhatsAppIcon className="w-4 h-4" /> Get 3 options</a>
            <Link to="/gharpayy" className="inline-flex items-center px-5 py-2.5 rounded-full bg-black/20 text-white font-bold text-sm">Explore Gharpayy</Link>
          </div>
        </div>
      </section>

      <Footer />
      <MobileBottomBar variant="dual" context="I just got my rent verdict" />
    </div>
  );
}
