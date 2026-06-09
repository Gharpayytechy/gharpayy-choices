import type { Pitch } from "@/lib/gharpayy-brand";

/** Three-line Gharpayy pitch frame: Why · How · What next.
 *  Wrap any tool, calculator, or admin module with this. */
export function PitchBlock({ eyebrow, title, pitch, dark = false }: {
  eyebrow?: string;
  title?: string;
  pitch: Pitch;
  dark?: boolean;
}) {
  const base = dark
    ? "bg-slate-900/60 border-slate-800 text-slate-200"
    : "bg-card border-border text-foreground";
  return (
    <div className={`rounded-xl border ${base} p-4 md:p-5`}>
      {eyebrow && (
        <div className={`text-[10px] uppercase tracking-widest font-bold ${dark ? "text-orange-400" : "text-primary"}`}>
          {eyebrow}
        </div>
      )}
      {title && <h3 className={`text-base md:text-lg font-bold mt-1 ${dark ? "text-white" : ""}`}>{title}</h3>}
      <dl className="mt-3 grid md:grid-cols-3 gap-3 text-sm">
        <Row label="Why" value={pitch.why} dark={dark} />
        <Row label="How" value={pitch.how} dark={dark} />
        <Row label="What next" value={pitch.next} dark={dark} />
      </dl>
    </div>
  );
}

function Row({ label, value, dark }: { label: string; value: string; dark: boolean }) {
  return (
    <div>
      <dt className={`text-[10px] uppercase font-bold tracking-widest ${dark ? "text-slate-500" : "text-muted-foreground"}`}>{label}</dt>
      <dd className={`mt-1 leading-snug ${dark ? "text-slate-200" : "text-foreground"}`}>{value}</dd>
    </div>
  );
}
