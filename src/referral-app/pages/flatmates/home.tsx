// @ts-nocheck
import { useEffect } from "react";
import { Link } from "wouter";
import { FMShell, Section, Card, Pill, KPI, LinkBtn, money, EmptyRoutes, Eyebrow } from "@/referral-app/components/flatmates/Shell";
import { PersonCard, RoomCard, FlatCard, GroupCard, ReadyCard } from "@/referral-app/components/flatmates/Cards";
import { getMe, setMe, useFM, People, Rooms, Flats, Groups, Notifs, Threads, isHidden } from "@/referral-app/lib/flatmates/store";
import { seedFlatmates, READY_STAYS } from "@/referral-app/lib/flatmates/seed";
import { scoreMatch, resolutionRoutes } from "@/referral-app/lib/flatmates/match";
import { ArrowRight, Sparkles, Activity, Zap, Sliders, HandCoins, FileText, LayoutGrid } from "lucide-react";

export default function FlatmatesHome() {
  useEffect(() => { seedFlatmates(); }, []);
  const me = useFM(() => getMe());
  const data = useFM(() => ({
    people: People.all(), rooms: Rooms.all(), flats: Flats.all(), groups: Groups.all(),
    threads: Threads.all(), notifs: Notifs.all(),
  }));

  useEffect(() => { if (typeof window !== "undefined" && !getMe().onboarded) setMe({ onboarded: true }); }, []);

  const rank = (arr: any[]) => arr.filter((x) => !isHidden(x.id)).map((x) => ({ ...x, _s: scoreMatch(me, x).score })).sort((a, b) => b._s - a._s);
  const rooms = rank(data.rooms.filter((r: any) => r.status === "LIVE"));
  const people = rank(data.people);
  const flats = rank(data.flats);
  const best = [...rooms.slice(0, 2), ...people.slice(0, 2), ...flats.slice(0, 1)].sort((a, b) => b._s - a._s);
  const strong = [...rooms, ...people].filter((x) => x._s >= 88).length;
  const tight = data.people.length / Math.max(1, rooms.length);

  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const noResults = rooms.length === 0;

  return (
    <FMShell title="Gharpayy Flatmates" sub="Direct to owner · expert-led · no brokerage" tab="home">
      <div className="rounded-3xl bg-foreground text-background p-5 mb-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.18]" style={{ background: "radial-gradient(ellipse 70% 60% at 80% 0%, var(--primary), transparent 70%)" }} />
        <div className="relative">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-background/60">{greet}{me.name ? `, ${me.name}` : ""}</p>
          <h2 className="font-display text-2xl font-semibold tracking-tight mt-1.5">
            {rooms.length + people.length + flats.length} live possibilities match your move.
          </h2>
          <p className="text-sm text-background/70 mt-1.5">
            {strong} strong matches · {me.areas?.join(", ") || "Add your areas"} · up to {money(me.budgetMax)}
          </p>
          <div className="flex gap-2 mt-4">
            <Link href="/flatmates/discover" className="flex-1 h-10 rounded-xl bg-primary text-primary-foreground grid place-items-center text-sm font-semibold">See best matches</Link>
            <Link href="/flatmates/requirement" className="h-10 px-4 rounded-xl border border-background/25 grid place-items-center text-sm font-semibold">Adjust</Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 mb-6">
        <KPI label="Live rooms" value={rooms.length} tone="primary" />
        <KPI label="Strong" value={strong} tone="good" />
        <KPI label="Seekers/room" value={`${tight.toFixed(1)}×`} hint={tight >= 1.5 ? "tight market" : "room to negotiate"} />
        <KPI label="Ready now" value={READY_STAYS.filter((s) => s.ready === "Today").length} />
      </div>

      <div className="grid grid-cols-3 gap-2 mb-6">
        <QuickTile href="/flatmates/ready" icon={Zap} label="Move this week" />
        <QuickTile href="/flatmates/liquidity" icon={Activity} label="Market pulse" />
        <QuickTile href="/flatmates/requirement" icon={Sliders} label="Tune filters" />
        <QuickTile href="/flatmates/deals" icon={HandCoins} label="Fair rent & scripts" />
        <QuickTile href="/flatmates/agreement" icon={FileText} label="Agreement check" />
        <QuickTile href="/flatmates/hub" icon={LayoutGrid} label="All modules" />
      </div>

      {noResults ? (
        <EmptyRoutes
          title="No strong existing-room match yet"
          body="Here are three other routes that solve the same problem."
          routes={resolutionRoutes(me, { rooms: 0, people: people.length, ready: READY_STAYS.length })}
        />
      ) : (
        <Section title="Best for you" eyebrow="Ranked by resolution probability" sub="Not by newest or loudest — by what is most likely to actually close your move."
          action={<Link href="/flatmates/discover" className="text-xs font-semibold text-primary">All →</Link>}>
          <div className="space-y-3">
            {best.map((x: any) =>
              x.kind === "room" ? <RoomCard key={x.id} me={me} r={x} />
              : x.kind === "person" ? <PersonCard key={x.id} me={me} p={x} />
              : <FlatCard key={x.id} me={me} f={x} />
            )}
          </div>
        </Section>
      )}

      <Section title="New today" eyebrow="Fresh supply" sub="Re-verified in the last 72 hours">
        <div className="space-y-3">
          {rooms.slice(2, 4).map((r: any) => <RoomCard key={r.id} me={me} r={r} />)}
        </div>
      </Section>

      <Section title="People you could live with" eyebrow="Demand side" action={<Link href="/flatmates/discover?tab=people" className="text-xs font-semibold text-primary">All →</Link>}>
        <div className="space-y-3">{people.slice(0, 3).map((p: any) => <PersonCard key={p.id} me={me} p={p} />)}</div>
      </Section>

      <Section title="Form a flat" eyebrow="Signature" sub="No flatmates yet? Build the household first, then take a flat together.">
        <Card className="p-4 mb-3 border-primary/25 bg-primary/[0.04]">
          <Eyebrow><span className="inline-flex items-center gap-1"><Sparkles className="w-3 h-3" />Group engine</span></Eyebrow>
          <p className="font-display font-semibold">{data.groups.length * 2} people near {me.areas?.[0] || "you"} match your plan.</p>
          <p className="text-sm text-muted-foreground">Combined household capacity {money(data.groups.reduce((s: number, g: any) => s + g.budget, 0))}/month.</p>
          <LinkBtn href="/flatmates/groups" variant="primary" className="mt-3">Meet them <ArrowRight className="w-4 h-4" /></LinkBtn>
        </Card>
        <div className="space-y-3">{data.groups.slice(0, 2).map((g: any) => <GroupCard key={g.id} g={g} people={data.people} />)}</div>
      </Section>

      <Section title="Rooms you can move into">
        <div className="space-y-3">{rooms.slice(4, 6).map((r: any) => <RoomCard key={r.id} me={me} r={r} />)}</div>
      </Section>

      <Section title="Ready now" eyebrow="Zero-wait" sub="Gharpayy managed stays you can move into this week"
        action={<Link href="/flatmates/ready" className="text-xs font-semibold text-primary">All →</Link>}>
        <div className="space-y-3">{READY_STAYS.slice(0, 2).map((s) => <ReadyCard key={s.id} s={s} />)}</div>
      </Section>
    </FMShell>
  );
}

function QuickTile({ href, icon: Icon, label }: any) {
  return (
    <Link href={href}>
      <Card className="p-3 text-center hover:bg-muted transition-colors">
        <Icon className="w-4 h-4 mx-auto text-primary" />
        <p className="text-[11px] font-semibold mt-1.5 leading-tight">{label}</p>
      </Card>
    </Link>
  );
}
