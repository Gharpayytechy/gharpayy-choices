import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, LayerGroup, useMap, Marker } from "react-leaflet";
import L from "leaflet";
import data from "@/data/insights.json";
import { inr, inrFull } from "@/lib/format";
import { waListing, waArea } from "@/lib/wa";
import { AREAS, AREA_BY_SLUG, AVAIL_META, type AreaMeta } from "@/lib/areas-meta";
import { useRentForm } from "./RentFormProvider";
import { loadSubmissions } from "./AddRentForm";

type Pin = { lat: number; lng: number; r: number; b: string; f: boolean; g: boolean; s?: string; sq?: number | null; fb?: string; area?: string; lf?: boolean; pet?: boolean; mine?: boolean };

const TILES = {
  light: { url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png", attribution: "&copy; OSM · CARTO", label: "Clean" },
  voyager: { url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png", attribution: "&copy; OSM · CARTO", label: "Streets" },
  satellite: { url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", attribution: "&copy; Esri", label: "Satellite" },
} as const;
type TileKey = keyof typeof TILES;

function FlyTo({ target }: { target: { lat: number; lng: number; zoom?: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo([target.lat, target.lng], target.zoom ?? 14, { duration: 0.9 });
  }, [target, map]);
  return null;
}

function MapInvalidator() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

export function InsightsMap({ height = 720 }: { height?: number }) {
  const { open: openRentForm } = useRentForm();
  const [bhk, setBhk] = useState<string>("all");
  const [maxRent, setMaxRent] = useState(150000);
  const [minRent, setMinRent] = useState(8000);
  const [furnished, setFurnished] = useState<"all" | "f" | "u">("all");
  const [gated, setGated] = useState(false);
  const [tile, setTile] = useState<TileKey>("light");
  const [layers, setLayers] = useState({ rents: true, demand: false, gharpayy: true, areas: true, pg: true });
  const [search, setSearch] = useState("");
  const [selectedArea, setSelectedArea] = useState<AreaMeta | null>(null);
  const [flyTarget, setFlyTarget] = useState<{ lat: number; lng: number; zoom?: number } | null>(null);
  const [shareToast, setShareToast] = useState("");
  const [mySubmissions, setMySubmissions] = useState(() => loadSubmissions());
  const searchRef = useRef<HTMLInputElement>(null);

  // restore from URL
  useEffect(() => {
    const p = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const a = p.get("area");
    if (a && AREA_BY_SLUG[a]) {
      const m = AREA_BY_SLUG[a];
      setSelectedArea(m);
      setFlyTarget({ lat: m.lat, lng: m.lng, zoom: 14 });
    }
    if (p.get("bhk")) setBhk(p.get("bhk")!);
    if (p.get("max")) setMaxRent(+p.get("max")!);
  }, []);

  // Live-refresh when the user submits a rent via the form
  useEffect(() => {
    function onSub() { setMySubmissions(loadSubmissions()); }
    window.addEventListener("gp:submission", onSub);
    return () => window.removeEventListener("gp:submission", onSub);
  }, []);

  const basePins = (data as any).pins as Pin[];
  // Convert the user's submissions into map pins (jitter near area centroid).
  const userPins: Pin[] = useMemo(() => mySubmissions.map((s) => {
    const a = AREAS.find((ar) => ar.name === s.area);
    const lat = (a?.lat ?? 12.96) + (Math.random() - 0.5) * 0.006;
    const lng = (a?.lng ?? 77.62) + (Math.random() - 0.5) * 0.006;
    return { lat, lng, r: s.rent, b: s.bhk, f: s.furnished, g: s.gated, s: s.society, sq: s.sqft, fb: s.feedback, area: s.area, mine: true };
  }), [mySubmissions]);
  const allPins = useMemo(() => [...userPins, ...basePins], [userPins, basePins]);

  // Synthetic PG beds layer - one cluster of PG pins per area where Gharpayy operates.
  // PG rents in Bengaluru cluster ₹6.5k (twin) to ₹14k (deluxe single AC). Source: Gharpayy.
  type PgPin = { lat: number; lng: number; rent: number; tier: "twin" | "single" | "deluxe"; area: string; slug: string; meals: boolean; gated: boolean };
  const pgPins: PgPin[] = useMemo(() => {
    const out: PgPin[] = [];
    AREAS.filter((a) => a.avail !== "none").forEach((a) => {
      const n = a.avail === "high" ? 8 : a.avail === "medium" ? 5 : 3;
      for (let i = 0; i < n; i++) {
        const tier = i % 3 === 0 ? "deluxe" : i % 2 === 0 ? "single" : "twin";
        const base = tier === "twin" ? 6500 : tier === "single" ? 9500 : 13000;
        const seed = Math.sin(a.lat * 1000 + a.lng * 1000 + i) * 0.5 + 0.5;
        const seed2 = Math.sin(a.lat * 700 + a.lng * 1300 + i * 7) * 0.5 + 0.5;
        out.push({
          lat: a.lat + (seed - 0.5) * 0.012,
          lng: a.lng + (seed2 - 0.5) * 0.012,
          rent: Math.round(base + (seed - 0.5) * 1800),
          tier,
          area: a.name,
          slug: a.slug,
          meals: true,
          gated: i % 4 !== 0,
        });
      }
    });
    return out;
  }, []);

  const pins = useMemo(
    () =>
      allPins.filter(
        (p) =>
          (bhk === "all" || p.b === bhk) &&
          p.r <= maxRent &&
          p.r >= minRent &&
          (furnished === "all" || (furnished === "f" ? p.f : !p.f)) &&
          (!gated || p.g)
      ),
    [bhk, maxRent, minRent, furnished, gated, allPins]
  );

  const stats = useMemo(() => {
    if (!pins.length) return null;
    const rents = pins.map((p) => p.r).sort((a, b) => a - b);
    return { med: rents[Math.floor(rents.length / 2)], min: rents[0], max: rents[rents.length - 1], n: pins.length };
  }, [pins]);

  // search results
  const matches = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return AREAS.filter((a) => a.name.toLowerCase().includes(q) || a.slug.includes(q)).slice(0, 6);
  }, [search]);

  // Top jump chips · areas with highest count
  const topAreas = useMemo(() => [...AREAS].sort((a, b) => b.count - a.count).slice(0, 12), []);

  function jumpTo(a: AreaMeta) {
    setSelectedArea(a);
    setFlyTarget({ lat: a.lat, lng: a.lng, zoom: 14 });
    setSearch("");
  }

  function locateMe() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setFlyTarget({ lat: pos.coords.latitude, lng: pos.coords.longitude, zoom: 15 }),
      () => {}
    );
  }

  function shareView() {
    const p = new URLSearchParams();
    if (selectedArea) p.set("area", selectedArea.slug);
    if (bhk !== "all") p.set("bhk", bhk);
    if (maxRent !== 150000) p.set("max", String(maxRent));
    const url = `${window.location.origin}${window.location.pathname}#${p.toString()}`;
    navigator.clipboard?.writeText(url);
    setShareToast("Link copied!");
    setTimeout(() => setShareToast(""), 2000);
  }

  // colour pin by price band
  function pinColor(r: number) {
    if (r < 20000) return "oklch(0.62 0.14 155)"; // green
    if (r < 40000) return "oklch(0.78 0.16 75)";  // amber
    if (r < 70000) return "oklch(0.715 0.185 45)"; // orange
    return "oklch(0.585 0.22 27)"; // red
  }

  return (
    <div className="rounded-3xl border-2 border-primary/20 bg-card overflow-hidden shadow-[var(--shadow-card)]">
      {/* HERO BAR */}
      <div className="relative px-6 pt-6 pb-5 border-b" style={{ background: "linear-gradient(135deg, oklch(0.985 0.005 70) 0%, oklch(0.97 0.02 45) 100%)" }}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Bengaluru's only crowdsourced rent map
            </div>
            <h2 className="mt-2 text-2xl md:text-3xl font-bold tracking-tight text-ink">
              <span className="num">{(data as any).stats.pins.toLocaleString()}</span> real rents · pinned by{" "}
              <span className="text-primary">neighbours, not brokers</span>.
            </h2>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl">
              Search any area, see what people <strong className="text-foreground">actually pay</strong>, and check where Gharpayy has rooms today. Help us hit{" "}
              <span className="text-primary font-semibold">40,00,000 rents</span> · add yours in 30 seconds.
            </p>
          </div>
          <button
            onClick={() => openRentForm(selectedArea?.name)}
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold text-white shadow-[var(--shadow-glow)] hover:opacity-95 transition"
            style={{ background: "var(--gradient-orange)" }}
          >
            ➕ Add your rent
          </button>
        </div>

        {/* SEARCH BAR · the headline UX */}
        <div className="mt-5 relative">
          <div className="flex items-center gap-2 rounded-2xl border-2 border-primary/30 bg-white px-4 py-3 shadow-sm focus-within:border-primary focus-within:shadow-[var(--shadow-glow)] transition">
            <span className="text-lg">🔍</span>
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search any Bengaluru area · Koramangala, HSR, Whitefield, Indiranagar…"
              className="flex-1 bg-transparent outline-none text-base placeholder:text-muted-foreground"
              onKeyDown={(e) => { if (e.key === "Enter" && matches[0]) jumpTo(matches[0]); }}
            />
            <button onClick={locateMe} className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border bg-secondary hover:bg-primary/10 hover:text-primary transition" title="Use my location">
              📍 Near me
            </button>
          </div>
          {matches.length > 0 && (
            <div className="absolute z-30 mt-2 left-0 right-0 rounded-xl border bg-card shadow-[var(--shadow-pop)] overflow-hidden">
              {matches.map((m) => (
                <button key={m.slug} onClick={() => jumpTo(m)} className="w-full text-left px-4 py-2.5 hover:bg-primary/5 flex items-center justify-between gap-3 border-b last:border-0">
                  <div>
                    <div className="font-semibold text-sm">{m.name}</div>
                    <div className="text-[11px] text-muted-foreground">{m.count} rents · median <span className="num">{inr(m.med)}</span></div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: AVAIL_META[m.avail].color + "22", color: AVAIL_META[m.avail].color }}>
                    {AVAIL_META[m.avail].dot} {AVAIL_META[m.avail].label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* QUICK JUMP CHIPS */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground self-center mr-1">Jump to:</span>
          {topAreas.map((a) => (
            <button
              key={a.slug}
              onClick={() => jumpTo(a)}
              className={`px-2.5 py-1 text-xs rounded-full border transition ${selectedArea?.slug === a.slug ? "border-primary bg-primary text-primary-foreground" : "border-border bg-white hover:border-primary/40 hover:bg-primary/5"}`}
            >
              {a.name}
            </button>
          ))}
        </div>

        {/* LIVE STATS STRIP */}
        {stats && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
            <Mini label="Showing" value={stats.n.toLocaleString() + " pins"} />
            <Mini label="Median" value={inr(stats.med)} accent />
            <Mini label="Cheapest" value={inr(stats.min)} />
            <Mini label="Priciest" value={inr(stats.max)} />
            <Mini label="Demand" value={(data as any).stats.seekers.toLocaleString() + " hunters"} />
          </div>
        )}
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-b bg-background/40">
        <div className="flex gap-1 rounded-full bg-secondary p-1">
          {["all", "1", "2", "3", "4"].map((b) => (
            <button key={b} onClick={() => setBhk(b)} className={`px-3 py-1 text-xs rounded-full transition ${bhk === b ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground hover:text-foreground"}`}>
              {b === "all" ? "All BHK" : `${b} BHK`}
            </button>
          ))}
        </div>
        <div className="flex gap-1 rounded-full bg-secondary p-1">
          {([["all", "Any"], ["f", "Furnished"], ["u", "Unfurnished"]] as const).map(([k, lbl]) => (
            <button key={k} onClick={() => setFurnished(k)} className={`px-3 py-1 text-xs rounded-full transition ${furnished === k ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground hover:text-foreground"}`}>
              {lbl}
            </button>
          ))}
        </div>
        <button onClick={() => setGated((g) => !g)} className={`px-3 py-1.5 text-xs rounded-full border transition ${gated ? "bg-primary text-primary-foreground border-primary font-semibold" : "bg-secondary border-transparent text-muted-foreground hover:text-foreground"}`}>
          🔒 Gated only
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Rent</span>
          <input type="range" min={5000} max={200000} step={1000} value={minRent} onChange={(e) => setMinRent(Math.min(+e.target.value, maxRent - 1000))} className="w-20 accent-[oklch(0.715_0.185_45)]" />
          <span className="num font-semibold w-12 text-right">{inr(minRent)}</span>
          <span className="text-muted-foreground">–</span>
          <input type="range" min={5000} max={200000} step={1000} value={maxRent} onChange={(e) => setMaxRent(Math.max(+e.target.value, minRent + 1000))} className="w-20 accent-[oklch(0.715_0.185_45)]" />
          <span className="num font-semibold w-12 text-right">{inr(maxRent)}</span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <select value={tile} onChange={(e) => setTile(e.target.value as TileKey)} className="text-xs px-2 py-1.5 rounded-md border bg-card">
            {Object.entries(TILES).map(([k, t]) => <option key={k} value={k}>{t.label}</option>)}
          </select>
          <button onClick={shareView} className="text-xs px-3 py-1.5 rounded-md border bg-card hover:bg-secondary" title="Copy a shareable link to this exact view">
            🔗 Share
          </button>
        </div>
      </div>

      {/* LAYER TOGGLES */}
      <div className="flex flex-wrap items-center gap-2 px-6 py-3 border-b bg-background/30 text-xs">
        <span className="font-semibold uppercase tracking-wider text-muted-foreground mr-1">Layers:</span>
        <LayerToggle on={layers.rents} onClick={() => setLayers((l) => ({ ...l, rents: !l.rents }))} dot="oklch(0.715 0.185 45)" label="Real rents" />
        <LayerToggle on={layers.gharpayy} onClick={() => setLayers((l) => ({ ...l, gharpayy: !l.gharpayy }))} dot="oklch(0.62 0.14 155)" label="Gharpayy availability" />
        <LayerToggle on={layers.areas} onClick={() => setLayers((l) => ({ ...l, areas: !l.areas }))} dot="oklch(0.22 0.012 260)" label="Area medians" />
        <LayerToggle on={layers.pg} onClick={() => setLayers((l) => ({ ...l, pg: !l.pg }))} dot="oklch(0.66 0.14 295)" label={`PG beds (${pgPins.length})`} />
        <LayerToggle on={layers.demand} onClick={() => setLayers((l) => ({ ...l, demand: !l.demand }))} dot="oklch(0.66 0.14 245)" label="Where hunters search" />
      </div>

      {/* MAP + SIDE PANEL */}
      <div className="grid lg:grid-cols-[1fr_320px]">
        <div style={{ height }} className="relative">
          <MapContainer center={[12.96, 77.62]} zoom={11} className="h-full w-full" scrollWheelZoom>
            <TileLayer url={TILES[tile].url} attribution={TILES[tile].attribution} />
            <FlyTo target={flyTarget} />
            <MapInvalidator />

            {/* AREA MEDIAN BUBBLES */}
            {layers.areas && (
              <LayerGroup>
                {AREAS.map((a) => (
                  <Marker
                    key={"a" + a.slug}
                    position={[a.lat, a.lng]}
                    icon={L.divIcon({
                      className: "",
                      html: `<div style="display:flex;align-items:center;gap:4px;padding:4px 8px;border-radius:999px;background:white;border:2px solid ${pinColor(a.med)};box-shadow:0 2px 8px rgba(0,0,0,.12);font-family:ui-monospace,monospace;font-size:11px;font-weight:700;white-space:nowrap;color:#222;"><span style="color:${pinColor(a.med)}">●</span>${a.name} · ${inr(a.med)}</div>`,
                      iconSize: [120, 24],
                      iconAnchor: [60, 12],
                    })}
                    eventHandlers={{ click: () => { setSelectedArea(a); setFlyTarget({ lat: a.lat, lng: a.lng, zoom: 14 }); } }}
                  />
                ))}
              </LayerGroup>
            )}

            {/* GHARPAYY AVAILABILITY HALOS */}
            {layers.gharpayy && (
              <LayerGroup>
                {AREAS.filter((a) => a.avail !== "none").map((a) => {
                  const meta = AVAIL_META[a.avail];
                  const r = a.avail === "high" ? 28 : a.avail === "medium" ? 20 : 14;
                  return (
                    <CircleMarker
                      key={"g" + a.slug}
                      center={[a.lat, a.lng]}
                      radius={r}
                      pathOptions={{ color: meta.color, fillColor: meta.color, fillOpacity: 0.12, weight: 2, dashArray: a.avail === "low" ? "4 4" : undefined }}
                    >
                      <Popup>
                        <div className="space-y-1.5 min-w-[200px]">
                          <div className="font-bold text-sm flex items-center gap-1.5">{meta.dot} {a.name}</div>
                          <div className="text-xs"><strong>Gharpayy:</strong> {meta.desc}</div>
                          <div className="text-xs text-muted-foreground">Median rent here: <span className="num font-semibold text-foreground">{inr(a.med)}</span></div>
                          <a href={waArea(a.name, a.med, meta.label)} target="_blank" rel="noreferrer" className="block mt-1 text-center px-2 py-1.5 rounded text-xs font-semibold text-white" style={{ background: meta.color }}>
                            Check availability →
                          </a>
                        </div>
                      </Popup>
                    </CircleMarker>
                  );
                })}
              </LayerGroup>
            )}

            {/* REAL RENTS */}
            {layers.rents && (
              <LayerGroup>
                {pins.map((p, i) => (
                  <CircleMarker key={"p" + i} center={[p.lat, p.lng]} radius={p.mine ? 7 : 4}
                    pathOptions={{ color: p.mine ? "oklch(0.585 0.22 27)" : pinColor(p.r), fillColor: pinColor(p.r), fillOpacity: p.mine ? 0.95 : 0.75, weight: p.mine ? 3 : 1 }}>
                    <Popup>
                      <div className="space-y-1 min-w-[220px]">
                        <div className="text-base font-bold num" style={{ color: pinColor(p.r) }}>{inrFull(p.r)}/mo</div>
                        <div className="text-xs"><strong>{p.b} BHK</strong>{p.sq ? ` · ${p.sq} sqft · ₹${Math.round(p.r/p.sq)}/sqft` : ""}</div>
                        {p.s && <div className="text-xs">🏢 {p.s}</div>}
                        {p.area && <div className="text-xs text-muted-foreground">📍 {p.area}</div>}
                        <div className="text-[10px] text-muted-foreground">{p.f ? "Furnished" : "Unfurnished"}{p.g ? " · Gated" : ""}{p.lf ? " · Looking for flatmate" : ""}</div>
                        {p.fb && <div className="text-[11px] italic text-foreground/80 border-l-2 border-primary/40 pl-2 mt-1">"{p.fb.slice(0, 110)}{p.fb.length > 110 ? "…" : ""}"</div>}
                        <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                          <a href={waListing({ area: p.area, bhk: p.b, rent: p.r, society: p.s })} target="_blank" rel="noreferrer" className="text-center px-2 py-1.5 rounded text-[11px] font-semibold text-white" style={{ background: "var(--gradient-orange)" }}>
                            Find similar →
                          </a>
                          <button onClick={() => openRentForm(p.area)} className="text-center px-2 py-1.5 rounded text-[11px] font-semibold border border-primary/40 text-primary hover:bg-primary/5">
                            ➕ Add yours
                          </button>
                        </div>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </LayerGroup>
            )}

            {/* PG BEDS - Gharpayy managed PG inventory per zone */}
            {layers.pg && (
              <LayerGroup>
                {pgPins.map((p, i) => (
                  <Marker
                    key={"pg" + i}
                    position={[p.lat, p.lng]}
                    icon={L.divIcon({
                      className: "",
                      html: `<div style="width:20px;height:20px;border-radius:6px;background:oklch(0.66 0.14 295);border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center;color:white;font-size:11px;font-weight:800;font-family:ui-monospace,monospace;">P</div>`,
                      iconSize: [20, 20],
                      iconAnchor: [10, 10],
                    })}
                  >
                    <Popup>
                      <div className="space-y-1 min-w-[220px]">
                        <div className="flex items-center justify-between">
                          <div className="text-base font-bold num" style={{ color: "oklch(0.5 0.16 295)" }}>{inrFull(p.rent)}/mo</div>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[oklch(0.66_0.14_295/.15)] text-[oklch(0.5_0.16_295)]">PG · {p.tier}</span>
                        </div>
                        <div className="text-xs">🛏️ {p.tier === "twin" ? "Twin sharing" : p.tier === "single" ? "Single non-AC" : "Deluxe single AC"}</div>
                        <div className="text-xs text-muted-foreground">📍 {p.area}</div>
                        <div className="text-[11px] text-muted-foreground">{p.meals ? "🍳 Breakfast + dinner" : ""}{p.gated ? " · 🔒 Gated" : ""} · 🧺 Laundry · 🚿 RO + hot water</div>
                        <div className="text-[10px] text-muted-foreground italic">Direct to owner. Managed by Gharpayy. Deposit = 1 month.</div>
                        <a href={waArea(p.area, p.rent, "PG · " + p.tier)} target="_blank" rel="noreferrer" className="block mt-1 text-center px-2 py-1.5 rounded text-[11px] font-semibold text-white" style={{ background: "oklch(0.66 0.14 295)" }}>
                          Book a PG tour →
                        </a>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </LayerGroup>
            )}

            {/* DEMAND */}
            {layers.demand && (
              <LayerGroup>
                {((data as any).demand as { lat: number; lng: number; c: number }[]).map((d, i) => (
                  <CircleMarker key={"d" + i} center={[d.lat, d.lng]} radius={Math.min(4 + d.c * 0.6, 22)}
                    pathOptions={{ color: "oklch(0.66 0.14 245)", fillColor: "oklch(0.66 0.14 245)", fillOpacity: 0.18, weight: 1 }}>
                    <Popup>
                      <div className="font-semibold text-[oklch(0.66_0.14_245)] num">{d.c} flat-hunters</div>
                      <div className="text-xs text-muted-foreground">searching this micro-area</div>
                    </Popup>
                  </CircleMarker>
                ))}
              </LayerGroup>
            )}
          </MapContainer>

          {shareToast && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-foreground text-background text-xs font-semibold shadow-lg z-[1000]">
              {shareToast}
            </div>
          )}
        </div>

        {/* SIDE PANEL */}
        <aside className="border-l bg-background/40 p-5 overflow-y-auto" style={{ maxHeight: height }}>
          {selectedArea ? (
            <AreaPanel a={selectedArea} onClear={() => setSelectedArea(null)} onAdd={() => openRentForm(selectedArea.name)} />
          ) : (
            <DefaultPanel onPick={jumpTo} />
          )}
        </aside>
      </div>

      {/* LEGEND */}
      <div className="flex flex-wrap gap-x-5 gap-y-2 px-6 py-4 border-t text-xs text-muted-foreground bg-background/40">
        <span className="font-semibold text-foreground">Price band:</span>
        <LegendDot c="oklch(0.62 0.14 155)" l="< ₹20k" />
        <LegendDot c="oklch(0.78 0.16 75)" l="₹20–40k" />
        <LegendDot c="oklch(0.715 0.185 45)" l="₹40–70k" />
        <LegendDot c="oklch(0.585 0.22 27)" l="> ₹70k" />
        <span className="font-semibold text-foreground ml-3">PG:</span>
        <span className="inline-flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: "oklch(0.66 0.14 295)" }} />₹6.5k - ₹14k · meals + ops</span>
        <span className="ml-auto">🔒 Crowdsourced & anonymised · synced today</span>
      </div>
    </div>
  );
}

function AreaPanel({ a, onClear, onAdd }: { a: AreaMeta; onClear: () => void; onAdd: () => void }) {
  const meta = AVAIL_META[a.avail];
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Area</div>
          <h3 className="text-xl font-bold text-ink">{a.name}</h3>
        </div>
        <button onClick={onClear} className="text-xs text-muted-foreground hover:text-foreground">✕</button>
      </div>

      <div className="rounded-xl border p-3 flex items-center gap-3" style={{ background: meta.color + "10", borderColor: meta.color + "55" }}>
        <div className="text-2xl">{meta.dot}</div>
        <div>
          <div className="text-xs font-bold uppercase tracking-wider" style={{ color: meta.color }}>Gharpayy · {meta.label}</div>
          <div className="text-[11px] text-muted-foreground">{meta.desc}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <PanelStat label="Median rent" value={inr(a.med)} accent />
        <PanelStat label="Verified pins" value={a.count.toString()} />
        <PanelStat label="PG from" value="₹6.5k" />
        <PanelStat label="1 BHK anchor" value="₹25k" />
        {a.med2 && <PanelStat label="2 BHK med" value={inr(a.med2)} />}
        {a.med3 && <PanelStat label="3 BHK med" value={inr(a.med3)} />}
        {a.rps > 0 && <PanelStat label="₹/sqft" value={"₹" + a.rps} />}
        <PanelStat label="Expert SLA" value="< 4 hr" />
      </div>

      <div className="flex flex-col gap-2">
        <a href={waArea(a.name, a.med, meta.label)} target="_blank" rel="noreferrer" className="text-center px-3 py-2.5 rounded-full text-sm font-semibold text-white" style={{ background: "var(--gradient-orange)" }}>
          Check Gharpayy in {a.name} →
        </a>
        <a href={`/area/${a.slug}`} className="text-center px-3 py-2 rounded-full text-xs font-semibold border bg-card hover:bg-secondary">
          Full {a.name} report →
        </a>
        <button onClick={onAdd} className="text-center px-3 py-2 rounded-full text-xs font-semibold border-2 border-primary/40 text-primary bg-primary/5 hover:bg-primary/10">
          ➕ Add a rent in {a.name}
        </button>
      </div>
    </div>
  );
}

function DefaultPanel({ onPick }: { onPick: (a: AreaMeta) => void }) {
  const cheapest = [...AREAS].sort((a, b) => a.med - b.med).slice(0, 3);
  const hottest = [...AREAS].sort((a, b) => b.demand - a.demand).slice(0, 3);
  const available = AREAS.filter((a) => a.avail === "high").slice(0, 4);
  return (
    <div className="space-y-5">
      <div>
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Tip</div>
        <p className="text-sm mt-1">Search any area or click a chip. Each colour = honest price band; halo = Gharpayy availability today.</p>
      </div>

      <PanelList title="🟢 Tour Gharpayy today" items={available} onPick={onPick} />
      <PanelList title="💸 Cheapest medians" items={cheapest} onPick={onPick} />
      <PanelList title="🔥 Hottest demand" items={hottest} onPick={onPick} />
    </div>
  );
}

function PanelList({ title, items, onPick }: { title: string; items: AreaMeta[]; onPick: (a: AreaMeta) => void }) {
  return (
    <div>
      <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">{title}</div>
      <div className="space-y-1">
        {items.map((a) => (
          <button key={a.slug} onClick={() => onPick(a)} className="w-full text-left px-3 py-2 rounded-lg border bg-card hover:border-primary/40 hover:bg-primary/5 flex items-center justify-between">
            <div className="text-sm font-semibold">{a.name}</div>
            <div className="text-xs num text-muted-foreground">{inr(a.med)}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function PanelStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`px-3 py-2 rounded-lg border ${accent ? "bg-primary/10 border-primary/30" : "bg-card"}`}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
      <div className={`num font-bold text-base ${accent ? "text-primary" : "text-ink"}`}>{value}</div>
    </div>
  );
}

function Mini({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`px-3 py-2 rounded-lg border ${accent ? "bg-primary/10 border-primary/30" : "bg-card"}`}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
      <div className={`num font-bold text-sm ${accent ? "text-primary" : "text-ink"}`}>{value}</div>
    </div>
  );
}

function LayerToggle({ on, onClick, dot, label }: { on: boolean; onClick: () => void; dot: string; label: string }) {
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition ${on ? "bg-foreground text-background border-foreground" : "bg-card hover:bg-secondary"}`}>
      <span className="w-2 h-2 rounded-full" style={{ background: dot }} />
      {label}
    </button>
  );
}

function LegendDot({ c, l }: { c: string; l: string }) {
  return <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />{l}</span>;
}
