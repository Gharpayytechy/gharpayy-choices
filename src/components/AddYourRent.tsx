import { waListMyProperty } from "@/lib/wa";
import data from "@/data/insights.json";
import { useRentForm } from "./RentFormProvider";

// Five-stage pipeline beats a 0.10% bar · the bar makes the goal feel
// laughable, the pipeline makes it feel inevitable.
const STAGES = [
  { label: "Today",      target: 4_200,     note: "verified rents on the map" },
  { label: "Q1 experts", target: 25_000,    note: "society experts light up 5 hubs" },
  { label: "Census 1",   target: 1_00_000,  note: "first annual rent census" },
  { label: "Open data",  target: 5_00_000,  note: "anonymised CSV goes public" },
  { label: "All renters", target: 40_00_000, note: "every Bengaluru renter pinned" },
];

export function AddYourRent() {
  const pins = (data as any).stats.pins as number;
  const { open } = useRentForm();
  // Find which stage we're in.
  let currentIdx = 0;
  for (let i = 0; i < STAGES.length; i++) if (pins >= STAGES[i].target * 0.9) currentIdx = i;
  const next = STAGES[Math.min(currentIdx + 1, STAGES.length - 1)];

  return (
    <section className="rounded-3xl border-2 border-primary/30 overflow-hidden shadow-[var(--shadow-card)]">
      <div className="grid md:grid-cols-[1.2fr_1fr]">
        <div className="p-8 md:p-10 bg-card">
          <div className="text-xs font-bold uppercase tracking-widest text-primary">The honest goal</div>
          <h2 className="mt-2 text-3xl md:text-4xl font-bold leading-tight text-ink">
            Pin <span className="num">{pins.toLocaleString()}</span> today.{" "}
            Pipeline to <span className="text-primary num">40,00,000</span>.
          </h2>
          <p className="mt-3 text-muted-foreground">
            That's how many people roughly rent in Bengaluru. Today brokers own this number.
            Insights wants <strong className="text-foreground">every renter</strong> to own it instead · pin one rent, anonymous, 30 seconds, no app, no WhatsApp needed.
          </p>

          {/* Pipeline */}
          <div className="mt-6">
            <div className="relative">
              {/* baseline */}
              <div className="absolute left-0 right-0 top-[18px] h-1 bg-secondary rounded-full" />
              <div className="absolute left-0 top-[18px] h-1 rounded-full transition-all"
                   style={{ width: `${(currentIdx / (STAGES.length - 1)) * 100}%`, background: "var(--gradient-orange)" }} />
              <div className="relative grid grid-cols-5 gap-1">
                {STAGES.map((s, i) => {
                  const done = i <= currentIdx;
                  return (
                    <div key={s.label} className="text-center">
                      <div className={`mx-auto w-9 h-9 rounded-full grid place-items-center text-xs font-bold border-2 ${done ? "border-primary text-white shadow-[var(--shadow-glow)]" : "border-border bg-card text-muted-foreground"}`}
                           style={done ? { background: "var(--gradient-orange)" } : undefined}>
                        {done ? "✓" : i + 1}
                      </div>
                      <div className="mt-2 text-[10px] uppercase tracking-wider font-bold text-foreground">{s.label}</div>
                      <div className="text-[11px] num font-semibold text-foreground/80 mt-0.5">
                        {s.target >= 1e5 ? (s.target / 1e5).toFixed(s.target >= 1e6 ? 0 : 1) + "L" : (s.target / 1000).toFixed(0) + "k"}
                      </div>
                      <div className="hidden md:block text-[10px] text-muted-foreground mt-0.5 leading-tight">{s.note}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="mt-4 text-xs text-muted-foreground">
              Next milestone: <strong className="text-foreground num">{next.target.toLocaleString()}</strong> rents · {next.note}.
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2.5">
            <button onClick={() => open()} className="inline-flex items-center gap-2 px-5 py-3 rounded-full font-bold text-white shadow-[var(--shadow-glow)] hover:opacity-95 transition" style={{ background: "var(--gradient-orange)" }}>
              ➕ Add your rent · 30 sec
            </button>
            <a href={waListMyProperty()} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-5 py-3 rounded-full font-semibold border-2 border-primary/40 text-primary bg-primary/5 hover:bg-primary/10 transition">
              🏠 Owner? List -fee
            </a>
          </div>
          <div className="mt-3 text-[11px] text-muted-foreground">
            ✓ No login · ✓ No WhatsApp required · ✓ Anonymous · ✓ Your pin shows on the map instantly
          </div>
        </div>

        <div className="p-8 md:p-10 text-white relative overflow-hidden" style={{ background: "var(--gradient-orange)" }}>
          <div className="text-xs font-bold uppercase tracking-widest text-white/80">How we get to 40 lakh</div>
          <ul className="mt-3 space-y-3 text-sm">
            <Bullet t="Submit-in-browser" d="30-second form, no app, no chat. The lowest-friction add flow on the planet." />
            <Bullet t="Society experts" d="One contributor per society pings 5 neighbours. 50,000 societies × 5 = 2.5L+ rents." />
            <Bullet t="Owner imports" d="Owners listing -fee on Gharpayy auto-contribute their actual rents." />
            <Bullet t="Annual rent census" d="Every May, neighbours re-ping. Rent inflation tracked in public, not hidden." />
            <Bullet t="Open dataset" d="Anonymised CSV downloadable for researchers · Insights stays a public good." />
          </ul>
        </div>
      </div>
    </section>
  );
}

function Bullet({ t, d }: { t: string; d: string }) {
  return (
    <li className="flex gap-2.5">
      <span className="mt-0.5">✓</span>
      <div>
        <div className="font-semibold">{t}</div>
        <div className="text-white/80 text-[12.5px]">{d}</div>
      </div>
    </li>
  );
}
