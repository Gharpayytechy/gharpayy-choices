import { Link } from "@tanstack/react-router";
import { AREAS } from "@/lib/areas-meta";
import { AVAIL_META } from "@/lib/areas-meta";
import { inr } from "@/lib/format";

const FEATURED = ["koramangala", "hsr-layout", "bellandur", "indiranagar", "whitefield", "hebbal"];

export function TopHubs() {
  const hubs = FEATURED.map((s) => AREAS.find((a) => a.slug === s)!).filter(Boolean);
  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12 w-full">
      <div className="flex items-end justify-between mb-4">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-primary font-bold">Hero hubs</div>
          <h2 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight">Bengaluru's most-searched areas</h2>
        </div>
        <Link to="/areas" className="text-xs md:text-sm font-semibold text-primary hover:underline">All 38 areas →</Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {hubs.map((a) => {
          const av = AVAIL_META[a.avail];
          return (
            <Link
              key={a.slug}
              to="/area/$slug"
              params={{ slug: a.slug }}
              className="group rounded-2xl border-2 border-border hover:border-primary/40 bg-card p-4 md:p-5 transition shadow-[var(--shadow-card)]"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-base md:text-lg font-bold leading-tight text-ink group-hover:text-primary">{a.name}</h3>
                <span className="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-md text-white whitespace-nowrap" style={{ background: av.color }}>
                  {av.dot} {av.label}
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-1.5">
                <span className="text-2xl md:text-3xl num font-bold text-primary">{inr(a.med)}</span>
                <span className="text-[11px] text-muted-foreground">median</span>
              </div>
              <div className="mt-1 text-[11px] text-muted-foreground num">
                {a.count} pins · 1BHK {a.med1 ? inr(a.med1) : "-"} · 2BHK {a.med2 ? inr(a.med2) : "-"}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
