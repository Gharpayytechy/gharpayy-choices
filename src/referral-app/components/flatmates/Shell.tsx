// @ts-nocheck
import { Link, useLocation } from "wouter";
import { Home, Compass, Plus, MessageCircle, User, Bell, ChevronLeft, Heart, ShieldCheck, Search, LayoutGrid } from "lucide-react";
import { cn } from "@/referral-app/lib/utils";
import { useFM, Notifs } from "@/referral-app/lib/flatmates/store";

export function FMShell({ children, title, sub, back, action, tab, wide }: any) {
  const unread = useFM(() => Notifs.all().filter((n: any) => !n.read).length);
  return (
    <div className="min-h-[100dvh] bg-background text-foreground pb-24">
      <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl border-b border-border">
        <div className={cn("mx-auto px-4 h-14 flex items-center gap-3", wide ? "max-w-5xl" : "max-w-2xl")}>
          {back ? (
            <Link href={back} className="w-9 h-9 -ml-2 grid place-items-center rounded-full hover:bg-muted transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
          ) : (
            <span className="w-7 h-7 rounded-lg bg-primary text-primary-foreground grid place-items-center text-xs font-bold font-display shrink-0">G</span>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="font-display font-semibold tracking-tight truncate leading-tight">{title}</h1>
            {sub && <p className="text-[11px] text-muted-foreground truncate">{sub}</p>}
          </div>
          {action}
          <Link href="/flatmates/hub" className="w-9 h-9 grid place-items-center rounded-full hover:bg-muted transition-colors" aria-label="All modules">
            <LayoutGrid className="w-[18px] h-[18px] text-muted-foreground" />
          </Link>
          <Link href="/flatmates/search" className="w-9 h-9 grid place-items-center rounded-full hover:bg-muted transition-colors">
            <Search className="w-[18px] h-[18px] text-muted-foreground" />
          </Link>

          <Link href="/flatmates/notifications" className="relative w-9 h-9 grid place-items-center rounded-full hover:bg-muted transition-colors">
            <Bell className="w-[18px] h-[18px] text-muted-foreground" />
            {unread > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary ring-2 ring-background" />}
          </Link>
        </div>
      </header>
      <main className={cn("mx-auto px-4 py-4", wide ? "max-w-5xl" : "max-w-2xl")}>{children}</main>
      <FMTabs active={tab} />
    </div>
  );
}

export function FMTabs({ active }: any) {
  const [loc] = useLocation();
  const items = [
    { key: "home", href: "/flatmates", icon: Home, label: "Home" },
    { key: "discover", href: "/flatmates/discover", icon: Compass, label: "Discover" },
    { key: "post", href: "/flatmates/post", icon: Plus, label: "Post" },
    { key: "inbox", href: "/flatmates/inbox", icon: MessageCircle, label: "Inbox" },
    { key: "you", href: "/flatmates/you", icon: User, label: "You" },
  ];
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-card/95 backdrop-blur-xl border-t border-border">
      <div className="max-w-2xl mx-auto grid grid-cols-5">
        {items.map((it) => {
          const on = active ? active === it.key : loc === it.href;
          if (it.key === "post")
            return (
              <Link key={it.key} href={it.href} className="flex items-center justify-center py-2">
                <span className="w-11 h-11 rounded-2xl bg-primary text-primary-foreground grid place-items-center shadow-[var(--shadow-glow)]">
                  <Plus className="w-5 h-5" />
                </span>
              </Link>
            );
          return (
            <Link key={it.key} href={it.href}
              className={cn("flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold transition-colors",
                on ? "text-primary" : "text-muted-foreground")}>
              <it.icon className="w-5 h-5" strokeWidth={on ? 2.4 : 1.8} />
              {it.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function Eyebrow({ children }: any) {
  return <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary mb-1">{children}</p>;
}

export function Section({ title, sub, action, eyebrow, children }: any) {
  return (
    <section className="mb-7">
      <div className="flex items-end justify-between mb-2.5 gap-3">
        <div className="min-w-0">
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <h2 className="font-display text-[16px] font-semibold tracking-tight">{title}</h2>
          {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Card({ className, children, ...rest }: any) {
  return (
    <div {...rest} className={cn("bg-card rounded-2xl border border-border shadow-[var(--shadow-card)]", className)}>
      {children}
    </div>
  );
}

export function Pill({ children, tone = "slate", className }: any) {
  const tones: any = {
    slate: "bg-muted text-muted-foreground",
    green: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    amber: "bg-amber-50 text-amber-800 border border-amber-200",
    dark: "bg-foreground text-background",
    orange: "bg-primary/10 text-primary border border-primary/20",
    red: "bg-red-50 text-red-700 border border-red-200",
  };
  return <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold", tones[tone], className)}>{children}</span>;
}

export function MatchRing({ score }: any) {
  const tone = score >= 90 ? "text-emerald-600" : score >= 75 ? "text-primary" : "text-muted-foreground";
  return (
    <div className="text-right shrink-0">
      <div className={cn("font-display text-lg font-bold leading-none tabular-nums", tone)}>{score}%</div>
      <div className="text-[10px] text-muted-foreground font-medium">match</div>
    </div>
  );
}

export function Btn({ variant = "primary", className, as, ...rest }: any) {
  const v: any = {
    primary: "bg-primary text-primary-foreground hover:brightness-105 shadow-[var(--shadow-glow)]",
    secondary: "bg-card border border-border text-foreground hover:bg-muted",
    dark: "bg-foreground text-background hover:opacity-90",
    ghost: "text-muted-foreground hover:bg-muted",
    accent: "bg-primary text-primary-foreground hover:brightness-105",
  };
  return (
    <button {...rest} className={cn("inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 h-10 text-sm font-semibold transition-all disabled:opacity-40", v[variant], className)} />
  );
}

export function LinkBtn({ href, variant = "secondary", className, children }: any) {
  const v: any = {
    primary: "bg-primary text-primary-foreground",
    secondary: "bg-card border border-border text-foreground hover:bg-muted",
    dark: "bg-foreground text-background",
  };
  return (
    <Link href={href} className={cn("inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 h-10 text-sm font-semibold transition-colors", v[variant], className)}>
      {children}
    </Link>
  );
}

export function KPI({ label, value, hint, tone = "default" }: any) {
  return (
    <Card className="p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</p>
      <p className={cn("font-display text-xl font-bold tabular-nums mt-0.5", tone === "primary" && "text-primary", tone === "good" && "text-emerald-600")}>{value}</p>
      {hint && <p className="text-[11px] text-muted-foreground mt-0.5">{hint}</p>}
    </Card>
  );
}

export function Meter({ value, tone = "primary" }: any) {
  const bg = tone === "good" ? "bg-emerald-500" : tone === "warn" ? "bg-amber-500" : "bg-primary";
  return (
    <div className="h-2 rounded-full bg-muted overflow-hidden">
      <div className={cn("h-full rounded-full transition-all", bg)} style={{ width: Math.max(0, Math.min(100, value)) + "%" }} />
    </div>
  );
}

export function VerifiedRow({ v = {} }: any) {
  const items = [["Phone", v.phone], ["Work", v.work], ["ID", v.id], ["Room", v.room]].filter(([, on]) => on);
  if (!items.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map(([k]: any) => (
        <Pill key={k} tone="green"><ShieldCheck className="w-3 h-3" />{k}</Pill>
      ))}
    </div>
  );
}

export function SaveBtn({ saved, onClick }: any) {
  return (
    <button onClick={onClick} className={cn("w-9 h-9 rounded-full grid place-items-center border transition-colors shrink-0",
      saved ? "bg-primary/10 border-primary/30 text-primary" : "bg-card border-border text-muted-foreground hover:text-foreground")}>
      <Heart className="w-4 h-4" fill={saved ? "currentColor" : "none"} />
    </button>
  );
}

export function EmptyRoutes({ title, body, routes }: any) {
  return (
    <Card className="p-5">
      <h3 className="font-display font-semibold tracking-tight">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{body}</p>
      <div className="mt-4 space-y-2">
        {routes.map((r: any, i: number) => (
          <Link key={i} href={r.to} className="block rounded-xl border border-border p-3 hover:bg-muted transition-colors">
            <div className="text-sm font-semibold">{r.title}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{r.body}</div>
            <div className="text-xs font-semibold text-primary mt-1.5">{r.cta} →</div>
          </Link>
        ))}
      </div>
    </Card>
  );
}

export const money = (n: number) => "₹" + new Intl.NumberFormat("en-IN").format(Math.round(n || 0));
export const shortDate = (d?: string) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "Flexible";
export const freshness = (iso?: string) => {
  if (!iso) return "Needs reconfirmation";
  const m = (Date.now() - +new Date(iso)) / 60000;
  if (m < 60) return `Verified ${Math.max(1, Math.round(m))} min ago`;
  if (m < 1440) return `Verified ${Math.round(m / 60)}h ago`;
  if (m < 4320) return `Verified ${Math.round(m / 1440)}d ago`;
  return "Needs reconfirmation";
};
export const timeAgo = (iso?: string) => {
  if (!iso) return "";
  const m = (Date.now() - +new Date(iso)) / 60000;
  if (m < 1) return "just now";
  if (m < 60) return `${Math.round(m)}m ago`;
  if (m < 1440) return `${Math.round(m / 60)}h ago`;
  return `${Math.round(m / 1440)}d ago`;
};
