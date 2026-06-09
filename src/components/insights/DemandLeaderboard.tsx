import { Link } from "@tanstack/react-router";
import { ALL_AREA_LIST } from "@/lib/insights-utils";
import { inr } from "@/lib/format";

export function DemandLeaderboard() {
  const top = [...ALL_AREA_LIST]
    .filter((a: any) => a.demand_score)
    .sort((a: any, b: any) => b.demand_score - a.demand_score)
    .slice(0, 8);

  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-7 w-full">
      <div className="text-[11px] uppercase tracking-widest text-primary font-bold">Hottest right now 🔥</div>
      <h2 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight">Demand leaderboard</h2>
      <p className="mt-1 text-sm text-muted-foreground">Where seekers are hunting hardest this month.</p>

      <div className="mt-4 grid sm:grid-cols-2 gap-2">
        {top.map((a: any, i) => (
          <Link
            key={a.slug}
            to="/area/$slug"
            params={{ slug: a.slug }}
            className="flex items-center gap-3 p-3 rounded-2xl border bg-card hover:border-primary/40 hover:bg-primary/5 transition"
          >
            <div className="w-9 h-9 rounded-xl grid place-items-center text-sm font-bold num text-white" style={{ background: "var(--gradient-orange)" }}>
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm text-ink truncate">{a.name}</div>
              <div className="text-[11px] text-muted-foreground num">{inr(a.overall.med)} median · {a.seekers} seekers</div>
            </div>
            <div className="text-xs num font-bold text-primary">{a.demand_score.toFixed(2)}×</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
