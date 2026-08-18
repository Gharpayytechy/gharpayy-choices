// @ts-nocheck
import { useState } from "react";
import { useLocation } from "wouter";
import { Users, X, Check, ArrowRight } from "lucide-react";
import { cn } from "@/referral-app/lib/utils";
import { allActors, ROLE_LABEL, currentActor, switchActor } from "@/flatmates/backend/store/actors";
import { useFM } from "@/flatmates/backend/store/store";
import { startSession, logOut, currentAccount, listAccounts } from "@/flatmates/backend/store/accounts";

const ROLE_ORDER = ["seeker", "poster", "owner", "group", "admin"];

export function RoleSwitcher() {
  const [open, setOpen] = useState(false);
  const actor = useFM(() => currentActor());
  const account = useFM(() => currentAccount());
  const actors = useFM(() => allActors());
  const accounts = useFM(() => listAccounts());
  const [, navigate] = useLocation();

  const pick = (a: any) => {
    if (a.isAccount) startSession(a.id); else switchActor(a.id);
    setOpen(false);
    setTimeout(() => navigate(a.home), 80);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-4 z-40 md:bottom-6 h-12 pl-3 pr-4 rounded-full bg-foreground text-background shadow-[var(--shadow-pop)] flex items-center gap-2 text-sm font-semibold"
        aria-label="Switch account"
      >
        <span className="text-base leading-none">{actor.emoji}</span>
        <span className="hidden sm:inline">{actor.label}</span>
        <Users className="w-4 h-4 opacity-70" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[86vh] overflow-y-auto rounded-t-3xl bg-card p-5 shadow-2xl md:inset-y-0 md:right-0 md:left-auto md:w-[420px] md:rounded-l-3xl md:rounded-tr-none">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-display text-xl font-bold tracking-tight">Switch account</h2>
                <p className="text-sm text-muted-foreground">{accounts.length ? "Your account, plus demo personas for every side of the marketplace." : "Create your own account, or try any side of the marketplace instantly."}</p>
              </div>
              <button onClick={() => setOpen(false)} className="w-9 h-9 rounded-full bg-muted grid place-items-center">
                <X className="w-4 h-4" />
              </button>
            </div>

            {ROLE_ORDER.map((role) => (
              <div key={role} className="mb-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-2">{ROLE_LABEL[role]}</p>
                <div className="space-y-2">
                  {actors.filter((a: any) => a.role === role).map((a) => {
                    const on = a.id === actor.id;
                    return (
                      <button
                        key={a.id}
                        onClick={() => pick(a)}
                        className={cn(
                          "w-full text-left rounded-2xl border p-3 flex gap-3 items-start transition-colors",
                          on ? "border-primary bg-primary/[0.06]" : "border-border hover:bg-muted",
                        )}
                      >
                        <span className="text-xl leading-none mt-0.5">{a.emoji}</span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{a.label}</span>
                            {on && <Check className="w-3.5 h-3.5 text-primary" />}
                          </span>
                          <span className="block text-xs text-muted-foreground">{a.tagline}</span>
                          <span className="block text-[11px] text-muted-foreground/80 mt-1">{a.blurb}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="grid grid-cols-2 gap-2 mb-3">
              <button onClick={() => { setOpen(false); navigate("/flatmates/signup"); }}
                className="h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">Create account</button>
              {account ? (
                 <button onClick={() => { logOut(); setOpen(false); navigate("/flatmates"); }}
                  className="h-10 rounded-xl border border-border text-sm font-semibold">Log out</button>
              ) : (
                <button onClick={() => { setOpen(false); navigate("/flatmates/login"); }}
                  className="h-10 rounded-xl border border-border text-sm font-semibold">Log in</button>
              )}
            </div>

            <a href="/flatmates/guide" className="flex items-center justify-between rounded-2xl bg-foreground text-background px-4 py-3 text-sm font-semibold">
              What's ready & how to use it <ArrowRight className="w-4 h-4" />
            </a>
            <p className="text-[11px] text-muted-foreground mt-3 text-center">
              Each account has its own requirement, saved list, requests, chats and notifications.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
