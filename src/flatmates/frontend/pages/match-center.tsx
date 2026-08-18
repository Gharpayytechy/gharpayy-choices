// @ts-nocheck
import { useParams, Link } from "wouter";
import { FMShell, Card, Pill, Section, LinkBtn, Meter, money, shortDate, freshness } from "@/referral-app/components/flatmates/Shell";
import { getMe, useFM, People, Rooms, Flats } from "@/referral-app/lib/flatmates/store";
import { explain, matchBadge } from "@/referral-app/lib/flatmates/match";
import { CheckCircle2, MessageSquareWarning, ShieldAlert, ArrowRight } from "lucide-react";

export default function FMMatchCenter() {
  const { kind, id } = useParams();
  const me = useFM(() => getMe());
  const item = useFM(() => (kind === "person" ? People.get(id) : kind === "flat" ? Flats.get(id) : Rooms.get(id)));

  if (!item) {
    return (
      <FMShell title="Match" back="/flatmates/discover">
        <Card className="p-6 text-center">
          <p className="font-display font-semibold">This listing is no longer available</p>
          <p className="text-sm text-muted-foreground mt-1">It was filled or withdrawn. Here are live options instead.</p>
          <LinkBtn href="/flatmates/discover" variant="primary" className="mt-4 w-full">See live matches</LinkBtn>
        </Card>
      </FMShell>
    );
  }

  const { score, parts, gates, good, discuss } = explain(me, item);
  const badge = matchBadge(score);
  const title = item.title || `${item.name}, ${item.age}`;

  return (
    <FMShell title="Why this matches" sub={title} back={`/flatmates/${kind}/${id}`}>
      <Card className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${badge.cls}`}>{badge.label}</span>
            <p className="font-display text-3xl font-bold tabular-nums mt-2">{score}%</p>
            <p className="text-xs text-muted-foreground">Weighted across 8 factors, after hard gates</p>
          </div>
          <div className="text-right text-xs text-muted-foreground shrink-0">
            <p>{item.area}</p>
            <p className="font-semibold text-foreground">{money(item.rent || item.budgetIdeal)}</p>
            <p>{shortDate(item.availableFrom || item.moveIn)}</p>
          </div>
        </div>
      </Card>

      {!!gates.length && (
        <Card className="p-4 mt-3 border-red-200 bg-red-50/50">
          <div className="flex items-center gap-2 text-red-700"><ShieldAlert className="w-4 h-4" /><p className="font-semibold text-sm">Hard gates failed</p></div>
          <ul className="mt-2 space-y-1">
            {gates.map((g: string) => <li key={g} className="text-sm text-red-700/90">· {g}</li>)}
          </ul>
          <p className="text-xs text-red-700/70 mt-2">
            We cap the score at 62% when a hard gate fails, because no amount of lifestyle fit makes an impossible option possible.
          </p>
        </Card>
      )}

      <Section title="Factor breakdown" eyebrow="Score maths" sub="Every point is traceable. Nothing here is a black box.">
        <Card className="p-4 space-y-3">
          {parts.map((p: any) => (
            <div key={p.label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold">{p.label} <span className="text-muted-foreground font-normal">· weight {p.weight}%</span></span>
                <b className="tabular-nums">{p.score}</b>
              </div>
              <Meter value={p.score} tone={p.score >= 85 ? "good" : p.score >= 65 ? "primary" : "warn"} />
            </div>
          ))}
        </Card>
      </Section>

      {!!good.length && (
        <Section title="What works" eyebrow="Strengths">
          <Card className="p-4 space-y-2">
            {good.map((g: string) => (
              <p key={g} className="text-sm flex gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />{g}</p>
            ))}
          </Card>
        </Section>
      )}

      {!!discuss.length && (
        <Section title="Discuss before you commit" eyebrow="Open questions" sub="Say these out loud on the first call — it saves a wasted visit.">
          <Card className="p-4 space-y-2">
            {discuss.map((g: string) => (
              <p key={g} className="text-sm flex gap-2"><MessageSquareWarning className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />{g}</p>
            ))}
          </Card>
        </Section>
      )}

      <Section title="Freshness" eyebrow="Data quality">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">{freshness(item.verifiedAt || item.lastActive)}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Responsiveness score {item.responseScore ?? 75}/100 · we re-ask the owner every 72 hours.
            </p>
          </div>
          <Pill tone={item.status === "FILLED" ? "red" : "green"}>{item.status === "FILLED" ? "Filled" : "Live"}</Pill>
        </Card>
      </Section>

      <div className="grid grid-cols-2 gap-2 sticky bottom-20">
        <LinkBtn href={`/flatmates/not-for-me/${kind}/${id}`}>Not for me</LinkBtn>
        <LinkBtn href={`/flatmates/interest/${kind}/${id}`} variant="primary">I'm interested <ArrowRight className="w-4 h-4" /></LinkBtn>
      </div>
      <Link href="/flatmates/requirement" className="block text-center text-xs font-semibold text-primary mt-4">
        Score looks wrong? Fix your requirement →
      </Link>
    </FMShell>
  );
}
