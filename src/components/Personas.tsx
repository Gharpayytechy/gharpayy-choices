import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { PERSONAS, type Persona } from "@/lib/personas";
import { AREA_BY_SLUG } from "@/lib/areas-meta";
import { waPersona } from "@/lib/wa";
import { inr } from "@/lib/format";
import { WhatsAppIcon } from "./Header";

export function Personas() {
  const [active, setActive] = useState<Persona>(PERSONAS[0]);
  return (
    <div className="rounded-3xl border-2 border-primary/20 bg-card overflow-hidden shadow-[var(--shadow-card)]">
      <div className="px-6 md:px-8 pt-7 pb-5 border-b" style={{ background: "linear-gradient(135deg, oklch(0.985 0.005 70) 0%, oklch(0.97 0.02 45) 100%)" }}>
        <div className="text-[11px] font-bold uppercase tracking-widest text-primary">Lead matching</div>
        <h2 className="mt-1.5 text-2xl md:text-3xl font-bold tracking-tight text-ink">
          Tell us who you are. We'll send the <span className="text-primary">right expert</span>.
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground max-w-2xl">
          Most rental sites dump every listing on every visitor. Insights routes you straight to the Gharpayy desk that knows your hub, your budget, and your move-in window.
        </p>
      </div>

      {/* Persona chips */}
      <div className="px-4 md:px-8 py-4 border-b overflow-x-auto">
        <div className="flex gap-2 w-max">
          {PERSONAS.map((p) => (
            <button
              key={p.id}
              onClick={() => setActive(p)}
              className={`shrink-0 inline-flex items-center gap-2 px-3.5 py-2 rounded-full border-2 text-sm transition ${active.id === p.id ? "border-primary bg-primary/10 text-primary font-semibold" : "border-border bg-card hover:border-primary/40"}`}
            >
              <span className="text-base">{p.emoji}</span>
              {p.title}
            </button>
          ))}
        </div>
      </div>

      {/* Active persona detail */}
      <div className="grid md:grid-cols-[1.2fr_1fr] gap-0">
        <div className="p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="text-5xl leading-none">{active.emoji}</div>
            <div>
              <div className="text-xl font-bold text-ink">{active.title}</div>
              <div className="text-sm text-muted-foreground mt-0.5">{active.short}</div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <Stat label="Typical budget" value={`${inr(active.budget[0])} – ${inr(active.budget[1])}`} accent />
            <Stat label="Looking for" value={active.bhk} />
          </div>

          <div className="mt-5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">What they ask for</div>
            <div className="flex flex-wrap gap-1.5">
              {active.needs.map((n) => (
                <span key={n} className="text-xs px-2.5 py-1 rounded-full bg-secondary border">{n}</span>
              ))}
            </div>
          </div>

          {(active.employers || active.colleges) && (
            <div className="mt-5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                {active.employers ? "Often work at" : "Often study at"}
              </div>
              <div className="text-sm text-foreground/80">{(active.employers ?? active.colleges)!.join(" · ")}</div>
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-2">
            <a href={waPersona(active.title)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold text-white shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-orange)" }}>
              <WhatsAppIcon className="w-3.5 h-3.5" /> Match me with Gharpayy
            </a>
          </div>
        </div>

        <div className="p-6 md:p-8 border-t md:border-t-0 md:border-l bg-background/40">
          <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Best areas for {active.title.toLowerCase()}</div>
          <div className="mt-3 space-y-2">
            {active.bestAreas.map((slug) => {
              const a = AREA_BY_SLUG[slug];
              if (!a) return null;
              return (
                <Link
                  key={slug}
                  to="/area/$slug"
                  params={{ slug }}
                  className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-lg border bg-card hover:border-primary/40 hover:bg-primary/5 transition"
                >
                  <div>
                    <div className="text-sm font-semibold">{a.name}</div>
                    <div className="text-[11px] text-muted-foreground">
                      <span className="num">{a.count}</span> rents · median <span className="num font-semibold text-foreground">{inr(a.med)}</span>
                    </div>
                  </div>
                  <span className="text-primary text-sm">→</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`px-3.5 py-2.5 rounded-xl border ${accent ? "bg-primary/10 border-primary/30" : "bg-card"}`}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
      <div className={`num font-bold text-base mt-0.5 ${accent ? "text-primary" : "text-ink"}`}>{value}</div>
    </div>
  );
}
