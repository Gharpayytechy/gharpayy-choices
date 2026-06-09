import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Header, WhatsAppIcon } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileBottomBar } from "@/components/MobileBottomBar";
import data from "@/data/insights.json";
import { inr } from "@/lib/format";
import { waArea, waHomes, GHARPAYY_BOOK_URL, deskFor, deskLabel, WA_NUMBERS } from "@/lib/wa";
import { AVAIL_META, AREA_BY_SLUG } from "@/lib/areas-meta";
import { ctxFor } from "@/lib/area-context";
import { personasForArea } from "@/lib/personas";

export const Route = createFileRoute("/gharpayy/area/$slug")({
  loader: ({ params }) => {
    const area = (data.areas as Record<string, any>)[params.slug];
    if (!area) throw notFound();
    return { area, slug: params.slug };
  },
  head: ({ loaderData }) => {
    const a = loaderData?.area;
    return {
      meta: [
        { title: `Gharpayy in ${a?.name} · Direct-to-owner rentals & PG` },
        { name: "description", content: `Verified Gharpayy private rooms, shared PG and 1/2 BHK Homes in ${a?.name}. Direct to owner, 7-day move-in, real expert on WhatsApp.` },
        { property: "og:title", content: `Gharpayy in ${a?.name} · Direct-to-owner stays` },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center"><div className="text-center"><h1 className="text-3xl font-bold">Area not found</h1><Link to="/gharpayy" className="text-primary mt-3 inline-block">← Gharpayy</Link></div></div>
  ),
  component: GharpayyArea,
});

function GharpayyArea() {
  const { area, slug } = Route.useLoaderData();
  const meta = AREA_BY_SLUG[slug];
  const av = meta ? AVAIL_META[meta.avail] : AVAIL_META.low;
  const ctx = ctxFor(slug, area.name);
  const desk = deskFor(slug);
  const o = area.overall;

  // Synthetic Gharpayy starter prices: 35% below local median for shared,
  // 25% for private, anchored to floor pricing.
  const sharedFrom = Math.max(6500, Math.round((o.med * 0.18) / 500) * 500);
  const privateFrom = Math.max(9500, Math.round((o.med * 0.28) / 500) * 500);
  const homesFrom = area.by_bhk?.["1"]?.med ? Math.max(25000, Math.round(area.by_bhk["1"].med * 0.85 / 1000) * 1000) : 25000;

  return (
    <div className="min-h-screen flex flex-col pb-24 md:pb-0">
      <Header />

      {/* Hero */}
      <section className="border-b" style={{ background: "var(--gradient-hero)" }}>
        <div className="max-w-6xl mx-auto px-4 md:px-6 pt-6 md:pt-12 pb-8 md:pb-12">
          <div className="text-xs text-muted-foreground mb-3">
            <Link to="/gharpayy" className="hover:text-primary">Gharpayy</Link> ·{" "}
            <span className="text-foreground font-medium">{area.name}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-ink">Gharpayy in {area.name}</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold text-white" style={{ background: av.color }}>
              {av.dot} {av.label}
            </span>
          </div>
          <p className="mt-2 text-sm md:text-base text-muted-foreground max-w-2xl">{av.desc}. {ctx.blurb}</p>

          <div className="mt-5 grid grid-cols-3 gap-2 md:gap-3">
            <Tile label="Shared from" value={inr(sharedFrom)} accent="orange" />
            <Tile label="Private from" value={inr(privateFrom)} accent="orange" />
            <Tile label="Home from" value={inr(homesFrom)} accent="orange" />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <a href={waArea(area.name, o.med, av.label, slug)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-bold text-white shadow-[var(--shadow-glow)]" style={{ background: "oklch(0.62 0.14 155)" }}>
              <WhatsAppIcon className="w-4 h-4" /> WhatsApp expert
            </a>
            <a href={GHARPAYY_BOOK_URL} target="_blank" rel="noreferrer" className="inline-flex items-center px-4 py-2.5 rounded-full text-sm font-bold text-white" style={{ background: "var(--gradient-orange)" }}>
              📅 Book a tour
            </a>
            <a href={`tel:+${WA_NUMBERS[desk]}`} className="inline-flex items-center px-4 py-2.5 rounded-full text-sm font-bold border-2 border-primary/30 bg-card">📞 Call</a>
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground">Routes to: <span className="font-semibold text-foreground">{deskLabel(desk)}</span></div>
        </div>
      </section>

      {/* Vs market */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 w-full">
        <div className="text-[11px] uppercase tracking-widest text-primary font-bold">Honest pricing</div>
        <h2 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight">Gharpayy vs the {area.name} market</h2>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <Compare label="Private room" gp={privateFrom} mkt={area.by_bhk?.["1"]?.med ?? o.med} />
          <Compare label="1 BHK Home" gp={homesFrom} mkt={area.by_bhk?.["1"]?.med ?? o.med} />
          <Compare label="2 BHK Home" gp={Math.max(32000, Math.round((area.by_bhk?.["2"]?.med ?? o.med) * 0.85 / 1000) * 1000)} mkt={area.by_bhk?.["2"]?.med ?? o.med} />
        </div>
      </section>

      {/* Sample rooms (synthetic placeholders, real photos slot later) */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 w-full">
        <div className="text-[11px] uppercase tracking-widest text-primary font-bold">Sample stays</div>
        <h2 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight">3 ways to live in {area.name}</h2>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <SampleCard kind="Shared room" emoji="🛋️" from={sharedFrom} desc="Twin sharing, meals, Wi-Fi, weekly housekeeping." cta={waArea(area.name, sharedFrom, "shared", slug)} />
          <SampleCard kind="Private room" emoji="🛏️" from={privateFrom} desc="Single occupancy, attached bath, meals optional." cta={waArea(area.name, privateFrom, "private", slug)} />
          <SampleCard kind="Gharpayy Home" emoji="🏡" from={homesFrom} desc="Furnished 1 BHK, gated society, 7-day move-in." cta={waHomes({ area: area.name })} />
        </div>
      </section>

      {/* Persona match */}
      {personasForArea(slug).length > 0 && (
        <section className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 w-full">
          <div className="text-[11px] uppercase tracking-widest text-primary font-bold">Best fit</div>
          <h2 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight">{area.name} suits…</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {personasForArea(slug).map((p) => (
              <div key={p.id} className="px-3 py-1.5 rounded-full text-xs font-semibold border bg-card">
                {p.emoji} {p.title}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Cross-link to insights area page */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12 w-full">
        <div className="rounded-2xl border p-6 md:p-8 text-center" style={{ background: "var(--gradient-orange)" }}>
          <h3 className="text-xl md:text-2xl font-bold text-white">Want the full {area.name} rent picture?</h3>
          <p className="mt-2 text-sm text-white/85">All BHKs, top societies, commute, demand, FAQ.</p>
          <Link to="/area/$slug" params={{ slug }} className="inline-block mt-4 px-5 py-2.5 rounded-full bg-white text-ink font-semibold text-sm">
            Open {area.name} Insights →
          </Link>
        </div>
      </section>

      <Footer />
      <MobileBottomBar variant="gharpayy" slug={slug} context={`I want a Gharpayy stay in ${area.name}`} />
    </div>
  );
}

function Tile({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className={`rounded-xl border p-3 md:p-4 ${accent === "orange" ? "bg-primary/5 border-primary/30" : "bg-card"}`}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{label}</div>
      <div className="mt-1 text-lg md:text-xl num font-bold text-primary">{value}</div>
    </div>
  );
}

function Compare({ label, gp, mkt }: { label: string; gp: number; mkt: number }) {
  const diff = Math.round(((mkt - gp) / Math.max(mkt, 1)) * 100);
  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">{label}</div>
      <div className="mt-2 flex items-baseline justify-between">
        <div>
          <div className="text-[10px] text-muted-foreground">Gharpayy</div>
          <div className="text-xl num font-bold text-primary">{inr(gp)}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-muted-foreground">Local median</div>
          <div className="text-base num font-semibold text-muted-foreground line-through">{inr(mkt)}</div>
        </div>
      </div>
      {diff > 0 && <div className="mt-2 text-[11px] font-bold text-[oklch(0.55_0.18_150)]">↓ {diff}% below market</div>}
    </div>
  );
}

function SampleCard({ kind, emoji, from, desc, cta }: { kind: string; emoji: string; from: number; desc: string; cta: string }) {
  return (
    <div className="rounded-2xl border bg-card p-5 flex flex-col">
      <div className="text-3xl">{emoji}</div>
      <div className="mt-3 font-bold text-ink">{kind}</div>
      <div className="text-xs text-muted-foreground mt-1 flex-1">{desc}</div>
      <div className="mt-3 text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Starts at</div>
      <div className="text-2xl num font-bold text-primary">{inr(from)}<span className="text-xs text-muted-foreground font-normal">/mo</span></div>
      <a href={cta} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold text-white" style={{ background: "var(--gradient-orange)" }}>
        WhatsApp →
      </a>
    </div>
  );
}
