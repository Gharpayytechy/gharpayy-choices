// @ts-nocheck
import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { FMShell, Section, Card, Btn, Pill, money, EmptyRoutes } from "@/referral-app/components/flatmates/Shell";
import { PersonCard, RoomCard, FlatCard, GroupCard, ReadyCard } from "@/referral-app/components/flatmates/Cards";
import { getMe, useFM, People, Rooms, Flats, Groups, Notifs, Threads, isHidden } from "@/referral-app/lib/flatmates/store";
import { seedFlatmates, READY_STAYS } from "@/referral-app/lib/flatmates/seed";
import { scoreMatch, resolutionRoutes } from "@/referral-app/lib/flatmates/match";
import { ArrowRight, Sparkles } from "lucide-react";

export default function FlatmatesHome() {
  const [, nav] = useLocation();
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

  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const noResults = rooms.length === 0;

  return (
    <FMShell title="Gharpayy Flatmates" tab="home">
      <div className="rounded-3xl bg-slate-900 text-white p-5 mb-6">
        <p className="text-sm text-white/60">{greet}{me.name ? `, ${me.name}` : ""}.</p>
        <h2 className="text-2xl font-semibold tracking-tight mt-1">
          {rooms.length + people.length + flats.length} new possibilities match your move.
        </h2>
        <p className="text-sm text-white/60 mt-1">
          {strong} strong matches · {me.areas.join(", ") || "Add your areas"} · up to {money(me.budgetMax)}
        </p>
        <div className="flex gap-2 mt-4">
          <Link href="/flatmates/discover" className="flex-1 h-10 rounded-xl bg-white text-slate-900 grid place-items-center text-sm font-semibold">See Best Matches</Link>
          <Link href="/flatmates/start" className="h-10 px-4 rounded-xl border border-white/20 grid place-items-center text-sm font-semibold">Adjust</Link>
        </div>
      </div>

      {noResults ? (
        <EmptyRoutes
          title="No strong existing-room match yet"
          body="Here are three other routes that solve the same problem."
          routes={resolutionRoutes(me, { rooms: 0, people: people.length, ready: READY_STAYS.length })}
        />
      ) : (
        <Section title="Best for you" sub="Ranked by how likely they are to resolve your move" action={<Link href="/flatmates/discover" className="text-xs font-semibold text-orange-600">All →</Link>}>
          <div className="space-y-3">
            {best.map((x: any) =>
              x.kind === "room" ? <RoomCard key={x.id} me={me} r={x} />
              : x.kind === "person" ? <PersonCard key={x.id} me={me} p={x} />
              : <FlatCard key={x.id} me={me} f={x} />
            )}
          </div>
        </Section>
      )}

      <Section title="New today" sub="Fresh supply in your areas">
        <div className="space-y-3">
          {rooms.slice(2, 4).map((r: any) => <RoomCard key={r.id} me={me} r={r} />)}
        </div>
      </Section>

      <Section title="People you could live with" action={<Link href="/flatmates/discover?tab=people" className="text-xs font-semibold text-orange-600">All →</Link>}>
        <div className="space-y-3">{people.slice(0, 3).map((p: any) => <PersonCard key={p.id} me={me} p={p} />)}</div>
      </Section>

      <Section title="Form a flat" sub="Don't have flatmates yet? Build the household first.">
        <Card className="p-4 mb-3 bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
          <div className="flex items-center gap-2 text-orange-700 text-xs font-bold uppercase tracking-wide"><Sparkles className="w-3.5 h-3.5" />Signature</div>
          <p className="font-semibold mt-1">{data.groups.length * 2} people near {me.areas[0] || "you"} match your plan.</p>
          <p className="text-sm text-slate-600">Combined household capacity {money(data.groups.reduce((s: number, g: any) => s + g.budget, 0))}/month.</p>
          <Link href="/flatmates/groups" className="mt-3 inline-flex h-10 px-4 rounded-xl bg-slate-900 text-white items-center text-sm font-semibold">Meet Them <ArrowRight className="w-4 h-4 ml-1" /></Link>
        </Card>
        <div className="space-y-3">{data.groups.slice(0, 2).map((g: any) => <GroupCard key={g.id} g={g} people={data.people} />)}</div>
      </Section>

      <Section title="Rooms you can move into">
        <div className="space-y-3">{rooms.slice(4, 6).map((r: any) => <RoomCard key={r.id} me={me} r={r} />)}</div>
      </Section>

      <Section title="Ready now" sub="Gharpayy managed stays you can move into this week" action={<Link href="/flatmates/ready" className="text-xs font-semibold text-orange-600">All →</Link>}>
        <div className="space-y-3">{READY_STAYS.slice(0, 2).map((s) => <ReadyCard key={s.id} s={s} />)}</div>
      </Section>
    </FMShell>
  );
}
