// @ts-nocheck
export const CITY_OPTIONS = [
  { name: "Bengaluru", live: true, areas: ["HSR Layout", "Koramangala", "Bellandur", "BTM Layout", "Indiranagar", "Whitefield", "Marathahalli", "Sarjapur Road", "Electronic City", "Hebbal"] },
  { name: "Mumbai", areas: ["Andheri", "Powai", "Bandra", "Thane", "Navi Mumbai", "Lower Parel"] },
  { name: "Delhi NCR", areas: ["Gurugram", "Noida", "Saket", "Dwarka", "South Delhi", "Ghaziabad"] },
  { name: "Hyderabad", areas: ["Gachibowli", "HITEC City", "Kondapur", "Madhapur", "Jubilee Hills"] },
  { name: "Pune", areas: ["Hinjewadi", "Kharadi", "Viman Nagar", "Baner", "Wakad"] },
  { name: "Chennai", areas: ["OMR", "Velachery", "Adyar", "Anna Nagar", "Porur"] },
  { name: "Kolkata", areas: ["Salt Lake", "New Town", "Park Street", "Rajarhat", "Ballygunge"] },
  { name: "Other city", areas: [] },
];
export const cityByName = (name = "Bengaluru") => CITY_OPTIONS.find((c) => c.name === name) || CITY_OPTIONS[0];
export const areaSlug = (area = "") => area.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export const AREA_COORDS: Record<string, [number, number]> = {
  "HSR Layout": [12.9116, 77.6389], Koramangala: [12.9352, 77.6245], Bellandur: [12.9256, 77.6763],
  "BTM Layout": [12.9166, 77.6101], Indiranagar: [12.9784, 77.6408], Whitefield: [12.9698, 77.75],
  Marathahalli: [12.9591, 77.6974], "Sarjapur Road": [12.9081, 77.6834], "Electronic City": [12.8399, 77.677], Hebbal: [13.0358, 77.597],
};
export function coordinatesFor(area: string, index = 0): [number, number] {
  const base = AREA_COORDS[area] || [12.9716, 77.5946];
  const offsets = [[0,0], [.0032,.0021], [-.0024,.003], [.0018,-.0031], [-.003,-.0017]];
  const off = offsets[index % offsets.length];
  return [base[0] + off[0], base[1] + off[1]];
}
