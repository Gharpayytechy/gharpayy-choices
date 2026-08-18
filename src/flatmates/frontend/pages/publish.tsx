// @ts-nocheck
/**
 * The vetted publish flow. Nothing goes live raw: every listing is scored
 * against the quality rules, screened for spam, and either auto-approved,
 * auto-approved with limited visibility, or queued for the Gharpayy team.
 */
import { useEffect, useMemo, useState } from "react";
import { Link, useSearch } from "wouter";
import { Check, X, ShieldCheck, Loader2, AlertTriangle } from "lucide-react";
import { FMShell } from "@/flatmates/frontend/components/Shell";
import { supabase } from "@/integrations/supabase/client";
import { scoreListing, textSpamSignals, LISTING_THRESHOLD } from "@/lib/moderation";
import { submitListing, myListings } from "@/lib/listings.functions";
import { CITY_OPTIONS, cityByName } from "@/flatmates/backend/store/locations";

const KINDS = [
  { key: "replacement_room", label: "Replacement — a flatmate is leaving" },
  { key: "owner_room", label: "Owner — renting rooms individually" },
  { key: "whole_flat", label: "Owner — renting the whole flat" },
  { key: "managed_unit", label: "Gharpayy-managed property" },
];

const inp = "w-full h-11 px-3 rounded-xl border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-primary/25";

export default function FlatmatesPublish() {
  const search = new URLSearchParams(useSearch() || "");
  const [session, setSession] = useState<any>(undefined);
  const [authForm, setAuthForm] = useState({ email: "", password: "", name: "" });
  const [authMsg, setAuthMsg] = useState("");
  const [mine, setMine] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any>(null);

  const [d, setD] = useState<any>({
    kind: search.get("mode") || "replacement_room",
    title: "", description: "", city: search.get("city") || "Bengaluru", area: search.get("area") || "", address: "",
    rent: "", deposit: "", maintenance: "", utilities_estimate: "", available_from: "",
    room_type: "Private room", furnished: "Semi-furnished", min_duration_months: 11, authority: "primary_tenant",
    photos: [""], household: { schedule: "", food: "", smoking: "", guests: "" },
  });
  const set = (patch: any) => setD((p: any) => ({ ...p, ...patch }));

  const draft = useMemo(() => ({
    ...d,
    rent: d.rent === "" ? null : Number(d.rent),
    deposit: d.deposit === "" ? null : Number(d.deposit),
    maintenance: d.maintenance === "" ? null : Number(d.maintenance),
    utilities_estimate: d.utilities_estimate === "" ? null : Number(d.utilities_estimate),
    photos: (d.photos || []).map((p: string) => p.trim()).filter(Boolean),
  }), [d]);

  const { score, rules } = scoreListing(draft);
  const signals = textSpamSignals(draft);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => { if (session) myListings().then((r: any) => setMine(r.listings || [])); }, [session, result]);

  const signIn = async (mode: "in" | "up") => {
    setAuthMsg("");
    const fn = mode === "in"
      ? supabase.auth.signInWithPassword({ email: authForm.email, password: authForm.password })
      : supabase.auth.signUp({ email: authForm.email, password: authForm.password, options: { data: { full_name: authForm.name }, emailRedirectTo: window.location.href } });
    const { error } = await fn;
    if (error) setAuthMsg(error.message);
    else if (mode === "up") setAuthMsg("Account created. If email confirmation is on, confirm and come back.");
  };

  const submit = async () => {
    setBusy(true); setResult(null);
    try {
      const res: any = await submitListing({ data: draft });
      setResult(res);
    } catch (e: any) { setResult({ ok: false, error: e?.message || "Something went wrong." }); }
    setBusy(false);
  };

  if (session === undefined) {
    return <FMShell title="Publish a listing" back="/flatmates"><p className="text-sm text-muted-foreground">Loading…</p></FMShell>;
  }

  return (
    <FMShell title="Publish a listing" sub="Reviewed before it reaches anyone" back="/flatmates">
      {/* Quality meter */}
      <div className="rounded-2xl border border-border bg-card p-4 mb-4 sticky top-16 z-20">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Listing quality</p>
          <p className="text-sm font-bold">{score}/100</p>
        </div>
        <div className="h-2 rounded-full bg-muted mt-2 overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${score}%` }} />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {score >= LISTING_THRESHOLD ? "Meets the publishing bar." : `Needs ${LISTING_THRESHOLD - score} more points before it can go live.`}
        </p>
        {signals.length > 0 && (
          <div className="mt-2 flex items-start gap-2 text-xs text-destructive">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{signals.map((s) => s.detail).join(" · ")}</span>
          </div>
        )}
      </div>

      <Field label="What kind of listing is this?">
        <select className={inp} value={d.kind} onChange={(e) => set({ kind: e.target.value })}>
          {KINDS.map((k) => <option key={k.key} value={k.key}>{k.label}</option>)}
        </select>
      </Field>
      <Field label="Title"><input className={inp} value={d.title} onChange={(e) => set({ title: e.target.value })} placeholder="Private room in 3BHK, HSR Sector 2" /></Field>
      <Field label="Description (be specific and honest)">
        <textarea className={`${inp} h-28 py-2`} value={d.description} onChange={(e) => set({ description: e.target.value })} placeholder="Room, flat, who lives here, what the weekdays feel like…" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="City">
          <select className={inp} value={d.city} onChange={(e) => set({ city: e.target.value, area: "" })}>{CITY_OPTIONS.map((c) => <option key={c.name}>{c.name}</option>)}</select>
        </Field>
        <Field label="Area">
          <select className={inp} value={d.area} onChange={(e) => set({ area: e.target.value })}>
            <option value="">Select area</option>
            {cityByName(d.city).areas.map((a: string) => <option key={a}>{a}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Address / building"><input className={inp} value={d.address} onChange={(e) => set({ address: e.target.value })} placeholder="Sector 2, 17th Main, Prestige Elm" /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Rent (₹ / month)"><input className={inp} inputMode="numeric" value={d.rent} onChange={(e) => set({ rent: e.target.value })} /></Field>
        <Field label="Deposit (₹)"><input className={inp} inputMode="numeric" value={d.deposit} onChange={(e) => set({ deposit: e.target.value })} /></Field>
        <Field label="Maintenance (₹)"><input className={inp} inputMode="numeric" value={d.maintenance} onChange={(e) => set({ maintenance: e.target.value })} /></Field>
        <Field label="Utilities estimate (₹)"><input className={inp} inputMode="numeric" value={d.utilities_estimate} onChange={(e) => set({ utilities_estimate: e.target.value })} /></Field>
        <Field label="Available from"><input className={inp} type="date" value={d.available_from} onChange={(e) => set({ available_from: e.target.value })} /></Field>
        <Field label="Minimum stay (months)"><input className={inp} inputMode="numeric" value={d.min_duration_months} onChange={(e) => set({ min_duration_months: Number(e.target.value) || "" })} /></Field>
        <Field label="Room type">
          <select className={inp} value={d.room_type} onChange={(e) => set({ room_type: e.target.value })}><option>Private room</option><option>Shared room</option><option>Whole flat</option></select>
        </Field>
        <Field label="Furnishing">
          <select className={inp} value={d.furnished} onChange={(e) => set({ furnished: e.target.value })}><option>Unfurnished</option><option>Semi-furnished</option><option>Fully furnished</option></select>
        </Field>
      </div>

      <Field label="Photos (5+ real photo links: room, bathroom, kitchen, common area, building)">
        {d.photos.map((p: string, i: number) => (
          <input key={i} className={`${inp} mb-2`} value={p} placeholder={`Photo ${i + 1} URL`}
            onChange={(e) => { const next = [...d.photos]; next[i] = e.target.value; set({ photos: next }); }} />
        ))}
        <button type="button" onClick={() => set({ photos: [...d.photos, ""] })} className="h-9 px-3 rounded-xl border border-border text-xs font-semibold">Add photo</button>
      </Field>

      <p className="text-xs font-semibold text-muted-foreground mb-2">Household reality</p>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Work schedule"><input className={inp} value={d.household.schedule} onChange={(e) => set({ household: { ...d.household, schedule: e.target.value } })} placeholder="Hybrid, 2 days WFH" /></Field>
        <Field label="Food / kitchen"><input className={inp} value={d.household.food} onChange={(e) => set({ household: { ...d.household, food: e.target.value } })} placeholder="Veg + non-veg, cook 3x week" /></Field>
        <Field label="Smoking"><input className={inp} value={d.household.smoking} onChange={(e) => set({ household: { ...d.household, smoking: e.target.value } })} placeholder="Non-smoking indoors" /></Field>
        <Field label="Guests"><input className={inp} value={d.household.guests} onChange={(e) => set({ household: { ...d.household, guests: e.target.value } })} placeholder="Occasional weekend guests" /></Field>
      </div>

      <Field label="Your authority">
        <select className={inp} value={d.authority} onChange={(e) => set({ authority: e.target.value })}>
          <option value="primary_tenant">I am the primary tenant</option>
          <option value="co_tenant">I live here as a co-tenant</option>
          <option value="owner">I own this property</option>
          <option value="authorised">I am authorised by the owner</option>
        </select>
      </Field>

      {/* Checklist */}
      <div className="rounded-2xl border border-border bg-card p-4 mb-4">
        <p className="text-sm font-semibold mb-2">What the review checks</p>
        <ul className="space-y-1.5">
          {rules.map((r) => (
            <li key={r.key} className="flex items-start gap-2 text-xs">
              {r.ok ? <Check className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" /> : <X className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />}
              <span className={r.ok ? "text-foreground" : "text-muted-foreground"}>{r.label}</span>
            </li>
          ))}
        </ul>
      </div>

      {session ? (
        <button onClick={submit} disabled={busy} className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
          Submit for approval
        </button>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-sm font-semibold">Last step — attach this listing to your account</p>
          <p className="text-xs text-muted-foreground mt-1 mb-3">
            Your draft above is kept. Every listing is tied to a real identity — that single rule removes most spam before it exists.
          </p>
          <input className={`${inp} mb-2`} placeholder="Full name" value={authForm.name} onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })} />
          <input className={`${inp} mb-2`} placeholder="Email" type="email" value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} />
          <input className={`${inp} mb-3`} placeholder="Password" type="password" value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} />
          {authMsg && <p className="text-xs text-destructive mb-2">{authMsg}</p>}
          <div className="flex gap-2">
            <button onClick={() => signIn("up")} className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">Create account & continue</button>
            <button onClick={() => signIn("in")} className="flex-1 h-11 rounded-xl border border-border text-sm font-semibold">I already have one</button>
          </div>
        </div>
      )}

      {result && (
        <div className={`rounded-2xl border p-4 mt-4 ${result.ok ? "border-primary/30 bg-primary/[0.06]" : "border-destructive/30 bg-destructive/[0.06]"}`}>
          {result.ok ? (
            <>
              <p className="text-sm font-semibold">
                {result.status === "live" && "Approved and live."}
                {result.status === "limited" && "Approved with limited visibility — a team spot-check follows within 24 hours."}
                {result.status === "pending" && "Queued for the Gharpayy team."}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Score {result.score}/100 · {result.decision.replace(/_/g, " ")}</p>
              {result.missing?.length > 0 && (
                <ul className="mt-2 text-xs text-muted-foreground list-disc pl-4">{result.missing.map((m: string) => <li key={m}>{m}</li>)}</ul>
              )}
            </>
          ) : <p className="text-sm font-semibold text-destructive">{result.error}</p>}
        </div>
      )}

      {mine.length > 0 && (
        <div className="mt-6">
          <p className="text-sm font-semibold mb-2">Your listings</p>
          {mine.map((l) => (
            <div key={l.id} className="rounded-xl border border-border bg-card p-3 mb-2 flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate">{l.title || "Untitled listing"}</p>
                <p className="text-xs text-muted-foreground">{l.area}, {l.city} · score {l.quality_score}</p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full bg-muted">{l.status}</span>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-6">
        Need help getting a listing approved? <Link href="/flatmates/guide" className="text-primary font-semibold">Read the listing guide</Link>.
      </p>
      <div className="h-8" />
    </FMShell>
  );
}

function Field({ label, children }: any) {
  return <div className="mb-4"><label className="block text-xs font-semibold text-muted-foreground mb-1.5">{label}</label>{children}</div>;
}
