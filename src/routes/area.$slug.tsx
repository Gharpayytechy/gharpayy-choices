import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { lazy, Suspense, useState } from "react";
import { Header, WhatsAppIcon } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ListingCard } from "@/components/ListingCard";
import { MobileBottomBar } from "@/components/MobileBottomBar";
import { useRentForm } from "@/components/RentFormProvider";
import data from "@/data/insights.json";
import { inr } from "@/lib/format";
import { waArea, waListing, waPersona, GHARPAYY_BOOK_URL, deskFor, deskLabel, WA_NUMBERS } from "@/lib/wa";
import { AREAS, AREA_BY_SLUG, AVAIL_META } from "@/lib/areas-meta";
import { ctxFor, EMPLOYERS } from "@/lib/area-context";
import { personasForArea } from "@/lib/personas";
import { AreaSnapshot, BestValueInArea, TenantQuotes } from "@/components/insights/AreaSnapshot";
import { AreaPersonaFit } from "@/components/insights/AreaPersonaFit";
import { NegotiationCoach } from "@/components/insights/NegotiationCoach";
import { RentVerdict2 } from "@/components/insights/RentVerdict2";
import { SocietyDeepList } from "@/components/insights/SocietyDeepList";
import { DepositCalc } from "@/components/insights/DepositCalc";
import { HiddenCosts } from "@/components/insights/HiddenCosts";
import { BrokerVsDirect } from "@/components/insights/BrokerVsDirect";
import { TourSlots } from "@/components/insights/TourSlots";
import { ContextualReferCTA } from "@/components/insights/ContextualReferCTA";

const InsightsMap = lazy(() => import("@/components/InsightsMap").then((m) => ({ default: m.InsightsMap })));

export const Route = createFileRoute("/area/$slug")({
  loader: ({ params }) => {
    const area = (data.areas as Record<string, any>)[params.slug];
    if (!area) throw notFound();
    return { area, slug: params.slug };
  },
  head: ({ loaderData }) => {
    const a = loaderData?.area;
    return {
      meta: [
        { title: `${a?.name} rent guide · Median ₹${(a?.overall.med / 1000).toFixed(0)}k · Gharpayy Insights` },
        { name: "description", content: `Median rent in ${a?.name}: ${inr(a?.overall.med)}. ${a?.count} verified pins, ${a?.seekers} active flat-hunters. Compare BHKs, see Gharpayy availability, chat the expert.` },
        { property: "og:title", content: `${a?.name} rent prices · Gharpayy Insights` },
        { property: "og:description", content: `${a?.count} verified rents in ${a?.name}. Median ${inr(a?.overall.med)}.` },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Place",
            name: a?.name,
            address: { "@type": "PostalAddress", addressLocality: a?.name, addressRegion: "Karnataka", addressCountry: "IN" },
            geo: { "@type": "GeoCoordinates", latitude: a?.lat, longitude: a?.lng },
          }),
        },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center"><div className="text-center"><h1 className="text-3xl font-bold">Area not found</h1><Link to="/areas" className="text-primary mt-3 inline-block">← All areas</Link></div></div>
  ),
  errorComponent: ({ error }) => <div className="p-8 text-destructive">{error.message}</div>,
  component: AreaPage,
});

function AreaPage() {
  const { area, slug } = Route.useLoaderData();
  const meta = AREA_BY_SLUG[slug];
  const ctx = ctxFor(slug, area.name);
  const o = area.overall;
  const av = meta ? AVAIL_META[meta.avail] : AVAIL_META.low;
  const desk = deskFor(slug);

  return (
    <div className="min-h-screen flex flex-col pb-24 md:pb-0">
      <Header />

      {/* 1. HERO */}
      <section className="border-b" style={{ background: "var(--gradient-hero)" }}>
        <div className="max-w-6xl mx-auto px-4 md:px-6 pt-6 md:pt-12 pb-8 md:pb-12">
          <div className="text-xs text-muted-foreground mb-3">
            <Link to="/" className="hover:text-primary">Insights</Link> ·{" "}
            <Link to="/areas" className="hover:text-primary">Areas</Link> ·{" "}
            <span className="text-foreground font-medium">{area.name}</span>
          </div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-ink">{area.name}</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold text-white" style={{ background: av.color }}>
                  {av.dot} Gharpayy {av.label}
                </span>
              </div>
              <p className="mt-2 text-sm md:text-base text-muted-foreground max-w-2xl">{ctx.blurb}</p>
              <div className="mt-2 text-xs text-muted-foreground">{ctx.vibe} · {ctx.metro} · {ctx.metroKm} km</div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            <Stat label="Median rent" value={inr(o.med)} sub={`${inr(o.p25)}–${inr(o.p75)}`} accent />
            <Stat label="1 BHK median" value={area.by_bhk?.["1"]?.med ? inr(area.by_bhk["1"].med) : "-"} sub={`${area.by_bhk?.["1"]?.n ?? 0} pins`} />
            <Stat label="2 BHK median" value={area.by_bhk?.["2"]?.med ? inr(area.by_bhk["2"].med) : "-"} sub={`${area.by_bhk?.["2"]?.n ?? 0} pins`} />
            <Stat label="Demand" value={`${area.demand_score?.toFixed(2)}×`} sub={`${area.seekers} seekers`} />
          </div>

          {/* CTAs */}
          <div className="mt-5 flex flex-wrap gap-2">
            <a href={waArea(area.name, o.med, av.label, slug)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-bold text-white shadow-[var(--shadow-glow)]" style={{ background: "oklch(0.62 0.14 155)" }}>
              <WhatsAppIcon className="w-4 h-4" /> {deskLabel(desk).split(" ")[0]} expert
            </a>
            <a href={GHARPAYY_BOOK_URL} target="_blank" rel="noreferrer" className="inline-flex items-center px-4 py-2.5 rounded-full text-sm font-bold text-white" style={{ background: "var(--gradient-orange)" }}>
              📅 Book a tour
            </a>
            <Link to="/gharpayy/area/$slug" params={{ slug }} className="inline-flex items-center px-4 py-2.5 rounded-full text-sm font-semibold border-2 border-primary/30 text-primary bg-primary/5">
              Gharpayy in {area.name} →
            </Link>
          </div>
        </div>
      </section>

      {/* AREA SNAPSHOT · 12 metrics */}
      <AreaSnapshot area={area} />

      {/* PG ↔ FLAT · the centerpiece for this area */}
      <PgFlatSplit area={area} slug={slug} />

      {/* RENT VERDICT for this area */}
      <RentVerdict2 defaultArea={slug} />

      {/* NEGOTIATION COACH */}
      <NegotiationCoach defaultArea={slug} />

      {/* UPGRADE LADDER for this area */}
      <AreaUpgradeLadder area={area} slug={slug} />

      {/* 2. MINI MAP */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 w-full">
        <SectionHead eyebrow="On the map" title={`Where ${area.name} sits`} />
        <div className="mt-3 relative rounded-2xl overflow-hidden border shadow-[var(--shadow-card)]" style={{ height: "min(50vh, 380px)" }}>
          <Suspense fallback={<div className="absolute inset-0 bg-card animate-pulse" />}>
            <InsightsMap />
          </Suspense>
          <Link to="/map" className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-background/95 backdrop-blur border text-xs font-bold shadow">⛶ Full map</Link>
        </div>
      </section>

      {/* 3. PRICING BY BHK */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 w-full">
        <SectionHead eyebrow="Pricing depth" title={`What ${area.name} actually pays, by BHK`} sub={`${area.count} verified rents · p25 / median / p75 percentiles`} />
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          {(["1", "2", "3", "4"] as const).map((b) => {
            const v = area.by_bhk[b];
            return (
              <div key={b} className={`rounded-2xl p-4 border ${v ? "bg-primary/5 border-primary/20" : "bg-secondary border-border opacity-60"}`}>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{b} BHK</div>
                {v ? (
                  <>
                    <div className="mt-1 text-xl md:text-2xl num font-bold text-ink">{inr(v.med)}</div>
                    <div className="text-[10px] text-muted-foreground num">{inr(v.p25)}–{inr(v.p75)} · {v.n} pins</div>
                    <Bar pct={Math.min(100, (v.med / Math.max(o.max, 1)) * 100)} />
                  </>
                ) : (
                  <div className="mt-1 text-xs text-muted-foreground">No data yet</div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. FURNISHED vs UNFURNISHED */}
      {area.furnished && area.unfurnished && (
        <section className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 w-full">
          <SectionHead eyebrow="Furnished premium" title="Furnished vs unfurnished" sub={`${area.name} owners ask roughly ${Math.round(((area.furnished.med - area.unfurnished.med) / Math.max(area.unfurnished.med, 1)) * 100)}% more for furnished.`} />
          <div className="mt-4 grid grid-cols-2 gap-2 md:gap-3">
            <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-4">
              <div className="text-[10px] uppercase tracking-wider text-primary font-bold">Furnished</div>
              <div className="mt-1 text-xl md:text-2xl num font-bold text-ink">{inr(area.furnished.med)}</div>
              <div className="text-[10px] text-muted-foreground num">{area.furnished.n} pins</div>
            </div>
            <div className="rounded-2xl border bg-card p-4">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Unfurnished</div>
              <div className="mt-1 text-xl md:text-2xl num font-bold text-ink">{inr(area.unfurnished.med)}</div>
              <div className="text-[10px] text-muted-foreground num">{area.unfurnished.n} pins</div>
            </div>
          </div>
        </section>
      )}

      {/* BEST VALUE in this area */}
      <BestValueInArea area={area} />

      {/* 5. TOP SOCIETIES (legacy quick grid) */}
      {area.top_societies?.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 w-full">
          <SectionHead eyebrow="Inside the gates" title={`Most-pinned societies in ${area.name}`} />
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {area.top_societies.slice(0, 6).map((s: string, i: number) => (
              <a
                key={i}
                href={waListing({ area: area.name, society: s, slug })}
                target="_blank" rel="noreferrer"
                className="rounded-2xl border bg-card hover:border-primary/40 hover:bg-primary/5 transition p-4 flex items-center gap-3"
              >
                <span className="w-10 h-10 rounded-xl grid place-items-center text-lg font-bold text-white" style={{ background: "var(--gradient-orange)" }}>{s.charAt(0)}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-ink truncate">{s}</div>
                  <div className="text-[11px] text-muted-foreground">Ask expert about availability →</div>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* SOCIETY DEEP DIVE */}
      <SocietyDeepList area={area} slug={slug} />

      {/* TENANT QUOTES */}
      <TenantQuotes area={area} />

      {/* PERSONA FIT */}
      <AreaPersonaFit slug={slug} />

      {/* 6. COMMUTE */}
      {Object.keys(ctx.commute).length > 0 && (
        <section className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 w-full">
          <SectionHead eyebrow="Commute reality" title={`From ${area.name} to…`} sub="Driving minutes in non-peak traffic." />
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {Object.entries(ctx.commute).map(([k, mins]) => (
              <div key={k} className="rounded-xl border bg-card p-3">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold truncate">{EMPLOYERS[k as keyof typeof EMPLOYERS]}</div>
                <div className="mt-1 text-lg num font-bold text-ink">{mins}<span className="text-xs text-muted-foreground font-normal"> min</span></div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. WHO LIVES HERE */}
      {personasForArea(slug).length > 0 && (
        <section className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 w-full">
          <SectionHead eyebrow="Who lives here" title={`${area.name} is loved by…`} />
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {personasForArea(slug).slice(0, 4).map((p) => (
              <a key={p.id} href={waPersona(p.title, area.name)} target="_blank" rel="noreferrer" className="rounded-2xl border bg-card hover:border-primary/40 transition p-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{p.emoji}</span>
                  <div>
                    <div className="font-bold text-sm text-ink">{p.title}</div>
                    <div className="text-[11px] text-muted-foreground">Budget ₹{(p.budget[0] / 1000).toFixed(0)}–{(p.budget[1] / 1000).toFixed(0)}k · {p.bhk}</div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">{p.short}</div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* 8. GHARPAYY IN THIS AREA */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 w-full">
        <div className="rounded-3xl border-2 border-primary/30 p-5 md:p-8 grid md:grid-cols-[1.4fr_1fr] gap-5 items-center" style={{ background: "var(--gradient-hero)" }}>
          <div>
            <div className="text-[11px] uppercase tracking-widest text-primary font-bold">Gharpayy in {area.name}</div>
            <h3 className="mt-1 text-xl md:text-2xl font-bold text-ink leading-tight">
              {av.dot} <span className="text-primary">{av.label}</span> · {av.desc.toLowerCase()}.
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              You'll be talking to the <span className="font-semibold text-foreground">{deskLabel(desk)}</span> · a real human who knows every building, gate-pass rule, and water tanker schedule in {area.name}.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={waArea(area.name, o.med, av.label, slug)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-bold text-white" style={{ background: "oklch(0.62 0.14 155)" }}>
                <WhatsAppIcon className="w-3.5 h-3.5" /> WhatsApp expert
              </a>
              <a href={`tel:+${WA_NUMBERS[desk]}`} className="inline-flex items-center px-4 py-2.5 rounded-full text-sm font-bold border-2 border-primary/30 bg-card">
                📞 Call now
              </a>
            </div>
          </div>
          <ul className="text-sm space-y-2 bg-card/80 backdrop-blur rounded-2xl p-4 border">
            <li className="flex justify-between"><span className="text-muted-foreground">Channel</span><span className="font-bold num">Direct to owner</span></li>
            <li className="flex justify-between"><span className="text-muted-foreground">Deposit</span><span className="font-bold num">1–2 mo</span></li>
            <li className="flex justify-between"><span className="text-muted-foreground">Move-in</span><span className="font-bold num">3–7 days</span></li>
            <li className="flex justify-between"><span className="text-muted-foreground">Starts at</span><span className="font-bold num text-primary">₹9,500/mo</span></li>
          </ul>
        </div>
      </section>

      {/* CAPTAIN CARD + MOVE-IN CHECKLIST */}
      <CaptainAndChecklist area={area} slug={slug} />

      {/* TOUR SLOTS today */}
      <TourSlots />

      {/* DEPOSIT + HIDDEN COSTS + BROKER vs DIRECT for this area */}
      <DepositCalc defaultMed={o.med} />
      <HiddenCosts med={o.med} />
      <BrokerVsDirect />

      {/* Refer & Earn · area-aware, persona-aware */}
      <ContextualReferCTA context={{ area: slug, source: `area:${slug}` }} />

      {/* 9. RECENT LISTINGS */}
      {area.listings?.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 w-full">
          <div className="flex items-end justify-between mb-3">
            <SectionHead eyebrow="Verified rents" title={`Recent pins in ${area.name}`} />
            <Link to="/listings" className="text-xs font-semibold text-primary hover:underline">All listings →</Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {area.listings.slice(0, 6).map((p: any, i: number) => (
              <ListingCard key={i} p={{ ...p, area: area.name }} />
            ))}
          </div>
        </section>
      )}

      {/* 10. ADD YOUR RENT BAND */}
      <AddRentBand area={area.name} />

      {/* 11. NEARBY AREAS */}
      {ctx.nearby.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 w-full">
          <SectionHead eyebrow="People also explored" title={`Areas near ${area.name}`} />
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            {ctx.nearby.map((s) => {
              const n = AREA_BY_SLUG[s];
              if (!n) return null;
              return (
                <Link key={s} to="/area/$slug" params={{ slug: s }} className="rounded-2xl border bg-card hover:border-primary/40 hover:bg-primary/5 transition p-3">
                  <div className="font-bold text-sm text-ink truncate">{n.name}</div>
                  <div className="text-[11px] text-muted-foreground num">{inr(n.med)} median · {n.count} pins</div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* 12. FAQ */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10 w-full">
        <SectionHead eyebrow="Honest answers" title={`FAQ · renting in ${area.name}`} />
        <div className="mt-4 grid md:grid-cols-2 gap-2.5">
          {ctx.faqs.map((f, i) => <Faq key={i} {...f} />)}
        </div>
      </section>

      {/* 13. COMPARE CTA */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-12 w-full">
        <div className="rounded-2xl border p-6 md:p-8 text-center" style={{ background: "var(--gradient-orange)" }}>
          <h3 className="text-xl md:text-2xl font-bold text-white">Compare {area.name} with another area</h3>
          <Link to="/compare" search={{ a: slug } as any} className="inline-block mt-3 px-5 py-2.5 rounded-full bg-white text-ink font-semibold text-sm">Open compare tool →</Link>
        </div>
      </section>

      <Footer />
      <MobileBottomBar variant="area" slug={slug} context={`I'm looking in ${area.name}`} areaName={area.name} med={o.med} />
    </div>
  );
}

/* ─────── new modules ─────── */

function PgFlatSplit({ area, slug }: { area: any; slug: string }) {
  // Synthetic hub-aware PG ratio: high-availability hubs lean PG-heavy.
  const meta = AREA_BY_SLUG[slug];
  const av = meta?.avail ?? "low";
  const pgPct = av === "high" ? 62 : av === "medium" ? 48 : av === "low" ? 32 : 25;
  const flatPct = 100 - pgPct;
  const sharedFrom = Math.max(6500, Math.round((area.overall.med * 0.18) / 500) * 500);
  const privateFrom = Math.max(9500, Math.round((area.overall.med * 0.28) / 500) * 500);
  const flatFrom = area.by_bhk?.["1"]?.med ?? area.overall.med;
  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 w-full">
      <SectionHead eyebrow="PG vs Flat" title={`How ${area.name} actually rents`} sub={`Roughly ${pgPct}% of new tenants pick a PG, ${flatPct}% pick a flat. Both available via Gharpayy.`} />
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold text-ink">🛏️ PG · move this week</div>
            <div className="text-xs font-bold num text-primary">{pgPct}%</div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg bg-card p-2 border">
              <div className="text-[10px] text-muted-foreground">Shared from</div>
              <div className="num font-bold text-ink">{inr(sharedFrom)}</div>
            </div>
            <div className="rounded-lg bg-card p-2 border">
              <div className="text-[10px] text-muted-foreground">Private from</div>
              <div className="num font-bold text-ink">{inr(privateFrom)}</div>
            </div>
          </div>
          <a href={waArea(area.name, sharedFrom, "PG", slug)} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-full text-xs font-bold text-white w-full" style={{ background: "oklch(0.62 0.14 155)" }}>
            <WhatsAppIcon className="w-3.5 h-3.5" /> WhatsApp PG expert
          </a>
        </div>
        <div className="rounded-2xl border bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold text-ink">🏡 Flat · in 7 days</div>
            <div className="text-xs font-bold num text-muted-foreground">{flatPct}%</div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg bg-secondary p-2 border">
              <div className="text-[10px] text-muted-foreground">1 BHK median</div>
              <div className="num font-bold text-ink">{inr(flatFrom)}</div>
            </div>
            <div className="rounded-lg bg-secondary p-2 border">
              <div className="text-[10px] text-muted-foreground">Channel</div>
              <div className="num font-bold text-primary">Direct</div>
            </div>
          </div>
          <a href={GHARPAYY_BOOK_URL} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-full text-xs font-bold text-white w-full" style={{ background: "var(--gradient-orange)" }}>
            📅 Tour a managed home
          </a>
        </div>
      </div>
    </section>
  );
}

function AreaUpgradeLadder({ area, slug }: { area: any; slug: string }) {
  const o = area.overall;
  const rungs = [
    { label: "Shared PG", from: Math.max(6500, Math.round((o.med * 0.18) / 500) * 500), sub: "Move this week" },
    { label: "Private PG", from: Math.max(9500, Math.round((o.med * 0.28) / 500) * 500), sub: "Single room" },
    { label: "1 BHK Home", from: area.by_bhk?.["1"]?.med ?? Math.max(25000, o.med), sub: "Managed flat" },
    { label: "2 BHK Home", from: area.by_bhk?.["2"]?.med ?? Math.max(32000, o.med * 1.5), sub: "Spacious" },
  ];
  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 w-full">
      <div className="rounded-3xl border-2 border-primary/20 p-4 md:p-6" style={{ background: "var(--gradient-hero)" }}>
        <div className="text-[11px] uppercase tracking-widest text-primary font-bold">Upgrade path in {area.name}</div>
        <h3 className="mt-1 text-lg md:text-2xl font-bold tracking-tight text-ink">Start at {inr(rungs[0].from)}, scale to {inr(rungs[3].from)} · same expert.</h3>
        <div className="mt-4 -mx-2 px-2 overflow-x-auto">
          <div className="flex items-end gap-2 min-w-max">
            {rungs.map((r, i) => (
              <div key={r.label} className="flex items-end gap-2">
                <a href={waArea(area.name, r.from, r.label, slug)} target="_blank" rel="noreferrer" className="block min-w-[120px] rounded-2xl border bg-card/90 backdrop-blur p-3 hover:border-primary/40 transition">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Step {i + 1}</div>
                  <div className="mt-1 font-bold text-sm text-ink">{r.label}</div>
                  <div className="text-[11px] text-muted-foreground">{r.sub}</div>
                  <div className="mt-1.5 text-base num font-bold text-primary">{inr(r.from)}</div>
                </a>
                {i < rungs.length - 1 && <span className="pb-6 text-primary text-lg">→</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CaptainAndChecklist({ area, slug }: { area: any; slug: string }) {
  const desk = deskFor(slug);
  const steps = [
    { n: "1", t: "WhatsApp expert", d: "Share area, BHK, budget, move-in date" },
    { n: "2", t: "Get 3 verified options", d: "Photos, real rent, real address" },
    { n: "3", t: "Tour live or in-person", d: "Same day for PGs, 48h for flats" },
    { n: "4", t: "KYC + agreement", d: "We handle paperwork, deposit transfer" },
    { n: "5", t: "Move in", d: "Expert hands you keys + a tea" },
  ];
  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 w-full">
      <div className="grid md:grid-cols-2 gap-3">
        <div className="rounded-2xl border bg-card p-5">
          <div className="text-[11px] uppercase tracking-widest text-primary font-bold">Your expert</div>
          <h3 className="mt-1 text-lg md:text-xl font-bold text-ink">{deskLabel(desk)}</h3>
          <ul className="mt-3 space-y-1.5 text-sm">
            <li className="flex justify-between"><span className="text-muted-foreground">Speaks</span><span className="font-semibold">English · Hindi · Kannada</span></li>
            <li className="flex justify-between"><span className="text-muted-foreground">Avg reply</span><span className="font-semibold">&lt; 5 min on WhatsApp</span></li>
            <li className="flex justify-between"><span className="text-muted-foreground">Tours</span><span className="font-semibold">7 days a week</span></li>
            <li className="flex justify-between"><span className="text-muted-foreground">Knows</span><span className="font-semibold">{area.top_societies?.[0] ?? area.name} & nearby</span></li>
          </ul>
          <div className="mt-4 flex gap-2">
            <a href={waArea(area.name, area.overall.med, undefined, slug)} target="_blank" rel="noreferrer" className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-full text-xs font-bold text-white" style={{ background: "oklch(0.62 0.14 155)" }}>
              <WhatsAppIcon className="w-3.5 h-3.5" /> WhatsApp
            </a>
            <a href={`tel:+${WA_NUMBERS[desk]}`} className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-full text-xs font-bold border-2 border-primary/30 bg-primary/5 text-primary">
              📞 Call
            </a>
          </div>
        </div>
        <div className="rounded-2xl border bg-card p-5">
          <div className="text-[11px] uppercase tracking-widest text-primary font-bold">Move-in checklist</div>
          <h3 className="mt-1 text-lg md:text-xl font-bold text-ink">5 steps. We do most of them.</h3>
          <ol className="mt-3 space-y-2">
            {steps.map((s) => (
              <li key={s.n} className="flex items-start gap-2.5">
                <span className="mt-0.5 w-6 h-6 shrink-0 rounded-full grid place-items-center text-[11px] font-bold text-white" style={{ background: "var(--gradient-orange)" }}>
                  {s.n}
                </span>
                <div className="text-xs">
                  <div className="font-bold text-ink">{s.t}</div>
                  <div className="text-muted-foreground">{s.d}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div className={`rounded-xl border p-3 md:p-4 ${accent ? "bg-primary/5 border-primary/30" : "bg-card"}`}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{label}</div>
      <div className={`mt-1 text-xl md:text-2xl num font-bold ${accent ? "text-primary" : "text-ink"}`}>{value}</div>
      <div className="text-[10px] text-muted-foreground num">{sub}</div>
    </div>
  );
}

function SectionHead({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-widest text-primary font-bold">{eyebrow}</div>
      <h2 className="mt-1 text-xl md:text-2xl font-bold tracking-tight text-ink">{title}</h2>
      {sub && <p className="mt-1 text-sm text-muted-foreground">{sub}</p>}
    </div>
  );
}

function Bar({ pct }: { pct: number }) {
  return (
    <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--gradient-orange)" }} />
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button onClick={() => setOpen((v) => !v)} className="text-left rounded-2xl border bg-card hover:border-primary/40 p-4 transition">
      <div className="flex items-start gap-3">
        <div className="flex-1 font-semibold text-ink text-sm leading-tight">{q}</div>
        <span className={`text-primary text-xl leading-none transition-transform ${open ? "rotate-45" : ""}`}>+</span>
      </div>
      {open && <p className="mt-2 text-xs md:text-sm text-muted-foreground">{a}</p>}
    </button>
  );
}

function AddRentBand({ area }: { area: string }) {
  const { open } = useRentForm();
  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 w-full">
      <div className="rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-5">
        <span className="text-3xl">➕</span>
        <div className="flex-1">
          <div className="font-bold text-sm md:text-base text-ink">Pay rent in {area}? Add it anonymously.</div>
          <div className="text-xs text-muted-foreground mt-0.5">2 minutes. Helps your neighbours and future tenants negotiate honestly.</div>
        </div>
        <button onClick={() => open(area)} className="px-4 py-2.5 rounded-full text-sm font-bold text-white shadow-[var(--shadow-glow)] whitespace-nowrap" style={{ background: "var(--gradient-orange)" }}>
          Add my rent →
        </button>
      </div>
    </section>
  );
}
