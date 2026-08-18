// @ts-nocheck
import { useEffect } from "react";
import { Link } from "wouter";
import { FMShell, Section, Card, Pill, KPI, Btn, money, shortDate } from "@/flatmates/frontend/components/Shell";
import {
  Rooms, Flats, Interests, useFM, getActorId, acceptInterest, declineInterest, requestsForMyListings,
} from "@/flatmates/backend/store/store";
import { currentActor } from "@/flatmates/backend/store/actors";
import { seedFlatmates } from "@/flatmates/backend/store/seed";
import { CheckCircle2, XCircle, Eye, Plus, MessageCircle } from "lucide-react";
import { waListMyProperty } from "@/lib/wa";

/** Give every owner account a couple of real requests to act on. */
function ensureOwnerRequests(actorId: string, listings: any[]) {
  if (!listings.length) return;
  const existing = Interests.allRaw().filter((i: any) => i.to === actorId);
  if (existing.length) return;
  const from = [
    { name: "Aarav Menon", note: "Hi! Is this still available from the 1st? I work at Microsoft, hybrid.", reasons: ["Budget match", "Same area"] },
    { name: "Sara Iyer", note: "Loved the photos — can I visit this weekend?", reasons: ["Move-in date fits", "Verified profile"] },
  ];
  from.forEach((f, idx) => {
    const l = listings[idx % listings.length];
    Interests.create({
      actor: idx === 0 ? "seeker_aarav" : "seeker_sara",
      to: actorId,
      kind: l.kind || (l.bhk && !l.roomType ? "flat" : "room"),
      refId: l.id,
      title: `${f.name} · ${l.title}`,
      direction: "in",
      status: "pending",
      reasons: f.reasons,
      note: f.note,
      at: new Date(Date.now() - (idx + 1) * 3 * 3600000).toISOString(),
    });
  });
}

export default function OwnerDashboard() {
  const actor = useFM(() => currentActor());
  const data = useFM(() => {
    const me = getActorId();
    return {
      rooms: Rooms.all().filter((r: any) => r.ownerActor === me),
      flats: Flats.all().filter((f: any) => f.ownerActor === me),
      requests: requestsForMyListings(),
    };
  });

  useEffect(() => { seedFlatmates(); }, []);
  useEffect(() => {
    ensureOwnerRequests(getActorId(), [...Rooms.all().filter((r: any) => r.ownerActor === getActorId()), ...Flats.all().filter((f: any) => f.ownerActor === getActorId())]);
  }, [actor.id]);

  const listings = [...data.rooms, ...data.flats];
  const pending = data.requests.filter((r: any) => r.status === "pending");
  const accepted = data.requests.filter((r: any) => r.status === "accepted");

  return (
    <FMShell title={`${actor.label}'s supply desk`} sub={actor.tagline} tab="you" wide>
      <div className="grid grid-cols-4 gap-2 mb-6">
        <KPI label="Live listings" value={listings.length} tone="primary" />
        <KPI label="Requests" value={data.requests.length} />
        <KPI label="Awaiting you" value={pending.length} tone={pending.length ? "primary" : "default"} hint="respond in 48h" />
        <KPI label="Chats open" value={accepted.length} tone="good" />
      </div>

      <Card className="p-4 mb-6 border-primary/25 bg-primary/[0.05]">
        <p className="font-semibold text-sm">Add a property</p>
        <p className="text-xs text-muted-foreground mt-1 leading-5">
          Post it yourself in two minutes, or send the details on WhatsApp and our team lists it for you.
        </p>
        <div className="flex flex-wrap gap-2 mt-3">
          <Link href="/flatmates/post" className="h-10 px-4 rounded-xl bg-primary text-primary-foreground grid place-items-center text-sm font-semibold">
            Add property in app
          </Link>
          <a href={waListMyProperty()} target="_blank" rel="noopener noreferrer"
            className="h-10 px-4 rounded-xl bg-[#25D366] text-white grid place-items-center text-sm font-semibold">
            List on WhatsApp
          </a>
        </div>
      </Card>

      <Section title="Requests to your listings" eyebrow="Screening" sub="Nobody can message you until you accept. Decline is one tap and always gives a reason.">
        {pending.length === 0 ? (
          <Card className="p-5 text-sm text-muted-foreground">No requests waiting. New ones land here the moment a seeker applies.</Card>
        ) : (
          <div className="space-y-3">
            {pending.map((r: any) => (
              <Card key={r.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-display font-semibold truncate">{r.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{r.note}</p>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {(r.reasons || []).map((x: string) => <Pill key={x} tone="green">{x}</Pill>)}
                    </div>
                  </div>
                  <Pill tone="amber">Pending</Pill>
                </div>
                <div className="flex gap-2 mt-4">
                  <Btn onClick={() => acceptInterest(r.id)} className="flex-1"><CheckCircle2 className="w-4 h-4" /> Accept & open chat</Btn>
                  <Btn variant="secondary" onClick={() => declineInterest(r.id, "Room already committed")}><XCircle className="w-4 h-4" /> Decline</Btn>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Section>

      {accepted.length > 0 && (
        <Section title="Conversations you opened" eyebrow="Live">
          <div className="space-y-2">
            {accepted.map((r: any) => (
              <Link key={r.id} href={r.threadId ? `/flatmates/chat/${r.threadId}` : "/flatmates/inbox"} className="block">
                <Card className="p-3 flex items-center gap-3">
                  <MessageCircle className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold flex-1 truncate">{r.title}</span>
                  <Pill tone="green">Accepted</Pill>
                </Card>
              </Link>
            ))}
          </div>
        </Section>
      )}

      <Section
        title="Your listings"
        eyebrow="Supply"
        action={<Link href="/flatmates/post" className="text-xs font-semibold text-primary inline-flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Post</Link>}
      >
        {listings.length === 0 ? (
          <Card className="p-5 text-sm text-muted-foreground">Nothing listed yet — post a room or a whole flat and it appears in Discover instantly.</Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {listings.map((l: any) => (
              <Card key={l.id} className="p-4 fm-lift">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-display font-semibold truncate">{l.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{l.area} · {l.roomType || `${l.bhk} BHK`} · available {shortDate(l.availableFrom)}</p>
                  </div>
                  <p className="font-display font-bold text-primary whitespace-nowrap">{money(l.rent)}</p>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  <Pill tone="green">{l.status || "LIVE"}</Pill>
                  <Pill>{data.requests.filter((r: any) => r.refId === l.id).length} requests</Pill>
                </div>
                <Link href={l.bhk && !l.roomType ? `/flatmates/flat/${l.id}` : `/flatmates/room/${l.id}`} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                  <Eye className="w-3.5 h-3.5" /> View as a seeker sees it
                </Link>
              </Card>
            ))}
          </div>
        )}
      </Section>
    </FMShell>
  );
}
