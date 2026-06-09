import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ALL_AREA_LIST } from "@/lib/insights-utils";
import { PERSONAS } from "@/lib/personas";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const nav = useNavigate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!open) return null;

  const ql = q.toLowerCase().trim();
  const areas = ALL_AREA_LIST.filter((a: any) => !ql || a.name.toLowerCase().includes(ql)).slice(0, 6);
  const personas = PERSONAS.filter((p) => !ql || p.title.toLowerCase().includes(ql)).slice(0, 4);
  const tools = [
    { label: "Rent verdict tool", to: "/tools" },
    { label: "Negotiation coach", to: "/tools" },
    { label: "Upgrade path calculator", to: "/tools" },
    { label: "Compare areas", to: "/compare" },
    { label: "Map of Bengaluru", to: "/map" },
    { label: "All hubs", to: "/areas" },
  ].filter((t) => !ql || t.label.toLowerCase().includes(ql));

  return (
    <div className="fixed inset-0 z-[200] bg-background/70 backdrop-blur-sm flex items-start justify-center pt-20 px-4" onClick={() => setOpen(false)}>
      <div className="w-full max-w-xl rounded-2xl border bg-card shadow-[var(--shadow-pop)] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <input
          autoFocus
          placeholder="Search areas, personas, tools…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full px-5 py-4 text-base font-semibold bg-transparent border-b focus:outline-none"
        />
        <div className="max-h-[50vh] overflow-y-auto">
          {areas.length > 0 && (
            <Section title="Hubs">
              {areas.map((a: any) => (
                <Item key={a.slug} onClick={() => { setOpen(false); nav({ to: "/area/$slug", params: { slug: a.slug } }); }}>
                  📍 {a.name} <span className="text-xs text-muted-foreground ml-2">{a.count} pins</span>
                </Item>
              ))}
            </Section>
          )}
          {personas.length > 0 && (
            <Section title="Personas">
              {personas.map((p) => (
                <Item key={p.id} onClick={() => { setOpen(false); nav({ to: "/persona/$id", params: { id: p.id } }); }}>
                  {p.emoji} {p.title}
                </Item>
              ))}
            </Section>
          )}
          {tools.length > 0 && (
            <Section title="Tools">
              {tools.map((t) => (
                <Item key={t.to + t.label} onClick={() => { setOpen(false); nav({ to: t.to as any }); }}>
                  🛠️ {t.label}
                </Item>
              ))}
            </Section>
          )}
        </div>
        <div className="px-5 py-2 border-t text-[10px] text-muted-foreground flex justify-between">
          <span>↑↓ navigate · ↵ open · esc close</span>
          <span>⌘K</span>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="px-5 pt-3 pb-1 text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{title}</div>
      {children}
    </div>
  );
}

function Item({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full text-left px-5 py-2.5 text-sm hover:bg-primary/5 hover:text-primary transition flex items-center">
      {children}
    </button>
  );
}
