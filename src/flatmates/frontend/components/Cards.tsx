// @ts-nocheck
import { Link } from "wouter";
import { MapPin, Users, CalendarDays, Sparkles } from "lucide-react";
import { Card, Pill, MatchRing, SaveBtn, money, shortDate, freshness, VerifiedRow } from "./Shell";
import { toggleSave, isSaved, useFM } from "@/flatmates/backend/store/store";
import { scoreMatch } from "@/flatmates/backend/store/match";
import { WhyChips, TrustBadge, ResponsePill } from "./Intel";

function useSaved(kind: string, id: string) {
  return useFM(() => isSaved(kind, id));
}

const btnGhost = "flex-1 h-9 rounded-xl border border-border bg-card grid place-items-center text-sm font-semibold hover:bg-muted transition-colors";
const btnSolid = "flex-1 h-9 rounded-xl bg-primary text-primary-foreground grid place-items-center text-sm font-semibold";

function WhyLink({ kind, id }: any) {
  return (
    <Link href={`/flatmates/match/${kind}/${id}`} className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary mt-2">
      <Sparkles className="w-3 h-3" />Why this matches
    </Link>
  );
}

export function PersonCard({ me, p }: any) {
  const { score, gates } = scoreMatch(me, p);
  const saved = useSaved("person", p.id);
  return (
    <Card className="p-4">
      <div className="flex gap-3">
        <div className="w-12 h-12 rounded-full bg-primary/10 grid place-items-center text-lg font-bold text-primary shrink-0 font-display">
          {p.name[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <Link href={`/flatmates/person/${p.id}`} className="font-display font-semibold tracking-tight hover:underline">
                {p.name}, {p.age}
              </Link>
              <p className="text-xs text-muted-foreground truncate">{p.occupation} · {p.company}</p>
            </div>
            <MatchRing score={score} />
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <Pill><MapPin className="w-3 h-3" />{p.area}</Pill>
            <Pill>{money(p.budgetIdeal)}–{money(p.budgetMax)}</Pill>
            <Pill><CalendarDays className="w-3 h-3" />{shortDate(p.moveIn)}</Pill>
            <Pill>{p.roomType}</Pill>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5"><TrustBadge entity={p} /><ResponsePill entity={p} /><VerifiedRow v={p.verified} /></div>
          <WhyChips me={me} item={p} />
          {!!gates.length && <Pill tone="red" className="mt-2">{gates[0]}</Pill>}
          <WhyLink kind="person" id={p.id} />
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <SaveBtn saved={saved} onClick={() => toggleSave("person", p.id)} />
        <Link href={`/flatmates/person/${p.id}`} className={btnGhost}>View profile</Link>
        <Link href={`/flatmates/interest/person/${p.id}`} className={btnSolid}>Interested</Link>
      </div>
    </Card>
  );
}

export function RoomCard({ me, r }: any) {
  const { score, gates } = scoreMatch(me, r);
  const saved = useSaved("room", r.id);
  const allIn = r.rent + (r.maintenance || 0) + (r.utilities || 0);
  return (
    <Card className="overflow-hidden">
      <div className="h-28 bg-gradient-to-br from-muted via-muted to-primary/10 relative">
        <div className="absolute top-2 left-2 flex gap-1.5">
          {r.type === "ROOM_REPLACEMENT" && <Pill tone="orange">Replacement</Pill>}
          <Pill tone="green">{freshness(r.verifiedAt)}</Pill>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <Link href={`/flatmates/room/${r.id}`} className="font-display font-semibold tracking-tight hover:underline block truncate">{r.title}</Link>
            <p className="text-xs text-muted-foreground">{r.roomType} · {r.area} · {r.bhk}BHK</p>
          </div>
          <MatchRing score={score} />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-display text-lg font-bold tabular-nums">{money(r.rent)}</span>
          <span className="text-xs text-muted-foreground">/month · {money(allIn)} all-in · {money(r.deposit)} deposit</span>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          <Pill><CalendarDays className="w-3 h-3" />Available {shortDate(r.availableFrom)}</Pill>
          <Pill><Users className="w-3 h-3" />{r.residents} residents</Pill>
          {r.genderPref !== "Any" && <Pill>{r.genderPref} household</Pill>}
          <Pill>{r.commuteKm} km away</Pill>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5"><TrustBadge entity={r} /><ResponsePill entity={r} /></div>
        <WhyChips me={me} item={r} />
        {!!gates.length && <Pill tone="red" className="mt-2">{gates[0]}</Pill>}
        <WhyLink kind="room" id={r.id} />
        <div className="flex gap-2 mt-3">
          <SaveBtn saved={saved} onClick={() => toggleSave("room", r.id)} />
          <Link href={`/flatmates/room/${r.id}`} className={btnGhost}>View room</Link>
          <Link href={`/flatmates/interest/room/${r.id}`} className={btnSolid}>Interested</Link>
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
      <div className="h-24 bg-gradient-to-br from-emerald-50 via-muted to-muted" />
      <div className="p-4">
        <Link href={`/flatmates/flat/${f.id}`} className="font-display font-semibold tracking-tight hover:underline block">{f.title}</Link>
        <p className="text-xs text-muted-foreground">{f.bhk}BHK · {f.area} · {f.furnishing}</p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-display text-lg font-bold tabular-nums">{money(f.rent)}</span>
          <span className="text-xs text-muted-foreground">/month · {money(perPerson)} per person with {f.bhk}</span>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-2">
          <Pill><CalendarDays className="w-3 h-3" />{shortDate(f.availableFrom)}</Pill>
          <Pill>Great for {f.bhk} people</Pill>
        </div>
        <WhyLink kind="flat" id={f.id} />
        <div className="flex gap-2 mt-3">
          <SaveBtn saved={saved} onClick={() => toggleSave("flat", f.id)} />
          <Link href={`/flatmates/flat/${f.id}`} className={btnGhost}>View</Link>
          <Link href={`/flatmates/groups?flat=${f.id}`} className={btnSolid}>Build a group</Link>
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
          <Link href={`/flatmates/group/${g.id}`} className="font-display font-semibold tracking-tight hover:underline">{g.name}</Link>
          <p className="text-xs text-muted-foreground">{g.bhk}BHK plan · {g.area} · moving {shortDate(g.moveIn)}</p>
        </div>
        <MatchRing score={g.compatibility} />
      </div>
      <div className="flex -space-x-2 mt-3">
        {members.map((m: any) => (
          <span key={m.id} className="w-8 h-8 rounded-full bg-primary/10 border-2 border-card grid place-items-center text-xs font-bold text-primary">{m.name[0]}</span>
        ))}
        <span className="w-8 h-8 rounded-full bg-foreground border-2 border-card grid place-items-center text-[10px] font-bold text-background">You?</span>
      </div>
      <p className="text-xs text-muted-foreground mt-2">Combined household capacity <b className="text-foreground">{money(g.budget)}</b>/month</p>
      <div className="flex gap-2 mt-3">
        <Link href={`/flatmates/group/${g.id}`} className={btnGhost}>Meet them</Link>
        <Link href={`/flatmates/group/${g.id}?join=1`} className={btnSolid}>Join group</Link>
      </div>
    </Card>
  );
}

export function ReadyCard({ s }: any) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-display font-semibold tracking-tight">{s.title}</p>
          <p className="text-xs text-muted-foreground">{s.roomType} · {s.distance} away{s.food ? " · food included" : ""}</p>
        </div>
        <Pill tone="green">Ready {s.ready}</Pill>
      </div>
      <div className="mt-2 font-display text-lg font-bold tabular-nums">{money(s.rent)}<span className="text-xs font-normal text-muted-foreground">/month</span></div>
      <div className="flex gap-2 mt-3">
        <Link href="/flatmates/ready" className={btnGhost}>View</Link>
        <Link href={`/flatmates/schedule?title=${encodeURIComponent(s.title)}`} className={btnSolid}>Schedule visit</Link>
      </div>
    </Card>
  );
}
