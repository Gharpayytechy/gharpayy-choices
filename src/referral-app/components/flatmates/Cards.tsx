// @ts-nocheck
import { Link } from "wouter";
import { MapPin, Users, CalendarDays, Briefcase } from "lucide-react";
import { Card, Pill, MatchRing, SaveBtn, money, shortDate, freshness, VerifiedRow } from "./Shell";
import { toggleSave, isSaved, useFM, Saves } from "@/referral-app/lib/flatmates/store";
import { scoreMatch } from "@/referral-app/lib/flatmates/match";

function useSaved(kind: string, id: string) {
  return useFM(() => isSaved(kind, id));
}

export function PersonCard({ me, p }: any) {
  const { score } = scoreMatch(me, p);
  const saved = useSaved("person", p.id);
  return (
    <Card className="p-4">
      <div className="flex gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-200 to-amber-100 grid place-items-center text-lg font-bold text-orange-700 shrink-0">
          {p.name[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <Link href={`/flatmates/person/${p.id}`} className="font-semibold tracking-tight hover:underline">
                {p.name}, {p.age}
              </Link>
              <p className="text-xs text-slate-500 truncate">{p.occupation} · {p.company}</p>
            </div>
            <MatchRing score={score} />
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2 text-[11px] text-slate-600">
            <Pill><MapPin className="w-3 h-3" />{p.area}</Pill>
            <Pill>{money(p.budgetIdeal)}–{money(p.budgetMax)}</Pill>
            <Pill><CalendarDays className="w-3 h-3" />{shortDate(p.moveIn)}</Pill>
            <Pill>{p.roomType}</Pill>
          </div>
          <div className="mt-2"><VerifiedRow v={p.verified} /></div>
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <SaveBtn saved={saved} onClick={() => toggleSave("person", p.id)} />
        <Link href={`/flatmates/person/${p.id}`} className="flex-1 h-9 rounded-xl border border-slate-900/12 grid place-items-center text-sm font-semibold">View Profile</Link>
        <Link href={`/flatmates/interest/person/${p.id}`} className="flex-1 h-9 rounded-xl bg-slate-900 text-white grid place-items-center text-sm font-semibold">Interested</Link>
      </div>
    </Card>
  );
}

export function RoomCard({ me, r }: any) {
  const { score } = scoreMatch(me, r);
  const saved = useSaved("room", r.id);
  return (
    <Card className="overflow-hidden">
      <div className="h-28 bg-gradient-to-br from-slate-200 via-slate-100 to-orange-50 relative">
        <div className="absolute top-2 left-2 flex gap-1.5">
          {r.type === "ROOM_REPLACEMENT" && <Pill tone="orange">Replacement</Pill>}
          <Pill tone="green">{freshness(r.verifiedAt)}</Pill>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <Link href={`/flatmates/room/${r.id}`} className="font-semibold tracking-tight hover:underline block truncate">{r.title}</Link>
            <p className="text-xs text-slate-500">{r.roomType} · {r.area} · {r.bhk}BHK</p>
          </div>
          <MatchRing score={score} />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-bold tabular-nums">{money(r.rent)}</span>
          <span className="text-xs text-slate-500">/month · {money(r.deposit)} deposit</span>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          <Pill><CalendarDays className="w-3 h-3" />Available {shortDate(r.availableFrom)}</Pill>
          <Pill><Users className="w-3 h-3" />{r.residents} residents</Pill>
          {r.genderPref !== "Any" && <Pill>{r.genderPref} household</Pill>}
          <Pill>{r.commuteKm} km away</Pill>
        </div>
        <div className="flex gap-2 mt-3">
          <SaveBtn saved={saved} onClick={() => toggleSave("room", r.id)} />
          <Link href={`/flatmates/room/${r.id}`} className="flex-1 h-9 rounded-xl border border-slate-900/12 grid place-items-center text-sm font-semibold">View Room</Link>
          <Link href={`/flatmates/interest/room/${r.id}`} className="flex-1 h-9 rounded-xl bg-slate-900 text-white grid place-items-center text-sm font-semibold">Interested</Link>
        </div>
      </div>
    </Card>
  );
}

export function FlatCard({ me, f }: any) {
  const perPerson = Math.round(f.rent / Math.max(1, f.bhk));
  const saved = useSaved("flat", f.id);
  return (
    <Card className="overflow-hidden">
      <div className="h-24 bg-gradient-to-br from-emerald-100 via-slate-100 to-slate-200" />
      <div className="p-4">
        <Link href={`/flatmates/flat/${f.id}`} className="font-semibold tracking-tight hover:underline block">{f.title}</Link>
        <p className="text-xs text-slate-500">{f.bhk}BHK · {f.area} · {f.furnishing}</p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-bold tabular-nums">{money(f.rent)}</span>
          <span className="text-xs text-slate-500">/month · {money(perPerson)} per person with {f.bhk}</span>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          <Pill><CalendarDays className="w-3 h-3" />{shortDate(f.availableFrom)}</Pill>
          <Pill>Great for {f.bhk} people</Pill>
        </div>
        <div className="flex gap-2 mt-3">
          <SaveBtn saved={saved} onClick={() => toggleSave("flat", f.id)} />
          <Link href={`/flatmates/flat/${f.id}`} className="flex-1 h-9 rounded-xl border border-slate-900/12 grid place-items-center text-sm font-semibold">View</Link>
          <Link href={`/flatmates/groups?flat=${f.id}`} className="flex-1 h-9 rounded-xl bg-slate-900 text-white grid place-items-center text-sm font-semibold">Build a Group</Link>
        </div>
      </div>
    </Card>
  );
}

export function GroupCard({ g, people }: any) {
  const members = (g.memberIds || []).map((id: string) => people.find((p: any) => p.id === id)).filter(Boolean);
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <Link href={`/flatmates/group/${g.id}`} className="font-semibold tracking-tight hover:underline">{g.name}</Link>
          <p className="text-xs text-slate-500">{g.bhk}BHK plan · {g.area} · moving {shortDate(g.moveIn)}</p>
        </div>
        <MatchRing score={g.compatibility} />
      </div>
      <div className="flex -space-x-2 mt-3">
        {members.map((m: any) => (
          <span key={m.id} className="w-8 h-8 rounded-full bg-orange-100 border-2 border-white grid place-items-center text-xs font-bold text-orange-700">{m.name[0]}</span>
        ))}
        <span className="w-8 h-8 rounded-full bg-slate-900 border-2 border-white grid place-items-center text-[10px] font-bold text-white">You?</span>
      </div>
      <p className="text-xs text-slate-500 mt-2">Combined household capacity <b className="text-slate-900">{money(g.budget)}</b>/month</p>
      <div className="flex gap-2 mt-3">
        <Link href={`/flatmates/group/${g.id}`} className="flex-1 h-9 rounded-xl border border-slate-900/12 grid place-items-center text-sm font-semibold">Meet Them</Link>
        <Link href={`/flatmates/group/${g.id}?join=1`} className="flex-1 h-9 rounded-xl bg-slate-900 text-white grid place-items-center text-sm font-semibold">Join Group</Link>
      </div>
    </Card>
  );
}

export function ReadyCard({ s }: any) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold tracking-tight">{s.title}</p>
          <p className="text-xs text-slate-500">{s.roomType} · {s.distance} away{s.food ? " · food included" : ""}</p>
        </div>
        <Pill tone="green">Ready {s.ready}</Pill>
      </div>
      <div className="mt-2 text-lg font-bold tabular-nums">{money(s.rent)}<span className="text-xs font-normal text-slate-500">/month</span></div>
      <div className="flex gap-2 mt-3">
        <Link href="/app/pg" className="flex-1 h-9 rounded-xl border border-slate-900/12 grid place-items-center text-sm font-semibold">View</Link>
        <Link href={`/flatmates/schedule?title=${encodeURIComponent(s.title)}`} className="flex-1 h-9 rounded-xl bg-orange-500 text-white grid place-items-center text-sm font-semibold">Schedule Visit</Link>
      </div>
    </Card>
  );
}
