import { useEffect, useState } from "react";

export function LiveDataBadge() {
  const [state, setState] = useState<{ ok: boolean; source: string; freshAt: number } | null>(null);
  useEffect(() => {
    let cancel = false;
    fetch("/api/public/insights/json")
      .then((r) => r.json())
      .then((d) => { if (!cancel) setState({ ok: true, source: d.source, freshAt: d.freshAt }); })
      .catch(() => { if (!cancel) setState({ ok: false, source: "offline", freshAt: 0 }); });
    return () => { cancel = true; };
  }, []);
  if (!state) return null;
  const live = state.source.includes("bangalore.rent");
  const ago = state.freshAt ? Math.max(0, Math.round((Date.now() - state.freshAt) / 1000 / 60)) : null;
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border border-success/30 bg-success/5 text-success">
      <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
      {live ? "Live · bangalore.rent" : "Cached snapshot"}
      {ago !== null && <span className="opacity-70 num">· {ago}m ago</span>}
    </div>
  );
}
