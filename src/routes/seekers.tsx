import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileBottomBar } from "@/components/MobileBottomBar";
import data from "@/data/insights.json";
import { inr } from "@/lib/format";
import { waSeeker } from "@/lib/wa";
import { WhatsAppIcon } from "@/components/Header";

export const Route = createFileRoute("/seekers")({
  head: () => ({
    meta: [
      { title: "Bengaluru flat-hunters · Gharpayy Insights" },
      { name: "description", content: "3,600+ active Bengaluru flat-hunters with budgets, areas, and lifestyle preferences." },
    ],
  }),
  component: Seekers,
});

function Seekers() {
  const [lf, setLf] = useState("any");
  const [maxB, setMaxB] = useState(80000);
  const seekers = useMemo(() =>
    (data.seekers as any[]).filter((s) => (lf === "any" || s.lf === lf) && s.b <= maxB),
  [lf, maxB]);

  return (
    <div className="min-h-screen flex flex-col pb-24 md:pb-0">
      <Header />
      <section className="max-w-7xl mx-auto px-4 md:px-5 py-6 md:py-12 w-full flex-1">
        <h1 className="text-2xl md:text-4xl font-bold tracking-tight">Active flat-hunters</h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-1">{data.stats.seekers.toLocaleString()} hunting now · {seekers.length} match.</p>

        <div className="mt-6 flex flex-wrap gap-3 items-center">
          <div className="flex gap-1 rounded-lg bg-secondary p-1">
            {([["any","All"],["whole_flat","Entire flat"],["room","Just a room"]] as const).map(([k,l]) => (
              <button key={k} onClick={() => setLf(k)} className={`px-3 py-1.5 text-xs font-medium rounded-md ${lf===k?"bg-card shadow":"text-muted-foreground hover:text-foreground"}`}>{l}</button>
            ))}
          </div>
          <label className="text-xs text-muted-foreground flex items-center gap-2">
            Max budget <input type="range" min={5000} max={150000} step={5000} value={maxB} onChange={(e) => setMaxB(+e.target.value)} className="accent-[oklch(0.715_0.185_45)]" />
            <span className="num font-semibold text-foreground">{inr(maxB)}</span>
          </label>
        </div>

        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {seekers.map((s, i) => (
            <div key={i} className="rounded-xl border bg-card p-5 shadow-[var(--shadow-card)] hover:border-primary/30 transition flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider font-bold text-primary">{s.lf === "whole_flat" ? "Wants entire flat" : "Wants a room"}</span>
                <span className="num text-sm font-bold">{inr(s.b)}/mo</span>
              </div>
              {s.area && <div className="text-xs text-muted-foreground mt-2">📍 {s.area}</div>}
              <p className="mt-2 text-sm text-foreground/85 line-clamp-4 flex-1">{s.n}</p>
              <div className="mt-3 flex flex-wrap gap-1.5 text-[10px]">
                {s.bhk && s.bhk !== "any" && <span className="px-2 py-0.5 rounded-full bg-secondary num">{s.bhk} BHK</span>}
                {s.g && s.g !== "any" && <span className="px-2 py-0.5 rounded-full bg-secondary capitalize">{s.g}</span>}
                {s.food && s.food !== "any" && <span className="px-2 py-0.5 rounded-full bg-secondary capitalize">{s.food}</span>}
              </div>
              <a href={waSeeker(s.n, s.area, s.b)} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white bg-[oklch(0.62_0.14_155)]">
                <WhatsAppIcon className="w-3.5 h-3.5" /> Help via Gharpayy
              </a>
            </div>
          ))}
        </div>
      </section>
      <Footer />
      <MobileBottomBar variant="dual" context="I'm browsing flat-hunters" />
    </div>
  );
}
