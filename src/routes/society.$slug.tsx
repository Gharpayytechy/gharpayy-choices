import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Header, WhatsAppIcon } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileBottomBar } from "@/components/MobileBottomBar";
import { ALL_AREAS, topSocietyData } from "@/lib/insights-utils";
import { inr } from "@/lib/format";
import { waListing } from "@/lib/wa";

export const Route = createFileRoute("/society/$slug")({
  loader: ({ params }) => {
    const decoded = decodeURIComponent(params.slug);
    const [areaSlug, ...societyParts] = decoded.split("__");
    const area = (ALL_AREAS as any)[areaSlug];
    if (!area) throw notFound();
    const societySlug = societyParts.join("__");
    const soc = topSocietyData(area).find((s) => s.s.toLowerCase().replace(/[^a-z0-9]+/g, "-") === societySlug);
    if (!soc) throw notFound();
    const matching = (area.listings ?? []).filter((l: any) => l.s === soc.s);
    return { area, areaSlug, soc, matching };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.soc.s} · ${loaderData?.area.name} rents · Gharpayy` },
      { name: "description", content: `${loaderData?.soc.n} verified rents at ${loaderData?.soc.s}, ${loaderData?.area.name}. Avg ₹${loaderData?.soc.avg.toLocaleString("en-IN")}.` },
    ],
  }),
  notFoundComponent: () => <div className="p-10 text-center"><h1 className="text-2xl font-bold">Society not found</h1><Link to="/areas" className="text-primary">← All hubs</Link></div>,
  errorComponent: ({ error }) => <div className="p-8">{error.message}</div>,
  component: SocietyPage,
});

function SocietyPage() {
  const { area, areaSlug, soc, matching } = Route.useLoaderData();
  return (
    <div className="min-h-screen flex flex-col pb-28 md:pb-0">
      <Header />
      <section className="border-b" style={{ background: "var(--gradient-hero)" }}>
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
          <div className="text-xs text-muted-foreground mb-2">
            <Link to="/areas" className="hover:text-primary">Areas</Link> ·{" "}
            <Link to="/area/$slug" params={{ slug: areaSlug }} className="hover:text-primary">{area.name}</Link>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">{soc.s}</h1>
          <p className="mt-2 text-sm text-muted-foreground">In {area.name} · {soc.n} verified rents tracked.</p>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
            <Stat k="Average" v={inr(soc.avg)} />
            <Stat k="Lowest" v={inr(soc.min)} />
            <Stat k="Highest" v={inr(soc.max)} />
            <Stat k="Pins" v={soc.n.toString()} />
          </div>
          <a href={waListing({ area: area.name, society: soc.s, slug: areaSlug })} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 px-5 py-3 rounded-full font-bold text-white text-sm" style={{ background: "oklch(0.62 0.14 155)" }}>
            <WhatsAppIcon className="w-4 h-4" /> Ask expert about {soc.s}
          </a>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 md:px-6 py-7 w-full">
        <h2 className="text-xl md:text-2xl font-bold">Verified rents in this society</h2>
        <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {matching.map((l: any, i: number) => (
            <div key={i} className="rounded-xl border bg-card p-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold text-primary">{l.b} BHK</span>
                <span className="text-base num font-bold text-ink">{inr(l.r)}</span>
              </div>
              {l.sq && <div className="text-[11px] text-muted-foreground num">{l.sq} sqft</div>}
              {l.fb && <div className="mt-1 text-[11px] text-muted-foreground italic line-clamp-3">"{l.fb}"</div>}
            </div>
          ))}
        </div>
      </section>

      <Footer />
      <MobileBottomBar variant="area" slug={areaSlug} areaName={area.name} med={soc.avg} />
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return <div className="rounded-xl border bg-card p-3"><div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{k}</div><div className="mt-0.5 text-lg num font-bold text-ink">{v}</div></div>;
}
