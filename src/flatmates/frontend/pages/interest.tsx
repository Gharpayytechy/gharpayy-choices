// @ts-nocheck
import { useState } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { FMShell, Card, Btn, Pill } from "@/flatmates/frontend/components/Shell";
import { Rooms, People, Flats, sendInterest, hideItem, quota, useFM, Interests } from "@/flatmates/backend/store/store";
import { responseSla } from "@/flatmates/backend/services/intel";
import { ShieldCheck } from "lucide-react";

const REASONS = ["Same location", "Similar lifestyle", "Budget alignment", "Similar move-in", "Looking to form a flat together", "Their available room"];

export default function InterestPage() {
  const [, params] = useRoute("/flatmates/interest/:kind/:id");
  const [, nav] = useLocation();
  const kind = params?.kind;
  const item = kind === "room" ? Rooms.get(params.id) : kind === "flat" ? Flats.get(params.id) : People.get(params.id);
  const [picked, setPicked] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");
  const q = useFM(() => quota());
  if (!item) return <FMShell title="Interest" back="/flatmates"><Card className="p-6">This is no longer available.</Card></FMShell>;
  const title = item.title || item.name;
  const sla = responseSla(item);

  const send = () => {
    const res = sendInterest(kind, item.id, title, picked, note);
    if (!res.ok) {
      setErr(res.reason === "quota"
        ? "You've used all 5 requests for today. A fresh set of picks and requests unlocks tomorrow."
        : "You've already sent a request here — it's waiting for their answer.");
      return;
    }
    nav(`/flatmates/mutual/${res.interest.id}`);
  };

  return (
    <FMShell title="Send request" back={kind === "room" ? `/flatmates/room/${item.id}` : `/flatmates/person/${item.id}`}>
      <h2 className="text-2xl font-semibold tracking-tight">What interested you about {title}?</h2>
      <p className="text-sm text-slate-500 mt-1 mb-3">They accept or decline before any chat opens — so a specific request matters.</p>

      <Card className="p-3.5 mb-4 bg-emerald-50 border-emerald-200 flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-emerald-900">{sla.label}</p>
          <p className="text-xs text-emerald-800 mt-0.5">
            You have <b>{q.remaining} of {q.limit}</b> requests left today. Every one gets an answer within 48 hours.
          </p>
        </div>
      </Card>

      <div className="flex flex-wrap gap-2">
        {REASONS.map((r) => {
          const on = picked.includes(r);
          return <button key={r} onClick={() => setPicked(on ? picked.filter((x) => x !== r) : [...picked, r])}
            className={`px-3 h-9 rounded-xl text-sm font-medium border ${on ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-900/10"}`}>{r}</button>;
        })}
      </div>
      <textarea rows={4} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a personal message (optional)"
        className="w-full mt-4 p-3 rounded-xl border border-slate-900/10 bg-white text-sm outline-none focus:ring-2 focus:ring-slate-900/10" />
      {err && <p className="text-sm text-rose-600 mt-3">{err}</p>}
      <Btn className="w-full mt-3" disabled={!q.remaining} onClick={send}>
        {q.remaining ? `Send Request (${q.remaining} left today)` : "Daily requests used up"}
      </Btn>
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

/** Post-request screen. Live-updates the moment they accept or decline. */
export function MutualPage() {
  const [, params] = useRoute("/flatmates/mutual/:id");
  const req = useFM(() => Interests.get(params?.id));
  const q = useFM(() => quota());
  const status = req?.status || "pending";

  const copy = {
    pending: { icon: "📨", title: "Request sent", body: "They'll accept or decline — you'll have an answer within 48 hours. The chat opens only if they accept." },
    accepted: { icon: "🎉", title: "They accepted", body: "The chat is open. Both sides opted in." },
    declined: { icon: "🙏", title: "Not this one", body: `${req?.reason || "They passed"} — your requests aren't wasted, you get a fresh set tomorrow.` },
    expired: { icon: "⏳", title: "Request closed", body: "No answer in 48 hours, so we closed it and returned your slot." },
  }[status];

  return (
    <FMShell title={copy.title} back="/flatmates/inbox">
      <div className="text-center py-8">
        <div className="text-5xl mb-3">{copy.icon}</div>
        <h2 className="text-2xl font-semibold tracking-tight">{copy.title}</h2>
        <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">{copy.body}</p>
        <p className="text-xs text-slate-400 mt-3">{q.remaining} of {q.limit} requests left today</p>
        <div className="flex flex-col gap-2 mt-6 max-w-xs mx-auto">
          {status === "accepted" && req?.threadId && (
            <Link href={`/flatmates/chat/${req.threadId}`} className="h-11 rounded-xl bg-slate-900 text-white grid place-items-center text-sm font-semibold">Start Chat</Link>
          )}
          <Link href="/flatmates/inbox" className="h-11 rounded-xl border border-slate-900/12 grid place-items-center text-sm font-semibold">Open Inbox</Link>
          <Link href="/flatmates/discover" className="h-11 grid place-items-center text-sm font-semibold text-slate-500">Back to today's 10</Link>
        </div>
      </div>
    </FMShell>
  );
}
