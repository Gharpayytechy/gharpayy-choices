// @ts-nocheck
/** Log in to an account created on this device. */
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Card, Btn } from "@/flatmates/frontend/components/Shell";
import { logIn, listAccounts, ROLE_META } from "@/flatmates/backend/store/accounts";
import { track } from "@/flatmates/backend/store/store";
import { ArrowLeft } from "lucide-react";

export default function FlatmatesLogin() {
  const [, nav] = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const accounts = listAccounts();

  const submit = (e: any) => {
    e?.preventDefault?.();
    setError("");
    const res = logIn(form);
    if (!res.ok) { setError(res.error); return; }
    track("account_login", { role: res.account.role });
    nav(ROLE_META[res.account.role]?.home || "/flatmates");
  };

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl border-b border-border">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/flatmates/welcome" className="w-9 h-9 -ml-2 grid place-items-center rounded-full hover:bg-muted">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <p className="font-display font-semibold tracking-tight flex-1">Log in</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-5">
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

          <Btn className="w-full" type="submit">Log in</Btn>
        </form>

        {!!accounts.length && (
          <div className="mt-6">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Accounts on this device</p>
            <div className="space-y-2">
              {accounts.map((a: any) => (
                <button key={a.id} onClick={() => setForm({ email: a.email, password: "" })}
                  className="w-full text-left rounded-2xl border border-border p-3 hover:bg-muted transition-colors">
                  <span className="text-base">{ROLE_META[a.role]?.emoji || "🙂"}</span>{" "}
                  <span className="font-semibold text-sm">{a.name}</span>
                  <span className="block text-xs text-muted-foreground">{a.email}</span>
                </button>
              ))}
            </div>
          </div>
        )}

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
