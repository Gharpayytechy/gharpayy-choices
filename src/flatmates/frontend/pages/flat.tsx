// @ts-nocheck
import { Link, useRoute } from "wouter";
import { FMShell, Card, Pill, Section, money, shortDate } from "@/flatmates/frontend/components/Shell";
import { Flats, People, useFM, getMe } from "@/flatmates/backend/store/store";
import { PersonCard } from "@/flatmates/frontend/components/Cards";

export default function FlatDetail() {
  const [, params] = useRoute("/flatmates/flat/:id");
  const f = useFM(() => Flats.get(params?.id));
  const me = useFM(() => getMe());
  const people = useFM(() => People.all());
  if (!f) return <FMShell title="Flat" back="/flatmates/discover"><Card className="p-6">This flat is no longer listed.</Card></FMShell>;
  const nearby = people.filter((p: any) => p.area === f.area).slice(0, 3);

  return (
    <FMShell title={`${f.bhk}BHK · ${f.area}`} back="/flatmates/discover" tab="discover">
      <div className="h-40 rounded-2xl bg-gradient-to-br from-emerald-100 via-slate-100 to-slate-200 mb-4" />
      <h2 className="text-xl font-semibold tracking-tight">{f.title}</h2>
      <p className="text-sm text-slate-500">{f.address} · {f.furnishing} · available {shortDate(f.availableFrom)}</p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-bold tabular-nums">{money(f.rent)}</span><span className="text-sm text-slate-500">/month · {money(f.deposit)} deposit</span>
      </div>

      <Section title="Group affordability">
        <Card className="p-4 space-y-2">
          {[1, 2, 3, 4].filter((n) => n <= f.bhk + 1).map((n) => (
            <div key={n} className="flex justify-between text-sm">
              <span className="text-slate-500">{n === 1 ? "Taking this alone" : `With ${n} people`}</span>
              <b>{money(Math.round(f.rent / n))}{n > 1 ? " / person" : ""}</b>
            </div>
          ))}
          <Link href={`/flatmates/groups?flat=${f.id}`} className="block mt-2 h-11 rounded-xl bg-slate-900 text-white grid place-items-center text-sm font-semibold">Find People for This Flat</Link>
        </Card>
      </Section>

      <Section title={`${nearby.length ? nearby.length : people.length} people are looking in this area`}>
        <div className="space-y-3">{(nearby.length ? nearby : people.slice(0, 3)).map((p: any) => <PersonCard key={p.id} me={me} p={p} />)}</div>
      </Section>

      <Section title="Amenities">
        <div className="flex flex-wrap gap-1.5">{(f.amenities || []).map((a: string) => <Pill key={a}>{a}</Pill>)}</div>
      </Section>

      <div className="grid grid-cols-2 gap-2 mt-4">
        <Link href={`/flatmates/schedule?title=${encodeURIComponent(f.title)}`} className="h-11 rounded-xl border border-slate-900/12 grid place-items-center text-sm font-semibold">Schedule Visit</Link>
        <Link href={`/flatmates/groups?flat=${f.id}`} className="h-11 rounded-xl bg-slate-900 text-white grid place-items-center text-sm font-semibold">Build My Group</Link>
      </div>
    </FMShell>
  );
}
