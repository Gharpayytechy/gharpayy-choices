// @ts-nocheck
import { useState } from "react";
import { FMShell, Section, Card, Pill, Btn, money } from "@/flatmates/frontend/components/Shell";
import { useFM, getMe, setMe, track } from "@/flatmates/backend/store/store";
import { toast } from "sonner";
import { FileText, Copy, ShieldCheck } from "lucide-react";

const CLAUSES = [
  { k: "allin", t: "All-in rent stated", s: "Rent, maintenance, water and any fixed charge written as one number." },
  { k: "deposit", t: "Deposit and refund window", s: "Amount, deduction rules, and a refund date within 30 days of vacating." },
  { k: "lockin", t: "Lock-in and notice", s: "Both sides symmetric. If you owe 2 months notice, so does the owner." },
  { k: "hike", t: "Rent revision cap", s: "Name a maximum annual increase in percent. Blank means unlimited." },
  { k: "repairs", t: "Repairs split", s: "Owner: structure, plumbing, fixtures. Tenant: consumables only." },
  { k: "entry", t: "Entry notice", s: "Owner gives 24 hours notice before entering. Non-negotiable." },
  { k: "guests", t: "Guests and visitors", s: "Written, so it never becomes a mid-tenancy argument." },
  { k: "exit", t: "Exit condition list", s: "What 'as handed over' means, agreed with move-in photos attached." },
];

const RULES = [
  { k: "quiet", t: "Quiet hours", d: "11pm–7am on weekdays." },
  { k: "cleaning", t: "Cleaning rota", d: "Weekly rotation, common areas, posted on the fridge." },
  { k: "bills", t: "Bill day", d: "Bills split and settled by the 5th of every month." },
  { k: "guests", t: "Overnight guests", d: "Flatmates informed 24 hours ahead, max 3 nights." },
  { k: "food", t: "Kitchen", d: "Own shelf, shared staples pooled monthly." },
  { k: "smoking", t: "Smoking & alcohol", d: "Balcony only, never indoors." },
  { k: "pets", t: "Pets", d: "Only with unanimous agreement of all flatmates." },
  { k: "exit", t: "Leaving", d: "30 days notice to flatmates and help find a replacement." },
];

export default function FlatmatesAgreement() {
  const me = useFM(() => getMe());
  const saved = me.agreement || {};
  const [rent, setRent] = useState(saved.rent || me.budgetIdeal || 20000);
  const [deposit, setDeposit] = useState(saved.deposit || (me.budgetIdeal || 20000) * 2);
  const [lockin, setLockin] = useState(saved.lockin || 3);
  const [notice, setNotice] = useState(saved.notice || 1);
  const [hike, setHike] = useState(saved.hike || 5);
  const [rules, setRules] = useState<any>(saved.rules || RULES.reduce((a, r) => ({ ...a, [r.k]: true }), {}));

  const checked = CLAUSES.filter((c) => saved[c.k]).length;

  const toggleClause = (k: string) => setMe({ agreement: { ...saved, [k]: !saved[k], rent, deposit, lockin, notice, hike, rules } });
  const saveTerms = () => {
    setMe({ agreement: { ...saved, rent, deposit, lockin, notice, hike, rules } });
    track("agreement_terms_saved", {});
    toast.success("Terms saved to your profile");
  };

  const houseRules = `House rules — ${me.areas?.[0] || "our flat"}\n\n` +
    RULES.filter((r) => rules[r.k]).map((r, i) => `${i + 1}. ${r.t}: ${r.d}`).join("\n") +
    `\n\nAgreed by all flatmates. Revisit monthly.`;

  const termSheet = `Tenancy term sheet\n
All-in rent: ${money(rent)} per month
Security deposit: ${money(deposit)} (refundable within 30 days of vacating)
Lock-in: ${lockin} month(s)
Notice period: ${notice} month(s), symmetric for both parties
Annual rent revision cap: ${hike}%
Repairs: owner covers structure, plumbing and fixtures
Entry: owner gives 24 hours written notice
Move-in condition: photographs attached and signed by both parties

Prepared by ${me.name || "tenant"} via Gharpayy. Direct to owner, no brokerage.`;

  return (
    <FMShell title="Agreement & house rules" sub="Sign nothing you haven't checked" back="/flatmates/hub">
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <span className="w-9 h-9 rounded-xl bg-primary/10 grid place-items-center"><FileText className="w-4 h-4 text-primary" /></span>
          <div className="flex-1">
            <p className="font-display font-semibold tracking-tight">Term sheet builder</p>
            <p className="text-xs text-muted-foreground">{checked} of {CLAUSES.length} clauses verified</p>
          </div>
          <Pill tone={checked === CLAUSES.length ? "green" : "amber"}>{checked === CLAUSES.length ? "Safe to sign" : "Incomplete"}</Pill>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4">
          {[
            ["All-in rent", rent, setRent],
            ["Deposit", deposit, setDeposit],
            ["Lock-in (months)", lockin, setLockin],
            ["Notice (months)", notice, setNotice],
            ["Revision cap (%)", hike, setHike],
          ].map(([label, val, set]: any) => (
            <label key={label} className="text-xs font-semibold text-muted-foreground">
              {label}
              <input type="number" value={val} onChange={(e) => set(+e.target.value)}
                className="mt-1 w-full h-10 rounded-xl border border-border bg-card px-3 text-sm font-medium tabular-nums" />
            </label>
          ))}
        </div>
        <Btn onClick={saveTerms} className="w-full mt-3">Save terms</Btn>
      </Card>

      <Section title="Clause checklist" eyebrow="Read before you pay" sub="Every missing clause becomes an argument later.">
        <div className="space-y-2">
          {CLAUSES.map((c) => (
            <Card key={c.k} className={`p-3.5 flex items-start gap-3 ${saved[c.k] ? "border-emerald-200 bg-emerald-50/40" : ""}`}>
              <button onClick={() => toggleClause(c.k)}
                className={`w-6 h-6 rounded-lg border grid place-items-center shrink-0 mt-0.5 text-xs font-bold ${saved[c.k] ? "bg-emerald-600 border-emerald-600 text-white" : "border-border text-transparent"}`}>✓</button>
              <div className="min-w-0">
                <p className="font-semibold text-sm">{c.t}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{c.s}</p>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="House rules generator" eyebrow="Before you move in together" sub="Pick what applies, share it in the group chat on day one.">
        <Card className="p-4">
          <div className="grid sm:grid-cols-2 gap-2">
            {RULES.map((r) => (
              <button key={r.k} onClick={() => setRules({ ...rules, [r.k]: !rules[r.k] })}
                className={`text-left rounded-xl border p-3 transition-colors ${rules[r.k] ? "border-primary/40 bg-primary/[0.05]" : "border-border"}`}>
                <p className="text-sm font-semibold">{r.t}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{r.d}</p>
              </button>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <Btn variant="secondary" className="flex-1" onClick={() => { navigator.clipboard?.writeText(houseRules); toast.success("House rules copied"); }}>
              <Copy className="w-4 h-4" />Copy rules
            </Btn>
            <a className="flex-1 h-10 rounded-xl bg-primary text-primary-foreground grid place-items-center text-sm font-semibold"
              href={`https://wa.me/?text=${encodeURIComponent(houseRules)}`} target="_blank" rel="noreferrer">Share</a>
          </div>
        </Card>
      </Section>

      <Section title="Your term sheet" eyebrow="Send to the owner">
        <Card className="p-4">
          <pre className="text-xs whitespace-pre-wrap font-sans text-muted-foreground">{termSheet}</pre>
          <div className="flex gap-2 mt-3">
            <Btn variant="secondary" className="flex-1" onClick={() => { navigator.clipboard?.writeText(termSheet); toast.success("Term sheet copied"); }}>
              <Copy className="w-4 h-4" />Copy
            </Btn>
            <Btn variant="dark" className="flex-1" onClick={() => window.print()}>Print / PDF</Btn>
          </div>
        </Card>
      </Section>

      <Card className="p-4 mt-3 flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground">
          Gharpayy Expert Desk reviews any agreement free before you pay. If a clause looks one-sided, ask us first.
        </p>
      </Card>
    </FMShell>
  );
}
