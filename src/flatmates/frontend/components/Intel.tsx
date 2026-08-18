// @ts-nocheck
import { Sparkles, ShieldCheck, AlertTriangle } from "lucide-react";
import { Pill } from "./Shell";
import { trustTier } from "@/flatmates/backend/services/intel";
import { explain } from "@/flatmates/backend/store/match";

export function TrustBadge({ entity, className }: any) {
  const t = trustTier(entity || {});
  return (
    <Pill tone={t.tone} className={className}>
      <ShieldCheck className="w-3 h-3" />
      {t.label} · {t.score}
    </Pill>
  );
}

/** Explainable "why this match" chips, computed live from the match engine. */
export function WhyChips({ me, item, limit = 2, watch = true }: any) {
  const ex = explain(me, item);
  const good = ex.good.slice(0, limit);
  const risk = watch ? ex.discuss.slice(0, 1) : [];
  if (!good.length && !risk.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {good.map((g: string) => (
        <span key={g} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <Sparkles className="w-3 h-3 shrink-0" />{g}
        </span>
      ))}
      {risk.map((r: string) => (
        <span key={r} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
          <AlertTriangle className="w-3 h-3 shrink-0" />{r}
        </span>
      ))}
    </div>
  );
}

export function DealbreakerFlags({ broken = [] }: any) {
  if (!broken.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {broken.map((b: string) => (
        <Pill key={b} tone="red">Breaks: {b}</Pill>
      ))}
    </div>
  );
}
