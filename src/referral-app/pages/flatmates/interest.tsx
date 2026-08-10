// @ts-nocheck
import { useState } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { FMShell, Card, Btn, Pill } from "@/referral-app/components/flatmates/Shell";
import { Rooms, People, Flats, sendInterest, hideItem } from "@/referral-app/lib/flatmates/store";

const REASONS = ["Same location", "Similar lifestyle", "Budget alignment", "Similar move-in", "Looking to form a flat together", "Their available room"];

export default function InterestPage() {
  const [, params] = useRoute("/flatmates/interest/:kind/:id");
  const [, nav] = useLocation();
  const kind = params?.kind;
  const item = kind === "room" ? Rooms.get(params.id) : kind === "flat" ? Flats.get(params.id) : People.get(params.id);
  const [picked, setPicked] = useState<string[]>([]);
  const [note, setNote] = useState("");
  if (!item) return <FMShell title="Interest" back="/flatmates"><Card className="p-6">This is no longer available.</Card></FMShell>;
  const title = item.title || item.name;

  const send = () => {
    const { thread, mutual } = sendInterest(kind, item.id, title, picked, note);
    nav(`/flatmates/mutual/${thread.id}${mutual ? "" : "?pending=1"}`);
  };

  return (
    <FMShell title="Send interest" back={kind === "room" ? `/flatmates/room/${item.id}` : `/flatmates/person/${item.id}`}>
      <h2 className="text-2xl font-semibold tracking-tight">What interested you about {title}?</h2>
      <p className="text-sm text-slate-500 mt-1 mb-4">Specific interest gets replies 2.4× more often than a blank ping.</p>
      <div className="flex flex-wrap gap-2">
        {REASONS.map((r) => {
          const on = picked.includes(r);
          return <button key={r} onClick={() => setPicked(on ? picked.filter((x) => x !== r) : [...picked, r])}
            className={`px-3 h-9 rounded-xl text-sm font-medium border ${on ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-900/10"}`}>{r}</button>;
        })}
      </div>
      <textarea rows={4} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a personal message (optional)"
        className="w-full mt-4 p-3 rounded-xl border border-slate-900/10 bg-white text-sm outline-none focus:ring-2 focus:ring-slate-900/10" />
      <Btn className="w-full mt-3" onClick={send}>Send Interest</Btn>
      <Link href={`/flatmates/not-for-me/${kind}/${item.id}`} className="block text-center text-sm text-slate-500 underline mt-4">Actually, not for me</Link>
    </FMShell>
  );
}

export function NotForMe() {
  const [, params] = useRoute("/flatmates/not-for-me/:kind/:id");
  const [, nav] = useLocation();
  const opts = ["Location", "Budget", "Room type", "Deposit", "Move-in date", "Household", "Lifestyle", "Property", "Something else"];
  return (
    <FMShell title="Not for me" back="/flatmates/discover">
      <h2 className="text-2xl font-semibold tracking-tight">What doesn't work?</h2>
      <p className="text-sm text-slate-500 mt-1 mb-4">We use this to stop showing you the wrong things.</p>
      <div className="flex flex-wrap gap-2">
        {opts.map((o) => (
          <button key={o} onClick={() => { hideItem(params.kind, params.id, o); nav("/flatmates/discover"); }}
            className="px-3 h-10 rounded-xl text-sm font-medium border bg-white border-slate-900/10 hover:border-slate-300">{o}</button>
        ))}
      </div>
    </FMShell>
  );
}

export function MutualPage() {
  const [, params] = useRoute("/flatmates/mutual/:id");
  const pending = typeof window !== "undefined" && window.location.search.includes("pending");
  return (
    <FMShell title={pending ? "Interest sent" : "It's mutual"} back="/flatmates/inbox">
      <div className="text-center py-8">
        <div className="text-5xl mb-3">{pending ? "📨" : "🎉"}</div>
        <h2 className="text-2xl font-semibold tracking-tight">{pending ? "Interest sent" : "It's mutual."}</h2>
        <p className="text-sm text-slate-500 mt-1">{pending ? "They'll be notified now. Most people reply within a day." : "You both want to explore this."}</p>
        <div className="flex flex-col gap-2 mt-6 max-w-xs mx-auto">
          <Link href={`/flatmates/chat/${params?.id}`} className="h-11 rounded-xl bg-slate-900 text-white grid place-items-center text-sm font-semibold">Start Chat</Link>
          <Link href="/flatmates/schedule" className="h-11 rounded-xl border border-slate-900/12 grid place-items-center text-sm font-semibold">Schedule a Meet</Link>
          <Link href="/flatmates/discover" className="h-11 grid place-items-center text-sm font-semibold text-slate-500">Keep browsing</Link>
        </div>
      </div>
    </FMShell>
  );
}
