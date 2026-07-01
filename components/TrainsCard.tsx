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
      const mins = Math.max(0, Math.round((t.scheduledMs - nowMs) / 60000));
      return (
        <div
          key={t.tripId || i}
          className="bg-tile rounded-[16px] px-7 py-6 flex items-center justify-between gap-4 border-l-[12px] border-l-accent"
        >
          <div className="min-w-0 flex flex-col gap-[5px]">
            <div className="text-[1.4rem] font-bold leading-[1.15] text-ink whitespace-nowrap">
              To {t.destination ?? "Flinders Street Station"}
            </div>
            <div className="text-[1.4rem] font-bold leading-[1.15] text-ink">
              Scheduled {to12hr(t.scheduledTime)}
            </div>
            <div className="text-[1rem] text-muted mt-[2px]">
              Platform {t.platform}
            </div>
          </div>
          <span
            className={`shrink-0 px-[24px] py-[12px] rounded-[38px] text-[1.35rem] font-bold whitespace-nowrap ${badgeClasses(
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
    <div className="bg-surface border border-line rounded-card p-[32px_34px] flex flex-col gap-6 min-h-0 overflow-hidden">
      <div className="shrink-0">
        <div className="flex items-center gap-[10px] mb-2">
          <span className="text-[0.9rem] uppercase tracking-[0.12em] text-muted">
            Next Trains
          </span>
          <span className="inline-flex items-center gap-1 bg-[#dcfce7] text-[#116932] text-[0.72rem] font-semibold px-[7px] py-[3px] rounded-[4px] leading-[14px]">
            <span className="w-[6px] h-[6px] bg-[#116932] rounded-full shrink-0" />
            Live
          </span>
        </div>
        <div className="text-[2.2rem] font-bold leading-[1.1] whitespace-nowrap text-ink">
          Balaclava Station
        </div>
        <div className="text-[1.35rem] text-teal mt-2 font-bold">
          Sandringham | Towards city
        </div>
      </div>

      <div className="flex flex-col gap-8 flex-1 min-h-0">{body}</div>
    </div>
  );
}
