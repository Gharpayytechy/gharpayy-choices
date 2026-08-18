// @ts-nocheck
import { useEffect } from "react";
import { Link } from "wouter";
import { FMShell, Section, Card, Pill, KPI, Meter, LinkBtn, timeAgo } from "@/flatmates/frontend/components/Shell";
import { useFM } from "@/flatmates/backend/store/store";
import { seedFlatmates } from "@/flatmates/backend/store/seed";
import { pipeline, nextActions, STAGES } from "@/flatmates/backend/services/intel";
import { ArrowRight, Flame, Clock, Compass } from "lucide-react";

const urgencyMeta: any = {
  now: { tone: "orange", label: "Do this now", icon: Flame },
  soon: { tone: "amber", label: "This week", icon: Clock },
  explore: { tone: "slate", label: "Keep momentum", icon: Compass },
};

export default function Pipeline() {
  useEffect(() => { seedFlatmates(); }, []);
  const p = useFM(() => pipeline());
  const actions = useFM(() => nextActions());
  const done = p.byStage.filter((s: any) => s.items.length).length;

  return (
    <FMShell title="Your move" sub="Every conversation, visit and signature in one pipeline" tab="home">
      <div className="grid grid-cols-3 gap-2 mb-6">
        <KPI label="In play" value={p.total} hint="rooms & people" />
        <KPI label="Conversion" value={p.conversion + "%"} tone="primary" hint="reached visit+" />
        <KPI label="Stages live" value={`${done}/${STAGES.length}`} tone="good" hint="of the journey" />
      </div>

      <Section eyebrow="Next best action" title="What actually moves you in" sub="Ranked by impact on getting keys in your hand.">
        <div className="space-y-2">
          {actions.map((a: any, i: number) => {
            const m = urgencyMeta[a.urgency] || urgencyMeta.explore;
            return (
              <Card key={i} className="p-4">
                <Pill tone={m.tone}><m.icon className="w-3 h-3" />{m.label}</Pill>
                <h3 className="font-display font-semibold tracking-tight mt-2">{a.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{a.body}</p>
                <Link href={a.to} className="inline-flex items-center gap-1 text-sm font-semibold text-primary mt-2">
                  {a.cta} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Card>
            );
          })}
        </div>
      </Section>

      <Section eyebrow="Pipeline" title="Interest → chat → visit → agreement → move-in" sub="Nothing here goes stale silently.">
        <div className="space-y-3">
          {p.byStage.map((s: any, i: number) => (
            <Card key={s.key} className="p-4">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-primary/10 text-primary grid place-items-center text-xs font-bold shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold tracking-tight text-sm">{s.label}</p>
                  <p className="text-[11px] text-muted-foreground">{s.hint}</p>
                </div>
                <span className="font-display text-lg font-bold tabular-nums">{s.items.length}</span>
              </div>
              <div className="mt-2.5">
                <Meter value={p.total ? (s.items.length / p.total) * 100 : 0} tone={s.key === "movein" ? "good" : "primary"} />
              </div>
              {!!s.items.length && (
                <div className="mt-3 space-y-1.5">
                  {s.items.slice(0, 4).map((c: any) => (
                    <Link
                      key={c.refId}
                      href={c.threadId ? `/flatmates/chat/${c.threadId}` : `/flatmates/${c.kind}/${c.refId}`}
                      className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 hover:bg-muted transition-colors"
                    >
                      <span className="text-sm font-medium truncate flex-1">{c.title}</span>
                      {c.mutual && <Pill tone="green">Mutual</Pill>}
                      {c.at && <span className="text-[11px] text-muted-foreground shrink-0">{timeAgo(c.at)}</span>}
                    </Link>
                  ))}
                  {s.items.length > 4 && (
                    <p className="text-[11px] text-muted-foreground pl-1">+{s.items.length - 4} more</p>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      </Section>

      <Card className="p-4">
        <h3 className="font-display font-semibold tracking-tight">Nothing moves without a visit</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Seekers who book a visit within 48 hours of a mutual match move in nearly three times as often. Keep the pipeline shallow and fast.
        </p>
        <div className="flex gap-2 mt-3">
          <LinkBtn href="/flatmates/schedule" variant="primary" className="flex-1">Schedule a visit</LinkBtn>
          <LinkBtn href="/flatmates/discover" className="flex-1">Add matches</LinkBtn>
        </div>
      </Card>
    </FMShell>
  );
}
