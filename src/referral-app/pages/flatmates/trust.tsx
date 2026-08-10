// @ts-nocheck
import { FMShell, Card, Pill, Section, Btn, Meter, KPI } from "@/referral-app/components/flatmates/Shell";
import { getMe, setMe, useFM, track, pushNotif } from "@/referral-app/lib/flatmates/store";
import { ShieldCheck, Phone, Mail, Briefcase, IdCard, Camera, Lock } from "lucide-react";

const LEVELS = [
  { key: "phone", icon: Phone, label: "Phone number", why: "Stops throwaway accounts. Required before you can message anyone.", lift: "Baseline trust" },
  { key: "email", icon: Mail, label: "Email", why: "Lets us recover your account and send visit confirmations.", lift: "+5% reply rate" },
  { key: "work", icon: Briefcase, label: "Workplace or college", why: "The single strongest signal households look for. Never shown publicly — only the company name.", lift: "+38% reply rate" },
  { key: "id", icon: IdCard, label: "Government ID", why: "Unlocks the Verified badge and priority ranking in every match list.", lift: "3× more shortlists" },
  { key: "photo", icon: Camera, label: "Profile photo", why: "Profiles without a photo get skipped nine times out of ten.", lift: "+62% profile views" },
];

export default function FMTrust() {
  const me = useFM(() => getMe());
  const v = me.verified || {};
  const done = LEVELS.filter((l) => (l.key === "photo" ? !!me.photo : !!v[l.key])).length;
  const pct = Math.round((done / LEVELS.length) * 100);
  const tier = pct >= 100 ? "Fully verified" : pct >= 60 ? "Verified" : pct >= 40 ? "Partly verified" : "Unverified";

  const verify = (key: string) => {
    if (key === "photo") setMe({ photo: "seeded" });
    else setMe({ verified: { ...v, [key]: true } });
    track("verification_completed", { key });
    pushNotif({ type: "match", title: "Trust level increased", body: "You now rank higher in every match list.", link: "/flatmates/trust" });
  };

  return (
    <FMShell title="Trust centre" sub="You choose how much you reveal" back="/flatmates/you">
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <Pill tone={pct >= 60 ? "green" : "amber"}><ShieldCheck className="w-3 h-3" />{tier}</Pill>
            <p className="font-display text-2xl font-bold mt-2 tabular-nums">{pct}%</p>
            <p className="text-xs text-muted-foreground">{done} of {LEVELS.length} checks complete</p>
          </div>
          <div className="w-28">
            <Meter value={pct} tone={pct >= 60 ? "good" : "warn"} />
            <p className="text-[10px] text-muted-foreground mt-1.5 text-right">Higher trust = higher ranking</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-2 mt-3">
        <KPI label="Reply rate" value={`${40 + done * 11}%`} tone="primary" />
        <KPI label="Shortlists" value={`${Math.max(1, done * 3)}×`} hint="vs unverified" />
        <KPI label="Rank boost" value={`+${done * 8}`} hint="match positions" />
      </div>

      <Section title="Your verification levels" eyebrow="Build trust" sub="Each one is optional. Nothing is shown publicly unless you allow it.">
        <div className="space-y-2">
          {LEVELS.map((l) => {
            const on = l.key === "photo" ? !!me.photo : !!v[l.key];
            return (
              <Card key={l.key} className={`p-4 ${on ? "border-emerald-200 bg-emerald-50/40" : ""}`}>
                <div className="flex items-start gap-3">
                  <span className={`w-9 h-9 rounded-xl grid place-items-center shrink-0 ${on ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
                    <l.icon className="w-4 h-4" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{l.label}</p>
                      {on ? <Pill tone="green">Verified</Pill> : <Pill tone="orange">{l.lift}</Pill>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{l.why}</p>
                  </div>
                </div>
                {!on && <Btn variant="primary" className="w-full mt-3" onClick={() => verify(l.key)}>Verify {l.label.toLowerCase()}</Btn>}
              </Card>
            );
          })}
        </div>
      </Section>

      <Section title="What we never do" eyebrow="Privacy">
        <Card className="p-4 space-y-2">
          {[
            "Your phone number is never shown until you choose to reveal it in a chat.",
            "Your ID document is never visible to other users — only a Verified badge.",
            "We never share your exact address in a public listing, only the micro-market.",
            "No payment ever passes through another user's account.",
          ].map((t) => (
            <p key={t} className="text-sm text-muted-foreground flex gap-2"><Lock className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />{t}</p>
          ))}
        </Card>
      </Section>
    </FMShell>
  );
}
