import GtfsRealtimeBindings from "gtfs-realtime-bindings";
import { DateTime } from "luxon";
import { getGtfsCache, type BalaclavaDeparture } from "./gtfsCache";
import type { Train } from "./types";

// Ported from server.py fetch_trains().
// Strategy: walk the static schedule chronologically (source of truth for the
// next 3 trains), then overlay the GTFS-Realtime feed for live times/delays.

const GTFS_URL =
  "https://api.opendata.transport.vic.gov.au" +
  "/opendata/public-transport/gtfs/realtime/v1/metro/trip-updates";

const BALACLAVA_STOP = "14288"; // city-bound (Platform 1)
const ZONE = "Australia/Melbourne"; // explicit — server may run in UTC (e.g. Vercel)
const CACHE_TTL_MS = 30_000; // matches the API cache window

const { transit_realtime } = GtfsRealtimeBindings;
const CANCELED = transit_realtime.TripDescriptor.ScheduleRelationship.CANCELED; // = 3

let _cache: { data: Train[] | null; ts: number } = { data: null, ts: 0 };

// protobuf.js returns Long for int64 fields; normalise to a JS number.
function toNum(v: unknown): number {
  if (v == null) return 0;
  if (typeof v === "number") return v;
  if (typeof (v as { toNumber?: () => number }).toNumber === "function") {
    return (v as { toNumber: () => number }).toNumber();
  }
  return Number(v);
}

// Since the 2026-08 timetable change, city-bound trips run through Flinders
// Street and headsigns name the far terminus ("Laverton via Flinders Street").
// Split the two so the card can show the terminus and the via leg separately,
// the way PTV does. Parsed here rather than in the cache so an existing
// gtfs_cache.json keeps working unchanged.
function parseHeadsign(headsign: string): {
  destination: string;
  via: string | null;
} {
  const m = headsign.match(/^(.*?)\s+via\s+(.*)$/i);
  const terminus = (m ? m[1] : headsign).trim();
  const via = m ? m[2].trim() : null;
  return {
    destination: terminus.includes("Station") ? terminus : `${terminus} Station`,
    via,
  };
}

interface RealtimeEntry {
  depUtc: DateTime;
  delaySec: number;
  cancelled: boolean;
}

// Live delays/cancellations from Transport Victoria. Best-effort by design:
// this is an *enhancement* over the static timetable, so every failure path
// resolves to an empty overlay rather than throwing. Previously a slow or
// erroring upstream aborted fetchTrains() entirely and the card rendered "No
// upcoming departures found" even though the local timetable was fine.
async function fetchRealtime(): Promise<Record<string, RealtimeEntry>> {
  const out: Record<string, RealtimeEntry> = {};
  try {
    const apiKey = process.env.GTFS_API_KEY;
    if (!apiKey) throw new Error("GTFS_API_KEY is not set");

    // Timeout: fail fast if GTFS takes > 4s (TV browser refresh safety margin).
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    let resp: Response;
    try {
      resp = await fetch(GTFS_URL, {
        headers: { KeyId: apiKey, Accept: "*/*", "User-Agent": "curl/8.7.1" },
        cache: "no-store",
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }
    if (!resp.ok) throw new Error(`GTFS-RT HTTP ${resp.status}`);
    const buf = new Uint8Array(await resp.arrayBuffer());
    const feed = transit_realtime.FeedMessage.decode(buf);

    for (const entity of feed.entity) {
      const tu = entity.tripUpdate;
      if (!tu) continue;
      const stus = tu.stopTimeUpdate ?? [];
      const idx = stus.findIndex((s) => s.stopId === BALACLAVA_STOP);
      if (idx < 0) continue;
      const stu = stus[idx];
      const depTs = toNum(stu.departure?.time) || toNum(stu.arrival?.time);
      if (!depTs) continue;
      const tripId = tu.trip?.tripId ?? "";
      out[tripId] = {
        depUtc: DateTime.fromSeconds(depTs, { zone: ZONE }),
        delaySec:
          stu.departure?.delay != null ? toNum(stu.departure.delay) : 0,
        cancelled: tu.trip?.scheduleRelationship === CANCELED,
      };
    }
  } catch (err) {
    // Degrade to scheduled-only times; the card still shows the next 3 trains.
    console.error("GTFS-RT overlay unavailable, using scheduled times:", err);
  }
  return out;
}

export async function fetchTrains(): Promise<Train[]> {
  try {
    const nowMs = Date.now();
    if (_cache.data && nowMs - _cache.ts < CACHE_TTL_MS) return _cache.data;

    // 1. Live overlay (never throws — may be empty).
    const realtimeByTrip = await fetchRealtime();

    // 2. Walk the static schedule chronologically (today + tomorrow rollover).
    const { balaclava_departures, active_dates } = getGtfsCache();
    const localNow = DateTime.now().setZone(ZONE);
    const nowHHMM = localNow.toFormat("HH:mm");
    const todayIso = localNow.toFormat("yyyy-MM-dd");
    const tomorrowIso = localNow.plus({ days: 1 }).toFormat("yyyy-MM-dd");

    const candidates: { day: string; t: string; entry: BalaclavaDeparture }[] = [];
    for (const entry of balaclava_departures) {
      const days = active_dates[entry.serviceId] ?? [];
      const t = entry.time;
      if (days.includes(todayIso) && t >= nowHHMM)
        candidates.push({ day: todayIso, t, entry });
      if (days.includes(tomorrowIso))
        candidates.push({ day: tomorrowIso, t, entry });
    }
    candidates.sort((a, b) =>
      a.day !== b.day ? (a.day < b.day ? -1 : 1) : a.t < b.t ? -1 : a.t > b.t ? 1 : 0,
    );

    const results: Train[] = [];
    for (const { day, t, entry } of candidates) {
      if (results.length >= 3) break;

      // Build scheduled departure additively so GTFS "24:xx"/"25:xx" times roll over.
      const [hh, mm] = t.split(":").map(Number);
      const scheduledDep = DateTime.fromISO(`${day}T00:00:00`, {
        zone: ZONE,
      }).plus({ hours: hh, minutes: mm });
      if (scheduledDep < localNow.minus({ minutes: 1 })) continue; // clearly past

      const rt = realtimeByTrip[entry.tripId];
      if (rt && rt.cancelled) continue;
      const actualDep = rt ? rt.depUtc.setZone(ZONE) : scheduledDep;

      let mins = Math.round(actualDep.diff(localNow, "minutes").minutes);
      if (mins < -1) continue;
      mins = Math.max(0, mins);

      // Delay derived from the times we actually display, so the label can't
      // contradict the "scheduled → live" pair shown on the card.
      const delayMin = rt
        ? Math.round(actualDep.diff(scheduledDep, "minutes").minutes)
        : 0;

      const { destination, via } = parseHeadsign(entry.headsign);
      results.push({
        time: actualDep.toFormat("HH:mm"),
        scheduledTime: scheduledDep.toFormat("HH:mm"),
        scheduledMs: scheduledDep.toMillis(),
        minsAway: mins,
        platform: "1",
        isLive: rt != null,
        destination,
        via,
        tripId: entry.tripId,
        delaySec: rt ? rt.delaySec : 0,
        delayMin,
      });
    }

    _cache = { data: results, ts: nowMs };
    return results;
  } catch (err) {
    // On any error (timeout, network, parsing), return cached data if available,
    // otherwise empty array. This prevents the TV page from going blank on
    // transient upstream failures.
    console.error("fetchTrains error:", err);
    return _cache.data || [];
  }
}
