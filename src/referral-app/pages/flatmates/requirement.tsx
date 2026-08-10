// @ts-nocheck
import { useState } from "react";
import { FMShell, Card, Pill, Section, Btn, Meter, money } from "@/referral-app/components/flatmates/Shell";
import { getMe, setMe, useFM, Rooms, track } from "@/referral-app/lib/flatmates/store";
import { AREA_LIST } from "@/referral-app/lib/flatmates/seed";
import { constraintImpact, scoreMatch } from "@/referral-app/lib/flatmates/match";
import { Sliders, TrendingUp } from "lucide-react";

const ROOM_TYPES = ["Private room", "Twin sharing", "Shared room", "Any"];
const BATHROOMS = ["Attached required", "Attached preferred", "Shared is fine"];

export default function FMRequirement() {
  const me = useFM(() => getMe());
  const rooms = useFM(() => Rooms.all().filter((r: any) => r.status === "LIVE"));
  const [draft, setDraft] = useState({
    areas: me.areas || [], budgetIdeal: me.budgetIdeal || 18000, budgetMax: me.budgetMax || 22000,
    roomType: me.roomType || "Private room", bathroom: me.bathroom || "Attached preferred", commute: me.commute || "30 min",
  });
  const set = (patch: any) => setDraft((d) => ({ ...d, ...patch }));

  const impact = constraintImpact({ ...me, ...draft }, rooms);
  const matches = rooms.filter((r: any) => scoreMatch({ ...me, ...draft }, r).score >= 75).length;
  const before = rooms.filter((r: any) => scoreMatch(me, r).score >= 75).length;
  const delta = matches - before;

  const save = () => {
    setMe(draft);
    track("requirement_updated", draft);
    window.history.back();
  };

  const toggleArea = (a: string) =>
    set({ areas: draft.areas.includes(a) ? draft.areas.filter((x: string) => x !== a) : [...draft.areas, a] });

  return (
    <FMShell title="Your requirement" sub="Change one thing, see supply move instantly" back="/flatmates/you">
      <Card className="p-4 border-primary/30 bg-primary/[0.04]">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-primary"><TrendingUp className="w-4 h-4" /><p className="text-xs font-bold uppercase tracking-wider">Live supply preview</p></div>
            <p className="font-display text-2xl font-bold mt-1 tabular-nums">{matches} good matches</p>
            <p className="text-xs text-muted-foreground">
              {delta === 0 ? "Same as your current setup" : delta > 0 ? `+${delta} more than now` : `${delta} fewer than now`}
            </p>
          </div>
          <Sliders className="w-5 h-5 text-primary" />
        </div>
      </Card>

      <Section title="What's costing you supply" eyebrow="Diagnosis" sub="Percentage of live rooms each constraint removes.">
        <Card className="p-4 space-y-3">
          {impact.map((c: any) => (
            <div key={c.label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold truncate">{c.label}</span>
                <b className="tabular-nums text-muted-foreground">−{c.removedPct}%</b>
              </div>
              <Meter value={c.removedPct} tone={c.removedPct > 50 ? "warn" : "primary"} />
            </div>
          ))}
          <p className="text-xs text-muted-foreground pt-1">
            The top row is your binding constraint. Loosening it usually unlocks more supply than anything else you could change.
          </p>
        </Card>
      </Section>

      <Section title="Budget" sub="Ideal and maximum are different numbers. We never call an unaffordable room a strong match.">
        <Card className="p-4 space-y-4">
          <Field label="Ideal rent" value={money(draft.budgetIdeal)}>
            <input type="range" min={6000} max={45000} step={500} value={draft.budgetIdeal}
              onChange={(e) => set({ budgetIdeal: +e.target.value, budgetMax: Math.max(+e.target.value, draft.budgetMax) })}
              className="w-full accent-[var(--primary)]" />
          </Field>
          <Field label="Absolute maximum" value={money(draft.budgetMax)}>
            <input type="range" min={draft.budgetIdeal} max={60000} step={500} value={draft.budgetMax}
              onChange={(e) => set({ budgetMax: +e.target.value })} className="w-full accent-[var(--primary)]" />
          </Field>
        </Card>
      </Section>

      <Section title="Areas" sub={`${draft.areas.length} selected · adjacent areas usually add 40–70% more supply`}>
        <div className="flex flex-wrap gap-2">
          {AREA_LIST.map((a) => {
            const on = draft.areas.includes(a);
            const n = rooms.filter((r: any) => r.area === a).length;
            return (
              <button key={a} onClick={() => toggleArea(a)}
                className={`h-9 px-3 rounded-xl text-sm font-semibold border transition-colors ${on ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:bg-muted"}`}>
                {a} <span className={on ? "text-primary-foreground/70" : "text-muted-foreground"}>{n}</span>
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Room & property">
        <Card className="p-4 space-y-4">
          <Choice label="Room type" options={ROOM_TYPES} value={draft.roomType} onChange={(v: string) => set({ roomType: v })} />
          <Choice label="Bathroom" options={BATHROOMS} value={draft.bathroom} onChange={(v: string) => set({ bathroom: v })} />
          <Choice label="Acceptable commute" options={["15 min", "30 min", "45 min", "60 min+"]} value={draft.commute} onChange={(v: string) => set({ commute: v })} />
        </Card>
      </Section>

      <div className="grid grid-cols-2 gap-2 sticky bottom-20">
        <Btn variant="secondary" onClick={() => window.history.back()}>Cancel</Btn>
        <Btn variant="primary" onClick={save}>Save requirement</Btn>
      </div>
    </FMShell>
  );
}

function Field({ label, value, children }: any) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1.5">
        <span className="text-xs font-semibold text-muted-foreground">{label}</span>
        <b className="font-display tabular-nums">{value}</b>
      </div>
      {children}
    </div>
  );
}

function Choice({ label, options, value, onChange }: any) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted-foreground mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((o: string) => (
          <button key={o} onClick={() => onChange(o)}
            className={`h-9 px-3 rounded-xl text-sm font-semibold border transition-colors ${value === o ? "bg-foreground text-background border-foreground" : "bg-card border-border hover:bg-muted"}`}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}
