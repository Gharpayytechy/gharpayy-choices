// @ts-nocheck
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import { useEffect } from "react";
import { Link } from "wouter";
import { coordinatesFor } from "@/flatmates/backend/store/locations";
import { money } from "@/flatmates/frontend/components/Shell";

function Fit({ items }: any) {
  const map = useMap();
  useEffect(() => {
    if (!items.length) return;
    const points = items.map((x: any, i: number) => x.coordinates || coordinatesFor(x.area, i));
    if (points.length === 1) map.setView(points[0], 14); else map.fitBounds(points, { padding: [35, 35] });
  }, [items, map]);
  return null;
}
export default function FlatmatesMapCanvas({ items, onSelect }: any) {
  return <MapContainer center={[12.9716, 77.5946]} zoom={12} className="h-full w-full" scrollWheelZoom>
    <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    <Fit items={items} />
    {items.map((x: any, i: number) => {
      const pos = x.coordinates || coordinatesFor(x.area, i);
      const color = x.kind === "flat" ? "#c96c45" : x.kind === "ready" ? "#d49b2d" : "#237c70";
      const href = x.kind === "flat" ? `/flatmates/flat/${x.id}` : x.kind === "ready" ? "/flatmates/ready" : `/flatmates/room/${x.id}`;
      return <CircleMarker key={`${x.kind}-${x.id}`} center={pos} radius={10} pathOptions={{ color: "white", weight: 3, fillColor: color, fillOpacity: 1 }} eventHandlers={{ click: () => onSelect?.(x) }}>
        <Popup><div className="min-w-44"><b>{x.title}</b><br/><span>{x.area} · {money(x.rent)}</span><br/><Link href={href} className="font-semibold text-primary">View details →</Link></div></Popup>
      </CircleMarker>;
    })}
  </MapContainer>;
}
