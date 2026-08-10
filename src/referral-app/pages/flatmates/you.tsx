// @ts-nocheck
import { Link } from "wouter";
import { FMShell, Card, Pill, Section, KPI, Meter, money, VerifiedRow } from "@/referral-app/components/flatmates/Shell";
import { getMe, useFM, Saved, Interests, Meetings, Threads, resetFM } from "@/referral-app/lib/flatmates/store";
import { Bookmark, CalendarDays, Home, ShieldCheck, Sliders, Activity } from "lucide-react";

export default function You() {
  const me = useFM(() => getMe());
  const saved = useFM(() => Saved.all());
  const interests = useFM(() => Interests.all());
  const meetings = useFM(() => Meetings.all());
  const threads = useFM(() => Threads.all());

  const v = me.verified || {};
  const checks = [!!v.phone, !!v.email, !!v.work, !!v.id, !!me.photo];
  const strength = Math.round((checks.filter(Boolean).length / checks.length) * 60 + (me.areas?.length ? 20 : 0) + (me.moveIn ? 20 : 0));

  return (
    <FMShell title="You" sub={me.areas?.length ? me.areas.join(" · ") : "Add your areas"} tab="you">
      <Card className="p-4">
        <div className="flex gap-3 items-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 grid place-items-center text-xl font-bold text-primary font-display">{(me.name || "You")[0]}</div>
          <div className="flex-1 min-w-0">
            <p className="font-display text-lg font-semibold tracking-tight truncate">{me.name || "Your profile"}</p>
            <p className="text-sm text-muted-foreground">{me.areas?.[0] || me.city} · {money(me.budgetIdeal || 0)}–{money(me.budgetMax || 0)}</p>
          </div>
          <Link href="/flatmates/onboard" className="text-xs font-semibold text-primary">Edit</Link>
        </div>
        <div className="mt-3"><VerifiedRow v={v} /></div>
        <div className="mt-3">
          <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">Profile strength</span><b>{strength}%</b></div>
          <Meter value={strength} tone={strength >= 70 ? "good" : "warn"} />
          <p className="text-xs text-muted-foreground mt-1.5">Add a photo and verify your workplace to appear 3× higher in matches.</p>
          <Link href="/flatmates/trust" className="text-xs font-semibold text-primary mt-1.5 inline-block">Open trust centre →</Link>
        </div>
      </Card>

      <div className="grid grid-cols-4 gap-2 mt-3">
        <KPI label="Saved" value={saved.length} />
        <KPI label="Interests" value={interests.length} tone="primary" />
        <KPI label="Chats" value={threads.length} />
        <KPI label="Meets" value={meetings.length} />
      </div>

      <Section title="Your move" eyebrow="Everything in one place">
        <div className="space-y-2">
          <RowLink href="/flatmates/saved" icon={Bookmark} t="Shortlist" s={`${saved.length} rooms & people saved`} />
          <RowLink href="/flatmates/inbox" icon={Home} t="Interests & conversations" s={`${threads.length} threads open`} />
          <RowLink href="/flatmates/meetings" icon={CalendarDays} t="Scheduled meets" s={meetings.length ? `${meetings.length} planned` : "None yet"} />
          <RowLink href="/flatmates/requirement" icon={Sliders} t="My requirement" s="Budget, areas, room type — see supply move live" />
          <RowLink href="/flatmates/groups" icon={Home} t="My groups" s="Form a flat with others" />
        </div>
      </Section>

      <Section title="Household" eyebrow="Already living somewhere">
        <div className="space-y-2">
          <RowLink href="/flatmates/household" icon={Home} t="My household" s={me.household ? "Rent, expenses and replacements" : "Set up or post a replacement room"} />
          <RowLink href="/flatmates/post" icon={Home} t="My listings" s="Rooms and flats you've posted" />
        </div>
      </Section>

      <Section title="Market & safety" eyebrow="Know before you move">
        <div className="space-y-2">
          <RowLink href="/flatmates/liquidity" icon={Activity} t="Market liquidity" s="Where supply and demand are tight today" />
          <RowLink href="/flatmates/ready" icon={Home} t="Ready-to-move stays" s="Move in this week, upgrade later" />
          <RowLink href="/flatmates/safety" icon={ShieldCheck} t="Safety centre" s="Five rules before you pay anything" />
        </div>
        <button onClick={() => { resetFM(); window.location.reload(); }} className="mt-3 text-xs text-muted-foreground underline">Reset demo data</button>
      </Section>
    </FMShell>
  );
}

function RowLink({ href, t, s, icon: Icon }: any) {
  return (
    <Link href={href}>
      <Card className="p-3.5 flex items-center gap-3">
        {Icon && <span className="w-9 h-9 rounded-xl bg-muted grid place-items-center shrink-0"><Icon className="w-4 h-4 text-primary" /></span>}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">{t}</p>
          <p className="text-xs text-muted-foreground truncate">{s}</p>
        </div>
        <span className="text-muted-foreground">›</span>
      </Card>
    </Link>
  );
}
