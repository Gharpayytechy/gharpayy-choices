// One unified "Refer & Earn" CTA card that any Insights surface can drop in.
// Carries page context (area, persona, expert, budget) into the Super App.

import { Link } from "@tanstack/react-router";
import { buildReferLink, type ReferContext } from "@/lib/referral-context";
import { captainForArea, captainForPersona, type Expert } from "@/lib/captains";
import { track } from "@/lib/analytics";

type Tone = "default" | "compact" | "sticky";

export function ContextualReferCTA({
  context = {},
  tone = "default",
  headline,
  sub,
}: {
  context?: ReferContext;
  tone?: Tone;
  headline?: string;
  sub?: string;
}) {
  const expert: Expert =
    (context.persona && captainForPersona(context.persona)) ||
    (context.area && captainForArea(context.area)) ||
    captainForArea(undefined);

  const ctxOut: ReferContext = { ...context, expert: context.expert ?? expert.id };
  const href = buildReferLink(ctxOut);

  const head =
    headline ??
    (context.area
      ? `Know someone moving to ${prettifySlug(context.area)}?`
      : context.persona
        ? `Know a ${context.persona.replace(/-/g, " ")}?`
        : `Refer a Bengaluru renter. Earn ₹500.`);

  const subline =
    sub ??
    `${expert.name} (${expert.title}) takes the call within minutes. You earn ₹50 the moment they verify, ₹500 when they move in.`;

  if (tone === "sticky") {
    return (
      <Link
        to={href as any}
        onClick={() => track("referral_started", { ...ctxOut, expert: expert.id })}
        className="fixed bottom-20 md:bottom-6 right-4 z-40 inline-flex items-center gap-2 px-4 py-3 rounded-full text-sm font-bold text-white shadow-[var(--shadow-glow)] hover:scale-[1.02] transition"
        style={{ background: "var(--gradient-orange)" }}
      >
        💸 Refer & earn ₹500
      </Link>
    );
  }

  if (tone === "compact") {
    return (
      <Link
        to={href as any}
        onClick={() => track("referral_started", { ...ctxOut, expert: expert.id })}
        className="block rounded-2xl border-2 border-primary/30 bg-primary/5 hover:bg-primary/10 transition p-4"
      >
        <div className="text-[11px] uppercase tracking-widest text-primary font-bold">Refer & Earn 💸</div>
        <div className="mt-1 font-bold text-sm text-ink leading-snug">{head}</div>
        <div className="mt-1 text-xs text-muted-foreground">{subline}</div>
        <div className="mt-2 text-xs font-bold text-primary">Open my dashboard →</div>
      </Link>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-7 w-full">
      <div
        className="relative overflow-hidden rounded-3xl border-2 border-primary/30 p-5 md:p-8 grid md:grid-cols-[1fr_auto] gap-5 items-center shadow-[var(--shadow-glow)]"
        style={{ background: "var(--gradient-orange)" }}
      >
        <div className="absolute -right-12 -top-12 w-56 h-56 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="text-white relative">
          <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest font-bold opacity-95 bg-white/15 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Refer & Earn · Live
          </div>
          <h3 className="mt-3 text-2xl md:text-3xl font-bold leading-tight">{head}</h3>
          <p className="mt-2 text-sm md:text-base opacity-95 max-w-xl">{subline}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold">
            <span className="px-2.5 py-1 rounded-full bg-white/15 backdrop-blur">🏆 Live leaderboard</span>
            <span className="px-2.5 py-1 rounded-full bg-white/15 backdrop-blur">⚡ Instant UPI payout</span>
            <span className="px-2.5 py-1 rounded-full bg-white/15 backdrop-blur">👥 Expert assigned: {expert.name}</span>
          </div>
        </div>
        <div className="relative flex flex-col gap-2 md:items-end">
          <Link
            to={href as any}
            onClick={() => track("referral_started", { ...ctxOut, expert: expert.id })}
            className="inline-flex items-center justify-center px-5 h-12 rounded-full bg-white text-primary font-bold text-sm shadow-lg hover:scale-[1.02] transition w-full md:w-auto"
          >
            Refer now →
          </Link>
          <Link
            to="/persona-quiz"
            className="text-[11px] font-bold text-white/85 hover:text-white underline-offset-2 hover:underline"
          >
            Not sure? Take the 30-sec quiz
          </Link>
        </div>
      </div>
    </section>
  );
}

function prettifySlug(s: string) {
  return s.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}
