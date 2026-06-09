import type { ReactNode } from "react";

export function Stat({ label, value, sub, icon, accent }: {
  label: string; value: string; sub?: string; icon?: ReactNode; accent?: boolean;
}) {
  return (
    <div className={`rounded-xl border bg-card p-5 shadow-[var(--shadow-card)] ${accent ? "border-primary/30" : ""}`}>
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{label}</div>
        {icon && <span className={accent ? "text-primary" : "text-muted-foreground"}>{icon}</span>}
      </div>
      <div className={`mt-3 text-3xl font-bold num ${accent ? "text-primary" : "text-ink"}`}>{value}</div>
      {sub && <div className="mt-1 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}
