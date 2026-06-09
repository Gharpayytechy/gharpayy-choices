import { useState } from "react";
import { ALL_AREAS } from "@/lib/insights-utils";
import { inrFull, inr } from "@/lib/format";

type Profile = "minimal" | "comfort" | "premium";

export function HiddenCosts({ med = 30000 }: { med?: number }) {
  const [areaSlug, setAreaSlug] = useState("koramangala");
  const [profile, setProfile] = useState<Profile>("comfort");
  const area = (ALL_AREAS as any)[areaSlug];
  const baseRent = area?.overall?.med ?? med;
  const gatedShare = area ? area.gated.n / Math.max(area.count, 1) : 0.4;

  // Item set varies by profile + area
  const factor = profile === "minimal" ? 0.6 : profile === "premium" ? 1.5 : 1;
  const items = [
    { k: "Maintenance", v: Math.round(baseRent * (gatedShare > 0.5 ? 0.1 : 0.06)), n: gatedShare > 0.5 ? "Gated society" : "Standalone" },
    { k: "Water tanker", v: Math.round(1200 * factor), n: "Apr–Jun avg" },
    { k: "Power backup", v: Math.round(baseRent * 0.04 * factor), n: "DG / inverter" },
    { k: "Wi-Fi 200 Mbps", v: profile === "minimal" ? 600 : profile === "premium" ? 1200 : 800, n: "ACT / Jio" },
    { k: "Help (cleaning)", v: profile === "minimal" ? 1500 : profile === "premium" ? 4000 : 2500, n: profile === "premium" ? "Daily" : "3×/wk" },
    { k: "Cook", v: profile === "minimal" ? 0 : profile === "premium" ? 6500 : 4500, n: profile === "minimal" ? "Self-cook" : "1 meal" },
    { k: "Parking", v: gatedShare > 0.5 ? 1200 : 800, n: "Per vehicle" },
    { k: "Garbage", v: 100, n: "Monthly" },
    { k: "Gas cylinder", v: 950, n: "1.5 / month" },
  ];
  const total = items.reduce((s, i) => s + i.v, 0);
  const annual = (baseRent + total) * 12;

  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-7 w-full">
      <div className="text-[11px] uppercase tracking-widest text-primary font-bold">Hidden costs 🧾</div>
      <h2 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight">Beyond the rent sticker</h2>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <select value={areaSlug} onChange={(e) => setAreaSlug(e.target.value)} className="px-3 py-2 rounded-xl border bg-background text-sm font-semibold">
          {Object.entries(ALL_AREAS).map(([s, a]: any) => <option key={s} value={s}>{a.name}</option>)}
        </select>
        <div className="flex gap-1 rounded-xl border bg-background p-1">
          {(["minimal", "comfort", "premium"] as Profile[]).map((p) => (
            <button key={p} onClick={() => setProfile(p)} className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize ${profile === p ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{p}</button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
        {items.filter((i) => i.v > 0).map((i) => (
          <div key={i.k} className="rounded-xl border bg-card p-3">
            <div className="text-[11px] text-muted-foreground">{i.k}</div>
            <div className="mt-0.5 text-base num font-bold text-ink">+{inrFull(i.v)}</div>
            <div className="text-[10px] text-muted-foreground">{i.n}</div>
          </div>
        ))}
      </div>

      <div className="mt-3 grid sm:grid-cols-3 gap-3">
        <Stat k="Sticker rent" v={inrFull(baseRent)} />
        <Stat k="Hidden / month" v={inrFull(total)} warn />
        <Stat k="True monthly outlay" v={inrFull(baseRent + total)} accent />
      </div>

      <div className="mt-3 rounded-2xl border-2 border-primary/30 bg-primary/5 p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-primary font-bold">12-month true cost</div>
            <div className="text-2xl num font-bold text-ink">{inrFull(annual)}</div>
          </div>
          <div className="text-xs text-muted-foreground">
            Hidden costs add <span className="num font-bold text-warning">{Math.round((total / baseRent) * 100)}%</span> on top of the {profile} rent in {area?.name ?? "Bengaluru"}.
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ k, v, accent, warn }: { k: string; v: string; accent?: boolean; warn?: boolean }) {
  return (
    <div className={`rounded-2xl border p-3 ${accent ? "border-primary/40 bg-primary/5" : warn ? "border-warning/40 bg-warning/5" : "bg-card"}`}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{k}</div>
      <div className="mt-1 text-xl num font-bold text-ink">{v}</div>
    </div>
  );
}
