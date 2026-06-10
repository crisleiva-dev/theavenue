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
    <div className="bg-tile rounded-xl p-[13px_16px] h-[90px] flex flex-col justify-between">
      <div className="text-[0.7rem] uppercase tracking-[0.1em] text-ice">
        {label}
      </div>
      <div
        className={`${wind ? "text-[1.6rem]" : "text-[2.5rem]"} font-medium tabular-nums leading-none`}
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
    <div className="bg-surface border border-line rounded-card p-[28px_32px] flex flex-col gap-4 min-h-0 overflow-hidden">
      <div className="flex flex-col flex-1 min-h-0 gap-3">
        <div className="text-[0.85rem] uppercase tracking-[0.12em] text-muted shrink-0">
          Currently
        </div>
        {/* Hero row: temp | icon | desc | max | min — all horizontal */}
        <div className="flex flex-row items-center gap-8 flex-1 min-h-0">
          <div className="text-[clamp(6rem,10vw,12rem)] font-thin leading-none tabular-nums whitespace-nowrap shrink-0">
            {w?.temp ?? "--°"}
          </div>
          <div className="text-[4rem] leading-none shrink-0">
            {w?.icon ?? "🌡️"}
          </div>
          <div className="text-[2.4rem] font-normal leading-tight flex-1 min-w-0">
            {desc}
          </div>
          <div className="flex flex-col items-center gap-1 shrink-0">
            <span className="text-[0.95rem] uppercase tracking-[0.1em] text-muted">
              Max
            </span>
            <span className="text-[2.4rem] font-semibold tabular-nums text-ice leading-none">
              {w?.max ?? "--°"}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1 shrink-0">
            <span className="text-[0.95rem] uppercase tracking-[0.1em] text-muted">
              Min
            </span>
            <span className="text-[2.4rem] font-semibold tabular-nums text-ice leading-none">
              {w?.min ?? "--°"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-[10px] mt-auto">
        <Stat label="Feels Like" value={w?.feelsLike ?? "--°"} />
        <Stat label="Humidity" value={w?.humidity ?? "--%"} />
        <Stat label="Wind" value={w?.wind ?? "--"} wind />
        <Stat label="UV Index" value={w?.uv ?? "--"} />
      </div>

      <div className="grid grid-cols-3 gap-[10px]">
        {(w?.forecast ?? []).map((f, i) => (
          <div
            key={i}
            className="bg-tile rounded-[14px] p-[14px_16px] flex flex-col gap-[5px]"
          >
            <div className="text-[0.82rem] font-bold uppercase tracking-[0.08em] text-muted">
              {f.day}
            </div>
            <div className="text-[1.9rem] leading-none my-[2px]">{f.icon}</div>
            <div className="text-[0.82rem] text-muted">{f.desc}</div>
            <div className="flex items-baseline gap-[10px] mt-1">
              <span className="text-[1.05rem] font-bold tabular-nums text-ice">
                Max {f.max}
              </span>
              <span className="text-[1.05rem] font-medium tabular-nums text-ice">
                Min {f.min}
              </span>
              <span className="text-[0.78rem] text-teal ml-auto">
                💧 {f.rain}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
