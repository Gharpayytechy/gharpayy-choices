import { Link } from "@tanstack/react-router";
import { PERSONAS } from "@/lib/personas";

export function AreaPersonaFit({ slug }: { slug: string }) {
  const fits = PERSONAS.map((p) => ({
    p,
    score: p.bestAreas.includes(slug) ? 95 : 30 + Math.round((slug.length * 7) % 40),
  })).sort((a, b) => b.score - a.score).slice(0, 6);

  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-6 w-full">
      <div className="text-[11px] uppercase tracking-widest text-primary font-bold">Persona fit 🎯</div>
      <h2 className="mt-1 text-xl md:text-2xl font-bold tracking-tight">Who fits this area</h2>
      <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {fits.map(({ p, score }) => (
          <Link
            key={p.id}
            to="/persona/$id"
            params={{ id: p.id }}
            className="rounded-2xl border bg-card hover:border-primary/40 transition p-3 flex items-center gap-3"
          >
            <span className="text-2xl">{p.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-ink truncate">{p.title}</div>
              <div className="mt-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                <div className="h-full" style={{ width: `${score}%`, background: "var(--gradient-orange)" }} />
              </div>
            </div>
            <div className="text-xs num font-bold text-primary">{score}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
