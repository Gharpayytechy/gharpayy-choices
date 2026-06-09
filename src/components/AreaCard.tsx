import { Link } from "@tanstack/react-router";
import { inr } from "@/lib/format";

interface AreaCardProps {
  slug: string;
  name: string;
  count: number;
  seekers: number;
  med: number;
  demand: number;
  per_sqft?: number | null;
}

export function AreaCard({ slug, name, count, seekers, med, demand, per_sqft }: AreaCardProps) {
  const heat = demand > 1.5 ? "hot" : demand > 0.8 ? "warm" : "cold";
  const heatColor = heat === "hot" ? "oklch(0.585 0.22 27)" : heat === "warm" ? "oklch(0.78 0.16 75)" : "oklch(0.66 0.14 245)";
  return (
    <Link
      to="/area/$slug"
      params={{ slug }}
      className="group block rounded-xl border bg-card p-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-pop)] hover:border-primary/40 transition-all"
    >
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-semibold text-ink group-hover:text-primary transition">{name}</h4>
          <div className="text-xs text-muted-foreground mt-0.5"><span className="num">{count}</span> listings · <span className="num">{seekers}</span> seekers</div>
        </div>
        <span
          className="px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold text-white"
          style={{ background: heatColor }}
        >
          {heat}
        </span>
      </div>
      <div className="mt-4 flex items-baseline justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Median rent</div>
          <div className="text-2xl num font-bold text-ink">{inr(med)}</div>
        </div>
        {per_sqft && (
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Per sqft</div>
            <div className="text-sm num font-semibold text-ink">₹{per_sqft}</div>
          </div>
        )}
      </div>
      <div className="mt-3 h-1 rounded-full bg-secondary overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${Math.min(demand * 50, 100)}%`, background: heatColor }} />
      </div>
      <div className="mt-1 text-[10px] text-muted-foreground">
        Demand index <span className="num">{demand.toFixed(2)}</span>
      </div>
    </Link>
  );
}
