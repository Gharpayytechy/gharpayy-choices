// @ts-nocheck
import { FMShell, Card, Pill, Section, LinkBtn, money, KPI } from "@/flatmates/frontend/components/Shell";
import { getMe, useFM } from "@/flatmates/backend/store/store";
import { READY_STAYS } from "@/flatmates/backend/store/seed";
import { Zap, Utensils, MapPin, ShieldCheck } from "lucide-react";

export default function FMReady() {
  const me = useFM(() => getMe());
  const list = [...READY_STAYS].sort((a, b) => Math.abs(a.rent - (me.budgetIdeal || 15000)) - Math.abs(b.rent - (me.budgetIdeal || 15000)));
  const today = list.filter((s) => s.ready === "Today");

  return (
    <FMShell title="Ready to move" sub="Gharpayy managed stays · no brokerage" back="/flatmates">
      <div className="rounded-3xl bg-foreground text-background p-5 mb-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-background/60">Zero-wait option</p>
        <h2 className="font-display text-2xl font-semibold tracking-tight mt-1">Move in this week, decide later.</h2>
        <p className="text-sm text-background/70 mt-1">
          {today.length} rooms are keys-in-hand today. Take one now, keep browsing flatmates, and upgrade when the right household appears.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-5">
        <KPI label="Ready today" value={today.length} tone="primary" />
        <KPI label="From" value={money(Math.min(...list.map((s) => s.rent)))} hint="per month" />
        <KPI label="Deposit" value="1 month" hint="no brokerage" tone="good" />
      </div>

      <Section title="Available now" sub="Sorted by closeness to your ideal budget">
        <div className="space-y-3">
          {list.map((s) => (
            <Card key={s.id} className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold tracking-tight truncate">{s.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" />{s.area} · {s.distance} away</p>
                </div>
                <Pill tone={s.ready === "Today" ? "green" : "amber"}><Zap className="w-3 h-3" />{s.ready}</Pill>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-display text-xl font-bold tabular-nums">{money(s.rent)}</span>
                <span className="text-xs text-muted-foreground">/month · {money(s.deposit)} deposit</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <Pill>{s.roomType}</Pill>
                {s.food && <Pill tone="green"><Utensils className="w-3 h-3" />Food included</Pill>}
                <Pill tone="green"><ShieldCheck className="w-3 h-3" />Gharpayy managed</Pill>
              </div>
              <div className="flex gap-2 mt-3">
                <LinkBtn href="/app/pg" className="flex-1">View details</LinkBtn>
                <LinkBtn href={`/flatmates/schedule?title=${encodeURIComponent(s.title)}`} variant="primary" className="flex-1">Book a visit</LinkBtn>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Why people take a ready stay first" eyebrow="Playbook">
        <Card className="p-4 space-y-2 text-sm text-muted-foreground">
          <p>· You stop paying for a hotel or a rushed bad decision while you search.</p>
          <p>· You get a Bengaluru address for work, banking and deliveries immediately.</p>
          <p>· You keep matching with flatmates from inside the city, not from another state.</p>
          <p>· Notice is short, so upgrading to a flat with your household stays cheap.</p>
        </Card>
      </Section>
    </FMShell>
  );
}
