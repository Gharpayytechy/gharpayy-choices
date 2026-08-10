// @ts-nocheck
import { useState } from "react";
import { FMShell, Card, Pill, Section, Btn, LinkBtn, KPI, Meter, money, shortDate } from "@/referral-app/components/flatmates/Shell";
import { getMe, setMe, useFM, Rooms, createReplacement, pushNotif, track } from "@/referral-app/lib/flatmates/store";
import { Home, Users, Receipt, Sparkles, AlertTriangle } from "lucide-react";

export default function FMHousehold() {
  const me = useFM(() => getMe());
  const rooms = useFM(() => Rooms.all());
  const hh = me.household;
  const room = hh ? rooms.find((r: any) => r.id === hh.refId) : null;
  const [rent, setRent] = useState(String(room?.rent || me.budgetIdeal || 18000));
  const share = me.expenses || [];
  const totalShared = share.reduce((s: number, e: any) => s + Number(e.amount || 0), 0);

  const addExpense = (label: string, amount: number) => {
    setMe({ expenses: [{ id: Date.now().toString(36), label, amount, at: new Date().toISOString() }, ...share] });
    track("household_expense_added", { label, amount });
  };

  if (!hh) {
    return (
      <FMShell title="My household" sub="Not moved in yet" back="/flatmates/you">
        <Card className="p-6 text-center">
          <Home className="w-6 h-6 mx-auto text-muted-foreground" />
          <p className="font-display font-semibold mt-2">No household set up yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Once you confirm a move-in, this becomes your home base — rent split, shared expenses, house rules, and one-tap replacement posting when someone leaves.
          </p>
          <div className="grid grid-cols-2 gap-2 mt-4">
            <LinkBtn href="/flatmates/discover" variant="secondary">Find a room</LinkBtn>
            <LinkBtn href="/flatmates/post" variant="primary">I already have a flat</LinkBtn>
          </div>
        </Card>

        <Section title="Already living somewhere?" eyebrow="Keep the flat full" sub="A vacant room costs your household real money every day.">
          <Card className="p-4">
            <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /><p className="font-semibold">Post a replacement in 30 seconds</p></div>
            <label className="block text-xs font-semibold text-muted-foreground mt-3 mb-1">Rent for the vacant room</label>
            <input value={rent} onChange={(e) => setRent(e.target.value)} inputMode="numeric"
              className="w-full h-11 rounded-xl border border-border bg-card px-3 text-sm" />
            <p className="text-xs text-muted-foreground mt-2">
              Every day empty costs you about <b className="text-foreground">{money(Number(rent) / 30)}</b>. We start matching candidates immediately.
            </p>
            <Btn variant="primary" className="w-full mt-3"
              onClick={() => { const r = createReplacement({ rent: Number(rent) }); if (r) window.location.href = `/app/flatmates/room/${r.id}`; }}>
              Post replacement listing
            </Btn>
          </Card>
        </Section>
      </FMShell>
    );
  }

  const monthly = Number(room?.rent || rent);
  const members = room?.householdMembers || [];
  const heads = members.length + 1;

  return (
    <FMShell title="My household" sub={room?.title || "Your home"} back="/flatmates/you">
      <div className="grid grid-cols-3 gap-2 mb-5">
        <KPI label="Your rent" value={money(monthly)} hint="per month" tone="primary" />
        <KPI label="Flatmates" value={heads} hint="including you" />
        <KPI label="Shared spend" value={money(totalShared)} hint="this month" />
      </div>

      <Section title="Moved in" sub={`Since ${shortDate(hh.movedInAt)}`}>
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold tracking-tight">{room?.title || "Your room"}</p>
              <p className="text-xs text-muted-foreground">{room?.area} · {room?.roomType} · {room?.bhk}BHK</p>
            </div>
            <Pill tone="green">Active</Pill>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">Household stability</span><b>{Math.min(100, 60 + heads * 8)}%</b></div>
            <Meter value={Math.min(100, 60 + heads * 8)} tone="good" />
          </div>
        </Card>
      </Section>

      <Section title="Who lives here" eyebrow="Household">
        <div className="space-y-2">
          {members.map((m: any, i: number) => (
            <Card key={i} className="p-3.5 flex items-center gap-3">
              <span className="w-9 h-9 rounded-full bg-primary/10 text-primary grid place-items-center text-sm font-bold">{m.name[0]}</span>
              <div className="flex-1"><p className="text-sm font-semibold">{m.name}, {m.age}</p><p className="text-xs text-muted-foreground">{m.work}</p></div>
              <Users className="w-4 h-4 text-muted-foreground" />
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Shared expenses" sub="Log it once, settle at month end" action={
        <Btn variant="ghost" className="h-8 px-2 text-xs" onClick={() => addExpense("Groceries", 1200)}>+ Add</Btn>
      }>
        <div className="space-y-2">
          {!share.length && <Card className="p-4 text-sm text-muted-foreground">No shared expenses logged yet. Add groceries, internet, maid or gas and we split it {heads} ways.</Card>}
          {share.map((e: any) => (
            <Card key={e.id} className="p-3.5 flex justify-between items-center">
              <div className="flex items-center gap-2"><Receipt className="w-4 h-4 text-muted-foreground" /><p className="text-sm font-semibold">{e.label}</p></div>
              <div className="text-right">
                <p className="text-sm font-bold tabular-nums">{money(e.amount)}</p>
                <p className="text-[10px] text-muted-foreground">{money(e.amount / heads)} each</p>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Someone moving out?" eyebrow="Replacement">
        <Card className="p-4 border-primary/30">
          <div className="flex items-center gap-2 text-primary"><AlertTriangle className="w-4 h-4" /><p className="font-semibold">Don't wait for the notice period to end</p></div>
          <p className="text-sm text-muted-foreground mt-1">
            Listings posted 30+ days early fill 3× faster and hold rent. We reuse this household's profile — you only enter room details.
          </p>
          <Btn variant="primary" className="w-full mt-3"
            onClick={() => { const r = createReplacement({ rent: monthly, area: room?.area }); pushNotif({ type: "supply", title: "Replacement live", body: "We're matching candidates now.", link: `/flatmates/room/${r.id}` }); window.location.href = `/app/flatmates/room/${r.id}`; }}>
            Post replacement listing
          </Btn>
        </Card>
      </Section>
    </FMShell>
  );
}
