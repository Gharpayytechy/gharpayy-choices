import { Link } from "@tanstack/react-router";
import { ALL_AREA_LIST } from "@/lib/insights-utils";
import { inr } from "@/lib/format";

export function PriceLeaders() {
  const cheapest = [...ALL_AREA_LIST].sort((a: any, b: any) => a.overall.med - b.overall.med).slice(0, 4);
  const premium = [...ALL_AREA_LIST].sort((a: any, b: any) => b.overall.med - a.overall.med).slice(0, 4);
  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-7 w-full grid md:grid-cols-2 gap-4">
      <div>
        <div className="text-[11px] uppercase tracking-widest text-success font-bold">Most affordable 💸</div>
        <h3 className="mt-1 text-lg md:text-xl font-bold">Cheapest hubs right now</h3>
        <div className="mt-3 space-y-2">
          {cheapest.map((a: any) => <Row key={a.slug} a={a} accent="good" />)}
        </div>
      </div>
      <div>
        <div className="text-[11px] uppercase tracking-widest text-primary font-bold">Premium 💎</div>
        <h3 className="mt-1 text-lg md:text-xl font-bold">Where rents top out</h3>
        <div className="mt-3 space-y-2">
          {premium.map((a: any) => <Row key={a.slug} a={a} />)}
        </div>
      </div>
    </section>
  );
}
function Row({ a, accent }: { a: any; accent?: "good" }) {
  return (
    <Link to="/area/$slug" params={{ slug: a.slug }} className="flex items-center justify-between p-3 rounded-xl border bg-card hover:border-primary/40 transition">
      <div className="text-sm font-bold text-ink truncate">{a.name}</div>
      <div className={`text-sm num font-bold ${accent === "good" ? "text-success" : "text-primary"}`}>{inr(a.overall.med)}</div>
    </Link>
  );
}
