import type { WeatherVM } from "@/lib/types";

function Stat({
  label,
  value,
  wind = false,
}: {
  label: string;
  value: string;
  wind?: boolean;
}) {
  return (
    <div className="bg-tile rounded-xl p-[18px_20px] h-[122px] flex flex-col justify-between">
      <div className="text-[0.75rem] uppercase tracking-[0.1em] text-ice">
        {label}
      </div>
      <div
        className={`${wind ? "text-[1.9rem]" : "text-[3.25rem]"} font-medium tabular-nums leading-none`}
      >
        {value}
      </div>
    </div>
  );
}

export default function WeatherCard({
  weather: w,
  error,
}: {
  weather: WeatherVM | null;
  error: boolean;
}) {
  const desc = error && !w ? "Unavailable" : w?.desc ?? "Loading…";

  return (
    <div className="bg-surface border border-line rounded-card p-[32px_38px] flex flex-col gap-6 min-h-0 overflow-hidden">
      {/* Hero group: label, giant temp + icon, condition + max/min */}
      <div className="flex flex-col gap-5 shrink-0">
        <div className="text-[0.9rem] uppercase tracking-[0.12em] text-muted">
          Currently
        </div>
        <div className="flex items-center gap-14">
          <div className="text-[12rem] font-thin leading-none tabular-nums">
            {w?.temp ?? "--°"}
          </div>
          <div className="text-[11rem] leading-none">{w?.icon ?? "🌡️"}</div>
        </div>
        <div className="flex items-baseline gap-12">
          <div className="text-[2.75rem] font-normal leading-none">{desc}</div>
          <div className="flex items-baseline gap-3">
            <span className="text-[1.05rem] uppercase tracking-[0.1em] text-muted">
              Max
            </span>
            <span className="text-[2.5rem] font-semibold tabular-nums text-ice leading-none">
              {w?.max ?? "--°"}
            </span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="text-[1.05rem] uppercase tracking-[0.1em] text-muted">
              Min
            </span>
            <span className="text-[2.5rem] font-semibold tabular-nums text-ice leading-none">
              {w?.min ?? "--°"}
            </span>
          </div>
        </div>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-4 gap-[14px] shrink-0">
        <Stat label="Feels Like" value={w?.feelsLike ?? "--°"} />
        <Stat label="Humidity" value={w?.humidity ?? "--%"} />
        <Stat label="Wind" value={w?.wind ?? "--"} wind />
        <Stat label="UV Index" value={w?.uv ?? "--"} />
      </div>

      {/* Forecast — fills remaining height */}
      <div className="grid grid-cols-3 gap-[14px] flex-1 min-h-0">
        {(w?.forecast ?? []).map((f, i) => (
          <div
            key={i}
            className="bg-tile rounded-[16px] p-[20px_24px] flex flex-col h-full overflow-hidden"
          >
            <div className="text-[0.95rem] font-bold uppercase tracking-[0.08em] text-muted">
              {f.day}
            </div>
            <div className="text-[4.5rem] leading-none mt-2">{f.icon}</div>
            <div className="text-[1.4rem] text-muted mt-3">{f.desc}</div>
            <div className="mt-auto flex flex-col gap-2.5">
              <div className="text-[1.05rem] text-teal">💧 {f.rain}%</div>
              <div className="flex items-baseline gap-3">
                <span className="text-[1.6rem] font-bold tabular-nums text-ice">
                  Max {f.max}
                </span>
                <span className="text-[1.6rem] font-medium tabular-nums text-ice">
                  Min {f.min}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
