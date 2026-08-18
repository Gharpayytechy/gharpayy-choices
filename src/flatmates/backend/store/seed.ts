// @ts-nocheck
import { People, Rooms, Flats, Groups, Notifs } from "./store";

const iso = (d: number) => new Date(Date.now() + d * 86400000).toISOString().slice(0, 10);
const ago = (m: number) => new Date(Date.now() - m * 60000).toISOString();

const AREAS = ["HSR Layout", "Koramangala", "Bellandur", "BTM Layout", "Indiranagar", "Whitefield", "Marathahalli", "Sarjapur Road"];

const PEOPLE = [
  ["Aarav Menon", 25, "Male", "Software Engineer", "Microsoft", "HSR Layout", 18000, "Private room", "Very organised", "Balanced", "No", "Non-veg"],
  ["Aditi Rao", 24, "Female", "Product Designer", "Swiggy", "Koramangala", 20000, "Private room", "Very organised", "Mostly private", "No", "Vegetarian"],
  ["Kunal Shetty", 27, "Male", "Consultant", "Deloitte", "Bellandur", 22000, "Private room", "Normal", "Very social", "Outside only", "Non-veg"],
  ["Sara Iyer", 26, "Female", "Analyst", "Goldman Sachs", "HSR Layout", 17000, "Twin sharing", "Very organised", "Balanced", "No", "Eggetarian"],
  ["Rohit Bansal", 23, "Male", "Student", "Christ University", "BTM Layout", 11000, "Shared room", "Relaxed", "Very social", "Okay", "Non-veg"],
  ["Meera Nair", 28, "Female", "Doctor", "Manipal Hospital", "Indiranagar", 26000, "Private room", "Very organised", "Mostly private", "No", "Vegetarian"],
  ["Vikram Singh", 29, "Male", "Sales Lead", "Razorpay", "Marathahalli", 16000, "Private room", "Normal", "Balanced", "Outside only", "Non-veg"],
  ["Ananya Gupta", 22, "Female", "Intern", "Zerodha", "Koramangala", 13000, "Twin sharing", "Normal", "Balanced", "No", "Vegan"],
  ["Devansh Patel", 26, "Male", "Data Scientist", "Flipkart", "Bellandur", 21000, "Private room", "Very organised", "Mostly private", "No", "Vegetarian"],
  ["Priya Krishnan", 25, "Female", "Marketing", "Nykaa", "HSR Layout", 19000, "Private room", "Normal", "Very social", "No", "Non-veg"],
  ["Imran Sheikh", 30, "Male", "Architect", "Studio Lotus", "Sarjapur Road", 24000, "Private room", "Normal", "Balanced", "Outside only", "Non-veg"],
  ["Nisha Verma", 27, "Female", "HR Manager", "Infosys", "Whitefield", 15000, "Private room", "Very organised", "Balanced", "No", "Vegetarian"],
];

const ROOMS = [
  ["Private room in bright 3BHK", "HSR Layout", 17500, 35000, "Private room", "Female", 2, "Sector 2, HSR Layout", 6],
  ["Sunny room, working professionals", "Koramangala", 21000, 42000, "Private room", "Any", 2, "5th Block, Koramangala", 42],
  ["Twin sharing near Ecospace", "Bellandur", 12500, 25000, "Twin sharing", "Male", 3, "Bellandur Gate", 120],
  ["Master bedroom with balcony", "Indiranagar", 26000, 52000, "Private room", "Any", 1, "12th Main, Indiranagar", 15],
  ["Budget room close to metro", "BTM Layout", 9500, 19000, "Shared room", "Male", 3, "BTM 2nd Stage", 240],
  ["Furnished room, female household", "Whitefield", 14000, 28000, "Private room", "Female", 2, "Whitefield Main Rd", 70],
  ["Room in quiet 2BHK", "Marathahalli", 15500, 31000, "Private room", "Any", 1, "Outer Ring Road", 300],
  ["Replacement needed — moving out", "HSR Layout", 16000, 32000, "Private room", "Female", 2, "Sector 6, HSR", 25],
  ["Spacious room, techie household", "Sarjapur Road", 19000, 38000, "Private room", "Male", 3, "Sarjapur Junction", 90],
];

const FLATS = [
  ["Modern 3BHK, semi-furnished", "HSR Layout", 54000, 3, 108000, "Sector 7"],
  ["2BHK with balcony", "Koramangala", 42000, 2, 84000, "6th Block"],
  ["Spacious 3BHK near tech park", "Bellandur", 48000, 3, 96000, "Green Glen Layout"],
  ["1BHK studio, fully furnished", "Indiranagar", 32000, 1, 64000, "CMH Road"],
  ["4BHK duplex for a big group", "Whitefield", 68000, 4, 136000, "Varthur Road"],
];

export function seedFlatmates(force = false) {
  if (typeof localStorage === "undefined") return;
  if (!force && People.all().length) return;

  People.replace(PEOPLE.map((p, i) => ({
    id: "p" + i,
    name: p[0], age: p[1], gender: p[2], occupation: p[3], company: p[4],
    area: p[5], nearby: AREAS.filter((a) => a !== p[5]).slice(0, 2),
    budgetIdeal: p[6], budgetMax: Math.round(p[6] * 1.2), rent: p[6],
    roomType: p[7], moveIn: iso(3 + i * 2), availableFrom: iso(3 + i * 2),
    workMode: i % 3 === 0 ? "Hybrid" : i % 3 === 1 ? "Office" : "WFH",
    dna: {
      cleanliness: p[8], social: p[9], smoking: p[10], food: p[11],
      sleep: i % 2 ? "Regular" : "Early sleeper", cooking: i % 3 ? "Sometimes" : "Daily",
      guests: i % 2 ? "Occasionally" : "Rare", pets: i % 4 ? "Okay" : "Love pets",
    },
    verified: { phone: true, work: i % 3 !== 2, id: i % 2 === 0 },
    responseScore: 60 + ((i * 7) % 40),
    lastActive: ago(5 + i * 40),
    bio: `${p[3]} at ${p[4]}. Looking for a ${String(p[7]).toLowerCase()} around ${p[5]}.`,
    kind: "person",
  })));

  Rooms.replace(ROOMS.map((r, i) => ({
    id: "r" + i,
    title: r[0], area: r[1], rent: r[2], deposit: r[3], roomType: r[4],
    genderPref: r[5], residents: r[6], address: r[7], verifiedAt: ago(r[8]),
    nearby: AREAS.filter((a) => a !== r[1]).slice(0, 2),
    availableFrom: iso(2 + i * 3),
    type: i === 7 ? "ROOM_REPLACEMENT" : "ROOM_EXISTING",
    status: "LIVE",
    bathroom: i % 3 === 0 ? "Attached" : "Shared",
    balcony: i % 2 === 0, furnishing: i % 3 === 0 ? "Fully furnished" : "Semi-furnished",
    maintenance: 1500, utilities: 1200,
    bhk: [3, 2, 3, 2, 3, 2, 2, 3, 3][i],
    householdMembers: [
      { name: ["Aditi", "Rahul", "Sara", "Neha", "Arjun"][i % 5], age: 24 + (i % 5), work: ["Product", "Consulting", "Design", "Finance", "Tech"][i % 5] },
      { name: ["Sneha", "Karan", "Ishita", "Manav", "Divya"][i % 5], age: 25 + (i % 4), work: ["Tech", "Sales", "Media", "Legal", "Ops"][i % 5] },
    ],
    rules: { smoking: i % 2 ? "Outside only" : "No", guests: "Occasionally", cleaning: "Maid", cooking: "Sometimes", pets: i % 3 ? "Okay" : "Prefer none", quiet: "After 11 PM" },
    dna: { cleanliness: i % 2 ? "Very organised" : "Normal", social: i % 3 ? "Balanced" : "Very social", smoking: i % 2 ? "Outside only" : "No", food: i % 2 ? "Non-veg" : "Vegetarian", guests: "Occasionally", pets: "Okay" },
    verified: { phone: true, work: true, id: i % 2 === 0, room: i % 3 !== 1 },
    responseScore: 55 + ((i * 11) % 45),
    commuteKm: (1 + (i % 5) * 0.8).toFixed(1),
    photos: [],
    kind: "room",
  })));

  Flats.replace(FLATS.map((f, i) => ({
    id: "f" + i,
    title: f[0], area: f[1], rent: f[2], bhk: f[3], deposit: f[4], address: f[5],
    nearby: AREAS.filter((a) => a !== f[1]).slice(0, 2),
    availableFrom: iso(6 + i * 4), furnishing: i % 2 ? "Semi-furnished" : "Fully furnished",
    amenities: ["Lift", "Parking", "Power backup", "Security", i % 2 ? "Gym" : "Pet friendly"],
    verified: { phone: true, work: false, id: true, owner: true },
    verifiedAt: ago(30 + i * 60), status: "LIVE", roomType: "Entire flat",
    responseScore: 70, kind: "flat",
  })));

  Groups.replace([
    { id: "g0", name: "HSR 3BHK Crew", area: "HSR Layout", memberIds: ["p0", "p3"], budget: 56000, bhk: 3, moveIn: iso(12), compatibility: 91, status: "forming", checklist: { location: true, budget: true, moveIn: true, expectations: false, flats: false, visit: false }, shortlist: [] },
    { id: "g1", name: "Koramangala Duo", area: "Koramangala", memberIds: ["p1", "p7"], budget: 38000, bhk: 2, moveIn: iso(20), compatibility: 87, status: "forming", checklist: { location: true, budget: true, moveIn: false, expectations: false, flats: false, visit: false }, shortlist: [] },
    { id: "g2", name: "Bellandur Techies", area: "Bellandur", memberIds: ["p2", "p8"], budget: 47000, bhk: 3, moveIn: iso(9), compatibility: 84, status: "forming", checklist: { location: true, budget: true, moveIn: true, expectations: true, flats: false, visit: false }, shortlist: [] },
  ]);

  if (!Notifs.all().length) {
    Notifs.replace([
      { id: "n0", type: "match", title: "95% match near your office", body: "A private room under ₹18K became available 1.1km from Bellandur.", link: "/flatmates/room/r0", read: false, at: ago(12) },
      { id: "n1", type: "interest", title: "Someone likes your profile", body: "Aarav matches 91% of your household preferences.", link: "/flatmates/person/p0", read: false, at: ago(90) },
      { id: "n2", type: "availability", title: "Still looking?", body: "Confirm your requirement so we keep showing you to households.", link: "/flatmates/you", read: false, at: ago(300) },
    ]);
  }
}

export const READY_STAYS = [
  { id: "rs0", title: "Gharpayy HSR · Private ensuite", area: "HSR Layout", rent: 16999, roomType: "Private room", food: true, deposit: 16999, ready: "Today", distance: "0.9 km" },
  { id: "rs1", title: "Gharpayy Koramangala · Twin", area: "Koramangala", rent: 12499, roomType: "Twin sharing", food: true, deposit: 12499, ready: "Today", distance: "2.1 km" },
  { id: "rs2", title: "Gharpayy Bellandur · Private", area: "Bellandur", rent: 15499, roomType: "Private room", food: false, deposit: 15499, ready: "Tomorrow", distance: "1.4 km" },
  { id: "rs3", title: "Gharpayy BTM · Shared", area: "BTM Layout", rent: 8999, roomType: "Shared room", food: true, deposit: 8999, ready: "Today", distance: "3.2 km" },
];

export const AREA_LIST = AREAS;
