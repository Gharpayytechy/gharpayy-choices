// @ts-nocheck
import { useMemo, useState } from "react";
import { Link } from "wouter";
import { FMShell, Card, Pill, Section, money, shortDate } from "@/flatmates/frontend/components/Shell";
import { getMe, useFM, People, Rooms, Flats, Groups } from "@/flatmates/backend/store/store";
import { AREA_LIST, READY_STAYS } from "@/flatmates/backend/store/seed";
import { scoreMatch } from "@/flatmates/backend/store/match";
import { Search, MapPin, Building2, GraduationCap, Users, Home } from "lucide-react";

const SUGGEST = [
  { icon: MapPin, label: "HSR Layout", q: "HSR Layout" },
  { icon: Building2, label: "Near Ecospace", q: "Bellandur" },
  { icon: GraduationCap, label: "Christ University", q: "BTM" },
  { icon: Users, label: "Female household", q: "Female" },
  { icon: Home, label: "Under ₹15,000", q: "15000" },
];

export default function FMSearch() {
  const [q, setQ] = useState("");
  const me = useFM(() => getMe());
  const data = useFM(() => ({ people: People.all(), rooms: Rooms.all(), flats: Flats.all(), groups: Groups.all() }));

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return null;
    const hit = (o: any) => JSON.stringify(o).toLowerCase().includes(t);
    const rank = (a: any[]) => a.map((x) => ({ ...x, _s: scoreMatch(me, x).score })).sort((a, b) => b._s - a._s);
    return {
      rooms: rank(data.rooms.filter(hit)),
      people: rank(data.people.filter(hit)),
      flats: rank(data.flats.filter(hit)),
      groups: data.groups.filter(hit),
      ready: READY_STAYS.filter(hit),
    };
  }, [q, data, me]);

  const total = results ? results.rooms.length + results.people.length + results.flats.length + results.groups.length + results.ready.length : 0;

  return (
    <FMShell title="Search" sub="Locality, apartment, company, college or budget" back="/flatmates">
      <div className="relative mb-4">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Try “Koramangala”, “Swiggy”, “12000”"
          className="w-full h-12 rounded-2xl border border-border bg-card pl-10 pr-3 text-sm shadow-[var(--shadow-card)]" />
      </div>

      {!q && (
        <>
          <Section title="Quick searches" eyebrow="Popular">
            <div className="flex flex-wrap gap-2">
              {SUGGEST.map((s) => (
                <button key={s.label} onClick={() => setQ(s.q)}
                  className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border border-border bg-card text-sm font-semibold hover:bg-muted">
                  <s.icon className="w-3.5 h-3.5 text-primary" />{s.label}
                </button>
              ))}
            </div>
          </Section>
          <Section title="Browse by micro-market" sub="Live supply in each area">
            <div className="grid grid-cols-2 gap-2">
              {AREA_LIST.map((a) => {
                const n = data.rooms.filter((r: any) => r.area === a && r.status === "LIVE").length;
                const p = data.people.filter((x: any) => x.area === a).length;
                return (
                  <button key={a} onClick={() => setQ(a)} className="text-left">
                    <Card className="p-3">
                      <p className="text-sm font-semibold truncate">{a}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{n} rooms · {p} people</p>
                    </Card>
                  </button>
                );
              })}
            </div>
          </Section>
        </>
      )}

      {results && (
        <>
          <p className="text-xs text-muted-foreground mb-3">{total} result{total === 1 ? "" : "s"} for “{q}”</p>
          {total === 0 && (
            <Card className="p-5">
              <p className="font-display font-semibold">Nothing matches that yet</p>
              <p className="text-sm text-muted-foreground mt-1">Search never dead-ends here. Try one of these instead:</p>
              <div className="mt-3 space-y-2">
                <Link href="/flatmates/discover" className="block rounded-xl border border-border p-3 hover:bg-muted">
                  <p className="text-sm font-semibold">See every live match</p>
                  <p className="text-xs text-muted-foreground">Ranked by how likely they are to resolve your move.</p>
                </Link>
                <Link href="/flatmates/requirement" className="block rounded-xl border border-border p-3 hover:bg-muted">
                  <p className="text-sm font-semibold">Loosen one constraint</p>
                  <p className="text-xs text-muted-foreground">See exactly which filter is removing the most supply.</p>
                </Link>
              </div>
            </Card>
          )}
          {!!results.rooms.length && <ResultGroup title="Rooms" items={results.rooms} href={(x) => `/flatmates/room/${x.id}`} sub={(x) => `${x.area} · ${x.roomType} · ${money(x.rent)}`} />}
          {!!results.people.length && <ResultGroup title="People" items={results.people} href={(x) => `/flatmates/person/${x.id}`} sub={(x) => `${x.occupation} · ${x.area} · up to ${money(x.budgetMax)}`} name={(x) => `${x.name}, ${x.age}`} />}
          {!!results.flats.length && <ResultGroup title="Whole flats" items={results.flats} href={(x) => `/flatmates/flat/${x.id}`} sub={(x) => `${x.bhk}BHK · ${x.area} · ${money(x.rent)}`} />}
          {!!results.groups.length && <ResultGroup title="Groups forming" items={results.groups} href={(x) => `/flatmates/group/${x.id}`} sub={(x) => `${x.bhk}BHK plan · ${x.area} · moving ${shortDate(x.moveIn)}`} />}
          {!!results.ready.length && <ResultGroup title="Ready to move" items={results.ready} href={() => "/flatmates/ready"} sub={(x) => `${x.roomType} · ${x.area} · ${money(x.rent)}`} />}
        </>
      )}
    </FMShell>
  );
}

function ResultGroup({ title, items, href, sub, name }: any) {
  return (
    <Section title={title} sub={`${items.length} match${items.length === 1 ? "" : "es"}`}>
      <div className="space-y-2">
        {items.slice(0, 8).map((x: any) => (
          <Link key={x.id} href={href(x)}>
            <Card className="p-3.5 flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate">{name ? name(x) : x.title || x.name}</p>
                <p className="text-xs text-muted-foreground truncate">{sub(x)}</p>
              </div>
              {x._s != null && <Pill tone={x._s >= 88 ? "green" : "orange"}>{x._s}%</Pill>}
            </Card>
          </Link>
        ))}
      </div>
    </Section>
  );
}
