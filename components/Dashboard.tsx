"use client";

import { useEffect, useState } from "react";
import Header from "./Header";
import WeatherCard from "./WeatherCard";
import TrainsCard from "./TrainsCard";
import NewsCard from "./NewsCard";
import {
  WEATHER_URL,
  WMO,
  compassDir,
  forecastDayLabel,
  type OpenMeteoResponse,
} from "@/lib/weather";
import type { Train, WeatherVM } from "@/lib/types";

// Flip to true to show the News Feed section on the dashboard.
const NEWS_ENABLED = false;

function nowHM(): string {
  return new Date().toLocaleTimeString("en-AU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Dashboard() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [weather, setWeather] = useState<WeatherVM | null>(null);
  const [weatherError, setWeatherError] = useState(false);
  const [trains, setTrains] = useState<Train[] | null>(null);
  const [trainsError, setTrainsError] = useState(false);
  const [lastRefresh, setLastRefresh] = useState("Initialising…");

  // Clock — every second.
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-AU", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }),
      );
      setDate(
        now.toLocaleDateString("en-AU", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Weather (client-side, 5 min) + trains (proxy, 30 s).
  useEffect(() => {
    let cancelled = false;

    async function fetchWeather() {
      try {
        const r = await fetch(WEATHER_URL);
        if (!r.ok) throw new Error("HTTP " + r.status);
        const d: OpenMeteoResponse = await r.json();
        const c = d.current;
        const day = d.daily;
        const [icon, desc] = WMO[c.weather_code] ?? ["🌡️", "Unknown"];
        const vm: WeatherVM = {
          temp: `${Math.round(c.temperature_2m)}°`,
          icon,
          desc,
          max: `${Math.round(day.temperature_2m_max[0])}°`,
          min: `${Math.round(day.temperature_2m_min[0])}°`,
          feelsLike: `${Math.round(c.apparent_temperature)}°`,
          humidity: `${c.relative_humidity_2m}%`,
          wind: `${Math.round(c.wind_speed_10m)} km/h ${compassDir(c.wind_direction_10m ?? 0)}`,
          uv: `${Math.round(c.uv_index ?? 0)}`,
          updated: nowHM(),
          forecast: [1, 2, 3].map((i) => {
            const [fi, fd] = WMO[day.weather_code[i]] ?? ["🌡️", ""];
            return {
              day: forecastDayLabel(day.time[i], i),
              icon: fi,
              desc: fd,
              max: `${Math.round(day.temperature_2m_max[i])}°`,
              min: `${Math.round(day.temperature_2m_min[i])}°`,
              rain: day.precipitation_probability_max?.[i] ?? 0,
            };
          }),
        };
        if (!cancelled) {
          setWeather(vm);
          setWeatherError(false);
          setLastRefresh(`Last refresh: ${nowHM()}`);
        }
      } catch (e) {
        console.error("Weather fetch failed:", e);
        if (!cancelled) setWeatherError(true);
      }
    }

    async function updateTrains() {
      try {
        const r = await fetch("/api/trains");
        if (!r.ok) throw new Error("Server error " + r.status);
        const data: Train[] = await r.json();
        if (!cancelled) {
          setTrains(data);
          setTrainsError(false);
          setLastRefresh(`Last refresh: ${nowHM()}`);
        }
      } catch (e) {
        console.error("Train fetch failed:", e);
        if (!cancelled) setTrainsError(true);
      }
    }

    fetchWeather();
    updateTrains();
    const tId = setInterval(updateTrains, 30_000);
    const wId = setInterval(fetchWeather, 5 * 60_000);
    return () => {
      cancelled = true;
      clearInterval(tId);
      clearInterval(wId);
    };
  }, []);

  return (
    <div
      className={
        NEWS_ENABLED
          ? "h-screen grid grid-rows-[auto_minmax(0,1.8fr)_minmax(0,1fr)_auto] px-9 pt-5 pb-[18px] gap-4 overflow-hidden"
          : "h-screen grid grid-rows-[auto_1fr_auto] px-9 pt-5 pb-[18px] gap-4 overflow-hidden"
      }
    >
      <Header time={time} date={date} />
      <main className="grid grid-cols-[1151fr_628fr] gap-8 min-h-0">
        <WeatherCard weather={weather} error={weatherError} />
        <TrainsCard trains={trains} error={trainsError} />
      </main>
      {NEWS_ENABLED && <NewsCard />}
      <footer className="flex justify-between items-center pt-[14px] border-t border-line text-[0.78rem] text-muted">
        <div className="flex items-center gap-[10px]">
          <span className="w-2 h-2 bg-green rounded-full shrink-0 animate-blink" />
          Weather: Open-Meteo &nbsp;·&nbsp; Trains: Transport Victoria GTFS
          Realtime
        </div>
        <div>{lastRefresh}</div>
      </footer>
    </div>
  );
}
