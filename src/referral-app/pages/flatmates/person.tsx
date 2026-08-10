// @ts-nocheck
import { Link, useRoute } from "wouter";
import { FMShell, Card, Pill, Section, money, shortDate, VerifiedRow, MatchRing } from "@/referral-app/components/flatmates/Shell";
import { People, getMe, useFM, toggleSave, isSaved } from "@/referral-app/lib/flatmates/store";
import { explain } from "@/referral-app/lib/flatmates/match";

export default function PersonDetail() {
  const [, params] = useRoute("/flatmates/person/:id");
  const me = useFM(() => getMe());
  const p = useFM(() => People.get(params?.id));
  const saved = useFM(() => isSaved("person", params?.id));
  if (!p) return <FMShell title="Profile" back="/flatmates/discover"><Card className="p-6">This profile is no longer active. <Link href="/flatmates/discover" className="text-orange-600 font-semibold">See similar people →</Link></Card></FMShell>;
  const ex = explain(me, p);

  return (
    <FMShell title={p.name} back="/flatmates/discover" tab="discover">
      <Card className="p-4">
        <div className="flex gap-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-200 to-amber-100 grid place-items-center text-2xl font-bold text-orange-700">{p.name[0]}</div>
          <div className="flex-1">
            <div className="flex items-start"><div className="flex-1">
              <h2 className="text-xl font-semibold tracking-tight">{p.name}, {p.age}</h2>
              <p className="text-sm text-slate-500">{p.occupation} · {p.company}</p>
            </div><MatchRing score={ex.score} /></div>
            <div className="mt-2"><VerifiedRow v={p.verified} /></div>
          </div>
        </div>
        <p className="text-sm text-slate-600 mt-3">{p.bio}</p>
      </Card>

      <Section title="Their move">
        <div className="flex flex-wrap gap-1.5">
          <Pill>{p.area}</Pill><Pill>{money(p.budgetIdeal)}–{money(p.budgetMax)}</Pill>
          <Pill>Moving {shortDate(p.moveIn)}</Pill><Pill>{p.roomType}</Pill><Pill>{p.workMode}</Pill>
        </div>
      </Section>

      <Section title="Flatmate DNA">
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(p.dna || {}).map(([k, v]: any) => (
            <Card key={k} className="p-3"><p className="text-[10px] uppercase font-bold text-slate-400">{k}</p><p className="text-sm font-medium">{String(v)}</p></Card>
          ))}
        </div>
      </Section>

      <Section title={`Compatibility · ${ex.score}%`}>
        <Card className="p-4 space-y-2">
          {ex.parts.map((x: any) => (
            <div key={x.label}>
              <div className="flex justify-between text-xs mb-0.5"><span className="text-slate-600">{x.label}</span><span className="font-semibold tabular-nums">{x.score}</span></div>
              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden"><div className="h-full bg-slate-900" style={{ width: x.score + "%" }} /></div>
            </div>
          ))}
          {ex.good.length > 0 && <ul className="text-sm text-emerald-800 space-y-1 pt-2">{ex.good.map((g: string) => <li key={g}>✓ {g}</li>)}</ul>}
          {ex.discuss.length > 0 && <><p className="text-xs font-bold uppercase text-slate-500 pt-2">Discuss</p><ul className="text-sm text-slate-700 space-y-1">{ex.discuss.map((g: string) => <li key={g}>• {g}</li>)}</ul></>}
        </Card>
      </Section>

      <div className="flex gap-2 mt-4 mb-4">
        <button onClick={() => toggleSave("person", p.id)} className={`h-11 px-4 rounded-xl border text-sm font-semibold ${saved ? "border-orange-300 text-orange-600 bg-orange-50" : "border-slate-900/12"}`}>{saved ? "Saved" : "Save"}</button>
        <Link href={`/flatmates/interest/person/${p.id}`} className="flex-1 h-11 rounded-xl bg-slate-900 text-white grid place-items-center text-sm font-semibold">I'm Interested</Link>
      </div>
      <Link href="/flatmates/safety" className="text-xs text-slate-400 underline">Report or block this profile</Link>
    </FMShell>
  );
}
