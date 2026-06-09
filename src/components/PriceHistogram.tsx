import data from "@/data/insights.json";
import { inr } from "@/lib/format";

export function PriceHistogram() {
  const { buckets, counts } = data.hist;
  const max = Math.max(...counts);
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-baseline justify-between mb-5">
        <div>
          <h3 className="text-lg font-semibold">Where the rent actually lives</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Distribution of {data.stats.pins.toLocaleString()} verified Bengaluru rents</p>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">All BHK</span>
      </div>
      <div className="flex items-end gap-2 h-44">
        {counts.map((c, i) => {
          const h = (c / max) * 100;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
              <span className="text-[10px] num text-muted-foreground opacity-0 group-hover:opacity-100 transition">{c}</span>
              <div
                className="w-full rounded-t-md transition-all duration-700"
                style={{ height: `${h}%`, background: i === 2 || i === 3 ? "var(--gradient-orange)" : "oklch(0.715 0.185 45 / 0.35)" }}
              />
              <span className="text-[10px] num text-muted-foreground">{inr(buckets[i])}</span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
        <div className="p-3 rounded-lg bg-secondary">
          <div className="text-muted-foreground">Sweet spot</div>
          <div className="num font-semibold text-ink mt-0.5">₹20k–40k</div>
        </div>
        <div className="p-3 rounded-lg bg-secondary">
          <div className="text-muted-foreground">Premium</div>
          <div className="num font-semibold text-ink mt-0.5">₹50k+</div>
        </div>
        <div className="p-3 rounded-lg bg-secondary">
          <div className="text-muted-foreground">Ultra-premium</div>
          <div className="num font-semibold text-ink mt-0.5">₹1L+</div>
        </div>
      </div>
    </div>
  );
}
