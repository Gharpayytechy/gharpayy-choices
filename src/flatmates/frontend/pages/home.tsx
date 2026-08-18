// @ts-nocheck
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { ArrowRight, Building2, Home, KeyRound, MapPin, Search, Sparkles, Users, ShieldCheck, MessageCircle, ChevronDown } from "lucide-react";
import hero from "@/assets/flatmates-hero.jpg";
import { Card, Section, money } from "@/flatmates/frontend/components/Shell";
import { Rooms, People, Flats, useFM } from "@/flatmates/backend/store/store";
import { seedFlatmates } from "@/flatmates/backend/store/seed";
import { CITY_OPTIONS, cityByName } from "@/flatmates/backend/store/locations";
import { currentAccount } from "@/flatmates/backend/store/accounts";
import { WhatsAppHelp } from "@/flatmates/frontend/components/WhatsAppHelp";

/** The four canonical doors. We never ask "owner or tenant" — we ask what you're trying to do. */
const SETUPS = [
  { key: "need-room", icon: KeyRound, title: "I need a room or shared flat", sub: "Room Seeker · find somewhere you can actually live", to: "/flatmates/move", cta: "Find my place" },
  { key: "have-room", icon: Users, title: "I have a room, need a flatmate", sub: "Replacement Host · fill your room with the right person", to: "/flatmates/host", cta: "Find a flatmate" },
  { key: "own-property", icon: Building2, title: "I own a property, want occupants", sub: "Property Owner · fill your asset faster", to: "/flatmates/portfolio", cta: "Find tenants" },
  { key: "managed", icon: Home, title: "I want Gharpayy to manage it", sub: "Managed Property · we run the property for you", to: "/flatmates/managed", cta: "Manage my property" },
];

export default function FlatmatesHome() {
  useEffect(() => seedFlatmates(), []);
  const search = useSearch(); const params = new URLSearchParams(search);
  const [, nav] = useLocation();
  const [city, setCity] = useState(params.get("city") || "Bengaluru");
  const [area, setArea] = useState(params.get("area") || "");
  const [q, setQ] = useState("");
  const [setup, setSetup] = useState(params.get("setup") || "need-room");
  const account = useFM(() => currentAccount());
  const data = useFM(() => ({ rooms: Rooms.all().filter((x:any)=>x.status === "LIVE"), people: People.all(), flats: Flats.all().filter((x:any)=>x.status === "LIVE") }));
  const cityInfo = cityByName(city);
  const live = city === "Bengaluru";
  const selected = SETUPS.find((s)=>s.key===setup) || SETUPS[0];
  const counts = useMemo(() => ({ rooms:data.rooms.length, people:data.people.length, flats:data.flats.length }), [data]);
  const go = () => {
    const p = new URLSearchParams(); if (q) p.set("q",q); if(city) p.set("city",city); if(area) p.set("areas",area);
    const base = selected.to.split("?")[0]; const current = new URLSearchParams(selected.to.split("?")[1]||""); p.forEach((v,k)=>current.set(k,v));
    nav(`${base}?${current.toString()}`);
  };
  return <div className="min-h-[100dvh] bg-background text-foreground pb-24">
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-3">
        <Link href="/flatmates" className="flex items-center gap-2 min-w-0"><span className="w-8 h-8 rounded-lg bg-primary text-primary-foreground grid place-items-center font-display font-bold">G</span><span className="font-display font-bold">Gharpayy Flatmates</span></Link>
        <nav className="hidden md:flex items-center gap-1 ml-5 text-sm font-semibold text-muted-foreground"><Link href="/flatmates/discover" className="px-3 py-2 hover:text-foreground">Discover</Link><Link href="/flatmates/map" className="px-3 py-2 hover:text-foreground">Map</Link><Link href="/flatmates/publish" className="px-3 py-2 hover:text-foreground">List</Link><Link href="/flatmates/guide" className="px-3 py-2 hover:text-foreground">Guide</Link><Link href="/flatmates/playbook" className="px-3 py-2 hover:text-foreground">Playbook</Link></nav>
        <div className="ml-auto flex items-center gap-2">{account ? <Link href="/flatmates/inbox" className="h-9 px-3 rounded-lg border border-border grid place-items-center text-xs font-semibold">My inbox</Link> : <><Link href="/flatmates/login" className="hidden sm:grid h-9 px-3 place-items-center text-xs font-semibold">Log in</Link><Link href="/flatmates/signup" className="h-9 px-3 rounded-lg bg-primary text-primary-foreground grid place-items-center text-xs font-semibold">Join free</Link></>}</div>
      </div>
    </header>

    <main>
      <section className="relative min-h-[530px] lg:min-h-[600px] overflow-hidden text-primary-foreground">
        <img src={hero} alt="Flatmates spending time together in their Bengaluru home" width={1400} height={900} className="absolute inset-0 w-full h-full object-cover" fetchPriority="high" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,45,45,.94)_0%,rgba(15,45,45,.72)_43%,rgba(15,45,45,.12)_76%)]" />
        <div className="relative max-w-6xl mx-auto px-4 py-14 lg:py-20">
          <div className="max-w-xl">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-secondary">One app for every kind of move</p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.04] mt-3 text-primary-foreground">Find a home.<br/>Meet your people.</h1>
            <p className="mt-4 text-base sm:text-lg text-primary-foreground/80 max-w-lg">Rooms, flatmates, groups and whole homes—direct, verified and connected to a real Gharpayy expert when you need one.</p>
            <div className="mt-7 bg-card text-foreground rounded-lg p-3 shadow-[var(--shadow-pop)] max-w-lg">
              <div className="grid sm:grid-cols-[150px_1fr] gap-2">
                <label className="relative"><span className="sr-only">City</span><select value={city} onChange={(e)=>{setCity(e.target.value);setArea("")}} className="w-full h-11 appearance-none rounded-md border border-border bg-background pl-3 pr-8 text-sm font-semibold"><option disabled>Choose city</option>{CITY_OPTIONS.map(c=><option key={c.name}>{c.name}</option>)}</select><ChevronDown className="absolute right-3 top-3.5 w-4 h-4 pointer-events-none text-muted-foreground"/></label>
                <div className="relative"><Search className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground"/><input value={q} onChange={(e)=>setQ(e.target.value)} onKeyDown={(e)=>e.key==="Enter"&&go()} placeholder="Area, office, college or apartment" className="w-full h-11 rounded-md border border-border bg-background pl-9 pr-3 text-sm"/></div>
              </div>
              {cityInfo.areas.length > 0 && <div className="flex gap-1.5 overflow-x-auto py-2.5">{cityInfo.areas.slice(0,6).map(a=><button key={a} onClick={()=>setArea(area===a?"":a)} className={`shrink-0 h-8 px-2.5 rounded-md border text-xs font-semibold ${area===a?"bg-primary text-primary-foreground border-primary":"bg-card border-border"}`}>{a}</button>)}</div>}
              <button onClick={go} className="w-full h-11 rounded-md bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center gap-2">{selected.cta} <ArrowRight className="w-4 h-4"/></button>
            </div>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-primary-foreground/80"><span className="inline-flex items-center gap-1.5"><ShieldCheck className="w-4 h-4"/>Verified profiles</span><span>Every listing reviewed before it goes live</span><span>Zero brokerage</span><span>Chats after acceptance</span></div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-end justify-between gap-4 mb-4"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">Start with your setup</p><h2 className="font-display text-2xl sm:text-3xl font-bold mt-1">What do you need today?</h2></div><p className="hidden sm:block text-sm text-muted-foreground">Pick one. You can switch anytime.</p></div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">{SETUPS.map(s=><button key={s.key} onClick={()=>setSetup(s.key)} className={`text-left p-4 rounded-lg border transition-colors ${setup===s.key?"bg-primary text-primary-foreground border-primary":"bg-card border-border hover:border-primary/40"}`}><s.icon className="w-5 h-5"/><p className="font-semibold mt-3 leading-tight">{s.title}</p><p className={`text-xs mt-1 leading-5 ${setup===s.key?"text-primary-foreground/75":"text-muted-foreground"}`}>{s.sub}</p></button>)}</div>
        <div className="mt-3 grid sm:grid-cols-[1fr_auto] gap-2"><button onClick={go} className="h-11 rounded-lg bg-foreground text-background font-semibold text-sm">Continue with {selected.title.toLowerCase()}</button><WhatsAppHelp module="Home setup" action={selected.title} setup={setup} city={city} area={area} label="Ask Gharpayy on WhatsApp" className="h-11"/></div>
      </section>

      <section className="border-y border-border bg-card"><div className="max-w-6xl mx-auto px-4 py-9 grid grid-cols-3 gap-4 text-center"><div><p className="font-display text-3xl font-bold text-primary">{live?counts.rooms:"New"}</p><p className="text-xs text-muted-foreground mt-1">{live?"live rooms":"city waitlist"}</p></div><div><p className="font-display text-3xl font-bold text-primary">{live?counts.people:"24h"}</p><p className="text-xs text-muted-foreground mt-1">{live?"people looking":"expert response"}</p></div><div><p className="font-display text-3xl font-bold text-primary">{live?counts.flats:"0"}</p><p className="text-xs text-muted-foreground mt-1">{live?"whole homes":"brokerage"}</p></div></div></section>

      <section className="max-w-6xl mx-auto px-4 py-10">
        <Section title={live?"Fresh in Bengaluru":`Bring Flatmates to ${city}`} eyebrow={live?"Live marketplace":"Opening next"} sub={live?"Real options you can inspect before joining.":"Tell us your setup. We will help directly and notify you as local supply arrives."}>
          {live ? <div className="grid md:grid-cols-3 gap-3">{data.rooms.slice(0,3).map((r:any)=><Link key={r.id} href={`/flatmates/room/${r.id}`}><Card className="p-4 h-full"><p className="text-xs text-primary font-bold">{r.area}</p><p className="font-semibold mt-2">{r.title}</p><p className="text-sm text-muted-foreground mt-1">{r.roomType} · {money(r.rent)}/mo</p><p className="text-xs font-semibold text-primary mt-4">View room →</p></Card></Link>)}</div> : <Card className="p-5"><p className="font-semibold">We will not show you fake inventory.</p><p className="text-sm text-muted-foreground mt-1">Join the {city} early list or send your exact requirement to Gharpayy.</p><div className="flex flex-wrap gap-2 mt-4"><Link href={`/flatmates/signup?city=${encodeURIComponent(city)}&setup=${setup}`} className="h-10 px-4 rounded-lg bg-primary text-primary-foreground grid place-items-center text-sm font-semibold">Join {city}</Link><WhatsAppHelp module="New city" action="Help me find or list in a new city" setup={setup} city={city}/></div></Card>}
        </Section>
        <div className="grid md:grid-cols-3 gap-3"><Step n="01" title="Set your move" text="Choose your setup, city, areas and budget."/><Step n="02" title="Shortlist with proof" text="Compare compatibility, trust, all-in rent and freshness."/><Step n="03" title="Request, chat, meet" text="Chats open after acceptance; Gharpayy stays one tap away."/></div>
      </section>
    </main>
  </div>;
}
function Step({n,title,text}:any){return <div className="border-t-2 border-primary pt-3"><p className="text-xs font-bold text-primary">{n}</p><h3 className="font-display font-semibold mt-2">{title}</h3><p className="text-sm text-muted-foreground mt-1">{text}</p></div>}