// @ts-nocheck
import { Link } from "wouter";
import { FMShell, Card, Pill, Section, money, VerifiedRow } from "@/referral-app/components/flatmates/Shell";
import { getMe, useFM, Saved, Rooms, People, Interests, Meetings, createReplacement, resetFM } from "@/referral-app/lib/flatmates/store";
import { ShieldCheck, LogOut, Bookmark, CalendarDays, Home } from "lucide-react";

export default function You() {
  const me = useFM(() => getMe());
  const saved = useFM(() => Saved.all());
  const interests = useFM(() => Interests.all());
  const meetings = useFM(() => Meetings.all());

  return (
    <FMShell title="You" tab="you">
      <Card className="p-4">
        <div className="flex gap-3 items-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-200 to-amber-100 grid place-items-center text-xl font-bold text-orange-700">{(me.name || "You")[0]}</div>
          <div className="flex-1">
            <p className="text-lg font-semibold tracking-tight">{me.name || "Your profile"}</p>
            <p className="text-sm text-slate-500">{me.area} · {money(me.budgetIdeal || 0)}–{money(me.budgetMax || 0)}</p>
          </div>
          <Link href="/flatmates/onboard" className="text-xs font-semibold text-orange-600">Edit</Link>
        </div>
        <div className="mt-3"><VerifiedRow v={me.verified} /></div>
        <div className="mt-3">
          <div className="flex justify-between text-xs mb-1"><span className="text-slate-500">Profile strength</span><b>{me.strength || 60}%</b></div>
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: (me.strength || 60) + "%" }} /></div>
          <p className="text-xs text-slate-500 mt-1.5">Add a photo and verify your workplace to appear 3× higher in matches.</p>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-2 mt-3">
        <Stat icon={Bookmark} n={saved.length} l="Saved" />
        <Stat icon={Home} n={interests.length} l="Interests" />
        <Stat icon={CalendarDays} n={meetings.length} l="Meets" />
      </div>

      <Section title="Your move">
        <div className="space-y-2">
          <RowLink href="/flatmates/discover" t="Saved rooms & people" s={`${saved.length} items`} />
          <RowLink href="/flatmates/inbox" t="Interests sent & received" s={`${interests.length} conversations`} />
          <RowLink href="/flatmates/schedule" t="Scheduled meets" s={meetings[0]?.slot || "None yet"} />
          <RowLink href="/flatmates/groups" t="My groups" s="Form a flat with others" />
        </div>
      </Section>

      <Section title="My household" sub="Already living somewhere? Keep the flat full.">
        <Card className="p-4">
          <p className="font-semibold">Someone moving out?</p>
          <p className="text-sm text-slate-600 mt-1">Post the replacement in 30 seconds. We reuse your household profile so you only enter the room details.</p>
          <button onClick={() => { const r = createReplacement(); if (r) window.location.href = `/app/flatmates/room/${r.id}`; }}
            className="mt-3 h-11 w-full rounded-xl bg-slate-900 text-white text-sm font-semibold">Post a replacement</button>
        </Card>
      </Section>

      <Section title="Trust & settings">
        <div className="space-y-2">
          <RowLink href="/flatmates/safety" t="Safety centre" s="Five rules before you pay anything" />
          <RowLink href="/flatmates/post" t="My listings" s="Rooms and flats you've posted" />
        </div>
        <button onClick={() => { resetFM(); window.location.reload(); }} className="mt-3 text-xs text-slate-400 underline">Reset demo data</button>
      </Section>
    </FMShell>
  );
}

function Stat({ icon: Icon, n, l }: any) {
  return <Card className="p-3 text-center"><Icon className="w-4 h-4 mx-auto text-slate-400" /><p className="text-lg font-bold tabular-nums mt-1">{n}</p><p className="text-[11px] text-slate-500">{l}</p></Card>;
}
function RowLink({ href, t, s }: any) {
  return <Link href={href}><Card className="p-3.5 flex justify-between items-center"><div><p className="font-semibold text-sm">{t}</p><p className="text-xs text-slate-500">{s}</p></div><span className="text-slate-300">›</span></Card></Link>;
}
