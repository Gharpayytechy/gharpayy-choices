// @ts-nocheck
import { Link, useRoute, useSearch, useLocation } from "wouter";
import { useState } from "react";
import { FMShell, Card, Btn, Pill, Section, money, shortDate, MatchRing } from "@/flatmates/frontend/components/Shell";
import { Groups, People, Flats, getMe, useFM, track, pushNotif } from "@/flatmates/backend/store/store";
import { FlatCard } from "@/flatmates/frontend/components/Cards";

export default function GroupsPage() {
  const me = useFM(() => getMe());
  const db = useFM(() => ({ groups: Groups.all(), people: People.all(), flats: Flats.all() }));
  const flatId = new URLSearchParams(useSearch()).get("flat");
  const flat = flatId ? Flats.get(flatId) : null;

  return (
    <FMShell title="Form a flat" back="/flatmates" tab="discover">
      <h2 className="text-2xl font-semibold tracking-tight">Don't have flatmates yet? Build the household first.</h2>
      <p className="text-sm text-slate-500 mt-1 mb-4">We group people by area overlap, budget capacity and move-in spread.</p>
      {flat && (
        <Card className="p-4 mb-4 bg-blue-50 border-blue-200">
          <p className="text-sm font-semibold">Building a group for {flat.title}</p>
          <p className="text-xs text-slate-600">{money(flat.rent)}/month · {money(Math.round(flat.rent / flat.bhk))} per person with {flat.bhk} people</p>
        </Card>
      )}
      <div className="space-y-3">
        {db.groups.map((g: any) => {
          const members = g.memberIds.map((id: string) => db.people.find((p: any) => p.id === id)).filter(Boolean);
          return (
            <Card key={g.id} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold tracking-tight">Possible {g.bhk}BHK household · {g.area}</p>
                  <p className="text-xs text-slate-500">Move-in spread {shortDate(g.moveIn)} · combined {money(g.budget)}</p>
                </div>
                <MatchRing score={g.compatibility} />
              </div>
              <div className="mt-3 space-y-1.5">
                <div className="text-sm">You</div>
                {members.map((m: any) => (
                  <div key={m.id} className="flex items-center justify-between text-sm">
                    <span>{m.name} · {m.occupation}</span>
                    <Link href={`/flatmates/person/${m.id}`} className="text-xs font-semibold text-blue-800">Meet {m.name.split(" ")[0]}</Link>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-3">
                <Link href={`/flatmates/group/${g.id}`} className="flex-1 h-9 rounded-xl border border-slate-900/12 grid place-items-center text-sm font-semibold">Not this group</Link>
                <Link href={`/flatmates/group/${g.id}?join=1`} className="flex-1 h-9 rounded-xl bg-slate-900 text-white grid place-items-center text-sm font-semibold">Invite Both</Link>
              </div>
            </Card>
          );
        })}
      </div>
    </FMShell>
  );
}

export function GroupRoom() {
  const [, params] = useRoute("/flatmates/group/:id");
  const g = useFM(() => Groups.get(params?.id));
  const people = useFM(() => People.all());
  const flats = useFM(() => Flats.all());
  const [votes, setVotes] = useState<any>({});
  const joined = typeof window !== "undefined" && window.location.search.includes("join");
  if (!g) return <FMShell title="Group" back="/flatmates/groups"><Card className="p-6">Group not found.</Card></FMShell>;
  const members = g.memberIds.map((id: string) => people.find((p: any) => p.id === id)).filter(Boolean);
  const shortlist = flats.filter((f: any) => f.area === g.area || f.bhk === g.bhk).slice(0, 3);

  const checklist = [
    ["Location aligned", g.checklist.location], ["Budget aligned", g.checklist.budget], ["Move-in aligned", g.checklist.moveIn],
    ["Household expectations", g.checklist.expectations], ["Choose flats", Object.keys(votes).length > 0], ["Visit booked", g.checklist.visit],
  ];

  return (
    <FMShell title={g.name} back="/flatmates/groups" tab="discover">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold">{members.length + (joined ? 1 : 0)}/{g.bhk} members</p>
            <p className="text-xs text-slate-500">Status: {joined ? "Getting to know each other" : "Open to join"}</p>
          </div>
          <MatchRing score={g.compatibility} />
        </div>
        <div className="flex -space-x-2 mt-3">
          {members.map((m: any) => <span key={m.id} className="w-9 h-9 rounded-full bg-blue-100 border-2 border-white grid place-items-center text-xs font-bold text-blue-800">{m.name[0]}</span>)}
          <span className="w-9 h-9 rounded-full bg-slate-900 border-2 border-white grid place-items-center text-[10px] font-bold text-white">You</span>
        </div>
      </Card>

      <Section title="Group checklist">
        <Card className="p-4 space-y-1.5">
          {checklist.map(([l, on]: any) => (
            <div key={l} className="flex items-center gap-2 text-sm">
              <span className={`w-4 h-4 rounded grid place-items-center text-[10px] ${on ? "bg-emerald-500 text-white" : "border border-slate-300"}`}>{on ? "✓" : ""}</span>
              <span className={on ? "" : "text-slate-500"}>{l}</span>
            </div>
          ))}
        </Card>
      </Section>

      <Section title="Flat shortlist" sub="Everyone votes — consensus decides the visit">
        <div className="space-y-3">
          {shortlist.map((f: any) => {
            const v = votes[f.id];
            const consensus = v === "yes" ? 100 : v === "maybe" ? 66 : v === "no" ? 33 : 0;
            return (
              <Card key={f.id} className="p-4">
                <p className="font-semibold">{f.title}</p>
                <p className="text-xs text-slate-500">{money(f.rent)}/mo · {money(Math.round(f.rent / f.bhk))} per person</p>
                <div className="flex gap-2 mt-2">
                  {[["yes", "👍 Yes"], ["maybe", "🤔 Maybe"], ["no", "👎 No"]].map(([k, l]: any) => (
                    <button key={k} onClick={() => setVotes({ ...votes, [f.id]: k })}
                      className={`flex-1 h-9 rounded-xl text-sm font-medium border ${v === k ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-900/10"}`}>{l}</button>
                  ))}
                </div>
                {v && <p className="text-xs text-slate-500 mt-2">Group consensus: <b>{consensus}%</b></p>}
              </Card>
            );
          })}
        </div>
      </Section>

      <div className="grid grid-cols-2 gap-2 mt-4">
        <Link href="/flatmates/inbox" className="h-11 rounded-xl border border-slate-900/12 grid place-items-center text-sm font-semibold">Group Chat</Link>
        <Link href="/flatmates/schedule" className="h-11 rounded-xl bg-slate-900 text-white grid place-items-center text-sm font-semibold">Schedule Group Visit</Link>
      </div>
    </FMShell>
  );
}
