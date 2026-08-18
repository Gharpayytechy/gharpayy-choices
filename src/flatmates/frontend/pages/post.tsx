// @ts-nocheck
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { FMShell, Card, Btn, Pill, Section, money } from "@/flatmates/frontend/components/Shell";
import { parsePost, writeDescription, shareCopy } from "@/flatmates/backend/store/parse";
import { Rooms, Flats, getMe, setMe, track, People } from "@/flatmates/backend/store/store";
import { AREA_LIST } from "@/flatmates/backend/store/seed";
import { ClipboardPaste, Home, Users, Search, Sparkles, Building2, Camera, Check } from "lucide-react";

const OPTIONS = [
  { key: "room", icon: Home, title: "A Room", desc: "You have a spare room in your flat." },
  { key: "flatmate", icon: Users, title: "Need a Flatmate", desc: "Fill a vacancy in your household." },
  { key: "seeking", icon: Search, title: "Looking for a Room", desc: "Publish your requirement." },
  { key: "people", icon: Sparkles, title: "Looking for People", desc: "Form a group and split a flat." },
  { key: "flat", icon: Building2, title: "A Whole Flat", desc: "List an entire home." },
  { key: "paste", icon: ClipboardPaste, title: "Paste Existing Post", desc: "Turn a Facebook/WhatsApp post into a listing." },
];

export default function PostPage() {
  const [mode, setMode] = useState("");
  return (
    <FMShell title="Post" tab="post" back={mode ? undefined : undefined} action={mode ? <button onClick={() => setMode("")} className="text-xs font-semibold text-slate-500">Back</button> : null}>
      {!mode && (
        <>
          <h2 className="text-2xl font-semibold tracking-tight mb-1">What are you posting?</h2>
          <p className="text-sm text-slate-500 mb-4">Every post starts matching within seconds.</p>
          <div className="space-y-2.5">
            {OPTIONS.map((o) => (
              <button key={o.key} onClick={() => setMode(o.key)} className="w-full text-left rounded-2xl border border-slate-900/8 bg-white p-4 hover:border-slate-300">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-slate-900/5 grid place-items-center"><o.icon className="w-5 h-5" /></span>
                  <div className="flex-1">
                    <div className="font-semibold tracking-tight">{o.title}</div>
                    <div className="text-xs text-slate-500">{o.desc}</div>
                  </div>
                  {o.key === "paste" && <Pill tone="orange">Signature</Pill>}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
      {mode === "paste" && <PastePost onDone={() => setMode("")} />}
      {(mode === "room" || mode === "flatmate") && <RoomWizard onDone={() => setMode("")} />}
      {mode === "seeking" && <RequirementPreview />}
      {mode === "people" && <RequirementPreview group />}
      {mode === "flat" && <FlatForm onDone={() => setMode("")} />}
    </FMShell>
  );
}

/* ── Signature: paste a Facebook post ── */
function PastePost({ onDone }: any) {
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState<any>(null);
  const [, nav] = useLocation();
  const run = () => { const p = parsePost(text); setParsed(p); track("listing_parsed", { found: p.foundCount }); };

  const publish = () => {
    const f = parsed.found;
    const room = Rooms.create({
      title: f.title, area: f.area || "HSR Layout", rent: f.rent || 15000, deposit: f.deposit || 30000,
      roomType: f.roomType || "Private room", genderPref: f.genderPref || "Any", residents: 2,
      bhk: f.bhk || 2, availableFrom: f.availableFrom || new Date().toISOString().slice(0, 10),
      bathroom: f.bathroom || "Shared", furnishing: f.furnishing || "Semi-furnished",
      description: writeDescription(f), type: "ROOM_EXISTING", status: "LIVE",
      verifiedAt: new Date().toISOString(), verified: { phone: true, room: false },
      householdMembers: [], rules: {}, dna: {}, commuteKm: "1.5", responseScore: 80,
      mine: true, kind: "room", nearby: [],
    });
    track("listing_published", { source: "paste" });
    nav(`/flatmates/live/${room.id}`);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight">Already posted somewhere?</h2>
      <p className="text-sm text-slate-500 mt-1 mb-4">Paste it here and we'll turn it into a live, verified listing.</p>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={7}
        placeholder={"Female replacement needed in HSR Layout, 3BHK, private room with attached bathroom, rent 17500 deposit 35000, available 18 Aug, no brokerage. DM 9876543210"}
        className="w-full p-3 rounded-xl border border-slate-900/10 bg-white text-sm outline-none focus:ring-2 focus:ring-slate-900/10" />
      <Btn className="w-full mt-3" onClick={run} disabled={!text.trim()}>Turn Into Listing</Btn>

      {parsed && (
        <Card className="p-4 mt-4">
          <p className="text-sm font-semibold">We found {Object.keys(parsed.found).length} details. {parsed.missing.length} still needed.</p>
          <div className="grid grid-cols-2 gap-2 mt-3">
            {Object.entries(parsed.found).map(([k, v]: any) => (
              <div key={k} className="rounded-xl bg-emerald-50 border border-emerald-200 p-2">
                <p className="text-[10px] uppercase font-bold text-emerald-700">{k}</p>
                <p className="text-sm font-medium truncate">{String(v)}</p>
              </div>
            ))}
          </div>
          {parsed.missing.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {parsed.missing.map((m: string) => <Pill key={m} tone="amber">Missing: {m}</Pill>)}
            </div>
          )}
          <div className="mt-3 rounded-xl bg-slate-50 p-3">
            <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">Auto-written description</p>
            <p className="text-sm">{writeDescription(parsed.found)}</p>
          </div>
          <Btn className="w-full mt-3" onClick={publish}>Complete & Publish Room</Btn>
        </Card>
      )}
    </div>
  );
}

/* ── 5-step room posting ── */
function RoomWizard({ onDone }: any) {
  const [step, setStep] = useState(1);
  const [d, setD] = useState<any>({
    area: "HSR Layout", building: "", bhk: 3, floor: "2", furnishing: "Semi-furnished",
    roomType: "Private room", rent: 17000, deposit: 34000, availableFrom: "", bathroom: "Attached", balcony: true,
    residents: 2, members: [{ name: "", age: "", work: "" }],
    smoking: "No", food: "No preference", guests: "Occasionally", pets: "Okay", cleaning: "Maid",
    genderPref: "Any", lease: "6–12 months", photos: [],
  });
  const [, nav] = useLocation();
  const set = (p: any) => setD({ ...d, ...p });

  const publish = () => {
    const room = Rooms.create({
      title: `${d.roomType} in ${d.bhk}BHK · ${d.area}`,
      ...d, status: "LIVE", type: "ROOM_EXISTING", verifiedAt: new Date().toISOString(),
      verified: { phone: true, room: d.photos.length > 0 }, householdMembers: d.members.filter((m: any) => m.name),
      rules: { smoking: d.smoking, guests: d.guests, cleaning: d.cleaning, pets: d.pets },
      dna: { smoking: d.smoking, food: d.food, guests: d.guests, cleanliness: "Normal", social: "Balanced" },
      commuteKm: "1.8", responseScore: 85, mine: true, kind: "room", nearby: [],
    });
    track("listing_published", { source: "wizard" });
    nav(`/flatmates/live/${room.id}`);
  };

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-blue-800">Step {step} / 5</p>
      <h2 className="text-2xl font-semibold tracking-tight mb-4">
        {["Property", "The vacancy", "Household", "House rules", "Photos"][step - 1]}
      </h2>

      {step === 1 && (
        <>
          <L label="Area"><Chips options={AREA_LIST} value={d.area} onChange={(v: any) => set({ area: v })} /></L>
          <L label="Apartment / building"><input className={inp} value={d.building} onChange={(e) => set({ building: e.target.value })} placeholder="Sobha Dream Acres" /></L>
          <div className="grid grid-cols-2 gap-3">
            <L label="BHK"><Chips options={[1, 2, 3, 4]} value={d.bhk} onChange={(v: any) => set({ bhk: v })} /></L>
            <L label="Floor"><input className={inp} value={d.floor} onChange={(e) => set({ floor: e.target.value })} /></L>
          </div>
          <L label="Furnishing"><Chips options={["Fully furnished", "Semi-furnished", "Unfurnished"]} value={d.furnishing} onChange={(v: any) => set({ furnishing: v })} /></L>
        </>
      )}
      {step === 2 && (
        <>
          <L label="Room type"><Chips options={["Private room", "Twin sharing", "Shared room"]} value={d.roomType} onChange={(v: any) => set({ roomType: v })} /></L>
          <div className="grid grid-cols-2 gap-3">
            <L label="Rent share (₹/month)"><input type="number" className={inp} value={d.rent} onChange={(e) => set({ rent: +e.target.value })} /></L>
            <L label="Deposit (₹)"><input type="number" className={inp} value={d.deposit} onChange={(e) => set({ deposit: +e.target.value })} /></L>
          </div>
          <L label="Available from"><input type="date" className={inp} value={d.availableFrom} onChange={(e) => set({ availableFrom: e.target.value })} /></L>
          <L label="Bathroom"><Chips options={["Attached", "Shared"]} value={d.bathroom} onChange={(v: any) => set({ bathroom: v })} /></L>
        </>
      )}
      {step === 3 && (
        <>
          <L label="How many currently live there?"><Chips options={[1, 2, 3, 4]} value={d.residents} onChange={(v: any) => set({ residents: v })} /></L>
          {d.members.map((m: any, i: number) => (
            <div key={i} className="grid grid-cols-3 gap-2 mb-2">
              <input className={inp} placeholder="Name" value={m.name} onChange={(e) => { const ms = [...d.members]; ms[i] = { ...m, name: e.target.value }; set({ members: ms }); }} />
              <input className={inp} placeholder="Age" value={m.age} onChange={(e) => { const ms = [...d.members]; ms[i] = { ...m, age: e.target.value }; set({ members: ms }); }} />
              <input className={inp} placeholder="Work" value={m.work} onChange={(e) => { const ms = [...d.members]; ms[i] = { ...m, work: e.target.value }; set({ members: ms }); }} />
            </div>
          ))}
          <Btn variant="secondary" onClick={() => set({ members: [...d.members, { name: "", age: "", work: "" }] })}>Add household member</Btn>
        </>
      )}
      {step === 4 && (
        <>
          <L label="Smoking"><Chips options={["No", "Outside only", "Okay"]} value={d.smoking} onChange={(v: any) => set({ smoking: v })} /></L>
          <L label="Food"><Chips options={["Vegetarian", "Eggetarian", "Non-veg", "No preference"]} value={d.food} onChange={(v: any) => set({ food: v })} /></L>
          <L label="Guests"><Chips options={["Rare", "Occasionally", "Flexible"]} value={d.guests} onChange={(v: any) => set({ guests: v })} /></L>
          <L label="Pets"><Chips options={["Love pets", "Okay", "Prefer none"]} value={d.pets} onChange={(v: any) => set({ pets: v })} /></L>
          <L label="Cleaning"><Chips options={["Maid", "Shared chores", "Either"]} value={d.cleaning} onChange={(v: any) => set({ cleaning: v })} /></L>
          <L label="Preferred flatmate"><Chips options={["Any", "Male", "Female"]} value={d.genderPref} onChange={(v: any) => set({ genderPref: v })} /></L>
        </>
      )}
      {step === 5 && (
        <>
          <div className="grid grid-cols-3 gap-2">
            {["Room", "Bathroom", "Living room", "Kitchen", "Building", "Balcony"].map((tag) => {
              const on = d.photos.includes(tag);
              return (
                <button key={tag} onClick={() => set({ photos: on ? d.photos.filter((x: string) => x !== tag) : [...d.photos, tag] })}
                  className={`aspect-square rounded-xl border grid place-items-center text-xs font-medium ${on ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "bg-white border-dashed border-slate-300 text-slate-500"}`}>
                  {on ? <Check className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
                  <span className="mt-1">{tag}</span>
                </button>
              );
            })}
          </div>
          {!d.photos.includes("Room") && (
            <Card className="p-3 mt-3 bg-amber-50 border-amber-200 text-sm">Missing a clear bedroom photo — listings with one get 3.2× more interest.</Card>
          )}
        </>
      )}

      <div className="flex gap-2 mt-6">
        <Btn variant="secondary" onClick={() => (step === 1 ? onDone() : setStep(step - 1))}>Back</Btn>
        {step < 5 ? <Btn className="flex-1" onClick={() => setStep(step + 1)}>Continue</Btn>
          : <Btn className="flex-1" onClick={publish}>Publish Room</Btn>}
      </div>
    </div>
  );
}

function FlatForm({ onDone }: any) {
  const [d, setD] = useState<any>({ title: "", area: "HSR Layout", rent: 45000, bhk: 3, deposit: 90000, furnishing: "Semi-furnished", availableFrom: "" });
  const [, nav] = useLocation();
  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight mb-4">List a whole flat</h2>
      <L label="Title"><input className={inp} value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} placeholder="Modern 3BHK, semi-furnished" /></L>
      <L label="Area"><Chips options={AREA_LIST} value={d.area} onChange={(v: any) => setD({ ...d, area: v })} /></L>
      <div className="grid grid-cols-2 gap-3">
        <L label="Rent"><input type="number" className={inp} value={d.rent} onChange={(e) => setD({ ...d, rent: +e.target.value })} /></L>
        <L label="Deposit"><input type="number" className={inp} value={d.deposit} onChange={(e) => setD({ ...d, deposit: +e.target.value })} /></L>
      </div>
      <L label="BHK"><Chips options={[1, 2, 3, 4]} value={d.bhk} onChange={(v: any) => setD({ ...d, bhk: v })} /></L>
      <L label="Available from"><input type="date" className={inp} value={d.availableFrom} onChange={(e) => setD({ ...d, availableFrom: e.target.value })} /></L>
      <div className="flex gap-2 mt-4">
        <Btn variant="secondary" onClick={onDone}>Back</Btn>
        <Btn className="flex-1" onClick={() => {
          const f = Flats.create({ ...d, title: d.title || `${d.bhk}BHK in ${d.area}`, amenities: ["Lift", "Parking"], verified: { phone: true, owner: true }, verifiedAt: new Date().toISOString(), status: "LIVE", kind: "flat", roomType: "Entire flat", responseScore: 80, mine: true, nearby: [] });
          nav(`/flatmates/flat/${f.id}`);
        }}>List Flat</Btn>
      </div>
    </div>
  );
}

function RequirementPreview({ group }: any) {
  const me = getMe();
  const [, nav] = useLocation();
  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight mb-1">{group ? "Find people to take a flat with" : "Publish your requirement"}</h2>
      <p className="text-sm text-slate-500 mb-4">We already know your move — check it and publish.</p>
      <Card className="p-4">
        <p className="font-semibold">{me.name || "You"} {group ? "want to form a group" : `are looking for a ${me.roomType.toLowerCase()}`}</p>
        <p className="text-sm text-slate-600 mt-1">{me.areas.join(" / ") || "Bengaluru"} · {money(me.budgetIdeal)}–{money(me.budgetMax)} · moving {me.moveIn || me.moveInBand || "soon"}</p>
        <div className="flex gap-1.5 mt-2"><Pill tone="green">Verified profile</Pill><Pill>{me.workMode}</Pill><Pill>{me.dna.smoking === "No" ? "Non-smoker" : me.dna.smoking}</Pill></div>
      </Card>
      <div className="flex gap-2 mt-4">
        <Link href="/flatmates/start" className="h-10 px-4 rounded-xl border border-slate-900/12 grid place-items-center text-sm font-semibold">Edit</Link>
        <Btn className="flex-1" onClick={() => { setMe({ published: true }); track("requirement_published"); nav(group ? "/flatmates/groups" : "/flatmates/discover"); }}>
          {group ? "Find My Group" : "Publish Requirement"}
        </Btn>
      </div>
      <Section title="Share my requirement" sub="Every share can create supply as well as demand." />
      <div className="grid grid-cols-2 gap-2">
        {["Facebook", "WhatsApp", "Instagram Story", "LinkedIn"].map((s) => (
          <button key={s} onClick={() => navigator.clipboard?.writeText(shareCopy[s.split(" ")[0].toLowerCase()]?.({ area: me.areas[0] || "Bengaluru", rent: me.budgetIdeal, roomType: me.roomType }) || "")}
            className="h-11 rounded-xl border border-slate-900/10 bg-white text-sm font-semibold">{s}</button>
        ))}
      </div>
    </div>
  );
}

const inp = "w-full h-11 px-3 rounded-xl border border-slate-900/10 bg-white text-sm outline-none focus:ring-2 focus:ring-slate-900/10";
function L({ label, children }: any) { return <div className="mb-4"><label className="block text-xs font-semibold text-slate-500 mb-1.5">{label}</label>{children}</div>; }
function Chips({ options, value, onChange }: any) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o: any) => (
        <button key={o} onClick={() => onChange(o)} className={`px-3 h-9 rounded-xl text-sm font-medium border ${value === o ? "bg-slate-900 text-white border-slate-900" : "bg-white border-slate-900/10"}`}>{o}</button>
      ))}
    </div>
  );
}
