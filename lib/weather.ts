// Open-Meteo weather helpers — ported verbatim from the original index.html.
// Weather is fetched client-side (no API key, CORS-friendly).

export const WEATHER_URL =
  "https://api.open-meteo.com/v1/forecast" +
  "?latitude=-37.8136&longitude=144.9631" +
  "&current=temperature_2m,relative_humidity_2m,apparent_temperature," +
  "weather_code,wind_speed_10m,wind_direction_10m,uv_index" +
  "&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max" +
  "&timezone=Australia/Melbourne&forecast_days=4";

// WMO weather code -> [emoji, label]
export const WMO: Record<number, [string, string]> = {
  0: ["☀️", "Clear Sky"],
  1: ["🌤️", "Mainly Clear"],
  2: ["⛅", "Partly Cloudy"],
  3: ["☁️", "Overcast"],
  45: ["🌫️", "Foggy"],
  48: ["🌫️", "Icy Fog"],
  51: ["🌦️", "Light Drizzle"],
  53: ["🌦️", "Drizzle"],
  55: ["🌧️", "Heavy Drizzle"],
  61: ["🌧️", "Light Rain"],
  63: ["🌧️", "Rain"],
  65: ["🌧️", "Heavy Rain"],
  71: ["🌨️", "Light Snow"],
  73: ["❄️", "Snow"],
  75: ["❄️", "Heavy Snow"],
  77: ["🌨️", "Snow Grains"],
  80: ["🌦️", "Light Showers"],
  81: ["🌧️", "Showers"],
  82: ["⛈️", "Heavy Showers"],
  85: ["🌨️", "Snow Showers"],
  86: ["🌨️", "Heavy Snow Showers"],
  95: ["⛈️", "Thunderstorm"],
  96: ["⛈️", "Thunderstorm + Hail"],
  99: ["⛈️", "Severe Thunderstorm"],
};

export function compassDir(deg: number): string {
  return ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][
    Math.round(deg / 45) % 8
  ];
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
