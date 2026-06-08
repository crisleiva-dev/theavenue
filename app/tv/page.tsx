// TV-friendly "lite" dashboard — optimized for basic Android WebView browsers.
//
// Hard constraints (Philips signage built-in browser is basic Android WebView):
//   - MINIMAL JavaScript (just clock; everything else server-rendered)
//   - Meta-refresh every 60s to clear WebView state (prevents memory issues)
//   - ISR caching for instant server responses
//   - HTML tables for layout (no CSS Grid)
//   - No emoji (no emoji font support)
//   - Inline styles only

import { DateTime } from "luxon";
import { fetchTrains } from "@/lib/trains";
import {
  WEATHER_URL,
  WMO,
  compassDir,
  forecastDayLabel,
  type OpenMeteoResponse,
} from "@/lib/weather";
import type { Train } from "@/lib/types";

// ISR: regenerate at most every 60s; aligned with meta-refresh.
// Most requests are served instantly from edge cache.
export const revalidate = 60;
export const runtime = "nodejs";

const ZONE = "Australia/Melbourne";

// Static fallback data — used if APIs fail/timeout. Page never shows blank.
const FALLBACK_TRAINS: Train[] = [];
const FALLBACK_WEATHER: OpenMeteoResponse = {
  current: {
    temperature_2m: 0,
    apparent_temperature: 0,
    relative_humidity_2m: 0,
    wind_speed_10m: 0,
    wind_direction_10m: 0,
    uv_index: 0,
    weather_code: 0,
  },
  daily: {
    time: ["", "", "", ""],
    temperature_2m_max: [0, 0, 0, 0],
    temperature_2m_min: [0, 0, 0, 0],
    weather_code: [0, 0, 0, 0],
    precipitation_probability_max: [0, 0, 0, 0],
  },
};

// Fetch with 3s timeout — race fetch against timer, fail fast.
async function fetchWithTimeout(url: string, ms = 3000): Promise<Response | null> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), ms);
  try {
    const r = await fetch(url, { signal: controller.signal, cache: "no-store" });
    clearTimeout(t);
    return r;
  } catch {
    clearTimeout(t);
    return null;
  }
}

async function getWeather(): Promise<OpenMeteoResponse | null> {
  try {
    const r = await fetchWithTimeout(WEATHER_URL, 3000);
    if (!r || !r.ok) return null;
    return (await r.json()) as OpenMeteoResponse;
  } catch {
    return null;
  }
}

async function getTrains(): Promise<Train[]> {
  try {
    return await Promise.race([
      fetchTrains(),
      new Promise<Train[]>((resolve) => setTimeout(() => resolve([]), 4000)),
    ]);
  } catch {
    return FALLBACK_TRAINS;
  }
}

function to12hr(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h < 12 ? "am" : "pm";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(m).padStart(2, "0")}${suffix}`;
}

function badgeStyle(mins: number) {
  if (mins <= 2)
    return {
      background: "#1e3a5f",
      color: "#5B9CF6",
      border: "1px solid #5B9CF6",
    };
  if (mins <= 10)
    return {
      background: "#3a2d10",
      color: "#FBBF24",
      border: "1px solid #FBBF24",
    };
  return { background: "#1f2433", color: "#EEF2FF", border: "1px solid #2a3046" };
}

function minsLabel(mins: number): string {
  if (mins === 0) return "Arriving";
  if (mins === 1) return "1 min";
  return `${mins} mins`;
}

const COLORS = {
  bg: "#0C111D",
  surface: "#141927",
  tile: "#1a1f2e",
  border: "#1f2433",
  ink: "#EEF2FF",
  ice: "#ecfeff",
  muted: "#64748B",
  accent: "#06b6d4",
};

const FONT = "Arial, Helvetica, sans-serif";

export default async function TvPage() {
  const now = DateTime.now().setZone(ZONE);
  const nowMs = Date.now();

  // Fetch both in parallel with timeouts (4s each, but parallel so total ~4s max)
  const [trains, weather] = await Promise.all([getTrains(), getWeather()]);

  const c = weather?.current ?? FALLBACK_WEATHER.current;
  const day = weather?.daily ?? FALLBACK_WEATHER.daily;
  const hasWeather = weather !== null;
  const wdesc = hasWeather ? WMO[c.weather_code]?.[1] ?? "Unknown" : "Offline";

  return (
    <html>
      <head>
        <title>The Avenue Residence Portal</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Use the bare-number meta-refresh form — more compatible with old
            Android WebView than the "url=" form which sometimes breaks. */}
        <meta httpEquiv="refresh" content="60" />
      </head>
      <body
        style={{
          width: "100%",
          maxWidth: "1920px",
          minHeight: "100vh",
          background: COLORS.bg,
          color: COLORS.ink,
          fontFamily: FONT,
          padding: "24px 48px 20px 48px",
          margin: "0 auto",
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        {/* HEADER */}
        <table
          width="100%"
          cellPadding={0}
          cellSpacing={0}
          style={{
            borderCollapse: "collapse",
            borderBottom: `1px solid ${COLORS.border}`,
            paddingBottom: 22,
            marginBottom: 16,
          }}
        >
          <tbody>
            <tr>
              <td style={{ verticalAlign: "bottom" }}>
                <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>
                  The Avenue Residence Portal
                </div>
                <div style={{ fontSize: 16, color: COLORS.muted, marginTop: 6 }}>
                  Melbourne, Victoria
                </div>
              </td>
              <td style={{ textAlign: "right", verticalAlign: "bottom" }}>
                <div style={{ fontSize: 68, fontWeight: 300, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                  {now.toFormat("HH:mm")}
                </div>
                <div style={{ fontSize: 20, color: COLORS.ice, marginTop: 6 }}>
                  {now.toFormat("cccc d LLLL yyyy")}
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* MAIN — weather (62%) + trains (38%) */}
        <table
          width="100%"
          cellPadding={0}
          cellSpacing={0}
          style={{ borderCollapse: "separate", borderSpacing: 16, marginBottom: 8 }}
        >
          <tbody>
            <tr>
              {/* WEATHER CARD */}
              <td
                style={{
                  width: "62%",
                  background: COLORS.surface,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 20,
                  padding: "28px 32px",
                  verticalAlign: "top",
                }}
              >
                <div style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: 2, color: COLORS.muted }}>
                  Currently
                </div>

                <table cellPadding={0} cellSpacing={0} style={{ marginTop: 14 }}>
                  <tbody>
                    <tr>
                      <td style={{ fontSize: 200, fontWeight: 200, lineHeight: 0.9, whiteSpace: "nowrap", paddingRight: 40 }}>
                        {hasWeather ? `${Math.round(c.temperature_2m)}°` : "--°"}
                      </td>
                      <td style={{ verticalAlign: "top", paddingTop: 22 }}>
                        <div style={{ fontSize: 56, fontWeight: 400 }}>{wdesc}</div>
                        <div style={{ marginTop: 26 }}>
                          <div style={{ display: "inline-block", marginRight: 50 }}>
                            <div style={{ fontSize: 14, color: COLORS.muted, letterSpacing: 1.5 }}>MAX</div>
                            <div style={{ fontSize: 44, color: COLORS.ice, fontWeight: 700, marginTop: 4 }}>
                              {hasWeather ? `${Math.round(day.temperature_2m_max[0])}°` : "--°"}
                            </div>
                          </div>
                          <div style={{ display: "inline-block" }}>
                            <div style={{ fontSize: 14, color: COLORS.muted, letterSpacing: 1.5 }}>MIN</div>
                            <div style={{ fontSize: 44, color: COLORS.ice, fontWeight: 700, marginTop: 4 }}>
                              {hasWeather ? `${Math.round(day.temperature_2m_min[0])}°` : "--°"}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Stats row */}
                <table width="100%" cellPadding={0} cellSpacing={10} style={{ marginTop: 28 }}>
                  <tbody>
                    <tr>
                      {[
                        { label: "Feels Like", val: hasWeather ? `${Math.round(c.apparent_temperature)}°` : "--°", big: true },
                        { label: "Humidity", val: hasWeather ? `${c.relative_humidity_2m}%` : "--%", big: true },
                        { label: "Wind", val: hasWeather ? `${Math.round(c.wind_speed_10m)} km/h ${compassDir(c.wind_direction_10m ?? 0)}` : "--", big: false },
                        { label: "UV Index", val: hasWeather ? `${Math.round(c.uv_index ?? 0)}` : "--", big: true },
                      ].map((s, i) => (
                        <td
                          key={i}
                          style={{
                            width: "25%",
                            background: COLORS.tile,
                            borderRadius: 12,
                            padding: "16px 18px",
                            verticalAlign: "top",
                          }}
                        >
                          <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 1.5, color: COLORS.ice }}>
                            {s.label}
                          </div>
                          <div style={{ fontSize: s.big ? 38 : 26, fontWeight: 500, marginTop: 10, lineHeight: 1 }}>
                            {s.val}
                          </div>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>

                {/* Forecast row */}
                <table width="100%" cellPadding={0} cellSpacing={10} style={{ marginTop: 16 }}>
                  <tbody>
                    <tr>
                      {[1, 2, 3].map((i) => {
                        const fd = hasWeather ? WMO[day.weather_code[i]]?.[1] ?? "—" : "—";
                        const rain = day?.precipitation_probability_max?.[i] ?? 0;
                        return (
                          <td
                            key={i}
                            style={{
                              width: "33%",
                              background: COLORS.tile,
                              borderRadius: 14,
                              padding: "14px 18px",
                              verticalAlign: "top",
                            }}
                          >
                            <div style={{ fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, color: COLORS.muted }}>
                              {hasWeather ? forecastDayLabel(day.time[i], i) : "—"}
                            </div>
                            <div style={{ fontSize: 14, color: COLORS.muted, marginTop: 8 }}>{fd}</div>
                            <div style={{ marginTop: 8 }}>
                              <span style={{ color: COLORS.ice, fontSize: 18, fontWeight: 700 }}>
                                Max {hasWeather ? `${Math.round(day.temperature_2m_max[i])}°` : "--°"}
                              </span>
                              <span style={{ width: 14, display: "inline-block" }} />
                              <span style={{ color: COLORS.ice, fontSize: 18, fontWeight: 500 }}>
                                Min {hasWeather ? `${Math.round(day.temperature_2m_min[i])}°` : "--°"}
                              </span>
                              <span style={{ width: 14, display: "inline-block" }} />
                              <span style={{ color: "#22D3EE", fontSize: 14 }}>Rain {rain}%</span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </td>

              {/* TRAINS CARD */}
              <td
                style={{
                  width: "38%",
                  background: COLORS.surface,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 20,
                  padding: "28px 32px",
                  verticalAlign: "top",
                }}
              >
                <div style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: 2, color: COLORS.ice }}>
                  Next Trains
                </div>
                <div style={{ fontSize: 28, fontWeight: 700, marginTop: 6 }}>Balaclava Station</div>
                <div style={{ fontSize: 15, color: COLORS.muted, marginTop: 4 }}>
                  Sandringham → Towards city
                </div>

                <div style={{ marginTop: 22 }}>
                  {trains.length === 0 && (
                    <div style={{ color: COLORS.muted, fontSize: 18 }}>No upcoming departures.</div>
                  )}
                  {trains
                    .filter((t) => t.scheduledMs - nowMs > -60000)
                    .slice(0, 3)
                    .map((t, idx) => {
                      const mins = Math.max(0, Math.round((t.scheduledMs - nowMs) / 60000));
                      const bc = badgeStyle(mins);
                      return (
                        <table
                          key={idx}
                          width="100%"
                          cellPadding={0}
                          cellSpacing={0}
                          style={{
                            background: COLORS.tile,
                            borderLeft: `12px solid ${COLORS.accent}`,
                            borderRadius: "0 10px 10px 0",
                            marginBottom: 14,
                            borderCollapse: "separate",
                          }}
                        >
                          <tbody>
                            <tr>
                              <td style={{ padding: "18px 22px", verticalAlign: "middle" }}>
                                <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2 }}>
                                  To {t.destination ?? "Flinders Street Station"}
                                </div>
                                <div style={{ fontSize: 22, fontWeight: 700, marginTop: 6 }}>
                                  Scheduled {to12hr(t.scheduledTime)}
                                </div>
                                <div style={{ fontSize: 16, color: COLORS.ice, marginTop: 6 }}>
                                  Platform {t.platform}
                                </div>
                              </td>
                              <td style={{ width: 130, textAlign: "center", verticalAlign: "middle", padding: "0 18px 0 0" }}>
                                <span
                                  style={{
                                    display: "inline-block",
                                    padding: "12px 22px",
                                    borderRadius: 28,
                                    fontSize: 22,
                                    fontWeight: 700,
                                    whiteSpace: "nowrap",
                                    background: bc.background,
                                    color: bc.color,
                                    border: bc.border,
                                  }}
                                >
                                  {minsLabel(mins)}
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      );
                    })}
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* NEWS FEED */}
        <table
          width="100%"
          cellPadding={0}
          cellSpacing={0}
          style={{
            background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 20,
            padding: "28px 32px",
            marginBottom: 8,
            borderCollapse: "separate",
          }}
        >
          <tbody>
            <tr>
              <td colSpan={3}>
                <div style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: 2, color: COLORS.muted, marginBottom: 16 }}>
                  News Feed
                </div>
              </td>
            </tr>
            <tr>
              {[
                {
                  title: "LIFT REPAIR WORKS",
                  content:
                    "Residents are advised that the lift is out of service for safety reasons while the Owners Corporation awaits a report from Kone (Fuji). Please use the stairwell.",
                },
                {
                  title: "NEXT HARD RUBBISH COLLECTION",
                  content: "No dates booked",
                },
                {
                  title: "HORIZON CONTACT",
                  content: "Horizon Strata Management Group 03 9687 7788 info@horizonstrata.com.au",
                },
              ].map((news, i) => (
                <td
                  key={i}
                  style={{
                    width: "33%",
                    background: COLORS.tile,
                    borderRadius: 14,
                    padding: 18,
                    verticalAlign: "top",
                    paddingRight: i < 2 ? 10 : 18,
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 1.5,
                      color: COLORS.ice,
                      marginBottom: 10,
                    }}
                  >
                    {news.title}
                  </div>
                  <div style={{ fontSize: 14, color: COLORS.muted, lineHeight: 1.5 }}>{news.content}</div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>

        {/* FOOTER */}
        <table
          width="100%"
          cellPadding={0}
          cellSpacing={0}
          style={{ paddingTop: 14, borderTop: `1px solid ${COLORS.border}` }}
        >
          <tbody>
            <tr>
              <td style={{ fontSize: 13, color: COLORS.muted }}>
                TV mode · Weather: Open-Meteo · Trains: Transport Victoria GTFS Realtime · Auto-refreshes every 60 seconds
              </td>
              <td style={{ fontSize: 13, color: COLORS.muted, textAlign: "right" }}>
                Updated {now.toFormat("h:mma").toLowerCase()}
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}
