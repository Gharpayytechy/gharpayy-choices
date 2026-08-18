// @ts-nocheck
import { Link } from "wouter";
import { FMShell, Card, Pill, Btn, timeAgo } from "@/flatmates/frontend/components/Shell";
import { useFM, Notifs } from "@/flatmates/backend/store/store";
import { Bell, Sparkles, CalendarDays, Home, Users } from "lucide-react";

const ICON: any = { match: Sparkles, visit: CalendarDays, supply: Home, household: Home, mutual: Users, interest: Users, request: Users, declined: Users };

export default function FMNotifications() {
  const all = useFM(() => Notifs.all());
  const unread = all.filter((n: any) => !n.read);

  return (
    <FMShell
      title="Notifications"
      sub={unread.length ? `${unread.length} need your attention` : "You're all caught up"}
      back="/flatmates"
      action={unread.length ? <Btn variant="ghost" className="h-8 px-2 text-xs" onClick={() => unread.forEach((n: any) => Notifs.update(n.id, { read: true }))}>Mark all read</Btn> : null}
    >
      {!all.length && (
        <Card className="p-8 text-center">
          <Bell className="w-6 h-6 mx-auto text-muted-foreground" />
          <p className="font-display font-semibold mt-2">Nothing yet</p>
          <p className="text-sm text-muted-foreground mt-1">We'll ping you the moment a strong match appears in your areas.</p>
        </Card>
      )}
      <div className="space-y-2">
        {all.map((n: any) => {
          const Icon = ICON[n.type] || Bell;
          return (
            <Link key={n.id} href={n.link || "/flatmates"} onClick={() => Notifs.update(n.id, { read: true })}>
              <Card className={`p-3.5 flex gap-3 ${n.read ? "" : "border-primary/30 bg-primary/[0.03]"}`}>
                <span className="w-9 h-9 rounded-xl bg-muted grid place-items-center shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm truncate">{n.title}</p>
                    {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{timeAgo(n.at)}</p>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
      {all.length > 0 && (
        <Card className="p-4 mt-5">
          <Pill tone="orange">Why you get these</Pill>
          <p className="text-sm text-muted-foreground mt-2">
            Alerts only fire when an item clears your hard gates — budget ceiling, gender preference, and move-in window. No spam, no filler.
          </p>
        </Card>
      )}
    </FMShell>
  );
}
