// @ts-nocheck
/** Real account login backed by the Lovable Cloud auth service. */
import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Card, Btn } from "@/flatmates/frontend/components/Shell";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Loader2, LogOut } from "lucide-react";

export default function FlatmatesLogin() {
  const [, nav] = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [session, setSession] = useState<any>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: any) => {
    e?.preventDefault?.();
    setError("");
    setBusy(true);
    const { data, error: err } = await supabase.auth.signInWithPassword({
      email: form.email.trim().toLowerCase(),
      password: form.password,
    });
    setBusy(false);
    if (err || !data.user) {
      setError(err?.message || "Could not sign in.");
      return;
    }
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id);
    const isStaff = (roles ?? []).some((r: any) => r.role === "admin" || r.role === "moderator");
    nav(isStaff ? "/flatmates/admin/moderation" : "/flatmates");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl border-b border-border">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/flatmates" className="w-9 h-9 -ml-2 grid place-items-center rounded-full hover:bg-muted">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <p className="font-display font-semibold tracking-tight flex-1">Log in</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-5">
        {session && (
          <Card className="p-3 mb-4 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">Signed in as {session.user?.email}</p>
              <Link href="/flatmates" className="text-xs text-primary font-semibold">Go to Flatmates</Link>
            </div>
            <button onClick={signOut} className="h-9 px-3 rounded-xl border border-border text-xs font-semibold inline-flex items-center gap-1.5">
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </button>
          </Card>
        )}

        <form onSubmit={submit}>
          <Field label="Email">
            <input className={inp} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@email.com" autoComplete="email" />
          </Field>
          <Field label="Password">
            <input className={inp} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Your password" autoComplete="current-password" />
          </Field>

          {error && (
            <Card className="p-3 mb-3 border-destructive/30 bg-destructive/[0.06]">
              <p className="text-sm font-medium text-destructive">{error}</p>
            </Card>
          )}

          <Btn className="w-full" type="submit" disabled={busy}>
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Log in"}
          </Btn>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          New here? <Link href="/flatmates/signup" className="font-semibold text-primary">Create an account</Link>
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
