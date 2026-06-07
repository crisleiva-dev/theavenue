// Shared, framework-agnostic types (safe to import from both client and server).

export interface Train {
  time: string; // effective departure HH:mm (live if available, else scheduled)
  scheduledTime: string; // original timetabled departure HH:mm (what we display)
  scheduledMs: number; // scheduled departure as absolute epoch ms (for client countdown)
  minsAway: number;
  platform: string;
  isLive: boolean;
  destination: string;
  tripId: string;
  delaySec: number; // raw delay from the realtime feed (seconds)
  delayMin: number; // live − scheduled, in minutes
}

export interface ForecastTile {
  day: string;
  icon: string;
  desc: string;
  max: string;
  min: string;
  rain: number;
}

export interface WeatherVM {
  temp: string;
  icon: string;
  desc: string;
  max: string;
  min: string;
  feelsLike: string;
  humidity: string;
  wind: string;
  uv: string;
  updated: string;
  forecast: ForecastTile[];
}
