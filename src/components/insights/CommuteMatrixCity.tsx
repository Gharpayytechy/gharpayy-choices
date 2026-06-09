import { Link } from "@tanstack/react-router";
import { ALL_AREAS } from "@/lib/insights-utils";
import { inr } from "@/lib/format";

const OFFICES = [
  { id: "manyata", label: "Manyata", emoji: "🏢", areas: ["hebbal", "thanisandra", "hennur", "kalyan-nagar"] },
  { id: "egl", label: "EGL / Bellandur", emoji: "🛣️", areas: ["bellandur", "marathahalli", "sarjapur-road", "hsr-layout"] },
  { id: "whitefield", label: "Whitefield", emoji: "🏗️", areas: ["whitefield", "mahadevapura", "hoodi", "kadugodi", "brookefield"] },
  { id: "ecity", label: "Electronic City", emoji: "🛠️", areas: ["electronic-city", "bommanahalli", "begur", "btm-layout"] },
  { id: "mg-road", label: "MG Road", emoji: "🌇", areas: ["indiranagar", "domlur", "frazer-town", "cooke-town"] },
  { id: "koramangala", label: "Koramangala", emoji: "🚀", areas: ["koramangala", "hsr-layout", "btm-layout", "jayanagar"] },
];

export function CommuteMatrixCity() {
  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-7 w-full">
      <div className="text-[11px] uppercase tracking-widest text-primary font-bold">Live near work 📍</div>
      <h2 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight">Closest hubs to each tech park</h2>

      <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {OFFICES.map((o) => (
          <div key={o.id} className="rounded-2xl border bg-card p-4">
            <div className="flex items-center gap-2 text-sm font-bold text-ink">
              <span className="text-lg">{o.emoji}</span> {o.label}
            </div>
            <div className="mt-2 space-y-1">
              {o.areas.map((slug) => {
                const a = (ALL_AREAS as any)[slug];
                if (!a) return null;
                return (
                  <Link key={slug} to="/area/$slug" params={{ slug }} className="flex justify-between items-center py-1.5 px-2 rounded-lg hover:bg-primary/5 text-xs">
                    <span className="font-semibold text-ink">{a.name}</span>
                    <span className="text-muted-foreground num">{inr(a.overall.med)}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
