import { useEffect, useState } from "react";
import { loadSubmissions } from "./AddRentForm";
import { useRentForm } from "./RentFormProvider";
import { inr } from "@/lib/format";
import data from "@/data/insights.json";

// Live anonymized feed of newly-pinned rents. Mixes user submissions with
// recent seed pins so the feed never feels empty. Refreshes when a new
// submission arrives via the `gp:submission` CustomEvent.
type Row = { area: string; rent: number; bhk: string; ago: string; you?: boolean };

function recentSeed(): Row[] {
  // Derive 8 random-ish recent pins from the seed dataset for ambient motion.
  const all: Row[] = [];
  const areas = (data as any).areas;
  const slugs = Object.keys(areas);
  for (let i = 0; i < 24; i++) {
    const slug = slugs[Math.floor(Math.random() * slugs.length)];
    const a = areas[slug];
    if (!a?.listings?.length) continue;
    const l = a.listings[Math.floor(Math.random() * a.listings.length)];
    all.push({ area: a.name, rent: l.r, bhk: l.b, ago: pickAgo(i) });
  }
  return all.slice(0, 8);
}
function pickAgo(i: number) {
  const opts = ["just now", "1 min ago", "3 min ago", "8 min ago", "12 min ago", "20 min ago", "34 min ago", "1 hr ago", "2 hr ago"];
  return opts[i % opts.length];
}

export function SubmissionsLive() {
  const { open } = useRentForm();
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    function refresh() {
      const subs = loadSubmissions().slice(0, 6).map<Row>((s) => ({
        area: s.area, rent: s.rent, bhk: s.bhk, ago: timeAgo(s.ts), you: true,
      }));
      setRows([...subs, ...recentSeed()].slice(0, 10));
    }
    refresh();
    function on() { refresh(); }
    window.addEventListener("gp:submission", on);
    const t = setInterval(refresh, 15000);
    return () => { window.removeEventListener("gp:submission", on); clearInterval(t); };
  }, []);

  return (
    <div className="rounded-3xl border bg-card overflow-hidden shadow-[var(--shadow-card)]">
      <div className="px-5 md:px-6 pt-5 pb-3 border-b flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-widest text-primary flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.62_0.14_155)] animate-pulse" />
            Live wall · anonymous
          </div>
          <h3 className="mt-1 text-lg md:text-xl font-bold text-ink leading-tight">Just pinned by neighbours</h3>
        </div>
        <button onClick={() => open()} className="shrink-0 inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-orange)" }}>
          ➕ Add yours
        </button>
      </div>
      <ul className="divide-y">
        {rows.map((r, i) => (
          <li key={i} className="px-5 md:px-6 py-2.5 flex items-center justify-between gap-3 text-sm">
            <div className="min-w-0 flex items-center gap-2.5">
              <span className="text-xs">{r.you ? "🟠" : "📍"}</span>
              <div className="min-w-0">
                <div className="font-semibold truncate">{r.area} <span className="text-muted-foreground font-normal">· {r.bhk} BHK</span></div>
                <div className="text-[11px] text-muted-foreground">{r.you ? "you · " : ""}{r.ago}</div>
              </div>
            </div>
            <div className="num font-bold text-foreground shrink-0">{inr(r.rent)}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function timeAgo(ts: number) {
  const s = Math.max(1, Math.round((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hr ago`;
  return `${Math.round(h / 24)} d ago`;
}
