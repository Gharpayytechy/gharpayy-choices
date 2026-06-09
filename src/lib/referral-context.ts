// Builds a query-string handoff between Insights (the main site) and the
// Refer & Earn Super App. Anywhere on the site can drop a "Refer someone like
// this" CTA · the Super App's /refer screen reads these params and prefills.

export type ReferContext = {
  source?: string;        // page where the CTA was clicked, e.g. "area:koramangala"
  area?: string;          // slug or name
  persona?: string;       // persona id
  expert?: string;       // expert id
  budget?: number | string;
  propertyType?: "PG" | "1BHK" | "2BHK" | "3BHK" | "HOUSE" | "STUDIO";
  ref?: string;           // referral code if any
};

export function buildReferLink(ctx: ReferContext = {}) {
  const params = new URLSearchParams();
  Object.entries(ctx).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") params.set(k, String(v));
  });
  const qs = params.toString();
  return `/app/refer${qs ? `?${qs}` : ""}`;
}

// Read the same params back inside the Super App.
export function readReferContext(search: string | URLSearchParams = ""): ReferContext {
  const sp = typeof search === "string" ? new URLSearchParams(search) : search;
  const out: ReferContext = {};
  ["source", "area", "persona", "expert", "budget", "propertyType", "ref"].forEach((k) => {
    const v = sp.get(k);
    if (v) (out as any)[k] = v;
  });
  return out;
}
