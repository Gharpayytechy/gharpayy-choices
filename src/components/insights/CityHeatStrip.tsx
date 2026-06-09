import { Link } from "@tanstack/react-router";
import { cityRanking } from "@/lib/insights-utils";
import { inr } from "@/lib/format";

export function CityHeatStrip() {
  const ranked = cityRanking();
  const min = ranked[0].med;
  const max = ranked[ranked.length - 1].med;

  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-7 w-full">
      <div className="text-[11px] uppercase tracking-widest text-primary font-bold">City heat-strip 🌡️</div>
      <h2 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight">All 38 hubs ranked by median rent</h2>
      <p className="mt-1 text-sm text-muted-foreground">Cheapest on the left, premium on the right. Tap any hub.</p>

      <div className="mt-4 -mx-4 md:mx-0 px-4 md:px-0 overflow-x-auto pb-2">
        <div className="flex gap-1 min-w-max">
          {ranked.map((a) => {
            const t = (a.med - min) / Math.max(max - min, 1);
            const bg = `oklch(${0.92 - t * 0.18} ${0.04 + t * 0.16} ${50 - t * 5})`;
            return (
              <Link
                key={a.slug}
                to="/area/$slug"
                params={{ slug: a.slug }}
                className="group flex flex-col items-center justify-end min-w-[58px] px-1 py-2 rounded-lg hover:scale-[1.04] transition"
                style={{ background: bg }}
              >
                <div className="text-[10px] num font-bold text-ink/80">{inr(a.med)}</div>
                <div className="mt-1 text-[10px] text-center text-ink/70 leading-tight max-w-[58px] truncate">{a.name}</div>
              </Link>
            );
          })}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground num">
        <span>← Affordable {inr(min)}</span>
        <span>Premium {inr(max)} →</span>
      </div>
    </section>
  );
}
