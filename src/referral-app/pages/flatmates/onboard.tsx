// @ts-nocheck
import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { FMShell, Card, Btn, Pill, Section, money } from "@/referral-app/components/flatmates/Shell";
import { getMe, setMe, track } from "@/referral-app/lib/flatmates/store";
import { seedFlatmates, AREA_LIST } from "@/referral-app/lib/flatmates/seed";
import { MapPin, Sparkles, Users, Home, Zap, Check } from "lucide-react";

const INTENTS = [
  { key: "need_room", icon: Home, title: "I Need a Room", desc: "Join an existing flat or household.", cta: "Find Rooms" },
  { key: "need_flatmate", icon: Users, title: "I Need a Flatmate", desc: "Fill an empty room in your current flat.", cta: "Find Flatmates" },
  { key: "form_group", icon: Sparkles, title: "Let's Take a Flat Together", desc: "Meet compatible people and rent a place together.", cta: "Form a Group" },
  { key: "need_flat", icon: MapPin, title: "I Need a Whole Flat", desc: "Find an entire 1BHK, 2BHK, 3BHK or larger home.", cta: "Explore Flats" },
  { key: "ready_now", icon: Zap, title: "I Need Something Ready Now", desc: "Ready-to-move rooms and Gharpayy stays.", cta: "Move In Faster" },
];

const MOVE_BANDS = ["Today", "Within 3 days", "This week", "Within 2 weeks", "Within a month", "1–3 months", "Flexible"];
const REASONS = ["Starting a new job", "Moving to the city", "Changing locality", "Leaving current PG", "Leaving current flat", "Current flatmate leaving", "College/student move", "Need cheaper place", "Need better place", "Temporary stay"];

export default function FlatmatesOnboard() {
  const [, nav] = useLocation();
  const [step, setStep] = useState(0);
  const [d, setD] = useState(() => getMe());
  useEffect(() => { seedFlatmates(); }, []);
  const patch = (p: any) => setD((x: any) => ({ ...x, ...p }));
  const dna = (p: any) => setD((x: any) => ({ ...x, dna: { ...x.dna, ...p } }));

  const steps = ["Intent", "You", "Move", "Where", "Budget", "Room", "Living style", "Habits", "House rules", "Your DNA"];
  const next = () => setStep((s) => Math.min(steps.length - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  const finish = () => {
    setMe({ ...d, onboarded: true, published: true, verified: { ...d.verified, phone: true } });
    track("requirement_completed", { intent: d.intent });
    nav("/flatmates");
  };

  const budgetHealth = (() => {
    const b = d.budgetIdeal;
    const area = d.areas[0] || "HSR Layout";
    if (b >= 18000) return { tone: "green", head: `${money(b)} in ${area}`, body: "Strong availability — expect private rooms with attached bathrooms." };
    if (b >= 13000) return { tone: "amber", head: `${money(b)} in ${area}`, body: "Workable. Private rooms exist but move fast; twin sharing widens options a lot." };
    return { tone: "amber", head: `${money(b)} in ${area}`, body: "Limited private-room availability. Consider BTM Layout, Bommanahalli, or a shared room." };
  })();

  return (
    <FMShell title="Set up your move" tab="you">
      <div className="flex gap-1 mb-5">
        {steps.map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-slate-900" : "bg-slate-200"}`} />
        ))}
      </div>

      {step === 0 && (
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">What do you need right now?</h2>
          <p className="text-sm text-slate-500 mt-1">We'll shape everything around this — you can change it any time.</p>
          <div className="space-y-2.5 mt-4">
            {INTENTS.map((it) => (
              <button key={it.key} onClick={() => { patch({ intent: it.key }); track("intent_selected", { intent: it.key }); next(); }}
                className={`w-full text-left rounded-2xl border p-4 bg-white transition-all ${d.intent === it.key ? "border-slate-900 ring-2 ring-slate-900/10" : "border-slate-900/8 hover:border-slate-300"}`}>
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-slate-900/5 grid place-items-center"><it.icon className="w-5 h-5" /></span>
                  <div className="flex-1">
                    <div className="font-semibold tracking-tight">{it.title}</div>
                    <div className="text-xs text-slate-500">{it.desc}</div>
                  </div>
                  <span className="text-xs font-semibold text-orange-600">{it.cta} →</span>
                </div>
              </button>
            ))}
          </div>
          <button onClick={() => { patch({ intent: "need_room" }); next(); }} className="w-full text-center text-sm text-slate-500 underline mt-4">Not sure? Help me choose</button>
        </div>
      )}

      {step === 1 && (
        <StepWrap title="Tell people who they're living with." onNext={next} onBack={back}>
          <Field label="First name"><input className={inp} value={d.name} onChange={(e) => patch({ name: e.target.value })} placeholder="Divyanshu" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Age"><input className={inp} value={d.age} onChange={(e) => patch({ age: e.target.value })} placeholder="25" /></Field>
            <Field label="Gender"><Choice options={["Male", "Female", "Other"]} value={d.gender} onChange={(v) => patch({ gender: v })} /></Field>
          </div>
          <Field label="Occupation"><input className={inp} value={d.occupation} onChange={(e) => patch({ occupation: e.target.value })} placeholder="Software Engineer" /></Field>
          <Field label="Company / College"><input className={inp} value={d.company} onChange={(e) => patch({ company: e.target.value })} placeholder="Microsoft" /></Field>
          <Field label="Work mode"><Choice options={["Office", "Hybrid", "WFH", "Student"]} value={d.workMode} onChange={(v) => patch({ workMode: v })} /></Field>
          <Field label="Why are you moving?"><Choice options={REASONS} value={d.reason} onChange={(v) => patch({ reason: v })} /></Field>
        </StepWrap>
      )}

      {step === 2 && (
        <StepWrap title="When do you want to move?" onNext={next} onBack={back}>
          <Choice options={MOVE_BANDS} value={d.moveInBand} onChange={(v) => patch({ moveInBand: v })} />
          <Field label="Or choose an exact date">
            <input type="date" className={inp} value={d.moveIn} onChange={(e) => patch({ moveIn: e.target.value })} />
          </Field>
          <Field label="How long do you plan to stay?">
            <Choice options={["<3 months", "3–6 months", "6–12 months", "12+ months", "Flexible"]} value={d.duration} onChange={(v) => patch({ duration: v })} />
          </Field>
        </StepWrap>
      )}

      {step === 3 && (
        <StepWrap title="Where should home be?" onNext={next} onBack={back}>
          <Field label="Preferred areas">
            <div className="flex flex-wrap gap-2">
              {AREA_LIST.map((a) => {
                const on = d.areas.includes(a);
                return (
                  <button key={a} onClick={() => patch({ areas: on ? d.areas.filter((x: string) => x !== a) : [...d.areas, a] })}
                    className={`px-3 h-9 rounded-xl text-sm font-medium border ${on ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-900/10"}`}>
                    {on && <Check className="w-3.5 h-3.5 inline mr-1" />}{a}
                  </button>
                );
              })}
            </div>
          </Field>
          <Field label="Or search near work / college">
            <input className={inp} value={d.anchor} onChange={(e) => patch({ anchor: e.target.value })} placeholder="Microsoft Bellandur, Christ University…" />
          </Field>
          <Field label="Maximum commute"><Choice options={["10 min", "20 min", "30 min", "45 min", "Flexible"]} value={d.commute} onChange={(v) => patch({ commute: v })} /></Field>
          {d.anchor && (
            <Card className="p-3 bg-emerald-50 border-emerald-200">
              <p className="text-xs text-emerald-800">Matching areas near <b>{d.anchor}</b>: HSR Layout, Bellandur, Kadubeesanahalli, Koramangala.</p>
            </Card>
          )}
        </StepWrap>
      )}

      {step === 4 && (
        <StepWrap title="What's comfortable every month?" onNext={next} onBack={back}>
          <Field label={`Ideal budget · ${money(d.budgetIdeal)}`}>
            <input type="range" min={5000} max={50000} step={500} value={d.budgetIdeal} className="w-full accent-slate-900"
              onChange={(e) => patch({ budgetIdeal: +e.target.value, budgetMax: Math.max(+e.target.value, d.budgetMax) })} />
          </Field>
          <Field label={`Maximum budget · ${money(d.budgetMax)}`}>
            <input type="range" min={5000} max={60000} step={500} value={d.budgetMax} className="w-full accent-orange-500"
              onChange={(e) => patch({ budgetMax: +e.target.value })} />
          </Field>
          <Field label="Maximum deposit"><Choice options={["1 month", "2 months", "3 months", "Flexible"]} value={d.depositMonths} onChange={(v) => patch({ depositMonths: v })} /></Field>
          <Card className={`p-4 ${budgetHealth.tone === "green" ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Your budget health</p>
            <p className="font-semibold mt-1">{budgetHealth.head}</p>
            <p className="text-sm text-slate-600 mt-0.5">{budgetHealth.body}</p>
          </Card>
        </StepWrap>
      )}

      {step === 5 && (
        <StepWrap title="What kind of room?" onNext={next} onBack={back}>
          <Field label="Room type"><Choice options={["Private room", "Twin sharing", "Shared room", "Entire flat", "Any"]} value={d.roomType} onChange={(v) => patch({ roomType: v })} /></Field>
          <Field label="Bathroom"><Choice options={["Attached preferred", "Attached required", "Shared okay"]} value={d.bathroom} onChange={(v) => patch({ bathroom: v })} /></Field>
          <Field label="Furnishing"><Choice options={["Fully furnished", "Semi-furnished", "Unfurnished", "Any"]} value={d.furnishing} onChange={(v) => patch({ furnishing: v })} /></Field>
        </StepWrap>
      )}

      {step === 6 && (
        <StepWrap title="What does living well mean to you?" sub="1 / 3" onNext={next} onBack={back}>
          <Field label="Cleanliness"><Choice options={["Very organised", "Normal", "Relaxed"]} value={d.dna.cleanliness} onChange={(v) => dna({ cleanliness: v })} /></Field>
          <Field label="Sleep"><Choice options={["Early sleeper", "Regular", "Night owl"]} value={d.dna.sleep} onChange={(v) => dna({ sleep: v })} /></Field>
          <Field label="Work schedule"><Choice options={["Mostly days", "Late shifts", "WFH", "Variable"]} value={d.dna.schedule} onChange={(v) => dna({ schedule: v })} /></Field>
          <Field label="Social"><Choice options={["Mostly private", "Balanced", "Very social"]} value={d.dna.social} onChange={(v) => dna({ social: v })} /></Field>
        </StepWrap>
      )}

      {step === 7 && (
        <StepWrap title="Household habits" sub="2 / 3" onNext={next} onBack={back}>
          <Field label="Smoking"><Choice options={["No", "Outside only", "Okay", "Smoking household okay"]} value={d.dna.smoking} onChange={(v) => dna({ smoking: v })} /></Field>
          <Field label="Alcohol"><Choice options={["No", "Occasionally", "Social", "Fine either way"]} value={d.dna.alcohol} onChange={(v) => dna({ alcohol: v })} /></Field>
          <Field label="Food"><Choice options={["Vegetarian", "Eggetarian", "Non-veg", "Vegan", "No preference"]} value={d.dna.food} onChange={(v) => dna({ food: v })} /></Field>
          <Field label="Cooking"><Choice options={["Daily", "Sometimes", "Rarely", "Cook preferred"]} value={d.dna.cooking} onChange={(v) => dna({ cooking: v })} /></Field>
        </StepWrap>
      )}

      {step === 8 && (
        <StepWrap title="House rules" sub="3 / 3" onNext={next} onBack={back} nextLabel="See My Flatmate DNA">
          <Field label="Guests"><Choice options={["Rare", "Occasionally", "Flexible"]} value={d.dna.guests} onChange={(v) => dna({ guests: v })} /></Field>
          <Field label="Partners visiting"><Choice options={["Comfortable", "Discuss first", "Prefer not"]} value={d.dna.partners} onChange={(v) => dna({ partners: v })} /></Field>
          <Field label="Parties"><Choice options={["Never", "Occasionally", "Fine"]} value={d.dna.parties} onChange={(v) => dna({ parties: v })} /></Field>
          <Field label="Pets"><Choice options={["Love pets", "Okay", "Prefer none", "Already have pet"]} value={d.dna.pets} onChange={(v) => dna({ pets: v })} /></Field>
          <Field label="Cleaning"><Choice options={["Maid", "Shared chores", "Either"]} value={d.dna.cleaning} onChange={(v) => dna({ cleaning: v })} /></Field>
        </StepWrap>
      )}

      {step === 9 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-orange-600">Your living style</p>
          <h2 className="text-3xl font-semibold tracking-tight mt-1">
            {d.dna.social === "Very social" ? "Open Host" : d.dna.social === "Mostly private" ? "Quiet Independent" : "Balanced Independent"}
          </h2>
          <Card className="p-4 mt-4">
            <p className="text-sm font-semibold mb-2">You prefer</p>
            <ul className="text-sm text-slate-600 space-y-1.5">
              <li>• {d.dna.social} household energy</li>
              <li>• {d.dna.cleanliness.toLowerCase()} common spaces</li>
              <li>• {d.dna.smoking === "No" ? "Non-smoking" : d.dna.smoking} environment</li>
              <li>• {d.dna.sleep === "Night owl" ? "Late nights" : "Predictable routines"}</li>
              <li>• Guests {d.dna.guests.toLowerCase()}</li>
            </ul>
          </Card>
          <Section title="Most important to you" />
          <div className="flex flex-wrap gap-2">
            {["Location", "Cleanliness", "Privacy", "Budget", "Commute", "Social life"].map((p) => {
              const on = d.priorities.includes(p);
              return (
                <button key={p} onClick={() => patch({ priorities: on ? d.priorities.filter((x: string) => x !== p) : [...d.priorities, p].slice(0, 3) })}
                  className={`px-3 h-9 rounded-xl text-sm font-medium border ${on ? "bg-orange-500 text-white border-orange-500" : "bg-white border-slate-900/10"}`}>{p}</button>
              );
            })}
          </div>
          <div className="flex gap-2 mt-6">
            <Btn variant="secondary" className="flex-1" onClick={() => setStep(6)}>Edit</Btn>
            <Btn className="flex-[2]" onClick={finish}>Looks Right — Find Matches</Btn>
          </div>
        </div>
      )}
    </FMShell>
  );
}

const inp = "w-full h-11 px-3 rounded-xl border border-slate-900/10 bg-white text-sm outline-none focus:ring-2 focus:ring-slate-900/10";

function Field({ label, children }: any) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-slate-500 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Choice({ options, value, onChange }: any) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o: string) => (
        <button key={o} onClick={() => onChange(o)}
          className={`px-3 h-9 rounded-xl text-sm font-medium border transition-colors ${value === o ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-900/10 hover:border-slate-300"}`}>{o}</button>
      ))}
    </div>
  );
}

function StepWrap({ title, sub, children, onNext, onBack, nextLabel = "Continue" }: any) {
  return (
    <div>
      {sub && <p className="text-xs font-bold uppercase tracking-widest text-orange-600 mb-1">{sub}</p>}
      <h2 className="text-2xl font-semibold tracking-tight mb-4">{title}</h2>
      {children}
      <div className="flex gap-2 mt-6">
        <Btn variant="secondary" onClick={onBack}>Back</Btn>
        <Btn className="flex-1" onClick={onNext}>{nextLabel}</Btn>
      </div>
    </div>
  );
}
