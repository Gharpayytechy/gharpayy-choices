import data from "@/data/insights.json";
import { inr } from "@/lib/format";

export function RentBars() {
  const rows = data.bhk_summary;
  const max = Math.max(...rows.map((d) => d.med));
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-baseline justify-between mb-5">
        <div>
          <h3 className="text-lg font-semibold">Median rent by configuration</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{rows.reduce((a, d) => a + d.count, 0).toLocaleString()} listings</p>
        </div>
      </div>
      <div className="space-y-4">
        {rows.map((d) => (
          <div key={d.bhk}>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="font-medium">{d.bhk} BHK</span>
              <span className="text-muted-foreground">
                <span className="num text-primary font-semibold">{inr(d.med)}</span> · <span className="num">{d.count}</span> listings
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(d.med / max) * 100}%`, background: "var(--gradient-orange)" }} />
            </div>
            <div className="mt-1 text-[11px] num text-muted-foreground">range {inr(d.min)} – {inr(d.max)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
