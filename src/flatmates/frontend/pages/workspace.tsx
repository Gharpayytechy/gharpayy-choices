// @ts-nocheck
/**
 * Persona home screens. One canonical person, four jobs:
 *  /flatmates/host       Replacement Host   — fill the room that is emptying
 *  /flatmates/move       Room Seeker        — run my move end to end
 *  /flatmates/portfolio  Property Owner     — kill vacancy days
 *  /flatmates/managed    Managed Owner      — money, occupancy, asset health
 * Everything on screen comes from real rows. Nothing is invented.
 */
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  ShieldCheck, AlertTriangle, Clock, CheckCircle2, ArrowRight, Loader2,
  KeyRound, Users, Building2, Home as HomeIcon, IndianRupee, MapPin,
} from "lucide-react";
import { FMShell } from "@/flatmates/frontend/components/Shell";
import { supabase } from "@/integrations/supabase/client";
import { myWorkspace, setPersonaMode, markListingFilled } from "@/lib/persona.functions";

const PERSONAS = {
  "/flatmates/host": {
    mode: "replacement_host", icon: Users,
    title: "Replacement Host", sub: "Fill your room before the notice period runs out",
    job: "A flatmate is leaving. Your job is a replacement the household approves, before rent falls on you.",
    success: "Replacement joins · household approves · owner approves · deposit settled",
    primary: { label: "Publish the room", to: "/flatmates/publish?mode=replacement_room" },
    kinds: ["replacement_room"],
  },
  "/flatmates/move": {
    mode: "room_seeker", icon: KeyRound,
    title: "My Move", sub: "From searching to keys in hand",
    job: "You need a room you can actually live in — real people, real money, real date.",
    success: "Verified room · mutual acceptance · written terms · move-in",
    primary: { label: "Discover rooms", to: "/flatmates/discover?tab=rooms" },
    kinds: [],
  },
  "/flatmates/portfolio": {
    mode: "property_owner", icon: Building2,
    title: "Portfolio", sub: "Every vacant day is money you never get back",
    job: "You own the asset. Your job is occupancy at the right rent, with tenants who stay.",
    success: "Occupancy · vacancy days avoided · on-time rent",
    primary: { label: "List a unit", to: "/flatmates/publish?mode=owner_room" },
    kinds: ["owner_room", "whole_flat"],
  },
  "/flatmates/managed": {
    mode: "managed_owner", icon: HomeIcon,
    title: "Managed by Gharpayy", sub: "We run the property, you watch the numbers",
    job: "You handed operations over. Your job is oversight: money in, condition maintained, no surprises.",
    success: "Occupancy · collection on time · asset condition · owner retention",
    primary: { label: "Talk to the managed team", to: "/flatmates/owner?mandate=1" },
    kinds: ["managed_unit"],
  },
} as const;

const STATUS = {
  live: { label: "Live", cls: "bg-emerald-100 text-emerald-800", icon: CheckCircle2 },
  limited: { label: "Limited visibility · spot-check within 24h", cls: "bg-amber-100 text-amber-900", icon: Clock },
  pending: { label: "With the Gharpayy team", cls: "bg-amber-100 text-amber-900", icon: Clock },
  rejected: { label: "Rejected", cls: "bg-rose-100 text-rose-800", icon: AlertTriangle },
  draft: { label: "Draft", cls: "bg-muted text-muted-foreground", icon: Clock },
  filled: { label: "Filled", cls: "bg-muted text-muted-foreground", icon: CheckCircle2 },
};

const inr = (n) => (Number.isFinite(Number(n)) && Number(n) > 0 ? `₹${Number(n).toLocaleString("en-IN")}` : "—");

export default function FlatmatesWorkspace() {
  const [loc] = useLocation();
  const persona = PERSONAS[loc] || PERSONAS["/flatmates/move"];
  const Icon = persona.icon;

  const [session, setSession] = useState(undefined);
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const load = () => myWorkspace().then(setData).catch(() => setData({ error: true }));

  useEffect(() => {
    if (!session) return;
    setPersonaMode({ data: { mode: persona.mode } }).catch(() => {});
    load();
  }, [session, persona.mode]);

  if (session === undefined) {
    return <FMShell title={persona.title} back="/flatmates"><p className="text-sm text-muted-foreground">Loading…</p></FMShell>;
  }

  if (!session) {
    return (
      <FMShell title={persona.title} sub={persona.sub} back="/flatmates">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-sm font-semibold mb-1">Sign in to open your workspace</p>
          <p className="text-sm text-muted-foreground mb-4">{persona.job}</p>
          <Link href="/flatmates/publish" className="inline-flex h-11 px-4 items-center rounded-xl bg-primary text-primary-foreground text-sm font-bold">
            Sign in <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </FMShell>
    );
  }

  const profile = data?.profile;
  const market = data?.market;
  const all = data?.listings ?? [];
  const mine = persona.kinds.length ? all.filter((l) => persona.kinds.includes(l.kind)) : all;
  const verifications = [
    ["Phone", profile?.phone_verified],
    ["Email", profile?.email_verified],
    ["Work / college", profile?.work_verified],
    ["Government ID", profile?.id_verified],
  ];
  const verifiedCount = verifications.filter(([, v]) => v).length;

  const fill = async (id) => {
    setBusy(true);
    await markListingFilled({ data: { id } }).catch(() => {});
    await load();
    setBusy(false);
  };

  return (
    <FMShell title={persona.title} sub={persona.sub} back="/flatmates">
      {/* Job + success definition */}
      <section className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-start gap-3">
          <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0"><Icon className="w-5 h-5" /></span>
          <div>
            <p className="text-sm font-semibold">{persona.job}</p>
            <p className="text-xs text-muted-foreground mt-1">Success: {persona.success}</p>
          </div>
        </div>
        <Link href={persona.primary.to} className="mt-4 inline-flex h-11 px-4 items-center rounded-xl bg-primary text-primary-foreground text-sm font-bold">
          {persona.primary.label} <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </section>

      {/* Trust ladder */}
      <section className="mt-4 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-bold flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" /> Your trust level</p>
          <span className="text-xs text-muted-foreground">{verifiedCount}/4 verified · score {profile?.trust_score ?? 0}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {verifications.map(([label, ok]) => (
            <div key={label} className={`text-xs rounded-lg px-3 py-2 border ${ok ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-border bg-muted/40 text-muted-foreground"}`}>
              {ok ? "✓" : "○"} {label}
            </div>
          ))}
        </div>
        {verifiedCount < 2 && (
          <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3">
            Phone plus one more verification is required before anything you post can go live automatically.
          </p>
        )}
      </section>

      {/* Market truth */}
      <section className="mt-4 rounded-2xl border border-border bg-card p-5">
        <p className="text-sm font-bold mb-3 flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> {market?.city ?? "Your city"} right now</p>
        {market?.liveSupply ? (
          <>
            <div className="flex gap-6">
              <div><p className="text-2xl font-black">{market.liveSupply}</p><p className="text-xs text-muted-foreground">visible listings</p></div>
              <div><p className="text-2xl font-black flex items-center"><IndianRupee className="w-4 h-4" />{market.medianRent ? Number(market.medianRent).toLocaleString("en-IN") : "—"}</p><p className="text-xs text-muted-foreground">median rent</p></div>
            </div>
            {market.topAreas?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {market.topAreas.map((a) => (
                  <Link key={a.area} href={`/flatmates/discover?area=${encodeURIComponent(a.area)}`} className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-primary">
                    {a.area} · {a.count}
                  </Link>
                ))}
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            No approved listings in {market?.city ?? "this city"} yet. We would rather show you nothing than show you inventory that does not exist.
          </p>
        )}
      </section>

      {/* Supply the person controls */}
      {persona.kinds.length > 0 && (
        <section className="mt-4">
          <p className="text-sm font-bold mb-2">Your listings</p>
          {mine.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-5 text-sm text-muted-foreground">
              Nothing published yet. {persona.primary.label} — it is scored before it goes anywhere.
            </div>
          ) : (
            <div className="space-y-3">
              {mine.map((l) => {
                const s = STATUS[l.status] ?? STATUS.draft;
                const S = s.icon;
                return (
                  <div key={l.id} className="rounded-2xl border border-border bg-card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate">{l.title || "Untitled listing"}</p>
                        <p className="text-xs text-muted-foreground">{[l.area, l.city].filter(Boolean).join(", ")} · {inr(l.rent)}/mo</p>
                      </div>
                      <span className={`text-[11px] px-2 py-1 rounded-full font-semibold whitespace-nowrap flex items-center gap-1 ${s.cls}`}>
                        <S className="w-3 h-3" />{s.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${Math.min(100, l.quality_score ?? 0)}%` }} />
                      </div>
                      <span className="text-xs font-semibold">{l.quality_score ?? 0}/100</span>
                    </div>
                    {Array.isArray(l.missing) && l.missing.length > 0 && (
                      <ul className="mt-2 text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 space-y-1">
                        {l.missing.slice(0, 4).map((m, i) => <li key={i}>• {typeof m === "string" ? m : m?.label ?? JSON.stringify(m)}</li>)}
                      </ul>
                    )}
                    <div className="flex gap-2 mt-3">
                      <Link href={`/flatmates/publish?id=${l.id}`} className="h-9 px-3 inline-flex items-center rounded-lg border border-border text-xs font-semibold">Edit &amp; improve</Link>
                      {["live", "limited"].includes(l.status) && (
                        <button onClick={() => fill(l.id)} disabled={busy} className="h-9 px-3 inline-flex items-center rounded-lg border border-border text-xs font-semibold">
                          {busy ? <Loader2 className="w-3 h-3 animate-spin" /> : "Mark filled"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Seeker move tracker */}
      {persona.mode === "room_seeker" && (
        <section className="mt-4 rounded-2xl border border-border bg-card p-5">
          <p className="text-sm font-bold mb-3">Your move, step by step</p>
          <ol className="space-y-2 text-sm">
            {[
              ["Set your requirement", "Budget, area, move-in date, non-negotiables.", "/flatmates/requirement"],
              ["Shortlist real rooms", "Only approved listings appear.", "/flatmates/discover?tab=rooms"],
              ["Mutual acceptance", "Chat opens only when both sides say yes.", "/flatmates/inbox"],
              ["Visit and decide", "Book a visit, meet the household.", "/flatmates/schedule"],
              ["Written terms", "Rent, deposit, notice, exit — in writing.", "/flatmates/agreement"],
            ].map(([t, d, to], i) => (
              <li key={t}>
                <Link href={to} className="flex gap-3 rounded-xl border border-border px-3 py-2 hover:border-primary">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                  <span><span className="font-semibold">{t}</span><br /><span className="text-xs text-muted-foreground">{d}</span></span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Managed money view */}
      {persona.mode === "managed_owner" && (
        <section className="mt-4 rounded-2xl border border-border bg-card p-5">
          <p className="text-sm font-bold mb-2">Money &amp; operations</p>
          <p className="text-sm text-muted-foreground">
            Once a mandate is active, collection, occupancy and asset condition appear here from the operations record —
            not estimates. Start a mandate to switch this panel on.
          </p>
          <Link href="/flatmates/owner?mandate=1" className="mt-3 inline-flex h-10 px-4 items-center rounded-xl border border-border text-sm font-bold">
            Start a mandate <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </section>
      )}

      {/* Switch job */}
      <section className="mt-4">
        <p className="text-xs text-muted-foreground mb-2">You can do more than one thing at once.</p>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(PERSONAS).filter(([p]) => p !== loc).map(([path, p]) => (
            <Link key={path} href={path} className="rounded-xl border border-border bg-card px-3 py-3 text-sm font-semibold hover:border-primary">
              {p.title}
            </Link>
          ))}
        </div>
      </section>
    </FMShell>
  );
}
