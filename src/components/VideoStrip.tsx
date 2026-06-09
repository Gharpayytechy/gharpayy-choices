import { GHARPAYY_VIMEO, GHARPAYY_INSTAGRAM, GHARPAYY_YOUTUBE, GHARPAYY_BOOK_URL, waConcierge } from "@/lib/wa";
import { WhatsAppIcon } from "./Header";

export function VideoStrip() {
  return (
    <div className="rounded-3xl border-2 border-primary/20 bg-card overflow-hidden shadow-[var(--shadow-card)]">
      <div className="grid lg:grid-cols-[1.5fr_1fr]">
        {/* Hero video · Gharpayy's official Vimeo */}
        <div className="relative aspect-video bg-black">
          <iframe
            src={GHARPAYY_VIMEO}
            title="Gharpayy · Verified stays in Bengaluru"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            loading="lazy"
            className="absolute inset-0 w-full h-full"
          />
        </div>

        {/* Right pane: tour CTA + socials */}
        <div className="p-6 md:p-8 flex flex-col">
          <div className="text-[11px] font-bold uppercase tracking-widest text-primary">See it before you sign it</div>
          <h3 className="mt-1.5 text-2xl font-bold leading-tight text-ink">
            A 5-minute virtual tour beats <span className="text-primary">10 broker calls</span>.
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Every Gharpayy room is shot on video and toured live on WhatsApp. No staged photos, no surprise pillars in the bedroom.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <a href={GHARPAYY_BOOK_URL} target="_blank" rel="noreferrer" className="inline-flex items-center px-4 py-2.5 rounded-full text-sm font-bold text-white shadow-[var(--shadow-glow)]" style={{ background: "var(--gradient-orange)" }}>
              📅 Book a virtual tour
            </a>
            <a href={waConcierge("just watched your tour video")} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold text-white bg-[oklch(0.62_0.14_155)]">
              <WhatsAppIcon className="w-3.5 h-3.5" /> Talk now
            </a>
          </div>

          <div className="mt-auto pt-6 border-t mt-6">
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">More from Gharpayy</div>
            <div className="flex gap-2">
              <Social href={GHARPAYY_INSTAGRAM} label="Instagram" icon="📸" sub="Daily room reels" />
              <Social href={GHARPAYY_YOUTUBE} label="YouTube" icon="▶️" sub="Long room tours" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Social({ href, label, icon, sub }: { href: string; label: string; icon: string; sub: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="flex-1 px-3 py-2.5 rounded-xl border bg-card hover:border-primary/40 hover:bg-primary/5 transition">
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <div>
          <div className="text-sm font-semibold">{label}</div>
          <div className="text-[10px] text-muted-foreground">{sub}</div>
        </div>
      </div>
    </a>
  );
}
