// @ts-nocheck
import { Link } from "wouter";
import { FMShell, Card, Section, LinkBtn, Pill, money } from "@/referral-app/components/flatmates/Shell";
import { PersonCard, RoomCard, FlatCard } from "@/referral-app/components/flatmates/Cards";
import { getMe, useFM, Saves, People, Rooms, Flats, Interests } from "@/referral-app/lib/flatmates/store";
import { Bookmark } from "lucide-react";

export default function FMSaved() {
  const me = useFM(() => getMe());
  const d = useFM(() => ({ saves: Saves.all(), people: People.all(), rooms: Rooms.all(), flats: Flats.all(), interests: Interests.all() }));

  const pick = (kind: string) => d.saves.filter((s: any) => s.kind === kind).map((s: any) =>
    (kind === "person" ? d.people : kind === "flat" ? d.flats : d.rooms).find((x: any) => x.id === s.refId)).filter(Boolean);

  const rooms = pick("room"), people = pick("person"), flats = pick("flat");
  const total = rooms.length + people.length + flats.length;

  return (
    <FMShell title="Saved" sub={`${total} shortlisted · ${d.interests.length} interests sent`} back="/flatmates/you">
      {!total && (
        <Card className="p-8 text-center">
          <Bookmark className="w-6 h-6 mx-auto text-muted-foreground" />
          <p className="font-display font-semibold mt-2">Nothing shortlisted yet</p>
          <p className="text-sm text-muted-foreground mt-1">Tap the heart on any room or person and it lands here so you can compare properly before you visit.</p>
          <LinkBtn href="/flatmates/discover" variant="primary" className="mt-4 w-full">Browse matches</LinkBtn>
        </Card>
      )}

      {!!rooms.length && (
        <Section title="Rooms" sub="Compare rent, deposit and total monthly outgo before you visit">
          <Card className="p-0 overflow-hidden mb-3">
            {rooms.map((r: any, i: number) => (
              <Link key={r.id} href={`/flatmates/room/${r.id}`} className={`flex items-center gap-3 p-3 ${i ? "border-t border-border" : ""}`}>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate">{r.title}</p>
                  <p className="text-[11px] text-muted-foreground">{r.area} · {r.roomType}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold tabular-nums">{money(r.rent + (r.maintenance || 0) + (r.utilities || 0))}</p>
                  <p className="text-[10px] text-muted-foreground">all-in / month</p>
                </div>
              </Link>
            ))}
          </Card>
          <div className="space-y-3">{rooms.map((r: any) => <RoomCard key={r.id} me={me} r={r} />)}</div>
        </Section>
      )}

      {!!people.length && (
        <Section title="People">
          <div className="space-y-3">{people.map((p: any) => <PersonCard key={p.id} me={me} p={p} />)}</div>
        </Section>
      )}

      {!!flats.length && (
        <Section title="Whole flats">
          <div className="space-y-3">{flats.map((f: any) => <FlatCard key={f.id} me={me} f={f} />)}</div>
        </Section>
      )}

      {total > 1 && (
        <Card className="p-4">
          <Pill tone="orange">Decision nudge</Pill>
          <p className="text-sm text-muted-foreground mt-2">
            Shortlists over 5 items usually stall. Pick your top two, book visits on the same day, and decide that evening — good rooms in tight markets are gone within 48 hours.
          </p>
        </Card>
      )}
    </FMShell>
  );
}
