import { useEffect, useState } from "react";
import { AREAS } from "@/lib/areas-meta";
import { waAddRent } from "@/lib/wa";
import { inr } from "@/lib/format";

// In-page rent submission. No WhatsApp required to submit · just 30 seconds
// in the browser. We persist to localStorage so the user sees their pin
// "live" in the map immediately; a WhatsApp confirmation is optional.

type Submission = {
  id: string;
  area: string;
  society?: string;
  bhk: string;
  rent: number;
  furnished: boolean;
  gated: boolean;
  sqft?: number;
  feedback?: string;
  ts: number;
};

const STORAGE_KEY = "gp_insights_submissions_v1";

export function loadSubmissions(): Submission[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}

function saveSubmission(s: Submission) {
  const all = loadSubmissions();
  all.unshift(s);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all.slice(0, 50)));
  window.dispatchEvent(new CustomEvent("gp:submission", { detail: s }));
}

export function AddRentForm({ open, onClose, defaultArea }: { open: boolean; onClose: () => void; defaultArea?: string }) {
  const [step, setStep] = useState(1);
  const [area, setArea] = useState(defaultArea ?? "");
  const [society, setSociety] = useState("");
  const [bhk, setBhk] = useState("2");
  const [rent, setRent] = useState<number | "">("");
  const [furnished, setFurnished] = useState<"f" | "u">("f");
  const [gated, setGated] = useState(true);
  const [sqft, setSqft] = useState<number | "">("");
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState<Submission | null>(null);

  useEffect(() => {
    if (open) { setStep(1); setSubmitted(null); }
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const valid = !!(area && bhk && typeof rent === "number" && rent >= 3000 && rent <= 500000);

  function submit() {
    if (!valid || typeof rent !== "number") return;
    const s: Submission = {
      id: Math.random().toString(36).slice(2, 10),
      area, society: society || undefined, bhk, rent,
      furnished: furnished === "f", gated,
      sqft: typeof sqft === "number" ? sqft : undefined,
      feedback: feedback || undefined,
      ts: Date.now(),
    };
    saveSubmission(s);
    setSubmitted(s);
    setStep(3);
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full sm:max-w-lg bg-card rounded-t-3xl sm:rounded-3xl shadow-2xl border border-primary/20 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 px-6 py-4 border-b bg-card/95 backdrop-blur flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-widest text-primary">Add your rent</div>
            <div className="text-base font-bold text-ink">{step === 3 ? "🎉 Pinned to the map" : `Step ${step} of 2 · 30 seconds`}</div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-secondary text-muted-foreground" aria-label="Close">✕</button>
        </div>

        {step === 1 && (
          <div className="p-6 space-y-4">
            <Field label="Area *">
              <select value={area} onChange={(e) => setArea(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border bg-card focus:ring-2 focus:ring-primary/30 outline-none">
                <option value="">Pick your area…</option>
                {[...AREAS].sort((a, b) => a.name.localeCompare(b.name)).map((a) => (
                  <option key={a.slug} value={a.name}>{a.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Society / building (optional)">
              <input value={society} onChange={(e) => setSociety(e.target.value)} placeholder="e.g. Prestige Lakeside, SNN Raj…" maxLength={80} className="w-full px-3 py-2.5 rounded-lg border bg-card focus:ring-2 focus:ring-primary/30 outline-none" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="BHK *">
                <div className="flex gap-1 rounded-full bg-secondary p-1">
                  {["1", "2", "3", "4"].map((b) => (
                    <button key={b} type="button" onClick={() => setBhk(b)} className={`flex-1 px-2 py-1.5 text-sm rounded-full transition ${bhk === b ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground"}`}>{b}</button>
                  ))}
                </div>
              </Field>
              <Field label="Monthly rent (₹) *">
                <input type="number" value={rent} onChange={(e) => setRent(e.target.value === "" ? "" : Math.max(0, +e.target.value))} placeholder="35000" min={3000} max={500000} className="w-full px-3 py-2.5 rounded-lg border bg-card num focus:ring-2 focus:ring-primary/30 outline-none" />
              </Field>
            </div>
            <div className="flex justify-end pt-2">
              <button disabled={!area || !bhk || typeof rent !== "number" || rent < 3000} onClick={() => setStep(2)} className="px-5 py-2.5 rounded-full font-semibold text-white shadow-[var(--shadow-glow)] disabled:opacity-40 disabled:cursor-not-allowed transition" style={{ background: "var(--gradient-orange)" }}>
                Next →
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="p-6 space-y-4">
            <Field label="Furnishing">
              <div className="flex gap-1 rounded-full bg-secondary p-1 w-fit">
                {([["f", "🛋  Furnished"], ["u", "📦 Unfurnished"]] as const).map(([k, l]) => (
                  <button key={k} type="button" onClick={() => setFurnished(k)} className={`px-3 py-1.5 text-xs rounded-full transition ${furnished === k ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground"}`}>{l}</button>
                ))}
              </div>
            </Field>
            <Field label="Society type">
              <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={gated} onChange={(e) => setGated(e.target.checked)} className="w-4 h-4 accent-[oklch(0.715_0.185_45)]" />
                🔒 Gated society (security, amenities)
              </label>
            </Field>
            <Field label="Carpet area in sqft (optional)">
              <input type="number" value={sqft} onChange={(e) => setSqft(e.target.value === "" ? "" : +e.target.value)} placeholder="1100" min={150} max={10000} className="w-full px-3 py-2.5 rounded-lg border bg-card num focus:ring-2 focus:ring-primary/30 outline-none" />
            </Field>
            <Field label="Anything to share with neighbours? (optional)">
              <textarea value={feedback} onChange={(e) => setFeedback(e.target.value.slice(0, 200))} placeholder="e.g. great society but pet-unfriendly; landlord asked 12 mo deposit." rows={2} maxLength={200} className="w-full px-3 py-2.5 rounded-lg border bg-card focus:ring-2 focus:ring-primary/30 outline-none resize-none" />
              <div className="text-[10px] text-muted-foreground mt-0.5 text-right num">{feedback.length}/200</div>
            </Field>

            <div className="rounded-xl bg-secondary/50 border border-border/60 p-3 text-xs">
              <div className="font-semibold text-foreground mb-1">Privacy</div>
              <div className="text-muted-foreground">Your name, contact, exact address · none of it is collected. Only area, BHK, rent, and furnishing show up on the map. ✓ Anonymous by design.</div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button onClick={() => setStep(1)} className="text-sm text-muted-foreground hover:text-foreground">← Back</button>
              <button disabled={!valid} onClick={submit} className="px-5 py-2.5 rounded-full font-bold text-white shadow-[var(--shadow-glow)] disabled:opacity-40 transition" style={{ background: "var(--gradient-orange)" }}>
                Pin it on the map →
              </button>
            </div>
          </div>
        )}

        {step === 3 && submitted && (
          <div className="p-6 space-y-4">
            <div className="rounded-2xl border-2 border-[oklch(0.62_0.14_155)]/40 bg-[oklch(0.62_0.14_155)]/8 p-5 text-center">
              <div className="text-4xl">📍</div>
              <div className="mt-2 font-bold text-lg text-ink">Your pin is live</div>
              <div className="mt-1 text-sm text-muted-foreground">
                <span className="num font-semibold text-foreground">{inr(submitted.rent)}</span> · {submitted.bhk} BHK · {submitted.area}
                {submitted.society ? ` · ${submitted.society}` : ""}
              </div>
              <div className="mt-2 text-[11px] text-muted-foreground">Anonymised. Thanks for keeping Bengaluru honest 🙏</div>
            </div>

            <div className="text-sm text-muted-foreground">
              Want Gharpayy to send you matching options in <strong className="text-foreground">{submitted.area}</strong>?
            </div>
            <div className="grid grid-cols-1 gap-2">
              <a href={waAddRent(submitted)} target="_blank" rel="noreferrer" className="text-center px-4 py-2.5 rounded-full font-semibold text-white bg-[oklch(0.62_0.14_155)] hover:opacity-90">
                💬 Tell Gharpayy on WhatsApp (optional)
              </a>
              <button onClick={onClose} className="px-4 py-2 rounded-full font-semibold border bg-card hover:bg-secondary text-sm">
                Done · back to the map
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">{label}</div>
      {children}
    </label>
  );
}
