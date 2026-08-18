// @ts-nocheck
import { useEffect, useState } from "react";
import { AdminShell, Panel, Kpi, Tag } from "./AdminShell";
import { repo, useFM, missionBoard, opsActions, opsLog } from "@/flatmates/backend";

const LANE_TONE: any = { supply: "bad", demand: "warn", trust: "primary", growth: "good" };
const LANES = ["all", "supply", "demand", "trust", "growth"];
const COLUMNS = [
  { key: "open", label: "Open" },
  { key: "doing", label: "In progress" },
  { key: "done", label: "Done" },
];

export default function AdminMissions() {
  useEffect(() => { repo.ensureSeed(); }, []);
  const board = useFM(() => missionBoard());
  const log = useFM(() => opsLog(20));
  const [lane, setLane] = useState("all");

  const rows = board.filter((m: any) => lane === "all" || m.lane === lane);
  const byStatus = (s: string) => rows.filter((m: any) => m.status === s);
  const done = board.filter((m: any) => m.status === "done").length;

  return (
    <AdminShell
      title="Mission control"
      sub="Today's exact moves, generated from live imbalance. Drag-free kanban — just advance each card."
      action={
        <button
          onClick={() => rows.forEach((m: any) => opsActions.setMission(m.id, { status: "open" }))}
          className="px-3 py-2 rounded-xl border border-border text-xs font-semibold"
        >
          Reset board
        </button>
      }
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-4">
        <Kpi label="Missions" value={board.length} tone="primary" />
        <Kpi label="P1 critical" value={board.filter((m: any) => m.priority === 1 && m.status !== "done").length} tone="bad" />
        <Kpi label="In progress" value={board.filter((m: any) => m.status === "doing").length} tone="warn" />
        <Kpi label="Completed" value={done} hint={`${board.length ? Math.round((done / board.length) * 100) : 0}% of board`} tone="good" />
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {LANES.map((l) => (
          <button
            key={l}
            onClick={() => setLane(l)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${lane === l ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"}`}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {COLUMNS.map((col) => (
          <Panel key={col.key} title={col.label} sub={`${byStatus(col.key).length} missions`}>
            <div className="divide-y divide-border">
              {byStatus(col.key).map((m: any) => (
                <div key={m.id} className="p-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Tag tone={LANE_TONE[m.lane]}>{m.lane}</Tag>
                    <Tag tone={m.priority === 1 ? "bad" : m.priority === 2 ? "warn" : "muted"}>P{m.priority}</Tag>
                    <span className="text-[11px] text-muted-foreground">{m.area}</span>
                  </div>
                  <p className="text-sm font-semibold mt-1 leading-snug">{m.title}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{m.why}</p>
                  <div className="flex gap-1.5 mt-2">
                    {col.key !== "open" && (
                      <button
                        onClick={() => opsActions.setMission(m.id, { status: col.key === "done" ? "doing" : "open" })}
                        className="px-2.5 py-1.5 rounded-lg border border-border text-xs font-semibold"
                      >
                        ← Back
                      </button>
                    )}
                    {col.key !== "done" && (
                      <button
                        onClick={() => opsActions.setMission(m.id, { status: col.key === "open" ? "doing" : "done" })}
                        className="px-2.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold"
                      >
                        {col.key === "open" ? "Start" : "Complete"} →
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {!byStatus(col.key).length && <p className="p-6 text-sm text-muted-foreground">Nothing here.</p>}
            </div>
          </Panel>
        ))}
      </div>

      <Panel className="mt-4" title="Ops activity log" sub="Every admin action, newest first.">
        <div className="divide-y divide-border">
          {log.map((l: any) => (
            <div key={l.id} className="px-4 py-2.5 flex items-center gap-3">
              <Tag tone={LANE_TONE[l.lane] || "muted"}>{l.lane}</Tag>
              <p className="text-sm flex-1">{l.text}</p>
              <span className="text-[11px] text-muted-foreground tabular-nums">
                {new Date(l.at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          ))}
          {!log.length && <p className="p-6 text-sm text-muted-foreground">No actions logged yet.</p>}
        </div>
      </Panel>
    </AdminShell>
  );
}
