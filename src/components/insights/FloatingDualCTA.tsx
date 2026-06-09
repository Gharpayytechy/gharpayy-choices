import { WhatsAppIcon } from "@/components/Header";
import { waConcierge, GHARPAYY_BOOK_URL } from "@/lib/wa";

// Desktop-only floating CTAs. Compact stacked pills so they don't overlap content cards.
// Hidden on mobile (MobileBottomBar handles that surface).
export function FloatingDualCTA() {
  return (
    <div className="hidden lg:flex fixed bottom-4 right-4 z-40 flex-col gap-1.5 items-end">
      <a
        href={GHARPAYY_BOOK_URL}
        target="_blank"
        rel="noreferrer"
        className="px-3 py-2 rounded-full text-white font-bold text-xs shadow-[var(--shadow-glow)] inline-flex items-center gap-1.5"
        style={{ background: "var(--gradient-orange)" }}
      >
        📅 Book a tour
      </a>
      <a
        href={waConcierge("Floating CTA")}
        target="_blank"
        rel="noreferrer"
        className="px-3 py-2 rounded-full text-white font-semibold text-xs inline-flex items-center gap-1.5"
        style={{ background: "oklch(0.62 0.14 155)" }}
      >
        <WhatsAppIcon className="w-3.5 h-3.5" /> Expert
      </a>
    </div>
  );
}
