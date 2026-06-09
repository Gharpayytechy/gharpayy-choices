import { inr } from "@/lib/format";
import { GHARPAYY_BOOK_URL, waConcierge } from "@/lib/wa";

export function PgVsFlatTable() {
  const rows = [
    { k: "Move-in time", pg: "This week", flat: "5–7 days" },
    { k: "Starting rent", pg: inr(6500), flat: inr(25000) },
    { k: "Deposit", pg: "1 month", flat: "2 months" },
    { k: "Channel", pg: "Direct", flat: "Direct" },
    { k: "Furnishing", pg: "Fully furnished", flat: "Furnished kitchen + AC" },
    { k: "Meals", pg: "Optional add-on", flat: "Self-cook" },
    { k: "Notice period", pg: "30 days", flat: "60 days" },
    { k: "Best for", pg: "Solo, freshers, students", flat: "Couples, families, friends" },
  ];
  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-7 w-full">
      <div className="text-[11px] uppercase tracking-widest text-primary font-bold">PG vs Flat ⚖️</div>
      <h2 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight">Side-by-side, honest</h2>

      <div className="mt-4 hidden sm:block rounded-2xl border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60">
            <tr>
              <th className="text-left p-3 text-[10px] uppercase tracking-wider text-muted-foreground font-bold w-1/3"></th>
              <th className="text-left p-3 text-sm text-ink font-bold">🛏️ Gharpayy PG</th>
              <th className="text-left p-3 text-sm text-ink font-bold">🏡 Gharpayy Home</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.k} className={i % 2 ? "bg-secondary/30" : ""}>
                <td className="p-3 text-xs text-muted-foreground font-semibold">{r.k}</td>
                <td className="p-3 text-sm text-ink num">{r.pg}</td>
                <td className="p-3 text-sm text-ink num">{r.flat}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="mt-4 sm:hidden grid grid-cols-2 gap-2">
        <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-3">
          <div className="text-sm font-bold text-ink">🛏️ PG</div>
          <ul className="mt-2 space-y-1.5 text-xs">
            {rows.map((r) => (
              <li key={r.k}><span className="text-muted-foreground">{r.k}:</span> <span className="font-semibold text-ink">{r.pg}</span></li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border bg-card p-3">
          <div className="text-sm font-bold text-ink">🏡 Flat</div>
          <ul className="mt-2 space-y-1.5 text-xs">
            {rows.map((r) => (
              <li key={r.k}><span className="text-muted-foreground">{r.k}:</span> <span className="font-semibold text-ink">{r.flat}</span></li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <a href={waConcierge("I want to compare PG vs Flat options")} target="_blank" rel="noreferrer" className="inline-flex items-center px-4 py-2.5 rounded-full text-sm font-bold text-white" style={{ background: "oklch(0.62 0.14 155)" }}>WhatsApp expert</a>
        <a href={GHARPAYY_BOOK_URL} target="_blank" rel="noreferrer" className="inline-flex items-center px-4 py-2.5 rounded-full text-sm font-bold text-white" style={{ background: "var(--gradient-orange)" }}>📅 Book a tour</a>
      </div>
    </section>
  );
}
