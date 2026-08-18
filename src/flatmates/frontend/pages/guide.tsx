// @ts-nocheck
import { Link } from "wouter";
import { FMShell, Card, Section, Pill } from "@/flatmates/frontend/components/Shell";
import { ACTORS, ROLE_LABEL } from "@/flatmates/backend/store/actors";
import { ArrowRight } from "lucide-react";

const FLOWS = [
  { title: "Seeker journey", steps: ["Home ranks live rooms, people and flats by resolution probability", "Discover / Search to filter, Save what fits", "Send a request (5/day) — it is a request, not a chat", "Owner accepts → chat opens in Inbox → schedule a meeting", "Move in → Household, agreement check and move-out flow"], to: "/flatmates" },
  { title: "Poster / owner journey", steps: ["Supply desk shows your listings and every request", "Accept opens the chat; decline always sends a reason", "Post a room or a whole flat in under a minute", "See each listing the way a seeker sees it"], to: "/flatmates/owner" },
  { title: "Group journey", steps: ["Form-a-flat: build the household first", "Shortlist people, run the compatibility checklist", "Split budget, then take a flat together"], to: "/flatmates/groups" },
  { title: "Admin journey", steps: ["Control tower: funnel, bottleneck and health score", "Supply and demand desks with live alerts", "Owner portfolios and ops missions"], to: "/flatmates/admin" },
];

export default function FlatmatesGuide() {
  return (
    <FMShell title="Everything that's ready" sub="How to use the multi-account demo" back="/flatmates" tab="home" wide>
      <Card className="p-5 mb-6 border-primary/25 bg-primary/[0.05]">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">Read this first</p>
        <h2 className="font-display text-xl font-bold tracking-tight mt-1.5">All roles are live. No login required.</h2>
        <p className="text-sm text-muted-foreground mt-2 leading-6">
          Use the account button at the bottom right to become any seeker, a flatmate poster, an owner, a group lead or the platform admin.
          Each account keeps its own requirement, saved items, requests, chats, notifications and daily quota — so you can send a request as
          Aarav, switch to Neha, and accept it from the other side in the same sitting.
        </p>
      </Card>

      <Section title="Who you can be" eyebrow="Accounts">
        <div className="grid gap-3 md:grid-cols-2">
          {ACTORS.map((a) => (
            <Card key={a.id} className="p-4 fm-lift">
              <div className="flex items-center gap-2">
                <span className="text-xl">{a.emoji}</span>
                <p className="font-display font-semibold">{a.label}</p>
                <Pill className="ml-auto">{ROLE_LABEL[a.role]}</Pill>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{a.blurb}</p>
              <Link href={a.home} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">Their home screen <ArrowRight className="w-3.5 h-3.5" /></Link>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="How each side works" eyebrow="Flows">
        <div className="grid gap-3 md:grid-cols-2">
          {FLOWS.map((f) => (
            <Card key={f.title} className="p-4">
              <p className="font-display font-semibold">{f.title}</p>
              <ol className="mt-2 space-y-1.5">
                {f.steps.map((s, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex gap-2">
                    <span className="w-4 h-4 rounded-full bg-muted grid place-items-center text-[9px] font-bold text-foreground shrink-0">{i + 1}</span>{s}
                  </li>
                ))}
              </ol>
              <Link href={f.to} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">Open <ArrowRight className="w-3.5 h-3.5" /></Link>
            </Card>
          ))}
        </div>
      </Section>
    </FMShell>
  );
}
