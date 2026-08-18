// @ts-nocheck
import { useState } from "react";
import { FMShell, Section, Card, Pill, Meter, Btn, money, KPI } from "@/flatmates/frontend/components/Shell";
import { useFM, getMe, setMe, track } from "@/flatmates/backend/store/store";
import { toast } from "sonner";
import { LogOut, Camera, FileText, Copy } from "lucide-react";

const STEPS = [
  { k: "notice", t: "Serve written notice", s: "Send notice on WhatsApp + email so the date is provable.", days: "T-60" },
  { k: "photos", t: "Photograph every wall and fixture", s: "Date-stamped photos are the only defence against damage claims.", days: "T-45" },
  { k: "replacement", t: "Post a replacement flatmate", s: "Most deposits are cut for vacancy, not damage. Fill the room yourself.", days: "T-40" },
  { k: "bills", t: "Settle bills to zero", s: "Electricity, gas, internet, maintenance — get final receipts.", days: "T-15" },
  { k: "deepclean", t: "Deep clean with a receipt", s: "A ₹1,500 receipt routinely saves a ₹8,000 cleaning deduction.", days: "T-7" },
  { k: "walkthrough", t: "Joint walkthrough with owner", s: "Do it together, agree deductions in writing before handing keys.", days: "T-1" },
  { k: "keys", t: "Hand keys against a signed sheet", s: "Never hand keys without a settlement sheet naming the refund date.", days: "T-0" },
  { k: "refund", t: "Track the refund", s: "Deposits are legally refundable within 30 days of vacating.", days: "T+30" },
];

const DEDUCTIONS = [
  { t: "Repainting", ok: "Only if you caused damage beyond normal wear.", push: "Ask for the painter's quote. Refuse blanket ₹15,000 charges." },
  { t: "Notice shortfall", ok: "Valid if your agreement names a notice period.", push: "Offer a replacement tenant instead of paying the shortfall." },
  { t: "Deep cleaning", ok: "Valid only if the flat is left unclean.", push: "Show your cleaning receipt and handover photos." },
  { t: "Broken fixtures", ok: "Valid for actual breakage.", push: "Compare to your move-in photos. Wear and tear is not damage." },
  { t: "Brokerage recovery", ok: "Never valid on a direct-to-owner tenancy.", push: "Refuse in writing and cite the agreement clauses." },
];

export default function FlatmatesMoveout() {
  const me = useFM(() => getMe());
  const mo = me.moveout || {};
  const [deposit, setDeposit] = useState(mo.deposit || (me.budgetIdeal || 20000) * 2);
  const [claimed, setClaimed] = useState(mo.claimed || 0);

  const done = STEPS.filter((s) => mo[s.k]).length;
  const pct = Math.round((done / STEPS.length) * 100);
  const recoverable = Math.max(0, deposit - claimed);

  const toggle = (k: string) => {
    setMe({ moveout: { ...mo, [k]: !mo[k], deposit, claimed } });
    track("moveout_step_toggled", { step: k });
  };
  const save = () => {
    setMe({ moveout: { ...mo, deposit, claimed } });
    toast.success("Deposit tracker saved");
  };

  const letter = `Dear owner,

This is written notice of my intent to vacate the premises. As per our agreement, I have completed the required notice period and settled all utility bills.

Security deposit paid: ${money(deposit)}
Deductions proposed by you: ${money(claimed)}
Refund due: ${money(recoverable)}

I have completed a deep clean (receipt attached) and documented the condition of the property at handover with date-stamped photographs. Please confirm the refund amount and transfer date in writing before keys are handed over.

Thank you,
${me.name || "Tenant"}`;

  return (
    <FMShell title="Move-out & deposit recovery" sub="Most tenants lose money here. You won't." back="/flatmates/hub">
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <span className="w-9 h-9 rounded-xl bg-primary/10 grid place-items-center"><LogOut className="w-4 h-4 text-primary" /></span>
          <div className="flex-1">
            <p className="font-display font-semibold tracking-tight">Exit readiness</p>
            <p className="text-xs text-muted-foreground">{done} of {STEPS.length} steps complete</p>
          </div>
          <Pill tone={pct >= 75 ? "green" : pct >= 40 ? "amber" : "red"}>{pct}%</Pill>
        </div>
        <div className="mt-3"><Meter value={pct} tone={pct >= 75 ? "good" : "warn"} /></div>
      </Card>

      <div className="grid grid-cols-3 gap-2 mt-3">
        <KPI label="Deposit paid" value={money(deposit)} />
        <KPI label="Owner claims" value={money(claimed)} />
        <KPI label="You should get" value={money(recoverable)} tone="good" />
      </div>

      <Card className="p-4 mt-3">
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs font-semibold text-muted-foreground">
            Deposit paid
            <input type="number" value={deposit} onChange={(e) => setDeposit(+e.target.value)}
              className="mt-1 w-full h-10 rounded-xl border border-border bg-card px-3 text-sm font-medium tabular-nums" />
          </label>
          <label className="text-xs font-semibold text-muted-foreground">
            Deductions claimed
            <input type="number" value={claimed} onChange={(e) => setClaimed(+e.target.value)}
              className="mt-1 w-full h-10 rounded-xl border border-border bg-card px-3 text-sm font-medium tabular-nums" />
          </label>
        </div>
        <Btn onClick={save} className="w-full mt-3">Save tracker</Btn>
      </Card>

      <Section title="The 60-day exit timeline" eyebrow="Do it in this order">
        <div className="space-y-2">
          {STEPS.map((s) => (
            <Card key={s.k} className={`p-3.5 flex items-start gap-3 ${mo[s.k] ? "border-emerald-200 bg-emerald-50/40" : ""}`}>
              <button onClick={() => toggle(s.k)}
                className={`w-6 h-6 rounded-lg border grid place-items-center shrink-0 mt-0.5 text-xs font-bold ${mo[s.k] ? "bg-emerald-600 border-emerald-600 text-white" : "border-border text-transparent"}`}>
                ✓
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm">{s.t}</p>
                  <Pill>{s.days}</Pill>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{s.s}</p>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Deduction defence" eyebrow="Which claims are legitimate">
        <div className="space-y-2">
          {DEDUCTIONS.map((d) => (
            <Card key={d.t} className="p-4">
              <p className="font-semibold text-sm">{d.t}</p>
              <p className="text-xs text-muted-foreground mt-1">{d.ok}</p>
              <p className="text-xs font-semibold text-primary mt-1.5">Push back: {d.push}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Refund demand letter" eyebrow="Ready to send" sub="Written, dated, and specific — the only version that gets paid.">
        <Card className="p-4">
          <pre className="text-xs whitespace-pre-wrap font-sans text-muted-foreground">{letter}</pre>
          <div className="flex gap-2 mt-3">
            <Btn variant="secondary" className="flex-1" onClick={() => { navigator.clipboard?.writeText(letter); toast.success("Letter copied"); }}>
              <Copy className="w-4 h-4" />Copy letter
            </Btn>
            <a className="flex-1 h-10 rounded-xl bg-primary text-primary-foreground grid place-items-center text-sm font-semibold"
              href={`https://wa.me/?text=${encodeURIComponent(letter)}`} target="_blank" rel="noreferrer">Send on WhatsApp</a>
          </div>
        </Card>
      </Section>

      <Card className="p-4 mt-3 flex items-start gap-3">
        <Camera className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground">
          Photos and receipts win deposit disputes; arguments don't. Store your handover set somewhere you'll still have it 60 days later.
        </p>
      </Card>
    </FMShell>
  );
}
