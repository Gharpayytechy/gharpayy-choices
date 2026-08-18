// @ts-nocheck
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { FMShell, Card, Btn, Section, money } from "@/flatmates/frontend/components/Shell";
import { PersonCard, RoomCard, FlatCard, GroupCard, ReadyCard } from "@/flatmates/frontend/components/Cards";
import { getMe, useFM, People, Rooms, Flats, Groups, isHidden, sweepStaleRequests } from "@/flatmates/backend/store/store";
import { seedFlatmates, READY_STAYS } from "@/flatmates/backend/store/seed";
import { CITY_OPTIONS, cityByName } from "@/flatmates/backend/store/locations";
import { matchesCommon } from "@/flatmates/backend/services/search";
import { rankFeed } from "@/flatmates/backend/services/intel";
import { SlidersHorizontal, Map as MapIcon, Search, X, MessageCircle } from "lucide-react";
import { WhatsAppHelp } from "@/flatmates/frontend/components/WhatsAppHelp";

const TABS = [["all","All"],["rooms","Rooms"],["people","People"],["groups","Groups"],["flats","Whole flats"],["ready","Ready now"]];
const defaults = { q:"", city:"Bengaluru", areas:[], maxRent:0, roomType:"", gender:"", furnishing:"", verifiedOnly:false, freshOnly:false, sort:"match" };

export default function Discover() {
  const raw = useSearch(); const [, navigate] = useLocation();
  const params = new URLSearchParams(raw);
  const [showFilters,setShowFilters] = useState(false);
  const [tab,setTabState] = useState(params.get("tab") || "all");
  const [f,setFState] = useState<any>({ ...defaults, q:params.get("q")||"", city:params.get("city")||"Bengaluru", areas:(params.get("areas")||"").split(",").filter(Boolean), maxRent:+(params.get("maxRent")||0), roomType:params.get("roomType")||"", gender:params.get("gender")||"", furnishing:params.get("furnishing")||"", verifiedOnly:params.get("verified")==="1", freshOnly:params.get("fresh")==="1", sort:params.get("sort")||"match" });
  useEffect(()=>{ seedFlatmates(); sweepStaleRequests(); },[]);
  const me=useFM(()=>getMe());
  const db=useFM(()=>({people:People.all(),rooms:Rooms.all(),flats:Flats.all(),groups:Groups.all()}));
  const sync=(next:any,nextTab=tab)=>{ const p=new URLSearchParams(); if(nextTab!=="all")p.set("tab",nextTab); if(next.q)p.set("q",next.q); if(next.city&&next.city!=="Bengaluru")p.set("city",next.city); if(next.areas.length)p.set("areas",next.areas.join(",")); if(next.maxRent)p.set("maxRent",String(next.maxRent)); ["roomType","gender","furnishing","sort"].forEach(k=>next[k]&&next[k]!=="match"&&p.set(k,next[k])); if(next.verifiedOnly)p.set("verified","1"); if(next.freshOnly)p.set("fresh","1"); navigate(`/flatmates/discover${p.toString()?`?${p}`:""}`,{replace:true}); };
  const setF=(patch:any)=>{const next={...f,...patch};setFState(next);sync(next)};
  const setTab=(t:string)=>{setTabState(t);sync(f,t)};
  const rank=(rows:any[])=>rankFeed(rows.filter((x:any)=>!isHidden(x.id)&&matchesCommon(x,f)),{me,sort:f.sort==="new"?"fresh":f.sort});
  const results=useMemo(()=>({ rooms:rank(db.rooms.filter((x:any)=>x.status==="LIVE")), people:rank(db.people), flats:rank(db.flats.filter((x:any)=>x.status==="LIVE")), groups:db.groups.filter((x:any)=>matchesCommon(x,f)), ready:READY_STAYS.filter((x:any)=>matchesCommon(x,f)) }),[db,f,me]);
  const counts:any={all:results.rooms.length+results.people.length+results.flats.length+results.groups.length+results.ready.length,rooms:results.rooms.length,people:results.people.length,flats:results.flats.length,groups:results.groups.length,ready:results.ready.length};
  const active=[f.city!=="Bengaluru"&&f.city,...f.areas,f.maxRent&&`≤ ${money(f.maxRent)}`,f.roomType,f.gender,f.furnishing,f.verifiedOnly&&"Verified",f.freshOnly&&"Fresh"].filter(Boolean);
  const city=cityByName(f.city);
  const reset=()=>{setFState(defaults);setTabState("all");navigate("/flatmates/discover",{replace:true})};
  const mapQuery=new URLSearchParams(raw); mapQuery.delete("tab");
  return <FMShell title="Discover" sub={`${counts.all} options across one connected marketplace`} tab="discover" action={<Link href={`/flatmates/map${mapQuery.toString()?`?${mapQuery}`:""}`} className="w-9 h-9 grid place-items-center rounded-full hover:bg-muted" aria-label="Open map"><MapIcon className="w-5 h-5"/></Link>}>
    <div className="flex gap-2 mb-3"><div className="flex-1 relative"><Search className="w-4 h-4 absolute left-3 top-3.5 text-muted-foreground"/><input value={f.q} onChange={e=>setF({q:e.target.value})} placeholder="Area, office, college, apartment…" className="w-full h-11 pl-9 pr-3 rounded-lg border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-primary/20"/></div><button onClick={()=>setShowFilters(v=>!v)} className="relative w-11 h-11 rounded-lg border border-border bg-card grid place-items-center" aria-label="Filters"><SlidersHorizontal className="w-4 h-4"/>{active.length>0&&<span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] grid place-items-center">{active.length}</span>}</button></div>
    <div className="flex gap-1.5 overflow-x-auto pb-3 -mx-4 px-4">{TABS.map(([k,l])=><button key={k} onClick={()=>setTab(k)} className={`shrink-0 px-3 h-9 rounded-full text-xs font-semibold border ${tab===k?"bg-foreground text-background border-foreground":"bg-card border-border text-muted-foreground"}`}>{l} · {counts[k]}</button>)}</div>
    {active.length>0&&<div className="flex gap-1.5 overflow-x-auto pb-3">{active.map((x:any)=><span key={x} className="shrink-0 h-8 px-2.5 rounded-full bg-primary/10 text-primary text-xs font-semibold inline-flex items-center gap-1">{x}</span>)}<button onClick={reset} className="shrink-0 h-8 px-2 text-xs font-semibold text-muted-foreground inline-flex items-center"><X className="w-3 h-3"/>Reset</button></div>}
    {showFilters&&<Card className="p-4 mb-4"><div className="flex justify-between mb-3"><p className="font-semibold">Refine your move</p><button onClick={reset} className="text-xs font-semibold text-primary">Clear all</button></div>
      <Label text="City"><select value={f.city} onChange={e=>setF({city:e.target.value,areas:[]})} className="w-full h-10 rounded-lg border border-border bg-background px-3 text-sm">{CITY_OPTIONS.map(c=><option key={c.name}>{c.name}</option>)}</select></Label>
      {city.areas.length>0&&<Label text="Localities"><div className="flex flex-wrap gap-1.5">{city.areas.map(a=><Chip key={a} on={f.areas.includes(a)} label={a} click={()=>setF({areas:f.areas.includes(a)?f.areas.filter((x:string)=>x!==a):[...f.areas,a]})}/>)}</div></Label>}
      <Label text={`Maximum monthly rent ${f.maxRent?money(f.maxRent):"· any"}`}><input type="range" min="0" max="70000" step="1000" value={f.maxRent} onChange={e=>setF({maxRent:+e.target.value})} className="w-full accent-[var(--primary)]"/></Label>
      <Label text="Room type"><div className="flex flex-wrap gap-1.5">{["Private room","Twin sharing","Shared room","Entire flat"].map(x=><Chip key={x} on={f.roomType===x} label={x} click={()=>setF({roomType:f.roomType===x?"":x})}/>)}</div></Label>
      <Label text="Preferences"><div className="flex flex-wrap gap-1.5"><Chip on={f.verifiedOnly} label="Verified only" click={()=>setF({verifiedOnly:!f.verifiedOnly})}/><Chip on={f.freshOnly} label="Fresh in 3 days" click={()=>setF({freshOnly:!f.freshOnly})}/>{["Male","Female"].map(x=><Chip key={x} on={f.gender===x} label={`${x} household`} click={()=>setF({gender:f.gender===x?"":x})}/>)}</div></Label>
      <Label text="Sort"><div className="flex flex-wrap gap-1.5">{[["match","Best match"],["trust","Most trusted"],["price","Lowest rent"],["new","Freshest"]].map(([k,l])=><Chip key={k} on={f.sort===k} label={l} click={()=>setF({sort:k})}/>)}</div></Label>
      <Btn className="w-full" onClick={()=>setShowFilters(false)}>Show {counts[tab]} results</Btn>
    </Card>}
    {counts[tab]===0?<Card className="p-6"><p className="font-display text-lg font-semibold">No honest match for these filters yet</p><p className="text-sm text-muted-foreground mt-1">Try a nearby locality, remove one filter, or send the exact requirement to Gharpayy.</p><div className="flex flex-wrap gap-2 mt-4"><button onClick={reset} className="h-10 px-4 rounded-lg border border-border text-sm font-semibold">Reset filters</button><WhatsAppHelp module="Discover" action="Find a match when filters return no results" city={f.city} area={f.areas[0]}/></div></Card>:<>
      {(tab==="all"||tab==="rooms")&&<Section title={`${results.rooms.length} rooms`}><div className="space-y-3">{results.rooms.map((x:any)=><RoomCard key={x.id} me={me} r={x}/>)}</div></Section>}
      {(tab==="all"||tab==="people")&&<Section title={`${results.people.length} people`}><div className="space-y-3">{results.people.map((x:any)=><PersonCard key={x.id} me={me} p={x}/>)}</div></Section>}
      {(tab==="all"||tab==="groups")&&<Section title={`${results.groups.length} groups forming`}><div className="space-y-3">{results.groups.map((x:any)=><GroupCard key={x.id} g={x} people={db.people}/>)}</div></Section>}
      {(tab==="all"||tab==="flats")&&<Section title={`${results.flats.length} whole flats`}><div className="space-y-3">{results.flats.map((x:any)=><FlatCard key={x.id} me={me} f={x}/>)}</div></Section>}
      {(tab==="all"||tab==="ready")&&<Section title={`${results.ready.length} ready now`}><div className="space-y-3">{results.ready.map((x:any)=><ReadyCard key={x.id} s={x}/>)}</div></Section>}
    </>}
    <Card className="p-4 mt-5 flex items-center gap-3"><MessageCircle className="w-5 h-5 text-success"/><div className="flex-1"><p className="text-sm font-semibold">Search feels stuck?</p><p className="text-xs text-muted-foreground">Gharpayy can take over with your filters attached.</p></div><WhatsAppHelp module="Discover" action="Take over my current search" city={f.city} area={f.areas[0]} label="Get help"/></Card>
  </FMShell>;
}
function Label({text,children}:any){return <div className="mb-4"><p className="text-xs font-semibold text-muted-foreground mb-1.5">{text}</p>{children}</div>}
function Chip({on,label,click}:any){return <button onClick={click} className={`h-8 px-2.5 rounded-lg border text-xs font-semibold ${on?"bg-primary text-primary-foreground border-primary":"bg-card border-border"}`}>{on?"✓ ":""}{label}</button>}