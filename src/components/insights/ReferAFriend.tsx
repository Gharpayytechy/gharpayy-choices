import { Link } from "@tanstack/react-router";

export function ReferAFriend() {
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
          <h3 className="mt-3 text-2xl md:text-3xl font-bold leading-tight">
            ₹500 per move-in. <span className="opacity-90">₹50 the moment they verify.</span>
          </h3>
          <p className="mt-2 text-sm md:text-base opacity-95 max-w-xl">
            Every Insights page ends in the same place · a Bengaluru hunter who needs a home. Drop their number,
            track the lead in your dashboard, get paid when they move in.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold">
            <span className="px-2.5 py-1 rounded-full bg-white/15 backdrop-blur">🏆 Live leaderboard</span>
            <span className="px-2.5 py-1 rounded-full bg-white/15 backdrop-blur">⚡ Instant UPI payout</span>
            <span className="px-2.5 py-1 rounded-full bg-white/15 backdrop-blur">👥 Squads & streaks</span>
          </div>
        </div>
        <div className="relative flex flex-col gap-2 md:items-end">
          <Link
            to="/app/$"
            params={{ _splat: "refer" }}
            className="inline-flex items-center justify-center px-5 h-12 rounded-full bg-white text-primary font-bold text-sm shadow-lg hover:scale-[1.02] transition"
          >
            Open my dashboard →
          </Link>
          <Link
            to="/app"
            className="text-[11px] font-bold text-white/85 hover:text-white underline-offset-2 hover:underline"
          >
            What is the Super App?
          </Link>
        </div>
      </div>
    </section>
  );
}
