import data from "@/data/insights.json";
import { inr } from "@/lib/format";
import { waSeeker } from "@/lib/wa";
import { WhatsAppIcon } from "./Header";

export function SeekerWall({ limit = 9 }: { limit?: number }) {
  const items = (data.seekers as any[]).slice(0, limit);
  return (
    <div>
      <div className="flex items-baseline justify-between mb-5">
        <div>
          <h3 className="text-lg font-semibold">Who's looking right now</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{data.stats.seekers.toLocaleString()} active flat-hunters across Bengaluru</p>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((s, i) => (
          <div key={i} className="rounded-xl border bg-card p-5 shadow-[var(--shadow-card)] hover:border-primary/30 transition flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase tracking-wider font-bold text-primary">
                {s.lf === "whole_flat" ? "Wants entire flat" : "Wants a room"}
              </span>
              <span className="num text-sm font-bold text-ink">{inr(s.b)}/mo</span>
            </div>
            {s.area && <div className="text-xs text-muted-foreground mb-2">📍 {s.area}</div>}
            <p className="text-sm text-foreground/85 leading-relaxed line-clamp-3 flex-1">{s.n}</p>
            <div className="mt-3 flex flex-wrap gap-1.5 text-[10px]">
              {s.bhk && s.bhk !== "any" && <span className="px-2 py-0.5 rounded-full bg-secondary num">{s.bhk} BHK</span>}
              {s.g && s.g !== "any" && <span className="px-2 py-0.5 rounded-full bg-secondary capitalize">{s.g}</span>}
              {s.food && s.food !== "any" && <span className="px-2 py-0.5 rounded-full bg-secondary capitalize">{s.food}</span>}
              {s.mv && <span className="px-2 py-0.5 rounded-full bg-secondary capitalize">{s.mv.replace("_", " ")}</span>}
            </div>
            <a
              href={waSeeker(s.n, s.area, s.b)}
              target="_blank" rel="noreferrer"
              className="mt-4 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white bg-[oklch(0.62_0.14_155)] hover:opacity-90"
            >
              <WhatsAppIcon className="w-3.5 h-3.5" /> Help via Gharpayy
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
