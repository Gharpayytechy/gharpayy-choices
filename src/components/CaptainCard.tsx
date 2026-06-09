// Expert card · the human face of Gharpayy on every persona / area page.

import { type Expert, captainPhone, captainWaLink } from "@/lib/captains";
import { WhatsAppIcon } from "./Header";
import { track } from "@/lib/analytics";

export function CaptainCard({
  expert,
  context,
  compact = false,
}: {
  expert: Expert;
  context?: string;
  compact?: boolean;
}) {
  const message = `Hey ${expert.name} 👋 ${context ?? "Found you via Gharpayy Insights"}. Can you help?`;
  const wa = captainWaLink(expert, message);

  if (compact) {
    return (
      <a
        href={wa}
        target="_blank"
        rel="noreferrer"
        onClick={() => track("captain_whatsapp_clicked", { expert: expert.id, context })}
        className="flex items-center gap-3 p-3 rounded-2xl border bg-card hover:border-primary/40 transition"
      >
        <span className="w-10 h-10 rounded-full grid place-items-center text-white font-bold" style={{ background: "var(--gradient-orange)" }}>
          {expert.initial}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold truncate">{expert.name}</div>
          <div className="text-[11px] text-muted-foreground truncate">{expert.title}</div>
        </div>
        <WhatsAppIcon className="w-5 h-5 text-[oklch(0.62_0.14_155)]" />
      </a>
    );
  }

  return (
    <div className="rounded-3xl border-2 border-primary/20 bg-card p-5 md:p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-start gap-4">
        <span className="w-14 h-14 rounded-2xl grid place-items-center text-white text-xl font-bold shrink-0" style={{ background: "var(--gradient-orange)" }}>
          {expert.initial}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] uppercase tracking-widest text-primary font-bold">Your expert</div>
          <div className="text-lg font-bold text-ink leading-tight">{expert.name}</div>
          <div className="text-xs text-muted-foreground">{expert.title}</div>
        </div>
      </div>
      <p className="mt-4 text-sm text-muted-foreground italic leading-snug">"{expert.quote}"</p>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <Stat label="Replies" value={expert.responseSla.split(" ").slice(0, 2).join(" ")} />
        <Stat label="Closed" value={`${expert.closed}+`} />
        <Stat label="Active now" value={`${expert.active}`} />
      </div>
      <div className="mt-4 flex flex-col sm:flex-row gap-2">
        <a
          href={wa}
          target="_blank"
          rel="noreferrer"
          onClick={() => track("captain_whatsapp_clicked", { expert: expert.id, context })}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full text-sm font-bold text-white"
          style={{ background: "oklch(0.62 0.14 155)" }}
        >
          <WhatsAppIcon className="w-4 h-4" /> WhatsApp {expert.name}
        </a>
        <a
          href={`tel:${captainPhone(expert)}`}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full text-sm font-bold border-2 border-primary/30 text-primary bg-primary/5"
        >
          📞 Call
        </a>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-secondary/40 px-2 py-2">
      <div className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">{label}</div>
      <div className="mt-0.5 text-xs font-bold text-ink">{value}</div>
    </div>
  );
}

// Local re-import to avoid circular · used only in compact view above
import { Link as _Link } from "@tanstack/react-router";
void _Link;
