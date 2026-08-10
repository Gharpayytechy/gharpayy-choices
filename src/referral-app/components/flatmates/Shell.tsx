// @ts-nocheck
import { Link, useLocation } from "wouter";
import { Home, Compass, Plus, MessageCircle, User, Bell, ChevronLeft, Heart, ShieldCheck } from "lucide-react";
import { cn } from "@/referral-app/lib/utils";
import { useFM, Notifs } from "@/referral-app/lib/flatmates/store";

export function FMShell({ children, title, back, action, tab }: any) {
  const unread = useFM(() => Notifs.all().filter((n: any) => !n.read).length);
  return (
    <div className="min-h-[100dvh] bg-[#F7F7F5] text-slate-900 pb-24">
      <header className="sticky top-0 z-30 bg-[#F7F7F5]/90 backdrop-blur border-b border-slate-900/5">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          {back ? (
            <Link href={back} className="w-9 h-9 -ml-2 grid place-items-center rounded-full hover:bg-slate-900/5">
              <ChevronLeft className="w-5 h-5" />
            </Link>
          ) : (
            <span className="text-lg">🏡</span>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold tracking-tight truncate">{title}</h1>
          </div>
          {action}
          <Link href="/flatmates/notifications" className="relative w-9 h-9 grid place-items-center rounded-full hover:bg-slate-900/5">
            <Bell className="w-5 h-5 text-slate-600" />
            {unread > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-orange-500" />}
          </Link>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-4">{children}</main>
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
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-900/10">
      <div className="max-w-2xl mx-auto grid grid-cols-5">
        {items.map((it) => {
          const on = active ? active === it.key : loc === it.href;
          if (it.key === "post")
            return (
              <Link key={it.key} href={it.href} className="flex items-center justify-center py-2">
                <span className="w-11 h-11 rounded-2xl bg-slate-900 text-white grid place-items-center shadow-lg shadow-slate-900/20">
                  <Plus className="w-5 h-5" />
                </span>
              </Link>
            );
          return (
            <Link key={it.key} href={it.href}
              className={cn("flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium",
                on ? "text-slate-900" : "text-slate-400")}>
              <it.icon className="w-5 h-5" strokeWidth={on ? 2.4 : 1.8} />
              {it.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function Section({ title, sub, action, children }: any) {
  return (
    <section className="mb-7">
      <div className="flex items-end justify-between mb-2.5">
        <div>
          <h2 className="text-[15px] font-semibold tracking-tight">{title}</h2>
          {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Card({ className, children, ...rest }: any) {
  return (
    <div {...rest} className={cn("bg-white rounded-2xl border border-slate-900/[0.07] shadow-[0_1px_2px_rgba(15,23,42,0.04)]", className)}>
      {children}
    </div>
  );
}

export function Pill({ children, tone = "slate", className }: any) {
  const tones: any = {
    slate: "bg-slate-100 text-slate-700",
    green: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    amber: "bg-amber-50 text-amber-800 border border-amber-200",
    dark: "bg-slate-900 text-white",
    orange: "bg-orange-50 text-orange-700 border border-orange-200",
  };
  return <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium", tones[tone], className)}>{children}</span>;
}

export function MatchRing({ score }: any) {
  const tone = score >= 90 ? "text-emerald-600" : score >= 75 ? "text-amber-600" : "text-slate-500";
  return (
    <div className="text-right shrink-0">
      <div className={cn("text-lg font-bold leading-none tabular-nums", tone)}>{score}%</div>
      <div className="text-[10px] text-slate-400 font-medium">match</div>
    </div>
  );
}

export function Btn({ variant = "primary", className, as, ...rest }: any) {
  const v: any = {
    primary: "bg-slate-900 text-white hover:bg-slate-800",
    secondary: "bg-white border border-slate-900/12 text-slate-900 hover:bg-slate-50",
    ghost: "text-slate-600 hover:bg-slate-100",
    accent: "bg-orange-500 text-white hover:bg-orange-600",
  };
  return (
    <button {...rest} className={cn("inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 h-10 text-sm font-semibold transition-colors disabled:opacity-40", v[variant], className)} />
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
    <button onClick={onClick} className={cn("w-9 h-9 rounded-full grid place-items-center border transition-colors",
      saved ? "bg-orange-50 border-orange-200 text-orange-600" : "bg-white border-slate-200 text-slate-400 hover:text-slate-700")}>
      <Heart className="w-4 h-4" fill={saved ? "currentColor" : "none"} />
    </button>
  );
}

export function EmptyRoutes({ title, body, routes }: any) {
  return (
    <Card className="p-5">
      <h3 className="font-semibold tracking-tight">{title}</h3>
      <p className="text-sm text-slate-500 mt-1">{body}</p>
      <div className="mt-4 space-y-2">
        {routes.map((r: any, i: number) => (
          <Link key={i} href={r.to} className="block rounded-xl border border-slate-900/8 p-3 hover:bg-slate-50">
            <div className="text-sm font-semibold">{r.title}</div>
            <div className="text-xs text-slate-500 mt-0.5">{r.body}</div>
            <div className="text-xs font-semibold text-orange-600 mt-1.5">{r.cta} →</div>
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
