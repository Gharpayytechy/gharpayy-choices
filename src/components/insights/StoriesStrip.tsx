import { GHARPAYY_BOOK_URL } from "@/lib/wa";

export function StoriesStrip() {
  const stories = [
    { name: "Anjali", text: "Moved into a HSR PG in 3 days, expert handled everything.", emoji: "👩‍💼", area: "HSR" },
    { name: "Rahul + Priya", text: "Got our 1 BHK in Bellandur for ₹26k.", emoji: "💑", area: "Bellandur" },
    { name: "Karthik", text: "Expert found me a quiet PG near Manyata.", emoji: "🧑‍💻", area: "Hebbal" },
    { name: "Sneha", text: "Girls-only floor, biometric, ₹13k all-in.", emoji: "👩", area: "Koramangala" },
    { name: "Aman", text: "Upgraded from PG to a 2 BHK in 5 months.", emoji: "🏡", area: "Marathahalli" },
    { name: "Pooja", text: "Christ student · meals + Wi-Fi + walk to class.", emoji: "🎓", area: "Koramangala" },
  ];
  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-6 w-full">
      <div className="text-[11px] uppercase tracking-widest text-primary font-bold">Stories from this week ✨</div>
      <h2 className="mt-1 text-xl md:text-2xl font-bold tracking-tight">Real moves, real experts</h2>

      <div className="mt-3 -mx-4 md:mx-0 px-4 md:px-0 overflow-x-auto pb-2">
        <div className="flex gap-2 min-w-max">
          {stories.map((s, i) => (
            <a
              key={i}
              href={GHARPAYY_BOOK_URL}
              target="_blank" rel="noreferrer"
              className="w-[180px] flex-shrink-0 rounded-2xl border-2 border-primary/20 p-3 bg-card hover:border-primary/50 transition"
              style={{ background: "var(--gradient-hero)" }}
            >
              <div className="text-3xl">{s.emoji}</div>
              <div className="mt-2 text-xs font-bold text-ink">{s.name} · {s.area}</div>
              <div className="mt-1 text-[11px] text-muted-foreground italic leading-snug">"{s.text}"</div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
