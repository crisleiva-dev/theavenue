import type { Train } from "@/lib/types";

function badgeClasses(mins: number): string {
  if (mins <= 2) return "bg-blue text-white border border-transparent";
  if (mins <= 10)
    return "bg-[rgba(251,191,36,0.15)] text-amber border border-[rgba(251,191,36,0.3)]";
  return "bg-tile text-ink border-[1.9px] border-line";
}

function badgeLabel(mins: number): string {
  if (mins === 0) return "NOW";
  if (mins === 1) return "1 min";
  return `${mins} mins`;
}

function to12hr(timeStr: string): string {
  const [h, m] = timeStr.split(":").map(Number);
  const suffix = h < 12 ? "am" : "pm";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, "0")}${suffix}`;
}

export default function TrainsCard({
  trains,
  error,
}: {
  trains: Train[] | null;
  error: boolean;
}) {
  let body: React.ReactNode;
  if (error) {
    body = (
      <div className="text-muted text-base py-4">Departure data unavailable</div>
    );
  } else if (trains == null) {
    body = <div className="text-muted text-base py-4">Loading departures…</div>;
  } else if (trains.length === 0) {
    body = (
      <div className="text-muted text-base py-4">
        No upcoming departures found
      </div>
    );
  } else {
    const nowMs = Date.now();
    body = trains.map((t, i) => {
      // Minutes left = scheduled departure − the currently displayed time.
      // Recomputed on every render (the 1s header clock re-renders this card).
      const mins = Math.max(0, Math.round((t.scheduledMs - nowMs) / 60000));
      return (
        <div
          key={t.tripId || i}
          className={`bg-tile p-[20px_24px] flex items-center gap-[14px] border-l-[14px] border-l-accent flex-1 min-h-0 ${
            i < trains.length - 1 ? "border-b border-b-line" : ""
          }`}
        >
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            <div className="text-[1.6rem] font-bold leading-[1.2] text-ink whitespace-nowrap">
              To {t.destination ?? "Flinders Street Station"}
            </div>
            <div className="text-[1.6rem] font-bold text-ink">
              Scheduled {to12hr(t.scheduledTime)}
            </div>
            <div className="text-[1.25rem] text-ice">Platform {t.platform}</div>
          </div>
          <span
            className={`shrink-0 px-[28px] py-[12px] rounded-[38px] text-[1.7rem] font-bold whitespace-nowrap ${badgeClasses(
              mins,
            )}`}
          >
            {badgeLabel(mins)}
          </span>
        </div>
      );
    });
  }

  return (
    <div className="bg-surface border border-line rounded-card p-[28px_32px] flex flex-col gap-4 min-h-0 overflow-hidden">
      <div className="flex items-start gap-[14px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="w-[50px] h-[50px] shrink-0 mt-[2px]"
          src="/tram.svg"
          alt="Train"
        />
        <div>
          <div className="flex items-center gap-[10px] mb-1">
            <span className="text-[0.69rem] uppercase tracking-[0.12em] text-ice">
              Next Trains
            </span>
            <span className="inline-flex items-center gap-1 bg-[#dcfce7] text-[#116932] text-[0.625rem] font-semibold px-[6px] py-[2px] rounded-[4px] leading-[14px]">
              <span className="w-[6px] h-[6px] bg-[#116932] rounded-full shrink-0" />
              Live
            </span>
          </div>
          <div className="text-[1.5rem] font-bold leading-[1.1] whitespace-nowrap">
            Balaclava Station
          </div>
          <div className="text-[0.85rem] text-muted mt-1 font-medium">
            Sandringham | Towards city
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-0 flex-1 min-h-0 overflow-hidden rounded-xl">
        {body}
      </div>
    </div>
  );
}
