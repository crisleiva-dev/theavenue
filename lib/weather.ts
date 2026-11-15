// Open-Meteo weather helpers, originally ported from index.html.
// Weather is fetched client-side (no API key, CORS-friendly).

export const WEATHER_URL =
  "https://api.open-meteo.com/v1/forecast" +
  "?latitude=-37.8136&longitude=144.9631" +
  "&current=temperature_2m,relative_humidity_2m,apparent_temperature," +
  "weather_code,wind_speed_10m,wind_direction_10m,uv_index" +
  "&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max" +
  "&timezone=Australia/Melbourne&forecast_days=4";

// Line-icon names drawn by components/WeatherIcon.tsx.
export type WeatherIconName =
  | "sun"
  | "cloud-sun"
  | "cloud"
  | "fog"
  | "drizzle"
  | "rain"
  | "snow"
  | "snowflake"
  | "storm"
  | "unknown";

// WMO weather code -> [icon, label]
export const WMO: Record<number, [WeatherIconName, string]> = {
  0: ["sun", "Clear sky"],
  1: ["cloud-sun", "Mainly clear"],
  2: ["cloud-sun", "Partly cloudy"],
  3: ["cloud", "Overcast"],
  45: ["fog", "Foggy"],
  48: ["fog", "Icy fog"],
  51: ["drizzle", "Light drizzle"],
  53: ["drizzle", "Drizzle"],
  55: ["drizzle", "Heavy drizzle"],
  61: ["rain", "Light rain"],
  63: ["rain", "Rain"],
  65: ["rain", "Heavy rain"],
  71: ["snow", "Light snow"],
  73: ["snowflake", "Snow"],
  75: ["snowflake", "Heavy snow"],
  77: ["snow", "Snow grains"],
  80: ["drizzle", "Light showers"],
  81: ["rain", "Showers"],
  82: ["storm", "Heavy showers"],
  85: ["snow", "Snow showers"],
  86: ["snow", "Heavy snow showers"],
  95: ["storm", "Thunderstorm"],
  96: ["storm", "Thunderstorm and hail"],
  99: ["storm", "Severe thunderstorm"],
};

export function compassDir(deg: number): string {
  return ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][
    Math.round(deg / 45) % 8
  ];
}

// WHO UV index category.
export function uvLevel(uv: number): string {
  if (uv < 3) return "Low";
  if (uv < 6) return "Moderate";
  if (uv < 8) return "High";
  if (uv < 11) return "Very high";
  return "Extreme";
}

export function forecastDayLabel(dateStr: string, index: number): string {
  if (index === 1) return "Tomorrow";
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-AU", {
    weekday: "long",
  });
}

// Shape of the Open-Meteo response we consume.
export interface OpenMeteoResponse {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    uv_index: number;
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weather_code: number[];
    precipitation_probability_max: number[];
  };
}
