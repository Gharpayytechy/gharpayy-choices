/**
 * Shared listing/profile quality rules.
 * Used by the publish form (live feedback) and by the server-side gate
 * (authoritative decision). Keep it pure so both sides agree.
 */

export type ListingDraft = {
  kind?: string;
  title?: string;
  description?: string;
  city?: string;
  area?: string;
  address?: string;
  rent?: number | null;
  deposit?: number | null;
  maintenance?: number | null;
  utilities_estimate?: number | null;
  available_from?: string | null;
  room_type?: string;
  furnished?: string;
  attached_bath?: boolean;
  photos?: string[];
  household?: Record<string, unknown>;
  authority?: string;
  min_duration_months?: number | null;
};

export type Rule = {
  key: string;
  label: string;
  weight: number;
  ok: boolean;
};

const has = (v: unknown) => v !== undefined && v !== null && String(v).trim() !== "";

export function scoreListing(d: ListingDraft): { score: number; rules: Rule[]; missing: string[] } {
  const photos = d.photos ?? [];
  const hh = d.household ?? {};
  const rules: Rule[] = [
    { key: "title", label: "Clear title (10+ characters)", weight: 5, ok: (d.title ?? "").trim().length >= 10 },
    { key: "description", label: "Honest description (80+ characters)", weight: 8, ok: (d.description ?? "").trim().length >= 80 },
    { key: "location", label: "City and exact area", weight: 8, ok: has(d.city) && has(d.area) },
    { key: "address", label: "Street / building address", weight: 6, ok: (d.address ?? "").trim().length >= 8 },
    { key: "photos", label: "5 or more real photos of this room and flat", weight: 18, ok: photos.length >= 5 },
    { key: "photos_unique", label: "No duplicate photos", weight: 4, ok: photos.length === new Set(photos).size },
    { key: "rent", label: "Exact monthly rent", weight: 10, ok: !!d.rent && d.rent >= 1500 && d.rent <= 500000 },
    { key: "deposit", label: "Deposit amount stated", weight: 8, ok: d.deposit !== null && d.deposit !== undefined && d.deposit >= 0 },
    { key: "extras", label: "Maintenance and utilities estimate", weight: 6, ok: d.maintenance !== null && d.maintenance !== undefined && d.utilities_estimate !== null && d.utilities_estimate !== undefined },
    { key: "date", label: "Exact availability date", weight: 8, ok: has(d.available_from) },
    { key: "room", label: "Room type and furnishing", weight: 7, ok: has(d.room_type) && has(d.furnished) },
    { key: "duration", label: "Minimum stay stated", weight: 4, ok: !!d.min_duration_months },
    { key: "household", label: "Household reality (schedule, food, smoking, guests)", weight: 5, ok: ["schedule", "food", "smoking", "guests"].every((k) => has((hh as Record<string, unknown>)[k])) },
    { key: "authority", label: "You declared your authority to rent this out", weight: 3, ok: has(d.authority) },
  ];
  const score = Math.round(rules.filter((r) => r.ok).reduce((s, r) => s + r.weight, 0));
  return { score, rules, missing: rules.filter((r) => !r.ok).map((r) => r.label) };
}

export const LISTING_THRESHOLD = 80;

export type ProfileDraft = {
  full_name?: string;
  phone?: string;
  city?: string;
  occupation?: string;
  company_or_college?: string;
  about?: string;
  phone_verified?: boolean;
  email_verified?: boolean;
  work_verified?: boolean;
  id_verified?: boolean;
};

export function scoreProfile(p: ProfileDraft): { score: number; rules: Rule[]; missing: string[] } {
  const rules: Rule[] = [
    { key: "name", label: "Real full name", weight: 15, ok: (p.full_name ?? "").trim().split(/\s+/).length >= 2 },
    { key: "phone", label: "Phone number added", weight: 10, ok: /^[0-9+\s-]{10,15}$/.test((p.phone ?? "").trim()) },
    { key: "phone_verified", label: "Phone verified", weight: 25, ok: !!p.phone_verified },
    { key: "email_verified", label: "Email verified", weight: 15, ok: !!p.email_verified },
    { key: "work", label: "Occupation and company / college", weight: 15, ok: has(p.occupation) && has(p.company_or_college) },
    { key: "city", label: "City selected", weight: 5, ok: has(p.city) },
    { key: "about", label: "A few honest lines about you", weight: 5, ok: (p.about ?? "").trim().length >= 40 },
    { key: "extra_verification", label: "Work or ID verification", weight: 10, ok: !!p.work_verified || !!p.id_verified },
  ];
  const score = rules.filter((r) => r.ok).reduce((s, r) => s + r.weight, 0);
  return { score, rules, missing: rules.filter((r) => !r.ok).map((r) => r.label) };
}

export const PROFILE_THRESHOLD = 70;

/** Cheap textual spam heuristics that run before anything is stored. */
export function textSpamSignals(d: ListingDraft): { signal: string; severity: number; detail: string }[] {
  const text = `${d.title ?? ""} ${d.description ?? ""}`;
  const out: { signal: string; severity: number; detail: string }[] = [];
  const urls = text.match(/https?:\/\/|www\./gi) ?? [];
  if (urls.length) out.push({ signal: "external_links", severity: 3, detail: `${urls.length} link(s) in copy` });
  const phones = text.match(/(?:\+?91[-\s]?)?[6-9]\d{9}/g) ?? [];
  if (phones.length) out.push({ signal: "contact_in_text", severity: 3, detail: "Phone number inside listing text" });
  if (/whatsapp|telegram|call me|dm me/i.test(text)) out.push({ signal: "offsite_contact", severity: 2, detail: "Pushes contact off-platform" });
  if (/[A-Z]{12,}/.test(text)) out.push({ signal: "shouting", severity: 1, detail: "Excessive capitals" });
  if (/(.)\1{6,}/.test(text)) out.push({ signal: "repeated_chars", severity: 1, detail: "Repeated character spam" });
  if (/broker|brokerage|commission|zero deposit guarantee|lottery|loan/i.test(text)) out.push({ signal: "banned_terms", severity: 2, detail: "Banned commercial terms" });
  if ((d.rent ?? 0) > 0 && (d.rent as number) < 3000) out.push({ signal: "unrealistic_rent", severity: 2, detail: "Rent far below market band" });
  if ((d.deposit ?? 0) > (d.rent ?? 0) * 12) out.push({ signal: "unrealistic_deposit", severity: 3, detail: "Deposit above 12 months rent" });
  return out;
}

export function contentHash(d: ListingDraft): string {
  const base = `${(d.title ?? "").toLowerCase().replace(/\s+/g, " ").trim()}|${(d.description ?? "").toLowerCase().replace(/\s+/g, " ").trim()}|${d.area ?? ""}|${d.rent ?? ""}`;
  let h = 0;
  for (let i = 0; i < base.length; i++) h = (Math.imul(31, h) + base.charCodeAt(i)) | 0;
  return `h${(h >>> 0).toString(36)}`;
}

export const DAILY_LISTING_LIMIT = 3;
