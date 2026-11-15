import type { Train } from "@/lib/types";

// Countdown colour keeps its existing meaning for residents:
// due within 2 min = the accent, within 10 min = amber (leave now), else quiet.
function countdownClasses(mins: number): string {
  if (mins <= 2) return "bg-accent text-on-accent";
  if (mins <= 10)
    return "bg-tile text-amber shadow-[inset_0_0_0_1px_rgba(240,180,76,0.35)]";
  return "bg-tile text-ink";
}

function countdownLabel(mins: number): string {
  if (mins === 0) return "Now";
  return `${mins} min`;
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
  nowMs,
}: {
  trains: Train[] | null;
  error: boolean;
  // Server-anchored clock supplied by Dashboard, so countdowns survive a
  // drifted device clock. 0 until the first tick has run.
  nowMs: number;
}) {
  let body: React.ReactNode;
  if (error) {
    body = (
      <div className="text-soft text-[1.25rem] py-6">
        Departure data unavailable
      </div>
    );
    // Guard on Array rather than null: if the API shape ever drifts again, show
    // the loading state instead of crashing the card on .map().
  } else if (!Array.isArray(trains) || nowMs === 0) {
    body = (
      <div className="text-soft text-[1.25rem] py-6">Loading departures…</div>
    );
  } else if (trains.length === 0) {
    body = (
      <div className="text-soft text-[1.25rem] py-6">
        No upcoming departures found
      </div>
    );
  } else {
    body = trains.map((t, i) => {
      // Minutes left = scheduled departure − the server-anchored clock.
      const mins = Math.max(0, Math.round((t.scheduledMs - nowMs) / 60000));
      return (
        <div
          key={t.tripId || i}
          className="flex items-center justify-between gap-6 py-6 border-b border-line last:border-b-0"
        >
          <div className="min-w-0 flex items-stretch gap-4">
            {/* Signature: one rule marks the next departure, like a platform board */}
            <span
              className={`w-1 rounded-full shrink-0 ${i === 0 ? "bg-accent" : "bg-transparent"}`}
            />
            <div className="min-w-0 flex flex-col gap-3">
              <div className="text-[2.5rem] font-medium leading-none tabular-nums text-ink">
                {to12hr(t.scheduledTime)}
              </div>
              <div className="text-[1.375rem] leading-none text-soft truncate">
                {t.destination ?? "Flinders Street Station"}
              </div>
              <div className="text-[1.125rem] leading-none text-muted truncate">
                Platform {t.platform}
                {t.via ? ` · via ${t.via}` : ""}
              </div>
            </div>
          </div>
          <span
            className={`shrink-0 min-w-32 text-center px-5 py-3 rounded-xl text-[1.75rem] font-medium leading-none tabular-nums ${countdownClasses(
              mins,
            )}`}
          >
            {countdownLabel(mins)}
          </span>
        </div>
      );
    });
  }

  return (
    <div className="bg-surface border border-line rounded-card p-8 flex flex-col gap-6 min-h-0 overflow-hidden">
      <div className="shrink-0 flex flex-col gap-4">
        <div className="flex items-center gap-3 text-[1.125rem] leading-none">
          <span className="text-soft">Next trains</span>
          <span className="flex items-center gap-2 text-muted">
            <span className="w-2 h-2 rounded-full bg-green shrink-0" />
            Live
          </span>
        </div>
        <div className="text-[2.25rem] font-medium leading-none whitespace-nowrap text-ink">
          Balaclava Station
        </div>
        <div className="text-[1.375rem] leading-none text-soft">
          Sandringham line · Towards city
        </div>
      </div>

      <div className="flex flex-col flex-1 min-h-0">{body}</div>
    </div>
  );
}
