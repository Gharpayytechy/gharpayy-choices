import { GHARPAYY_BOOK_URL, waConcierge } from "@/lib/wa";

export function TourSlots() {
  const today = new Date();
  const days = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return d;
  });
  const slots = ["10:30", "12:00", "16:00", "18:00"];

  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-7 w-full">
      <div className="text-[11px] uppercase tracking-widest text-primary font-bold">Tour today ⏱️</div>
      <h2 className="mt-1 text-2xl md:text-3xl font-bold tracking-tight">Pick your slot</h2>
      <p className="mt-1 text-sm text-muted-foreground">Expert meets you at the building, takes you through 3 verified options.</p>

      <div className="mt-4 -mx-4 md:mx-0 px-4 md:px-0 overflow-x-auto pb-2">
        <div className="grid grid-rows-[auto_repeat(4,auto)] grid-flow-col gap-1.5 min-w-max">
          <div></div>
          {slots.map((s) => <div key={s} className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold p-2 num">{s}</div>)}
          {days.map((d, dIdx) => (
            <>
              <div key={`d${dIdx}`} className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold p-2 min-w-[90px]">
                {d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
              </div>
              {slots.map((s) => {
                const taken = (dIdx + s.length) % 5 === 0;
                return (
                  <a
                    key={`${dIdx}-${s}`}
                    href={taken ? "#" : waConcierge(`Book tour ${d.toDateString()} at ${s}`)}
                    target="_blank" rel="noreferrer"
                    onClick={taken ? (e) => e.preventDefault() : undefined}
                    className={`min-w-[80px] px-3 py-2 rounded-xl text-center text-xs font-bold transition ${
                      taken ? "bg-secondary text-muted-foreground cursor-not-allowed" : "border-2 border-primary/30 bg-primary/5 text-primary hover:bg-primary/10"
                    }`}
                  >
                    {taken ? "Full" : "Book"}
                  </a>
                );
              })}
            </>
          ))}
        </div>
      </div>

      <a href={GHARPAYY_BOOK_URL} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center px-4 py-2.5 rounded-full text-xs font-semibold border-2 border-border hover:border-primary/40">
        Other times → Open calendar
      </a>
    </section>
  );
}
