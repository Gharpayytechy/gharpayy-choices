import data from "@/data/insights.json";
import { GHARPAYY_URL } from "@/lib/wa";

export function Footer() {
  return (
    <footer className="border-t mt-16 bg-card/40">
      <div className="max-w-7xl mx-auto px-5 py-10 grid md:grid-cols-4 gap-8 text-sm">
        <div>
          <div className="font-[family-name:var(--font-display)] font-bold text-lg text-ink">Gharpayy <span className="text-primary">Insights</span></div>
          <p className="mt-2 text-muted-foreground">Real rents, real neighbours. Bengaluru's open rental dataset.</p>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Explore</div>
          <ul className="space-y-1.5">
            <li><a href="/gharpayy" className="hover:text-primary">Gharpayy (direct to owner)</a></li>
            <li><a href="/areas" className="hover:text-primary">All areas</a></li>
            <li><a href="/listings" className="hover:text-primary">Live listings</a></li>
            <li><a href="/compare" className="hover:text-primary">Compare areas</a></li>
            <li><a href="/seekers" className="hover:text-primary">Flat-hunters</a></li>
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Built on</div>
          <ul className="space-y-1.5 text-muted-foreground">
            <li><span className="num text-foreground">{data.stats.pins.toLocaleString()}</span> verified rents</li>
            <li><span className="num text-foreground">{data.stats.seekers.toLocaleString()}</span> active flat-hunters</li>
            <li><span className="num text-foreground">{data.stats.areas}</span> Bengaluru micro-markets</li>
          </ul>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Gharpayy</div>
          <p className="text-muted-foreground">Direct-to-owner rentals & PG. Verified owners, 24×7 concierge.</p>
          <a href={GHARPAYY_URL} target="_blank" rel="noreferrer" className="inline-block mt-3 px-4 py-1.5 rounded-full text-xs font-semibold text-white" style={{ background: "var(--gradient-orange)" }}>
            Visit gharpayy.com →
          </a>
        </div>
      </div>
      <div className="border-t">
        <div className="max-w-7xl mx-auto px-5 py-4 text-xs text-muted-foreground flex flex-wrap justify-between gap-2">
          <span>© {new Date().getFullYear()} Gharpayy · Insights for Bengaluru renters</span>
          <span className="flex items-center gap-3">
            <span>Data as of May 2026 · Update frequency: live</span>
            <a href="/app" className="hover:text-primary font-semibold">Refer & Earn 💸</a>
            <a href="/app/admin" className="hover:text-primary font-semibold">Admin →</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
