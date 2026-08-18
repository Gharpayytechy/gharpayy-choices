// @ts-nocheck
import { Link } from "wouter";
import { FMShell, Card, Pill, Section, LinkBtn, Btn, shortDate } from "@/flatmates/frontend/components/Shell";
import { useFM, Meetings, Interests } from "@/flatmates/backend/store/store";
import { CalendarDays, MapPin, ShieldCheck, Clock } from "lucide-react";

export default function FMMeetings() {
  const meetings = useFM(() => Meetings.all());
  const interests = useFM(() => Interests.all());
  const upcoming = meetings.filter((m: any) => m.status !== "done");
  const done = meetings.filter((m: any) => m.status === "done");

  return (
    <FMShell title="Your meets" sub={`${upcoming.length} upcoming · ${done.length} completed`} back="/flatmates/you">
      <Section title="Upcoming" sub="Visits and flatmate meets you've locked in">
        {!upcoming.length ? (
          <Card className="p-6 text-center">
            <CalendarDays className="w-6 h-6 mx-auto text-muted-foreground" />
            <p className="font-display font-semibold mt-2">No meets scheduled</p>
            <p className="text-sm text-muted-foreground mt-1">
              You have {interests.length} open conversations. Meeting in person is the single biggest step towards closing a move.
            </p>
            <LinkBtn href="/flatmates/schedule" variant="primary" className="mt-4 w-full">Schedule a meet</LinkBtn>
          </Card>
        ) : (
          <div className="space-y-2">
            {upcoming.map((m: any) => (
              <Card key={m.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold tracking-tight truncate">{m.title || "Flatmate meet"}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Clock className="w-3 h-3" />{m.date ? shortDate(m.date) : "Date TBD"} · {m.time || m.slot || "Time TBD"}
                    </p>
                    {m.place && <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3" />{m.place}</p>}
                  </div>
                  <Pill tone="green">{m.status || "confirmed"}</Pill>
                </div>
                <div className="flex gap-2 mt-3">
                  <Btn variant="secondary" className="flex-1" onClick={() => Meetings.update(m.id, { status: "done" })}>Mark done</Btn>
                  <Btn variant="ghost" className="px-3" onClick={() => Meetings.del(m.id)}>Cancel</Btn>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Section>

      <Section title="Before you go" eyebrow="Safety">
        <Card className="p-4 space-y-2">
          {[
            "Meet in a public place or in the flat with residents present.",
            "Never pay a token, deposit or rent before you see the room.",
            "Ask for the owner or household to confirm the room is still free that day.",
            "Share your live location with one person you trust.",
          ].map((t) => (
            <p key={t} className="text-sm text-muted-foreground flex gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />{t}
            </p>
          ))}
          <Link href="/flatmates/safety" className="text-xs font-semibold text-primary inline-block pt-1">Full safety centre →</Link>
        </Card>
      </Section>

      {done.length > 0 && (
        <Section title="Completed">
          <div className="space-y-2">
            {done.map((m: any) => (
              <Card key={m.id} className="p-3.5 flex justify-between items-center">
                <div>
                  <p className="text-sm font-semibold">{m.title}</p>
                  <p className="text-xs text-muted-foreground">{shortDate(m.date)}</p>
                </div>
                <Pill>Done</Pill>
              </Card>
            ))}
          </div>
        </Section>
      )}
    </FMShell>
  );
}
