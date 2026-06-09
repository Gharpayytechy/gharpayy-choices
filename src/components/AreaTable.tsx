import { Link } from "@tanstack/react-router";
import data from "@/data/insights.json";
import { inr } from "@/lib/format";

export function AreaTable({ limit }: { limit?: number }) {
  const areas = Object.entries(data.areas as Record<string, any>)
    .map(([slug, a]) => ({ slug, ...a }))
    .sort((a, b) => b.count - a.count);
  const rows = limit ? areas.slice(0, limit) : areas;

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Neighborhood pricing</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Median rent across {Object.keys(data.areas).length} micro-markets</p>
        </div>
        {limit && <Link to="/areas" className="text-xs font-semibold text-primary hover:underline">All areas →</Link>}
      </div>
      <div className="overflow-x-auto -mx-2">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-wider text-muted-foreground border-b">
              <th className="px-2 py-2 font-medium">Area</th>
              <th className="px-2 py-2 text-right font-medium">Listings</th>
              <th className="px-2 py-2 text-right font-medium">1 BHK</th>
              <th className="px-2 py-2 text-right font-medium">2 BHK</th>
              <th className="px-2 py-2 text-right font-medium">3 BHK</th>
              <th className="px-2 py-2 text-right font-medium">Median</th>
              <th className="px-2 py-2 text-right font-medium">Demand</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.slug} className="border-b border-border/40 hover:bg-secondary/50 transition">
                <td className="px-2 py-3"><Link to="/area/$slug" params={{ slug: r.slug }} className="font-medium hover:text-primary">{r.name}</Link></td>
                <td className="px-2 py-3 text-right text-muted-foreground num">{r.count}</td>
                <td className="px-2 py-3 text-right num">{r.by_bhk["1"] ? inr(r.by_bhk["1"].med) : "-"}</td>
                <td className="px-2 py-3 text-right num">{r.by_bhk["2"] ? inr(r.by_bhk["2"].med) : "-"}</td>
                <td className="px-2 py-3 text-right num">{r.by_bhk["3"] ? inr(r.by_bhk["3"].med) : "-"}</td>
                <td className="px-2 py-3 text-right font-semibold text-primary num">{inr(r.overall.med)}</td>
                <td className="px-2 py-3 text-right">
                  <span className="num text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{r.demand_score.toFixed(2)}×</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
