import { useEffect, useState } from "react";
import { newListings } from "@/lib/insights-utils";
import { inr } from "@/lib/format";

export function NewListingsTicker() {
  const [items] = useState(() => newListings(12));
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % items.length), 2400);
    return () => clearInterval(t);
  }, [items.length]);
  const cur = items[i];

  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-3 w-full">
      <div className="flex items-center gap-3 rounded-full border bg-card px-3 py-2 shadow-[var(--shadow-card)] overflow-hidden">
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-primary font-bold flex-shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Live
        </div>
        <div className="text-xs text-muted-foreground truncate">
          New <span className="font-bold text-ink">{cur.b} BHK</span> in{" "}
          <span className="font-semibold text-ink">{cur.area}</span>
          {cur.s && <> · {cur.s}</>}
          {" · "}
          <span className="num font-bold text-primary">{inr(cur.r)}/mo</span>
          {cur.fb && <span className="text-muted-foreground"> · "{cur.fb.slice(0, 60)}…"</span>}
        </div>
      </div>
    </section>
  );
}
