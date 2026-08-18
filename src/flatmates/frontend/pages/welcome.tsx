// @ts-nocheck
/** The first screen: says what this is and gives one obvious next step per person. */
import { Link } from "wouter";
import { ArrowRight, Home, Users, Building2, Sparkles, ShieldCheck, MessagesSquare, Compass } from "lucide-react";
import { Card } from "@/flatmates/frontend/components/Shell";
import { useFM } from "@/flatmates/backend/store/store";
import { currentAccount } from "@/flatmates/backend/store/accounts";
import { waListMyProperty } from "@/lib/wa";

const PATHS = [
  { role: "seeker", icon: Home, title: "I need a room", sub: "Match with verified rooms and flatmates in your area, within your budget." },
  { role: "poster", icon: Users, title: "I have a spare room", sub: "List the room, screen requests yourself, and chat only with people you accept." },
  { role: "owner", icon: Building2, title: "I own property to rent", sub: "Publish flats, get qualified visits, and track every lead in the supply desk." },
  { role: "group", icon: Sparkles, title: "I want to form a group", sub: "Team up with compatible people, then take a bigger flat together." },
];

const STEPS = [
  { icon: ShieldCheck, t: "1 · Create your account", d: "Name, email, password. Takes 20 seconds — no documents." },
  { icon: Compass, t: "2 · Tell us your move", d: "Areas, budget, move-in date, and your living style." },
  { icon: MessagesSquare, t: "3 · Request, accept, chat", d: "Chats open only after both sides accept, so nobody spams you." },
];

export default function FlatmatesWelcome() {
  const account = useFM(() => currentAccount());

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-xl border-b border-border">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <span className="w-7 h-7 rounded-lg bg-primary text-primary-foreground grid place-items-center text-xs font-bold font-display">G</span>
          <p className="font-display font-semibold tracking-tight flex-1">Gharpayy Flatmates</p>
          <Link href="/flatmates/login" className="text-sm font-semibold text-primary">Log in</Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="rounded-3xl bg-foreground text-background p-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.2]" style={{ background: "radial-gradient(ellipse 70% 60% at 85% 0%, var(--primary), transparent 70%)" }} />
          <div className="relative">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-background/60">Rooms · flatmates · whole flats</p>
            <h1 className="font-display text-3xl font-semibold tracking-tight mt-2 leading-tight">
              Find the right room, or the right person to share yours with.
            </h1>
            <p className="text-sm text-background/75 mt-2.5 leading-6">
              Direct to owner, no brokerage. Requests are answered within 48 hours and chats open only when both sides say yes.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 mt-5">
              <Link href="/flatmates/signup" className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground grid place-items-center text-sm font-semibold">
                Create your account
              </Link>
              <Link href="/flatmates" className="h-11 px-4 rounded-xl border border-background/25 grid place-items-center text-sm font-semibold">
                Look around first
              </Link>
            </div>
            {account && (
              <p className="text-xs text-background/70 mt-3">
                Signed in as {account.name} · <Link href="/flatmates" className="underline font-semibold">go to your home</Link>
              </p>
            )}
          </div>
        </div>

        <h2 className="font-display text-lg font-semibold tracking-tight mt-7 mb-1">Start with what you need</h2>
        <p className="text-sm text-muted-foreground mb-3">Pick one — we set the whole app up around it.</p>
        <div className="space-y-2.5">
          {PATHS.map((p) => (
            <Link key={p.role} href={`/flatmates/signup?role=${p.role}`}>
              <Card className="p-4 flex items-start gap-3 hover:border-primary/40 transition-colors">
                <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0"><p.icon className="w-5 h-5" /></span>
                <span className="flex-1 min-w-0">
                  <span className="block font-semibold tracking-tight">{p.title}</span>
                  <span className="block text-xs text-muted-foreground mt-0.5 leading-5">{p.sub}</span>
                </span>
                <ArrowRight className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
              </Card>
            </Link>
          ))}
        </div>

        <h2 className="font-display text-lg font-semibold tracking-tight mt-7 mb-3">How it works</h2>
        <div className="space-y-2.5">
          {STEPS.map((s) => (
            <Card key={s.t} className="p-4 flex gap-3 items-start">
              <span className="w-9 h-9 rounded-xl bg-muted grid place-items-center shrink-0"><s.icon className="w-4 h-4" /></span>
              <div>
                <p className="font-semibold text-sm">{s.t}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-5">{s.d}</p>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-4 mt-6 border-primary/25 bg-primary/[0.05]">
          <p className="font-semibold text-sm">Own a property and prefer WhatsApp?</p>
          <p className="text-xs text-muted-foreground mt-1 leading-5">
            Send us the details and our team lists it for you — or add it yourself in the supply desk.
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            <a href={waListMyProperty()} target="_blank" rel="noopener noreferrer"
              className="h-10 px-4 rounded-xl bg-[#25D366] text-white grid place-items-center text-sm font-semibold">
              List on WhatsApp
            </a>
            <Link href="/flatmates/signup?role=owner" className="h-10 px-4 rounded-xl border border-border grid place-items-center text-sm font-semibold">
              Add it in the app
            </Link>
          </div>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Already with us? <Link href="/flatmates/login" className="font-semibold text-primary">Log in</Link> ·{" "}
          <Link href="/flatmates/guide" className="font-semibold text-primary">See what's ready</Link>
        </p>
        <div className="h-10" />
      </main>
    </div>
  );
}
