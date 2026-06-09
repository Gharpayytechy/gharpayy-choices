export function BrandLogo({ className = "" }: { className?: string }) {
  return (
    <a href="/" className={`flex items-center gap-2.5 group ${className}`}>
      <span
        className="grid place-items-center w-8 h-8 rounded-lg text-white font-bold font-[family-name:var(--font-display)] shadow-[var(--shadow-glow)] group-hover:scale-105 transition"
        style={{ background: "var(--gradient-orange)" }}
      >
        G
      </span>
      <span className="font-[family-name:var(--font-display)] font-bold text-lg tracking-tight text-ink">
        Gharpayy
      </span>
      <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-md bg-secondary text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
        Insights
      </span>
    </a>
  );
}
