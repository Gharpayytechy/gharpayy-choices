// @ts-nocheck
/**
 * TRUST LADDER, VISIBILITY MATRIX AND ADMIN ACCESS KEYS — playbook §5, §6, §9.
 * A single blue tick is not trust. Trust is layered evidence with expiry, and
 * every layer unlocks a specific capability in the product.
 */

export const LADDER = [
  { level: "L0", name: "Draft", evidence: "Self-declared only", unlocks: "Nothing is discoverable", blocks: "Search, contact, visits, payments", badge: "Draft" },
  { level: "L1", name: "Contact verified", evidence: "Mobile OTP (and email for work claims)", unlocks: "Requirement or listing can go live", blocks: "Exact address, payments", badge: "Contact verified" },
  { level: "L2", name: "Identity verified", evidence: "Consent-based offline e-KYC. Result stored, never the document or full Aadhaar number", unlocks: "Higher ranking, mutual contact unlock", blocks: "Tour of unverified units", badge: "ID verified" },
  { level: "L3", name: "Authority verified", evidence: "Proof the lister may actually let the unit: ownership document, registered agreement with sublet clause, or a management mandate", unlocks: "Tours become bookable; payment instructions can be shown", blocks: "Managed assurance", badge: "Authority verified" },
  { level: "L4", name: "Inspected", evidence: "Gharpayy visited the exact unit/room and recorded time-bound condition and availability evidence", unlocks: "Verified media badge, priority distribution, condition baseline for deposits", blocks: "Nothing", badge: "Gharpayy inspected" },
  { level: "L5", name: "Managed", evidence: "Signed management mandate: rent collection, maintenance SLA, inspection cadence, dispute handling", unlocks: "Assurance promises, escrowed deposit, owner payout cycle", blocks: "Nothing", badge: "Gharpayy managed" },
];

/** WHY: progressive disclosure. Data is exposed only when the stage justifies it. */
export const VISIBILITY = [
  { field: "First name & photo", public: "Yes", mutual: "Yes", visit: "Yes", tenancy: "Yes", gharpayy: "Yes" },
  { field: "Full name", public: "No", mutual: "Yes", visit: "Yes", tenancy: "Yes", gharpayy: "Yes" },
  { field: "Phone / email", public: "No", mutual: "On consent", visit: "Yes", tenancy: "Yes", gharpayy: "Yes" },
  { field: "Employer / college", public: "Type only", mutual: "Yes", visit: "Yes", tenancy: "Yes", gharpayy: "Yes" },
  { field: "Exact home address & unit number", public: "Masked area only", mutual: "Masked", visit: "Released for a confirmed visit", tenancy: "Yes", gharpayy: "Yes" },
  { field: "Identity evidence", public: "Badge only", mutual: "Badge only", visit: "Badge only", tenancy: "Badge only", gharpayy: "Result + reference, never the document" },
  { field: "Household private votes", public: "No", mutual: "No", visit: "No", tenancy: "No", gharpayy: "Yes (audited)" },
  { field: "Payment & ledger records", public: "No", mutual: "No", visit: "No", tenancy: "Own records", gharpayy: "Finance role only" },
  { field: "Safety report & reporter identity", public: "No", mutual: "No", visit: "No", tenancy: "No", gharpayy: "Trust & Safety role only" },
];

/** Admin control: every access key in one place, with purpose, scope and expiry. */
export const ROLES = [
  { role: "super_admin", label: "Super admin", people: "Founder / platform owner", scopes: ["admin:keys", "read:*", "write:*", "read:safety", "read:ledger"], purpose: "Whole-platform oversight and key issuance", expiryDays: 90, mfa: true },
  { role: "ops_supply", label: "Supply ops", people: "Zone supply managers", scopes: ["read:person.public", "write:vacancy", "write:unit", "read:address.exact", "write:mission"], purpose: "Source, verify and refresh inventory", expiryDays: 60, mfa: true },
  { role: "ops_flow", label: "Flow ops", people: "Match & conversion desk", scopes: ["read:person.public", "read:requirement", "write:match", "write:visit", "read:thread"], purpose: "Qualify demand, unblock matches, chase SLAs", expiryDays: 60, mfa: true },
  { role: "ops_pm", label: "Property management", people: "Tenancy & maintenance managers", scopes: ["read:unit", "write:tenancy", "write:ticket", "read:ledger", "read:address.exact"], purpose: "Run managed homes against the mandate", expiryDays: 60, mfa: true },
  { role: "ops_field", label: "Field ops", people: "Inspectors & move-in coordinators", scopes: ["write:inspection", "read:address.exact", "read:unit"], purpose: "On-site condition and availability evidence", expiryDays: 30, mfa: true },
  { role: "ops_trust", label: "Trust & safety", people: "Moderation and verification desk", scopes: ["read:person.pii", "read:safety", "write:verification", "write:restriction"], purpose: "Verification decisions and safety cases", expiryDays: 30, mfa: true },
  { role: "finance", label: "Finance", people: "Collections and payouts", scopes: ["read:ledger", "write:ledger", "read:mandate"], purpose: "Rent, deposits, payouts and reconciliation", expiryDays: 60, mfa: true },
  { role: "analytics", label: "Analytics", people: "Growth & data", scopes: ["read:events", "read:aggregates"], purpose: "KPIs on de-identified aggregates only", expiryDays: 180, mfa: false },
  { role: "owner_portal", label: "Owner portal", people: "Property owners", scopes: ["read:unit.own", "read:ledger.own", "read:ticket.own", "read:tenancy.own"], purpose: "Owner sees their own portfolio only", expiryDays: 365, mfa: false },
  { role: "service_integration", label: "Service integration", people: "Payments / KYC / maps providers", scopes: ["write:webhook", "read:minimal"], purpose: "Machine-to-machine, purpose-scoped", expiryDays: 90, mfa: false },
];

export const SCOPE_LEGEND = [
  { scope: "read:person.public", risk: "low", meaning: "Public card fields only — first name, age band, occupation type" },
  { scope: "read:person.pii", risk: "high", meaning: "Full name, contact, verification results. Trust & Safety only, purpose logged" },
  { scope: "read:address.exact", risk: "high", meaning: "Unit number and exact address. Every read writes an audit event" },
  { scope: "read:ledger", risk: "high", meaning: "Rent, deposits and payouts" },
  { scope: "write:ledger", risk: "critical", meaning: "Can create money movement. Dual approval above the mandate cap" },
  { scope: "read:safety", risk: "critical", meaning: "Safety cases and reporter identity. Never leaves the Trust role" },
  { scope: "admin:keys", risk: "critical", meaning: "Issue, rotate and revoke every other key" },
];

const DAY = 86400000;
const iso = (d: number) => new Date(Date.now() + d * DAY).toISOString();

/** Demo key inventory — real deployments store an Argon2id hash and last-4 only. */
export function accessKeys() {
  return ROLES.map((r, i) => {
    const daysLeft = r.expiryDays - ((i * 11) % r.expiryDays);
    return {
      id: "key_" + r.role,
      label: `${r.label} key`,
      role: r.role,
      scopes: r.scopes,
      last4: String(1000 + i * 137).slice(-4),
      purpose: r.purpose,
      mfa: r.mfa,
      issuedAt: iso(-(r.expiryDays - daysLeft)),
      expiresAt: iso(daysLeft),
      daysLeft,
      lastUsedAt: iso(-(i % 4) - 0.2),
      status: daysLeft < 8 ? "expiring" : "active",
    };
  });
}

export function keyRisk(scopes: string[]) {
  const levels = scopes.map((s) => SCOPE_LEGEND.find((l) => l.scope === s)?.risk || (s.includes("*") ? "critical" : "low"));
  if (levels.includes("critical")) return "critical";
  if (levels.includes("high")) return "high";
  return "standard";
}

export function levelOf(verified: any = {}, extras: any = {}) {
  if (extras.managed) return "L5";
  if (extras.inspected) return "L4";
  if (extras.authority || verified.owner) return "L3";
  if (verified.id) return "L2";
  if (verified.phone) return "L1";
  return "L0";
}
