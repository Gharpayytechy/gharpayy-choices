// @ts-nocheck
import { Link, useParams } from "wouter";
import { FMShell } from "@/flatmates/frontend/components/Shell";
import { WhatsAppHelp } from "@/flatmates/frontend/components/WhatsAppHelp";
import { propertyTwin, canonicalGraph } from "@/flatmates/backend/services/canonical";
import { Building2, DoorOpen, Users, ReceiptIndianRupee, ClipboardCheck, Wrench, BadgeCheck, ArrowRight } from "lucide-react";

const inr = (n: number) => "₹" + Number(n || 0).toLocaleString("en-IN");
const day = (d: string) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—");

const Sec = ({ title, icon: Icon, sub, children }: any) => (
  <section className="rounded-2xl border border-border bg-card p-4 mb-3">
    <div className="flex items-center gap-2 mb-2">
      <Icon className="w-4 h-4 text-primary" />
      <h2 className="font-display font-semibold tracking-tight text-sm">{title}</h2>
      {sub && <span className="ml-auto text-[10px] text-muted-foreground">{sub}</span>}
    </div>
    {children}
  </section>
);

const KV = ({ k, v }: any) => (
  <div className="flex justify-between gap-3 py-1 text-xs border-b border-border/50 last:border-0">
    <span className="text-muted-foreground">{k}</span><span className="font-medium text-right">{v}</span>
  </div>
);

export default function FMProperty() {
  const { id } = useParams();
  const twin = propertyTwin(id);

  if (!twin) {
    const g = canonicalGraph();
    return (
      <FMShell title="Property twin" sub="Pick a unit to open its full record" back="/flatmates/owner">
        <p className="text-sm text-muted-foreground mb-3">Every unit in the canonical graph — building, rooms, vacancy, household, tenancy, money and inspections all linked to one record.</p>
        <div className="space-y-2">
          {g.units.slice(0, 24).map((u: any) => (
            <Link key={u.id} href={`/flatmates/property/${u.id}`} className="block rounded-xl border border-border bg-card p-3 hover:border-primary transition-colors">
              <p className="text-sm font-semibold">{u.title || `${u.bhk}BHK · ${u.area}`}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{u.area} · {u.tenancyModel.replace(/_/g, " ")} · grade {u.conditionGrade}</p>
            </Link>
          ))}
        </div>
      </FMShell>
    );
  }

  const { building, unit, rooms, vacancies, household, tenancies, ledger, inspections, tickets, mandate } = twin;
  const overdue = ledger.filter((l: any) => l.status === "overdue");
  const level = mandate?.status === "active" ? "L5 Managed" : inspections.length ? "L4 Inspected" : unit.authority.verifiedAt ? "L3 Authority verified" : "L1 Contact verified";

  return (
    <FMShell title={unit.title || `${unit.bhk}BHK · ${unit.area}`} sub={`${building.name} · ${building.addressMasked}`} back="/flatmates/owner" wide>
      <div className="rounded-2xl bg-primary text-primary-foreground p-4 mb-3">
        <div className="flex items-center gap-2">
          <BadgeCheck className="w-4 h-4" />
          <p className="text-sm font-semibold">{level}</p>
          <span className="ml-auto text-[10px] uppercase tracking-[0.14em] opacity-70">Canonical record</span>
        </div>
        <p className="text-xs opacity-85 mt-2">
          One record. Building facts, room facts, availability, household, tenancy and money are linked — never duplicated across listings.
        </p>
      </div>

      <Sec title="Building / society" icon={Building2} sub={building.area}>
        <KV k="Society" v={building.name} />
        <KV k="Location shown publicly" v={building.addressMasked} />
        <KV k="Gated / security" v={`${building.gated ? "Gated" : "Standalone"} · ${building.security.guard24x7 ? "24×7 guard" : "Day guard"}${building.security.cctv ? " · CCTV" : ""}`} />
        <KV k="Built" v={building.constructionYear} />
        <KV k="Utilities" v={`${building.utilities.waterSource} · ${building.utilities.powerBackup ? "Power backup" : "No backup"} · ${building.utilities.meterType}`} />
        <KV k="Association rules" v={building.associationRules.join(" · ")} />
      </Sec>

      <Sec title="Unit / flat" icon={DoorOpen} sub={`Unit ${unit.unitNumber}`}>
        <KV k="Configuration" v={`${unit.bhk}BHK · floor ${unit.floor} · ${unit.furnishing}`} />
        <KV k="Tenancy model" v={unit.tenancyModel.replace(/_/g, " ")} />
        <KV k="Authority" v={`${unit.authority.type} · ${unit.authority.verifiedAt ? "verified " + day(unit.authority.verifiedAt) : "NOT verified — tours blocked"}`} />
        <KV k="Condition grade" v={unit.conditionGrade} />
        <div className="grid gap-2 mt-3">
          {rooms.map((r: any) => (
            <div key={r.id} className="rounded-xl border border-border p-2.5">
              <p className="text-xs font-semibold">{r.label} · {r.roomType}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{r.bathroom} bath · {r.balcony ? "balcony" : "no balcony"} · {r.daylight} light · up to {r.maxOccupancy}</p>
              {r.knownDefects.length > 0 && <p className="text-[11px] text-destructive mt-1">Disclosed: {r.knownDefects.join(", ")}</p>}
            </div>
          ))}
        </div>
      </Sec>

      <Sec title="Vacancy (the sellable object)" icon={ArrowRight} sub={`${vacancies.length} canonical`}>
        {vacancies.map((v: any) => (
          <div key={v.id} className="rounded-xl border border-border p-3 mb-2 last:mb-0">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${v.status === "live" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>{v.status}</span>
              <span className="text-[11px] text-muted-foreground">{v.inventoryType.replace(/_/g, " ")}</span>
              <span className="ml-auto text-[11px] text-muted-foreground">{v.freshness.stale ? "needs reconfirmation" : `fresh · ${v.freshness.hoursLeft}h left`}</span>
            </div>
            <KV k="Available from" v={`${day(v.availableFrom)} · ${v.certainty}`} />
            <KV k="Rent" v={inr(v.rent)} />
            <KV k="Maintenance + utilities" v={`${inr(v.maintenanceShare)} + ${inr(v.utilitiesEstimate)} (${v.utilitiesMethod.replace(/_/g, " ")})`} />
            <KV k="Total monthly" v={<strong>{inr(v.totalMonthly)}</strong>} />
            <KV k="Deposit" v={`${inr(v.depositAmount)} → ${v.depositHandover.replace(/_/g, " ")}`} />
            <KV k="Total move-in cost" v={<strong>{inr(v.totalMoveInCost)}</strong>} />
            <KV k="Tourable" v={v.tourable ? "Yes" : "No — authority not verified"} />
            {v.replacementReason && <KV k="Replacement reason" v={v.replacementReason} />}
            <Link href={v.detailHref} className="inline-flex items-center gap-1 text-xs font-semibold text-primary mt-2">Open public listing <ArrowRight className="w-3 h-3" /></Link>
          </div>
        ))}
      </Sec>

      {household && (
        <Sec title="Household" icon={Users} sub={`${household.members.length} members`}>
          <p className="text-xs text-muted-foreground mb-2">{household.members.map((m: any) => `${m.name} (${m.age}, ${m.work})`).join(" · ")}</p>
          <KV k="Quiet hours / WFH" v={`${household.rhythm.quietHours} · ${household.rhythm.wfhDays} WFH days · ${household.rhythm.socialLevel}`} />
          <KV k="Kitchen" v={`${household.kitchen.vegPolicy} · cooking ${household.kitchen.cookingFrequency}${household.kitchen.sharedGroceries ? " · shared groceries" : ""}`} />
          <KV k="Home care" v={`${household.homeCare.maid ? "Maid" : "Self-managed"} · ${household.homeCare.choreSplit} · ${household.homeCare.cleaningStandard}`} />
          <KV k="Lifestyle" v={`Smoking ${household.lifestyle.smoking} · guests ${household.lifestyle.guests} · pets ${household.lifestyle.pets}`} />
          <KV k="Money" v={`${household.money.utilitySplit} · ${household.money.dueDateBehaviour}`} />
          <KV k="Decision" v={`${household.decision.votingRule} vote${household.decision.ownerApprovalRequired ? " + owner approval" : ""} · ${household.decision.responseDeadlineHours}h deadline`} />
          <KV k="Member consent" v={household.consentComplete ? "All members consented to show the profile" : "Pending from one member — profile partially masked"} />
        </Sec>
      )}

      <Sec title="Tenancy" icon={ClipboardCheck} sub={`${tenancies.length} record(s)`}>
        {tenancies.length === 0 && <p className="text-xs text-muted-foreground">No active tenancy — this unit is fully vacant.</p>}
        {tenancies.map((t: any) => (
          <div key={t.id} className="rounded-xl border border-border p-3 mb-2 last:mb-0">
            <KV k="Status" v={t.status} />
            <KV k="Tenants" v={t.tenants.join(", ") || "—"} />
            <KV k="Rent / due day" v={`${inr(t.rentAmount)} · ${t.rentDueDay}th`} />
            <KV k="Deposit held by" v={`${inr(t.depositHeld)} · ${t.depositHolder}`} />
            <KV k="Lock-in / notice" v={`${t.lockInMonths} months · ${t.noticeDays} days`} />
            <KV k="Agreement" v={`${t.agreement.form} · signed ${day(t.agreement.signedAt)}${t.agreement.registered ? " · registered" : ""}`} />
            <KV k="Moved in" v={day(t.moveInAt)} />
            {t.noticeGivenAt && <KV k="Notice given" v={`${day(t.noticeGivenAt)} → replacement vacancy auto-created`} />}
          </div>
        ))}
      </Sec>

      <Sec title="Money" icon={ReceiptIndianRupee} sub={overdue.length ? `${overdue.length} overdue` : "on track"}>
        {mandate && <KV k="Mandate" v={`${mandate.scope.join(", ")} · ${mandate.feeModel.value}% · payout day ${mandate.payout.cycleDay} · ${mandate.status}`} />}
        <div className="mt-2 space-y-1">
          {ledger.slice(0, 8).map((l: any) => (
            <div key={l.id} className="flex items-center gap-2 text-xs py-1.5 border-b border-border/50 last:border-0">
              <span className="w-20 text-muted-foreground">{day(l.dueAt)}</span>
              <span className="flex-1">{l.purpose}</span>
              <span className="font-medium">{inr(l.amount)}</span>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${l.status === "paid" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>{l.status}</span>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground mt-2">Payee shown before payment: <strong className="text-foreground">{ledger[0]?.payeeName}</strong> ({ledger[0]?.payeeVerifiedRelationship?.replace(/_/g, " ")}).</p>
      </Sec>

      <Sec title="Inspections & tickets" icon={Wrench} sub={`${inspections.length} visits · ${tickets.length} open`}>
        {inspections.map((x: any) => (
          <KV key={x.id} k={`${x.type.replace(/_/g, " ")} · ${day(x.conductedAt)}`} v={`Grade ${x.grade}${x.defects.length ? ` · ${x.defects.length} defect(s)` : " · no defects"}`} />
        ))}
        {tickets.map((t: any) => (
          <KV key={t.id} k={`${t.category} · ${t.severity}`} v={`${t.status} · SLA ${day(t.slaDueAt)} · est ${inr(t.estimatedCost)}`} />
        ))}
      </Sec>

      <div className="flex flex-wrap gap-2 mb-4">
        <Link href="/flatmates/owner" className="h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold inline-flex items-center">Owner desk</Link>
        <WhatsAppHelp module="Property twin" action="Help me with this property record" reference={unit.id} area={unit.area} />
      </div>
    </FMShell>
  );
}
