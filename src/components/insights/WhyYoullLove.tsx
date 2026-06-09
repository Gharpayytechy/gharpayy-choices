/**
 * "3 reasons you'll love this" · drop above any module to set wow expectation.
 * Mobile-first, semantic-token-only, no external deps.
 */
type Reason = { icon: string; title: string; sub: string };

export function WhyYoullLove({
  eyebrow = "Why you'll love this",
  reasons,
}: {
  eyebrow?: string;
  reasons: [Reason, Reason, Reason];
}) {
  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-5 w-full">
      <div className="rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-4 md:p-5">
        <div className="text-[11px] font-bold uppercase tracking-widest text-primary mb-3">
          {eyebrow}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {reasons.map((r, i) => (
            <div
              key={i}
              className="rounded-xl bg-card border p-3.5 flex items-start gap-3 hover:border-primary/40 transition"
            >
              <div className="text-2xl shrink-0">{r.icon}</div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-ink leading-tight">{r.title}</div>
                <div className="mt-1 text-xs text-muted-foreground leading-snug">{r.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
