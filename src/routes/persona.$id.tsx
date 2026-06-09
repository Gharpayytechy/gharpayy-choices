import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Header, WhatsAppIcon } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileBottomBar } from "@/components/MobileBottomBar";
import { PERSONA_BY_ID } from "@/lib/personas";
import { ALL_AREAS } from "@/lib/insights-utils";
import { inr } from "@/lib/format";
import { waPersona } from "@/lib/wa";
import { captainForPersona } from "@/lib/captains";
import { CaptainCard } from "@/components/CaptainCard";
import { ContextualReferCTA } from "@/components/insights/ContextualReferCTA";

export const Route = createFileRoute("/persona/$id")({
  loader: ({ params }) => {
    const p = PERSONA_BY_ID[params.id];
    if (!p) throw notFound();
    return { p };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.p.title} · Best Bengaluru hubs · Gharpayy` },
      { name: "description", content: `Top areas, budget, and verified PG/flat options for a ${loaderData?.p.title}. Expert replies in minutes.` },
    ],
  }),
  notFoundComponent: () => <div className="p-10 text-center"><h1 className="text-2xl font-bold">Persona not found</h1><Link to="/gharpayy" className="text-primary">← Home</Link></div>,
  errorComponent: ({ error }) => <div className="p-8">{error.message}</div>,
  component: PersonaPage,
});

function PersonaPage() {
  const { p } = Route.useLoaderData();
  const areas = p.bestAreas.map((s: string) => ({ slug: s, ...(ALL_AREAS as any)[s] })).filter((a: any) => a.name);
  const expert = captainForPersona(p.id);
  const primaryAreaSlug: string | undefined = areas[0]?.slug;

  return (
    <div className="min-h-screen flex flex-col pb-28 md:pb-0">
      <Header />
      <section className="border-b" style={{ background: "var(--gradient-hero)" }}>
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-10">
          <div className="text-7xl">{p.emoji}</div>
          <h1 className="mt-3 text-3xl md:text-5xl font-bold tracking-tight text-ink">{p.title}</h1>
          <p className="mt-2 text-base text-muted-foreground max-w-2xl">{p.short}</p>
          {p.storyQuote && (
            <p className="mt-3 text-sm md:text-base italic text-ink/75 max-w-2xl border-l-2 border-primary/40 pl-3">
              "{p.storyQuote}"
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <Pill k="Budget" v={`₹${(p.budget[0]/1000).toFixed(0)}k–${(p.budget[1]/1000).toFixed(0)}k`} />
            <Pill k="Stay type" v={p.bhk} />
            <Pill k="Expert" v={expert.name} />
          </div>
          <a href={waPersona(p.title)} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 px-5 py-3 rounded-full font-bold text-white text-sm" style={{ background: "oklch(0.62 0.14 155)" }}>
            <WhatsAppIcon className="w-4 h-4" /> WhatsApp {expert.name}
          </a>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 md:px-6 py-7 w-full grid lg:grid-cols-[1fr_320px] gap-6">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">What you need</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {p.needs.map((n: string) => <span key={n} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20">✓ {n}</span>)}
          </div>
          {p.dealBreakers && p.dealBreakers.length > 0 && (
            <>
              <h3 className="mt-6 text-sm font-bold text-muted-foreground uppercase tracking-wide">Deal-breakers we screen for</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {p.dealBreakers.map((n: string) => <span key={n} className="text-xs font-semibold px-3 py-1.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20">✗ {n}</span>)}
              </div>
            </>
          )}
        </div>
        <CaptainCard expert={expert} context={`I'm a ${p.title}`} />
      </section>

      <section className="max-w-6xl mx-auto px-4 md:px-6 py-7 w-full">
        <h2 className="text-xl md:text-2xl font-bold">Best hubs for you</h2>
        <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {areas.map((a: any) => (
            <Link key={a.slug} to="/area/$slug" params={{ slug: a.slug }} className="rounded-2xl border bg-card hover:border-primary/40 transition p-4">
              <div className="font-bold text-sm text-ink">{a.name}</div>
              <div className="text-[11px] text-muted-foreground num">Median {inr(a.overall.med)} · {a.count} pins</div>
            </Link>
          ))}
        </div>
      </section>

      {p.colleges && (
        <section className="max-w-6xl mx-auto px-4 md:px-6 py-7 w-full">
          <h3 className="text-lg font-bold">Colleges nearby</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {p.colleges.map((c: string) => <span key={c} className="text-xs px-2.5 py-1 rounded-full border bg-card">{c}</span>)}
          </div>
        </section>
      )}
      {p.employers && (
        <section className="max-w-6xl mx-auto px-4 md:px-6 py-7 w-full">
          <h3 className="text-lg font-bold">Employers nearby</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {p.employers.map((c: string) => <span key={c} className="text-xs px-2.5 py-1 rounded-full border bg-card">{c}</span>)}
          </div>
        </section>
      )}

      <ContextualReferCTA
        context={{ persona: p.id, area: primaryAreaSlug, expert: expert.id, source: `persona:${p.id}` }}
      />
      <ContextualReferCTA
        tone="sticky"
        context={{ persona: p.id, area: primaryAreaSlug, expert: expert.id, source: `persona:${p.id}:sticky` }}
      />

      <Footer />
      <MobileBottomBar variant="dual" context={`I'm a ${p.title}`} />
    </div>
  );
}

function Pill({ k, v }: { k: string; v: string }) {
  return <span className="px-3 py-1 rounded-full border bg-card text-xs"><span className="text-muted-foreground">{k}:</span> <span className="font-bold text-ink">{v}</span></span>;
}
