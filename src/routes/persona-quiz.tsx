// 30-second persona quiz → matched persona + expert → prefilled referral.

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileBottomBar } from "@/components/MobileBottomBar";
import { PERSONAS, type Persona } from "@/lib/personas";
import { captainForPersona } from "@/lib/captains";
import { CaptainCard } from "@/components/CaptainCard";
import { ContextualReferCTA } from "@/components/insights/ContextualReferCTA";
import { track } from "@/lib/analytics";
import { buildReferLink } from "@/lib/referral-context";

export const Route = createFileRoute("/persona-quiz")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Who are you? · 30-sec persona quiz · Gharpayy" },
      { name: "description", content: "Tell us who you are. We route you to the Bengaluru expert who knows your hub, your budget, and your move-in window." },
      { property: "og:title", content: "Find your Gharpayy expert in 30 seconds" },
      { property: "og:description", content: "Persona-matched lead routing. No spam, real human expert reply in minutes." },
    ],
  }),
  component: QuizPage,
});

const Q1 = [
  { id: "techie", label: "👨‍💻 Tech / corporate pro" },
  { id: "student", label: "🎓 Student / intern" },
  { id: "founder", label: "🚀 Founder / operator" },
  { id: "couple", label: "💍 Moving with partner" },
  { id: "family", label: "👨‍👩‍👧 Family with kids" },
  { id: "senior", label: "👵 Senior / parents" },
  { id: "girl", label: "👩 Girls-only PG" },
  { id: "pet", label: "🐕 Pet parent" },
  { id: "nri", label: "🛬 NRI returning" },
];

const Q2 = [
  { id: "north", label: "Manyata / Hebbal / North", areas: ["hebbal", "thanisandra", "hennur"] },
  { id: "central", label: "Koramangala / Indiranagar / HSR", areas: ["koramangala", "indiranagar", "hsr-layout"] },
  { id: "orr", label: "ORR / Bellandur / Whitefield", areas: ["bellandur", "whitefield", "marathahalli", "sarjapur-road"] },
  { id: "south", label: "JP Nagar / Jayanagar / BTM", areas: ["jp-nagar", "jayanagar", "btm-layout"] },
  { id: "ecity", label: "Electronic City", areas: ["electronic-city", "begur", "bommanahalli"] },
  { id: "campus", label: "IISc / Malleshwaram / North-West", areas: ["malleshwaram", "rajajinagar", "vijayanagar"] },
];

const Q3 = [
  { id: "IMMEDIATE", label: "🔥 This week" },
  { id: "WITHIN_WEEK", label: "📅 Within 2 weeks" },
  { id: "WITHIN_MONTH", label: "🗓️ Within a month" },
  { id: "EXPLORING", label: "🔍 Just exploring" },
];

function pickPersona(who: string, where: string): Persona {
  const map: Record<string, string> = {
    techie: where === "north" ? "manyata-pro" : where === "ecity" ? "ecity-fresher" : "techie-orr",
    student: where === "campus" ? "iisc-researcher" : "student-christ",
    founder: "founder-koramangala",
    couple: "couple-relocating",
    family: "relocating-family",
    senior: "senior-living",
    girl: "girls-only",
    pet: "pet-parent",
    nri: "nri-returnee",
  };
  return PERSONAS.find((p) => p.id === map[who]) ?? PERSONAS[0];
}

function QuizPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [who, setWho] = useState("");
  const [where, setWhere] = useState("");
  const [when, setWhen] = useState("");

  const persona = who && where ? pickPersona(who, where) : null;
  const areaSlug = where ? Q2.find((q) => q.id === where)?.areas[0] : undefined;
  const expert = persona ? captainForPersona(persona.id) : null;

  function pick(setter: (v: string) => void, value: string, eventName: string) {
    setter(value);
    track(eventName, { value });
    setTimeout(() => setStep((s) => s + 1), 150);
  }

  function finish() {
    if (!persona) return;
    track("persona_quiz_completed", { persona: persona.id, area: areaSlug, when, expert: expert?.id });
    navigate({
      to: buildReferLink({
        persona: persona.id,
        area: areaSlug,
        expert: expert?.id,
        source: "persona-quiz",
      }) as any,
    });
  }

  return (
    <div className="min-h-screen flex flex-col pb-24 md:pb-0 bg-background">
      <Header />
      <section className="border-b" style={{ background: "var(--gradient-hero)" }}>
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-10">
          <div className="text-[11px] uppercase tracking-widest text-primary font-bold">Persona quiz · 30 sec</div>
          <h1 className="mt-1 text-3xl md:text-5xl font-bold tracking-tight text-ink">
            Tell us who you are.
          </h1>
          <p className="mt-2 text-sm md:text-base text-muted-foreground max-w-xl">
            We route you to the expert who actually knows your hub, your budget, and your move-in window. No call center, no shotgun broker spam.
          </p>
          <div className="mt-4 flex gap-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-secondary"}`} />
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 md:px-6 py-8 w-full">
        {step === 0 && (
          <Block title="1 · Who are you?">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Q1.map((o) => (
                <button
                  key={o.id}
                  onClick={() => pick(setWho, o.id, "quiz_who")}
                  className={`text-left px-4 py-3 rounded-2xl border-2 transition ${who === o.id ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/40"}`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </Block>
        )}

        {step === 1 && (
          <Block title="2 · Which side of Bengaluru?">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Q2.map((o) => (
                <button
                  key={o.id}
                  onClick={() => pick(setWhere, o.id, "quiz_where")}
                  className={`text-left px-4 py-3 rounded-2xl border-2 transition ${where === o.id ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/40"}`}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <button onClick={() => setStep(0)} className="mt-3 text-xs text-muted-foreground underline">← back</button>
          </Block>
        )}

        {step === 2 && (
          <Block title="3 · When do you need to move in?">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Q3.map((o) => (
                <button
                  key={o.id}
                  onClick={() => pick(setWhen, o.id, "quiz_when")}
                  className={`text-left px-4 py-3 rounded-2xl border-2 transition ${when === o.id ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/40"}`}
                >
                  {o.label}
                </button>
              ))}
            </div>
            <button onClick={() => setStep(1)} className="mt-3 text-xs text-muted-foreground underline">← back</button>
          </Block>
        )}

        {step >= 3 && persona && expert && (
          <div className="space-y-4">
            <div className="rounded-3xl border-2 border-primary/30 p-5 md:p-7 bg-card shadow-[var(--shadow-glow)]">
              <div className="text-[11px] uppercase tracking-widest text-primary font-bold">Your match</div>
              <div className="mt-2 flex items-center gap-3">
                <span className="text-4xl">{persona.emoji}</span>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold">{persona.title}</h2>
                  <p className="text-sm text-muted-foreground">{persona.short}</p>
                </div>
              </div>
              <p className="mt-3 text-sm italic text-ink/80 leading-snug">"{persona.storyQuote}"</p>
            </div>

            <CaptainCard expert={expert} context={`I'm a ${persona.title}, looking around ${areaSlug ?? "Bengaluru"}, want to move ${when.toLowerCase().replace(/_/g, " ")}.`} />

            <button
              onClick={finish}
              className="w-full px-5 py-4 rounded-full font-bold text-white text-base"
              style={{ background: "var(--gradient-orange)" }}
            >
              Continue → refer someone like me & earn ₹500
            </button>
            <Link
              to="/persona/$id"
              params={{ id: persona.id }}
              className="block text-center text-xs font-bold text-primary underline-offset-2 hover:underline"
            >
              See full {persona.title} guide →
            </Link>

            <ContextualReferCTA
              tone="compact"
              context={{ persona: persona.id, area: areaSlug, expert: expert.id, source: "persona-quiz" }}
            />
          </div>
        )}
      </section>

      <Footer />
      <MobileBottomBar variant="insights" />
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border bg-card p-5 md:p-7 shadow-[var(--shadow-card)]">
      <h2 className="text-lg md:text-xl font-bold mb-4">{title}</h2>
      {children}
    </div>
  );
}
