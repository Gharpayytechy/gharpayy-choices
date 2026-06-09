import { CITY_BHK, CITY_STATS } from "@/lib/insights-utils";
import { inr, inrFull } from "@/lib/format";

export function CityKpis() {
  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-6 w-full">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        <Kpi v={CITY_STATS.pins.toLocaleString()} l="Verified pins" />
        <Kpi v={CITY_STATS.seekers.toLocaleString()} l="Active seekers" />
        <Kpi v={CITY_STATS.areas.toString()} l="Hubs covered" />
        <Kpi v={inr(CITY_STATS.value)} l="Rent monitored" />
      </div>
      <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-2">
        {CITY_BHK.map((b) => (
          <div key={b.bhk} className="rounded-xl border bg-card p-3">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{b.bhk} BHK city median</div>
            <div className="mt-1 text-lg num font-bold text-ink">{inr(b.med)}</div>
            <div className="text-[10px] text-muted-foreground num">{b.count} pins</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Kpi({ v, l }: { v: string; l: string }) {
  return (
    <div className="rounded-2xl border bg-card px-3.5 py-2.5 md:px-4 md:py-3 shadow-[var(--shadow-card)]">
      <div className="text-lg md:text-2xl font-bold num text-ink">{v}</div>
      <div className="text-[10px] md:text-[11px] uppercase tracking-wider text-muted-foreground font-semibold mt-0.5">{l}</div>
    </div>
  );
}
