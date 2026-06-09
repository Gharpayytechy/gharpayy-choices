import { useState } from "react";
import data from "@/data/insights.json";
import { inr } from "@/lib/format";

type BhkKey = "1" | "2" | "3" | "4";

export function FurnishedSplit() {
  const [bhk, setBhk] = useState<BhkKey>("2");
  const fbb = (data as any).furnished_by_bhk as Record<string, { fu_n: number; un_n: number; fu_med: number; un_med: number; fu_avg: number; un_avg: number }>;
  const row = fbb[bhk];
  const total = row.fu_n + row.un_n;
  const fuPct = Math.round((row.fu_n / total) * 100);
  const premium = Math.round(((row.fu_med - row.un_med) / row.un_med) * 100);
  const diff = row.fu_med - row.un_med;

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="text-lg font-semibold">Furnished vs unfurnished</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Real premium for keys-in-hand · switch BHK to compare</p>
        </div>
        <div className="flex gap-1 rounded-full bg-secondary p-1">
          {(["1", "2", "3", "4"] as BhkKey[]).map((b) => (
            <button
              key={b}
              onClick={() => setBhk(b)}
              className={`px-3 py-1 text-xs rounded-full transition ${bhk === b ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground hover:text-foreground"}`}
            >
              {b} BHK
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 h-3 rounded-full overflow-hidden flex">
        <div style={{ width: `${fuPct}%`, background: "var(--gradient-orange)" }} />
        <div style={{ width: `${100 - fuPct}%` }} className="bg-secondary border-l border-border" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
          <div className="text-xs uppercase tracking-wider text-primary font-semibold">Furnished · {bhk} BHK</div>
          <div className="mt-1 text-2xl num font-bold text-ink">{inr(row.fu_med)}</div>
          <div className="text-xs text-muted-foreground mt-0.5">median · <span className="num">{row.fu_n}</span> pins ({fuPct}%)</div>
        </div>
        <div className="p-4 rounded-xl bg-secondary border">
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Unfurnished · {bhk} BHK</div>
          <div className="mt-1 text-2xl num font-bold text-ink">{inr(row.un_med)}</div>
          <div className="text-xs text-muted-foreground mt-0.5">median · <span className="num">{row.un_n}</span> pins ({100 - fuPct}%)</div>
        </div>
      </div>

      <div className="mt-4 p-3 rounded-lg bg-secondary/50 text-sm flex items-center gap-2 flex-wrap">
        <span className="px-2 py-0.5 rounded-md bg-[oklch(0.62_0.14_155)/0.12] text-[oklch(0.45_0.14_155)] font-semibold text-xs num">+{premium}%</span>
        <span className="text-muted-foreground">
          Furnished {bhk} BHK costs <span className="num font-semibold text-foreground">{inr(diff)}/mo</span> more than unfurnished · that's <span className="num font-semibold text-foreground">{inr(diff * 12)}</span> a year.
        </span>
      </div>
    </div>
  );
}
