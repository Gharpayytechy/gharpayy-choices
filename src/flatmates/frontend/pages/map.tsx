// @ts-nocheck
import { lazy, Suspense, useMemo, useState } from "react";
import { Link, useSearch } from "wouter";
import { FMShell, Card, money } from "@/flatmates/frontend/components/Shell";
import { Rooms, Flats, useFM } from "@/flatmates/backend/store/store";
import { READY_STAYS } from "@/flatmates/backend/store/seed";
import { matchesCommon } from "@/flatmates/backend/services/search";
import { List, Map as MapIcon, ShieldCheck } from "lucide-react";
import { WhatsAppHelp } from "@/flatmates/frontend/components/WhatsAppHelp";
const MapCanvas = lazy(() => import("@/flatmates/frontend/components/FlatmatesMapCanvas"));

export default function FlatmatesMap() {
  const raw = useSearch(); const p = new URLSearchParams(raw);
  const [mode, setMode] = useState("map"); const [active, setActive] = useState<any>(null);
  const data = useFM(() => ({ rooms: Rooms.all().filter((x:any)=>x.status === "LIVE"), flats: Flats.all().filter((x:any)=>x.status === "LIVE") }));
  const filters = { q:p.get("q")||"", city:p.get("city")||"Bengaluru", areas:(p.get("areas")||"").split(",").filter(Boolean), maxRent:+(p.get("maxRent")||0), roomType:p.get("roomType")||"" };
  const items = useMemo(() => [...data.rooms, ...data.flats, ...READY_STAYS.map(x=>({...x,kind:"ready",city:"Bengaluru"}))].filter(x=>matchesCommon(x,filters)), [data,raw]);
  return <FMShell title="Map" sub={`${items.length} matching places`} back={`/flatmates/discover${raw ? `?${raw}` : ""}`} tab="discover" action={<button onClick={()=>setMode(mode==="map"?"list":"map")} className="w-9 h-9 grid place-items-center rounded-full bg-muted" aria-label="Toggle map and list">{mode==="map"?<List className="w-4 h-4"/>:<MapIcon className="w-4 h-4"/>}</button>}>
    {mode === "map" && <div className="h-[54dvh] min-h-[360px] rounded-2xl overflow-hidden border border-border bg-muted relative">
      <Suspense fallback={<div className="h-full grid place-items-center text-sm text-muted-foreground">Loading live map…</div>}><MapCanvas items={items} onSelect={setActive}/></Suspense>
      {!items.length && <div className="absolute inset-x-4 bottom-4 z-[500]"><Card className="p-4"><p className="font-semibold">No map results</p><p className="text-xs text-muted-foreground mt-1">Try the list or ask Gharpayy to find an option.</p></Card></div>}
    </div>}
    {(mode === "list" || active) && <div className="mt-3 space-y-2">{(active?[active]:items).map((x:any)=><Link key={`${x.kind}-${x.id}`} href={x.kind==="flat"?`/flatmates/flat/${x.id}`:x.kind==="ready"?"/flatmates/ready":`/flatmates/room/${x.id}`}><Card className="p-3 flex items-center gap-3"><div className="flex-1 min-w-0"><p className="text-sm font-semibold truncate">{x.title}</p><p className="text-xs text-muted-foreground">{x.area} · {x.roomType || `${x.bhk} BHK`} · {money(x.rent)}</p></div>{x.verified && <ShieldCheck className="w-4 h-4 text-primary"/>}</Card></Link>)}</div>}
    <div className="mt-4 flex gap-2"><Link href={`/flatmates/discover${raw?`?${raw}`:""}`} className="h-10 px-4 rounded-xl border border-border grid place-items-center text-sm font-semibold flex-1">Open list</Link><WhatsAppHelp module="Map" action="Find a place when map or results are not enough" area={filters.areas[0]} className="flex-1"/></div>
  </FMShell>;
}
