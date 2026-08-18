// @ts-nocheck
import { useEffect, useMemo, useState } from "react";
import { FMShell, Section, Card, Pill, KPI, Meter, Btn, money } from "@/referral-app/components/flatmates/Shell";
import { useFM, Rooms, People, getMe, track } from "@/referral-app/lib/flatmates/store";
import { seedFlatmates } from "@/referral-app/lib/flatmates/seed";
import { toast } from "sonner";
import { HandCoins, Copy, TrendingDown, MessageCircle } from "lucide-react";

const median = (a: number[]) => {
  if (!a.length) return 0;
  const s = [...a].sort((x, y) => x - y);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
};

export default function FlatmatesDeals() {
  useEffect(() => { seedFlatmates(); }, []);
  const me = useFM(() => getMe());
  const rooms = useFM(() => Rooms.all().filter((r: any) => r.status === "LIVE"));
  const seekers = useFM(() => People.all().length);

  const areas = useMemo(() => Array.from(new Set(rooms.map((r: any) => r.area))), [rooms]);
  const [area, setArea] = useState(me.areas?.[0] || areas[0] || "");
  const [ask, setAsk] = useState(me.budgetIdeal || 20000);

  const pool = rooms.filter((r: any) => !area || r.area === area);
  const rents = pool.map((r: any) => r.rent);
  const fair = median(rents);
  const low = Math.round(fair * 0.9);
  const high = Math.round(fair * 1.12);
  const tight = seekers / Math.max(1, pool.length);

  const gap = ask - fair;
  const verdict = !fair
    ? { tone: "slate", label: "Not enough live supply here", body: "Widen the area to get a fair band." }
    : gap > fair * 0.08
      ? { tone: "red", label: `Overpriced by ${money(gap)}`, body: "You have room to negotiate hard — supply exists below this." }
      : gap < -fair * 0.08
        ? { tone: "green", label: `Below market by ${money(-gap)}`, body: "Move fast. Underpriced rooms close in under 48 hours." }
        : { tone: "amber", label: "Fair for this micro-market", body: "Negotiate on deposit and lock-in instead of rent." };

  const leverage = tight >= 1.5
    ? { label: "Owner has leverage", meter: 30, note: `${tight.toFixed(1)} seekers per live room. Ask for value, not discount.` }
    : { label: "You have leverage", meter: 78, note: `Only ${tight.toFixed(1)} seekers per live room. Discounts are winnable.` };

  const scripts = [
    {
      t: "The evidence open",
      body: `Hi, I'm keen on the ${area} room. Comparable live rooms in ${area} sit at ${money(low)}–${money(high)} all-in. I can close at ${money(low)} and pay the token today.`,
    },
    {
      t: "Deposit instead of rent",
      body: `I can meet your rent of ${money(fair)} if we bring the deposit to 1 month and keep lock-in at 3 months. That works better for both of us than a long empty room.`,
    },
    {
      t: "The long-tenure trade",
      body: `I'm a 12-month tenant, not a 3-month one. At ${money(low)} I'll sign for a year with no rent revision — you save two vacancy cycles.`,
    },
    {
      t: "The all-in clarity ask",
      body: `Before I visit, can you confirm the all-in number — rent, maintenance, water, and any one-time charges? I compare on all-in only.`,
    },
  ];

  const copy = (text: string) => {
    navigator.clipboard?.writeText(text);
    track("negotiation_script_copied", { area });
    toast.success("Script copied — paste into WhatsApp");
  };

  return (
    <FMShell title="Rent fairness & negotiation" sub="Know the fair number before you speak" back="/flatmates/hub">
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <span className="w-9 h-9 rounded-xl bg-primary/10 grid place-items-center"><HandCoins className="w-4 h-4 text-primary" /></span>
          <div>
            <p className="font-display font-semibold tracking-tight">Fair band engine</p>
            <p className="text-xs text-muted-foreground">Built from {pool.length} live rooms in this micro-market</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4">
          <label className="text-xs font-semibold text-muted-foreground">
            Area
            <select value={area} onChange={(e) => setArea(e.target.value)}
              className="mt-1 w-full h-10 rounded-xl border border-border bg-card px-3 text-sm font-medium text-foreground">
              {areas.map((a: any) => <option key={a} value={a}>{a}</option>)}
            </select>
          </label>
          <label className="text-xs font-semibold text-muted-foreground">
            Their asking rent
            <input type="number" value={ask} onChange={(e) => setAsk(+e.target.value)}
              className="mt-1 w-full h-10 rounded-xl border border-border bg-card px-3 text-sm font-medium tabular-nums" />
          </label>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-2 mt-3">
        <KPI label="Fair rent" value={money(fair)} tone="primary" />
        <KPI label="Winnable low" value={money(low)} tone="good" />
        <KPI label="Walk away above" value={money(high)} />
      </div>

      <Card className={`p-4 mt-3 border-${verdict.tone === "green" ? "emerald" : verdict.tone === "red" ? "red" : "border"}-200`}>
        <Pill tone={verdict.tone}>{verdict.label}</Pill>
        <p className="text-sm mt-2">{verdict.body}</p>
        <div className="mt-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">{leverage.label}</span>
            <b>{leverage.meter}%</b>
          </div>
          <Meter value={leverage.meter} tone={leverage.meter > 60 ? "good" : "warn"} />
          <p className="text-xs text-muted-foreground mt-1.5">{leverage.note}</p>
        </div>
      </Card>

      <Section title="Scripts that actually close" eyebrow="Say this, not that" sub="Copy, paste into WhatsApp, send before the visit.">
        <div className="space-y-2">
          {scripts.map((s) => (
            <Card key={s.t} className="p-4">
              <p className="font-semibold text-sm">{s.t}</p>
              <p className="text-sm text-muted-foreground mt-1.5">{s.body}</p>
              <div className="flex gap-2 mt-3">
                <Btn variant="secondary" onClick={() => copy(s.body)} className="flex-1"><Copy className="w-4 h-4" />Copy</Btn>
                <a className="flex-1 h-10 rounded-xl bg-primary text-primary-foreground grid place-items-center text-sm font-semibold"
                  href={`https://wa.me/?text=${encodeURIComponent(s.body)}`} target="_blank" rel="noreferrer">
                  <span className="inline-flex items-center gap-1.5"><MessageCircle className="w-4 h-4" />Send</span>
                </a>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="What not to do" eyebrow="Failure modes">
        <Card className="p-4 space-y-2 text-sm">
          {[
            "Never pay a token before seeing the room and the agreement draft.",
            "Never negotiate on rent alone — deposit, lock-in and maintenance move more money.",
            "Never compare base rents. Compare all-in numbers only.",
            "Never reveal your maximum budget in the first message.",
          ].map((x) => (
            <div key={x} className="flex gap-2">
              <TrendingDown className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <span className="text-muted-foreground">{x}</span>
            </div>
          ))}
        </Card>
      </Section>
    </FMShell>
  );
}
