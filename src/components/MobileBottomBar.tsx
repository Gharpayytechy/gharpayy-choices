import { Link } from "@tanstack/react-router";
import { WhatsAppIcon } from "./Header";
import { waConcierge, GHARPAYY_BOOK_URL, GHARPAYY_OFFICE_PHONE, deskFor, waLink, waArea } from "@/lib/wa";

type Variant = "insights" | "gharpayy" | "area" | "dual";

export function MobileBottomBar({
  variant = "insights",
  slug,
  context,
  areaName,
  med,
}: {
  variant?: Variant;
  slug?: string;
  context?: string;
  areaName?: string;
  med?: number;
}) {
  const desk = slug ? deskFor(slug) : "concierge";
  const wa = waLink(
    `Heyy GHARPAYY 👋  ${context ?? "I'm browsing your Insights site"} · please help me find a place.`,
    desk,
  );
  void GHARPAYY_OFFICE_PHONE;

  const Wrap = ({ children }: { children: React.ReactNode }) => (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-50">
      <div className="mx-2 mb-[max(0.5rem,env(safe-area-inset-bottom))] rounded-2xl border border-border/70 bg-background/90 backdrop-blur-2xl shadow-[0_8px_32px_-8px_rgba(0,0,0,0.25)]">
        <div className="grid grid-cols-3 gap-1 p-1.5">{children}</div>
      </div>
    </div>
  );

  const Tile = ({
    href,
    to,
    label,
    sublabel,
    icon,
    accent,
    onClick,
  }: {
    href?: string;
    to?: string;
    label: string;
    sublabel?: string;
    icon: React.ReactNode;
    accent?: "primary" | "wa" | "muted";
    onClick?: () => void;
  }) => {
    const cls =
      "flex flex-col items-center justify-center gap-0.5 py-2.5 rounded-xl active:scale-[0.97] transition";
    const style =
      accent === "primary"
        ? { background: "var(--gradient-orange)", color: "white" }
        : accent === "wa"
          ? { background: "oklch(0.62 0.14 155)", color: "white" }
          : undefined;
    const muted = accent === "muted" || !accent;
    const inner = (
      <>
        <span className="text-[15px] leading-none">{icon}</span>
        <span className={`text-[10px] font-bold uppercase tracking-wider leading-none ${muted ? "" : ""}`}>
          {label}
        </span>
        {sublabel && <span className="text-[9px] opacity-70 leading-none">{sublabel}</span>}
      </>
    );
    if (to) {
      return (
        <Link to={to as any} className={`${cls} ${muted ? "bg-secondary/60 text-foreground" : ""}`} style={style}>
          {inner}
        </Link>
      );
    }
    return (
      <a
        href={href}
        target={href?.startsWith("http") ? "_blank" : undefined}
        rel={href?.startsWith("http") ? "noreferrer" : undefined}
        onClick={onClick}
        className={`${cls} ${muted ? "bg-secondary/60 text-foreground" : ""}`}
        style={style}
      >
        {inner}
      </a>
    );
  };

  if (variant === "gharpayy") {
    return (
      <Wrap>
        <Tile to="/areas" icon="🛏️" label="PGs" sublabel="from ₹6.5k" />
        <Tile to="/gharpayy" icon="🏡" label="Flats" sublabel="from ₹25k" />
        <Tile href={wa} icon={<WhatsAppIcon className="w-4 h-4" />} label="Expert" accent="wa" />
      </Wrap>
    );
  }

  if (variant === "area") {
    const waA = areaName ? waArea(areaName, med, undefined, slug) : wa;
    return (
      <Wrap>
        <Tile href={waA} icon="🛏️" label="PG here" sublabel="Tour today" accent="primary" />
        <Tile href={GHARPAYY_BOOK_URL} icon="🏡" label="Flat tour" />
        <Tile href={waA} icon={<WhatsAppIcon className="w-4 h-4" />} label="Expert" accent="wa" />
      </Wrap>
    );
  }

  if (variant === "dual") {
    return (
      <Wrap>
        <Tile to="/areas" icon="🛏️" label="PG today" sublabel="Move this week" accent="primary" />
        <Tile to="/gharpayy" icon="🏡" label="Flat" sublabel="In 7 days" />
        <Tile href={wa} icon={<WhatsAppIcon className="w-4 h-4" />} label="WhatsApp" accent="wa" />
      </Wrap>
    );
  }

  // insights default
  return (
    <Wrap>
      <Tile to="/areas" icon="📍" label="Areas" />
      <Tile to="/map" icon="🗺️" label="Map" accent="primary" />
      <Tile href={waConcierge("from the Insights site")} icon={<WhatsAppIcon className="w-4 h-4" />} label="WhatsApp" accent="wa" />
    </Wrap>
  );
}

