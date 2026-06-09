import { ALL_AREA_LIST } from "@/lib/insights-utils";
import { Link } from "@tanstack/react-router";

export function SupplyDemand() {
  const rows = ALL_AREA_LIST
    .map((a: any) => ({
      slug: a.slug,
      name: a.name,
      pins: a.count,
      seekers: a.seekers ?? 0,
      ratio: (a.seekers ?? 0) / Math.max(a.count, 1),
    }))
    .filter((r) => r.pins >= 50)
    .sort((a, b) => b.ratio - a.ratio)
    .slice(0, 8);

  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-7 w-full">
      <div className="text-[11px] uppercase tracking-widest text-primary font-bold">Supply vs demand 📊</div>
      <h2 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight">Where seekers outnumber listings</h2>
      <p className="mt-1 text-sm text-muted-foreground">Seekers per available rent · high ratio = competitive market.</p>
      <div className="mt-4 space-y-2">
        {rows.map((r) => (
          <Link
            key={r.slug}
            to="/area/$slug"
            params={{ slug: r.slug }}
            className="flex items-center gap-3 p-3 rounded-xl border bg-card hover:border-primary/40 transition"
          >
            <div className="font-semibold text-sm text-ink min-w-[120px] truncate">{r.name}</div>
            <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(100, r.ratio * 50)}%`,
                  background: "var(--gradient-orange)",
                }}
              />
            </div>
            <div className="text-xs num font-bold w-20 text-right">
              {r.seekers} <span className="text-muted-foreground">/ {r.pins}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
