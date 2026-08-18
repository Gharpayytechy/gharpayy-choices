import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  scoreListing,
  textSpamSignals,
  contentHash,
  LISTING_THRESHOLD,
  DAILY_LISTING_LIMIT,
  type ListingDraft,
} from "@/lib/moderation";

type SubmitInput = ListingDraft & { id?: string };

export const submitListing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: SubmitInput) => {
    if (!data || typeof data !== "object") throw new Error("Invalid listing");
    return data;
  })
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId as string;

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id, banned, phone_verified, email_verified, work_verified, id_verified, trust_score")
      .eq("id", userId)
      .maybeSingle();

    if (!profile) return { ok: false as const, error: "Complete your profile first." };
    if (profile.banned) return { ok: false as const, error: "This account cannot post." };

    // Daily rate limit --------------------------------------------------
    const today = new Date().toISOString().slice(0, 10);
    const { data: rl } = await supabaseAdmin
      .from("rate_limits")
      .select("id, count")
      .eq("person_id", userId)
      .eq("bucket", "listing_submit")
      .eq("day", today)
      .maybeSingle();
    if ((rl?.count ?? 0) >= DAILY_LISTING_LIMIT) {
      return { ok: false as const, error: `Daily limit reached (${DAILY_LISTING_LIMIT} listings a day).` };
    }

    // Quality + spam ----------------------------------------------------
    const { score, missing } = scoreListing(data);
    const signals = textSpamSignals(data);
    const hash = contentHash(data);

    const { data: dupe } = await supabaseAdmin
      .from("listings")
      .select("id, owner_id")
      .eq("content_hash", hash)
      .neq("id", data.id ?? "00000000-0000-0000-0000-000000000000")
      .limit(1);
    if (dupe && dupe.length) {
      signals.push({ signal: "duplicate_content", severity: 3, detail: "Identical listing already exists" });
    }

    const spamWeight = signals.reduce((s, x) => s + x.severity, 0);
    const verified = profile.phone_verified && (profile.email_verified || profile.work_verified);

    let status: "pending" | "limited" | "live" = "pending";
    let decision = "queued_for_review";
    if (spamWeight >= 3 || score < LISTING_THRESHOLD) {
      status = "pending";
      decision = spamWeight >= 3 ? "spam_signals_review" : "below_quality_threshold";
    } else if (verified && (profile.trust_score ?? 0) >= 50) {
      status = "live";
      decision = "auto_approved_trusted";
    } else if (verified) {
      status = "limited";
      decision = "auto_approved_limited_first_post";
    } else {
      status = "pending";
      decision = "verification_required";
    }

    const row = {
      owner_id: userId,
      kind: (data.kind ?? "replacement_room") as never,
      title: data.title ?? "",
      description: data.description ?? "",
      city: data.city ?? "Bengaluru",
      area: data.area ?? "",
      rent: data.rent ?? null,
      deposit: data.deposit ?? null,
      available_from: data.available_from || null,
      photos: (data.photos ?? []) as never,
      household: (data.household ?? {}) as never,
      money: {
        maintenance: data.maintenance ?? null,
        utilities_estimate: data.utilities_estimate ?? null,
        min_duration_months: data.min_duration_months ?? null,
      } as never,
      status: status as never,
      quality_score: score,
      auto_decision: decision,
      missing: missing as never,
      content_hash: hash,
    };

    const saved = data.id
      ? await supabaseAdmin.from("listings").update(row).eq("id", data.id).eq("owner_id", userId).select("id").maybeSingle()
      : await supabaseAdmin.from("listings").insert(row).select("id").maybeSingle();

    if (saved.error || !saved.data) return { ok: false as const, error: saved.error?.message ?? "Could not save listing." };
    const listingId = saved.data.id;

    await supabaseAdmin.from("moderation_events").insert({
      listing_id: listingId,
      subject_person_id: userId,
      actor: "system",
      decision,
      score,
      reasons: missing as never,
    });
    if (signals.length) {
      await supabaseAdmin.from("spam_signals").insert(
        signals.map((s) => ({ listing_id: listingId, person_id: userId, signal: s.signal, severity: s.severity, detail: { note: s.detail } as never })),
      );
    }
    await supabaseAdmin
      .from("rate_limits")
      .upsert({ person_id: userId, bucket: "listing_submit", day: today, count: (rl?.count ?? 0) + 1 }, { onConflict: "person_id,bucket,day" });

    return { ok: true as const, id: listingId, status, score, missing, decision, signals };
  });

export const myListings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("listings")
      .select("id,title,city,area,rent,status,quality_score,auto_decision,missing,created_at")
      .eq("owner_id", context.userId as string)
      .order("created_at", { ascending: false });
    if (error) return { listings: [], error: error.message };
    return { listings: data ?? [] };
  });

export const moderationQueue = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: staff } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId as string)
      .in("role", ["admin", "moderator"]);
    if (!staff || staff.length === 0) return { allowed: false as const, listings: [], signals: [] };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: listings } = await supabaseAdmin
      .from("listings")
      .select("id,owner_id,title,description,city,area,rent,deposit,status,quality_score,auto_decision,missing,created_at,photos")
      .in("status", ["pending", "limited"])
      .order("created_at", { ascending: false })
      .limit(50);
    const ids = (listings ?? []).map((l) => l.id);
    const { data: signals } = ids.length
      ? await supabaseAdmin.from("spam_signals").select("listing_id,signal,severity,detail").in("listing_id", ids)
      : { data: [] as never[] };
    return { allowed: true as const, listings: listings ?? [], signals: signals ?? [] };
  });

export const moderateListing = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; action: "approve" | "reject"; reasons?: string[] }) => {
    if (!data?.id || !["approve", "reject"].includes(data.action)) throw new Error("Invalid moderation action");
    return data;
  })
  .handler(async ({ data, context }) => {
    const { data: staff } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId as string)
      .in("role", ["admin", "moderator"]);
    if (!staff || staff.length === 0) return { ok: false as const, error: "Not allowed." };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const status = data.action === "approve" ? "live" : "rejected";
    const { error } = await supabaseAdmin
      .from("listings")
      .update({
        status: status as never,
        reviewed_by: context.userId as string,
        reviewed_at: new Date().toISOString(),
        reject_reasons: (data.reasons ?? []) as never,
      })
      .eq("id", data.id);
    if (error) return { ok: false as const, error: error.message };

    await supabaseAdmin.from("moderation_events").insert({
      listing_id: data.id,
      actor: "staff",
      actor_id: context.userId as string,
      decision: data.action,
      reasons: (data.reasons ?? []) as never,
    });
    return { ok: true as const, status };
  });
