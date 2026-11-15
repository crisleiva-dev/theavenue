// Shared, framework-agnostic types (safe to import from both client and server).

import type { WeatherIconName } from "./weather";

export interface Train {
  time: string; // effective departure HH:mm (live if available, else scheduled)
  scheduledTime: string; // original timetabled departure HH:mm (what we display)
  scheduledMs: number; // scheduled departure as absolute epoch ms (for client countdown)
  minsAway: number;
  platform: string;
  isLive: boolean;
  destination: string;
  via: string | null; // "Flinders Street" when the trip runs through the city, else null
  tripId: string;
  delaySec: number; // raw delay from the realtime feed (seconds)
  delayMin: number; // live − scheduled, in minutes
}

// /api/trains response. `nowMs` is the server's clock at the moment the
// response was built — the client uses it to correct for device clock drift
// rather than trusting the Fire TV Stick's own time.
export interface TrainsResponse {
  nowMs: number;
  trains: Train[];
}

export interface ForecastTile {
  day: string;
  icon: WeatherIconName;
  desc: string;
  max: string;
  min: string;
  rain: number;
}

export interface WeatherVM {
  temp: string;
  icon: WeatherIconName;
  desc: string;
  max: string;
  min: string;
  feelsLike: string;
  humidity: string;
  windSpeed: string; // "14"
  windDir: string; // "S"
  uv: string;
  uvLevel: string; // WHO category, e.g. "High"
  updated: string;
  forecast: ForecastTile[];
}
