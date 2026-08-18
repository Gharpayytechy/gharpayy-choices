// @ts-nocheck
import { Link, useRoute, useLocation } from "wouter";
import { useState } from "react";
import { FMShell, Card, Btn, Pill, Section, money, shortDate, freshness, VerifiedRow, MatchRing } from "@/flatmates/frontend/components/Shell";
import { Rooms, People, getMe, useFM, toggleSave, isSaved, hideItem, sendInterest, track } from "@/flatmates/backend/store/store";
import { explain } from "@/flatmates/backend/store/match";
import { MapPin, Users, ShieldCheck, AlertTriangle } from "lucide-react";

export default function RoomDetail() {
  const [, params] = useRoute("/flatmates/room/:id");
  const [, nav] = useLocation();
  const me = useFM(() => getMe());
  const r = useFM(() => Rooms.get(params?.id));
  const saved = useFM(() => isSaved("room", params?.id));
  if (!r) return <FMShell title="Room" back="/flatmates/discover"><Card className="p-6 text-center"><p className="font-semibold">This room just got filled.</p><Link href="/flatmates/discover" className="text-blue-800 text-sm font-semibold mt-2 inline-block">See 14 similar rooms →</Link></Card></FMShell>;

  const ex = explain(me, r);
  const total = r.rent + (r.maintenance || 0) + (r.utilities || 0);

  return (
    <FMShell title={r.area + " · " + r.roomType} back="/flatmates/discover" tab="discover">
      <div className="h-44 rounded-2xl bg-gradient-to-br from-slate-200 via-slate-100 to-blue-50 relative mb-4">
        <div className="absolute bottom-3 left-3 flex gap-1.5">
          <Pill tone="green"><ShieldCheck className="w-3 h-3" />{freshness(r.verifiedAt)}</Pill>
          {r.type === "ROOM_REPLACEMENT" && <Pill tone="orange">Replacement</Pill>}
        </div>
      </div>

      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h2 className="text-xl font-semibold tracking-tight">{r.title}</h2>
          <p className="text-sm text-slate-500">{r.bhk}BHK · {r.address || r.area} · available {shortDate(r.availableFrom)}</p>
        </div>
        <MatchRing score={ex.score} />
      </div>

      {ex.gates.length > 0 && (
        <Card className="p-3 mt-3 bg-amber-50 border-amber-200 flex gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-900">{ex.gates.join(" · ")}</div>
        </Card>
      )}

      <Section title="Pricing">
        <Card className="p-4 space-y-1.5 text-sm">
          <Row k="Rent" v={money(r.rent) + "/month"} bold />
          <Row k="Deposit" v={money(r.deposit)} />
          <Row k="Maintenance" v={money(r.maintenance || 0)} />
          <Row k="Utilities (est.)" v={money(r.utilities || 0)} />
          <Row k="Brokerage" v="₹0" />
          <div className="pt-2 mt-2 border-t border-slate-900/8"><Row k="Monthly all-in" v={money(total)} bold /></div>
        </Card>
      </Section>

      <Section title="The room">
        <div className="flex flex-wrap gap-1.5">
          <Pill>{r.roomType}</Pill><Pill>{r.bathroom} bathroom</Pill>
          {r.balcony && <Pill>Balcony</Pill>}<Pill>{r.furnishing}</Pill><Pill>{r.commuteKm} km from your anchor</Pill>
        </div>
      </Section>

      <Section title="Meet the household before the house" sub={`${r.residents} people currently live here`}>
        <Card className="p-4">
          <div className="space-y-2">
            {(r.householdMembers || []).map((m: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-full bg-blue-100 grid place-items-center text-sm font-bold text-blue-800">{m.name?.[0]}</span>
                <div className="text-sm"><b>{m.name}</b> · {m.age} · {m.work}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-900/8 text-sm text-slate-600">
            Household vibe: <b>{r.dna?.social || "Balanced"}</b> · cleaning by <b>{r.rules?.cleaning || "maid"}</b> · guests {String(r.rules?.guests || "occasionally").toLowerCase()}
          </div>
        </Card>
      </Section>

      <Section title={`Why this could work · ${ex.score}%`}>
        <Card className="p-4">
          <div className="space-y-2">
            {ex.parts.map((p: any) => (
              <div key={p.label}>
                <div className="flex justify-between text-xs mb-0.5"><span className="text-slate-600">{p.label}</span><span className="font-semibold tabular-nums">{p.score}</span></div>
                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden"><div className="h-full bg-slate-900" style={{ width: p.score + "%" }} /></div>
              </div>
            ))}
          </div>
          {ex.good.length > 0 && <ul className="mt-3 text-sm text-emerald-800 space-y-1">{ex.good.map((g: string) => <li key={g}>✓ {g}</li>)}</ul>}
          {ex.discuss.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-bold uppercase text-slate-500">Discuss first</p>
              <ul className="text-sm text-slate-700 space-y-1 mt-1">{ex.discuss.map((g: string) => <li key={g}>• {g}</li>)}</ul>
            </div>
          )}
        </Card>
      </Section>

      <Section title="House rules">
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(r.rules || {}).map(([k, v]: any) => <Pill key={k}>{k}: {String(v)}</Pill>)}
        </div>
      </Section>

      <Section title="Trust & safety">
        <Card className="p-4">
          <VerifiedRow v={r.verified} />
          <p className="text-xs text-slate-500 mt-2">Never pay a deposit before visiting and verifying the property. Gharpayy will never ask for cash transfers to individuals.</p>
          <Link href="/flatmates/safety" className="text-xs font-semibold text-blue-800 mt-1.5 inline-block">Safety centre →</Link>
        </Card>
      </Section>

      <div className="h-4" />
      <div className="fixed bottom-16 inset-x-0 z-30 bg-white/95 backdrop-blur border-t border-slate-900/10">
        <div className="max-w-2xl mx-auto px-4 py-2.5 flex gap-2">
          <button onClick={() => toggleSave("room", r.id)} className={`h-11 px-3 rounded-xl border text-sm font-semibold ${saved ? "border-sky-300 text-blue-800 bg-blue-50" : "border-slate-900/12"}`}>{saved ? "Saved" : "Save"}</button>
          <Link href={`/flatmates/schedule?title=${encodeURIComponent(r.title)}&room=${r.id}`} className="h-11 px-3 rounded-xl border border-slate-900/12 grid place-items-center text-sm font-semibold">Visit</Link>
          <Link href={`/flatmates/interest/room/${r.id}`} className="flex-1 h-11 rounded-xl bg-slate-900 text-white grid place-items-center text-sm font-semibold">I'm Interested</Link>
        </div>
      </div>
    </FMShell>
  );
}

function Row({ k, v, bold }: any) {
  return <div className="flex justify-between"><span className="text-slate-500">{k}</span><span className={bold ? "font-bold" : "font-medium"}>{v}</span></div>;
}
