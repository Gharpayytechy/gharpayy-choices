import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu } from "lucide-react";
import { BrandLogo } from "./BrandLogo";
import { GHARPAYY_URL, waConcierge } from "@/lib/wa";
import { useRentForm } from "./RentFormProvider";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const nav = [
  { to: "/map", label: "Map" },
  { to: "/areas", label: "Areas" },
  { to: "/persona-quiz", label: "Find me" },
  { to: "/gharpayy", label: "Gharpayy" },
  { to: "/app", label: "Earn 💸" },
];

export function Header() {
  const { open } = useRentForm();
  const [sheetOpen, setSheetOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-3 md:px-5 h-14 flex items-center gap-2 md:gap-4">
        <BrandLogo />
        <nav className="hidden md:flex items-center gap-0.5 text-sm">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to as any}
              className="px-2.5 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition whitespace-nowrap"
              activeProps={{ className: "px-2.5 py-1.5 rounded-md text-foreground bg-secondary font-medium whitespace-nowrap" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1.5">
          <Link
            to="/app"
            className="inline-flex md:hidden items-center px-2.5 py-1 rounded-full text-[11px] font-bold text-white shadow-[var(--shadow-glow)]"
            style={{ background: "var(--gradient-orange)" }}
          >
            Earn 💸
          </Link>
          <button
            onClick={() => open()}
            className="hidden lg:inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border-2 border-primary/40 text-primary bg-primary/5 hover:bg-primary/10 transition whitespace-nowrap"
          >
            ➕ Add rent
          </button>
          <a
            href={waConcierge("from the header")}
            target="_blank"
            rel="noreferrer"
            aria-label="WhatsApp the expert"
            className="hidden sm:inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold text-white bg-[oklch(0.62_0.14_155)] hover:opacity-90 transition"
          >
            <WhatsAppIcon className="w-3.5 h-3.5" /> <span className="hidden lg:inline">WhatsApp</span>
          </a>
          <a
            href={GHARPAYY_URL}
            target="_blank"
            rel="noreferrer"
            className="hidden md:inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold text-white shadow-[var(--shadow-glow)] transition hover:opacity-95 whitespace-nowrap"
            style={{ background: "var(--gradient-orange)" }}
          >
            Open Gharpayy →
          </a>

          {/* Mobile hamburger */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <button
                aria-label="Open menu"
                className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-full border bg-card hover:bg-secondary"
              >
                <Menu className="w-5 h-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85%] sm:w-[360px] p-0">
              <SheetHeader className="px-5 pt-5 pb-3 border-b">
                <SheetTitle>Gharpayy Insights</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col p-3 gap-1">
                {nav.map((n) => (
                  <Link
                    key={n.to}
                    to={n.to as any}
                    onClick={() => setSheetOpen(false)}
                    className="px-3 py-3 rounded-lg text-base text-foreground hover:bg-secondary"
                    activeProps={{ className: "px-3 py-3 rounded-lg text-base bg-secondary font-semibold text-foreground" }}
                  >
                    {n.label}
                  </Link>
                ))}
                <Link
                  to="/compare"
                  onClick={() => setSheetOpen(false)}
                  className="px-3 py-3 rounded-lg text-base text-foreground hover:bg-secondary"
                >
                  ⚖️ Compare areas
                </Link>
                <button
                  onClick={() => { setSheetOpen(false); open(); }}
                  className="px-3 py-3 rounded-lg text-base text-left text-foreground hover:bg-secondary"
                >
                  ➕ Add your rent
                </button>
                <a
                  href={waConcierge("from mobile menu")}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setSheetOpen(false)}
                  className="mt-2 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full text-sm font-semibold text-white bg-[oklch(0.62_0.14_155)]"
                >
                  <WhatsAppIcon className="w-4 h-4" /> WhatsApp the expert
                </a>
                <a
                  href={GHARPAYY_URL}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setSheetOpen(false)}
                  className="inline-flex items-center justify-center px-4 py-3 rounded-full text-sm font-semibold text-white"
                  style={{ background: "var(--gradient-orange)" }}
                >
                  Open Gharpayy →
                </a>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export function WhatsAppIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M19.05 4.91A10 10 0 0 0 4.94 19.05L4 23l4.07-1.06A10 10 0 1 0 19.05 4.91Zm-7.06 16.34a8.34 8.34 0 0 1-4.25-1.16l-.3-.18-2.41.63.65-2.35-.2-.31a8.36 8.36 0 1 1 6.51 3.37Zm4.58-6.26-1.3-.6c-.18-.07-.32-.1-.45.1l-.63.78c-.12.15-.23.16-.42.06a6.86 6.86 0 0 1-2.02-1.25 7.59 7.59 0 0 1-1.4-1.74c-.15-.25 0-.38.11-.5l.34-.4c.1-.13.13-.22.2-.36s0-.27-.02-.37l-.6-1.46c-.16-.4-.33-.34-.45-.34h-.38a.74.74 0 0 0-.53.25 2.25 2.25 0 0 0-.7 1.67 3.9 3.9 0 0 0 .82 2.07c.1.13 1.42 2.17 3.45 3.04 1.62.69 2.25.74 3.05.62a2.05 2.05 0 0 0 1.34-.94 1.66 1.66 0 0 0 .12-.94c-.05-.08-.18-.13-.36-.21Z" />
    </svg>
  );
}
