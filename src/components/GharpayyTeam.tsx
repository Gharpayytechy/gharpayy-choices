import { WA_NUMBERS, GHARPAYY_EMAIL, GHARPAYY_OFFICE_PHONE, waLink, type WaDesk } from "@/lib/wa";
import { WhatsAppIcon } from "./Header";

// Real Gharpayy desk roster, taken from gharpayy.com's "Who Stays With Us?"
// section. Each desk has its own expert / number · Insights routes leads
// to the right one instead of dumping everything to a single inbox.
type Desk = {
  desk: WaDesk;
  emoji: string;
  hub: string;
  covers: string;
  employersOrColleges: string;
  pitch: string;
};

const DESKS: Desk[] = [
  { desk: "concierge", emoji: "🥥", hub: "Koramangala", covers: "Koramangala · BTM · HSR · Indiranagar · Domlur",
    employersOrColleges: "Christ University · Razorpay · Zomato · Ola",
    pitch: "Default Bengaluru concierge. South-Bangalore moves & student PGs." },
  { desk: "bellandur", emoji: "🌊", hub: "Bellandur / ORR", covers: "Bellandur · Marathahalli · Sarjapur Rd · Old Airport Rd",
    employersOrColleges: "Microsoft · Oracle · Adobe · Myntra · Mercedes-Benz",
    pitch: "ORR expert. Walk-to-Ecoworld / Ecospace / ETV stays." },
  { desk: "manyata", emoji: "🌳", hub: "Manyata / Hebbal", covers: "Hebbal · Thanisandra · Hennur · KR Puram · Yelahanka",
    employersOrColleges: "IBM · Target · Nokia · Philips · Cognizant",
    pitch: "North expert. 5-min commute to Manyata Tech Park." },
  { desk: "homes", emoji: "🏡", hub: "Gharpayy Homes", covers: "Super-furnished 1 / 2 BHK flats · all hubs",
    employersOrColleges: "Couples · relocating professionals · families",
    pitch: "Managed flat-rentals from ₹25k. Direct to owner. 7-day move-in." },
  { desk: "allBlr", emoji: "🎓", hub: "All-Bangalore HQ", covers: "City-wide & student PGs",
    employersOrColleges: "Christ · Jain · St Joseph's · Mount Carmel · IISc",
    pitch: "Pan-Bengaluru desk. New movers & student family enquiries." },
];

export function GharpayyTeam() {
  return (
    <div className="rounded-3xl border-2 border-primary/20 bg-card overflow-hidden shadow-[var(--shadow-card)]">
      <div className="px-6 md:px-8 pt-7 pb-5 border-b" style={{ background: "linear-gradient(135deg, oklch(0.985 0.005 70) 0%, oklch(0.97 0.02 45) 100%)" }}>
        <div className="text-[11px] font-bold uppercase tracking-widest text-primary">Real humans, by hub</div>
        <h2 className="mt-1.5 text-2xl md:text-3xl font-bold tracking-tight text-ink">
          Five Gharpayy experts. <span className="text-primary">One per hub.</span>
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground max-w-2xl">
          Not a bot, not an IVR · a small team that actually lives in these neighbourhoods. Pick the expert whose hub matches your move and you'll get an answer within minutes.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border/50">
        {DESKS.map((d) => (
          <div key={d.desk} className="bg-card p-5 hover:bg-primary/5 transition">
            <div className="flex items-start gap-3">
              <div className="text-3xl leading-none">{d.emoji}</div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold uppercase tracking-wider text-primary">{d.hub}</div>
                <div className="text-sm font-semibold text-ink mt-0.5">{d.pitch}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1.5 text-xs">
              <div><span className="text-muted-foreground">Covers:</span> <span className="text-foreground">{d.covers}</span></div>
              <div><span className="text-muted-foreground">Tenants:</span> <span className="text-foreground">{d.employersOrColleges}</span></div>
            </div>
            <div className="mt-3.5 flex items-center justify-between gap-2">
              <a href={`tel:+${WA_NUMBERS[d.desk]}`} className="font-mono text-xs text-foreground/80 hover:text-primary">
                +{WA_NUMBERS[d.desk].replace(/^91/, "91 ")}
              </a>
              <a href={waLink(`Heyy GHARPAYY 👋 I'd like to talk to the *${d.hub}* expert · found you via Insights.`, d.desk)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white bg-[oklch(0.62_0.14_155)] hover:opacity-90">
                <WhatsAppIcon className="w-3 h-3" /> Chat
              </a>
            </div>
          </div>
        ))}

        {/* HQ card */}
        <div className="bg-card p-5">
          <div className="flex items-start gap-3">
            <div className="text-3xl leading-none">🏢</div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold uppercase tracking-wider text-primary">Office · Bengaluru</div>
              <div className="text-sm font-semibold text-ink mt-0.5">For partnerships, owners, press.</div>
            </div>
          </div>
          <div className="mt-3 space-y-1.5 text-xs">
            <div><span className="text-muted-foreground">Email:</span> <a href={`mailto:${GHARPAYY_EMAIL}`} className="text-foreground hover:text-primary">{GHARPAYY_EMAIL}</a></div>
            <div><span className="text-muted-foreground">Phone:</span> <a href={`tel:${GHARPAYY_OFFICE_PHONE.replace(/\s/g, "")}`} className="text-foreground hover:text-primary font-mono">{GHARPAYY_OFFICE_PHONE}</a></div>
            <div><span className="text-muted-foreground">HQ:</span> <span className="text-foreground">Koramangala, Bangalore</span></div>
          </div>
          <div className="mt-3.5 text-[11px] text-muted-foreground">
            👥 Team comes from across India · Delhi · UP · Bihar · Rajasthan · Punjab · Karnataka · Tamil Nadu · Kerala · Telangana. <em>Someone who speaks your language is always close by.</em>
          </div>
        </div>
      </div>
    </div>
  );
}
