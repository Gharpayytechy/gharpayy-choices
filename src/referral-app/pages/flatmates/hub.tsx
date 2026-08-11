// @ts-nocheck
import { useEffect } from "react";
import { Link } from "wouter";
import { FMShell, Section, Card, Pill, KPI, money } from "@/referral-app/components/flatmates/Shell";
import { useFM, People, Rooms, Flats, Groups, Threads, Meetings, Saved, Interests, getMe } from "@/referral-app/lib/flatmates/store";
import { READY_STAYS, seedFlatmates } from "@/referral-app/lib/flatmates/seed";
import {
  Compass, Users, Home, Bookmark, MessageCircle, CalendarDays, ShieldCheck, Activity, Sliders,
  Zap, Search, Bell, Receipt, FileText, LogOut, HandCoins, Sparkles, Plus, User,
} from "lucide-react";

const GROUPS = [
  {
    title: "Find your place",
    eyebrow: "Supply side",
    items: [
      { href: "/flatmates/discover", icon: Compass, t: "Discover", s: "Ranked rooms, people, flats" },
      { href: "/flatmates/ready", icon: Zap, t: "Move this week", s: "Keys-in-hand managed stays" },
      { href: "/flatmates/search", icon: Search, t: "Global search", s: "One box, every entity" },
      { href: "/flatmates/saved", icon: Bookmark, t: "Shortlist", s: "Compare side by side" },
    ],
  },
  {
    title: "Find your people",
    eyebrow: "Demand side",
    items: [
      { href: "/flatmates/discover?tab=people", icon: Users, t: "Flatmates", s: "Verified seekers near you" },
      { href: "/flatmates/groups", icon: Sparkles, t: "Groups", s: "Form a household first" },
      { href: "/flatmates/inbox", icon: MessageCircle, t: "Conversations", s: "Interests and chats" },
      { href: "/flatmates/meetings", icon: CalendarDays, t: "Meets & visits", s: "Safe, scheduled, logged" },
    ],
  },
  {
    title: "Close the deal",
    eyebrow: "Money & paperwork",
    items: [
      { href: "/flatmates/deals", icon: HandCoins, t: "Rent fairness & negotiation", s: "Fair band + scripts that work" },
      { href: "/flatmates/agreement", icon: FileText, t: "Agreement & house rules", s: "Generate before you pay" },
      { href: "/flatmates/household", icon: Receipt, t: "Household & splits", s: "Rent, bills, who owes what" },
      { href: "/flatmates/moveout", icon: LogOut, t: "Move-out & deposit", s: "Recover every rupee" },
    ],
  },
  {
    title: "Know the market",
    eyebrow: "Intelligence",
    items: [
      { href: "/flatmates/liquidity", icon: Activity, t: "Market liquidity", s: "Where supply is tight today" },
      { href: "/flatmates/requirement", icon: Sliders, t: "Requirement tuner", s: "See constraints cost you matches" },
      { href: "/flatmates/trust", icon: ShieldCheck, t: "Trust centre", s: "Verify to rank 3× higher" },
      { href: "/flatmates/safety", icon: ShieldCheck, t: "Safety rules", s: "Five rules before you pay" },
    ],
  },
  {
    title: "Your account",
    eyebrow: "You",
    items: [
      { href: "/flatmates/you", icon: User, t: "Profile", s: "Strength, verifications, activity" },
      { href: "/flatmates/post", icon: Plus, t: "Post a room or need", s: "Goes live in 90 seconds" },
      { href: "/flatmates/notifications", icon: Bell, t: "Alerts", s: "Matches, visits, supply drops" },
      { href: "/flatmates/onboard", icon: Home, t: "Edit requirement", s: "Budget, areas, move-in" },
    ],
  },
];

export default function FlatmatesHub() {
  useEffect(() => { seedFlatmates(); }, []);
  const me = useFM(() => getMe());
  const d = useFM(() => ({
    rooms: Rooms.all().filter((r: any) => r.status === "LIVE").length,
    people: People.all().length,
    flats: Flats.all().length,
    groups: Groups.all().length,
    threads: Threads.all().length,
    meets: Meetings.all().length,
    saved: Saved.all().length,
    interests: Interests.all().length,
  }));

  return (
    <FMShell title="Flatmates Super App" sub="Every module in one place" tab="home" wide>
      <Card className="p-5 mb-4 relative overflow-hidden border-primary/20">
        <div className="absolute inset-0 opacity-90" style={{ background: "var(--gradient-hero)" }} />
        <div className="relative">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">One app, whole move</p>
          <h2 className="font-display text-2xl font-semibold tracking-tight mt-1.5">
            Search, match, negotiate, sign, split, move out.
          </h2>
          <p className="text-sm text-muted-foreground mt-1.5">
            {d.rooms + d.people + d.flats} live entities · budget up to {money(me.budgetMax)} · {me.areas?.join(", ") || "add your areas"}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            <Pill tone="orange">Direct to owner</Pill>
            <Pill tone="green">Best rent guaranteed</Pill>
            <Pill>Expert Desk · 24×7</Pill>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-4 gap-2 mb-6">
        <KPI label="Live rooms" value={d.rooms} tone="primary" />
        <KPI label="Shortlist" value={d.saved} />
        <KPI label="Threads" value={d.threads} />
        <KPI label="Ready now" value={READY_STAYS.filter((s: any) => s.ready === "Today").length} tone="good" />
      </div>

      {GROUPS.map((g) => (
        <Section key={g.title} title={g.title} eyebrow={g.eyebrow}>
          <div className="grid sm:grid-cols-2 gap-2">
            {g.items.map((it: any) => (
              <Link key={it.href + it.t} href={it.href}>
                <Card className="p-3.5 flex items-center gap-3 h-full hover:border-primary/40 transition-colors">
                  <span className="w-9 h-9 rounded-xl bg-primary/10 grid place-items-center shrink-0">
                    <it.icon className="w-4 h-4 text-primary" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm">{it.t}</p>
                    <p className="text-xs text-muted-foreground truncate">{it.s}</p>
                  </div>
                  <span className="text-muted-foreground">›</span>
                </Card>
              </Link>
            ))}
          </div>
        </Section>
      ))}
    </FMShell>
  );
}
