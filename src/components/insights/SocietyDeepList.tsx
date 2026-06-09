import { topSocietyData } from "@/lib/insights-utils";
import { inr } from "@/lib/format";
import { Link } from "@tanstack/react-router";

export function SocietyDeepList({ area, slug }: { area: any; slug: string }) {
  const items = topSocietyData(area).slice(0, 8);
  if (!items.length) return null;
  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-6 w-full">
      <div className="text-[11px] uppercase tracking-widest text-primary font-bold">Society deep-dive 🏢</div>
      <h2 className="mt-1 text-xl md:text-2xl font-bold tracking-tight">Inside the gates of {area.name}</h2>
      <div className="mt-3 grid sm:grid-cols-2 gap-2">
        {items.map((s) => (
          <Link
            key={s.s}
            to="/society/$slug"
            params={{ slug: encodeURIComponent(`${slug}__${s.s.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`) }}
            className="rounded-xl border bg-card p-3 hover:border-primary/40 transition flex items-center gap-3"
          >
            <span className="w-10 h-10 rounded-xl grid place-items-center text-base font-bold text-white flex-shrink-0" style={{ background: "var(--gradient-orange)" }}>
              {s.s.charAt(0)}
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm text-ink truncate">{s.s}</div>
              <div className="text-[11px] text-muted-foreground num">{s.n} pins · avg {inr(s.avg)} · {inr(s.min)}–{inr(s.max)}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
