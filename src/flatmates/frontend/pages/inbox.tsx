// @ts-nocheck
import { useState, useEffect } from "react";
import { Link, useRoute } from "wouter";
import { FMShell, Card, Pill, Btn, Section } from "@/flatmates/frontend/components/Shell";
import {
  Threads, useFM, reply, Interests,
  incomingRequests, outgoingRequests, acceptInterest, declineInterest,
  sweepStaleRequests, ensureIncomingRequests,
} from "@/flatmates/backend/store/store";
import { requestHealth } from "@/flatmates/backend/services/intel";
import { seedFlatmates } from "@/flatmates/backend/store/seed";
import { Send, Check, X, Clock, ShieldCheck } from "lucide-react";

const TABS = ["Requests", "Chats", "Rooms", "Groups", "Support"];
const DECLINE_REASONS = ["Already filled", "Budget mismatch", "Different area", "Not a lifestyle fit"];

const ago = (iso: string) => {
  const h = Math.round((Date.now() - +new Date(iso)) / 3600000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.round(h / 24)}d ago`;
};

export default function Inbox() {
  const [tab, setTab] = useState("Requests");
  const [declining, setDeclining] = useState<string | null>(null);

  useEffect(() => { seedFlatmates(); ensureIncomingRequests(); sweepStaleRequests(); }, []);

  const threads = useFM(() => Threads.all());
  const incoming = useFM(() => incomingRequests());
  const outgoing = useFM(() => outgoingRequests());
  const health = useFM(() => requestHealth());
  useEffect(() => { console.log("DBG inbox", { incoming: incomingRequests().length, all: Interests.allRaw().length, threads: Threads.all().length }); });

  // Chats only exist for accepted requests — nobody can text you before that.
  const accepted = threads.filter((t: any) => t.accepted !== false);
  const filtered = accepted.filter((t: any) =>
    tab === "Chats" ? true : tab === "Rooms" ? t.kind === "room" : tab === "Groups" ? t.kind === "group" : t.kind === "support");

  return (
    <FMShell title="Inbox" tab="inbox">
      <div className="flex gap-1.5 overflow-x-auto pb-3 -mx-4 px-4">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`shrink-0 px-3.5 h-9 rounded-full text-sm font-semibold border ${tab === t ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-900/10 text-slate-600"}`}>
            {t}{t === "Requests" && incoming.length ? ` · ${incoming.length}` : ""}
          </button>
        ))}
      </div>

      {tab === "Requests" ? (
        <>
          <Card className="p-3.5 mb-3 bg-emerald-50 border-emerald-200">
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-emerald-900">Every request gets an answer</p>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Chats only open after both sides accept. Anything unanswered for 48h closes automatically —
                  you've answered {health.rate}% so far.
                </p>
              </div>
            </div>
          </Card>

          <Section title={`${incoming.length} waiting on you`}>
            {!incoming.length ? (
              <Card className="p-5 text-center">
                <p className="font-semibold text-sm">No requests right now</p>
                <p className="text-xs text-slate-500 mt-1">When someone wants to connect, you'll accept or decline here first.</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {incoming.map((r: any) => (
                  <Card key={r.id} className="p-3.5">
                    <div className="flex gap-3 items-start">
                      <span className="w-10 h-10 rounded-full bg-blue-100 grid place-items-center font-bold text-blue-800 shrink-0">{r.title?.[0]}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm truncate">{r.title}</p>
                          <span className="text-[11px] text-slate-400 shrink-0">{ago(r.at)}</span>
                        </div>
                        {!!r.reasons?.length && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {r.reasons.map((x: string) => <Pill key={x}>{x}</Pill>)}
                          </div>
                        )}
                        {r.note && <p className="text-xs text-slate-600 mt-1.5">"{r.note}"</p>}
                      </div>
                    </div>
                    {declining === r.id ? (
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-slate-500 mb-1.5">Why not a fit?</p>
                        <div className="flex flex-wrap gap-1.5">
                          {DECLINE_REASONS.map((reason) => (
                            <button key={reason} onClick={() => { declineInterest(r.id, reason); setDeclining(null); }}
                              className="px-2.5 h-8 rounded-lg text-xs font-medium border bg-white border-slate-900/10">{reason}</button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => setDeclining(r.id)}
                          className="flex-1 h-9 rounded-xl border border-slate-900/12 grid place-items-center text-xs font-semibold text-slate-600">
                          <span className="flex items-center gap-1"><X className="w-3.5 h-3.5" />Decline</span>
                        </button>
                        <button onClick={() => acceptInterest(r.id)}
                          className="flex-[2] h-9 rounded-xl bg-slate-900 text-white grid place-items-center text-xs font-semibold">
                          <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5" />Accept & open chat</span>
                        </button>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </Section>

          <Section title={`${outgoing.length} sent, awaiting reply`}>
            {!outgoing.length ? (
              <Card className="p-5 text-center">
                <p className="text-sm text-slate-500">Nothing pending. Send a request from today's picks.</p>
                <Link href="/flatmates/discover" className="inline-block mt-3 h-10 px-4 rounded-xl bg-slate-900 text-white text-sm font-semibold leading-10">Today's 10</Link>
              </Card>
            ) : (
              <div className="space-y-2">
                {outgoing.map((r: any) => (
                  <Card key={r.id} className="p-3.5 flex gap-3 items-center">
                    <span className="w-9 h-9 rounded-full bg-amber-100 grid place-items-center shrink-0"><Clock className="w-4 h-4 text-amber-700" /></span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{r.title}</p>
                      <p className="text-xs text-slate-500">Sent {ago(r.at)} · answer guaranteed within 48h</p>
                    </div>
                    <Pill tone="amber">Pending</Pill>
                  </Card>
                ))}
              </div>
            )}
          </Section>
        </>
      ) : !filtered.length ? (
        <Card className="p-6 text-center">
          <p className="font-semibold">No conversations yet</p>
          <p className="text-sm text-slate-500 mt-1">A chat opens only once a request is accepted by both sides.</p>
          <Link href="/flatmates/discover" className="inline-block mt-3 h-10 px-4 rounded-xl bg-slate-900 text-white text-sm font-semibold leading-10">Find Matches</Link>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((t: any) => {
            const last = t.messages[t.messages.length - 1];
            return (
              <Link key={t.id} href={`/flatmates/chat/${t.id}`}>
                <Card className="p-3.5 flex gap-3 items-center">
                  <span className="w-10 h-10 rounded-full bg-blue-100 grid place-items-center font-bold text-blue-800">{t.title[0]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm truncate">{t.title}</p>
                      {t.mutual && <Pill tone="green">Accepted</Pill>}
                    </div>
                    <p className="text-xs text-slate-500 truncate">{last?.text}</p>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </FMShell>
  );
}

const PROMPTS = ["Is the room still available?", "Can I visit this week?", "What's included in the rent?", "Can we have a quick call?"];

export function Chat() {
  const [, params] = useRoute("/flatmates/chat/:id");
  const t = useFM(() => Threads.get(params?.id));
  const [text, setText] = useState("");
  if (!t) return <FMShell title="Chat" back="/flatmates/inbox"><Card className="p-6">Conversation not found.</Card></FMShell>;

  if (t.accepted === false) {
    return (
      <FMShell title={t.title} back="/flatmates/inbox">
        <Card className="p-6 text-center">
          <div className="text-4xl mb-2">🔒</div>
          <p className="font-semibold">Waiting for them to accept</p>
          <p className="text-sm text-slate-500 mt-1">Messaging opens once your request is accepted. You'll get an answer within 48 hours.</p>
        </Card>
      </FMShell>
    );
  }

  const send = (msg: string) => {
    if (!msg.trim()) return;
    reply(t.id, msg);
    setText("");
    setTimeout(() => reply(t.id, "Sure — does Wednesday 6:30 PM work for a visit?", "them"), 900);
  };

  return (
    <FMShell title={t.title} back="/flatmates/inbox" tab="inbox">
      <div className="flex gap-2 mb-3">
        <Link href="/flatmates/schedule" className="flex-1 h-9 rounded-xl border border-slate-900/12 grid place-items-center text-xs font-semibold">Schedule Meet</Link>
        <Link href={t.kind === "room" ? `/flatmates/room/${t.refId}` : `/flatmates/person/${t.refId}`} className="flex-1 h-9 rounded-xl border border-slate-900/12 grid place-items-center text-xs font-semibold">View listing</Link>
        <button onClick={() => send("Here's my number — happy to call.")} className="flex-1 h-9 rounded-xl border border-slate-900/12 text-xs font-semibold">Share My Number</button>
      </div>

      <div className="space-y-2 mb-4">
        {(t.messages || []).map((m: any, i: number) => (
          <div key={i} className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm ${m.from === "me" ? "ml-auto bg-slate-900 text-white rounded-br-md" : "bg-white border border-slate-900/8 rounded-bl-md"}`}>
            {m.text}
          </div>
        ))}
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-2 -mx-4 px-4">
        {PROMPTS.map((p) => <button key={p} onClick={() => send(p)} className="shrink-0 px-3 h-8 rounded-full bg-white border border-slate-900/10 text-xs font-medium">{p}</button>)}
      </div>

      <div className="fixed bottom-16 inset-x-0 bg-white border-t border-slate-900/10">
        <div className="max-w-2xl mx-auto px-4 py-2 flex gap-2">
          <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send(text)}
            placeholder="Message…" className="flex-1 h-11 px-3 rounded-xl border border-slate-900/10 text-sm outline-none" />
          <button onClick={() => send(text)} className="w-11 h-11 rounded-xl bg-slate-900 text-white grid place-items-center"><Send className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="h-14" />
    </FMShell>
  );
}
