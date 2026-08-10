// @ts-nocheck
// AI-ish post parser: Facebook / WhatsApp text → structured listing
const AREAS = ["HSR Layout", "HSR", "Koramangala", "Bellandur", "BTM Layout", "BTM", "Indiranagar", "Whitefield", "Marathahalli", "Sarjapur", "Electronic City", "Jayanagar", "Hebbal"];
const norm: Record<string, string> = { HSR: "HSR Layout", BTM: "BTM Layout", Sarjapur: "Sarjapur Road" };

function money(text: string) {
  const out: number[] = [];
  const re = /(?:₹|rs\.?|inr)?\s*(\d{1,3}(?:,\d{2,3})*|\d{4,6}|\d{1,2}(?:\.\d)?)\s*(k\b|thousand)?/gi;
  let m;
  while ((m = re.exec(text))) {
    let v = Number(String(m[1]).replace(/,/g, ""));
    if (m[2]) v *= 1000;
    if (v >= 3000 && v <= 200000) out.push(v);
  }
  return out;
}

export function parsePost(text: string) {
  const t = text || "";
  const low = t.toLowerCase();
  const found: any = {};
  const missing: string[] = [];

  const area = AREAS.find((a) => low.includes(a.toLowerCase()));
  if (area) found.area = norm[area] || area; else missing.push("Location / area");

  const amounts = money(t);
  const rentMatch = /rent[^\d]{0,15}(\d[\d,]*)/i.exec(t);
  if (rentMatch) found.rent = Number(rentMatch[1].replace(/,/g, ""));
  else if (amounts.length) found.rent = Math.min(...amounts);
  if (!found.rent) missing.push("Rent");

  const dep = /deposit[^\d]{0,15}(\d[\d,]*)/i.exec(t);
  if (dep) found.deposit = Number(dep[1].replace(/,/g, ""));
  else if (found.rent) found.deposit = found.rent * 2;

  if (/female|girls?\b|ladies/i.test(t)) found.genderPref = "Female";
  else if (/male|boys?\b|gents/i.test(t)) found.genderPref = "Male";
  else found.genderPref = "Any";

  if (/twin|double shar/i.test(t)) found.roomType = "Twin sharing";
  else if (/triple|shared room|3 shar/i.test(t)) found.roomType = "Shared room";
  else if (/private|single room|own room/i.test(t)) found.roomType = "Private room";
  else missing.push("Room type");

  const bhk = /(\d)\s*bhk/i.exec(t);
  if (bhk) found.bhk = Number(bhk[1]); else missing.push("Flat size (BHK)");

  if (/immediate|asap|right away|today/i.test(t)) found.availableFrom = new Date().toISOString().slice(0, 10);
  else {
    const dm = /(\d{1,2})\s*(st|nd|rd|th)?\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.exec(t);
    if (dm) {
      const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
      const y = new Date().getFullYear();
      const d = new Date(y, months.indexOf(dm[3].toLowerCase()), Number(dm[1]));
      if (d < new Date()) d.setFullYear(y + 1);
      found.availableFrom = d.toISOString().slice(0, 10);
    } else missing.push("Available from");
  }

  if (/attached|ensuite/i.test(t)) found.bathroom = "Attached";
  if (/furnish/i.test(t)) found.furnishing = /semi/i.test(t) ? "Semi-furnished" : /un\s?furnish/i.test(t) ? "Unfurnished" : "Fully furnished";
  if (/no broker|brokerage free|zero broker/i.test(t)) found.noBrokerage = true;

  const phone = /(\+?91[\-\s]?)?[6-9]\d{9}/.exec(t.replace(/[^\d+\s-]/g, " "));
  if (phone) found.phone = phone[0].replace(/\s/g, "");

  const firstLine = t.trim().split("\n")[0].slice(0, 70);
  found.title = firstLine || `${found.roomType || "Room"} in ${found.area || "Bengaluru"}`;

  if (!missing.includes("Photos")) missing.push("Photos");
  return { found, missing, foundCount: Object.keys(found).length };
}

export function writeDescription(f: any) {
  const bits = [
    f.roomType ? `${f.roomType} available` : "Room available",
    f.area ? `in ${f.area}` : "",
    f.bhk ? `inside a ${f.bhk}BHK` : "",
    f.furnishing ? `(${f.furnishing.toLowerCase()})` : "",
  ].filter(Boolean).join(" ");
  const money = [
    f.rent ? `Rent ₹${f.rent.toLocaleString("en-IN")}/month` : "",
    f.deposit ? `deposit ₹${f.deposit.toLocaleString("en-IN")}` : "",
    f.noBrokerage ? "zero brokerage" : "",
  ].filter(Boolean).join(", ");
  const who = f.genderPref && f.genderPref !== "Any" ? `Looking for a ${f.genderPref.toLowerCase()} flatmate.` : "Open to anyone who fits the household.";
  return `${bits}. ${money}. ${who}`.replace(/\s+/g, " ").trim();
}

export const shareCopy = {
  facebook: (x: any) =>
    `🏠 ${x.roomType || "Room"} available in ${x.area}\n\n• Rent: ₹${(x.rent || 0).toLocaleString("en-IN")}/month\n• Deposit: ₹${(x.deposit || 0).toLocaleString("en-IN")}\n• Available: ${x.availableFrom || "immediately"}\n• Looking for: ${x.genderPref || "anyone"}\n• Verified on Gharpayy ✅\n\nSee photos, household details and message directly here 👇`,
  whatsapp: (x: any) =>
    `${x.roomType || "Room"} in ${x.area} — ₹${(x.rent || 0).toLocaleString("en-IN")}/mo, available ${x.availableFrom || "now"}. Full details:`,
  instagram: (x: any) => `${x.area} · ₹${(x.rent || 0).toLocaleString("en-IN")}/mo · ${x.roomType || "Room"} — link in bio`,
  linkedin: (x: any) =>
    `A colleague relocating to Bengaluru? There's a verified ${String(x.roomType || "room").toLowerCase()} in ${x.area} at ₹${(x.rent || 0).toLocaleString("en-IN")}/month, available ${x.availableFrom || "now"}.`,
};
