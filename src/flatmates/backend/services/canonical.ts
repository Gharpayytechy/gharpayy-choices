// @ts-nocheck
/**
 * CANONICAL GRAPH — playbook §2.
 * Builds the linked Building → Unit → Room → Vacancy → Household → Tenancy →
 * Ledger / Inspection / Ticket graph from the live marketplace store.
 *
 * Hard rule enforced here: the same fact is stored ONCE and linked. Building
 * facts are never copied into rooms; availability lives only on the vacancy.
 *
 * Because it is derived from live store data (seed + everything users create),
 * every screen that reads the graph is populated from the first second —
 * this is the no-cold-start guarantee.
 */
import { repo } from "@/flatmates/backend/repository";
import { coordinatesFor } from "@/flatmates/backend/store/locations";

const DAY = 86400000;
const at = (d: number) => new Date(Date.now() + d * DAY).toISOString();
const hash = (s: string) => Array.from(String(s)).reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 100000, 7);

const SOCIETIES = ["Brigade Palm Grove", "Sobha Aspire", "Prestige Lakeside", "Salarpuria Symphony", "Purva Highland", "Mantri Elite"];

function buildingFor(area: string, seed: number) {
  const h = hash(area + seed);
  return {
    id: `bld_${area.replace(/\s+/g, "_").toLowerCase()}_${h % 4}`,
    name: `${SOCIETIES[h % SOCIETIES.length]}`,
    city: "Bengaluru",
    area,
    addressMasked: `Sector ${(h % 6) + 1}, ${area}`,
    geo: coordinatesFor(area, h % 7),
    gated: h % 3 !== 0,
    towers: 1 + (h % 4),
    constructionYear: 2008 + (h % 15),
    security: { guard24x7: h % 3 !== 0, cctv: h % 2 === 0, visitorLog: true },
    associationRules: [h % 2 ? "Bachelors allowed with agreement" : "Family + working professionals", "Move-in 8am–7pm", "No loud music after 11pm"],
    utilities: { waterSource: h % 2 ? "Borewell + Cauvery" : "Cauvery", powerBackup: h % 3 !== 2, gasPipeline: h % 2 === 0, meterType: "Sub-metered" },
    amenities: ["Lift", "Parking", "Security", h % 2 ? "Gym" : "Play area"],
  };
}

/** Freshness rules from the playbook: 24h occupied rooms, 48h whole flats. */
export function freshnessOf(rec: any, kind: string) {
  const windowMs = kind === "flat" ? 48 * 3600000 : 24 * 3600000;
  const confirmed = rec.freshConfirmedAt ? Date.parse(rec.freshConfirmedAt) : Date.parse(rec.verifiedAt || rec.availableFrom || new Date().toISOString());
  const ageMs = Date.now() - confirmed;
  const due = confirmed + windowMs;
  return {
    confirmedAt: new Date(confirmed).toISOString(),
    dueAt: new Date(due).toISOString(),
    hoursLeft: Math.round((due - Date.now()) / 3600000),
    ageHours: Math.round(ageMs / 3600000),
    stale: Date.now() > due,
    score: Math.max(0, Math.round(100 - (ageMs / windowMs) * 100)),
  };
}

export function canonicalGraph() {
  const rooms = repo.rooms.all();
  const flats = repo.flats.all();
  const people = repo.people.all();
  const ready = repo.ready();

  const buildings: Record<string, any> = {};
  const units: any[] = [];
  const roomRecords: any[] = [];
  const vacancies: any[] = [];
  const households: any[] = [];
  const tenancies: any[] = [];
  const ledger: any[] = [];
  const inspections: any[] = [];
  const tickets: any[] = [];
  const mandates: any[] = [];

  const addBuilding = (area: string, seed: number) => {
    const b = buildingFor(area, seed);
    buildings[b.id] = buildings[b.id] || b;
    return b;
  };

  const push = (src: any, i: number, kind: "room" | "flat" | "ready") => {
    const b = addBuilding(src.area, i);
    const unitId = `unit_${src.id}`;
    const bhk = src.bhk || (kind === "ready" ? 3 : 2);
    const authorityVerified = kind !== "room" || i % 3 !== 1;
    const unit = {
      id: unitId,
      buildingId: b.id,
      unitNumber: `${(hash(src.id) % 12) + 1}0${(hash(src.id) % 4) + 1}`,
      bhk,
      floor: (hash(src.id) % 12) + 1,
      furnishing: src.furnishing || "Semi-furnished",
      ownerActor: src.ownerActor || "owner_meera",
      authority: {
        type: kind === "room" ? (src.type === "ROOM_REPLACEMENT" ? "tenant" : "owner") : kind === "ready" ? "mandate" : "owner",
        verifiedAt: authorityVerified ? at(-(5 + (i % 20))) : null,
        allowsSublet: kind !== "flat",
        allowsReplacement: true,
      },
      tenancyModel: kind === "flat" ? "whole_flat" : kind === "ready" ? "managed" : "room_wise",
      conditionGrade: ["A", "B", "A", "C", "B"][i % 5],
      rentReady: true,
      sourceKind: kind,
      sourceId: src.id,
      area: src.area,
      city: src.city || "Bengaluru",
      coordinates: src.coordinates || b.geo,
      title: src.title,
      rent: src.rent,
    };
    units.push(unit);

    // rooms inside the unit (canonical physical facts)
    const roomCount = kind === "flat" ? bhk : 1;
    for (let r = 0; r < roomCount; r++) {
      roomRecords.push({
        id: `${unitId}_room${r}`,
        unitId,
        label: r === 0 ? "Master bedroom" : `Bedroom ${r + 1}`,
        roomType: src.roomType || "Private room",
        maxOccupancy: /shared|twin/i.test(src.roomType || "") ? 2 : 1,
        currentOccupancy: kind === "flat" ? 0 : 0,
        bathroom: src.bathroom || (r === 0 ? "Attached" : "Shared"),
        balcony: src.balcony ?? r === 0,
        daylight: ["bright", "moderate", "bright", "dim"][(i + r) % 4],
        furniture: { bed: true, wardrobe: true, desk: (i + r) % 2 === 0, curtains: true },
        knownDefects: (i + r) % 5 === 0 ? ["Minor seepage on the north wall — repair scheduled"] : [],
      });
    }

    // ONE canonical vacancy per listing
    const inventoryType = kind === "ready" ? "ready_stay" : kind === "flat" ? "whole_flat" : src.type === "ROOM_REPLACEMENT" ? "replacement_vacancy" : "occupied_shared_room";
    const fresh = freshnessOf(src, kind);
    const rent = src.rent || 0;
    const maintenance = src.maintenance ?? 1500;
    const utilities = src.utilities ?? 1200;
    vacancies.push({
      id: `vac_${src.id}`,
      roomId: `${unitId}_room0`,
      unitId,
      buildingId: b.id,
      householdId: kind === "room" ? `hh_${src.id}` : null,
      inventoryType,
      availableFrom: src.availableFrom || at(3),
      certainty: fresh.stale ? "tentative" : i % 4 === 3 ? "likely" : "confirmed",
      replacementReason: inventoryType === "replacement_vacancy" ? ["Job relocation", "Lease end", "Moving in with partner"][i % 3] : null,
      rent,
      maintenanceShare: maintenance,
      utilitiesMethod: "split_equal",
      utilitiesEstimate: utilities,
      depositAmount: src.deposit || rent * 2,
      depositHandover: inventoryType === "replacement_vacancy" ? "to_outgoing_tenant" : "to_owner",
      totalMonthly: rent + maintenance + utilities,
      totalMoveInCost: rent + maintenance + utilities + (src.deposit || rent * 2),
      tourable: !!unit.authority.verifiedAt,
      freshness: fresh,
      status: fresh.stale ? "stale" : "live",
      area: src.area,
      city: src.city || "Bengaluru",
      coordinates: src.coordinates || b.geo,
      title: src.title,
      roomType: src.roomType,
      genderPref: src.genderPref,
      sourceKind: kind,
      sourceId: src.id,
      detailHref: kind === "flat" ? `/flatmates/flat/${src.id}` : kind === "ready" ? `/flatmates/ready` : `/flatmates/room/${src.id}`,
    });

    // household (rooms only — a household is people, not walls)
    if (kind === "room") {
      households.push({
        id: `hh_${src.id}`,
        unitId,
        members: src.householdMembers || [],
        leaving: inventoryType === "replacement_vacancy" ? [src.householdMembers?.[0]?.name].filter(Boolean) : [],
        rhythm: { quietHours: src.rules?.quiet || "After 11 PM", wfhDays: (i % 3) + 1, socialLevel: src.dna?.social || "Balanced" },
        kitchen: { vegPolicy: src.dna?.food || "Both", cookingFrequency: src.rules?.cooking || "Sometimes", sharedGroceries: i % 2 === 0 },
        homeCare: { maid: src.rules?.cleaning === "Maid", choreSplit: "Rotational", cleaningStandard: src.dna?.cleanliness || "Normal" },
        lifestyle: { smoking: src.rules?.smoking || "No", guests: src.rules?.guests || "Occasionally", pets: src.rules?.pets || "Okay" },
        money: { utilitySplit: "Equal split", commonFund: i % 2 === 0, dueDateBehaviour: "On time" },
        decision: { votingRule: i % 3 === 0 ? "unanimous" : "majority", ownerApprovalRequired: i % 2 === 0, responseDeadlineHours: 48 },
        consentComplete: i % 4 !== 3,
      });
    }

    // managed inventory carries a mandate + tenancy + ledger + inspection
    if (kind === "ready" || i % 3 === 0) {
      mandates.push({
        id: `mnd_${src.id}`,
        unitId,
        ownerActor: unit.ownerActor,
        scope: kind === "ready" ? ["full"] : ["listing", "tenanting", "rent_collection"],
        feeModel: { type: "pct", value: kind === "ready" ? 12 : 8 },
        emergencyApprovalCapInr: 5000,
        inspectionCadence: "quarterly",
        payout: { cycleDay: 7, method: "NEFT" },
        startAt: at(-(90 + i * 10)),
        endAt: at(275 - i * 10),
        status: i % 7 === 6 ? "notice" : "active",
      });
    }

    if (kind !== "flat") {
      const active = i % 4 !== 0;
      const tenancyRent = Math.round(rent * 0.96);
      const tid = `tny_${src.id}`;
      if (active) {
        tenancies.push({
          id: tid,
          unitId,
          roomId: `${unitId}_room0`,
          householdId: kind === "room" ? `hh_${src.id}` : null,
          tenants: (src.householdMembers || []).map((m: any) => m.name).slice(0, 2),
          rentAmount: tenancyRent,
          rentDueDay: 5,
          depositHeld: src.deposit || rent * 2,
          depositHolder: kind === "ready" ? "gharpayy" : "owner",
          lockInMonths: 6,
          noticeDays: 30,
          moveInAt: at(-(60 + i * 12)),
          noticeGivenAt: inventoryType === "replacement_vacancy" ? at(-(10 + i)) : null,
          status: inventoryType === "replacement_vacancy" ? "notice" : "active",
          agreement: { form: "11-month leave & licence", signedAt: at(-(62 + i * 12)), registered: i % 2 === 0 },
        });

        for (let m = 2; m >= 0; m--) {
          const due = at(-m * 30 + 5);
          const overdue = m === 0 && i % 5 === 1;
          ledger.push({
            id: `led_${src.id}_${m}`,
            tenancyId: tid, unitId,
            kind: "rent", direction: "inbound",
            amount: tenancyRent,
            dueAt: due,
            paidAt: overdue ? null : due,
            payeeName: kind === "ready" ? "Gharpayy Managed" : "Property owner",
            payeeVerifiedRelationship: kind === "ready" ? "gharpayy_managed" : "owner",
            purpose: "Monthly rent",
            refundable: false,
            status: overdue ? "overdue" : "paid",
          });
        }
        ledger.push({
          id: `led_${src.id}_dep`, tenancyId: tid, unitId,
          kind: "deposit", direction: "inbound", amount: src.deposit || rent * 2,
          dueAt: at(-(60 + i * 12)), paidAt: at(-(60 + i * 12)),
          payeeName: kind === "ready" ? "Gharpayy Escrow" : "Property owner",
          payeeVerifiedRelationship: kind === "ready" ? "gharpayy_managed" : "owner",
          purpose: "Refundable security deposit", refundable: true, status: "paid",
        });
      }
    }

    inspections.push({
      id: `insp_${src.id}`,
      unitId,
      type: i % 3 === 0 ? "baseline" : "periodic",
      conductedAt: at(-(7 + (i % 40))),
      grade: unit.conditionGrade,
      defects: i % 4 === 1 ? [{ description: "Geyser slow to heat", severity: "standard", estimatedCost: 1800, ownerApprovalNeeded: false }] : [],
      safetyBlockers: [],
      rentReadyDate: at(-(5 + (i % 30))),
    });

    if (i % 5 === 2) {
      tickets.push({
        id: `tkt_${src.id}`, unitId,
        category: ["plumbing", "electrical", "appliance", "pest"][i % 4],
        severity: i % 9 === 2 ? "critical" : "standard",
        raisedBy: src.householdMembers?.[0]?.name || "Tenant",
        slaDueAt: at(i % 9 === 2 ? 0 : 2),
        estimatedCost: 1200 + (i % 5) * 700,
        approvalRequired: (1200 + (i % 5) * 700) > 5000,
        status: i % 9 === 2 ? "in_progress" : "open",
      });
    }
  };

  rooms.forEach((r: any, i: number) => push(r, i, "room"));
  flats.forEach((f: any, i: number) => push(f, i + 40, "flat"));
  ready.forEach((r: any, i: number) => push(r, i + 80, "ready"));

  return {
    buildings: Object.values(buildings),
    units,
    rooms: roomRecords,
    vacancies,
    households,
    tenancies,
    ledger,
    inspections,
    tickets,
    mandates,
    people,
  };
}

/** Digital twin for one unit: everything linked, nothing duplicated. */
export function propertyTwin(unitId: string) {
  const g = canonicalGraph();
  const unit = g.units.find((u: any) => u.id === unitId) || g.units.find((u: any) => u.sourceId === unitId);
  if (!unit) return null;
  const building = g.buildings.find((b: any) => b.id === unit.buildingId);
  return {
    building,
    unit,
    rooms: g.rooms.filter((r: any) => r.unitId === unit.id),
    vacancies: g.vacancies.filter((v: any) => v.unitId === unit.id),
    household: g.households.find((h: any) => h.unitId === unit.id),
    tenancies: g.tenancies.filter((t: any) => t.unitId === unit.id),
    ledger: g.ledger.filter((l: any) => l.unitId === unit.id),
    inspections: g.inspections.filter((x: any) => x.unitId === unit.id),
    tickets: g.tickets.filter((t: any) => t.unitId === unit.id),
    mandate: g.mandates.find((m: any) => m.unitId === unit.id),
  };
}

/** Control-tower rollups — every number traceable to the graph above. */
export function portfolioHealth() {
  const g = canonicalGraph();
  const live = g.vacancies.filter((v: any) => v.status === "live");
  const stale = g.vacancies.filter((v: any) => v.status === "stale");
  const notTourable = g.vacancies.filter((v: any) => !v.tourable);
  const overdue = g.ledger.filter((l: any) => l.status === "overdue");
  const collected = g.ledger.filter((l: any) => l.kind === "rent" && l.status === "paid");
  const dueTotal = g.ledger.filter((l: any) => l.kind === "rent").reduce((n: number, l: any) => n + l.amount, 0);
  const breaches = g.tickets.filter((t: any) => Date.parse(t.slaDueAt) < Date.now() && t.status !== "closed");
  const noticeSoon = g.tenancies.filter((t: any) => t.status === "notice");
  return {
    units: g.units.length,
    buildings: g.buildings.length,
    rooms: g.rooms.length,
    liveVacancies: live.length,
    staleVacancies: stale.length,
    freshnessPct: g.vacancies.length ? Math.round((live.length / g.vacancies.length) * 100) : 100,
    notTourable: notTourable.length,
    households: g.households.length,
    activeTenancies: g.tenancies.filter((t: any) => t.status === "active").length,
    noticeTenancies: noticeSoon.length,
    overdueCount: overdue.length,
    overdueAmount: overdue.reduce((n: number, l: any) => n + l.amount, 0),
    collectionPct: dueTotal ? Math.round((collected.reduce((n: number, l: any) => n + l.amount, 0) / dueTotal) * 100) : 100,
    openTickets: g.tickets.filter((t: any) => t.status !== "closed").length,
    slaBreaches: breaches.length,
    managedUnits: g.mandates.filter((m: any) => m.status === "active").length,
    inspectionsDue: g.inspections.filter((x: any) => Date.now() - Date.parse(x.conductedAt) > 90 * DAY).length,
    graph: g,
  };
}
