// @ts-nocheck
import { Link } from "wouter";
import { FMShell } from "@/flatmates/frontend/components/Shell";
import { WhatsAppHelp } from "@/flatmates/frontend/components/WhatsAppHelp";
import { LADDER, VISIBILITY } from "@/flatmates/backend/services/trust";
import { SCHEMAS, schemaStats } from "@/flatmates/backend/schemas/mongo";
import { portfolioHealth } from "@/flatmates/backend/services/canonical";
import { Database, Route as RouteIcon, ShieldCheck, Workflow, Target, LifeBuoy, ArrowRight } from "lucide-react";

const Card = ({ title, icon: Icon, children, id }: any) => (
  <section id={id} className="rounded-2xl border border-border bg-card p-4 mb-3">
    <h2 className="font-display font-semibold tracking-tight flex items-center gap-2 mb-2">
      {Icon && <Icon className="w-4 h-4 text-primary" />} {title}
    </h2>
    <div className="text-sm text-muted-foreground space-y-2 leading-relaxed">{children}</div>
  </section>
);

const Row = ({ k, v }: any) => (
  <div className="flex gap-3 py-1.5 border-b border-border/60 last:border-0">
    <span className="w-32 shrink-0 text-xs font-semibold text-foreground">{k}</span>
    <span className="text-xs">{v}</span>
  </div>
);

const JOURNEYS = [
  { who: "Seeker — needs a room", why: "Listings hide total cost, real availability and who you'd live with.", how: "Set requirement (zone, TOTAL budget, date window, room type) → gated matches with reasons → visit with safety controls → household vote → agreement → move-in.", href: "/flatmates/requirement", data: "Your requirement + lifestyle passport. Contact unlocks only on mutual intent." },
  { who: "Replacement host — one room free", why: "You need someone who fits the household, before your notice period ends.", how: "Post the room once as a canonical vacancy → confirm freshness daily → shortlist → private household vote → owner approval → handover.", href: "/flatmates/post", data: "Household profile from your own answers, with per-member consent." },
  { who: "Owner — whole flat or room-wise", why: "You want a filled unit with rent running, not fifty broker calls.", how: "Add property → authority verification (L3) → inspection (L4) → optional managed mandate (L5) → tenanting → ledger and payouts.", href: "/flatmates/owner", data: "Ownership/mandate evidence reference only — no documents stored." },
  { who: "Group — form a household", why: "Your budget only works pooled.", how: "Form group → pooled budget and zone → shortlist whole flats → joint visit → single tenancy.", href: "/flatmates/groups", data: "Group shape only, no personal data shared outside members." },
  { who: "Ops & admin", why: "Nothing must sit unowned.", how: "Control Tower shows freshness, orphaned work, SLA breaches, collection risk and supply missions, with a recovery action on every row.", href: "/flatmates/admin/tower", data: "Derived entirely from the append-only event stream and canonical graph." },
];

const SLAS = [
  ["Requirement re-confirmation", "Daily if moving in ≤7 days, every 3 days for 8–30 days"],
  ["Vacancy freshness", "24h for occupied rooms, 48h for whole flats — stale = hidden until reconfirmed"],
  ["Host reply to interest", "24h, then the match is re-distributed"],
  ["Household decision after a visit", "48h, then the candidate is released"],
  ["Maintenance", "Emergency 4h · Critical 24h · Standard 72h · Cosmetic next cycle"],
  ["Safety report review", "Critical within 2h with an immediate freeze on contact, visits and payments"],
  ["Owner reporting", "Monthly statement on the mandate reporting day"],
];

export default function FMPlaybook() {
  const stats = schemaStats();
  const h = portfolioHealth();
  return (
    <FMShell title="The playbook" sub="Why this exists, how to use it, and how the data actually flows" back="/flatmates" wide>
      <div className="rounded-2xl bg-primary text-primary-foreground p-5 mb-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] opacity-70">Gharpayy Flatmate & Shared Living OS</p>
        <h2 className="font-display text-2xl font-semibold tracking-tight mt-1">One filled home beats a thousand listings.</h2>
        <p className="text-sm opacity-85 mt-2">
          The north star is a completed move-in with a verified agreement and rent running — not leads, not enquiries, not listing count.
        </p>
        <div className="grid grid-cols-4 gap-2 mt-4">
          {[["Collections", stats.collections], ["Fields", stats.fields], ["Live vacancies", h.liveVacancies], ["Fresh %", h.freshnessPct + "%"]].map(([k, v]: any) => (
            <div key={k} className="rounded-xl bg-primary-foreground/10 px-2 py-2">
              <p className="text-lg font-display font-semibold leading-none">{v}</p>
              <p className="text-[10px] opacity-75 mt-1">{k}</p>
            </div>
          ))}
        </div>
      </div>

      <Card title="Why this product exists" icon={Target} id="why">
        <p>Shared living fails at four specific points, and each one is a product surface here:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong className="text-foreground">Fake or stale availability.</strong> Fixed by separating a permanent Room from a perishable Vacancy with a hard freshness clock. Stale supply is hidden, not ranked lower.</li>
          <li><strong className="text-foreground">Hidden total cost.</strong> Every match is gated on rent + maintenance + utilities + deposit, never headline rent.</li>
          <li><strong className="text-foreground">Unknown authority.</strong> Nobody can take a tour or see payment instructions until L3 proves they may actually let the unit.</li>
          <li><strong className="text-foreground">Mismatched living.</strong> Compatibility is scored on the household's real rules, weighted by what the seeker said actually matters.</li>
        </ul>
        <p className="pt-1"><strong className="text-foreground">Hard rule:</strong> person, household, room and property are separate records. The same fact is never copied into four listings — it is linked once.</p>
      </Card>

      <Card title="How to use it — by who you are" icon={RouteIcon} id="how">
        <div className="space-y-2">
          {JOURNEYS.map((j) => (
            <div key={j.who} className="rounded-xl border border-border p-3 bg-background">
              <p className="text-sm font-semibold text-foreground">{j.who}</p>
              <p className="text-xs mt-1"><span className="font-semibold text-foreground">Why:</span> {j.why}</p>
              <p className="text-xs mt-1"><span className="font-semibold text-foreground">How:</span> {j.how}</p>
              <p className="text-xs mt-1"><span className="font-semibold text-foreground">Data:</span> {j.data}</p>
              <Link href={j.href} className="inline-flex items-center gap-1 text-xs font-semibold text-primary mt-2">
                Start here <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ))}
        </div>
      </Card>

      <Card title="What way the data comes in" icon={Database} id="data">
        <Row k="Demand" v="Progressive 10-step onboarding, home-page setup selector, requirement editor, WhatsApp assisted intake by Flow Ops. Re-confirmed on a freshness clock." />
        <Row k="Supply" v="Host replacement flow, owner listing wizard, tenancy-notice events that auto-create a replacement vacancy, and ops supply surveys." />
        <Row k="Property truth" v="Owner authority documents (result + reference only), Gharpayy field inspection with photos, timestamp and geo proof, society/RWA rules." />
        <Row k="Household truth" v="Answered by the members themselves, each with individual consent before the profile is shown." />
        <Row k="Money" v="Rent schedule generator, payment webhooks, ops receipts with evidence, owner payout runs — all double-sided in the ledger." />
        <Row k="Behaviour" v="An append-only event stream. Every KPI, SLA and Control Tower row traces back to an event." />
        <p className="pt-2">Nothing in the product is hand-typed twice: every screen reads the canonical graph, so the day-one experience is already populated — there is no cold start.</p>
        <Link href="/flatmates/admin/schemas" className="inline-flex items-center gap-1 text-xs font-semibold text-primary">Browse all {stats.collections} MongoDB collections <ArrowRight className="w-3 h-3" /></Link>
      </Card>

      <Card title="Trust ladder — L0 to L5" icon={ShieldCheck} id="trust">
        <div className="space-y-1.5">
          {LADDER.map((l) => (
            <div key={l.level} className="rounded-xl border border-border p-3 bg-background">
              <p className="text-sm font-semibold text-foreground">{l.level} · {l.name}</p>
              <p className="text-xs mt-1">{l.evidence}</p>
              <p className="text-xs mt-1 text-primary font-medium">Unlocks: {l.unlocks}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Who can see what" icon={ShieldCheck} id="visibility">
        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-[11px]">
            <thead><tr className="text-left text-foreground">
              {["Field", "Public", "Mutual", "Visit", "Tenancy", "Gharpayy"].map((h) => <th key={h} className="px-1.5 py-1.5 font-semibold">{h}</th>)}
            </tr></thead>
            <tbody>
              {VISIBILITY.map((v) => (
                <tr key={v.field} className="border-t border-border/60">
                  <td className="px-1.5 py-1.5 font-medium text-foreground">{v.field}</td>
                  <td className="px-1.5 py-1.5">{v.public}</td><td className="px-1.5 py-1.5">{v.mutual}</td>
                  <td className="px-1.5 py-1.5">{v.visit}</td><td className="px-1.5 py-1.5">{v.tenancy}</td>
                  <td className="px-1.5 py-1.5">{v.gharpayy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Operating SLAs" icon={Workflow} id="sla">
        {SLAS.map(([k, v]) => <Row key={k} k={k} v={v} />)}
      </Card>

      <Card title="No dead ends, ever" icon={LifeBuoy} id="recovery">
        <p>When a search returns nothing, the engine diagnoses the single binding constraint (price, date, location, room type or supply) and offers concrete recoveries: near-miss homes, an adjacent micro-market, twin sharing, forming a group into a whole flat, a ready stay to bridge the gap, a registered supply mission for operators — and a human on WhatsApp carrying your zone, budget and date.</p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Link href="/flatmates/discover" className="h-9 px-3 rounded-xl bg-primary text-primary-foreground text-xs font-semibold inline-flex items-center">Try discovery</Link>
          <WhatsAppHelp module="Playbook" action="I read the playbook and want help getting started" label="Talk to Gharpayy" className="h-9 text-xs" />
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {[["Control Tower", "/flatmates/admin/tower"], ["Access keys", "/flatmates/admin/keys"], ["Data schemas", "/flatmates/admin/schemas"], ["Super admin", "/flatmates/admin/super"]].map(([l, href]) => (
          <Link key={href} href={href} className="rounded-xl border border-border bg-card p-3 text-sm font-semibold hover:border-primary transition-colors">{l}</Link>
        ))}
      </div>
    </FMShell>
  );
}
