import { Link } from "@tanstack/react-router";
import { GHARPAYY_ZONES } from "@/lib/gharpayy-zones";
import { CHIPS } from "@/lib/gharpayy-brand";

/** Sticky strip of Gharpayy's 5 hero zones · shown on every public surface. */
export function ZoneSpine({ sticky = true, dense = false }: { sticky?: boolean; dense?: boolean }) {
  return (
    <div
      className={`${sticky ? "sticky top-[56px] z-30" : ""} bg-card/85 backdrop-blur border-y border-border/60`}
      data-testid="zone-spine"
    >
      <div className="max-w-7xl mx-auto px-3 md:px-5 py-2 flex items-center gap-2 overflow-x-auto">
        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mr-1 shrink-0">
          {CHIPS.verifiedZones}
        </span>
        {GHARPAYY_ZONES.map((z) => (
          <Link
            key={z.slug}
            to="/gharpayy/area/$slug"
            params={{ slug: z.slug }}
            className={`shrink-0 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background hover:border-primary/50 hover:bg-primary/5 transition ${
              dense ? "px-2.5 py-1 text-[11px]" : "px-3 py-1.5 text-xs"
            } font-bold text-foreground`}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: z.color }} />
            {z.display}
          </Link>
        ))}
      </div>
    </div>
  );
}
