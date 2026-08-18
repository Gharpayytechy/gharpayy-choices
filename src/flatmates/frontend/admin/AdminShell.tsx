// @ts-nocheck
import { Link, useLocation } from "wouter";
import { cn } from "@/referral-app/lib/utils";
import { LayoutDashboard, Boxes, Users, Building2, Target, ArrowLeft, Crown, Radar, KeyRound, Database } from "lucide-react";

const NAV = [
  { href: "/flatmates/admin", label: "Command", icon: LayoutDashboard },
  { href: "/flatmates/admin/supply", label: "Supply", icon: Boxes },
  { href: "/flatmates/admin/demand", label: "Demand", icon: Users },
  { href: "/flatmates/admin/owners", label: "Owners", icon: Building2 },
  { href: "/flatmates/admin/missions", label: "Missions", icon: Target },
  { href: "/flatmates/admin/tower", label: "Control Tower", icon: Radar },
  { href: "/flatmates/admin/keys", label: "Access keys", icon: KeyRound },
  { href: "/flatmates/admin/schemas", label: "Data schemas", icon: Database },
  { href: "/flatmates/admin/super", label: "Super admin", icon: Crown },
];

export function AdminShell({ title, sub, children, action }: any) {
  const [loc] = useLocation();
  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <header className="sticky top-0 z-30 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/flatmates" className="inline-flex items-center gap-1.5 text-xs font-semibold opacity-80 hover:opacity-100">
            <ArrowLeft className="w-4 h-4" /> App
          </Link>
          <span className="h-5 w-px bg-primary-foreground/25" />
          <p className="font-display font-semibold tracking-tight">Flatmates Admin</p>
          <span className="ml-auto text-[10px] font-bold uppercase tracking-[0.14em] opacity-70">Supply × Demand OS</span>
        </div>
        <nav className="max-w-7xl mx-auto px-2 flex gap-1 overflow-x-auto pb-1">
          {NAV.map((n) => {
            const on = loc === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-2 rounded-t-lg text-xs font-semibold whitespace-nowrap transition-colors",
                  on ? "bg-background text-primary" : "text-primary-foreground/75 hover:bg-primary-foreground/10",
                )}
              >
                <n.icon className="w-3.5 h-3.5" /> {n.label}
              </Link>
            );
          })}
        </nav>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-5">
        <div className="flex items-end justify-between gap-3 mb-5">
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight">{title}</h1>
            {sub && <p className="text-sm text-muted-foreground mt-0.5">{sub}</p>}
          </div>
          {action}
        </div>
        {children}
      </main>
    </div>
  );
}

export function Panel({ title, sub, children, className }: any) {
  return (
    <section className={cn("bg-card border border-border rounded-2xl shadow-[var(--shadow-card)] overflow-hidden", className)}>
      {title && (
        <div className="px-4 py-3 border-b border-border">
          <h2 className="font-display font-semibold text-sm tracking-tight">{title}</h2>
          {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

export function Kpi({ label, value, hint, tone = "default" }: any) {
  const tones: any = {
    default: "text-foreground",
    primary: "text-primary",
    good: "text-emerald-600",
    warn: "text-amber-600",
    bad: "text-destructive",
  };
  return (
    <div className="bg-card border border-border rounded-xl p-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className={cn("font-display text-xl font-semibold mt-1 tabular-nums", tones[tone])}>{value}</p>
      {hint && <p className="text-[11px] text-muted-foreground mt-0.5">{hint}</p>}
    </div>
  );
}

export function Tag({ children, tone = "muted" }: any) {
  const tones: any = {
    muted: "bg-muted text-muted-foreground",
    primary: "bg-primary/10 text-primary border border-primary/20",
    good: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    warn: "bg-amber-50 text-amber-800 border border-amber-200",
    bad: "bg-red-50 text-red-700 border border-red-200",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide", tones[tone])}>
      {children}
    </span>
  );
}

export const stateTone: Record<string, string> = {
  starved: "bad",
  tight: "warn",
  balanced: "good",
  surplus: "primary",
};
