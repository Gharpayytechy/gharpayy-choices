// @ts-nocheck
import { useState } from "react";
import { AdminShell, Panel } from "@/flatmates/frontend/admin/AdminShell";
import { SCHEMAS, SCHEMA_GROUPS, schemaStats, mongooseSource, allMongooseSource, schemaJson } from "@/flatmates/backend/schemas/mongo";
import { Copy, Download, Database } from "lucide-react";

function download(name: string, body: string, type = "text/plain") {
  const url = URL.createObjectURL(new Blob([body], { type }));
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

export default function AdminSchemas() {
  const stats = schemaStats();
  const [active, setActive] = useState(SCHEMAS[0].key);
  const [tab, setTab] = useState("fields");
  const def = SCHEMAS.find((s) => s.key === active)!;

  return (
    <AdminShell
      title="Data schemas"
      sub={`${stats.collections} MongoDB collections · ${stats.fields} fields · ${stats.indexes} indexes · ${stats.stateMachines} state machines`}
      action={
        <div className="flex gap-2">
          <button onClick={() => download("gharpayy-schemas.json", schemaJson(), "application/json")} className="h-9 px-3 rounded-xl border border-border text-xs font-semibold inline-flex items-center gap-1.5"><Download className="w-3.5 h-3.5" /> JSON</button>
          <button onClick={() => download("gharpayy-models.ts", allMongooseSource())} className="h-9 px-3 rounded-xl bg-primary text-primary-foreground text-xs font-semibold inline-flex items-center gap-1.5"><Download className="w-3.5 h-3.5" /> Mongoose models</button>
        </div>
      }
    >
      <div className="grid lg:grid-cols-[260px_1fr] gap-4">
        <div className="space-y-3">
          {SCHEMA_GROUPS.map((g) => (
            <div key={g}>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-1.5">{g}</p>
              <div className="space-y-1">
                {SCHEMAS.filter((s) => s.group === g).map((s) => (
                  <button key={s.key} onClick={() => setActive(s.key)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${active === s.key ? "bg-primary text-primary-foreground" : "bg-card border border-border hover:border-primary"}`}>
                    {s.title}
                    <span className={`block text-[10px] font-normal mt-0.5 ${active === s.key ? "opacity-75" : "text-muted-foreground"}`}>{s.collection} · {Object.keys(s.fields).length} fields</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <Panel title={def.title} sub={`collection: ${def.collection}`}>
            <div className="space-y-2 text-sm">
              <p><span className="font-semibold">Why it exists:</span> <span className="text-muted-foreground">{def.why}</span></p>
              <p><span className="font-semibold">Owns:</span> <span className="text-muted-foreground">{def.owns}</span></p>
              <p><span className="font-semibold">Never stores:</span> <span className="text-muted-foreground">{def.neverStore}</span></p>
              <p><span className="font-semibold">How data arrives:</span> <span className="text-muted-foreground">{def.source}</span></p>
              <p><span className="font-semibold">Access:</span> <span className="text-muted-foreground">read → {def.access.read.join(", ")} · write → {def.access.write.join(", ")}</span></p>
              {def.links && <p><span className="font-semibold">Linked to:</span> <span className="text-muted-foreground">{def.links.join(" · ")}</span></p>}
            </div>
          </Panel>

          <div className="flex gap-1">
            {["fields", "indexes", "states", "mongoose"].map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize ${tab === t ? "bg-primary text-primary-foreground" : "bg-card border border-border"}`}>{t}</button>
            ))}
          </div>

          {tab === "fields" && (
            <Panel title="Fields">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="text-left text-muted-foreground">
                    <th className="py-1.5 pr-3">Field</th><th className="py-1.5 pr-3">Type</th><th className="py-1.5 pr-3">Req</th><th className="py-1.5">Notes</th>
                  </tr></thead>
                  <tbody>
                    {Object.entries(def.fields).map(([name, f]: any) => (
                      <tr key={name} className="border-t border-border/60 align-top">
                        <td className="py-1.5 pr-3 font-mono font-semibold">{name}</td>
                        <td className="py-1.5 pr-3 font-mono text-muted-foreground">{f.type}{f.ref ? ` → ${f.ref}` : ""}</td>
                        <td className="py-1.5 pr-3">{f.req ? "yes" : ""}</td>
                        <td className="py-1.5 text-muted-foreground">
                          {f.note}
                          {f.enum && <span className="block font-mono text-[10px] mt-0.5">{f.enum.join(" | ")}</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          )}

          {tab === "indexes" && (
            <Panel title="Indexes" sub="Every index maps to a query the product actually makes">
              <ul className="space-y-1.5">
                {def.indexes.map((i) => <li key={i} className="font-mono text-xs bg-muted rounded-lg px-3 py-2">{i}</li>)}
              </ul>
            </Panel>
          )}

          {tab === "states" && (
            <Panel title="State machine">
              {def.states?.length ? (
                <div className="space-y-2">
                  {def.states.map((s) => (
                    <div key={s.name} className="rounded-xl border border-border p-3">
                      <p className="text-xs font-semibold">{s.name} → {s.to.join(" | ") || "terminal"}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{s.trigger}</p>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-muted-foreground">This collection has no lifecycle — it is a record of fact.</p>}
            </Panel>
          )}

          {tab === "mongoose" && (
            <Panel title="Mongoose model" sub="Copy-paste ready" >
              <button onClick={() => navigator.clipboard?.writeText(mongooseSource(def))} className="mb-2 h-8 px-3 rounded-lg border border-border text-xs font-semibold inline-flex items-center gap-1.5"><Copy className="w-3.5 h-3.5" /> Copy</button>
              <pre className="text-[11px] leading-relaxed bg-muted rounded-xl p-3 overflow-x-auto whitespace-pre">{mongooseSource(def)}</pre>
            </Panel>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
