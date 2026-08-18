// @ts-nocheck
/** Sign-up: creates a local account, then sends the person into their own flow. */
import { useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { Card, Btn } from "@/flatmates/frontend/components/Shell";
import { signUp, ROLE_META } from "@/flatmates/backend/store/accounts";
import { supabase } from "@/integrations/supabase/client";
import { AREA_LIST } from "@/flatmates/backend/store/seed";
import { track } from "@/flatmates/backend/store/store";
import { ArrowLeft, Check } from "lucide-react";
import { CITY_OPTIONS, cityByName } from "@/flatmates/backend/store/locations";
import { WhatsAppHelp } from "@/flatmates/frontend/components/WhatsAppHelp";

const ROLES = ["seeker", "poster", "owner", "group"];

export default function FlatmatesSignup() {
  const search = useSearch();
  const preset = new URLSearchParams(search || "").get("role");
  const setup = new URLSearchParams(search || "").get("setup") || "";
  const presetCity = new URLSearchParams(search || "").get("city") || "Bengaluru";
  const [, nav] = useLocation();
  const [role, setRole] = useState(ROLE_META[preset] ? preset : "seeker");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", budgetMax: 22000 });
  const [areas, setAreas] = useState<string[]>([]);
  const [city, setCity] = useState(presetCity);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (patch: any) => setForm((f) => ({ ...f, ...patch }));

  const submit = async (e: any) => {
    e?.preventDefault?.();
    setError("");
    setBusy(true);
    const { error: authErr } = await supabase.auth.signUp({
      email: form.email.trim().toLowerCase(),
      password: form.password,
      options: { emailRedirectTo: window.location.origin, data: { full_name: form.name } },
    });
    if (authErr && !/already registered/i.test(authErr.message)) {
      setBusy(false);
      setError(authErr.message);
      return;
    }
    const res = signUp({ ...form, role, areas, city, setup });
    setBusy(false);
    if (!res.ok) { setError(res.error); return; }
    track("account_created", { role });
    nav(role === "seeker" ? "/flatmates/onboard" : ROLE_META[role].home);
  };

  const toggleArea = (a: string) =>
    setAreas((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl border-b border-border">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/flatmates" className="w-9 h-9 -ml-2 grid place-items-center rounded-full hover:bg-muted">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <p className="font-display font-semibold tracking-tight flex-1">Create your account</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-5">
        <p className="text-sm text-muted-foreground mb-4">
          One account gets you matches, requests and chats. Everything is stored on this device — no verification wait.
        </p>

        <form onSubmit={submit}>
          <p className="text-xs font-semibold text-muted-foreground mb-2">I'm here to…</p>
          <div className="grid grid-cols-2 gap-2 mb-5">
            {ROLES.map((r) => {
              const on = r === role;
              return (
                <button type="button" key={r} onClick={() => setRole(r)}
                  className={`text-left rounded-2xl border p-3 transition-colors ${on ? "border-primary bg-primary/[0.06]" : "border-border hover:bg-muted"}`}>
                  <span className="text-lg leading-none">{ROLE_META[r].emoji}</span>
                  <span className="block text-sm font-semibold mt-1.5 leading-tight">{ROLE_META[r].label}</span>
                  {on && <Check className="w-3.5 h-3.5 text-primary mt-1" />}
                </button>
              );
            })}
          </div>

          <Field label="Full name">
            <input className={inp} value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Aarav Menon" autoComplete="name" />
          </Field>
          <Field label="Email">
            <input className={inp} type="email" value={form.email} onChange={(e) => set({ email: e.target.value })} placeholder="you@email.com" autoComplete="email" />
          </Field>
          <Field label="Phone (optional)">
            <input className={inp} value={form.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="98765 43210" autoComplete="tel" />
          </Field>
          <Field label="Password">
            <input className={inp} type="password" value={form.password} onChange={(e) => set({ password: e.target.value })} placeholder="At least 6 characters" autoComplete="new-password" />
          </Field>

          {role !== "owner" && (
            <Field label={`Budget per month · ₹${form.budgetMax.toLocaleString("en-IN")}`}>
              <input type="range" min={6000} max={60000} step={500} value={form.budgetMax}
                onChange={(e) => set({ budgetMax: +e.target.value })} className="w-full accent-[var(--primary)]" />
            </Field>
          )}

          <Field label="City">
            <select className={inp} value={city} onChange={(e)=>{setCity(e.target.value);setAreas([])}}>{CITY_OPTIONS.map(c=><option key={c.name}>{c.name}</option>)}</select>
          </Field>
          <Field label="Areas you care about">
            <div className="flex flex-wrap gap-2">
              {cityByName(city).areas.slice(0, 10).map((a: string) => {
                const on = areas.includes(a);
                return (
                  <button type="button" key={a} onClick={() => toggleArea(a)}
                    className={`h-9 px-3 rounded-xl text-sm font-medium border transition-colors ${on ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border"}`}>
                    {a}
                  </button>
                );
              })}
            </div>
          </Field>

          {error && (
            <Card className="p-3 mb-3 border-destructive/30 bg-destructive/[0.06]">
              <p className="text-sm font-medium text-destructive">{error}</p>
            </Card>
          )}

          <Btn className="w-full" type="submit" disabled={busy}>{busy ? "Creating…" : "Create account & continue"}</Btn>
          <WhatsAppHelp module="Signup" action="Help me create my Flatmates profile" setup={setup} city={city} area={areas[0]} className="w-full mt-2" />
        </form>

        <p className="text-center text-sm text-muted-foreground mt-5">
          Already have an account? <Link href="/flatmates/login" className="font-semibold text-primary">Log in</Link>
        </p>
        <div className="h-10" />
      </main>
    </div>
  );
}

const inp = "w-full h-11 px-3 rounded-xl border border-border bg-card text-sm outline-none focus:ring-2 focus:ring-primary/25";
function Field({ label, children }: any) {
  return <div className="mb-4"><label className="block text-xs font-semibold text-muted-foreground mb-1.5">{label}</label>{children}</div>;
}
