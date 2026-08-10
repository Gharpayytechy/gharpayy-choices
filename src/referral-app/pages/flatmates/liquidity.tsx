// @ts-nocheck
import { Link } from "wouter";
import { FMShell, Card, Pill, Section, KPI, Meter, money } from "@/referral-app/components/flatmates/Shell";
import { useFM, People, Rooms, Flats, Groups, Interests, Threads } from "@/referral-app/lib/flatmates/store";
import { AREA_LIST } from "@/referral-app/lib/flatmates/seed";
import { Activity, TrendingUp, TrendingDown, Target } from "lucide-react";

export default function FMLiquidity() {
  const d = useFM(() => ({
    people: People.all(), rooms: Rooms.all().filter((r: any) => r.status === "LIVE"),
    flats: Flats.all(), groups: Groups.all(), interests: Interests.all(), threads: Threads.all(),
  }));

  const markets = AREA_LIST.map((area) => {
    const supply = d.rooms.filter((r: any) => r.area === area).length;
    const demand = d.people.filter((p: any) => p.area === area).length;
    const ratio = supply === 0 ? demand : +(demand / supply).toFixed(2);
    const gap = demand - supply;
    const avg = supply ? Math.round(d.rooms.filter((r: any) => r.area === area).reduce((s: number, r: any) => s + r.rent, 0) / supply) : 0;
    return { area, supply, demand, ratio, gap, avg };
  }).sort((a, b) => b.gap - a.gap);

  const totalSupply = d.rooms.length;
  const totalDemand = d.people.length;
  const mutual = d.threads.filter((t: any) => t.mutual).length;
  const conv = d.interests.length ? Math.round((mutual / d.interests.length) * 100) : 0;

  const missions = markets.slice(0, 4).map((m) => ({
    area: m.area,
    need: m.gap > 0 ? "supply" : "demand",
    action: m.gap > 0
      ? `Source ${Math.max(1, m.gap)} more rooms in ${m.area} — ${m.demand} seekers are waiting with nothing to see.`
      : `Bring ${Math.abs(m.gap) + 1} more seekers to ${m.area} — ${m.supply} live rooms are ageing without interest.`,
    cta: m.gap > 0 ? { label: "Post a room", to: "/flatmates/post" } : { label: "Invite seekers", to: "/flatmates/discover" },
  }));

  return (
    <FMShell title="Market liquidity" sub="Where supply and demand are out of balance today" back="/flatmates" wide>
      <div className="grid grid-cols-4 gap-2 mb-5">
        <KPI label="Live rooms" value={totalSupply} tone="primary" />
        <KPI label="Active seekers" value={totalDemand} />
        <KPI label="Mutual rate" value={`${conv}%`} tone="good" hint="interest → mutual" />
        <KPI label="Groups forming" value={d.groups.length} />
      </div>

      <Section title="Today's missions" eyebrow="Liquidity board" sub="The exact gap to close in each micro-market, ranked by pain.">
        <div className="space-y-2">
          {missions.map((m) => (
            <Card key={m.area} className="p-4">
              <div className="flex items-start gap-3">
                <span className={`w-9 h-9 rounded-xl grid place-items-center shrink-0 ${m.need === "supply" ? "bg-primary/10 text-primary" : "bg-emerald-50 text-emerald-700"}`}>
                  <Target className="w-4 h-4" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{m.area}</p>
                    <Pill tone={m.need === "supply" ? "orange" : "green"}>{m.need === "supply" ? "Needs rooms" : "Needs seekers"}</Pill>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{m.action}</p>
                  <Link href={m.cta.to} className="text-xs font-semibold text-primary mt-1.5 inline-block">{m.cta.label} →</Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Micro-market balance" eyebrow="Supply vs demand" sub="Seekers per live room. Above 1.5 means rooms fill fast and you should move quickly.">
        <Card className="p-0 overflow-hidden">
          {markets.map((m, i) => (
            <div key={m.area} className={`p-3.5 flex items-center gap-3 ${i ? "border-t border-border" : ""}`}>
              <div className="w-32 shrink-0">
                <p className="text-sm font-semibold truncate">{m.area}</p>
                <p className="text-[11px] text-muted-foreground">{m.avg ? `${money(m.avg)} avg` : "No live rooms"}</p>
              </div>
              <div className="flex-1 min-w-0">
                <Meter value={Math.min(100, m.ratio * 40)} tone={m.ratio >= 1.5 ? "warn" : "good"} />
                <p className="text-[11px] text-muted-foreground mt-1">{m.supply} rooms · {m.demand} seekers</p>
              </div>
              <div className="text-right w-16 shrink-0">
                <p className="font-display text-sm font-bold tabular-nums">{m.ratio}×</p>
                <p className={`text-[10px] font-semibold flex items-center justify-end gap-0.5 ${m.gap > 0 ? "text-primary" : "text-emerald-600"}`}>
                  {m.gap > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}{m.gap > 0 ? `+${m.gap}` : m.gap}
                </p>
              </div>
            </div>
          ))}
        </Card>
      </Section>

      <Section title="How to read this" eyebrow="Method">
        <Card className="p-4 space-y-2 text-sm text-muted-foreground">
          <p className="flex gap-2"><Activity className="w-4 h-4 text-primary shrink-0 mt-0.5" />Ratio above 1.5× — a tight market. Book visits the same day and keep a ready-to-move backup.</p>
          <p className="flex gap-2"><Activity className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />Ratio below 0.8× — a soft market. You have negotiating room on rent and deposit.</p>
          <p className="flex gap-2"><Activity className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />Mutual rate below 30% — profiles are being skipped. Verify your workplace and add a photo.</p>
        </Card>
      </Section>
    </FMShell>
  );
}
