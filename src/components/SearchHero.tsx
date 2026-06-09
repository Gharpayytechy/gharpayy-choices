import { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { AREAS } from "@/lib/areas-meta";
import data from "@/data/insights.json";

const POPULAR = ["koramangala", "hsr-layout", "bellandur", "whitefield", "hebbal", "electronic-city", "indiranagar", "marathahalli"];

export function SearchHero() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const matches = useMemo(() => {
    if (!q.trim()) return [];
    const ql = q.toLowerCase();
    return AREAS.filter((a) => a.name.toLowerCase().includes(ql) || a.slug.includes(ql)).slice(0, 6);
  }, [q]);

  return (
    <section className="relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
      <div className="absolute inset-0 bg-grid pointer-events-none" />
      <div className="relative max-w-5xl mx-auto px-4 md:px-6 pt-10 md:pt-20 pb-10 md:pb-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] md:text-xs text-primary font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          {data.stats.pins.toLocaleString()} verified rents · {data.stats.areas} hubs · direct to owner
        </div>
        <h1 className="mt-4 text-3xl sm:text-5xl md:text-6xl font-bold leading-[1.05] tracking-tight text-ink">
          Search <span className="text-primary">your area.</span><br className="hidden sm:block" />
          See what Bengaluru really pays.
        </h1>
        <p className="mt-3 md:mt-4 text-sm md:text-base text-muted-foreground max-w-xl">
          Type your area, society, or college · get the median rent, demand, and a Gharpayy expert on WhatsApp in one tap.
        </p>

        {/* SEARCH BAR */}
        <div className="mt-6 md:mt-8 relative">
          <div className="flex items-center gap-2 rounded-2xl bg-card border-2 border-primary/30 shadow-[var(--shadow-card)] p-1.5 focus-within:border-primary transition">
            <span className="pl-3 text-xl">🔎</span>
            <input
              value={q}
              onChange={(e) => { setQ(e.target.value); setOpen(true); }}
              onFocus={() => setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
              placeholder="Koramangala, HSR, Christ College…"
              className="flex-1 bg-transparent py-3 text-base md:text-lg outline-none placeholder:text-muted-foreground/70"
              aria-label="Search areas"
            />
            <button
              onClick={() => matches[0] && navigate({ to: "/area/$slug", params: { slug: matches[0].slug } })}
              className="px-4 py-2.5 rounded-xl text-sm font-bold text-white shadow-[var(--shadow-glow)]"
              style={{ background: "var(--gradient-orange)" }}
            >
              Search
            </button>
          </div>

          {open && matches.length > 0 && (
            <div className="absolute left-0 right-0 mt-2 rounded-2xl border bg-card shadow-xl overflow-hidden z-30">
              {matches.map((m) => (
                <Link
                  key={m.slug}
                  to="/area/$slug"
                  params={{ slug: m.slug }}
                  className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-secondary border-b last:border-b-0"
                >
                  <div>
                    <div className="font-semibold text-sm">{m.name}</div>
                    <div className="text-[11px] text-muted-foreground num">₹{(m.med / 1000).toFixed(0)}k median · {m.count} pins</div>
                  </div>
                  <span className="text-primary text-sm">→</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* CHIPS */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold mr-1 self-center">Popular:</span>
          {POPULAR.map((slug) => {
            const a = AREAS.find((x) => x.slug === slug);
            if (!a) return null;
            return (
              <Link
                key={slug}
                to="/area/$slug"
                params={{ slug }}
                className="px-3 py-1.5 rounded-full text-xs font-semibold border bg-card hover:border-primary/40 hover:bg-primary/5 transition"
              >
                {a.name}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
