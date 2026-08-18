// @ts-nocheck
import { useState, useEffect, useMemo } from "react";
import { Link, useSearch } from "wouter";
import { FMShell, Card, Btn, Pill, money, EmptyRoutes, Section } from "@/flatmates/frontend/components/Shell";
import { PersonCard, RoomCard, FlatCard, GroupCard, ReadyCard } from "@/flatmates/frontend/components/Cards";
import { getMe, useFM, People, Rooms, Flats, Groups, isHidden, hideItem, track } from "@/flatmates/backend/store/store";
import { seedFlatmates, READY_STAYS, AREA_LIST } from "@/flatmates/backend/store/seed";
import { scoreMatch, resolutionRoutes, constraintImpact } from "@/flatmates/backend/store/match";
import { rankFeed, feedInsight, DEALBREAKERS } from "@/flatmates/backend/services/intel";
import { SlidersHorizontal, Map as MapIcon, Search, X } from "lucide-react";

const TABS = [["all", "For You"], ["rooms", "Rooms"], ["people", "People"], ["groups", "Groups"], ["flats", "Flats"]];

export default function Discover() {
  const search = useSearch();
  const initial = new URLSearchParams(search).get("tab") || "all";
  const [tab, setTab] = useState(initial);
  const [q, setQ] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [dbs, setDbs] = useState<string[]>([]);
  const [strict, setStrict] = useState(false);
  const [f, setF] = useState<any>({ maxRent: 0, area: "", roomType: "", verifiedOnly: false, freshOnly: false, sort: "match" });
  useEffect(() => { seedFlatmates(); }, []);

  const me = useFM(() => getMe());
  const db = useFM(() => ({ people: People.all(), rooms: Rooms.all(), flats: Flats.all(), groups: Groups.all() }));

  const apply = (arr: any[]) => {
    let out = arr.filter((x) => !isHidden(x.id));
    if (q) out = out.filter((x) => JSON.stringify(x).toLowerCase().includes(q.toLowerCase()));
    if (f.area) out = out.filter((x) => x.area === f.area);
    if (f.maxRent) out = out.filter((x) => (x.rent || 0) <= f.maxRent);
    if (f.roomType) out = out.filter((x) => x.roomType === f.roomType);
    if (f.verifiedOnly) out = out.filter((x) => x.verified?.phone && x.verified?.work);
    if (f.freshOnly) out = out.filter((x) => !x.verifiedAt || Date.now() - +new Date(x.verifiedAt) < 3 * 86400000);
    return rankFeed(out, {
      me,
      dealbreakers: dbs,
      strict,
      sort: f.sort === "new" ? "fresh" : f.sort === "trust" ? "trust" : f.sort,
    });
  };

  const rooms = useMemo(() => apply(db.rooms.filter((r: any) => r.status === "LIVE")), [db, q, f, me, dbs, strict]);
  const people = useMemo(() => apply(db.people), [db, q, f, me, dbs, strict]);
  const flats = useMemo(() => apply(db.flats), [db, q, f, me, dbs, strict]);
  const total = tab === "rooms" ? rooms.length : tab === "people" ? people.length : tab === "flats" ? flats.length : tab === "groups" ? db.groups.length : rooms.length + people.length + flats.length;

  const impact = constraintImpact(me, db.rooms);
  const insight = feedInsight([...rooms, ...people, ...flats]);

  return (
    <FMShell title="Discover" tab="discover"
      action={<Link href="/flatmates/map" className="w-9 h-9 grid place-items-center rounded-full hover:bg-slate-900/5"><MapIcon className="w-5 h-5 text-slate-600" /></Link>}>

      <div className="flex gap-2 mb-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
          <input value={q} onChange={(e) => { setQ(e.target.value); track("search_performed", { q: e.target.value }); }}
            placeholder="Area, company, college, apartment…"
            className="w-full h-11 pl-9 pr-3 rounded-xl border border-slate-900/10 bg-white text-sm outline-none focus:ring-2 focus:ring-slate-900/10" />
        </div>
        <button onClick={() => setShowFilters((s) => !s)} className="w-11 h-11 rounded-xl border border-slate-900/10 bg-white grid place-items-center">
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-3 -mx-4 px-4">
        {TABS.map(([k, label]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`shrink-0 px-3.5 h-9 rounded-full text-sm font-semibold border ${tab === k ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-900/10 text-slate-600"}`}>{label}</button>
        ))}
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-3 -mx-4 px-4">
        {DEALBREAKERS.map((d: any) => {
          const on = dbs.includes(d.key);
          return (
            <button key={d.key}
              onClick={() => setDbs((prev) => (on ? prev.filter((k) => k !== d.key) : [...prev, d.key]))}
              className={`shrink-0 px-3 h-8 rounded-full text-[12px] font-semibold border transition-colors ${on ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground"}`}>
              {on ? "\u2713 " : ""}{d.label}
            </button>
          );
        })}
      </div>

      {!!dbs.length && (
        <Card className="p-3 mb-4 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold">{strict ? "Hiding everything that breaks a deal-breaker" : "Deal-breakers demote instead of hide"}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{insight ? `${insight.strong} strong \u00b7 avg ${insight.avg}% match \u00b7 ${insight.trusted} highly trusted` : "No results yet"}</p>
          </div>
          <button onClick={() => setStrict((v) => !v)}
            className={`shrink-0 px-3 h-8 rounded-full text-[12px] font-semibold border ${strict ? "bg-foreground text-background border-foreground" : "bg-card border-border"}`}>
            {strict ? "Strict on" : "Strict off"}
          </button>
        </Card>
      )}

      {showFilters && (
        <Card className="p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="font-semibold text-sm">Filters</p>
            <button onClick={() => setF({ maxRent: 0, area: "", roomType: "", verifiedOnly: false, freshOnly: false, sort: "match" })} className="text-xs text-slate-500 underline">Clear All</button>
          </div>
          <p className="text-xs font-semibold text-slate-500 mb-1.5">Max rent {f.maxRent ? money(f.maxRent) : "· any"}</p>
          <input type="range" min={0} max={60000} step={1000} value={f.maxRent} onChange={(e) => setF({ ...f, maxRent: +e.target.value })} className="w-full accent-slate-900 mb-3" />
          <p className="text-xs font-semibold text-slate-500 mb-1.5">Area</p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {AREA_LIST.map((a) => (
              <button key={a} onClick={() => setF({ ...f, area: f.area === a ? "" : a })}
                className={`px-2.5 h-8 rounded-lg text-xs font-medium border ${f.area === a ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-900/10"}`}>{a}</button>
            ))}
          </div>
          <p className="text-xs font-semibold text-slate-500 mb-1.5">Room type</p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {["Private room", "Twin sharing", "Shared room"].map((rt) => (
              <button key={rt} onClick={() => setF({ ...f, roomType: f.roomType === rt ? "" : rt })}
                className={`px-2.5 h-8 rounded-lg text-xs font-medium border ${f.roomType === rt ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-900/10"}`}>{rt}</button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {[["verifiedOnly", "Verified only"], ["freshOnly", "Verified in last 3 days"]].map(([k, l]: any) => (
              <button key={k} onClick={() => setF({ ...f, [k]: !f[k] })}
                className={`px-2.5 h-8 rounded-lg text-xs font-medium border ${f[k] ? "bg-emerald-600 text-white border-emerald-600" : "bg-white border-slate-900/10"}`}>{l}</button>
            ))}
          </div>
          <p className="text-xs font-semibold text-slate-500 mb-1.5">Sort</p>
          <div className="flex gap-1.5 mb-4">
            {[["match", "Best match"], ["trust", "Most trusted"], ["price", "Price"], ["new", "Freshest"]].map(([k, l]: any) => (
              <button key={k} onClick={() => setF({ ...f, sort: k })}
                className={`px-2.5 h-8 rounded-lg text-xs font-medium border ${f.sort === k ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-900/10"}`}>{l}</button>
            ))}
          </div>
          <div className="flex gap-2">
            <Btn variant="secondary" className="flex-1" onClick={() => setShowFilters(false)}>Create Alert</Btn>
            <Btn className="flex-[2]" onClick={() => setShowFilters(false)}>Show {total} Matches</Btn>
          </div>
        </Card>
      )}

      {(tab === "all" || tab === "rooms") && (
        rooms.length ? (
          <Section title={`${rooms.length} rooms`}>
            <div className="space-y-3">{rooms.map((r: any) => <RoomCard key={r.id} me={me} r={r} />)}</div>
          </Section>
        ) : (
          <div className="mb-6 space-y-3">
            <Card className="p-4 bg-amber-50 border-amber-200">
              <p className="text-sm font-semibold">Here's what's narrowing your search</p>
              <ul className="mt-2 space-y-1 text-sm text-slate-700">
                {impact.filter((i) => i.removedPct > 0).map((i) => (
                  <li key={i.label}>• <b>{i.label}</b> removes {i.removedPct}% of options</li>
                ))}
              </ul>
              <Link href="/flatmates/start" className="text-xs font-semibold text-blue-800 mt-2 inline-block">Adjust requirement →</Link>
            </Card>
            <EmptyRoutes title="No strong existing-room match yet" body="Three other routes solve the same problem."
              routes={resolutionRoutes(me, { rooms: 0, people: people.length, ready: READY_STAYS.length })} />
          </div>
        )
      )}

      {(tab === "all" || tab === "people") && (
        <Section title={`${people.length} people`}>
          <div className="space-y-3">{people.map((p: any) => <PersonCard key={p.id} me={me} p={p} />)}</div>
        </Section>
      )}

      {(tab === "all" || tab === "groups") && (
        <Section title={`${db.groups.length} groups forming`}>
          <div className="space-y-3">{db.groups.map((g: any) => <GroupCard key={g.id} g={g} people={db.people} />)}</div>
        </Section>
      )}

      {(tab === "all" || tab === "flats") && (
        <Section title={`${flats.length} whole flats`}>
          <div className="space-y-3">{flats.map((x: any) => <FlatCard key={x.id} me={me} f={x} />)}</div>
        </Section>
      )}

      {tab === "all" && (
        <Section title="Ready now">
          <div className="space-y-3">{READY_STAYS.map((s) => <ReadyCard key={s.id} s={s} />)}</div>
        </Section>
      )}
    </FMShell>
  );
}
