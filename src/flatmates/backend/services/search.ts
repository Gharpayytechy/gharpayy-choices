// @ts-nocheck
const text = (v: any): string => Array.isArray(v) ? v.map(text).join(" ") : v && typeof v === "object" ? Object.values(v).map(text).join(" ") : String(v ?? "");
export function searchable(item: any) {
  return [item.title, item.name, item.city || "Bengaluru", item.area, item.nearby, item.address, item.building, item.company, item.occupation, item.college, item.amenities, item.roomType, item.bhk, item.genderPref, item.furnishing, item.bio].map(text).join(" ").toLowerCase();
}
export function matchesQuery(item: any, query = "") {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const haystack = searchable(item);
  return terms.every((term) => haystack.includes(term));
}
export function matchesCommon(item: any, filters: any) {
  if (filters.city && filters.city !== "All cities" && (item.city || "Bengaluru") !== filters.city) return false;
  if (filters.areas?.length && !filters.areas.includes(item.area) && !(item.nearby || []).some((a: string) => filters.areas.includes(a))) return false;
  if (filters.maxRent && Number(item.rent || item.budgetIdeal || 0) > filters.maxRent) return false;
  if (filters.roomType && item.roomType !== filters.roomType) return false;
  if (filters.gender && item.genderPref && item.genderPref !== "Any" && item.genderPref !== filters.gender) return false;
  if (filters.furnishing && item.furnishing !== filters.furnishing) return false;
  if (filters.verifiedOnly && !(item.verified?.phone && (item.verified?.work || item.verified?.room || item.verified?.owner))) return false;
  if (filters.freshOnly && item.verifiedAt && Date.now() - +new Date(item.verifiedAt) >= 3 * 86400000) return false;
  return matchesQuery(item, filters.q);
}
