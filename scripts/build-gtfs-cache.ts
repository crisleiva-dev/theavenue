/**
 * Node/TS port of build_gtfs_cache.py.
 * Builds web/data/gtfs_cache.json from the static GTFS Schedule (metro trains).
 *
 *   npm run build:cache
 *
 * Produces:
 *   - trip_headsigns:       { trip_id: "Flinders Street" | ... }
 *   - stop_names:           { stop_id: "Balaclava Station" | ... }
 *   - balaclava_departures: [ { time, tripId, headsign, serviceId } ] (city-bound, sorted by time)
 *   - active_dates:         { serviceId: ["YYYY-MM-DD", ...] } (next 14 days)
 */
import fs from "node:fs";
import path from "node:path";
import { unzipSync } from "fflate";
import { parse } from "csv-parse/sync";
import { DateTime } from "luxon";

const GTFS_URL =
  "https://opendata.transport.vic.gov.au/dataset/" +
  "3f4e292e-7f8a-4ffe-831f-1953be0fe448/resource/" +
  "fb152201-859f-4882-9206-b768060b50ad/download/gtfs.zip";

const BALACLAVA_STOP = "14288";
const LOOKAHEAD_DAYS = 14;
const ZONE = "Australia/Melbourne";
const CITY_HEADSIGNS = new Set([
  "Flinders Street",
  "Southern Cross",
  "Parliament",
  "Melbourne Central",
  "Flagstaff",
]);

const OUT_PATH = path.join(process.cwd(), "data", "gtfs_cache.json");

type Row = Record<string, string>;

function decode(u8: Uint8Array): string {
  return new TextDecoder("utf-8").decode(u8);
}

function parseCsv(u8: Uint8Array): Row[] {
  return parse(decode(u8), {
    columns: true,
    bom: true,
    skip_empty_lines: true,
    relax_column_count: true,
  }) as Row[];
}

interface ServicePattern {
  days: boolean[]; // [mon..sun]
  start: string; // YYYYMMDD
  end: string; // YYYYMMDD
  extra: Set<string>;
  except: Set<string>;
}

async function main() {
  console.log("Downloading GTFS Schedule (~200 MB)…");
  const resp = await fetch(GTFS_URL, {
    headers: { "User-Agent": "curl/8.7.1" },
  });
  if (!resp.ok) throw new Error(`Download failed: HTTP ${resp.status}`);
  const outerBytes = new Uint8Array(await resp.arrayBuffer());

  console.log("Extracting metro train data…");
  const outer = unzipSync(outerBytes, {
    filter: (f) => f.name === "2/google_transit.zip",
  });
  const innerBytes = outer["2/google_transit.zip"];
  if (!innerBytes) throw new Error("inner 2/google_transit.zip not found");

  const wanted = new Set([
    "trips.txt",
    "stops.txt",
    "stop_times.txt",
    "calendar.txt",
    "calendar_dates.txt",
  ]);
  const inner = unzipSync(innerBytes, { filter: (f) => wanted.has(f.name) });

  // trips.txt
  const tripHeadsigns: Record<string, string> = {};
  const tripService: Record<string, string> = {};
  for (const row of parseCsv(inner["trips.txt"])) {
    const tid = row.trip_id;
    tripHeadsigns[tid] = row.trip_headsign;
    tripService[tid] = row.service_id;
  }

  // stops.txt
  const stopNames: Record<string, string> = {};
  for (const row of parseCsv(inner["stops.txt"])) {
    stopNames[row.stop_id] = row.stop_name;
  }

  // stop_times.txt — only Balaclava rows
  console.log(`Scanning stop_times for stop ${BALACLAVA_STOP}…`);
  const balRows: { tripId: string; dep: string }[] = [];
  for (const row of parseCsv(inner["stop_times.txt"])) {
    if (row.stop_id !== BALACLAVA_STOP) continue;
    balRows.push({ tripId: row.trip_id, dep: row.departure_time });
  }

  // calendar.txt + calendar_dates.txt
  console.log("Building service-day index…");
  const DOW = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];
  const servicePattern: Record<string, ServicePattern> = {};
  if (inner["calendar.txt"]) {
    for (const row of parseCsv(inner["calendar.txt"])) {
      servicePattern[row.service_id] = {
        days: DOW.map((d) => row[d] === "1"),
        start: row.start_date,
        end: row.end_date,
        extra: new Set(),
        except: new Set(),
      };
    }
  }
  if (inner["calendar_dates.txt"]) {
    for (const row of parseCsv(inner["calendar_dates.txt"])) {
      const sid = row.service_id;
      if (!servicePattern[sid]) {
        servicePattern[sid] = {
          days: [false, false, false, false, false, false, false],
          start: "99999999",
          end: "00000000",
          extra: new Set(),
          except: new Set(),
        };
      }
      if (row.exception_type === "1") servicePattern[sid].extra.add(row.date);
      else if (row.exception_type === "2")
        servicePattern[sid].except.add(row.date);
    }
  }

  // active_dates over the next 14 days
  const today = DateTime.now().setZone(ZONE).startOf("day");
  const activeDates: Record<string, string[]> = {};
  for (const [sid, pat] of Object.entries(servicePattern)) {
    for (let offset = 0; offset < LOOKAHEAD_DAYS; offset++) {
      const day = today.plus({ days: offset });
      const ymd = day.toFormat("yyyyMMdd");
      let runs =
        pat.days[day.weekday - 1] && pat.start <= ymd && ymd <= pat.end;
      if (pat.extra.has(ymd)) runs = true;
      if (pat.except.has(ymd)) runs = false;
      if (runs) {
        (activeDates[sid] ??= []).push(day.toFormat("yyyy-MM-dd"));
      }
    }
  }

  // city-bound Balaclava departures only
  const balaclavaDepartures = balRows
    .filter((r) => CITY_HEADSIGNS.has(tripHeadsigns[r.tripId]))
    .map((r) => ({
      time: r.dep.slice(0, 5),
      tripId: r.tripId,
      headsign: tripHeadsigns[r.tripId],
      serviceId: tripService[r.tripId] ?? "",
    }))
    .sort((a, b) => (a.time < b.time ? -1 : a.time > b.time ? 1 : 0));

  console.log(`  ${Object.keys(tripHeadsigns).length} trips`);
  console.log(`  ${Object.keys(stopNames).length} stops`);
  console.log(`  ${balaclavaDepartures.length} Balaclava city-bound departures`);
  console.log(
    `  ${Object.keys(activeDates).length} active service IDs (next ${LOOKAHEAD_DAYS} days)`,
  );

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(
    OUT_PATH,
    JSON.stringify({
      trip_headsigns: tripHeadsigns,
      stop_names: stopNames,
      balaclava_departures: balaclavaDepartures,
      active_dates: activeDates,
      built_for_date: today.toFormat("yyyy-MM-dd"),
    }),
  );

  const sizeMb = fs.statSync(OUT_PATH).size / 1024 / 1024;
  console.log(`\n✓ Wrote ${OUT_PATH}  (${sizeMb.toFixed(1)} MB)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
