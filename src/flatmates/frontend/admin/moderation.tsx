// @ts-nocheck
/** Team moderation queue: everything that did not auto-approve lands here. */
import { useEffect, useState } from "react";
import { ShieldCheck, AlertTriangle, Loader2 } from "lucide-react";
import { FMShell } from "@/flatmates/frontend/components/Shell";
import { supabase } from "@/integrations/supabase/client";
import { moderationQueue, moderateListing } from "@/lib/listings.functions";

export default function AdminModeration() {
  const [state, setState] = useState<any>({ loading: true, allowed: false, listings: [], signals: [] });
  const [busy, setBusy] = useState<string>("");

  const load = async () => {
    try {
      const { data: s } = await supabase.auth.getSession();
      if (!s.session) {
        setState({ loading: false, allowed: false, listings: [], signals: [] });
        return;
      }
      const res: any = await moderationQueue();
      setState({ loading: false, ...res });
    } catch (e: any) {
      setState({ loading: false, allowed: false, listings: [], signals: [], error: e?.message });
    }
  };
  useEffect(() => { load(); }, []);

  const act = async (id: string, action: "approve" | "reject") => {
    setBusy(id);
    await moderateListing({ data: { id, action, reasons: action === "reject" ? ["Did not meet listing quality standards"] : [] } });
    setBusy("");
    load();
  };

  if (state.loading) return <FMShell title="Moderation" back="/flatmates/admin"><p className="text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading queue…</p></FMShell>;

  if (!state.allowed) {
    return (
      <FMShell title="Moderation" back="/flatmates/admin">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-sm font-semibold">Team access required</p>
          <p className="text-xs text-muted-foreground mt-1">
            Sign in with an account that has the admin or moderator role to review listings.
          </p>
        </div>
      </FMShell>
    );
  }

  return (
    <FMShell title="Moderation queue" sub={`${state.listings.length} listing(s) awaiting a decision`} back="/flatmates/admin" wide>
      {state.listings.length === 0 && <p className="text-sm text-muted-foreground">Queue is clear. Nothing is waiting to go live.</p>}
      {state.listings.map((l: any) => {
        const sigs = state.signals.filter((s: any) => s.listing_id === l.id);
        return (
          <div key={l.id} className="rounded-2xl border border-border bg-card p-4 mb-3">
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{l.title || "Untitled listing"}</p>
                <p className="text-xs text-muted-foreground">{l.area}, {l.city} · ₹{l.rent ?? "—"} · deposit ₹{l.deposit ?? "—"}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">{l.quality_score}</p>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{l.status}</p>
              </div>
            </div>
            <p className="text-sm mt-2 line-clamp-3 text-muted-foreground">{l.description}</p>
            <p className="text-[11px] mt-2 font-semibold text-muted-foreground">Auto decision: {String(l.auto_decision || "").replace(/_/g, " ")}</p>
            {Array.isArray(l.missing) && l.missing.length > 0 && (
              <ul className="mt-2 text-xs text-muted-foreground list-disc pl-4">{l.missing.map((m: string) => <li key={m}>{m}</li>)}</ul>
            )}
            {sigs.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {sigs.map((s: any, i: number) => (
                  <span key={i} className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full bg-destructive/10 text-destructive">
                    <AlertTriangle className="w-3 h-3" />{s.signal.replace(/_/g, " ")} ·{s.severity}
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2 mt-3">
              <button disabled={busy === l.id} onClick={() => act(l.id, "approve")} className="h-10 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold inline-flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Approve & publish
              </button>
              <button disabled={busy === l.id} onClick={() => act(l.id, "reject")} className="h-10 px-4 rounded-xl border border-border text-sm font-semibold">Reject</button>
            </div>
          </div>
        );
      })}
    </FMShell>
  );
}
