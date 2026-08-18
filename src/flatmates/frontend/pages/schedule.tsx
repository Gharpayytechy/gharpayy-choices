// @ts-nocheck
import { useState } from "react";
import { Link, useSearch, useLocation } from "wouter";
import { FMShell, Card, Btn, Pill, Section } from "@/referral-app/components/flatmates/Shell";
import { Meetings, useFM, addMeeting } from "@/referral-app/lib/flatmates/store";

const SLOTS = ["Today 6:30 PM", "Tomorrow 11:00 AM", "Tomorrow 7:00 PM", "Sat 10:30 AM", "Sat 5:00 PM", "Sun 12:00 PM"];
const PLACES = ["At the flat", "Video call", "Coffee nearby"];

export default function SchedulePage() {
  const q = new URLSearchParams(useSearch());
  const [, nav] = useLocation();
  const meetings = useFM(() => Meetings.all());
  const [slot, setSlot] = useState("");
  const [place, setPlace] = useState(PLACES[0]);
  const title = q.get("title") || "Flatmate meet";

  const book = () => { addMeeting({ title, slot, place }); nav("/flatmates/you"); };

  return (
    <FMShell title="Schedule a meet" back="/flatmates/inbox" tab="inbox">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <p className="text-sm text-slate-500 mt-1">Pick a slot. We'll send both sides a reminder and a safety check-in.</p>

      <Section title="Where">
        <div className="flex gap-2">{PLACES.map((p) => (
          <button key={p} onClick={() => setPlace(p)} className={`flex-1 h-10 rounded-xl text-sm font-medium border ${place === p ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-900/10"}`}>{p}</button>
        ))}</div>
      </Section>

      <Section title="When">
        <div className="grid grid-cols-2 gap-2">{SLOTS.map((s) => (
          <button key={s} onClick={() => setSlot(s)} className={`h-11 rounded-xl text-sm font-medium border ${slot === s ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-900/10"}`}>{s}</button>
        ))}</div>
      </Section>

      <Btn className="w-full mt-4" disabled={!slot} onClick={book}>Confirm Meet</Btn>
      <p className="text-xs text-slate-500 mt-2">Meet in daylight, tell someone where you're going, and never transfer money before seeing the place.</p>

      {meetings.length > 0 && (
        <Section title="Upcoming">
          <div className="space-y-2">{meetings.map((m: any) => (
            <Card key={m.id} className="p-3.5 flex justify-between items-center">
              <div><p className="font-semibold text-sm">{m.title}</p><p className="text-xs text-slate-500">{m.slot} · {m.place}</p></div>
              <Pill tone="green">Confirmed</Pill>
            </Card>
          ))}</div>
        </Section>
      )}
    </FMShell>
  );
}

export function SafetyPage() {
  const items = [
    ["Never pay before you see it", "No deposit, token or booking amount before an in-person or video visit of the actual room."],
    ["Verify the person, not the photos", "Ask for a video call in the flat. Photos can be copied from anywhere."],
    ["Meet in daylight, tell a friend", "Share your live location with someone for the first visit."],
    ["Keep money on the record", "Use a traceable transfer with a written agreement. Avoid cash."],
    ["Read the agreement", "Notice period, deposit refund timeline, lock-in and exit clauses matter more than the rent."],
  ];
  return (
    <FMShell title="Safety centre" back="/flatmates/you">
      <h2 className="text-2xl font-semibold tracking-tight">Five rules that prevent almost every problem</h2>
      <div className="space-y-3 mt-4">
        {items.map(([t, d]: any, i: number) => (
          <Card key={t} className="p-4"><p className="font-semibold">{i + 1}. {t}</p><p className="text-sm text-slate-600 mt-1">{d}</p></Card>
        ))}
      </div>
      <Card className="p-4 mt-4 bg-red-50 border-red-200">
        <p className="font-semibold text-red-900">Report a listing or person</p>
        <p className="text-sm text-red-800/80 mt-1">Suspicious payment requests, fake photos, or harassment — we act within 24 hours.</p>
        <a href="https://wa.me/919999999999?text=I%20want%20to%20report%20a%20listing" target="_blank" rel="noreferrer" className="inline-block mt-3 h-10 px-4 leading-10 rounded-xl bg-red-600 text-white text-sm font-semibold">Report now</a>
      </Card>
    </FMShell>
  );
}
