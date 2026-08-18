import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type PersonaMode = "room_seeker" | "replacement_host" | "property_owner" | "managed_owner";

const MODES: PersonaMode[] = ["room_seeker", "replacement_host", "property_owner", "managed_owner"];

/**
 * Everything a persona home screen needs: who the person is, how verified they
 * are, what they have in the market right now, and the honest market context
 * for their city. No invented inventory — counts come from real live rows.
 */
export const myWorkspace = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const userId = context.userId as string;
    const sb = context.supabase;

    const [{ data: profile }, { data: modes }, { data: listings }] = await Promise.all([
      sb
        .from("profiles")
        .select(
          "id, full_name, city, phone_verified, email_verified, work_verified, id_verified, trust_score, banned",
        )
        .eq("id", userId)
        .maybeSingle(),
      sb.from("person_modes").select("mode, active, payload, updated_at").eq("person_id", userId),
      sb
        .from("listings")
        .select(
          "id,kind,title,city,area,rent,deposit,status,quality_score,auto_decision,missing,available_from,created_at,photos",
        )
        .eq("owner_id", userId)
        .order("created_at", { ascending: false }),
    ]);

    const city = profile?.city || "Bengaluru";

    // Honest market context: only rows that are actually visible to the public.
    const { data: cityLive } = await sb
      .from("listings")
      .select("id,kind,rent,area,status")
      .eq("city", city)
      .in("status", ["live", "limited"])
      .limit(500);

    const rents = (cityLive ?? []).map((l: any) => Number(l.rent)).filter((n) => Number.isFinite(n) && n > 0).sort((a, b) => a - b);
    const median = rents.length ? rents[Math.floor(rents.length / 2)] : null;

    const byArea: Record<string, number> = {};
    for (const l of cityLive ?? []) if (l.area) byArea[l.area] = (byArea[l.area] ?? 0) + 1;
    const topAreas = Object.entries(byArea)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([area, count]) => ({ area, count }));

    return {
      profile: profile ?? null,
      modes: (modes ?? []) as { mode: PersonaMode; active: boolean; payload: any; updated_at: string }[],
      listings: listings ?? [],
      market: {
        city,
        liveSupply: (cityLive ?? []).length,
        medianRent: median,
        topAreas,
      },
    };
  });

export const setPersonaMode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { mode: PersonaMode; active?: boolean; payload?: Record<string, unknown> }) => {
    if (!data || !MODES.includes(data.mode)) throw new Error("Unknown mode");
    return data;
  })
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("person_modes").upsert(
      {
        person_id: context.userId as string,
        mode: data.mode as never,
        active: data.active ?? true,
        payload: (data.payload ?? {}) as never,
      },
      { onConflict: "person_id,mode" },
    );
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });

/** Mark a listing as filled — the honest end-state for supply that is gone. */
export const markListingFilled = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => {
    if (!data?.id) throw new Error("Missing listing");
    return data;
  })
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("listings")
      .update({ status: "filled" as never })
      .eq("id", data.id)
      .eq("owner_id", context.userId as string);
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });
