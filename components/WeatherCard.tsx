import type { WeatherVM } from "@/lib/types";
import WeatherIcon from "./WeatherIcon";

function Stat({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <div className="bg-tile rounded-xl p-5 h-32 flex flex-col justify-between">
      <div className="text-[1.125rem] leading-none text-soft">{label}</div>
      <div className="flex items-baseline gap-2 leading-none">
        <span className="text-[3.25rem] font-medium tabular-nums text-ink">
          {value}
        </span>
        {unit ? (
          <span className="text-[1.375rem] text-soft">{unit}</span>
        ) : null}
      </div>
    </div>
  );
}

// "Max 22°  Min 12°": quiet label, figure leads. Used in the hero and forecast.
function Range({
  max,
  min,
  size,
}: {
  max: string;
  min: string;
  size: "lg" | "md";
}) {
  const figure =
    size === "lg" ? "text-[2.5rem]" : "text-[2rem]";
  const label = size === "lg" ? "text-[1.25rem]" : "text-[1.125rem]";
  return (
    <div className="flex items-baseline gap-6 leading-none">
      <div className="flex items-baseline gap-2">
        <span className={`${label} text-muted`}>Max</span>
        <span className={`${figure} font-medium tabular-nums text-ink`}>
          {max}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className={`${label} text-muted`}>Min</span>
        <span className={`${figure} tabular-nums text-soft`}>{min}</span>
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
    <div className="bg-surface border border-line rounded-card p-8 flex flex-col gap-6 min-h-0 overflow-hidden">
      {/* Hero: label, temperature with its glyph, condition and range */}
      <div className="flex flex-col gap-6 shrink-0">
        <div className="text-[1.125rem] leading-none text-soft">Currently</div>
        <div className="flex items-center gap-12">
          <div className="text-[12rem] font-light leading-[0.85] tabular-nums text-ink">
            {w?.temp ?? "--°"}
          </div>
          <WeatherIcon
            name={w?.icon ?? "unknown"}
            size={160}
            strokeWidth={1}
            className="text-soft shrink-0"
          />
        </div>
        <div className="flex items-baseline gap-12">
          <div className="text-[2.75rem] leading-none text-ink">{desc}</div>
          <Range max={w?.max ?? "--°"} min={w?.min ?? "--°"} size="lg" />
        </div>
      </div>

      {/* Conditions */}
      <div className="grid grid-cols-4 gap-4 shrink-0">
        <Stat label="Feels like" value={w?.feelsLike ?? "--°"} />
        <Stat label="Humidity" value={w?.humidity ?? "--%"} />
        <Stat
          label="Wind"
          value={w?.windSpeed ?? "--"}
          unit={w ? `km/h ${w.windDir}` : undefined}
        />
        <Stat label="UV index" value={w?.uv ?? "--"} unit={w?.uvLevel} />
      </div>

      {/* Forecast — fills remaining height */}
      <div className="grid grid-cols-3 gap-4 flex-1 min-h-0">
        {(w?.forecast ?? []).map((f, i) => (
          <div
            key={i}
            className="bg-tile rounded-xl p-6 flex flex-col h-full overflow-hidden"
          >
            <div className="text-[1.25rem] font-medium leading-none text-ink">
              {f.day}
            </div>
            <WeatherIcon
              name={f.icon}
              size={64}
              strokeWidth={1.25}
              className="text-soft mt-5"
            />
            <div className="text-[1.375rem] leading-none text-soft mt-4">
              {f.desc}
            </div>
            <div className="mt-auto flex flex-col gap-4">
              <div className="flex items-center gap-2 text-[1.125rem] leading-none text-muted tabular-nums">
                <WeatherIcon name="droplets" size={20} />
                {f.rain}% chance of rain
              </div>
              <Range max={f.max} min={f.min} size="md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
