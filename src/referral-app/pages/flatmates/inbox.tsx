// @ts-nocheck
import { useState } from "react";
import { Link, useRoute } from "wouter";
import { FMShell, Card, Pill, Btn, Section } from "@/referral-app/components/flatmates/Shell";
import { Threads, useFM, reply, Interests } from "@/referral-app/lib/flatmates/store";
import { Send } from "lucide-react";

const TABS = ["All", "Matches", "Rooms", "Groups", "Support"];

export default function Inbox() {
  const [tab, setTab] = useState("All");
  const threads = useFM(() => Threads.all());
  const filtered = threads.filter((t: any) =>
    tab === "All" ? true : tab === "Rooms" ? t.kind === "room" : tab === "Matches" ? t.mutual : tab === "Groups" ? t.kind === "group" : t.kind === "support");

  return (
    <FMShell title="Inbox" tab="inbox">
      <div className="flex gap-1.5 overflow-x-auto pb-3 -mx-4 px-4">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`shrink-0 px-3.5 h-9 rounded-full text-sm font-semibold border ${tab === t ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-900/10 text-slate-600"}`}>{t}</button>
        ))}
      </div>
      {!filtered.length ? (
        <Card className="p-6 text-center">
          <p className="font-semibold">No conversations yet</p>
          <p className="text-sm text-slate-500 mt-1">Send interest to a room or person and the chat opens here.</p>
          <Link href="/flatmates/discover" className="inline-block mt-3 h-10 px-4 rounded-xl bg-slate-900 text-white text-sm font-semibold leading-10">Find Matches</Link>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((t: any) => {
            const last = t.messages[t.messages.length - 1];
            return (
              <Link key={t.id} href={`/flatmates/chat/${t.id}`}>
                <Card className="p-3.5 flex gap-3 items-center">
                  <span className="w-10 h-10 rounded-full bg-orange-100 grid place-items-center font-bold text-orange-700">{t.title[0]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm truncate">{t.title}</p>
                      {t.mutual && <Pill tone="green">Mutual</Pill>}
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
        {t.messages.map((m: any, i: number) => (
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
