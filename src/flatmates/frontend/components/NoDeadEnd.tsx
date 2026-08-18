// @ts-nocheck
/**
 * NO DEAD ENDS — the empty state is a resolution engine, never a shrug.
 * Diagnoses the binding constraint and offers concrete next moves.
 */
import { Link } from "wouter";
import { useMemo } from "react";
import { ArrowRight, Compass } from "lucide-react";
import { WhatsAppHelp } from "@/flatmates/frontend/components/WhatsAppHelp";
import { defaultRequirement, rankVacancies, resolveNoResults } from "@/flatmates/backend/services/ranking";
import { canonicalGraph } from "@/flatmates/backend/services/canonical";

const inr = (n: number) => "₹" + Number(n || 0).toLocaleString("en-IN");

const BINDING_LABEL: Record<string, string> = {
  price: "Price is what's blocking you",
  date: "Your move-in window is too narrow",
  location: "Your zone selection is too tight",
  roomType: "Room type is limiting supply",
  eligibility: "Household constraints are limiting supply",
  supply: "There isn't enough live inventory here yet",
};

export function NoDeadEnd({ me = {}, filters = {}, onReset, module = "Discover" }: any) {
  const { binding, options, nearMisses } = useMemo(() => {
    const graph = canonicalGraph();
    const req = { ...defaultRequirement(me), ...(filters.city ? { city: filters.city } : {}), ...(filters.areas?.length ? { areas: filters.areas } : {}) };
    const ranked = rankVacancies(req, graph);
    return resolveNoResults(req, ranked, graph);
  }, [me, filters]);

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary">No dead ends</p>
      <h3 className="font-display text-lg font-semibold tracking-tight mt-1">{BINDING_LABEL[binding] || BINDING_LABEL.supply}</h3>
      <p className="text-sm text-muted-foreground mt-1">
        We don't show a blank page. Here is exactly what unlocks homes for you right now.
      </p>

      {nearMisses.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold mb-2">Closest live homes</p>
          <div className="space-y-2">
            {nearMisses.slice(0, 3).map((v: any) => (
              <Link key={v.id} href={v.detailHref} className="flex items-center gap-3 rounded-xl border border-border p-3 hover:border-primary transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{v.title}</p>
                  <p className="text-[11px] text-muted-foreground">{v.area} · total {inr(v.totalMonthly)}/mo · deposit {inr(v.depositAmount)}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 space-y-2">
        {options.map((o: any) => (
          <div key={o.key} className="rounded-xl border border-border p-3">
            <p className="text-sm font-semibold">{o.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{o.body}</p>
            {o.href ? (
              <Link href={o.href} className="inline-flex items-center gap-1 text-xs font-semibold text-primary mt-2">{o.cta} <ArrowRight className="w-3 h-3" /></Link>
            ) : (
              <WhatsAppHelp module={module} action={`No results — binding constraint: ${binding}`} city={filters.city} area={filters.areas?.[0]} label={o.cta} className="mt-2 h-9 text-xs" />
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        {onReset && <button onClick={onReset} className="h-10 px-4 rounded-xl border border-border text-sm font-semibold">Reset filters</button>}
        <Link href="/flatmates/discover" className="h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold inline-flex items-center gap-1.5"><Compass className="w-4 h-4" /> Browse everything</Link>
      </div>
    </div>
  );
}
