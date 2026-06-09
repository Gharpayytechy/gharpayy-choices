import { inr, inrFull } from "@/lib/format";
import { waListing } from "@/lib/wa";
import { WhatsAppIcon } from "./Header";

interface Listing {
  r: number; b: string; sq?: number | null; f: boolean; g: boolean;
  s: string; fb: string; area?: string | null; pet?: boolean; lf?: boolean;
}

export function ListingCard({ p }: { p: Listing }) {
  const psqft = p.sq ? Math.round(p.r / p.sq) : null;
  return (
    <div className="rounded-xl border bg-card p-5 shadow-[var(--shadow-card)] hover:border-primary/30 transition flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-2xl num font-bold text-ink">{inr(p.r)}<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
          <div className="text-xs text-muted-foreground mt-0.5 num">{inrFull(p.r)}</div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-bold num">{p.b} BHK</span>
          {p.sq && <span className="text-[10px] num text-muted-foreground">{p.sq} sqft · ₹{psqft}/sqft</span>}
        </div>
      </div>
      {p.s && <div className="mt-3 text-sm font-medium text-foreground line-clamp-1">{p.s}</div>}
      {p.area && <div className="text-xs text-muted-foreground">📍 {p.area}</div>}
      {p.fb && <p className="mt-2 text-xs text-muted-foreground italic line-clamp-2">"{p.fb}"</p>}
      <div className="mt-3 flex flex-wrap gap-1">
        {p.f && <Tag>Furnished</Tag>}
        {p.g && <Tag>Gated</Tag>}
        {p.pet && <Tag>Pet-friendly</Tag>}
        {p.lf && <Tag>Wants flatmate</Tag>}
      </div>
      <a
        href={waListing({ area: p.area, bhk: p.b, rent: p.r })}
        target="_blank" rel="noreferrer"
        className="mt-4 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white bg-[oklch(0.62_0.14_155)] hover:opacity-90 transition"
      >
        <WhatsAppIcon className="w-3.5 h-3.5" /> Ask Gharpayy on WhatsApp
      </a>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="px-2 py-0.5 rounded-full bg-secondary text-[10px] font-medium text-muted-foreground">{children}</span>;
}
