import { Link } from "@tanstack/react-router";
import data from "@/data/insights.json";
import { inr } from "@/lib/format";

export function BestValue() {
  const areas = Object.entries(data.areas as Record<string, any>)
    .map(([slug, a]) => ({ slug, ...a }))
    .filter((a) => a.count >= 15);

  const cheapest = [...areas].sort((a, b) => a.overall.med - b.overall.med).slice(0, 5);
  const hottest = [...areas].sort((a, b) => b.demand_score - a.demand_score).slice(0, 5);
  const value = [...areas]
    .map((a) => ({ ...a, score: a.demand_score / (a.overall.med / 30000) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return (
    <div className="grid md:grid-cols-3 gap-5">
      <Card title="🏷️ Cheapest" subtitle="Lowest median rent" rows={cheapest.map((a) => ({ slug: a.slug, name: a.name, value: inr(a.overall.med) }))} />
      <Card title="🔥 Most-wanted" subtitle="Highest demand index" accent rows={hottest.map((a) => ({ slug: a.slug, name: a.name, value: `${a.demand_score.toFixed(2)}×` }))} />
      <Card title="💎 Best value" subtitle="Demand vs price ratio" rows={value.map((a) => ({ slug: a.slug, name: a.name, value: inr(a.overall.med) }))} />
    </div>
  );
}

function Card({ title, subtitle, rows, accent }: { title: string; subtitle: string; rows: { slug: string; name: string; value: string }[]; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 shadow-[var(--shadow-card)] ${accent ? "bg-primary/5 border-primary/30" : "bg-card"}`}>
      <h4 className="font-semibold">{title}</h4>
      <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
      <ul className="mt-3 divide-y divide-border/60">
        {rows.map((r, i) => (
          <li key={r.slug}>
            <Link to="/area/$slug" params={{ slug: r.slug }} className="flex items-center justify-between py-2.5 group">
              <span className="flex items-center gap-2.5">
                <span className="w-5 h-5 grid place-items-center rounded-md bg-secondary text-[10px] num font-bold text-muted-foreground">{i + 1}</span>
                <span className="text-sm font-medium group-hover:text-primary transition">{r.name}</span>
              </span>
              <span className="num text-sm font-semibold">{r.value}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
